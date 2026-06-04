# FASE 27A.2 — Revenue Real Plan

Plano de arquitetura para eliminar os últimos mocks do Revenue Engine, conectando **Revenue → Attribution → Meta CAPI** em pipeline real. **Sem código. Sem migrations.** Somente contrato.

**Bases:** [`REVENUE-REALITY.md`](./REVENUE-REALITY.md), [`META-INTEGRATION-AUDIT.md`](./META-INTEGRATION-AUDIT.md).

**Legenda:** 🟢 já existe · 🟡 estender · 🔴 criar.

---

## 1. Quais tabelas faltam?

A espinha dorsal já existe (`leads`, `lead_attribution`, `events`, `sessions`, `visitor_profiles`). O que falta é **monetização** e **multi-touch opcional**. Inventário mínimo para V1:

| Tabela | Status | O que falta |
|---|---|---|
| `leads` (17 cols) | 🟡 estender | `value numeric`, `currency text default 'BRL'`, `closed_at timestamptz`, `closed_by uuid` (opcional). Sem nova tabela. |
| `lead_attribution` (18 cols) | 🟡 estender (opcional V1) | `touch_type` enum(`first`/`middle`/`last`/`conversion`), `touch_at timestamptz`, `revenue_share numeric`. Necessário só para multi-touch — V1 pode adiar. |
| `events` (11 cols) | 🟢 já existe | Apenas registrar **novo tipo** `lead_converted` (string, não enum). Nenhuma alteração de schema. |
| `conversions` | 🔴 criar (opcional V1) | `id`, `workspace_id`, `lead_id`, `value`, `currency`, `source` (`manual`/`stripe`/`hotmart`/`webhook`), `external_ref`, `meta_event_id`, `dispatched_to jsonb`, `created_at`. Só se houver múltiplas vendas por lead ou auditoria de pagamento externo. **Para V1, omitir** — usa `leads.value` + `events(type='lead_converted')`. |
| `meta_capi_dispatches` | 🔴 criar (opcional V1) | `event_id` (=`events.id`), `pixel_id`, `status` (`ok`/`error`), `response jsonb`, `attempts`, `last_attempt_at`. Necessário só se quisermos retry + observabilidade. **V1 pode logar no ring buffer do `trackingEngine`.** |
| `media_costs` | 🔴 criar (ROADMAP) | Para ROAS real. Fora de V1. |

**Veredito V1:** uma única migration `ALTER TABLE leads ADD COLUMN value/currency/closed_at`. Nada mais é bloqueante.

---

## 2. Onde adicionar `lead.value` e `closed_at`

### 2.1 Domínio (TypeScript)

| Arquivo | Mudança | Por quê |
|---|---|---|
| `src/types/lead.ts` — interface `Lead` | adicionar `value?: number`, `currency?: string`, `closedAt?: string` | Modelo de domínio reflete o schema. |
| `src/types/lead.ts` — `LeadCreateInput` | adicionar `value?`, `currency?` (opcionais) | Permite criar lead já fechado em casos de import. |
| **novo:** `LeadUpdateInput` ou patch no repo | aceitar `value`, `closedAt`, `stage='convertido'` atomicamente | Conversão é mutação coordenada. |

### 2.2 Persistência

| Camada | Mudança |
|---|---|
| `src/domain/repositories.ts` → `LeadRepository` | novo método `convert(id, { value, currency }): Promise<Lead>` |
| `src/domain/mock/leadRepository.ts` | implementar via mutação local |
| `src/domain/persistence/supabase/leadRepository.ts` | chamar RPC `record_conversion` (ver §3) |
| `src/beta/demoPersistence.ts` | implementar in-memory para demo |

### 2.3 Banco

`leads` ganha 3 colunas:

```text
value      numeric              null
currency   text   default 'BRL' null
closed_at  timestamptz          null
```

Sem índice em V1; opcional `CREATE INDEX leads_closed_at_idx ON leads(workspace_id, closed_at) WHERE closed_at IS NOT NULL` se Revenue page ficar lenta.

RLS herda da tabela (já tem 4 policies). GRANTs já existem.

### 2.4 UI

| Tela | Mudança |
|---|---|
| `src/pages/LeadDetail.tsx` | botão **"Marcar fechado + R$"** que abre dialog (input `value`, select `currency`). Submete `leads.convert(id, …)`. |
| `src/pages/Leads.tsx` (Kanban) | ao arrastar para coluna **convertido**, abrir o mesmo dialog. |
| `src/pages/Revenue.tsx` | fora do demo, deixa de mostrar `EmptyState` e passa a agregar `persistence.leads.list({ stage:'convertido' })` via `summarizeAttribution`. |
| `src/pages/Analytics.tsx` | substitui `DEMO_LEAD_VALUES[lead.id] ?? 0` por `lead.value ?? 0`. |

