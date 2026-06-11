# CI/CD e sincronização com Lovable

Pipeline alinhado com [`FLUXROW_GROWTH_HUB_PHASE_CHECKLISTS.md`](./FLUXROW_GROWTH_HUB_PHASE_CHECKLISTS.md).

## Visão geral

O repositório usa duas responsabilidades separadas:

1. `.github/workflows/ci.yml` valida typecheck, testes, build e a presença dos
   arquivos Supabase.
2. A integração GitHub do Lovable sincroniza para o projeto as mudanças
   enviadas à branch ativa, normalmente `main`.

O GitHub Actions não publica o frontend no Lovable.

## Workflows

### `.github/workflows/ci.yml`
| Job | Bloqueante | AC mapeado |
|---|---|---|
| `quality` | sim | typecheck + 13 testes + build |
| `backend-audit` | sim | migrations e Edge Functions versionadas |
| `lint-audit` | não | dívida histórica de lint |

Habilite branch protection em `main` exigindo o job `quality`.

## Publicação atual

- Frontend: push para a branch ativa do Lovable.
- Supabase migrations: aplicação controlada após revisão do SQL.
- Edge Functions: deploy controlado após configuração dos secrets.

Não existe staging Supabase validado neste momento. Por isso o repositório não
deve executar automaticamente todos os SQLs históricos a cada push. Quando o
staging existir, a automação deve usar o histórico de migrations da Supabase,
sem loops de `psql` sobre todos os arquivos.

## Configuração necessária

- No Lovable, confirmar que o repositório está conectado e `main` é a branch
  ativa.
- No GitHub, manter o app do Lovable com acesso ao repositório.
- No Supabase, configurar os secrets descritos em
  `PHASE-1-SECURITY-DEPLOY.md`.

## Gates por fase do roadmap

Cada fase do checklist adiciona um job ao pipeline conforme amadurece:

| Fase | Job a adicionar | Quando |
|---|---|---|
| 1 | já coberto (`ci.yml`) | hoje |
| 3 | `rls-isolation` (suíte multi-tenant) | quando `accounts/clients/brands` existirem |
| 4 | `context-snapshot-tests` | quando Context Engine for implementado |
| 6 | `connector-e2e` (Meta/WhatsApp sandbox) | quando adapters reais subirem |
| 7 | `metrics-lineage` (compara dashboard vs `events`) | quando MVs existirem |
| 8 | `pilot-smoke` (Promotrip / Cauã / 3º) | antes do go-live de cada piloto |

## Validação local executada em 11/jun/2026

- `npm run typecheck` — sem erros
- `npm test` — 13 testes verdes
- `npm run build` — bundle gerado
- `npm audit --omit=dev` — zero vulnerabilidades de produção
- lint global ainda possui dívida histórica e permanece não bloqueante

## Rollback

- Frontend: reverter o commit na branch ativa do Lovable.
- Migrations: exigir plano de reversão e backup antes da aplicação.
