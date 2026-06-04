# META CHANNELS IMPLEMENTATION REPORT
**FASE 27A.4 — Concluída em 2026-06-04**

## Escopo Implementado

### 1. Migração de Banco de Dados
**Arquivo:** `supabase/migrations/20260604000001_meta_channels.sql`

Três tabelas criadas com RLS completo:
- `meta_channel_connections` — credenciais por workspace/plataforma
- `meta_conversations` — inbox unificado (WhatsApp/Instagram/Messenger)
- `meta_messages` — histórico de mensagens com direção inbound/outbound

RPCs com SECURITY DEFINER:
- `store_meta_inbound()` — upsert atômico de conversa + inserção de mensagem
- `find_meta_connection()` — roteamento de webhook por phone_number_id ou page_id

### 2. Edge Functions (Deno)
**`supabase/functions/meta-webhook/index.ts`**
- GET: verificação hub.challenge com META_VERIFY_TOKEN
- POST: HMAC-SHA256 via crypto.subtle, extração de eventos WhatsApp/Instagram/Messenger
- Resposta 200 imediata, processamento assíncrono

**`supabase/functions/meta-send/index.ts`**
- Proxy server-side para Graph API (contorna CORS)
- Roteia por plataforma: WA → /{phone_number_id}/messages, IG/Messenger → /me/messages
- Registra mensagens outbound em meta_messages

### 3. Channel Adapters (TypeScript)
- `src/channels/meta/types.ts` — tipos compartilhados (MetaPlatform, MetaConversation, MetaMessage, etc.)
- `src/channels/meta/connection.ts` — metaConnectionService + sendMetaMessage()
- `src/channels/meta/whatsapp.ts` — adapter + setup steps
- `src/channels/meta/instagram.ts` — adapter + setup steps
- `src/channels/meta/messenger.ts` — adapter + setup steps
- `src/channels/meta/index.ts` — re-exports

### 4. React Hooks
- `src/hooks/useMetaConnections.ts` — CRUD de conexões
- `src/hooks/useMetaConversations.ts` — inbox com Realtime (postgres_changes), markRead, setHandoffStatus
  - `useMetaMessages(conversationId)` — histórico com Realtime INSERT

### 5. UI Components
- `src/components/channels/ChannelBadge.tsx` — badge colorido por plataforma (WA/IG/Messenger/web/telegram)
- `src/components/channels/MetaConnectModal.tsx` — modal de conexão manual (token + IDs)

### 6. Conversations Page Rewrite
- `src/pages/Conversations.tsx` — reescrito sem lib/mock
- Filtros por plataforma (Todos/WhatsApp/Instagram/Messenger)
- Busca por nome/preview
- ChatPanel com envio real via sendMetaMessage()
- Controles de handoff (Bot/Humano/Resolvido)
- Empty state com botão "Conectar canal"
- Realtime: novas mensagens aparecem sem refresh

## Segurança

| Item | Decisão |
|------|---------|
| access_token | Nunca exposto ao frontend; lido apenas em Edge Functions via service_role |
| HMAC-SHA256 | Verificação obrigatória antes de processar payload do webhook |
| RLS | Todas as tabelas usam is_workspace_member() / has_workspace_role() |
| CORS | Meta Graph API chamada apenas server-side (meta-send Edge Function) |
| Chave service_role | Apenas em Edge Functions (auto-inject Supabase); nunca em variável VITE_* |

## Configuração Necessária (Supabase Secrets)

```
META_VERIFY_TOKEN=flux_meta_verify   # token de verificação do webhook
META_APP_SECRET=<seu_app_secret>     # para validar HMAC-SHA256
```

## Webhook URL

```
https://<SUPABASE_PROJECT_ID>.supabase.co/functions/v1/meta-webhook
```

Configure no Meta App Dashboard → Webhooks → URL + Verify Token = `flux_meta_verify`

## Campos Obrigatórios por Plataforma

| Plataforma | Campos |
|-----------|--------|
| WhatsApp | access_token, phone_number_id |
| Instagram | access_token, page_id |
| Messenger | access_token, page_id |

## Próximos Passos (P1)

1. Deploy das Edge Functions via Supabase CLI ou dashboard
2. Aplicar migração SQL no projeto remoto
3. Configurar secrets META_VERIFY_TOKEN e META_APP_SECRET
4. Registrar webhook URL no Meta App Dashboard
5. Testar end-to-end com número de sandbox WhatsApp

## Referências Cruzadas

- [MASTER-ROADMAP.md](./MASTER-ROADMAP.md)
- [30-DAY-EXECUTION-PLAN.md](./30-DAY-EXECUTION-PLAN.md)
- [OPENAI-IMPLEMENTATION-PLAN.md](./OPENAI-IMPLEMENTATION-PLAN.md)