---

## 3. Como implementar `record_conversion()`

### 3.1 Contrato da RPC

```text
record_conversion(
  _lead_id     uuid,
  _value       numeric,
  _currency    text default 'BRL',
  _meta        jsonb default '{}'::jsonb
) returns uuid     -- event_id (usado como dedupe key para Meta CAPI)
```

`SECURITY DEFINER`, `search_path = public`. Verifica `has_workspace_role(ws_id, auth.uid(), ['owner','admin','editor'])`.

### 3.2 Efeitos atômicos (uma transação)

1. **Update `leads`**
   ```text
   set value = _value,
       currency = _currency,
       closed_at = now(),
       stage = 'convertido',
       updated_at = now()
   where id = _lead_id
   ```

2. **Insert `events`**
   ```text
   type = 'lead_converted'
   payload = jsonb_build_object(
     'value', _value,
     'currency', _currency,
     'source', _meta->>'source'
   )
   ```
   `returning id into event_id`.

3. **Late-binding de atribuição** (opcional V1, recomendado):
   - Se `lead_attribution` tiver row com `lead_id = _lead_id` e `touch_type` existir → inserir row `touch_type='conversion'`, `touch_at=now()`, `revenue_share = _value`.
   - V1 simplificado: nenhuma escrita extra; `summarizeAttribution` pega `lead.value` direto.

4. **Retorno:** `event_id` (uuid). O front usa esse id como `event_id` no dispatch Meta CAPI (dedupe Pixel × CAPI).

### 3.3 Side-effect fora da RPC (front)

Após receber `event_id`, o front chama:

```text
trackingEngine.track('Purchase', {
  event_id,                // = events.id (dedupe)
  lead_id,
  value,
  currency,
  fbc, fbp,               // já no visitor.ts (após R3.4)
  user_data: { em_hash, ph_hash }  // ROADMAP
})
```

`destinations/meta.ts` consome via subscribe e POSTa no Graph API. Nada novo na infra de tracking — só **chamar de um lugar real**.

### 3.4 Erros e idempotência

- Idempotência: se `leads.closed_at is not null` e `_meta->>'force' is not 'true'` → `raise exception 'Lead already converted'`. Front trata e oferece "Reabrir".
- Auditoria: `events(type='lead_converted', payload.actor = auth.uid())`.

---

## 4. Como conectar: Revenue → Attribution → Meta CAPI

### 4.1 Diagrama de fluxo

```text
                       ┌─────────────────────────────┐
  UI: LeadDetail       │ "Marcar fechado + R$"        │
       │               │  value=2500, currency=BRL    │
       ▼               └─────────────────────────────┘
  leadRepo.convert(id, {value, currency})
       │
       ▼
  RPC record_conversion(_lead_id, _value, _currency)
   ├─► UPDATE leads SET value, closed_at, stage='convertido'
   ├─► INSERT events(type='lead_converted')  ──► returns event_id
   │
       │  (back to client)
       ▼
  trackingEngine.track('Purchase', { event_id, value, currency, fbc, fbp })
       │
       ├──► destinations/meta.ts (mock=false com creds)
       │      POST graph.facebook.com/v19.0/{pixelId}/events
       │      { event_name: 'Purchase', event_id, user_data, custom_data }
       │
       └──► destinations/google.ts (idem GA4)
       │
       ▼
  Revenue.tsx
   ├─ persistence.leads.list({ stage:'convertido' })
   ├─ rows = leads.map(l => buildAttributionRow({ lead:l, revenue:l.value, convertedAt:l.closedAt }))
   ├─ summary = summarizeAttribution(rows)
   └─ render KPIs + bySource + byCampaign  ← REAL
       │
       ▼
  Attribution.tsx
   ├─ joina leads.value com lead_attribution (utm_source/campaign/fbclid)
   └─ tabela por canal/campanha  ← REAL
```

### 4.2 Pontos de fio em cada camada

