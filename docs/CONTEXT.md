# Flux Agent Studio — Contexto de Engenharia

> **Conversational Revenue OS para empresas brasileiras.**
> Arquivo canônico. Qualquer IA ou desenvolvedor deve ler este arquivo antes de qualquer intervenção no código.
> Última atualização: 2026-06-17 (leitura profunda do repositório)
> Fonte máxima de verdade do produto: `docs/PRODUCT-CONSTITUTION.md`

---

## O que é este projeto

**Flux Agent Studio** é um Conversational Revenue OS — o sistema operacional que transforma conversas em receita mensurável para empresas brasileiras.

O loop central:
```
CONVERSA → QUALIFICAÇÃO → CRM → RECEITA
(canal)     (IA + score)   (nativo)  (atribuída à origem)
```

**Posição no mercado:**
- Não é chatbot (não responde FAQ)
- Não é builder de formulários
- Não é CRM (embora tenha CRM nativo)
- É a camada que faz chatbot, CRM, rastreamento e canais funcionarem juntos

**Problema central resolvido:** lead quente chega via WhatsApp, ninguém responde, esfria. Ou responde mas não registra. Ou registra mas não atribui à campanha. O Flux fecha esse loop automaticamente.

**ICPs primários:**
1. Agência Digital com clientes de performance — ticket R$1.500–5.000/mês
2. PME de serviços (imobiliária, clínica, educação, consórcio) — ticket R$300–800/mês
3. Gestor Comercial de SaaS — ticket R$1.000–4.000/mês

---

## Stack Tecnológica

| Camada | Tecnologia | Observação |
|---|---|---|
| Framework | **React 18 + Vite** | SPA puro (NÃO TanStack Start, NÃO Next.js) |
| Roteamento | **react-router-dom v6** | `BrowserRouter` + `Routes` em `App.tsx` |
| UI | **Tailwind CSS v3 + shadcn/ui** | 40+ componentes Radix. `tailwind.config.ts` na raiz |
| Animações | **framer-motion** | Transições de página e micro-animações |
| Estado servidor | **TanStack Query** | `useQuery` + `useMutation` |
| Formulários | **React Hook Form + Zod** | |
| Gráficos | **Recharts** | Dashboard e analytics |
| BaaS | **Supabase** | PostgreSQL + Auth + RLS + Edge Functions |
| Auth | **Supabase Auth + @lovable.dev/cloud-auth-js** | Multi-tenant por workspace |
| Deploy | **Lovable → Cloudflare** | Vite build → Cloudflare Pages |
| Runtime | **npm** (package-lock.json presente) | NÃO é Bun como no Dr. Flux |
| Build tool | **Vite 5 + @vitejs/plugin-react-swc** | vite.config.ts na raiz |
| Testes | **Vitest + @testing-library/react** | `vitest.config.ts` na raiz |
| Supabase Ref | **bgzczvsmfcnypwqveotx** | Único projeto (sem prod/dev separados) |
| Fases de AI | **Lovable AI Gateway** | `openai.ts` aponta para gateway Lovable (Gemini 3 Flash / GPT-5) |

---

## Arquitetura

### Estrutura de pastas

