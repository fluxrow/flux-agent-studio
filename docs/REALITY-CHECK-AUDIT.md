# Flux Agent Studio — Reality Check Audit
## FASE 26Z.1 · O Produto Real vs. o Produto Imaginado

> Este documento foi produzido por leitura direta do código-fonte.
> Não consultou documentação de marketing, LP, vídeos ou posicionamento.
> Cada conclusão tem uma referência de arquivo.
>
> Criado em: 2026-06-04.

---

## Legenda de Status

| Status | Significado |
|---|---|
| **REAL** | Funciona de ponta a ponta com dados reais. Pode ser entregue a um cliente agora. |
| **PARCIAL** | A lógica existe e compila. Depende de configuração externa, env var não setada, ou tem camada mock que bloqueia a execução real. |
| **MOCK** | UI existe. Dados são fixos ou gerados internamente. Nenhuma chamada real acontece. |
| **ROADMAP** | Mencionado em documentação ou comentário de código. Nenhuma implementação. |

---

## 1. Instagram DM

**Status: MOCK**

`src/channels/stubs.ts` — `instagramChannel` é criado por `makeStub("instagram", "Instagram DM")`. O próprio comentário do arquivo diz: *"None of these talk to a real platform yet; they only emit channel events for visibility."*

A página `Channels.tsx` lista o canal Instagram com ícone e status, mas o status vem de `useChannels()` que, sem `VITE_USE_SUPABASE=true`, retorna dados mock de `src/mocks/`.

`src/inbox/sources.ts` — `ConversationSource` para instagram tem `status: "stub"` explícito, com nota: *"Real adapters will be wired in Phase 12+"*.

**O que existe de real:** o schema de tipos, o event bus que enregistra eventos simulados, a UI de listagem de canais.

**O que não existe:** qualquer chamada à API do Instagram (Meta Graph API), webhook de DM recebido, envio de mensagem real.

---

## 2. Facebook Messenger

**Status: MOCK**

Idêntico ao Instagram. `makeStub("messenger", "Messenger")` em `src/channels/stubs.ts`. Comentário em `src/inbox/sources.ts`: `status: "stub"`.

Nenhum arquivo de adapter Messenger real encontrado em `src/connectors/adapters/` ou `src/channels/`.

---

## 3. WhatsApp

**Status: MOCK**

`makeStub("whatsapp", "WhatsApp")` em `src/channels/stubs.ts`. Comentário explícito no arquivo: stubs emitem eventos para visibilidade, mas não falam com nenhuma plataforma real.

Nenhuma chamada à Meta Cloud API (v17+) ou Twilio WhatsApp foi encontrada no codebase.

O Connector Hub tem um adapter `telegram.ts` com fetch real (`api.telegram.org`), mas **nenhum adapter WhatsApp** equivalente existe.

**Impacto crítico:** WhatsApp é o canal principal de geração de leads no mercado brasileiro. Sem ele, o produto não resolve o problema principal do ICP-2 (PME com volume de inbound no WhatsApp).

---

## 4. Site Widget (Web)

**Status: REAL**

`src/channels/web.ts` — `webChannel` tem `status: "active"`. É o único adapter com status diferente de "stub".

O que funciona de verdade:
- `openSession()` cria sessão real e registra no `sessionRouter`
- `send()` chama `recordPublicMessage()` de `src/lib/public-runtime.ts` — persiste mensagens
- `receive()` persiste mensagem do usuário
- `PublicBot.tsx` executa o runtime de fluxo real contra os blocos configurados
- Publicação via `/bot/:slug` funciona e pode ser embarcada via iframe ou link direto

**Ressalva:** persistência depende de `VITE_USE_SUPABASE`. Com a variável não setada (padrão atual), dados ficam em memória e são perdidos no reload. Com `VITE_USE_SUPABASE=true` e Supabase configurado, persiste no banco.

---

## 5. CRM

**Status: PARCIAL**

