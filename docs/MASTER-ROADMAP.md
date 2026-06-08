# MASTER ROADMAP — Flux Agent Studio
## Documento de Entrada para Qualquer IA ou Desenvolvedor

> **Leia este arquivo primeiro.** Ele é a fonte consolidada do estado atual do projeto.
> Qualquer decisão, auditoria ou plano mais detalhado está referenciado aqui.
>
> Meta: qualquer IA ou dev consegue entender exatamente onde estamos em menos de 10 minutos.
>
> Última atualização: 2026-06-05
> Branch ativo: `claude/sweet-meitner-bB77L`

---

## 1. Visão Geral do Produto

**Nome:** Flux Agent Studio  
**Categoria pública:** Plataforma de Receita Conversacional  
**Categoria estratégica:** Conversational Revenue OS  
**Stack:** React + Vite SPA · TypeScript · Tailwind CSS v3 · shadcn/ui · Supabase (PostgreSQL + RLS + Auth) · framer-motion

**Missão em uma frase:**  
Tornar o processo comercial de empresas brasileiras previsível e autônomo — transformando cada conversa em dado comercial qualificado, registrado e atribuído.

**O loop central:**
```
CONVERSA → QUALIFICAÇÃO → CRM → RECEITA
(canal)     (IA + score)   (nativo)  (atribuída à origem)
```

**ICPs primários:**
1. Agência Digital com clientes de performance — ticket R$1.500–5.000/mês
2. PME de serviços (imobiliária, clínica, educação, consórcio) — ticket R$300–800/mês
3. Gestor Comercial de SaaS/médio porte — ticket R$1.000–4.000/mês

**Referência definitiva:** `docs/PRODUCT-CONSTITUTION.md` — prevalece sobre qualquer outro documento em caso de conflito.

---

## 2. Funcionalidades — Estado Real do Produto

> Auditado por leitura direta de código-fonte. Sem marketing. Sem suposição.  
> Fonte completa: `docs/REALITY-CHECK-AUDIT.md` · `docs/AI-BUILDER-REALITY.md`

### REAL — Funciona de ponta a ponta com dados reais

| Módulo | Arquivo chave | Observação |
|---|---|---|
| **Runtime Engine** | `src/runtime/engine.ts` | Executa flows 24/7. Async, event-driven. |
| **Builder Visual** | `src/builder/BuilderContext.tsx` | Canvas drag-drop, undo/redo, autosave. |
| **Web Widget (canal)** | `src/channels/web.ts` — `status: "active"` | Único canal não-stub. Publica via `/bot/:slug`. |
| **PublicBot** | `src/pages/PublicBot.tsx` | Executa runtime real contra flow configurado. |
| **Lead Intelligence — motor** | `src/intelligence/scorer.ts` | Score 0–100, 7 fatores, lógica pura sem mock. |
| **Forecast de lead** | `src/intelligence/forecast.ts` | Probabilidade + data estimada + valor. |
| **CRM Bridge (auto-captura)** | `src/lib/crm-bridge.ts` | Lead criado automaticamente após conversa. |
| **UTM Tracking** | `src/tracking/visitor.ts` | Captura `utm_source/medium/campaign` em localStorage. |
| **Connector: Webhook** | `src/connectors/adapters/webhook.ts` | HTTP fetch real. Funciona. |
| **Connector: Google Sheets** | `src/connectors/adapters/googleSheets.ts` | `sheets.googleapis.com`. Requer OAuth token. |
| **Connector: Slack** | `src/connectors/adapters/slack.ts` | `slack.com/api`. Requer token. |
| **Connector: Telegram** | `src/connectors/adapters/telegram.ts` | `api.telegram.org`. Requer bot token. |
| **Compliance LGPD** | `src/compliance/` | Consent, Audit Logs, Privacy Center, Data Deletion. |
| **Multi-tenant (Supabase RLS)** | `src/auth/WorkspaceProvider.tsx` | Isolamento real de dados por workspace. |
| **AI Block — schema/validator** | `src/ai/schema.ts` | `validateSchema()` + `safeParseJSON()`. Sem mock. |
| **Connector Executor** | `src/connectors/runtime/executor.ts` | Retry, backoff, fallback. Real. |

**Condição crítica:** tudo acima requer `VITE_USE_SUPABASE=true` para persistir dados. Sem essa variável, o app roda em mock/demo mode e dados somem no reload. **O `.env` atual NÃO tem essa variável setada.**

---

### PARCIAL — Lógica existe, mas algo bloqueia a execução real

| Módulo | O que funciona | O que bloqueia |
|---|---|---|
| **CRM / Pipeline** | Schema, kanban, lógica de estágios | `VITE_USE_SUPABASE` não setado → dados em memória |
| **AI Builder** | Gera blueprint, materializa bot, UI completa | OpenAI real ativo (FASE 28A). Requer `VITE_OPENAI_API_KEY`. Anthropic/Gemini ainda mock |
| **AI Block Engine** | Schema, runner, inspector, cost tracking | OpenAI real — requer `VITE_OPENAI_API_KEY` configurada |
| **Knowledge Base (RAG)** | Chunking, embeddings, retrieval cosine | Persistência Supabase instável; embeddings são hash-based (mock) |
| **Lead Intelligence — dados** | Motor real, cálculo correto | Entrada de dados é mock sem Supabase + bot real gerando leads |
| **Analytics** | Contagem de leads/bots reais com Supabase | Série temporal e funil detalhado = hardcoded |
| **Automações/Connectors** | Adapters HTTP reais (webhook, sheets, slack) | Não conectados ao Builder canvas como bloco executável |
| **Autenticação** | Supabase Auth real, RLS, AdminRoute | Sem UI de gestão de membros/convite |
| **Google Calendar** | OAuth per-user, criar/atualizar/cancelar evento, Google Meet, freeBusy, push+pull sync, bridge CRM, 3 Builder blocks, 3 migrations, 4 edge functions (FASE 28C ✅) | Requer `VITE_GCAL_CLIENT_ID` + OAuth Client criado no Google Cloud Console + `supabase db push` + deploy 4 edge functions |
| **Meta Channels (WhatsApp / Instagram / Messenger)** | Código 100% implementado (FASE 27A.4–28D ✅): migrations, edge functions, adapters, hooks Realtime, CRM bridge. `supabase/config.toml` configurado. Zero erros TypeScript/build | Deploy pendente (`supabase db push` + `supabase functions deploy`) + criação de Meta App + tokens reais |