```
src/
  ai/               # AI Block Engine
    providers/      # openai.ts (real via Lovable AI Gateway), _mock.ts, dify.ts
    runner.ts       # Ponto único de execução de blocos IA
    registry.ts     # Registro de providers (DEFAULT_PROVIDER = openai)
    inspector.ts    # Rastreamento de runs + custo
  ai-builder/       # AI Builder (geração de bot por prompt)
    generator.ts    # Heurísticas + OpenAI para gerar blueprint
  builder/          # Builder Visual
    BuilderContext.tsx  # Canvas drag-drop, undo/redo, autosave
  channels/         # Canal bus omnichannel
    bus.ts          # channelBus → espelha para runtimeEventBus
    web.ts          # status: "active" — único canal não-stub
    meta/           # whatsapp.ts, instagram.ts, messenger.ts (100% implementados, deploy pendente)
  compliance/       # LGPD nativa: Consent, Audit Logs, Privacy Center, Data Deletion
  connectors/       # Connector Hub
    adapters/       # webhook.ts, googleSheets.ts, slack.ts, telegram.ts (reais)
    builtins.ts     # Manifests dos connectors built-in
    runtime/        # executor.ts — retry + backoff + fallback
  domain/           # Persistence facade
    index.ts        # Hoje: todos mockXRepository. Wiring futuro para supabaseXRepository
    mock/           # Implementações in-memory (botRepository, flowRepository, etc.)
  intelligence/     # Lead Intelligence
    scorer.ts       # Score 0–100, 7 fatores, lógica pura
    forecast.ts     # Probabilidade + data estimada + valor de receita
    attribution.ts  # Motor de atribuição (existe, mas Revenue.tsx não usa)
  knowledge/        # Knowledge Base RAG
    chunker.ts      # Chunking de documentos
    embeddings/     # Provedores de embeddings (hash-based como mock)
    retriever.ts    # Cosine similarity search
    pipeline.ts     # Parser → chunker → embeddings → store
  lib/
    runtime-config.ts   # USE_SUPABASE = VITE_USE_SUPABASE ?? true
    crm-bridge.ts       # Auto-captura lead após conversa (real)
    mock.ts             # Dados fictícios para Conversations, etc.
    analytics-mock.ts   # KPIs hardcoded para Revenue.tsx e Attribution.tsx
  oauth/            # OAuth Manager (Google Calendar, futuramente outros)
  pages/            # ~35 páginas (Dashboard, Bots, Builder, Leads, etc.)
  runtime/          # Runtime Engine
    engine.ts       # Pure TS, sem React/DOM. Executa flow step-by-step
    events.ts       # runtimeEventBus — barramento central de eventos
    interpolate.ts  # Substituição de variáveis {{varName}} em strings
    conditions.ts   # Avaliação de condições de branches
  tracking/         # Tracking Engine
    visitor.ts      # UTM tracking em localStorage (real)
    engine.ts       # Tracking Engine principal
    destinations/   # Meta CAPI, GA4 (configurados via Supabase)
  integrations/
    supabase/
      client.ts     # createClient único — NÃO duplicar
      types.ts      # Tipos gerados. Regenerar com: supabase gen types typescript
supabase/
  functions/        # 8 Edge Functions (Deno)
    calendar-sync, calendar-watch-refresh, calendar-webhook
    google-oauth-callback
    lovable-ai          # Proxy para Lovable AI Gateway
    meta-webhook        # Recebe webhooks Meta (WhatsApp/IG/Messenger)
    meta-send           # Envia mensagens via Meta CAPI
    meta-verify-connection
  migrations/       # 15 migrations SQL (Jun/2026)
  config.toml       # project_id = bgzczvsmfcnypwqveotx
docs/               # 60+ documentos. PRODUCT-CONSTITUTION.md = fonte máxima
```

### Padrão crítico: Persistence Mode (USE_SUPABASE)

```typescript
// src/lib/runtime-config.ts
export const USE_SUPABASE: boolean =
  String(import.meta.env.VITE_USE_SUPABASE ?? "true").toLowerCase() === "true";
```

**Cuidado:** o default é `true` NO CÓDIGO, mas o `.env` atual **NÃO TEM** `VITE_USE_SUPABASE` setado.
Como resultado, o app pode cair em estados inconsistentes onde `USE_SUPABASE = true` mas
o Supabase não está conectado corretamente. Sempre verificar `.env` antes de desenvolver.

**Switch do domain layer:** `src/domain/index.ts` ainda aponta para `mockXRepository` em todos os 7 repositórios,
**independente** do valor de `USE_SUPABASE`. A migração precisa ser feita manualmente por repositório.

### Runtime Engine (src/runtime/engine.ts)

```
RuntimeEngine
  ├── Pure TypeScript (zero React, zero DOM, zero network)
  ├── Executa um Flow step a step via runBlock(block)
  ├── Emite eventos para runtimeEventBus (EngineEvent)
  ├── Publica/consome via channelBus (espelhado para runtimeEventBus)
  └── Portável para servidor (Node, Edge, Supabase Functions) sem mudanças
```

Componentes que consomem: `BuilderContext`, `PublicBot`, `Simulator`, `AIPlayground`

### 9 Engines Desacopladas via runtimeEventBus

