# Flux Agent Studio — Obsidian Vault Structure
## FASE 26A.7 · Segundo Cérebro da Fluxrow

> Arquitetura de conhecimento para Obsidian.
> Objetivo: transformar o acúmulo de decisões, estratégias e artefatos do projeto em um sistema navegável, linkável e vivo.
> Perspectiva: fundador, CTO, CMO, futuro colaborador entrando no projeto.

---

## Filosofia do Vault

**Um segundo cérebro não é um arquivo morto.** É um sistema que pensa junto com você.

Três princípios:
1. **Linkabilidade antes de hierarquia** — toda nota deve apontar para pelo menos uma outra
2. **Permanente vs. temporário** — separe o que não muda do que está em movimento
3. **Entrada rápida, saída rica** — anotar deve ser fácil; encontrar deve ser instantâneo

---

## Estrutura de Pastas Raiz

```
📁 Flux Agent Studio/
│
├── 📁 00 - Entrada/           ← Inbox: notas rápidas, ideias brutas, dumps
├── 📁 01 - Produto/           ← O que o produto é, faz e será
├── 📁 02 - Estratégia/        ← GTM, posicionamento, pricing, ICPs
├── 📁 03 - Landing Page/      ← Tudo sobre a LP V2 e ciclos futuros
├── 📁 04 - Arquitetura/       ← Engines, decisões técnicas, trade-offs
├── 📁 05 - Roadmap/           ← Fases entregues + fases futuras
├── 📁 06 - Pessoas/           ← ICPs, beta users, personas, cases
├── 📁 07 - Operações/         ← Suporte, onboarding, SLA, processos
├── 📁 08 - Referências/       ← Competidores, benchmarks, estudos externos
└── 📁 09 - Meta/              ← Sobre o vault em si: estrutura, convenções
```

---

## Detalhamento por Pasta

### 📁 00 - Entrada
Inbox permanente. Nada morre aqui — tudo migra ou vira lixo em menos de 48h.

```
inbox.md                    ← nota única de captura rápida (append-only)
ideias-produto.md           ← features não priorizadas, observações de UX
feedbacks-brutos.md         ← quotes de usuários, verbatim, sem editar
```

**Regra:** uma vez por semana, processar o inbox. Cada item vira nota permanente, task no roadmap, ou é descartado.

---

### 📁 01 - Produto

**Hub principal:** `produto-hub.md`

```
produto-hub.md              ← MOC: links para todas as notas de produto
produto-identidade.md       ← O que é o Flux (categoria, promessa, posição)
produto-inventario.md       ← 45+ funcionalidades com status e tier
produto-evolucao.md         ← 5 níveis de maturidade (Form → Revenue OS)
produto-diferenciais.md     ← Commodity vs. Diferencial vs. Único
produto-anti-patterns.md    ← O que o produto NÃO é (guardrails de escopo)
engines/
  ├── runtime-engine.md
  ├── ai-block-engine.md
  ├── ai-builder.md
  ├── knowledge-base-rag.md
  ├── lead-intelligence.md
  ├── revenue-attribution.md
  ├── connector-hub.md
  ├── tracking-engine.md
  └── compliance-layer.md
```

**Links críticos:**
- `produto-evolucao.md` → `[[estrategia-pricing]]`
- `produto-diferenciais.md` → `[[competitive-warfare]]`
- cada engine → `[[arquitetura-decisoes]]`

---

### 📁 02 - Estratégia

**Hub principal:** `estrategia-hub.md`

```
estrategia-hub.md           ← MOC: links para toda estratégia
posicionamento.md           ← Categoria, headline, promessa central
messaging-architecture.md   ← Por ICP: o que compram, dores, objeções
economic-engine-gtm.md      ← Engine econômica por ICP, CAC, LTV, churn
market-angles.md            ← 10 ângulos de marketing com potencial
competitive-warfare.md      ← Battle cards por concorrente
hidden-advantages.md        ← 10 vantagens não óbvias
icps/
  ├── icp-agencia.md
  ├── icp-servicos-pme.md
  ├── icp-gestor-comercial.md
  ├── icp-marketing-growth.md
  └── icp-ops-revops.md
pricing/
  ├── pricing-strategy.md   ← Ancoragem, tiers, white-label
  └── pricing-psicologia.md ← Por que o preço atual subestima o produto
```