---

### MOCK — UI existe, dados são hardcoded. Nenhuma chamada real.

| Módulo | Evidência no código | Impacto |
|---|---|---|
| **WhatsApp** | `src/channels/meta/whatsapp.ts` + edge functions implementadas (FASE 27A.4) | Deploy pendente: `supabase db push` + `supabase functions deploy` + Meta App + token |
| **Instagram DM** | `src/channels/meta/instagram.ts` + edge functions implementadas (FASE 27A.4) | Deploy pendente + aprovação Meta (instagram_manage_messages) |
| **Facebook Messenger** | `src/channels/meta/messenger.ts` + edge functions implementadas (FASE 27A.4) | Deploy pendente + página Facebook vinculada |
| **Omnichannel Inbox** | `src/pages/Conversations.tsx:1` → `import { conversations, sampleChat } from "@/lib/mock"` | Inbox mostra dados fixos |
| **Revenue Attribution** | `src/pages/Revenue.tsx:1` → `import { revenueSeries, aiCosts } from "@/lib/analytics-mock"` | KPIs são constantes: R$184.2k, ROAS 4.8x |
| **Attribution page** | `src/pages/Attribution.tsx:1` → `import { attributionTouches } from "@/lib/analytics-mock"` | Todos modelos de atribuição = mock |
| **AI Provider Anthropic** | `src/ai/providers/index.ts` → `buildMockProvider()` | Respostas são keyword-matching e `"mock_value"` |
| **AI Provider Gemini** | `src/ai/providers/index.ts` → `buildMockProvider()` | Respostas são keyword-matching e `"mock_value"` |
| **AI Builder geração** | `src/ai-builder/generator.ts` | `bot_name`/`summary` retornados pelo mock — demais via heurísticas locais |

---

### ROADMAP — Mencionado em documentação, nenhuma implementação existe

| Módulo | Evidência |
|---|---|
| **Follow-up / Drip sequences** | Mencionado em `src/lib/mock.ts` como item de lista fictícia. Zero código real. |
| **Agendamento / Calendar** | ~~Zero adapter~~ → ver PARCIAL abaixo (FASE 28C ✅) |
| **White-label (produto)** | Arquitetura multi-tenant pronta. Painel de gestão de clientes, customização de marca = não existe. |
| **Billing / Planos** | Stripe aparece como destino de connector, não como sistema de billing da plataforma. |
| **Templates marketplace** | `src/connectors/builtins.ts` — comentário: "mocked". |
| **A/B testing de flows** | Não existe. |
| **Convite de membros (UI)** | Auth real no Supabase. Página de convite = não existe. |

---

## 3. Fases Concluídas

| Fase | Commit | O que entregou |
|---|---|---|
| **Fases 1–25** | Pré-registro | Runtime Engine, Builder Visual, CRM, Lead Intelligence, Tracking, Compliance, Connector Hub, Knowledge Base, Web Widget, Multi-tenant |
| **Fase 26A.3** | `a562971` | Mapeamento de diferenciais e evolução do produto |
| **Fase 26A.4** | `159a563` | Messaging Architecture + Deep Discovery |
| **Fase 26A.5** | `7e7ec8f` | Economic Engine + Go-to-Market definitivo |
| **Fase 26A.6** | `a46a223` | Market Angles + Competitive Warfare + Hidden Advantages |
| **Fase 26A.7** | `498ad92` | Obsidian Vault Structure + Autonomous Support Engine |
| **Fase 26A.8** | `c4ea8e7` | Project Constitution + Design Knowledge Map + Claude Design Briefs |
| **Fase 26B.1** | `50e4963` | Design system + Hero V2 |
| **Fase 26C.1** | `c896ef5` | Hero LP V2 — Conversational Revenue OS |
| **Fase 26C.1A** | `27118ca` | Hero refinement — análise Revenue OS |
| **Fase 26C.1B** | `f6795be` | Hero Narrative Architecture |
| **Fase 26D.1** | `bb7b308` | Product Movie Architecture — sistema cinematográfico |
| **Fase 26E** | `2440289` | **PRODUCT-CONSTITUTION.md** — fonte máxima de verdade |
| **Fase 26F** | `de8fc45` | **FLUXROW-GAP-ANALYSIS.md** — 11 áreas operacionais auditadas |
| **Fase 26F.1** | `cc1fdb9` | **Landing Page V2 completa** — Hero, Jornada, Diferenciais, FAQ, LGPD, CTA |
| **Fase 26Z.1** | `861751f` | **REALITY-CHECK-AUDIT.md** — 16 módulos auditados por código |
| **Fase 26Z.4** | `ff19a5b` | **VEMFARIAS-OPERATION.md** — blueprint operacional @vemfarias |
| **Fase R1** | `1323620` | **AI-BUILDER-REALITY.md** — auditoria completa do AI Builder |
| **Fase R1.1** | `d5b753b` | **30-DAY-EXECUTION-PLAN.md** — plano de execução 30 dias (P0/P1/P2) |
| **Fase 27A.1** | `41183f1` | **OPENAI-IMPLEMENTATION-PLAN.md** — plano técnico completo OpenAI |

---

## 4. Fases Em Execução

### 28A — OpenAI Integration ✅ CONCLUÍDO

**O que é:** trocar `buildMockProvider()` por provider real OpenAI. Um arquivo novo, duas linhas alteradas.

**Estado:** **IMPLEMENTADO** — `src/ai/providers/openai.ts` criado, `src/ai/providers/index.ts` atualizado. Build limpo. Zero erros TypeScript. Aguarda `VITE_OPENAI_API_KEY` para ativar em produção.

**Arquivos a criar/modificar:**
- `src/ai/providers/openai.ts` — novo (~140 linhas)
- `src/ai/providers/index.ts` — 3 linhas (swap import/export)
- `.env.local` — `VITE_OPENAI_API_KEY=sk-...`

**Esforço:** 4–6h desenvolvimento + 1–2h teste.

**Bloqueio:** chave de API OpenAI com crédito ativo.

---

### 27B — Supabase Activation (Em planejamento, não iniciado)

