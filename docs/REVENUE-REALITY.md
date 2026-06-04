# FASE R3 — Revenue Attribution Reality Audit

Auditoria estática para descobrir se Revenue Attribution pode virar real sem grandes reescritas. Nenhum código alterado.

**Legenda:** 🟢 REAL · 🟡 PARCIAL · 🔴 MOCK · ⚪ ROADMAP

---

## 1. Onde o motor já existe?

| Camada | Arquivo | Status | O que faz |
|---|---|---|---|
| Modelo de atribuição | `src/intelligence/attribution.ts` | 🟢 REAL (puro) | `buildAttributionRow(lead, campaign, revenue, convertedAt)` e `summarizeAttribution(rows)` agregam por `source`/`campaign`. Função pura, sem mock; só depende de `Lead`. |
| Forecast | `src/intelligence/forecast.ts` | 🟡 PARCIAL | `forecastLead` calcula `expectedRevenue = baseProb * ticket`, mas `ticket` default é hardcoded `2500` e `baseProb = score/110`. Não usa histórico real. |
| Captura UTM / click-ids | `src/tracking/visitor.ts` | 🟢 REAL | Lê `utm_source/medium/campaign/content/term` + `fbclid/gclid/ttclid/msclkid` da URL e persiste em `localStorage`. |
| Persistência de atribuição | RPC `record_public_attribution` + tabela `lead_attribution` (18 cols) | 🟢 REAL | Já grava `utm_*`, `fbclid`, `gclid`, `ttclid`, `msclkid`, `referrer`, `landing_page` por `visitor_id`/`session_id`. RPC `attach_public_attribution_to_lead` faz o late-binding `visitor_id → lead_id`. |
| Pipeline público | `src/lib/public-runtime.ts` + RPCs `record_public_session/message/lead/event` | 🟢 REAL | Toda jornada do `/bot/:slug` chega no DB (sessions, messages, leads, events, lead_attribution). |
| Tracking Engine | `src/tracking/engine.ts` + `tracking/destinations/*` | 🟢 REAL | Bus interno + dispatch para Meta CAPI / Google. Eventos `PageView`, `Lead`, `Schedule`, `Purchase`, etc. já mapeados em `tracking/mappings/index.ts`. |
| Meta CAPI adapter | `src/tracking/destinations/meta.ts` | 🟢 REAL (com credenciais) | `POST graph.facebook.com/v19.0/{pixelId}/events` server-side, `access_token` no body, `event_id` para dedupe. |
| Página Attribution | `src/pages/Attribution.tsx` | 🟡 PARCIAL | UI pronta, alimentada por `buildAttributionRow` — funciona se os leads tiverem campos certos. |
| Página Revenue | `src/pages/Revenue.tsx` | 🟡 PARCIAL | Em modo demo lê `DEMO_REVENUE`; fora do demo mostra `EmptyState`. **Não consome `summarizeAttribution`.** |
| Página Analytics | `src/pages/Analytics.tsx` (Fase 26I.1) | 🟡 PARCIAL | KPIs reais sobre `persistence.leads`, mas valor monetário depende de `DEMO_LEAD_VALUES`. |

---

## 2. Onde os dados são mock?

| Local | Tipo | O que tem de fake |
|---|---|---|
| `src/beta/demoDataset.ts` — `DEMO_REVENUE` | 🔴 MOCK | Canais, conversões, ROAS, trend 30d, ticket médio — todos literais. É o que a página `/revenue` mostra hoje. |
| `src/beta/demoDataset.ts` — `DEMO_LEAD_VALUES` | 🔴 MOCK | Mapa `leadId → R$` usado por `/analytics` para preencher receita realizada/forecast. |
| `src/beta/demoDataset.ts` — `DEMO_STAGE_PROBABILITY` | 🔴 MOCK | Probabilidades por estágio (10/40/100%) hardcoded no demo. |
| `forecastLead` default ticket = `2500` | 🔴 MOCK | Constante mágica, ignora histórico de fechamento. |
| `summarizeAttribution(rows)` quando `revenue` ausente | 🟡 PARCIAL | Retorna `revenue: 0` se `lead.value` não vier — o pipeline real nunca preenche `revenue` porque… |
| Tabela `leads` (17 cols) | 🔴 sem campo `value`/`amount` | Não existe coluna monetária. Todo R$ exibido vem do `DEMO_LEAD_VALUES`. |
| `oauth/providers.ts` (Meta) | 🔴 MOCK | Sem token real, então o CAPI adapter fica em `mock: true` por default. |
| `tracking/destinations/google.ts` | 🟡 PARCIAL | Mesma estrutura do Meta; depende de credenciais reais. |
| Conversions outbound (Schedule/Purchase) | ⚪ ROADMAP | Não há `trackingEngine.track("Purchase", { value })` chamado de lugar nenhum no fluxo de fechamento — porque não há fluxo de fechamento. |