**Links críticos:**
- `posicionamento.md` → `[[lp-hero-v2]]`
- `icps/icp-agencia.md` → `[[economic-engine-gtm]]` (agência = ICP #1)
- `competitive-warfare.md` → `[[produto-diferenciais]]`

---

### 📁 03 - Landing Page

**Hub principal:** `lp-hub.md`

```
lp-hub.md                   ← MOC: toda a LP, ciclos, decisões
lp-audit-v1.md              ← Diagnóstico da LP atual (FASE 26)
lp-blueprint-v2.md          ← Estrutura das 12 seções (FASE 26A)
lp-design-system.md         ← Tokens, cores, tipografia, motion (FASE 26B.1)
lp-hero-v2.md               ← Copy, CTAs, trust signals, mockup
lp-hero-motion.md           ← Timeline de animação completa
lp-assets-inventory.md      ← Screenshots, GIFs, motion graphics necessários
lp-ab-tests.md              ← Hipóteses de A/B: headline, CTA, social proof
lp-icp-variants.md          ← Variações de hero por ICP para tráfego segmentado
ciclos/
  ├── ciclo-v1-post-mortem.md
  └── ciclo-v2-log.md       ← Decisões tomadas durante implementação
```

**Links críticos:**
- `lp-hero-v2.md` → `[[messaging-architecture]]`, `[[posicionamento]]`
- `lp-design-system.md` → `[[arquitetura-frontend]]`
- `lp-ab-tests.md` → `[[market-angles]]` (cada ângulo = potencial A/B)

---

### 📁 04 - Arquitetura

**Hub principal:** `arquitetura-hub.md`

```
arquitetura-hub.md          ← MOC: arquitetura técnica completa
arquitetura-frontend.md     ← React + Vite, Tailwind, shadcn/ui, convenções
arquitetura-backend.md      ← Supabase, RLS, multi-tenant, workspace_id
arquitetura-runtime.md      ← Event Bus, 9 engines desacopladas
arquitetura-ai.md           ← Providers plugáveis, Knowledge Base RAG
arquitetura-seguranca.md    ← SecretVault, LGPD, CAPI, service_role rules
arquitetura-canal.md        ← Channel Bus, PublicBot, multimode
decisoes/
  ├── ADR-001-supabase-rls.md
  ├── ADR-002-vite-use-supabase-toggle.md
  ├── ADR-003-event-bus-vs-redux.md
  ├── ADR-004-css-native-vs-framer.md
  └── ADR-005-teal-amber-identity.md
```

**Formato de ADR (Architecture Decision Record):**
```
# ADR-XXX — [título]
Status: [proposto|aceito|deprecado|substituído por ADR-YYY]
Contexto: [o problema]
Decisão: [o que foi decidido]
Consequências: [o que muda, o que fica mais difícil]
```

---

### 📁 05 - Roadmap

**Hub principal:** `roadmap-hub.md`

```
roadmap-hub.md              ← MOC: visão geral de todas as fases
fases-entregues/
  ├── fase-01-15.md         ← Resumo consolidado (fundação + engines)
  ├── fase-16-20.md         ← Supabase, multi-tenant, compliance
  ├── fase-21-24.md         ← QA, estabilização, UX audit
  ├── fase-25.md            ← [a definir]
  └── fase-26.md            ← LP V2: estratégia + implementação
fases-futuras/
  ├── fase-27-mobile.md     ← App móvel ou PWA
  ├── fase-28-whatsapp.md   ← Canal WhatsApp real (não stub)
  ├── fase-29-analytics.md  ← Dashboard de revenue intelligence
  └── fase-30-white-label.md ← Produto white-label para agências
bugs-abertos/
  ├── BUG-A01-tour-registry.md
  ├── BUG-A02-docs-expandable.md
  ├── BUG-A03-crm-empty-state.md
  ├── BUG-A04-analytics-convertido.md  ← regex não captura "convertido"
  └── BUG-M01-demo-mode-data.md
```

**Links críticos:**
- `bugs-abertos/BUG-A04-analytics-convertido.md` → `[[arquitetura-frontend]]`
- `fases-futuras/fase-28-whatsapp.md` → `[[arquitetura-canal]]`
- `fases-futuras/fase-30-white-label.md` → `[[economic-engine-gtm]]`

---

### 📁 06 - Pessoas

**Hub principal:** `pessoas-hub.md`

```
pessoas-hub.md              ← MOC: ICPs, personas, beta, cases
beta/
  ├── beta-composicao.md    ← 3 agências + 2 serviços + 2 SaaS + 2 PME + 1 consultor
  ├── beta-riscos.md        ← Risco #1: calibração de expectativa
  ├── beta-onboarding.md    ← Fluxo de entrada, tempo-para-valor por ICP
  └── beta-feedback-log.md  ← Log de feedbacks estruturado
personas/
  ├── persona-ceo-pme.md
  ├── persona-gestor-comercial.md
  ├── persona-dono-agencia.md
  ├── persona-marketing-manager.md
  └── persona-ops-analyst.md
cases/
  └── [vazio até beta fechar primeiro case]
```

---

### 📁 07 - Operações

**Hub principal:** `operacoes-hub.md`

```
operacoes-hub.md            ← MOC: como o negócio opera
suporte/
  ├── autonomous-support-engine.md  ← Ligado ao doc FASE 26A.7
  ├── sla-definicoes.md
  └── escalation-paths.md
onboarding/
  ├── onboarding-pme.md
  ├── onboarding-agencia.md
  └── onboarding-enterprise.md
processos/
  ├── release-checklist.md
  └── qa-checklist.md
```

---

### 📁 08 - Referências

```
competidores/
  ├── typebot.md
  ├── chatbase.md
  ├── voiceflow.md
  ├── manychat.md
  └── hubspot.md
benchmarks/
  ├── mit-5min-lead-study.md  ← "Lead em 5 min converte 8x mais"
  └── sdr-custo-brasil.md     ← R$3.000–5.000/mês benchmark
inspiracoes/
  ├── linear-design-principles.md
  ├── vercel-lp-patterns.md
  └── stripe-pricing-psychology.md
```

---

### 📁 09 - Meta

```
vault-convenções.md         ← Como nomear, linkar, usar tags
vault-templates/
  ├── template-nota-produto.md
  ├── template-adr.md
  ├── template-icp.md
  ├── template-bug.md
  └── template-case.md
vault-changelog.md          ← O que mudou na estrutura do vault
```

---

## Hubs Principais (MOCs — Maps of Content)

Um MOC é uma nota que não contém conteúdo próprio — só links comentados.

| Hub | Propósito | Notas filhas |
|---|---|---|
| `produto-hub.md` | O que o produto é | 15+ notas |
| `estrategia-hub.md` | Como posicionamos e vendemos | 12+ notas |
| `lp-hub.md` | Tudo sobre a landing page | 10+ notas |
| `arquitetura-hub.md` | Como o produto é construído | 10+ notas + ADRs |
| `roadmap-hub.md` | O que foi e o que vem | fases + bugs |
| `pessoas-hub.md` | Para quem construímos | beta + personas |
| `operacoes-hub.md` | Como operamos | suporte + onboarding |

---

## Notas Permanentes (Evergreen)

Estas notas não têm data — são verdades estáveis do projeto:

1. `produto-identidade.md` — A definição de categoria do Flux
2. `posicionamento.md` — A promessa central e por que ela é verdadeira
3. `arquitetura-runtime.md` — Como as 9 engines se comunicam
4. `arquitetura-seguranca.md` — Regras de segurança inegociáveis
5. `competitive-warfare.md` — Battle cards (atualizar a cada novo concorrente)
6. `hidden-advantages.md` — Vantagens estruturais do produto
7. `beta-riscos.md` — Os riscos que não mudam com o tempo

---

## Notas Temporárias (Datadas)

Estas notas têm vida útil limitada:

- `inbox.md` — Processada semanalmente
- `beta-feedback-log.md` — Migra para cases quando o beta fechar
- `lp-ab-tests.md` — Migra para resultados após 30 dias de dados
- `ciclo-v2-log.md` — Arquivado após a LP V2 ir ao ar

---

## Sistema de Tags

```
#produto       → qualquer coisa sobre o que o produto faz
#estrategia    → posicionamento, GTM, pricing
#lp            → landing page
#arquitetura   → decisões técnicas
#icp           → perfil de cliente ideal
#bug           → problemas conhecidos
#roadmap       → o que vem a seguir
#permanente    → nota evergreen
#temporario    → nota com data de validade
#decisao       → algo que foi decidido e não deve ser revertido sem debate
#referencia    → fonte externa
```

---

## Grafo de Links Críticos

Os links abaixo formam o esqueleto do vault — sem eles, o grafo fica fragmentado:

```
produto-identidade ←→ posicionamento
posicionamento ←→ lp-hero-v2
lp-hero-v2 ←→ messaging-architecture
messaging-architecture ←→ icps/[todos]
icps/icp-agencia ←→ economic-engine-gtm
economic-engine-gtm ←→ pricing-strategy
produto-diferenciais ←→ competitive-warfare
competitive-warfare ←→ hidden-advantages
hidden-advantages ←→ produto-inventario
produto-inventario ←→ roadmap-hub
roadmap-hub ←→ bugs-abertos/[todos]
arquitetura-runtime ←→ engines/[todos]
arquitetura-seguranca ←→ ADR-[segurança]
autonomous-support-engine ←→ operacoes-hub
```

---

## Rotina de Manutenção

### Diária (2 min)
- Dump na `inbox.md`

### Semanal (15 min)
- Processar inbox
- Adicionar links faltantes em notas recentes
- Atualizar `beta-feedback-log.md`

### Por fase entregue (30 min)
- Criar nota em `fases-entregues/`
- Atualizar roadmap-hub
- Arquivar temporárias obsoletas
- Adicionar ADR se houve decisão arquitetural

### Por trimestre (1h)
- Revisar notas permanentes
- Atualizar battle cards de competidores
- Atualizar `produto-evolucao.md` com o que foi entregue

---

## Migração Inicial Recomendada

Para popular o vault a partir dos docs existentes:

| Doc existente | Destino no Vault |
|---|---|
| `POSITIONING.md` | `02 - Estratégia/posicionamento.md` |
| `PRODUCT-INTELLIGENCE.md` | `01 - Produto/produto-inventario.md` + `produto-evolucao.md` |
| `MESSAGING-ARCHITECTURE.md` | `02 - Estratégia/messaging-architecture.md` + `icps/` |
| `ECONOMIC-ENGINE-GTM.md` | `02 - Estratégia/economic-engine-gtm.md` |
| `MARKET-ANGLES.md` | `02 - Estratégia/market-angles.md` |
| `COMPETITIVE-WARFARE.md` | `02 - Estratégia/competitive-warfare.md` |
| `HIDDEN-ADVANTAGES.md` | `02 - Estratégia/hidden-advantages.md` |
| `LANDING-PAGE-STRATEGY.md` | `03 - Landing Page/lp-blueprint-v2.md` |
| `DESIGN-LP-V2.md` | `03 - Landing Page/lp-design-system.md` |
| `HERO-V2.md` | `03 - Landing Page/lp-hero-v2.md` |
| `HERO-MOTION.md` | `03 - Landing Page/lp-hero-motion.md` |
| `fluxbot-features.md` | `05 - Roadmap/fases-entregues/fase-01-25.md` |

---

*Criado: 2026-06-03 · FASE 26A.7*
*Ferramenta: Obsidian 1.x com plugins recomendados: Dataview, Graph Analysis, Templater, Calendar*