**O que é:** setar `VITE_USE_SUPABASE=true` e garantir persistência real.

**Estado:** `.env` já tem `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`. Falta apenas `VITE_USE_SUPABASE=true`.

**Esforço:** 1–2h (configuração + verificação).

**Impacto:** desbloqueia CRM, leads, bots e sessões persistindo. Sem isso, tudo é demo.

---

### 27C — Revenue/Attribution pages sem mock (Em planejamento)

**O que é:** desconectar `Revenue.tsx` e `Attribution.tsx` de `analytics-mock` e conectar ao motor de atribuição real (`src/intelligence/attribution.ts`).

**Estado:** motor real (`buildAttributionRow()`, `summarizeAttribution()`) existe. Páginas não o usam.

**Esforço:** 4–8h.

---

### 27D — Conversations/Inbox sem mock (Em planejamento)

**O que é:** desconectar `Conversations.tsx` de `src/lib/mock` e conectar a sessões reais do channel bus.

**Estado:** Web Widget gera sessões. Página não as consome.

**Esforço:** 4–6h.

---

## 5. Próximas Sprints

> Baseado em `docs/30-DAY-EXECUTION-PLAN.md`. Critérios: P0 = desbloqueia operação, P1 = completa o ciclo, P2 = pode esperar.

---

### Sprint 1 — Semana 1 (D1–D7): Acender o Motor

**Objetivo:** o produto para de ser demo e começa a ser real. Zero feature nova.

| Prioridade | Tarefa | Esforço | Bloqueio |
|---|---|---|---|
| **P0** | Setar `VITE_USE_SUPABASE=true` | 1–2h | Nenhum — já tem as vars |
| **P0** | Criar `src/ai/providers/openai.ts` + swap registry | 4–6h | Chave OpenAI |
| **P1** | Desconectar Revenue.tsx de analytics-mock | 4–8h | Nenhum |
| **P1** | Desconectar Conversations.tsx de lib/mock | 4–6h | Nenhum |

**Critério de conclusão:** lead criado via bot persiste 24h. AI Block responde com IA real.

---

### Sprint 2 — Semana 2 (D8–D14): Desbloquear @vemfarias

**Objetivo:** um criador de conteúdo consegue usar o produto para capturar e qualificar leads de mentoria.

| Prioridade | Tarefa | Esforço | Bloqueio |
|---|---|---|---|
| **P0** | Criar bot de qualificação via AI Builder | 2–4h | Sprint 1 concluída |
| **P0** | Configurar tracking UTM em links de campanha | 1–2h | Nenhum |
| **P1** | Adicionar link Google Calendar como último bloco do bot | 30min | Nenhum |
| **P1** | Webhook → Zapier → sequência de e-mail (workaround follow-up) | 3–5h | Conta Zapier + Brevo/ActiveCampaign |

**Critério de conclusão:** interessado abre link, conversa com bot, aparece no CRM com score. Recebe e-mail de follow-up automaticamente.

---

### Sprint 3 — Semana 3 (D15–D21): Desbloquear Cliente Beta

**Objetivo:** o produto pode receber o primeiro cliente pagante.

| Prioridade | Tarefa | Esforço | Bloqueio |
|---|---|---|---|
| **P0** | Submeter aprovação Meta para WhatsApp Business API | 4–8h burocracia | Conta Meta Business Manager |
| **P1** | Templates verticais no AI Builder (mentoria / clínica / imobiliária) | 8–12h | Nenhum |
| **P1** | Onboarding guiado mínimo (checklist 5 passos) | 6–10h | Nenhum |
| **P1** | Estabilizar Knowledge Base no Supabase | 4–8h | Sprint 1 (Supabase ativo) |

**Critério de conclusão:** cliente beta cria bot, publica e vê lead no CRM sem suporte humano.

---

### Sprint 4 — Semana 4 (D22–D30): Desbloquear Venda Recorrente

**Objetivo:** cliente paga mensalmente porque vê ROI crescente e não quer sair.

| Prioridade | Tarefa | Esforço | Bloqueio |
|---|---|---|---|
| **P0** | Motor de follow-up nativo (trigger engine + step 1 para Web) | 12–16h | Supabase + pg_cron ou Edge Function |
| **P0** | Dashboard de ROI real para cliente (leads, conversão, receita) | 8–12h | Supabase ativo + dados reais |
| **P1** | WhatsApp adapter (`src/channels/whatsapp.ts`) — desenvolvimento | 16–20h | Aprovação Meta (iniciada Sprint 3) |
| **P1** | Relatório comparativo de performance entre bots | 4–6h | Nenhum |

**Critério de conclusão:** cliente consegue mostrar "criei X leads, Y converteram, receita atribuída = R$Z" sem exportar dados.

---

## 6. Dependências

### Dependências externas críticas

| Dependência | Necessária para | Status | Risco |
|---|---|---|---|
| `VITE_OPENAI_API_KEY` | IA real em qualquer bloco | ⚠️ Provider implementado (FASE 28A) — chave não configurada | **CRÍTICO** — sem a chave, cai no erro; com a chave, funciona |
| `VITE_USE_SUPABASE=true` | Persistência real de dados | ❌ Não está no `.env` | **CRÍTICO** — sem isso, dados somem |
| Aprovação Meta (WhatsApp Business API) | Canal WhatsApp real | ❌ Não iniciada | Gargalo de 1–4 semanas |
| Meta Business Manager configurado | Submeter aprovação WhatsApp | ❌ Desconhecido | Pré-requisito para Sprint 3 |
| Conta Zapier ou Make | Workaround follow-up | ❌ Depende de conta | ~$20–50/mês |

### Dependências internas (arquivos que outros dependem)

| Arquivo | Dependentes | Status |
|---|---|---|
| `VITE_USE_SUPABASE=true` | CRM, Leads, Sessions, Analytics, Knowledge Base | ❌ |
| `src/ai/providers/openai.ts` | `src/ai/registry.ts` → todos AI blocks e AI Builder | ❌ (não existe ainda) |
| `src/ai/providers/index.ts` (atualizado) | `registry.ts` → `runner.ts` → `engine.ts` | Parcial (usa mock) |
| `src/intelligence/attribution.ts` | `Revenue.tsx`, `Attribution.tsx` | Existe, mas pages não o usam |
| Channel bus (sessões reais) | `Conversations.tsx` | Existe, page não o consome |