---

## 3. O que falta para atribuição real?

Inventário de gaps em ordem de dependência:

### 3.1 Domínio (CRM)
- [ ] Coluna `leads.value numeric` (+ `currency text default 'BRL'`).
- [ ] Coluna `leads.closed_at timestamptz` para datar conversão.
- [ ] Coluna `leads.deal_stage` ou uso consistente de `stage = 'convertido'` (já existe enum `lead_stage`).
- [ ] Tabela `deals` opcional (`lead_id`, `value`, `status`, `closed_at`) se houver múltiplas vendas por lead. **Decisão pendente:** começar com `leads.value` é suficiente para V1.
- [ ] RLS + GRANTs para as novas colunas (herdam da tabela).

### 3.2 Atribuição multi-touch
- [ ] `lead_attribution` hoje só guarda **first-touch** (uma row por `visitor_id`). Para multi-touch precisamos:
  - [ ] Permitir múltiplas rows por `visitor_id` (já permite — não há UNIQUE).
  - [ ] Adicionar `touch_type enum('first','middle','last','conversion')` e `touch_at timestamptz`.
  - [ ] Função `resolve_attribution(_lead_id, _model)` com modelos `first_touch | last_touch | linear | time_decay | u_shaped`.
- [ ] Janela de atribuição (`attribution_window_days`, default 30) configurável por workspace.

### 3.3 Captura de receita
- [ ] Bloco `convert` no Builder (ou ação no `LeadDetail`) que chama RPC `record_conversion(_lead_id, _value, _currency, _meta)`:
  - atualiza `leads.value`, `leads.closed_at`, `leads.stage='convertido'`;
  - insere `events(type='lead_converted', payload={value})`;
  - dispara `trackingEngine.track('Purchase', { value, currency, event_id })` para o CAPI.
- [ ] UI mínima para "Marcar como fechado + valor R$".

### 3.4 Tracking Engine → real
- [ ] `Purchase` / `Schedule` / `Lead` precisam ser emitidos de pontos reais (hoje só Lead é, dentro do `crmBridge`).
- [ ] Substituir mocks Meta/Google OAuth por credenciais reais (ver `META-INTEGRATION-AUDIT.md` §6.5).
- [ ] Setar `mock: false` em `destinations.setConfig` quando token presente.
- [ ] Capturar `fbc`/`fbp` cookies no widget e empurrar em `recordPublicAttribution`.

### 3.5 Server-side hardening
- [ ] Edge function `track-conversion` que recebe webhook externo (Stripe, Hotmart, etc.), valida HMAC e chama `record_conversion`.
- [ ] Dedupe Pixel × CAPI já está pronto (`event_id = event.id`). ✅

### 3.6 UI Revenue real
- [ ] `Revenue.tsx` fora do demo: substituir `EmptyState` por agregação real via `persistence.leads.list({ stage:'convertido' })` + `summarizeAttribution`.
- [ ] Gráfico de trend baseado em `events.type='lead_converted'` agrupado por dia.
- [ ] Linha "Custo de mídia" exige import manual ou Ads API (⚪ ROADMAP). Sem custo → sem ROAS real (mostrar "—").

---

## 4. Existe estrutura para Meta CAPI?

**Sim, parcial → pode virar real sem reescrita.** Resumo:

| Item | Status | Notas |
|---|---|---|
| Adapter server-side | 🟢 `tracking/destinations/meta.ts` | `POST graph.facebook.com/v19.0/{pixelId}/events`. |
| Event mapping interno → Meta | 🟢 `tracking/mappings/index.ts` | `Lead`, `CompleteRegistration`, `Schedule`, `Purchase`, `ViewContent`, `InitiateCheckout`, `PageView`. |
| Dedupe Pixel × CAPI | 🟢 | `event_id = event.id` enviado. |
| Captura `fbc`/`fbp` | 🟡 | Campo existe no payload (`user_data.fbc/fbp`) mas a leitura de cookies `_fbc`/`_fbp` no widget **não está implementada**. |
| Credenciais (`pixelId`, `accessToken`) | 🟡 | UI em `CredentialsPanel` salva no vault; default é `mock: true`. |
| Hash de PII (`em`, `ph`) | ⚪ ROADMAP | Não há SHA-256 de email/phone hoje. Sem isso, match rate cai. |
| Test Events code | ⚪ ROADMAP | Falta campo `test_event_code` na config. |
| Disparo de `Purchase` real | ⚪ ROADMAP | Depende de §3.3. |

**Veredito:** o caminho do dado interno → Meta funciona end-to-end hoje, basta (a) credenciais reais, (b) `fbc/fbp` cookies, (c) hash PII, (d) alguém chamar `track('Purchase', { value })`.

---

## 5. Existe estrutura para UTM?

**Sim, REAL ponta-a-ponta.**

