# Meta Deploy Report
**FASE 28D · 2026-06-08**

---

## Status geral

| Item | Status |
|------|--------|
| Build TypeScript | ✅ Zero erros — 2855 módulos |
| `tsc --noEmit` | ✅ Zero erros |
| Migrations SQL | ✅ Corretas e completas |
| Edge Function `meta-webhook` | ✅ Código correto, HMAC fail-closed |
| Edge Function `meta-send` | ✅ Código correto, proxy CORS |
| Tabela `meta_channel_connections` | ✅ Schema, índices, RLS, políticas |
| Tabela `meta_conversations` | ✅ Schema, índices, RLS, UNIQUE, triggers |
| Tabela `meta_messages` | ✅ Schema, índices, RLS, UNIQUE |
| RPC `store_meta_inbound` | ✅ SECURITY DEFINER, upsert + insert atômico |
| RPC `find_meta_connection` | ✅ SECURITY DEFINER, routing por platform |
| Realtime publication | ✅ `ALTER PUBLICATION supabase_realtime ADD TABLE` (3 tabelas) |
| `supabase/config.toml` | ✅ `verify_jwt` correto por função |
| `useMetaLeadBridge` | ✅ Realtime INSERT → CRM lead automático |
| `useMetaConversations` | ✅ Realtime subscription + CRUD |
| `useMetaConnections` | ✅ CRUD completo |
| Adapters frontend (`src/channels/meta/`) | ✅ WhatsApp, Instagram, Messenger reais |

---

## Verificação de tabelas

### `meta_channel_connections`

| Coluna | Tipo | Constraint | Status |
|--------|------|-----------|--------|
| `id` | UUID PK | DEFAULT gen_random_uuid() | ✅ |
| `workspace_id` | UUID FK | ON DELETE CASCADE | ✅ |
| `platform` | TEXT | CHECK IN ('whatsapp','instagram','messenger') | ✅ |
| `access_token` | TEXT | NOT NULL | ✅ |
| `status` | TEXT | CHECK IN ('active','inactive','error') | ✅ |
| Índices | — | workspace_id, phone_number_id (partial), page_id (partial) | ✅ |
| RLS | — | SELECT: is_workspace_member · ALL: has_workspace_role(owner,admin) | ✅ |
| Trigger | — | `set_updated_at()` BEFORE UPDATE | ✅ |

### `meta_conversations`

| Coluna | Tipo | Constraint | Status |
|--------|------|-----------|--------|
| `id` | UUID PK | DEFAULT gen_random_uuid() | ✅ |
| `workspace_id` | UUID FK | ON DELETE CASCADE | ✅ |
| `connection_id` | UUID FK | ON DELETE CASCADE | ✅ |
| `external_conversation_id` | TEXT | NOT NULL | ✅ |
| UNIQUE | — | `(connection_id, external_conversation_id)` | ✅ |
| `handoff_status` | TEXT | CHECK IN ('agent','human','resolved') | ✅ |
| Índices | — | workspace_id + last_message_at DESC, connection_id | ✅ |
| RLS | — | SELECT + UPDATE: is_workspace_member | ✅ |
| Trigger | — | `set_updated_at()` BEFORE UPDATE | ✅ |

### `meta_messages`

| Coluna | Tipo | Constraint | Status |
|--------|------|-----------|--------|
| `id` | UUID PK | DEFAULT gen_random_uuid() | ✅ |
| `workspace_id` | UUID FK | ON DELETE CASCADE | ✅ |
| `conversation_id` | UUID FK | ON DELETE CASCADE | ✅ |
| `external_message_id` | TEXT | UNIQUE | ✅ |
| `direction` | TEXT | CHECK IN ('inbound','outbound') | ✅ |
| Índices | — | conversation_id + sent_at DESC, workspace_id | ✅ |
| RLS | — | SELECT: is_workspace_member · INSERT: is_workspace_member | ✅ |

---

## Verificação das Edge Functions

### `meta-webhook`