| Engine | Módulo chave | Status real |
|---|---|---|
| Runtime Engine | `src/runtime/engine.ts` | ✅ REAL |
| Builder Visual | `src/builder/BuilderContext.tsx` | ✅ REAL |
| AI Block Engine | `src/ai/runner.ts` + `providers/openai.ts` | ✅ REAL (requer `VITE_OPENAI_API_KEY`) |
| Knowledge Base (RAG) | `src/knowledge/` | ⚠️ PARCIAL (persistência instável) |
| AI Builder | `src/ai-builder/generator.ts` | ⚠️ PARCIAL (gera blueprint; persiste?) |
| Connector Hub | `src/connectors/` | ✅ REAL (4 adapters HTTP funcionais) |
| Tracking Engine | `src/tracking/` | ✅ REAL (UTM capturado) |
| Lead Intelligence (CRM) | `src/intelligence/` | ✅ REAL (motor; dados dependem de Supabase) |
| Compliance LGPD | `src/compliance/` | ✅ REAL |

---

## Decisões Arquiteturais (ADRs)

| Data | Decisão | Motivo |
|---|---|---|
| 2026-06-04 | React 18 + Vite SPA em vez de SSR | Gerado pelo Lovable. Não reverter. |
| 2026-06-04 | Supabase para auth + banco + RLS | Multi-tenant por workspace via RLS |
| 2026-06-04 | `USE_SUPABASE` como switch de persistence layer | Permite demo funcional sem Supabase |
| 2026-06-04 | `src/domain/index.ts` como facade de repositórios | Zero acoplamento direto ao Supabase nas páginas |
| 2026-06-04 | `runtimeEventBus` como barramento central | Desacopla Runtime, Tracking, Inspector e Canal |
| 2026-06-04 | Lovable AI Gateway como proxy IA | OpenAI/Gemini sem expor keys no bundle |
| 2026-06-05 | PRODUCT-CONSTITUTION.md como fonte máxima | Conflito entre docs: PRODUCT-CONSTITUTION prevalece |
| 2026-06-09 | Edge Functions para Meta webhooks | Secrets no servidor, não no bundle |
| 2026-06-17 | Docs como symlink no Obsidian | `~/workspaces/flux-agent-studio/docs` ↔ `Fluxrow/flux-agent-studio/Docs_Engenharia` |

---

## Status das Features (auditoria 2026-06-05)

### ✅ REAL — Funciona ponta a ponta

| Módulo | Arquivo chave |
|---|---|
| Runtime Engine | `src/runtime/engine.ts` |
| Builder Visual | `src/builder/BuilderContext.tsx` |
| Web Widget (canal) | `src/channels/web.ts` — status: "active" |
| PublicBot | `src/pages/PublicBot.tsx` — rota `/bot/:slug` |
| Lead Intelligence (motor) | `src/intelligence/scorer.ts` (score 0–100, 7 fatores) |
| Forecast de lead | `src/intelligence/forecast.ts` |
| CRM Bridge (auto-captura) | `src/lib/crm-bridge.ts` |
| UTM Tracking | `src/tracking/visitor.ts` |
| Connector: Webhook | `src/connectors/adapters/webhook.ts` |
| Connector: Google Sheets | `src/connectors/adapters/googleSheets.ts` |
| Connector: Slack | `src/connectors/adapters/slack.ts` |
| Connector: Telegram | `src/connectors/adapters/telegram.ts` |
| Connector Executor | `src/connectors/runtime/executor.ts` (retry + backoff) |
| Compliance LGPD | `src/compliance/` |
| Multi-tenant RLS | `src/auth/WorkspaceProvider.tsx` |

### ⚠️ PARCIAL — Lógica existe, algo bloqueia

| Módulo | O que funciona | Bloqueio |
|---|---|---|
| CRM / Pipeline | Schema, kanban, estágios | `domain/index.ts` aponta para mock (não Supabase) |
| AI Block Engine | Schema, runner, inspector, cost tracking | `src/ai/providers/openai.ts` usa Lovable Gateway — requer `VITE_OPENAI_API_KEY` |
| AI Builder | Gera blueprint, UI completa | Mesma chave OpenAI |
| Knowledge Base | Chunking, cosine retrieval | Embeddings são hash-based (mock). Persistência Supabase instável |
| Analytics | Contagem de leads/bots | Série temporal = hardcoded em `analytics-mock.ts` |
| Google Calendar | OAuth por usuário, criar/atualizar/cancelar eventos, Meet, freeBusy, sync | Requer `VITE_GCAL_CLIENT_ID` + `supabase db push` + deploy 4 Edge Functions |
| Meta Channels (WA/IG/Messenger) | Código 100% implementado (FASE 27A.4–28D). Zero erros de build | Deploy pendente (`supabase functions deploy`) + criação de Meta App + tokens reais |

### ❌ MOCK — UI existe, dados são hardcoded