**O que é real:**
- `src/intelligence/scorer.ts` — cálculo de score 0–100 é código funcional puro (sem mock). Usa 7 fatores: `completeness`, `source`, `campaign`, `interaction`, `answers`, `ai_classification`, `recency`. Pesos configuráveis.
- `src/intelligence/forecast.ts` — lógica de forecast existe (probabilidade + data estimada de fechamento + valor)
- `src/intelligence/summary.ts`, `recommendations.ts`, `insights.ts` — engines completas
- `src/domain/persistence/supabase/leadRepository.ts` — CRUD de leads contra Supabase existe

**O que é mock:**
- `VITE_USE_SUPABASE` **não está setado no `.env`** — portanto o app está rodando em modo mock por padrão
- `src/domain/persistence/index.ts` confirma: sem a variável, usa `coreMockRepositories` (dados em memória)
- `LeadIntelligencePanel.tsx` — o painel existe, mas os dados de score que aparecem são calculados sobre leads mock (não reais de conversas reais)
- `src/pages/Leads.tsx` — pipeline Kanban funciona visualmente, mas leads são os mocks

**Para ser REAL:** requer `VITE_USE_SUPABASE=true` + Supabase configurado + fluxo de bot publicado gerando leads via `CrmBridge`.

---

## 6. Lead Intelligence

**Status: PARCIAL**

O motor em si (`scorer`, `forecast`, `summary`, `recommendations`) é código real e funcional — sem mocks internos. Testável com qualquer objeto `Lead`.

O problema é o dado de entrada:

- Sem `VITE_USE_SUPABASE=true`, os leads são mock → o score calculado é real sobre dados falsos
- `src/components/intelligence/LeadIntelligencePanel.tsx` — referenciado no código, renderiza corretamente
- `src/pages/LeadDetail.tsx` — existe e integra o panel

**A inteligência existe. O pipeline de dados reais não está ativado.**

---

## 7. Revenue Attribution

**Status: MOCK**

`src/pages/Revenue.tsx` linha 1:
```
import { revenueSeries, aiCosts, aiInsights } from "@/lib/analytics-mock";
```
Todos os KPIs (R$ 184.2k, ROAS 4.8x, CAC R$42, LTV/CAC 8.2x) são constantes hardcoded em `src/lib/analytics-mock.ts`.

`src/pages/Attribution.tsx` linha 1:
```
import { attributionTouches, campaignPerf, sources } from "@/lib/analytics-mock";
```
Todos os dados de atribuição (canais, receita, modelos first-touch/last-touch) são mock.

**O motor de atribuição tem lógica real** em `src/intelligence/attribution.ts` — `buildAttributionRow()` e `summarizeAttribution()` são funções puras funcionais. Mas as páginas Revenue e Attribution **não usam esse motor** — consomem diretamente `analytics-mock`.

**O tracking de UTM é real** — `src/tracking/visitor.ts` captura `utm_source`, `utm_medium`, `utm_campaign` do `window.location.search` e persiste em `localStorage`. Mas o loop UTM → lead → receita **não está fechado nas páginas de visualização**.

---

## 8. Analytics

**Status: PARCIAL**

`src/pages/Analytics.tsx` — usa `useLeadsByStage()` e `useBots()` de `@/domain/hooks`. Esses hooks apontam para mock ou Supabase dependendo de `VITE_USE_SUPABASE`.

**Com mock (padrão atual):** os números de leads por estágio vêm de dados fictícios. O gráfico de tendência semanal é calculado distribuindo proporcionalmente os leads mock pelos 7 dias — não é série temporal real.

**Com Supabase ativo:** os counts de leads por estágio seriam reais. Ainda não há série temporal real de eventos (coluna de funil detalhada = roadmap).

---

## 9. Omnichannel Inbox

**Status: MOCK**

`src/pages/Conversations.tsx` linha 1:
```
import { conversations, sampleChat } from "@/lib/mock";
```
A lista de conversas e o chat exibido são completamente hardcoded em `src/lib/mock.ts`. O input de envio de mensagem existe visualmente mas não executa nenhuma lógica real.

