# Supabase Deploy Checklist
**FASE 27F — Auditoria técnica executada em 2026-06-08**

---

## STATUS GERAL: BLOCKED

**Bloqueador raiz:** o projeto `bgzczvsmfcnypwqveotx` (Flux Agent Studio) é gerenciado pelo **Lovable Cloud** e **não aparece na conta MCP** disponível neste ambiente. O MCP tem acesso a 7 outros projetos da mesma organização, mas não a este.

Consequência: nenhuma operação de deploy remoto (migrations, edge functions, secrets, verificações de estado) pode ser executada automaticamente a partir deste ambiente.

---

## Projetos Supabase acessíveis via MCP (confirmado)

| Ref | Nome | Acessível |
|-----|------|-----------|
| `kdvyaxghassnvhggmdfm` | Orçamentos | ✅ |
| `fngjxjrgovhxbdlkomvw` | Site Promotrip | ✅ |
| `syqrgayomzhvhtwoilou` | CRM Macth Solutions | ✅ |
| `zjelgobexwhhfoisuilm` | prevlegal-central | ✅ |
| `lrqvvxmgimjlghpwavdb` | prevlegal-alexandrini | ✅ |
| `espwkkaldnisriqhxyzt` | Fluxrow | ✅ |
| `pgcoyjanmuksvbxnvnhm` | Lex Revison | ✅ |
| **`bgzczvsmfcnypwqveotx`** | **Flux Agent Studio** | ❌ **403 — sem acesso** |

---

## Respostas às 9 perguntas da auditoria

### 1. Migrations locais aplicadas?

**DESCONHECIDO** — impossível verificar remotamente.

Estado local (código, auditado):

| Migration | Arquivo | Conteúdo |
|-----------|---------|---------|
| `20260602114630` | `_41fe3de9...sql` | Schema base: workspaces, profiles, workspace_members, bots, leads, sessions, messages, RLS, helpers |
| `20260602114654` | `_47f6d6cc...sql` | REVOKE execute em funções RLS (hardening) |
| `20260602120256` | `_25d8a5f8...sql` | ALTER TABLE leads: company, owner_id, notes |
| `20260602121119` | `_39539875...sql` | ALTER TABLE bots: slug, published_snapshot |
| `20260602122138` | `_c3c7e0a2...sql` | visitor_profiles table + 10 políticas RLS |
| `20260604000001` | `meta_channels.sql` | meta_channel_connections, meta_conversations, meta_messages + RPCs + 6 políticas RLS |
| `20260604000002` | `meta_realtime.sql` | ALTER PUBLICATION supabase_realtime (3 tabelas) |
| `20260605162135` | `_1d64b104...sql` | GRANT EXECUTE on is_workspace_member para authenticated/anon |
| `20260608124344` | `_b11be011...sql` | CREATE FUNCTION slugify() |

**Total:** 9 migrations locais, todas prontas para `supabase db push`.

---

### 2. Quais migrations faltam?

Sem acesso ao banco remoto é impossível confirmar quais já foram aplicadas. Baseado no histórico do projeto:

- **Prováveis aplicadas** (Lovable aplica automaticamente migrations ao fazer deploy): `20260602114630` a `20260602122138` (as 5 primeiras — existem antes do bloqueio de acesso MCP).
- **Prováveis pendentes** (criadas após o bloqueio MCP, nunca aplicadas remotamente):
  - `20260604000001_meta_channels.sql` ← **crítica** — sem ela, WhatsApp/Meta não funciona
  - `20260604000002_meta_realtime.sql` ← **crítica** — sem ela, Realtime não publica eventos
  - `20260605162135_1d64b104...` — GRANT em is_workspace_member
  - `20260608124344_b11be011...` — função slugify

**Ação:** `supabase db push` aplica apenas as pendentes (por timestamp).

---

### 3. Edge Functions deployadas?

**DESCONHECIDO** — MCP retorna 403 para `list_edge_functions` neste projeto.

Estado local (código pronto):

| Função | Arquivo | Deploy necessário |
|--------|---------|-----------------|
| `meta-webhook` | `supabase/functions/meta-webhook/index.ts` | `--no-verify-jwt` obrigatório |
| `meta-send` | `supabase/functions/meta-send/index.ts` | deploy padrão |

Se o Lovable nunca deployou Edge Functions automaticamente (comportamento padrão), **ambas estão pendentes**.

---

