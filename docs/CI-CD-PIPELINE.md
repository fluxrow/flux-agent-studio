# CI/CD — Pipeline com Gates por Fase

Pipeline alinhado com [`FLUXROW_GROWTH_HUB_PHASE_CHECKLISTS.md`](./FLUXROW_GROWTH_HUB_PHASE_CHECKLISTS.md).

## Visão geral

```
PR  ─►  ci.yml          (static · tests · backend-checks · pr-gate)
                            │
                            ▼  merge em main
        deploy.yml      preflight ─► deploy-staging ─► smoke-staging
                            ▲                              │
                            │                              ▼
                            └──── approve-prod (humano) ◄──┘
                                          │
                                          ▼
                                   deploy-prod ─► smoke-prod
```

## Workflows

### `.github/workflows/ci.yml` — toda PR
| Job | Bloqueante | AC mapeado |
|---|---|---|
| `static` | ✅ | §1.3 typecheck + build |
| `tests` | ✅ | §1.3 ≥ 13 testes |
| `backend-checks` | informativo | §1.4 migrations + edge functions |
| `pr-gate` | ✅ | consolida required checks |

Habilite **branch protection** em `main` exigindo `pr-gate`.

### `.github/workflows/deploy.yml` — push em main
| Gate | Tipo | AC mapeado |
|---|---|---|
| Preflight | automático | §1.3 reexecuta typecheck/test/build |
| Deploy staging | automático | §1.4 staging operacional |
| Smoke staging | automático | §1.2 escrita pública exige token + healthcheck |
| **Approve prod** | **humano** | gate de saída da fase |
| Deploy prod | automático após approval | — |
| Smoke prod | automático | healthcheck + flag de rollback |

## Configuração necessária no GitHub

### Environments (Settings → Environments)
1. **`staging`** — sem reviewers, deploy automático
2. **`production-approval`** — **required reviewers = 1+** (este é o gate humano)
3. **`production`** — opcional: deployment branches = `main` only

### Variables (Settings → Variables → Actions)
- `STAGING_URL` — ex.: `https://staging.fluxrow.app`
- `STAGING_SUPABASE_URL` — URL pública do projeto staging
- `PRODUCTION_URL` — ex.: `https://agent.studio.fluxrow.space`

### Secrets (Settings → Secrets → Actions)
- `STAGING_SUPABASE_URL`, `STAGING_SUPABASE_PUBLISHABLE_KEY`, `STAGING_SUPABASE_DB_URL`
- `PROD_SUPABASE_URL`, `PROD_SUPABASE_PUBLISHABLE_KEY`, `PROD_SUPABASE_DB_URL`

> Os secrets de `*_DB_URL` só são necessários enquanto migrations forem aplicadas via `psql`. Quando o ambiente staging Supabase existir (AC §1.4), trocar para `supabase db push`.

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

- ✅ `tsc --noEmit` — sem erros
- ✅ `bun run test` — 13 testes verdes
- ✅ `bun run build` — bundle gerado
- ⚠️ `bun run lint` — 71 erros + 23 warnings históricos (não bloqueante via warning no CI)

## Rollback

- Frontend: republicar artefato anterior (`actions/download-artifact` versão anterior).
- Migrations: cada migration deve ter `-- DOWN` documentado quando reversível; caso contrário, exigir aprovação extra no PR.