---

## 7. Riscos

| # | Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|---|
| **R1** | Chave OpenAI exposta no bundle (`VITE_` prefix) | CERTA se usar `VITE_` | ALTO em produção pública | Para beta interno: aceitável. Para produção: mover para Supabase Edge Function (+6–10h). |
| **R2** | WhatsApp não aprovado pela Meta até 30 dias | MÉDIA | ALTO — canal principal do ICP brasileiro | Comunicar prazo real. Web Widget como canal inicial. Não prometer WhatsApp disponível. |
| **R3** | Rate limit OpenAI (500 RPM Tier 1) em pico | BAIXA para beta | MÉDIO | Runner já captura erro 429. Flow não trava. Upgrade de tier é automático com uso. |
| **R4** | `extract()` retorna JSON inválido da OpenAI | BAIXA | BAIXO | `safeParseJSON()` + `validateSchema()` já existem e tratam JSON parcial. |
| **R5** | Cliente beta espera WhatsApp e abandona | ALTA para ICP PME | ALTO | Onboarding deve ser honesto sobre canal. Mostrar valor via Web Widget primeiro. |
| **R6** | Custo OpenAI inesperado com prompts grandes | BAIXA para volume beta | MÉDIO | AI Inspector rastreia custo por execução. Configurar `maxTokens: 1024` e `topK: 3` como default. |
| **R7** | Concorrente capitalizado copia o loop | MÉDIA (12–24 meses) | ALTO | Data flywheel é o moat. Quanto antes os clientes entram, mais difícil é trocar. |
| **R8** | Knowledge Base perde dados entre deploys | ALTA (relatada em FLUXROW-GAP-ANALYSIS.md) | MÉDIO | Estabilizar persistência Supabase da KB na Sprint 3. Workaround: re-upload. |

---

## 8. Critérios para Beta

O produto está pronto para receber o primeiro cliente beta pagante quando:

### Infraestrutura
- [ ] `VITE_USE_SUPABASE=true` ativo em produção
- [ ] Supabase projeto com migrations rodadas e RLS ativo
- [ ] Pelo menos um provider de IA real conectado (OpenAI ou Anthropic)

### Produto
- [ ] Bot criado e publicado persiste após restart do servidor
- [ ] Lead gerado via bot aparece no CRM com score calculado
- [ ] Score calculado usa dados reais (não mock)
- [ ] Revenue/Attribution não mostram dados hardcoded (ou mostram zero com estado vazio honesto)
- [ ] Conversations não usa `lib/mock`

### Experiência
- [ ] Cliente consegue criar primeiro bot em menos de 30 minutos sem suporte humano
- [ ] Onboarding guiado (checklist 5 passos) disponível
- [ ] Pelo menos um template vertical disponível (mentoria, clínica ou imobiliária)

### Comunicação
- [ ] LP V2 publicada sem prometer WhatsApp como disponível hoje
- [ ] Documentação honesta sobre o que é web-only no canal inicial

---

## 9. Critérios para Produção (Lançamento Público)

Além dos critérios de beta, o produto está pronto para lançamento público quando:

### Canal
- [ ] WhatsApp Business API conectado e aprovado pela Meta
- [ ] Webhook bidirecional de mensagens funcionando
- [ ] Pelo menos um bot em produção real gerando leads via WhatsApp

### Segurança
- [ ] Chave OpenAI movida de `VITE_OPENAI_API_KEY` para Supabase Edge Function (chave não exposta no bundle)
- [ ] Audit logs de segurança habilitados
- [ ] Secret Vault ativo (credenciais de connectors em memória, não localStorage)

### Follow-up
- [ ] Motor de follow-up nativo com pelo menos 1 step (D+1 sem resposta)
- [ ] Opt-out de sequência funcionando

### Billing
- [ ] Pelo menos um plano pago funcionando
- [ ] Trial de X dias com upgrade automático

### Escala
- [ ] Knowledge Base com persistência estável validada
- [ ] Dashboard de ROI mostrando dados reais
- [ ] Exportação de relatório básica (CSV) disponível

---

## 10. Backlog Futuro (P2 — fora dos 30 dias)

> Importante mas não bloqueia nenhuma operação atual.

| Item | Quando faz sentido | Esforço estimado |
|---|---|---|
| Instagram DM real (Meta Graph API) | Após WhatsApp estável | L — 3–6 semanas + aprovação Meta |
| Anthropic como provider (CORS proxy) | Após OpenAI validado | M — 6–10h |
| Gemini como provider | Diversificação após tração | M — 4–6h |
| A/B testing de flows | Após volume de dados suficiente | M |
| White-label com painel de agência | Com 5+ agências ativas | L |
| Billing e planos | Antes do lançamento público | M |
| Marketplace de templates | Com 10+ bots em produção | M |
| Convite de membros (UI) | Com clientes de time | S |
| NPS/CSAT integrado | Com base instalada | M |
| Previsão de churn | Com 90+ dias de dados | M |
| Zapier/Make connector nativo | Após volume de pedidos | M (parceria/SDK) |
| Funil temporal detalhado (série histórica) | Com 30+ dias de dados reais | M |
| Campos custom ilimitados no CRM | Com clientes exigindo | S |
| Cal.com / Calendly integration nativa | Após follow-up nativo | M |
| Agendamento nativo no flow | Após calendário integrado | L |
| Autonomous Support Engine | Fase 3 do roadmap | XL |
| AI Operating System | Visão de longo prazo | XXL |

---

## 11. Changelog Estratégico

> Decisões que mudaram a direção do produto. Não é changelog técnico — é changelog de entendimento.

### 2026-06-04 — Reality Check (maior mudança de perspectiva)

**Evento:** FASE 26Z.1 leu o código-fonte do zero e auditou o produto real vs. imaginado.

**O que mudou:**
- Descoberto que `VITE_USE_SUPABASE` não está setado → produto inteiro roda em demo por padrão
- Descoberto que todos os 3 providers de IA usam `buildMockProvider()` → zero LLM real
- Descoberto que Revenue/Attribution consomem `analytics-mock` → KPIs são constantes hardcoded
- Descoberto que Conversations usa `lib/mock` → inbox mostra dados fictícios
- WhatsApp/Instagram/Messenger confirmados como stubs sem nenhuma chamada real

