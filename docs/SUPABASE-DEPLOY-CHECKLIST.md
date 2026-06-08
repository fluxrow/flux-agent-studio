# SUPABASE DEPLOY CHECKLIST — FASE 27F

**Auditoria executada em 2026-06-08 contra o projeto canônico `bgzczvsmfcnypwqveotx`.**
Fontes: `supabase_migrations.schema_migrations`, `information_schema.tables`,
`pg_publication_tables`, `pg_class.relrowsecurity`, `storage.buckets`,
HTTP probes em `*.supabase.co/functions/v1/*`.

## Status geral: **PARTIAL**

O núcleo (workspaces, bots, leads, sessions, auth, RLS, realtime de `messages`/`sessions`)
está **READY**. Toda a stack de **canais Meta** (WhatsApp/Instagram/Messenger) está
**BLOCKED** — 2 migrations não aplicadas, 2 edge functions não deployadas, 2 secrets faltando.

---

## 1. Migrations

| # | Arquivo local | Versão na DB | Status |
|---|---|---|---|
| 1 | `20260602114630_…sql` (schema inicial + RLS + `handle_new_user`) | `20260602114628` | ✅ APLICADA |
| 2 | `20260602114654_…sql` (revokes de segurança) | `20260602114652` | ✅ APLICADA |
| 3 | `20260602120256_…sql` | `20260602120255` | ✅ APLICADA |
| 4 | `20260602121119_…sql` | `20260602121117` | ✅ APLICADA |
| 5 | `20260602122138_…sql` | `20260602122135` | ✅ APLICADA |
| 6 | **`20260604000001_meta_channels.sql`** | — | ❌ **FALTANDO** |
| 7 | **`20260604000002_meta_realtime.sql`** | — | ❌ **FALTANDO** |
| 8 | `20260605162135_…sql` | `20260605162133` | ✅ APLICADA |
| 9 | `20260608124344_…sql` (`slugify` hardening) | `20260608124341` | ✅ APLICADA |

**Aplicadas: 7/9. Faltando: 2** (toda a stack Meta).

Evidência: as tabelas `meta_channel_connections`, `meta_conversations` e
`meta_messages` **não existem** em `public` (confirmado via
`information_schema.tables`).

## 2. Edge Functions

| Função | Esperada | Probe HTTP | Status |
|---|---|---|---|
| `meta-webhook` | `GET ?hub.mode=subscribe…` → 200 challenge | **404** | ❌ NÃO DEPLOYADA |
| `meta-send` | `POST {}` → 400/401 | **404** | ❌ NÃO DEPLOYADA |

Ambas existem em `supabase/functions/` mas nunca foram publicadas no projeto canônico.

## 3. Secrets (Edge runtime)

| Secret | Necessário por | Status |
|---|---|---|
| `SUPABASE_URL` | meta-webhook, meta-send | ✅ presente |
| `SUPABASE_SERVICE_ROLE_KEY` | meta-webhook, meta-send | ✅ presente |
| `SUPABASE_PUBLISHABLE_KEY` | infra | ✅ presente |
| `SUPABASE_DB_URL` | infra | ✅ presente |
| `LOVABLE_API_KEY` | AI gateway | ✅ presente |
| `GOOGLE_SEARCH_CONSOLE_API_KEY` | connector GSC | ✅ presente (managed) |
| **`META_VERIFY_TOKEN`** | meta-webhook (verify handshake) | ❌ **FALTANDO** (cai em default `flux_meta_verify`) |
| **`META_APP_SECRET`** | meta-webhook (HMAC verification — sem ele todos os webhooks são rejeitados) | ❌ **FALTANDO** |

## 4. Realtime

Publicação `supabase_realtime` contém: `messages`, `sessions`. ✅ Suficiente para
`useMetaConversations` enquanto o app lê de `messages`/`sessions`.

Tabelas Meta (`meta_channel_connections`, `meta_conversations`, `meta_messages`)
**não estão na publicação** — bloqueado pelas migrations faltantes.

## 5. RLS

Todas as 16 tabelas de `public` têm `rowsecurity = true` (verificado em
`pg_class.relrowsecurity`). ✅ **READY.**

Funções `SECURITY DEFINER` (`has_workspace_role`, `is_workspace_member`,
`get_public_bot`, `publish_bot`, `record_public_*`, `handle_new_user`,
`attach_public_attribution_to_lead`) presentes e com `search_path = public`.

## 6. Auth

- Provider e-mail/senha ativo (login funciona em produção).
- Trigger `on_auth_user_created` → `handle_new_user` cria `profiles` +
  `workspaces` + `workspace_members` por novo signup. ✅
- `EXECUTE` em `handle_new_user` revogado de `PUBLIC/anon/authenticated`. ✅
- Google OAuth: connector existe; provider ainda **não confirmado ativo** no
  projeto canônico — testar em chat se for habilitar.

## 7. Storage

`storage.buckets` retorna **0 buckets**. Hoje o produto não usa storage —
**N/A**, não bloqueia.

## 8. Comandos para destravar a stack Meta

Executar localmente, **com o repo linkado a `bgzczvsmfcnypwqveotx`**:

```bash
# 0. Conferir o link
supabase link --project-ref bgzczvsmfcnypwqveotx
grep project_id supabase/config.toml  # deve imprimir bgzczvsmfcnypwqveotx

# 1. Aplicar as duas migrations faltantes
supabase db push
# Deve aplicar:
#   20260604000001_meta_channels.sql
#   20260604000002_meta_realtime.sql

# 2. Gravar os secrets do Meta (obter no Meta App → Settings → Basic)
supabase secrets set META_VERIFY_TOKEN=<string-arbitrária-usada-no-webhook-setup>
supabase secrets set META_APP_SECRET=<App Secret do Meta App>

# 3. Deployar as edge functions
supabase functions deploy meta-webhook --no-verify-jwt
supabase functions deploy meta-send

# 4. Verificar
curl -i "https://bgzczvsmfcnypwqveotx.supabase.co/functions/v1/meta-webhook?hub.mode=subscribe&hub.verify_token=<META_VERIFY_TOKEN>&hub.challenge=ping"
# Esperado: HTTP 200, corpo "ping"
supabase functions logs meta-webhook
```

Depois de aplicar as migrations, refazer probe Realtime:
```sql
SELECT tablename FROM pg_publication_tables
 WHERE pubname='supabase_realtime' AND schemaname='public';
-- Deve incluir meta_channel_connections, meta_conversations, meta_messages.
```

## 9. Classificação por subsistema

| Subsistema | Status |
|---|---|
| Schema núcleo (workspaces/bots/leads/sessions/events/flows) | **READY** |
| RLS em `public` | **READY** |
| Auth e-mail + trigger de signup | **READY** |
| Realtime de `messages`/`sessions` | **READY** |
| Storage | N/A (não usado) |
| Migrations Meta channels | **BLOCKED** |
| Edge functions Meta (`meta-webhook`, `meta-send`) | **BLOCKED** |
| Secrets Meta (`META_VERIFY_TOKEN`, `META_APP_SECRET`) | **BLOCKED** |
| **Geral** | **PARTIAL** |

Sem nada da seção 8 executado, todo fluxo WhatsApp/Instagram/Messenger é mock-only;
o resto do produto está operacional contra Supabase real.
