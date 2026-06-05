# SUPABASE REALITY

**FASE 27A.8 — auditoria 100% baseada em código (sem assumir, sem documentação).**

Data: 2026-06-05

---

## Projeto principal

| Campo | Valor |
|------|------|
| **Project Ref** | `bgzczvsmfcnypwqveotx` |
| **URL** | `https://bgzczvsmfcnypwqveotx.supabase.co` |
| **Ambiente** | Único (não há prod/dev separados no código) |
| **Onde está configurado** | `.env`, `supabase/config.toml`, `src/integrations/supabase/client.ts` (via `import.meta.env.VITE_SUPABASE_URL`) |
| **Anon/publishable key** | `sb_publishable_PmE7AwBoVZIk0pXDs5eWbA_zH2tgQUq` (`.env`) |
| **Gerenciado por** | Lovable Cloud (`.env.example` declara que o `.env` real é gerado automaticamente) |

---

## Evidências (arquivos auditados)

| # | Arquivo | Evidência |
|---|---------|-----------|
| 1 | `.env` | `VITE_SUPABASE_PROJECT_ID="bgzczvsmfcnypwqveotx"` + URL + publishable key |
| 2 | `.env.local` | **não existe** |
| 3 | `.env.production` | **não existe** |
| 4 | `vite.config.ts` | nenhuma referência a Supabase — só Vite/React/path alias |
| 5 | `src/lib/supabase/*` | **não existe** (não há pasta `src/lib/supabase`) |
| 6 | `src/integrations/supabase/client.ts` | único `createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, …)` no frontend, lendo `import.meta.env.VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` |
| 7 | `src/integrations/supabase/types.ts` | tipos gerados — apenas referencia o mesmo projeto |
| 8 | `supabase/config.toml` | `project_id = "bgzczvsmfcnypwqveotx"` (config do CLI) |
| 9 | Edge Functions `supabase/functions/meta-webhook/index.ts` e `meta-send/index.ts` | `createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)` lendo `Deno.env` — herda o ref do deploy do CLI |
| 10 | `src/channels/meta/{whatsapp,instagram,messenger}.ts` + `src/components/channels/MetaConnectModal.tsx` | montam webhook URL `https://${supabaseProjectRef}.supabase.co/functions/v1/meta-webhook` a partir de `VITE_SUPABASE_PROJECT_ID` |

Toda chamada `createClient` no frontend converge para **um único cliente** importado de `@/integrations/supabase/client`.

### Inicializações de cliente encontradas

```
src/integrations/supabase/client.ts:11   createClient<Database>(SUPABASE_URL, …)   ← frontend
supabase/functions/meta-send/index.ts:26 createClient(SUPABASE_URL, SERVICE_KEY)   ← edge (Deno.env)
supabase/functions/meta-webhook/index.ts:25 createClient(SUPABASE_URL, SERVICE_KEY) ← edge (Deno.env)
```

Nenhum outro `createClient(` existe no repo.

### URLs Supabase encontradas no código

| URL / Ref | Local | Tipo |
|-----------|-------|------|
| `bgzczvsmfcnypwqveotx.supabase.co` | `.env`, `supabase/config.toml`, docs | hardcoded de configuração |
| `https://${supabaseProjectRef}.supabase.co/functions/v1/meta-webhook` | `src/channels/meta/*`, `MetaConnectModal.tsx` | template — resolve no runtime a partir do mesmo `VITE_SUPABASE_PROJECT_ID` |
| `https://esm.sh/@supabase/supabase-js@2` | edge functions | import do SDK, não é projeto |
| `espwkkaldnisriqhxyzt` | **somente em `docs/META-PHYSICAL-SMOKE-TEST-REPORT.md`** | nota de auditoria sobre um projeto MCP de outra conta (Fluxrow), **não referenciado por nenhum código** |

---

## Projetos encontrados

| Ref | URL | Uso | Ativo? |
|------|------|------|------|
| `bgzczvsmfcnypwqveotx` | `https://bgzczvsmfcnypwqveotx.supabase.co` | **Único projeto do Flux Agent Studio** — frontend, CRM, Leads, Conversations, Revenue, Auth, Edge Functions, Realtime | **SIM** |
| `espwkkaldnisriqhxyzt` | n/a | Projeto "Fluxrow" mencionado apenas em doc de auditoria (MCP de outra conta, schema diferente) | **NÃO no código** |

---

## Validação por feature

Todos os módulos abaixo importam **o mesmo** `supabase` de `@/integrations/supabase/client`, portanto consomem o projeto `bgzczvsmfcnypwqveotx`:

| Feature | Arquivo(s) chave | Projeto usado |
|--------|-----------------|----------------|
| **CRM** | `src/lib/crm-bridge.ts`, `src/domain/persistence/supabase/leadRepository.ts` | `bgzczvsmfcnypwqveotx` |
| **Leads** | `src/domain/persistence/supabase/leadRepository.ts`, `src/pages/Leads.tsx`, `src/pages/LeadDetail.tsx` | `bgzczvsmfcnypwqveotx` |
| **Conversations** | `src/hooks/useMetaConversations.ts`, `src/domain/persistence/supabase/sessionRepository.ts` | `bgzczvsmfcnypwqveotx` |
| **Revenue** | `src/pages/Revenue.tsx`, `src/intelligence/attribution.ts` (via `persistence.leads`) | `bgzczvsmfcnypwqveotx` |
| **Auth** | `src/auth/AuthProvider.tsx` (`supabase.auth`) | `bgzczvsmfcnypwqveotx` |
| **Edge Functions** | `supabase/functions/meta-webhook`, `meta-send` (deploy regido por `supabase/config.toml`) | `bgzczvsmfcnypwqveotx` |
| **Realtime** | `src/hooks/useMetaConversations.ts` (`supabase.channel(...)`) | `bgzczvsmfcnypwqveotx` |

---

## Respostas diretas

1. **Qual é o projeto correto do Flux Agent Studio hoje?**
   `bgzczvsmfcnypwqveotx` — `https://bgzczvsmfcnypwqveotx.supabase.co`.

2. **`bgzczvsmfcnypwqveotx` é o projeto principal?**
   **SIM.** É o único projeto referenciado pelo código (frontend, edge functions, CLI).

3. **`espwkkaldnisriqhxyzt` tem alguma relação com o Flux Agent Studio?**
   **NÃO.** Aparece apenas em um relatório de auditoria (`META-PHYSICAL-SMOKE-TEST-REPORT.md`) como nota de outro projeto acessível via MCP em outra conta. Nenhum arquivo de código, env, config ou edge function referencia esse ref.

4. **Existe mais de um projeto Supabase configurado?**
   **NÃO.** Há um único `createClient` no frontend, um único `project_id` em `supabase/config.toml`, um único `VITE_SUPABASE_URL` no `.env`. Sem `.env.local`, sem `.env.production`, sem multi-tenant de infra.

5. **Existe risco de deploy no projeto errado?**
   **BAIXO.** `supabase/config.toml` está fixado em `bgzczvsmfcnypwqveotx`; `supabase link` sem ref usa esse valor. O risco residual existe apenas se alguém rodar `supabase link --project-ref <outro>` manualmente.

---

## Referências cruzadas

- [DEPLOY-TARGET.md](./DEPLOY-TARGET.md)
- [META-PHYSICAL-SMOKE-TEST-REPORT.md](./META-PHYSICAL-SMOKE-TEST-REPORT.md)
- [MASTER-ROADMAP.md](./MASTER-ROADMAP.md) — seção *Infraestrutura Canonical*