### 4. Quais secrets faltam?

`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` e `SUPABASE_ANON_KEY` são **auto-injetados** pelo runtime Supabase — não precisam ser configurados manualmente.

Secrets que **precisam** ser configurados manualmente:

| Secret | Usado por | Valor | Status |
|--------|-----------|-------|--------|
| `META_VERIFY_TOKEN` | `meta-webhook` | `flux_meta_verify` (ou customizado) | ❌ Pendente |
| `META_APP_SECRET` | `meta-webhook` | Meta App → Settings → Basic → App Secret | ❌ Pendente |

**Impacto se ausentes:**
- Sem `META_APP_SECRET`: `meta-webhook` rejeita **todos** os POSTs com HTTP 401 (fail-closed — comportamento correto de segurança, mas bloqueia o fluxo).
- Sem `META_VERIFY_TOKEN`: hub challenge do Meta falha → impossível registrar o webhook.

---

### 5. Realtime funcionando?

**PROVAVELMENTE NÃO** — dependente da migration `20260604000002_meta_realtime.sql` ser aplicada.

Estado do código:
- `ALTER PUBLICATION supabase_realtime ADD TABLE public.meta_channel_connections` ✅ (na migration)
- `ALTER PUBLICATION supabase_realtime ADD TABLE public.meta_conversations` ✅
- `ALTER PUBLICATION supabase_realtime ADD TABLE public.meta_messages` ✅
- Subscrições no frontend (`useMetaConversations.ts`, `useMetaLeadBridge.ts`) ✅ corretas

**Bloqueio:** se a migration `20260604000002` não foi aplicada, as tabelas Meta não estão na publication e o Realtime não dispara eventos — mesmo com o código correto.

---

### 6. RLS funcionando?

**PARCIALMENTE** — as políticas estão no código e prontas, mas dependem das migrations terem sido aplicadas.

Contagem de políticas por migration:

| Migration | Policies | Tabelas protegidas |
|-----------|---------|------------------|
| `20260602114630` | 53 | workspaces, profiles, workspace_members, bots, leads, sessions, messages, etc. |
| `20260602122138` | 10 | visitor_profiles |
| `20260604000001` | 6 | meta_channel_connections, meta_conversations, meta_messages |

Funções RLS críticas:
- `is_workspace_member(workspace_id, user_id)` — SECURITY DEFINER ✅
- `has_workspace_role(workspace_id, user_id, roles[])` — SECURITY DEFINER ✅

Se as migrations base (20260602) já foram aplicadas pelo Lovable, o RLS está funcionando para o core. O RLS das tabelas Meta depende da `20260604000001`.

---

### 7. Auth funcionando?

**PROVAVELMENTE SIM** — o Supabase Auth é habilitado automaticamente em todo projeto novo. O código usa `supabase.auth.signInWithPassword`, `supabase.auth.signUp`, `supabase.auth.getUser` (arquivos `src/auth/AuthProvider.tsx`, `src/pages/Auth.tsx`). Nenhuma configuração especial de Auth foi identificada nas migrations.

**Ressalva:** trigger `handle_new_user()` (cria perfil automaticamente no signup) está na migration base — funcionará se a migration foi aplicada.

---

### 8. Storage funcionando?

**NÃO USADO** — nenhuma chamada a `supabase.storage` existe no código-fonte. Nenhuma migration cria buckets. Storage não faz parte do escopo atual do produto.

---

### 9. Comandos exatos para deploy completo

Executar **na máquina local** onde há acesso de rede e Supabase CLI instalado:

