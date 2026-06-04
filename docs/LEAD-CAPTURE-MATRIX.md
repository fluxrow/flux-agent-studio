# FASE 26Z.3 — Lead Capture Matrix

Mapeamento de todos os pontos de entrada possíveis de leads. Sem implementação.

Legenda: **REAL** · **PARCIAL** · **MOCK** · **ROADMAP**.

---

## Matriz

| Entrada | 1. Funciona? | 2. Como | 3. Onde cai | 4. Vira lead? | 5. Score? | 6. Attribution? | 7. Revenue? |
|---|---|---|---|---|---|---|---|
| **Site Widget / Public Bot** (`/bot/:slug`) | **REAL** | `PublicBot.tsx` → `recordPublicSession` → runtime → `flow_completed` dispara `crmBridge` | `sessions` + `messages` + `leads` (Supabase) | ✅ via `record_public_lead` RPC | ✅ se flow setar `lead.score` (`crm-bridge.ts` linha ~75) | ✅ `record_public_attribution` (utm/gclid/fbclid/referrer) | ❌ sem `lead.value` real (usa `DEMO_LEAD_VALUES`) |
| **Link Direto** (URL do bot c/ UTM) | **REAL** | Mesmo pipeline do widget; UTMs capturados via `record_public_attribution` | idem | ✅ | ✅ | ✅ completo (utm_source/medium/campaign/content/term) | ❌ |
| **Landing Page → Bot** | **REAL** | LP injeta link/iframe → cai em `/bot/:slug` | idem | ✅ | ✅ | ✅ | ❌ |
| **QR Code** | **PARCIAL** | QR aponta p/ `/bot/:slug?utm_source=qr...` — funciona, mas não há gerador de QR no produto | idem | ✅ | ✅ | ✅ (se URL trouxer utm) | ❌ |
| **Formulário standalone** | **MOCK** | `src/pages/Forms.tsx` existe mas é placeholder; sem submit handler real, sem tabela `form_submissions` | — | ❌ | ❌ | ❌ | ❌ |
| **WhatsApp** | **ROADMAP** | `whatsappChannel` é stub (`channels/stubs.ts`); só emite eventos no bus, não recebe webhook real | nenhum lugar | ❌ | ❌ | ❌ | ❌ |
| **Instagram DM** | **ROADMAP** | `instagramChannel` stub; `oauth/providers.ts` lista IG mas sem webhook subscription | — | ❌ | ❌ | ❌ | ❌ |
| **Facebook Messenger** | **ROADMAP** | `messengerChannel` stub | — | ❌ | ❌ | ❌ | ❌ |
| **Telegram** | **ROADMAP** | `telegramChannel` stub + `connectors/adapters/telegram.ts` (outbound only) | — | ❌ | ❌ | ❌ | ❌ |
| **TikTok** | **ROADMAP** | listado em `ChannelKind` mas sem adapter | — | ❌ | ❌ | ❌ | ❌ |
| **Email inbound** | **ROADMAP** | nenhum parser/IMAP/webhook | — | ❌ | ❌ | ❌ | ❌ |
| **Comentários sociais (IG/FB)** | **ROADMAP** | sem listener de webhook de comments | — | ❌ | ❌ | ❌ | ❌ |
| **Anúncio (Lead Ads FB/IG)** | **ROADMAP** | sem integração Lead Ads API; tracking destinations enviam *para fora*, não recebem | — | ❌ | ❌ | ❌ | ❌ |
| **Import CSV manual** | **PARCIAL** | UI de leads permite criar manualmente via `persistence.leads.create`; sem importer em lote | `leads` | ✅ manual | ❌ default 0 | ❌ source = "manual" | ❌ |
| **Demo Runtime** | **REAL (interno)** | `demoPersistence` injeta 12 leads de `demoDataset.ts` | memória + analytics | ✅ | ✅ pré-calculado | ✅ utm fake | ✅ `DEMO_LEAD_VALUES` |

---

## Resumo

- **REAL ponta-a-ponta:** Site Widget, Link Direto, LP→Bot, Demo Runtime.
- **PARCIAL:** QR Code (falta gerador), Formulário (mock UI), Import CSV (falta bulk).
- **ROADMAP:** WhatsApp, Instagram DM, Messenger, Telegram, TikTok, Email, Comentários, Lead Ads.

**Conclusão central:** o sistema hoje tem **um único caminho de captura real** — o Public Bot via web. Tudo que cai nesse pipeline (Widget, Link Direto, LP, QR) herda: `lead` + `attribution` (utm/click ids) + `visitor_profile` + score (se flow setar) + sessão linkada. Os demais canais existem como **contrato** (`ChannelAdapter`) mas sem transporte real.

## Gaps por dimensão

- **Captura:** falta tudo que não passa por `/bot/:slug` (WhatsApp/IG/Messenger/Email/Lead Ads).
- **Score:** depende do flow chamar `lead.score`; não há scorer automático no momento da captura.
- **Attribution:** só funciona para canais web (UTMs na URL). Canais sociais nativos não trazem attribution porque nem entram.
- **Revenue:** **sem campo real** em `leads`. Toda a tela `/revenue` e `/analytics` usa `DEMO_LEAD_VALUES`. Maior bloqueio para vender o produto.

## Priorização sugerida

1. **`lead.value` real** (migration `leads.value numeric`) — desbloqueia Revenue/Analytics fora do demo.
2. **WhatsApp Cloud webhook** (edge function `whatsapp-inbound` → `record_public_lead`) — canal #1 em pedido.
3. **Lead Ads connector** (Meta) — captura direta da campanha.
4. **Form submit → lead** (transforma `/forms` em real).
5. **Bulk CSV import** (`leads` em lote com dedupe por email/phone).
6. **Instagram DM** + **Messenger** (Graph API webhooks).

_Apenas auditoria. Nenhum código alterado._
