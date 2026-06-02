# FluxBot — Architecture

> Visão de alto nível das camadas e dos fluxos entre elas. Para o detalhamento
> por fase entregue, ver [`../fluxbot-features.md`](../fluxbot-features.md).

## Princípio fundamental — Desacoplamento

Nenhuma engine conhece outra engine diretamente. Toda comunicação atravessa
**eventos** (`runtimeEventBus`) ou **contratos de domínio** (interfaces em
`src/domain/persistence/contracts.ts`).

```text
                ┌──────────────────────────────────────────────┐
                │                  UI (React)                  │
                │  pages/  components/  builder/  renderers/   │
                └───────────────┬──────────────────────────────┘
                                │
        ┌───────────────────────┼────────────────────────────────┐
        │                       │                                │
        ▼                       ▼                                ▼
  ┌──────────┐           ┌──────────────┐                ┌─────────────┐
  │ Runtime  │  events   │   AI Block   │  retrieval     │ Knowledge   │
  │ Engine   │◀────────▶│  + Providers │◀──────────────▶│   Base      │
  └────┬─────┘           └──────┬───────┘                └──────┬──────┘
       │ events                 │ events                        │ events
       ▼                        ▼                               ▼
  ┌──────────────────────  runtimeEventBus  ─────────────────────────┐
  │ runtime_* · ai_* · knowledge_* · tracking_* · crm_* · connector_*│
  └──────────┬──────────────┬──────────────┬─────────────┬───────────┘
             │              │              │             │
             ▼              ▼              ▼             ▼
        ┌────────┐    ┌──────────┐   ┌──────────┐  ┌────────────┐
        │  CRM   │    │ Tracking │   │Connector │  │Intelligence│
        │ Leads  │    │ Engine   │   │   Hub    │  │  (post)    │
        └────┬───┘    └────┬─────┘   └────┬─────┘  └─────┬──────┘
             │             │              │              │
             └─────────────┴──────┬───────┴──────────────┘
                                  ▼
                       ┌──────────────────────┐
                       │  Persistence facade  │
                       │  (mock ↔ Supabase)   │
                       └──────────┬───────────┘
                                  ▼
                       ┌──────────────────────┐
                       │   Lovable Cloud      │
                       │  Postgres + RLS +    │
                       │  Storage + Edge Fns  │
                       └──────────────────────┘
```

## Camadas

### 1. Runtime Engine (`src/runtime/`)
Execução framework-agnóstica de Flows. Não conhece React, CRM ou AI.
Emite eventos `runtime_*` no bus.

### 2. Builder (`src/builder/`, `pages/Builder.tsx`)
Editor visual. Serializa para o formato de Flow consumido pela Runtime.
`validator.ts` garante integridade antes do publish.

### 3. AI Block (`src/ai/`)
Providers plugáveis (`providers/`), schemas declarativos, runner unificado.
Não conhece Knowledge Base — recebe contexto via input.

### 4. Knowledge Base (`src/knowledge/`)
Parsers → chunker → embeddings → retriever → pipeline. Independente de
provider de AI (registry próprio de embeddings).

### 5. AI Builder (`src/ai-builder/`)
Gera Blueprints (Bot/Flow/CRM/Knowledge/Conversation) a partir de prompt.
Saída é compatível com Builder/Runtime existentes — não os altera.

### 6. Connector Hub (`src/connectors/`)
Manifests marketplace-ready + adapters reais + runtime executor com retry e
mapeamento de variáveis. Toda integração externa passa por aqui.

### 7. Tracking (`src/tracking/`)
Engine + destinations (Meta, Google, stubs). Visitor model próprio.
Consumido por eventos; nunca chamado direto pela Runtime.

### 8. CRM / Leads (`src/types/lead.ts`, `pages/Leads.tsx`, `pages/LeadDetail.tsx`)
Persistido via repositórios. Reage a eventos de captura emitidos pela Runtime.

### 9. Intelligence (`src/intelligence/`)
Camada **pós-captura**. Lê CRM + Tracking + Histórico e produz scoring,
summary, insights, recommendation, forecast e attribution.

### 10. Compliance (`src/compliance/`)
Privacy Center, Consent, Audit Logs, Credentials, Readiness — base para
aprovação Meta/Google.

### 11. Channels (`src/channels/`)
Bus omnichannel (web ativo; WhatsApp/Telegram/IG como stubs prontos).

### 12. Persistence (`src/domain/`)
Facade única. `VITE_USE_SUPABASE` decide entre mocks (`mock/`) e adapters
Supabase (`supabase/`). Multi-tenant via `workspaceContext`.

## Multi-tenant & Segurança

- Toda tabela `public.*` tem RLS + `GRANT` explícito.
- Roles em `user_roles` (nunca no profile), validadas por
  `has_workspace_role(uuid, app_role)` (security definer).
- Auth: email/senha + Google (OAuth).
- Segredos: Lovable Cloud Secrets — nunca em `VITE_*`.

## Fluxo de uma mensagem (exemplo)

1. Usuário envia mensagem em `/c/:slug` (`PublicBot.tsx`).
2. `ConversationFrame` chama Runtime → `engine.advance(session, input)`.
3. Runtime emite `runtime_block_executed`. Knowledge é consultada pelo AI Block
   (quando o bloco for AI). Tracking, CRM e Intelligence consomem eventos
   relevantes em paralelo via bus.
4. Persistence grava sessão/eventos/leads (mock ou Supabase).
5. Connectors são executados quando um bloco Connector aparece no Flow.

## Adicionando uma nova integração

1. Criar `ConnectorManifest` (declarativo) em `src/connectors/builtins.ts`.
2. Implementar `ConnectorAdapter` em `src/connectors/adapters/<name>.ts`.
3. Registrar no `adapters/registry.ts`.
4. Pronto — UI, credenciais, inspector e Builder funcionam automaticamente.

Nenhuma alteração em Runtime, AI, CRM, Tracking, Knowledge ou Intelligence
é necessária.