`src/inbox/sources.ts` — define o schema de fontes, mas todos os canais além de `web` têm `status: "stub"`.

Não existe uma inbox unificada real. Não existe lógica de recebimento de mensagem de canal externo. Não existe handoff humano real.

---

## 10. AI Builder

**Status: PARCIAL — próximo de REAL**

`src/pages/AIBuilder.tsx` — chama `generateBlueprint()` e `materializeBlueprint()` de `src/ai-builder/`.

`src/ai-builder/generator.ts` — usa o `AI Block Engine` para gerar o blueprint.

**Problema crítico:** `src/ai/providers/index.ts` — todos os providers (OpenAI, Anthropic, Gemini) são instanciados via `buildMockProvider()`. O comentário no arquivo `_mock.ts` é explícito:

> *"Mock provider factory. All three Phase-12 stubs share this logic so the UI feels real (per-model latency, token counts, cost estimation) without any real network calls. Swap the body of `runMock` for a Lovable AI Gateway call to ship a real provider."*

Portanto: o AI Builder gera blueprints, mas as respostas de IA são **strings hardcoded simuladas** (`mockAnswerFor()`) — não chamadas reais à OpenAI ou Anthropic.

**O que funciona de verdade:**
- O blueprint gerado é materializado em um `Bot` real no domínio
- `materializeBlueprint()` cria um flow com blocos reais navegáveis no Builder
- O bot criado pode ser publicado e rodado no `PublicBot`

**O que não funciona:**
- A IA que "gera" o blueprint não é real — é um mock que retorna respostas pré-definidas
- `"Resposta gerada (mock). Esta é uma simulação até conectarmos o provider real."` — texto literal do mock

---

## 11. Follow-up

**Status: ROADMAP**

Nenhum módulo de follow-up, drip sequence, re-engajamento automático ou sequência de mensagens agendadas foi encontrado no codebase.

`src/lib/mock.ts` contém uma entrada na lista de atividades: `"enviou follow-up automático"` — mas é dado mock em uma lista estática, não funcionalidade real.

O único mecanismo de trigger existente é o runtime de fluxo — que responde a mensagens recebidas, mas não inicia conversas proativamente.

---

## 12. Calendar / Agendamento

**Status: ROADMAP**

`src/connectors/types.ts` lista `"calendar"` como tipo de conector possível (`ConnectorKind`), mas nenhum adapter de calendar foi implementado.

`src/tracking/destinations/google.ts` registra `"schedule_meeting"` como evento de tracking mapeável — apenas o evento, sem integração com Google Calendar, Calendly ou qualquer API de agenda.

Não existe nenhuma página, componente ou lógica de agendamento real.

---

## 13. Automações (Connectors / Workflows)

**Status: PARCIAL**

**O que é real:**
- `src/connectors/adapters/webhook.ts` — HTTP fetch real. Funciona.
- `src/connectors/adapters/googleSheets.ts` — usa `fetch` real contra `sheets.googleapis.com`. Requer token OAuth.
- `src/connectors/adapters/slack.ts` — HTTP real contra `slack.com/api`. Requer token.
- `src/connectors/adapters/telegram.ts` — HTTP real contra `api.telegram.org`. Requer bot token.
- `src/connectors/runtime/executor.ts` — executor com retry/backoff/fallback real

**O que é mock ou incompleto:**
- `src/connectors/builtins.ts` — comentário: *"Built-in connector manifests (mocked)"*
- Connector Hub não está conectado aos blocos do Builder Visual — não existe um "Conector Block" no canvas que chame o executor
- Stripe adapter: não encontrado em `src/connectors/adapters/` (mencionado em documentação, não implementado como adapter real)
- Sem `VITE_USE_SUPABASE`, credenciais são mock e nenhum conector executa de fato

---

## 14. White Label

**Status: ROADMAP**