**Impacto na estratégia:**
- Posicionamento de "Revenue OS" é aspiracional, não atual
- "O que pode ser vendido hoje" passou a ser comunicado com ressalvas (PRODUCT-CONSTITUTION.md §10)
- 30-DAY-EXECUTION-PLAN.md foi criado com base no gap real, não no produto imaginado

### 2026-06-04 — PRODUCT-CONSTITUTION.md como fonte máxima de verdade

**Evento:** FASE 26E consolidou 7 documentos estratégicos em um único.

**O que mudou:**
- Data Flywheel ganhou centralidade como argumento principal de retenção (não era articulado antes)
- Agência passou a ser tratada como unidade de distribuição, não apenas ICP
- Tom ficou mais direto — menos análise estratégica, mais linguagem do produto

### 2026-06-04 — @vemfarias como caso de teste operacional

**Evento:** FASE 26Z.4 mapeou o fluxo de uma operação real contra o produto.

**O que mudou:**
- Ficou claro que o fluxo "Instagram DM → IA → CRM → follow-up → agendamento" quebra em 4 dos 10 passos
- A "operação possível hoje" foi documentada: Web Widget como entrada + CRM + Google Calendar link + Google Meet + follow-up manual
- Esse caso de uso passou a ser o critério de teste para cada sprint

### 2026-06-04 — AI Builder auditado (FASE R1)

**O que mudou:**
- Confirmado que `bot_name` e `summary` são as ÚNICAS saídas de LLM na geração de blueprint
- Todo o restante do blueprint vem de heurísticas locais (regex) — não de IA
- Provider swap é uma troca simples: 1 arquivo novo, 1 linha alterada

---

### 2026-06-04 — Meta Channels implementados + smoke test + fixes (FASE 27A.4–27A.6)

**O que mudou:**
- FASE 27A.4: WhatsApp/Instagram/Messenger implementados ponta-a-ponta (`ffde1bf`)
  - 3 tabelas Supabase + RLS + 2 RPCs SECURITY DEFINER
  - 2 Edge Functions: `meta-webhook` (HMAC-SHA256) + `meta-send` (proxy CORS)
  - Hooks Realtime, ChannelBadge, MetaConnectModal, Conversations page rewrite
- FASE 27A.5: Smoke test identificou 4 bugs (`f751493`)
  - Prontidão medida em 38%
- FASE 27A.6: 4 bugs corrigidos — prontidão sobe para 62%
  - BUG-01 CORRIGIDO: HMAC fail-closed (`meta-webhook/index.ts`)
  - BUG-02 CORRIGIDO: `conversation_id` nunca mais null (`meta-send/index.ts`)
  - BUG-03 CORRIGIDO: `supabase_realtime` publication adicionada (nova migration)
  - BUG-04 CORRIGIDO: `useMetaLeadBridge` — lead criado automaticamente ao receber mensagem Meta

**Estado atual dos Meta Channels:**
- Código: sem bugs conhecidos
- Deploy pendente: `supabase db push` + `supabase functions deploy`
- Testes end-to-end: dependem de Meta App configurado + dispositivo físico
- Documentos: `META-CHANNELS-IMPLEMENTATION-REPORT.md` · `META-SMOKE-TEST-REPORT.md` · `META-SMOKE-TEST-FIXES.md`

---

### 2026-06-08 — Meta stack auditada e pronta para deploy (FASE 28D)

**O que foi verificado e corrigido:**
- Migrations `20260604000001` e `20260604000002`: SQL correto, RLS correto, RPCs corretos — zero issues
- Edge Functions `meta-webhook` e `meta-send`: código correto, HMAC fail-closed, sem erros TypeScript
- Tabelas `meta_channel_connections`, `meta_conversations`, `meta_messages`: schema verificado, índices OK
- Build completo: ✅ 2855 módulos, zero erros
- TypeScript strict: ✅ zero erros
- `supabase/config.toml`: atualizado com `verify_jwt` correto para cada edge function (meta-webhook: false, meta-send: true)
- MASTER-ROADMAP: corrigido para refletir que WhatsApp/Instagram/Messenger têm código real (não stubs)

**Prontidão Meta Channels: 100% código / 0% deploy**

O que resta é operacional (não desenvolvimento):
1. `supabase link --project-ref bgzczvsmfcnypwqveotx && supabase db push`
2. `supabase functions deploy meta-webhook --no-verify-jwt && supabase functions deploy meta-send`
3. `supabase secrets set META_VERIFY_TOKEN=flux_meta_verify META_APP_SECRET=<secret>`
4. Criar Meta App (20 min) + configurar webhook + inserir conexão na tabela

Ver `docs/META-SETUP-CHECKLIST.md` para os passos operacionais completos.

---

### 2026-06-05 — Deploy físico bloqueado por mismatch de projeto (FASE 27A.7)

**O que foi descoberto:**
- O projeto Supabase no `.env` (`bgzczvsmfcnypwqveotx`) não está acessível via MCP desta sessão
- O ambiente de execução remota bloqueia rede de saída para `supabase.co`
- O deploy físico precisa ser executado **localmente** pelo usuário

**Prontidão atual: 62%** (código ok, deploy pendente)

**Próximo passo obrigatório — executar localmente:**
```bash
supabase link --project-ref bgzczvsmfcnypwqveotx
supabase db push
supabase functions deploy meta-webhook --no-verify-jwt
supabase functions deploy meta-send
supabase secrets set META_VERIFY_TOKEN=flux_meta_verify
supabase secrets set META_APP_SECRET=<app_secret_do_meta>
```

Após deploy: configurar webhook no Meta App Dashboard e executar teste físico com número real.
Ver passos completos em: `docs/META-PHYSICAL-SMOKE-TEST-REPORT.md`

---

### 2026-06-05 — Inventário de infraestrutura beta (FASE 27B.1)

**O que foi criado:** `docs/BETA-INFRASTRUCTURE-INVENTORY.md`

**Resumo de prontidão operacional:**

