# FASE 26Z.2 — Omnichannel Validation

Auditoria técnica do Inbox / camada omnichannel. Sem implementação — apenas classificação.

Legenda: **REAL** (funcional ponta-a-ponta) · **PARCIAL** (estrutura existe, falta integração) · **MOCK** (UI/dados fake) · **ROADMAP** (não existe ainda).

---

## Arquitetura observada

- `src/channels/` — `ChannelAdapter` contract (`types.ts`), `registry.ts`, `sessionRouter.ts`, `bus.ts` (mirror p/ `runtimeEventBus`).
- Adapters: `web.ts` (**active**, persiste via `recordPublicMessage`), `stubs.ts` (whatsapp/instagram/messenger/telegram — emitem eventos no bus mas não falam com plataforma).
- Inbox UI: `src/pages/Conversations.tsx` lendo `mockConversations` (`src/domain/mock/conversationRepository.ts`).
- Bridge runtime → CRM: `src/lib/crm-bridge.ts` (cria Lead em `flow_completed`).
- Backend: tabela `conversations`, `sessions`, `messages`, `events` (Supabase) com RPCs `record_public_session/message/event`.
- Debug: `/channels` (`ChannelsDebug.tsx`) mostra adapters, sessões e tráfego em tempo real.

---

## Checklist (10 perguntas)

| # | Pergunta | Status | Evidência / Gap |
|---|----------|--------|-----------------|
| 1 | Todas as mensagens chegam no mesmo lugar? | **PARCIAL** | `channelBus` faz fan-out p/ `runtimeEventBus` → qualquer adapter que chamar `send/receive` aparece em `/channels` e Inspector. Mas só **web** persiste em `messages`; whatsapp/ig/messenger/telegram são stubs e não geram registros no Inbox real. |
| 2 | Identificação visual por canal? | **MOCK** | `Conversation.botName` exibido em `Conversations.tsx`; não há badge/ícone por `channelId`. Campo `channel` existe em `Session` mas não é renderizado como pill colorido. |
| 3 | Histórico único por contato? | **PARCIAL** | `sessions.lead_id` liga sessão↔lead (RPC `record_public_lead` faz update). `LeadDetail.tsx` lista conversas do lead. Porém não há **identidade cross-canal** (mesma pessoa em WhatsApp + IG = 2 leads distintos). |
| 4 | Deduplicação? | **ROADMAP** | Nenhum match por `email`/`phone`/`external_id`. `leads.create` sempre insere novo. Sem `unique` constraints úteis, sem `dedupe_key`. |
| 5 | Merge de contatos? | **ROADMAP** | Não existe função `mergeLeads`, nem UI, nem coluna `merged_into`. |
| 6 | Timeline unificada? | **PARCIAL** | `events` table + `EventInspector` mostram tudo por sessão. `LeadDetail` agrega por lead. Falta view cross-canal (todas as sessões de um contato em ordem cronológica única com canal indicado). |
| 7 | Replay completo? | **PARCIAL** | `events` é append-only e contém `flow_started`, `variable_updated`, `message_*`, `channel:*` (via `channelBus`). Tecnicamente dá pra reproduzir. Não há player de replay implementado. |
| 8 | Handoff humano? | **MOCK** | `SessionStatus = "humano"` existe e demo dataset usa. Não há fila de atendentes, atribuição, takeover real, nem notificação. |
| 9 | Auditoria? | **PARCIAL** | `events` table persistida (Supabase) + `runtimeEventBus` em memória. Sem `audit_logs` separada com ator/IP/diff; Settings tem `AuditLogsPanel` mas é placeholder. |
| 10 | SLA? | **ROADMAP** | Nenhum campo `first_response_at`, `sla_target_ms`, `sla_breached`. Sem métrica nem alerta. |

---

## Resumo por classificação

- **REAL (0/10)** — nenhum item está completo ponta-a-ponta.
- **PARCIAL (5/10)** — itens 1, 3, 6, 7, 9.
- **MOCK (2/10)** — itens 2, 8.
- **ROADMAP (3/10)** — itens 4, 5, 10.

## Gaps críticos para "Inbox de verdade"

1. **Adapters reais** (WhatsApp Cloud, IG Graph, Messenger) — hoje só `web` persiste.
2. **Identity resolution** — `contacts` table + `contact_identities (channel, external_id)` com merge.
3. **Dedupe** por phone/email normalizado no `record_public_lead`.
4. **Channel badge** em `Conversations.tsx` lendo `session.channel`.
5. **Handoff queue** (`agent_assignments`, status `awaiting_human`, takeover via realtime).
6. **SLA fields** + dashboard (`first_response_at - created_at`).
7. **Unified timeline view** em `LeadDetail` mesclando sessões de múltiplos canais.
8. **Replay player** consumindo `events` ordenados.

## Próximas fases sugeridas

- **26Z.2a** — Channel badge + filtro por canal no Inbox (UI only, ~30min).
- **26Z.2b** — Contact identity model + dedupe RPC (migration + RPC update).
- **26Z.2c** — Handoff V1 (status humano funcional + atribuição).
- **26Z.2d** — SLA fields + Analytics card.
- **26Z.2e** — Adapter real WhatsApp Cloud (edge function + webhook).

_Apenas auditoria. Nenhum código alterado._