| Camada | Arquivo | O que muda |
|---|---|---|
| **Revenue** | `src/pages/Revenue.tsx` | Substitui ramo `!isDemo → EmptyState` por carga real via `persistence.leads`. Mantém demo intacto via `useDemoMode()`. |
| **Attribution** | `src/pages/Attribution.tsx` | Hoje já chama `buildAttributionRow` — passa a receber `revenue = lead.value` em vez de `DEMO_LEAD_VALUES`. |
| **Forecast** | `src/intelligence/forecast.ts` | `ticket` default deixa de ser `2500`: calcula média de `leads.value where stage='convertido'` no workspace. Fallback para `2500` apenas se amostra < 3. |
| **CRM bridge** | `src/lib/crm-bridge.ts` | Após criar lead, **não** chama track('Purchase'). Apenas `Lead` (já chama). `Purchase` só é disparado por `record_conversion` (§3.3). |
| **Visitor** | `src/tracking/visitor.ts` | Adicionar leitura de cookies `_fbc` e `_fbp` (criados pelo Pixel client) e expor em `recordPublicAttribution` + `trackingEngine` context. Pré-requisito para match rate CAPI. |
| **Meta destination** | `src/tracking/destinations/meta.ts` | Nenhuma mudança — já aceita `event_id`, `user_data`, `custom_data`. Só precisa `mock:false` com creds reais. |
| **Credenciais** | `src/components/settings/CredentialsPanel.tsx` | UI já existe. Garantir `pixelId` + `accessToken` + (novo) `test_event_code` opcional. |

### 4.3 Eventos de produto que entram no DB

| Evento | Quando | Payload mínimo |
|---|---|---|
| `lead_captured` (🟢 existe) | flow_completed com nome | — |
| `lead_converted` (🔴 novo) | `record_conversion` | `{ value, currency, source }` |
| `lead_reopened` (⚪ opcional) | undo de conversão | `{ previous_value }` |

Nenhuma alteração de schema em `events` — `type` é `text`.

### 4.4 Dedupe Pixel × CAPI

`event_id = events.id` (uuid). O Pixel client-side, se quiser disparar `Purchase` também no browser, deve usar o **mesmo** `event_id`. Como hoje **não temos Pixel client** no widget (só CAPI server-side), basta enviar `event_id` no CAPI — sem colisão.

### 4.5 Hash de PII (ROADMAP, não bloqueante)

Para subir match rate Meta:
- `em` = sha256(lowercase(email))
- `ph` = sha256(digits-only(phone))
- Gerar **no servidor** (edge function) — nunca no cliente — antes do POST ao Graph API. Move o `metaAdapter` para uma edge function `dispatch-meta-event` em R4.

---

## 5. Sequência mínima para sair do mock (V1)

```text
1. Migration: ALTER TABLE leads ADD value, currency, closed_at
2. RPC: record_conversion()
3. LeadRepository.convert() (mock + supabase + demo)
4. UI: dialog "Marcar fechado + R$" no LeadDetail / Kanban
5. Revenue.tsx → consume real persistence
6. Analytics.tsx → lead.value ?? 0
7. visitor.ts → captura _fbc/_fbp
8. Credenciais Meta reais (CredentialsPanel)
9. trackingEngine.track('Purchase') após record_conversion
```

Passos 1–6 entregam **Revenue real sem CAPI**. Passos 7–9 ligam CAPI sem mais reescritas.

---

## 6. Não-objetivos desta fase

- ❌ Multi-touch attribution (linear / time-decay / U-shaped) — fica para R5.
- ❌ ROAS real / custo de mídia / Ads API — fica para R6.
- ❌ Webhook Stripe/Hotmart → `record_conversion` automático — fica para R7.
- ❌ Tabela `conversions` separada — só se aparecer caso de múltiplas vendas por lead.
- ❌ Edge function `dispatch-meta-event` com hash PII — R4.

V1 é estreito de propósito: **tirar o `DEMO_LEAD_VALUES` da frente** e ligar o `Purchase` real no CAPI.

---

## 7. Riscos e mitigações

| Risco | Mitigação |
|---|---|
| `leads.value` editável por humano → fraude/erro | `record_conversion` checa role; UI valida `> 0` e `< 10M`; trigger de auditoria opcional. |
| Dispatch CAPI falha silenciosamente | Ring buffer do `trackingEngine` já loga; em R4 mover para tabela `meta_capi_dispatches`. |
| Forecast quebra quando amostra < 3 | Fallback hardcoded preservado nesse caso. |
| Revenue real fica em zero (workspace novo) | Manter `EmptyState` quando `leads.list({stage:'convertido'}).length === 0`. |
| Demo continua usando mock | `useDemoMode()` já isola — sem mudança de comportamento. |

---

## 8. Próxima fase sugerida

**R4 — Revenue Real V1 (implementação):** executa exatamente §5 (1–9). É o primeiro phase desta série que **escreve código + migration**.
