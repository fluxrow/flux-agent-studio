# FluxBot

Plataforma white-label de criação de bots conversacionais com Runtime própria,
CRM, Tracking multi-destino, AI Block, Knowledge Base, AI Builder, Connector Hub
e Lead Intelligence — construída sobre uma arquitetura desacoplada onde Runtime,
CRM, Tracking, AI e Knowledge nunca conhecem uns aos outros diretamente.

## Stack

- **Frontend:** React 18 + Vite 5 + TypeScript 5 + Tailwind v3 + shadcn/ui
- **Backend:** Lovable Cloud (Supabase) — Auth, Postgres + RLS, Storage, Edge Functions
- **State / Data:** TanStack Query, repositórios desacoplados (mock ↔ Supabase via DI)
- **Testes:** Vitest + Testing Library

## Quick Start

```bash
npm install
npm run dev      # http://localhost:8080
npm run test     # vitest run
npm run build    # build de produção
npm run lint     # eslint
```

Toda configuração de backend (URL Supabase, anon key) é injetada automaticamente
pelo Lovable Cloud via `.env` — não edite esse arquivo manualmente.

## Arquitetura (visão rápida)

```
src/
├── runtime/         Runtime Engine (framework-agnóstica) + Event Bus
├── builder/         Editor visual de Flows
├── ai/              AI Block (providers plugáveis, schemas, runner)
├── ai-builder/      Geração de bots por linguagem natural (Phase 14)
├── knowledge/       Knowledge Base — chunking, embeddings, retrieval (Phase 13)
├── connectors/      Connector Hub — manifests, adapters, runtime (Phase 16-17)
├── intelligence/    Lead Intelligence — scoring, insights, forecast (Phase 18)
├── tracking/        Tracking Engine — visitor, destinations (Meta, Google…)
├── compliance/      Privacy / Consent / Audit Logs / Credentials (Phase 15)
├── channels/        Omnichannel bus (web, WhatsApp stub, Telegram stub…)
├── domain/          Persistence facade + repositórios (mock + Supabase)
├── oauth/           OAuth manager (Google etc.)
├── auth/            Auth + Workspace providers
├── renderers/       Renderização de blocos na conversa
├── pages/ · components/ · hooks/ · lib/ · types/
```

Princípios:

1. **Desacoplamento total** — Runtime não conhece CRM, CRM não conhece Tracking,
   AI não conhece Knowledge, Knowledge não conhece Connectors. Tudo conversa por
   eventos (`runtimeEventBus`) ou por contratos de domínio.
2. **DI por env flag** — `VITE_USE_SUPABASE` flipa toda a camada de persistência
   entre mocks e Supabase sem alterar uma linha de UI.
3. **Marketplace-ready** — Connectors, AI Providers e Embeddings usam manifestos
   declarativos prontos para virar plugins externos.
4. **Multi-tenant first** — todo dado é escopo de `workspace_id`, com RLS no
   Postgres e `has_workspace_role` / `is_workspace_member` security-definer.

Para o detalhamento completo de cada fase entregue, ver
[`fluxbot-features.md`](./fluxbot-features.md).

## Documentação

- [`ARCHITECTURE.md`](./docs/ARCHITECTURE.md) — diagramas e camadas
- [`CONTRIBUTING.md`](./CONTRIBUTING.md) — padrões de código, commits e PRs
- [`SECURITY.md`](./SECURITY.md) — política de segurança e disclosure
- [`CHANGELOG.md`](./CHANGELOG.md) — log de fases e mudanças
- [`docs/`](./docs) — guias por domínio (Runtime, AI, Knowledge, Connectors…)

## Licença

Proprietário — todos os direitos reservados. Ver [`LICENSE`](./LICENSE).