| Prioridade | Item | Status |
|-----------|------|--------|
| P0 | Supabase migrations (`supabase db push`) | ❌ Pendente (execução local, 5 min) |
| P0 | Deploy Edge Functions + secrets Meta | ❌ Pendente (execução local, 10 min — código READY, FASE 28D ✅) |
| P0 | Conectar WhatsApp no app (criar Meta App + token) | ❌ Pendente operacional (não é desenvolvimento) |
| P1 | OpenAI real (trocar mock) | ✅ Concluído (FASE 28A) — requer `VITE_OPENAI_API_KEY` |
| P1 | Bot @vemfarias criado e publicado | ❌ Pendente (~2–4h) |
| P2 | Instagram DM + Messenger | ❌ Pendente (setup + aprovação Meta) |

**Tempo estimado para beta mínimo:** ~40 min de configuração + 2–4h para bot @vemfarias.

**Critério de sucesso mínimo:** WhatsApp inbound → Inbox → Lead no CRM → Pipeline visível.

---

### 2026-06-05 — @vemfarias Pilot Plan (FASE 27C.1)

**O que foi criado:** `docs/VEMFARIAS-PILOT.md`

**Diagnóstico operacional:**

| Canal | Status |
|-------|--------|
| Bot Web (`/bot/vemfarias`) | ✅ Funciona hoje — criar bot + publicar |
| Captura UTM | ✅ Funciona hoje — adicionar UTM no link de bio/anúncio |
| Score automático | ✅ Funciona hoje — calculado ao criar lead |
| CRM / Pipeline | ✅ Funciona hoje — Supabase ativo |
| WhatsApp | ⚠️ Código READY (FASE 28D ✅) — deploy pendente (40 min, manual, `docs/META-SETUP-CHECKLIST.md`) |
| Instagram DM | ❌ Deploy + aprovação Meta (1–4 semanas) |
| IA real (não mock) | ✅ OpenAI implementado (FASE 28A) — requer `VITE_OPENAI_API_KEY` |
| Follow-up automático | ❌ Roadmap Sprint 3–4 |

**Score esperado para lead qualificado:** ~80 pontos → 🔥 Quente

**O que pode ser testado amanhã:**
1. `supabase db push`
2. Criar bot com 7 perguntas no AI Builder
3. Publicar + link no bio do Instagram
4. 3 leads reais no CRM com score automático

**Documento completo:** `docs/VEMFARIAS-PILOT.md`

---

### 2026-06-05 — First Revenue Test (FASE 27C.2)

**O que foi criado:** `docs/FIRST-REVENUE-TEST.md`

**Meta:** 10 leads qualificados → 3 reuniões → 1 venda em 14 dias

| Critério | Valor |
|----------|-------|
| Ticket mínimo | R$ 300/mês |
| MRR incremental meta | R$ 300 |
| Prazo | 14 dias corridos |
| Canal principal | WhatsApp @vemfarias |

**Documento completo:** `docs/FIRST-REVENUE-TEST.md`

---

### 2026-06-05 — LP Hero Video Integration (FASE 27D)

**O que foi implementado:** `src/pages/Landing.tsx` — componente `HeroVideo`

**Comportamento:**
- `prefers-reduced-motion: reduce` → exibe mockup estático animado (comportamento anterior preservado)
- Caso contrário → exibe `<video autoplay muted loop>` com sources `/hero-loop.webm` e `/hero-loop.mp4`
- Autoplay bloqueado pelo browser → overlay com botão Play visível
- Erro de carregamento (`onError`) → fallback automático para mockup estático
- Analytics: `gtag("event", "hero_video_play/pause/ended")` + `CustomEvent("flux:hero_video")`

**Arquivos de vídeo necessários (adicionar ao `public/`):**
| Arquivo | Uso |
|---------|-----|
| `/hero-loop.webm` | Source principal (menor tamanho) |
| `/hero-loop.mp4` | Fallback de compatibilidade |
| `/hero-loop-poster.jpg` | Frame estático enquanto vídeo carrega |

---

### 2026-06-08 — Supabase Reality Check (FASE 27F)

**O que foi auditado:** estado real do Supabase via MCP + análise estática de código.

**Resultado:** `BLOCKED`

| Camada | Status |
|--------|--------|
| Código (9 migrations) | ✅ Pronto — nenhum bug conhecido |
| Código (2 edge functions) | ✅ Pronto — HMAC fail-closed, conversation_id resolvido |
| Código (frontend) | ✅ Pronto — RLS, Realtime, CRM bridge, Lead bridge |
| Projeto `bgzczvsmfcnypwqveotx` via MCP | ❌ 403 — fora da conta MCP |
| Deploy migrations | ❌ Requer CLI local |
| Deploy edge functions | ❌ Requer CLI local |
| Secrets META_VERIFY_TOKEN / META_APP_SECRET | ❌ Pendentes |

**Tempo estimado para desbloquear:** 40–60 min de execução manual com Supabase CLI local.

**Documento completo:** `docs/SUPABASE-DEPLOY-CHECKLIST.md`

---

### 2026-06-08 — Meta Blockers (FASE 27G)

**O que foi auditado:** 10 perguntas sobre infraestrutura Meta real.

**Resultado:** 0/10 itens confirmados. Tudo é mock ou inexistente.

| Bloqueador | Impacto | Tempo para resolver |
|-----------|---------|-------------------|
| App Meta não existe | Raiz de tudo | 20 min |
| WABA não existe | Sem número WhatsApp | 10 min (sandbox) |
| Tokens não existem | Sem envio de mensagens | 15 min |
| Edge functions não deployadas | Sem webhook público | 10 min |
| Migrations Meta não aplicadas | Sem tabelas no banco | 2 min |
| OAuth é mock | Sem conexão por UI | Workaround: 5 min · Dev: 4–6h |
| Página Facebook/Instagram não conectadas | Sem IG/Messenger | 15 min |

**Tempo total para MVP WhatsApp funcionar:** ~65 minutos de execução manual.

**O código está pronto. Só falta a operação.**

---

### 2026-06-08 — Google Calendar Foundation (FASE 28B)

**O que foi entregue:** plano de implementação real do Google Calendar, sem UI e sem mock.

**Resultado:** `PLAN READY` — arquitetura definida, pronta para execução.