Nenhuma página, painel ou funcionalidade de white-label foi encontrada no codebase.

A arquitetura multi-tenant com RLS existe (Supabase). O `WorkspaceProvider` isola dados por workspace. Mas não existe:
- Painel de gestão de múltiplos clientes por agência
- Customização de marca (logo, cores) por workspace
- Programa de parceria ou onboarding de agência
- Billing separado por cliente

A infraestrutura técnica suporta white-label futuro. A funcionalidade não existe.

---

## 15. Billing

**Status: ROADMAP**

Nenhuma página de billing, planos, assinatura ou pagamento foi encontrada no codebase.

Stripe aparece como conector (`src/connectors/adapters/`) mas apenas como destino de automação (ex: criar cobrança via Connector Hub), não como sistema de billing da própria plataforma.

Não existe:
- Tela de planos e preços
- Integração de subscription (Stripe Billing, Paddle, etc.)
- Controle de features por plano
- Limite de uso por tier
- Gestão de trial/pagamento

---

## 16. Usuários e Permissões

**Status: PARCIAL**

**O que é real:**
- `src/auth/WorkspaceProvider.tsx` — busca `workspace_members` no Supabase com roles (`owner`, `admin`, `member`)
- `src/auth/AdminRoute.tsx` — guarda rotas para `owner` ou `admin`
- Multi-tenant com RLS está arquitetado no Supabase

**O que não existe:**
- Página de convite de membros
- Gestão de roles via UI
- Permissões granulares por recurso (ex: "pode editar bots mas não ver receita")
- Audit log por usuário nas ações (existe o compliance audit log, mas não o de permissões)
- Sem `VITE_USE_SUPABASE=true`, autenticação não funciona e app roda como demo não autenticado

---

## Tabela de Prontidão Geral

| Área | Status | Pronto para cliente? | Maior bloqueio |
|---|---|---|---|
| **Instagram DM** | MOCK | ❌ | Meta Graph API não conectada |
| **Facebook Messenger** | MOCK | ❌ | Meta Graph API não conectada |
| **WhatsApp** | MOCK | ❌ | Meta Cloud API não conectada |
| **Site Widget (Web)** | REAL | ✅ com ressalva | VITE_USE_SUPABASE deve estar ativo para persistir |
| **CRM / Pipeline** | PARCIAL | ⚠️ | VITE_USE_SUPABASE desligado — dados em memória |
| **Lead Intelligence** | PARCIAL | ⚠️ | Motor real, dados de entrada mock |
| **Revenue Attribution** | MOCK | ❌ | Páginas Revenue e Attribution consomem analytics-mock |
| **Analytics** | PARCIAL | ⚠️ | Counts reais com Supabase; série temporal = roadmap |
| **Omnichannel Inbox** | MOCK | ❌ | Conversations.tsx usa dados hardcoded de lib/mock |
| **AI Builder** | PARCIAL | ⚠️ | UI real, blueprint gerado, mas IA é mock (sem LLM real) |
| **Follow-up / Drip** | ROADMAP | ❌ | Não existe nenhuma implementação |
| **Agendamento** | ROADMAP | ❌ | Não existe nenhuma implementação |
| **Automações (Connectors)** | PARCIAL | ⚠️ | Adapters HTTP reais, mas sem integração com Builder Canvas |
| **White Label** | ROADMAP | ❌ | Não existe nenhuma implementação |
| **Billing** | ROADMAP | ❌ | Não existe nenhuma implementação |
| **Usuários e Permissões** | PARCIAL | ⚠️ | Auth real no Supabase, sem UI de gestão de membros |

---

## O que realmente está funcionando hoje

Se um cliente acessasse o produto agora com `VITE_USE_SUPABASE=true`:

| Funcionalidade | Funciona de verdade |
|---|---|
| Criar conta e workspace | ✅ (Supabase Auth) |
| Criar bot no Builder Visual | ✅ |
| Publicar bot como link/QR | ✅ |
| Bot conversar com visitante (Web Widget) | ✅ |
| Lead aparecer no CRM ao final da conversa | ✅ (CRM Bridge) |
| Score de lead calculado | ✅ (lógica pura real) |
| Resumo IA de lead | ⚠️ (texto mock — provider não real) |
| Forecast de lead | ✅ (lógica pura real, baseada no score) |
| Tracking de UTM na URL | ✅ (captura real via localStorage) |
| Enviar webhook para sistema externo | ✅ (HTTP real) |
| Enviar para Google Sheets | ✅ (com OAuth token) |
| Enviar mensagem no Slack | ✅ (com Slack token) |
| Compliance LGPD (consent, audit logs) | ✅ |
| Autenticação e isolamento por workspace | ✅ |

---

## O que está sendo vendido mas não existe

| Promessa | Realidade |
|---|---|
| "Agentes no WhatsApp" | Stub — nenhuma conexão real com Meta API |
| "Instagram DM" | Stub — nenhuma conexão real |
| "Atribuição de receita real" | Páginas Revenue/Attribution consomem analytics-mock |
| "IA que qualifica leads automaticamente" | Motor existe, mas provider de IA é mock (retorna strings fixas) |
| "Conversas omnichannel em uma inbox" | Página usa dados hardcoded de lib/mock.ts |
| "Revenue Intelligence" | KPIs são constantes: R$184.2k, ROAS 4.8x — hardcoded |
| "Follow-up automático" | Não existe nenhum módulo |
| "Agendamento pelo bot" | Não existe nenhum módulo |
| "White label para agências" | Arquitetura multi-tenant existe; produto de agência não existe |
| "Billing e planos" | Não existe nenhuma implementação |

---

## Diagnóstico Final

**O produto tem uma arquitetura sólida e bem construída.** A separação em engines, o event bus, o CRM Bridge, o scorer de leads, o compliance layer — tudo isso é código real e bem escrito.

**O produto não tem os canais que resolvem o problema principal.** Sem WhatsApp real, sem Instagram real e sem IA real (providers são mock), o produto não consegue executar o loop que promete: "lead chega no WhatsApp → IA qualifica → entra no CRM".

**O produto está rodando em modo demo por padrão.** `VITE_USE_SUPABASE` não está setado. Isso significa que qualquer instância padrão do produto usa dados em memória — leads, bots, configurações somem no reload.

**Cinco mudanças que transformariam o produto de demo em real:**

1. Setar `VITE_USE_SUPABASE=true` e garantir que o Supabase está configurado → CRM, bots e sessões persistem
2. Conectar um provider de IA real (OpenAI/Anthropic) → AI Builder e AI Block param de retornar strings mock
3. Integrar Meta Cloud API para WhatsApp → canal principal do mercado BR funciona
4. Conectar Revenue/Attribution pages ao motor real (`buildAttributionRow`) → dados reais substituem analytics-mock
5. Conectar Conversations page a sessões reais do channel bus → inbox omnichannel funcional para o canal web

---

*Fonte: leitura direta do código-fonte em `/home/user/flux-agent-studio/src/`*
*Arquivos-chave: `channels/stubs.ts`, `channels/web.ts`, `ai/providers/index.ts`, `ai/providers/_mock.ts`, `knowledge/parsers.ts`, `pages/Revenue.tsx`, `pages/Attribution.tsx`, `pages/Conversations.tsx`, `domain/persistence/index.ts`, `.env`*
*Nenhum documento de marketing foi consultado.*

---

**Ver também:**
- `docs/MASTER-ROADMAP.md` — estado consolidado do projeto (entrada para qualquer IA ou dev)
- `docs/AI-BUILDER-REALITY.md` — auditoria aprofundada do AI Builder
- `docs/30-DAY-EXECUTION-PLAN.md` — plano de execução baseado nesta auditoria
- `docs/OPENAI-IMPLEMENTATION-PLAN.md` — plano técnico para resolver o P0 do provider mock