| Módulo | Evidência no código |
|---|---|
| Revenue Attribution | `Revenue.tsx:1` → `import ... from "@/lib/analytics-mock"` (KPIs = R$184.2k, ROAS 4.8x) |
| Attribution page | `Attribution.tsx:1` → `import ... from "@/lib/analytics-mock"` |
| Conversations / Inbox | `Conversations.tsx:1` → `import { conversations } from "@/lib/mock"` |
| Anthropic provider | `src/ai/providers/index.ts` → `buildMockProvider()` |
| Gemini provider | `src/ai/providers/index.ts` → `buildMockProvider()` |
| Domain repositories | `src/domain/index.ts` → todos 7 repositórios apontam para `mock/` |

### 📋 ROADMAP — Mencionado em docs, zero código

| Módulo | Observação |
|---|---|
| Follow-up / Drip sequences | Apenas mencionado em mock data |
| Billing / Planos | Stripe como connector externo, não billing da plataforma |
| Templates marketplace | `builtins.ts` marcado como mocked |
| A/B testing de flows | Não existe |
| Convite de membros (UI) | Auth real no Supabase. UI = não existe |
| White-label enterprise | Multi-tenant pronto. Painel de gestão = não existe |

---

## Modelo de Dados Supabase

**Projeto Ref:** `bgzczvsmfcnypwqveotx`

Principais tabelas identificadas pelas migrations (Jun/2026):

| Tabela | Propósito |
|---|---|
| workspaces | Raiz do tenant |
| bots | Bots criados por workspace |
| flows | Flows versionados por bot |
| leads | Leads capturados. Score + temperatura + forecast |
| conversations | Sessões por lead + canal |
| messages | Mensagens individuais com channel_id |
| tracking_events | UTM + eventos de sessão |
| attribution_touchpoints | Pontos de contato (UTM → lead → conversão) |
| knowledge_bases | Knowledge Bases por workspace |
| knowledge_documents | Documentos indexados |
| knowledge_chunks | Chunks para retrieval |
| user_calendar_tokens | Tokens OAuth Google Calendar por usuário |
| calendar_events | Eventos Google Calendar sincronizados |
| calendar_watch_channels | Watch channels para push updates |
| meta_connections | Conexões Meta (WA/IG/Messenger) por workspace |
| meta_messages | Mensagens recebidas/enviadas via Meta |

---

## Blockers Críticos (por ordem de impacto)

| # | Blocker | Fix | Esforço |
|---|---|---|---|
| 1 | `VITE_USE_SUPABASE=true` não está no `.env` | Adicionar ao `.env.local` | 5 min |
| 2 | `src/domain/index.ts` usa mocks — dados somem | Trocar `mockBotRepository` → `supabaseBotRepository` | 4–8h por repositório |
| 3 | `VITE_OPENAI_API_KEY` não configurada | Adicionar ao `.env.local` | 5 min |
| 4 | Supabase migrations não rodadas localmente | `supabase link && supabase db push` | 1–2h |
| 5 | Edge Functions não deployadas | `supabase functions deploy meta-webhook meta-send` | 30min |
| 6 | Meta App não criado | Criar app no Meta Business Manager | 4–8h burocracia |
| 7 | `Revenue.tsx` e `Attribution.tsx` consomem analytics-mock | Conectar a `src/intelligence/attribution.ts` | 4–8h |
| 8 | `Conversations.tsx` consome lib/mock | Conectar ao channel bus real | 4–6h |

---

## Erros Conhecidos / Gotchas

| Gotcha | Detalhe |
|---|---|
| `domain/index.ts` ≠ `USE_SUPABASE` | O switch `USE_SUPABASE` controla o comportamento das páginas, mas o domain layer (`domain/index.ts`) usa SEMPRE mock. São camadas independentes. |
| `VITE_` prefix expõe key no bundle | `VITE_OPENAI_API_KEY` ficará visível no bundle JavaScript em produção. Para beta interno: aceitável. Para produção pública: mover lógica para Edge Function. |
| `runtimeEventBus` é singleton | Um bug que emite evento errado afeta Runtime, Tracking E Inspector simultaneamente. |
| `src/ai/providers/openai.ts` usa Lovable Gateway | O nome do arquivo é `openai.ts`, mas o endpoint real é o gateway da Lovable (`lovable-ai` Edge Function), que roteia para Gemini/GPT. Não é a OpenAI API direta. |
| Knowledge Base embeddings são hash-based | `embeddings/` usa um hash simples como vetor. Cosine similarity funciona, mas a qualidade de retrieval é baixa. Para produção real, precisa de embedding real (OpenAI `text-embedding-3-small`). |
| `PublicBot` é o único ponto de entrada real de leads | Qualquer teste de geração de leads deve passar por `/bot/:slug`. |
| Meta channels: zero runtime cost se não deployadas | WhatsApp/Instagram/Messenger têm 100% do código mas não funcionam sem: (a) deploy das Edge Functions, (b) Meta App aprovado, (c) tokens configurados. |