| Item | Status |
|------|--------|
| Hub challenge (GET) | ✅ `hub.mode=subscribe` + `hub.verify_token` + retorna `hub.challenge` |
| HMAC fail-closed | ✅ Se `META_APP_SECRET` ausente → 401 imediato |
| HMAC verification | ✅ `crypto.subtle` HMAC-SHA256 comparação de `x-hub-signature-256` |
| Parser WhatsApp | ✅ `extractWhatsApp()` — mensagens de texto, media type |
| Parser Instagram | ✅ `extractInstagram()` — DM, anexos |
| Parser Messenger | ✅ `extractMessenger()` — mensagens de página |
| Routing | ✅ `find_meta_connection()` RPC por platform + phone_number_id/page_id |
| Persistência | ✅ `store_meta_inbound()` RPC — upsert conversa + insert mensagem |
| Resposta assíncrona | ✅ Retorna `EVENT_RECEIVED` 200 imediatamente, processa em background |
| `verify_jwt` | ✅ `false` em `supabase/config.toml` |

### `meta-send`

| Item | Status |
|------|--------|
| Autenticação caller | ✅ Verifica `Authorization` header |
| Carregar conexão | ✅ service_role, filtra `status=active` |
| Envio WhatsApp | ✅ `POST /{phone_number_id}/messages` com `messaging_product: "whatsapp"` |
| Envio Instagram | ✅ `POST /me/messages` com `recipient.id` |
| Envio Messenger | ✅ Reutiliza `sendInstagram()` (mesma API) |
| Upsert conversa | ✅ `ON CONFLICT (connection_id, external_conversation_id)` antes do INSERT de mensagem |
| Record outbound | ✅ INSERT em `meta_messages` com `direction: "outbound"` |
| Sem token na URL | ✅ Token apenas em `Authorization: Bearer` header |
| `verify_jwt` | ✅ `true` em `supabase/config.toml` |

---

## `supabase/config.toml` — atualizado

```toml
project_id = "bgzczvsmfcnypwqveotx"

[functions.meta-webhook]
verify_jwt = false       # Meta não envia JWT Supabase; auth via HMAC

[functions.meta-send]
verify_jwt = true        # Requer usuário autenticado

[functions."google-oauth-callback"]
verify_jwt = false       # Redirect público do OAuth Google

[functions."calendar-webhook"]
verify_jwt = false       # Google push notifications

[functions."calendar-sync"]
verify_jwt = false       # Cron + invocação direta

[functions."calendar-watch-refresh"]
verify_jwt = false       # Cron diário
```

---

## Incompatibilidades TypeScript — nenhuma encontrada

O `supabase as any` em `src/channels/meta/connection.ts` e `src/hooks/useMetaConversations.ts` é um cast deliberado e documentado: as tabelas Meta foram criadas por migrations após a geração dos tipos Supabase pelo Lovable. Não é um bug — é o padrão correto até que os tipos sejam regenerados via `supabase gen types typescript`.

Para regenerar após deploy:
```bash
supabase gen types typescript --project-id bgzczvsmfcnypwqveotx > src/integrations/supabase/types.ts
```

---

## Prontidão: READY FOR DEPLOY

**O código está 100% pronto.** Nenhuma alteração de desenvolvimento é necessária.

O que falta é **exclusivamente operacional**:

| Passo | Comando / Ação | Tempo | Quem |
|-------|---------------|-------|------|
| 1 | `supabase link --project-ref bgzczvsmfcnypwqveotx` | 1 min | Dev |
| 2 | `supabase db push` | 3 min | Dev |
| 3 | `supabase functions deploy meta-webhook --no-verify-jwt` | 2 min | Dev |
| 4 | `supabase functions deploy meta-send` | 2 min | Dev |
| 5 | `supabase secrets set META_VERIFY_TOKEN=flux_meta_verify` | 1 min | Dev |
| 6 | `supabase secrets set META_APP_SECRET=<app_secret>` | 1 min | Dev |
| 7 | Criar Meta App + WABA sandbox (WhatsApp) | 20 min | Renan |
| 8 | Configurar webhook no Meta App Dashboard | 10 min | Renan |
| 9 | INSERT em `meta_channel_connections` com token real | 5 min | Dev |
| 10 | Teste físico: enviar DM, verificar Inbox + CRM | 5 min | Renan + Dev |

**Total para MVP WhatsApp: ~50 min**

Ver `docs/META-SETUP-CHECKLIST.md` para o guia completo.