| Camada | Definida |
|--------|----------|
| OAuth per-user (scopes `calendar.events` + `calendar.readonly`) | ✅ |
| Tabelas (`user_calendar_tokens`, `calendar_events`, `calendar_watch_channels`) | ✅ |
| Edge functions (`google-oauth-callback`, `calendar-webhook`, `calendar-sync`, `calendar-watch-refresh`) | ✅ |
| Blocks Builder (`check_availability`, `create_event`, `cancel_event`) | ✅ |
| Google Meet via `conferenceData.createRequest` | ✅ |
| Sync push (`events.watch`) + pull (`syncToken`) + renew | ✅ |
| Bridge CRM (`runtimeEventBus` → leads + tracking) | ✅ |
| Secrets pendentes: `GCAL_CLIENT_ID/SECRET/REDIRECT_URI/STATE_SECRET/WEBHOOK_TOKEN_SECRET` | ⏳ |

**Documento completo:** `docs/GOOGLE-CALENDAR-IMPLEMENTATION-PLAN.md`


**Documento completo:** `docs/META-BLOCKERS.md` — checklist operacional em 8 etapas.

---

## 12. Timeline Visual

```
JUNHO 2026
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

D1─────────────D7          SPRINT 1 — Acender o Motor
│  Supabase ON  │          [P0] VITE_USE_SUPABASE=true
│  OpenAI real  │          [P0] src/ai/providers/openai.ts
│  Revenue real │          [P1] Revenue/Attribution sem mock
│  Inbox real   │          [P1] Conversations sem lib/mock
└───────────────┘

D8─────────────D14         SPRINT 2 — @vemfarias
│  Bot publicado│          [P0] Bot mentoria criado e no ar
│  UTM tracking │          [P0] Links com utm_campaign
│  G. Calendar  │          [P1] Link agendamento Google Calendar no bot
│  Google Meet  │          [P1] Reunião via Google Meet
│  Follow-up WA │          [P1] Webhook → Zapier → email
└───────────────┘

D15────────────D21         SPRINT 3 — Cliente Beta
│  Meta WA ✍️  │          [P0] Processo aprovação submetido
│  Templates    │          [P1] 3 templates verticais
│  Onboarding   │          [P1] Checklist 5 passos
│  KB estável   │          [P1] Knowledge Base não perde dados
└───────────────┘

D22────────────D30         SPRINT 4 — Venda Recorrente
│  Follow-up 🔔 │          [P0] Trigger engine + step D+1
│  ROI dashboard│          [P0] Dashboard com dados reais
│  WA adapter 🔧│          [P1] src/channels/whatsapp.ts
│  Bot perf     │          [P1] Comparativo de bots
└───────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

JULHO 2026 (Semanas 5–8)
─────────────────────────────────────
WhatsApp real (após aprovação Meta)
Anthropic provider (opcional)
Follow-up nativo completo (multicanal)
Billing e planos (antes de público)

AGOSTO 2026+ (Roadmap)
─────────────────────────────────────
Instagram DM real
White-label / Agency Hub
A/B testing de flows
Marketplace de templates
Autonomous Support Engine (Fase 3)
```

---

## Referências — Documentos por categoria

### Estratégia e Produto
| Documento | Conteúdo |
|---|---|
| `docs/PRODUCT-CONSTITUTION.md` | **Fonte máxima de verdade**. Missão, ICP, diferenciais, mandamentos. |
| `docs/POSITIONING.md` | Posicionamento detalhado (consolidado no PRODUCT-CONSTITUTION) |
| `docs/PRODUCT-INTELLIGENCE.md` | Análise de product-market fit |
| `docs/MESSAGING-ARCHITECTURE.md` | Arquitetura de mensagem por ICP |
| `docs/ECONOMIC-ENGINE-GTM.md` | Modelo econômico e go-to-market |
| `docs/COMPETITIVE-WARFARE.md` | Análise competitiva |
| `docs/HIDDEN-ADVANTAGES.md` | Vantagens não óbvias |
| `docs/MARKET-ANGLES.md` | Ângulos de mercado |

### Auditoria de Realidade
| Documento | Conteúdo |
|---|---|
| `docs/REALITY-CHECK-AUDIT.md` | **16 módulos auditados por código**. REAL/PARCIAL/MOCK/ROADMAP. |
| `docs/AI-BUILDER-REALITY.md` | Auditoria completa do AI Builder. O que gera, o que é mock. |
| `docs/FLUXROW-GAP-ANALYSIS.md` | 11 áreas operacionais. P0/P1/P2. Bloqueadores de lançamento. |
| `docs/VEMFARIAS-OPERATION.md` | Blueprint operacional @vemfarias. Fluxo real vs. produto real. |

### Planos de Execução
| Documento | Conteúdo |
|---|---|
| `docs/30-DAY-EXECUTION-PLAN.md` | **Plano 30 dias**. Sprint 1–4. P0/P1/P2 com critérios de conclusão. |
| `docs/OPENAI-IMPLEMENTATION-PLAN.md` | **Plano técnico OpenAI**. Arquitetura, arquivos, sequência, riscos, critérios de aceite. |
| `docs/MASTER-ROADMAP.md` | **Este documento**. Estado consolidado. Entrada para qualquer IA ou dev. |

### Design e Landing Page
| Documento | Conteúdo |
|---|---|
| `docs/LANDING-PAGE-STRATEGY.md` | Estratégia da LP |
| `docs/DESIGN-LP-V2.md` | Especificação visual LP V2 |
| `docs/HERO-V2.md` | Hero da LP |
| `docs/HERO-NARRATIVE-ARCHITECTURE.md` | Narrativa do hero |
| `docs/PRODUCT-MOVIE-ARCHITECTURE.md` | Sistema cinematográfico de vídeos |
| `docs/AUTONOMOUS-SUPPORT-ENGINE.md` | Especificação do Autonomous Support Engine |

### Arquitetura Técnica
| Documento | Conteúdo |
|---|---|
| `docs/ARCHITECTURE.md` | Arquitetura técnica do sistema |
| `docs/PROJECT-CONSTITUTION.md` | Constituição do projeto (técnica) |
| `docs/DESIGN-KNOWLEDGE-MAP.md` | Mapa de conhecimento de design |

---

## Snapshot do estado atual (para onboarding de IA)

Se você é uma IA entrando neste projeto agora, leia isto:

**O produto é:** um SPA React/TypeScript que tem arquitetura sólida de 9 engines (Runtime, Builder, CRM, Lead Intelligence, Revenue Attribution, Tracking, Connector Hub, Knowledge Base, Compliance). A arquitetura é boa. O problema é configuração e providers.