---

## Variáveis de Ambiente

```bash
# Supabase (já no .env via Lovable)
VITE_SUPABASE_URL=https://bgzczvsmfcnypwqveotx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
VITE_SUPABASE_PROJECT_ID=bgzczvsmfcnypwqveotx

# Persistence switch (CRÍTICO — adicionar ao .env.local)
VITE_USE_SUPABASE=true

# IA via Lovable AI Gateway (CRÍTICO — adicionar ao .env.local)
VITE_OPENAI_API_KEY=sk-...   # Roteado para Lovable Gateway, não OpenAI direto

# Google Calendar OAuth (Sprint 3)
VITE_GCAL_CLIENT_ID=...

# Meta (WhatsApp / Instagram / Messenger)
# Configurados como Supabase Secrets nas Edge Functions:
# META_APP_ID, META_APP_SECRET, META_WEBHOOK_VERIFY_TOKEN
```

---

## Como Rodar Localmente

```bash
npm install
npm run dev          # Vite dev server

# Supabase CLI (necessário para Edge Functions e migrations)
supabase link --project-ref bgzczvsmfcnypwqveotx
supabase db push     # Roda todas as migrations

# Deploy Edge Functions (WhatsApp, Calendar, etc.)
supabase functions deploy meta-webhook --no-verify-jwt
supabase functions deploy meta-send
supabase functions deploy google-oauth-callback
supabase functions deploy calendar-sync
supabase functions deploy calendar-webhook
supabase functions deploy calendar-watch-refresh
supabase functions deploy lovable-ai
supabase functions deploy meta-verify-connection

# Testes
npm test
npm run typecheck
```

---

## Roadmap por Sprint (30-DAY-EXECUTION-PLAN.md)

| Sprint | Período | Objetivo | P0 |
|---|---|---|---|
| Sprint 1 | D1–D7 | Acender o motor — produto para de ser demo | `VITE_USE_SUPABASE=true` + OpenAI key + Revenue/Conv sem mock |
| Sprint 2 | D8–D14 | Desbloquear @vemfarias como primeiro usuário real | Bot de qualificação + UTM + Google Calendar como bloco |
| Sprint 3 | D15–D21 | Desbloquear cliente beta pagante | Submissão Meta WhatsApp + Templates verticais + Onboarding 5 passos |
| Sprint 4 | D22–D30 | Desbloquear receita recorrente | Motor de follow-up nativo + Dashboard ROI real + WhatsApp adapter |

**Critério de beta:** bot criado persiste, lead aparece no CRM com score real, Revenue não mostra R$184.2k hardcoded.

---

## Documentos Importantes em /docs

| Arquivo | O que contém |
|---|---|
| `PRODUCT-CONSTITUTION.md` | ⭐ Fonte máxima de verdade. Missão, produto, ICP, o que nunca ser |
| `MASTER-ROADMAP.md` | Estado real do produto + sprints |
| `REALITY-CHECK-AUDIT.md` | Auditoria completa módulo por módulo |
| `AI-BUILDER-REALITY.md` | Auditoria do AI Builder |
| `SUPABASE-REALITY.md` | Config real do Supabase |
| `META-CHANNELS-IMPLEMENTATION-REPORT.md` | Status completo WhatsApp/Instagram/Messenger |
| `GOOGLE-CALENDAR-REALITY.md` | Status FASE 28C — Google Calendar |
| `30-DAY-EXECUTION-PLAN.md` | Plano tático com P0/P1/P2 |
| `COMPETITIVE-WARFARE.md` | Battlecards vs concorrentes |

---

## Links

- Repo: https://github.com/fluxrow/flux-agent-studio
- Supabase: https://supabase.com/dashboard/project/bgzczvsmfcnypwqveotx
- Docs no Obsidian: ~/Documents/Fluxrow/flux-agent-studio/Docs_Engenharia
- PublicBot (exemplo): `/bot/:slug`