| Camada | Onde | Status |
|---|---|---|
| Captura na URL | `tracking/visitor.ts` — UTM_KEYS + CLICK_KEYS | 🟢 |
| Persistência local | `localStorage["fluxbot:attribution"]` | 🟢 |
| Envio para o backend | `recordPublicAttribution(slug, visitorId, …)` via `lib/public-runtime.ts` | 🟢 |
| RPC SECURITY DEFINER | `record_public_attribution` | 🟢 |
| Tabela | `lead_attribution` (18 cols: utm_source/medium/campaign/content/term + fbclid/gclid/ttclid/msclkid + referrer + landing_page) | 🟢 |
| Late-binding visitor → lead | `attach_public_attribution_to_lead` chamada após `record_public_lead` | 🟢 |
| Leitura/agregação | `summarizeAttribution` no front | 🟡 (front lê via `persistence`, agregação OK; falta `revenue` real) |

**Único gap:** atribuição é **first-touch** por construção (uma row por visitor_id sem `touch_type`). Multi-touch precisa do schema descrito em §3.2.

---

## 6. Existe estrutura para eventos?

**Sim, duas camadas distintas e funcionais.**

### 6.1 Eventos de produto (DB)
| Item | Status |
|---|---|
| Tabela `events` (11 cols: workspace_id, bot_id, flow_id, session_id, lead_id, type, payload jsonb, block_key…) | 🟢 |
| RPC `record_public_event(_session_id, _type, _payload, _block_key)` SECURITY DEFINER | 🟢 |
| Disparado por | `runtime/engine.ts` (block lifecycle), `lib/public-runtime.ts`, `crm-bridge` |
| Cobertura de tipos | `flow_started`, `flow_completed`, `block_executed`, `lead_captured`, etc. — `lead_converted` **não existe ainda**. |

### 6.2 Eventos de marketing (tracking bus in-memory)
| Item | Status |
|---|---|
| `trackingEngine.track(type, payload)` | 🟢 `src/tracking/engine.ts` |
| Subscribe destinations | 🟢 `destinations/registry.ts` |
| Dispatch log (ring buffer 200) | 🟢 |
| Inspector UI | 🟢 `components/tracking/DispatchInspector.tsx` |
| Secret vault para tokens | 🟢 `security/secretVault.ts` |
| **Persistência cross-session** dos eventos de tracking | ⚪ ROADMAP | Hoje vive só em memória/localStorage; reload zera o histórico de dispatch. |

---

## 7. Pode virar real?

**Sim, com esforço cirúrgico.** A espinha dorsal (captura UTM → DB → atribuição agregada → CAPI server-side) **já existe e é real**. O que segura é a ausência de **valor monetário** nos leads. Caminho crítico mínimo para "Revenue real V1":

1. **Migration:** `ALTER TABLE leads ADD COLUMN value numeric, ADD COLUMN currency text DEFAULT 'BRL', ADD COLUMN closed_at timestamptz`.
2. **RPC:** `record_conversion(_lead_id, _value, _currency)` que atualiza `leads`, insere `events(type='lead_converted')` e dispara `trackingEngine.track('Purchase', { value, currency, event_id })`.
3. **UI:** ação "Marcar fechado + R$" em `LeadDetail`.
4. **Revenue.tsx fora do demo:** consumir `persistence.leads` reais + `summarizeAttribution`.
5. **Credenciais Meta reais** (depende de FASE R2).

Com (1)-(4), Revenue/Analytics deixam de depender de `DEMO_LEAD_VALUES`. Com (5), CAPI passa para `mock: false` automaticamente.

**Tudo o mais (multi-touch, custo de mídia/ROAS, Ads APIs, webhook Stripe)** é incremento posterior — não bloqueia a saída do mock.

---

## 8. Ranking final por capacidade

| Capacidade | Status | Bloqueio |
|---|---|---|
| Captura UTM/click-ids | 🟢 REAL | — |
| Persistência de atribuição | 🟢 REAL | — |
| Late-binding visitor → lead | 🟢 REAL | — |
| Modelo de atribuição (agregação) | 🟢 REAL | só first-touch |
| Forecast de receita | 🟡 PARCIAL | ticket hardcoded |
| Revenue UI | 🔴 MOCK fora do demo | falta `leads.value` + agregação |
| Meta CAPI dispatch | 🟢 REAL (com creds) | falta credencial + cookies + hash |
| Eventos de produto (DB) | 🟢 REAL | falta tipo `lead_converted` |
| Eventos de tracking (bus) | 🟢 REAL | falta persistir histórico |
| Multi-touch / atribuição ponderada | ⚪ ROADMAP | schema + função |
| ROAS real | ⚪ ROADMAP | custo de mídia não importado |

**Próxima fase sugerida:** R4 — desenhar a migration `leads.value/closed_at` + RPC `record_conversion` + contrato de evento `lead_converted` (sem implementar ainda).