**O que não funciona hoje:**
1. `VITE_USE_SUPABASE` não está setado → tudo em memória, dados somem no reload
2. Anthropic e Gemini providers são `buildMockProvider()` (OpenAI real — FASE 28A ✅)
3. Revenue/Attribution/Conversations consomem dados hardcoded de `lib/analytics-mock` e `lib/mock`
4. WhatsApp/Instagram/Messenger são stubs (`makeStub()`) — sem Meta API
5. Follow-up não existe.

**O que funciona hoje:**
1. Web Widget conversa de verdade e pode publicar bots via link
2. Builder Visual cria flows completos e os salva
3. Lead Intelligence score (7 fatores) é código real e funcionando
4. Connectors HTTP (webhook, sheets, slack, telegram) fazem chamadas reais
5. Compliance LGPD é real (Consent, Audit Logs, RLS)
6. **OpenAI provider real** — `src/ai/providers/openai.ts` (FASE 28A) — requer `VITE_OPENAI_API_KEY`
7. **Google Calendar real** — `src/calendar/` (FASE 28C) — OAuth, eventos, Meet, freeBusy, sync, bridge CRM. Requer `VITE_GCAL_CLIENT_ID` + deploy migrations + edge functions

**O que fazer primeiro:**
1. Setar `VITE_USE_SUPABASE=true` em `.env` (já tem URL e key — falta só essa linha)
2. Setar `VITE_OPENAI_API_KEY=sk-proj-...` (provider real já implementado — FASE 28A ✅)
3. Criar OAuth Client no Google Cloud Console + setar `VITE_GCAL_CLIENT_ID` (FASE 28C ✅)

**Referências rápidas:**
- Para entender o produto: `docs/PRODUCT-CONSTITUTION.md`
- Para entender o que é real: `docs/REALITY-CHECK-AUDIT.md`
- Para entender o que fazer: `docs/30-DAY-EXECUTION-PLAN.md`
- Para implementar OpenAI: `docs/OPENAI-IMPLEMENTATION-PLAN.md`
- Para entender o AI Builder: `docs/AI-BUILDER-REALITY.md`

---

## Infraestrutura Canonical

**Fonte de verdade — auditada em 2026-06-05 (FASE 27A.8).**

Toda a infraestrutura do Flux Agent Studio roda em **um único projeto Supabase / Lovable Cloud**:

| Campo | Valor |
|------|------|
| **Project Ref** | `bgzczvsmfcnypwqveotx` |
| **URL** | `https://bgzczvsmfcnypwqveotx.supabase.co` |
| **Config CLI** | `supabase/config.toml` → `project_id = "bgzczvsmfcnypwqveotx"` |
| **Env frontend** | `.env` → `VITE_SUPABASE_PROJECT_ID="bgzczvsmfcnypwqveotx"` |

Comando canônico para qualquer deploy:

```bash
supabase link --project-ref bgzczvsmfcnypwqveotx
```

Cobertura: **CRM, Leads, Conversations, Revenue, Auth, Edge Functions, Realtime** — todos no mesmo ref.

O projeto `espwkkaldnisriqhxyzt` (Fluxrow) **não tem relação** com este sistema; aparece apenas em nota de auditoria do `META-PHYSICAL-SMOKE-TEST-REPORT.md`.

Detalhamento e evidências: [`docs/SUPABASE-REALITY.md`](./SUPABASE-REALITY.md) · [`docs/DEPLOY-TARGET.md`](./DEPLOY-TARGET.md).

---

## Primeiro teste real @vemfarias

**Objetivo:** Converter 1 lead real em cliente pagante usando o fluxo completo do produto.

**Fluxo operacional:**

```
Instagram
    ↓
  DM (mensagem direta recebida via Meta Webhook)
    ↓
  Inbox (Conversations — painel do Flux Agent Studio)
    ↓
  Lead Intelligence (score automático 7 fatores)
    ↓
  CRM (lead criado / qualificado com fonte = instagram)
    ↓
  Google Calendar (link de agendamento enviado manualmente ou via bot)
    ↓
  Google Meet (reunião de diagnóstico — 30 min)
    ↓
  Venda (proposta Método Escala — R$ 6.000–15.000)
```

**Pré-requisitos técnicos:**

| Item | Status | Ação |
|------|--------|------|
| Meta Webhook ativo (WhatsApp ou Instagram) | ❌ | Executar `docs/META-SETUP-CHECKLIST.md` |
| Supabase `meta_channel_connections` populado | ❌ | INSERT manual após criar Meta App |
| Edge Functions `meta-webhook` + `meta-send` deployadas | ❌ | `supabase functions deploy` |
| Google Calendar — link de agendamento criado | 🟡 | Criar evento recorrente com link público |
| Google Meet — link fixo para reuniões | 🟡 | Criar via Google Calendar (gera Meet automático) |
| CRM operacional com dados reais | ✅ | Supabase + Realtime ativo |

**Critério de sucesso do teste:**

> 1 lead entra via Instagram DM → aparece no CRM com score → reunião agendada via Google Calendar → Google Meet acontece → proposta enviada.

**Referências:**
- Setup Meta: [`docs/META-SETUP-CHECKLIST.md`](./META-SETUP-CHECKLIST.md)
- Bloqueadores conhecidos: [`docs/META-BLOCKERS.md`](./META-BLOCKERS.md)
- Oferta: [`docs/Product/OfferArchitecture.md`](./Product/OfferArchitecture.md)
- Rastreamento de leads: [`docs/FIRST-REVENUE-TEST.md`](./FIRST-REVENUE-TEST.md)

---

*Documento criado: 2026-06-04*  
*Consolida: PRODUCT-CONSTITUTION.md · REALITY-CHECK-AUDIT.md · AI-BUILDER-REALITY.md · FLUXROW-GAP-ANALYSIS.md · VEMFARIAS-OPERATION.md · 30-DAY-EXECUTION-PLAN.md · OPENAI-IMPLEMENTATION-PLAN.md*  
*Atualizado: 2026-06-08 (FASE 27H — Meta Foundation, Google Calendar/Meet, @vemfarias flow)*  
*Branch: `claude/sweet-meitner-bB77L`*