```bash
# Pré-requisito: Supabase CLI instalado
# brew install supabase/tap/supabase  (macOS)
# https://supabase.com/docs/guides/cli

# 1. Linkar ao projeto correto
supabase link --project-ref bgzczvsmfcnypwqveotx

# 2. Verificar que está no projeto certo
supabase status
# Esperado: API URL = https://bgzczvsmfcnypwqveotx.supabase.co

# 3. Aplicar migrations pendentes
supabase db push
# Aplica apenas as migrations não registradas em supabase_migrations (por timestamp)

# 4. Verificar tabelas Meta no banco
# Abrir Supabase Dashboard → SQL Editor e rodar:
# SELECT table_name FROM information_schema.tables
# WHERE table_schema = 'public'
# AND table_name IN ('meta_channel_connections','meta_conversations','meta_messages')
# ORDER BY table_name;
# Esperado: 3 linhas

# 5. Deploy Edge Functions
supabase functions deploy meta-webhook --no-verify-jwt
supabase functions deploy meta-send

# 6. Configurar secrets (2 obrigatórios)
supabase secrets set META_VERIFY_TOKEN=flux_meta_verify
supabase secrets set META_APP_SECRET=<seu_app_secret_do_meta>

# 7. Verificar secrets configurados
supabase secrets list

# 8. Testar hub challenge
curl "https://bgzczvsmfcnypwqveotx.supabase.co/functions/v1/meta-webhook\
?hub.mode=subscribe\
&hub.verify_token=flux_meta_verify\
&hub.challenge=TESTE123"
# Esperado: body = TESTE123, HTTP 200

# 9. Testar HMAC inválido
curl -X POST "https://bgzczvsmfcnypwqveotx.supabase.co/functions/v1/meta-webhook" \
  -H "Content-Type: application/json" \
  -H "x-hub-signature-256: sha256=invalido" \
  -d '{"object":"test","entry":[]}'
# Esperado: HTTP 401
```

---

## Checklist de Deploy

| # | Item | Responsável | Status |
|---|------|------------|--------|
| 1 | `supabase link --project-ref bgzczvsmfcnypwqveotx` | Manual | ❌ Pendente |
| 2 | `supabase db push` (9 migrations) | Manual | ❌ Pendente |
| 3 | Verificar tabelas Meta no SQL Editor | Manual | ❌ Pendente |
| 4 | `supabase functions deploy meta-webhook --no-verify-jwt` | Manual | ❌ Pendente |
| 5 | `supabase functions deploy meta-send` | Manual | ❌ Pendente |
| 6 | `supabase secrets set META_VERIFY_TOKEN=flux_meta_verify` | Manual | ❌ Pendente |
| 7 | `supabase secrets set META_APP_SECRET=<valor>` | Manual | ❌ Pendente |
| 8 | Testar hub challenge (GET) → HTTP 200 | Manual | ❌ Pendente |
| 9 | Testar HMAC inválido (POST) → HTTP 401 | Manual | ❌ Pendente |
| 10 | Registrar webhook no Meta App Dashboard | Manual | ❌ Pendente |
| 11 | Enviar mensagem WhatsApp de teste | Manual | ❌ Pendente |
| 12 | Confirmar lead no CRM automaticamente | Manual | ❌ Pendente |

**Estimativa:** 40–60 minutos de execução manual com acesso ao Supabase CLI e ao Meta App Dashboard.

---

## Diagnóstico do Bloqueador

| Camada | Status | Detalhes |
|--------|--------|---------|
| Código (migrations) | ✅ PRONTO | 9 migrations, TypeScript limpo, sem bugs conhecidos |
| Código (edge functions) | ✅ PRONTO | HMAC fail-closed, conversation_id resolvido |
| Código (frontend) | ✅ PRONTO | RLS, Realtime, CRM bridge, Lead bridge |
| Projeto Supabase (remoto) | ⚠️ PARCIAL | Existe e está ativo — mas não acessível via MCP deste ambiente |
| Deploy de migrations | ❌ BLOQUEADO | Requer Supabase CLI local ou acesso MCP ao projeto |
| Deploy de edge functions | ❌ BLOQUEADO | Idem |
| Secrets | ❌ BLOQUEADO | Idem |
| Testes físicos | ❌ BLOQUEADO | Dependência cascata |

---

## Para desbloquear

**Opção A (recomendada) — CLI local:**
Executar os 9 comandos acima na máquina do usuário onde o Supabase CLI tem acesso ao projeto.

**Opção B — MCP:**
Transferir o projeto `bgzczvsmfcnypwqveotx` para a organização Supabase acessível via MCP (`ceslztoyqldgelabeqxp`), ou criar um projeto novo nessa organização e atualizar o `.env`.

---

## Referências

- [DEPLOY-TARGET.md](./DEPLOY-TARGET.md) — projeto oficial e comandos canônicos
- [SUPABASE-REALITY.md](./SUPABASE-REALITY.md) — auditoria de código
- [META-PHYSICAL-SMOKE-TEST-REPORT.md](./META-PHYSICAL-SMOKE-TEST-REPORT.md) — relatório anterior de bloqueio
- `supabase/migrations/` — 9 migrations prontas para aplicação
- `supabase/functions/` — 2 edge functions prontas para deploy
