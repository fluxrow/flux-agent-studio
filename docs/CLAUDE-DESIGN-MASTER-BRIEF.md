# Flux Agent Studio — Claude Design Master Brief
## FASE 26A.8 · Briefing Completo para Claude Design

> Este documento foi escrito para ser lido por Claude Design.
> Contém tudo que o modelo precisa saber para criar assets visuais corretos:
> produto, posicionamento, identidade, motion, telas, narrativa, anti-patterns.
> Leitura obrigatória antes de qualquer geração visual ou de vídeo.

---

## 1. O Produto

**Nome oficial:** Flux Agent Studio  
**Empresa:** Fluxrow  
**Categoria:** Conversational Revenue OS  
**Mercado:** B2B, Brasil, PT-BR

**O que o produto faz:**
Transforma conversas (WhatsApp, Web, Instagram, Telegram) em leads qualificados, pontuados e registrados no CRM — com score 0–100 gerado por IA, resumo da conversa em linguagem natural, próxima ação recomendada, forecast de MRR e atribuição por campanha de origem. Automaticamente. 24/7.

**A jornada em 5 etapas:**
```
1. Lead envia mensagem (WhatsApp às 23h de domingo)
2. Agente responde em 3 segundos
3. IA qualifica: pergunta, analisa, pontua
4. Lead entra no CRM: score + resumo + próxima ação
5. Revenue Attribution: a campanha que trouxe esse lead fica registrada com ROAS implícito
```

---

## 2. Posicionamento

**O Flux Agent Studio não é:**
- Um chatbot builder (não é Typebot, Landbot, Voiceflow)
- Uma ferramenta de broadcast (não é ManyChat)
- Um CRM (não é HubSpot, Pipedrive)
- Uma ferramenta de Q&A com documentos (não é Chatbase)

**O Flux Agent Studio é:**
O sistema que fecha o loop entre a primeira mensagem e a receita gerada — passando por qualificação com IA, CRM nativo e atribuição por campanha. Em uma plataforma. Sem código. Com LGPD nativa.

**O argumento que nenhum concorrente pode rebater:**
> "Mostre-me qual outro sistema fecha o loop da primeira mensagem até a previsão de receita atribuída à campanha de origem — em uma única plataforma, sem código, em conformidade com LGPD."

---

## 3. Revenue OS

"Revenue OS" posiciona o produto como o sistema operacional do processo comercial — assim como o Android é o OS do smartphone, o Flux é o OS do funil de vendas conversacional.

**Os 4 pilares do Revenue OS:**

| Pilar | O que é | O diferencial |
|---|---|---|
| Atração | Agente omnichannel (WA + Web + IG + Telegram) | Mesmo fluxo, todos os canais |
| Qualificação | Lead Intelligence: score 0–100 + resumo IA + next action | Ninguém gera resumo em linguagem natural automaticamente |
| Gestão | CRM nativo: pipeline + kanban + forecast | O CRM se preenche sozinho — zero input manual |
| Receita | Revenue Attribution: campanha → lead → MRR → ROAS | O único que fecha o loop completo |

---

## 4. O Que NÃO Somos (Anti-patterns Visuais e de Copy)

### Visualmente, nunca criar:
- Gradiente roxo/azul como cor primária
- Grid isométrico de fundo (dots ou linhas)
- Glassmorphism em cards de feature
- Chat preview genérico flutuando como hero
- Paleta de blocos "arrastar e soltar" como protagonista visual
- Ícones ilustrativos no lugar de screenshots reais
- Múltiplos loops de animação simultâneos chamativos

### Em copy, nunca escrever:
- "Plataforma all-in-one"
- "Revolucionária" ou "disruptiva"
- "Automatize seu atendimento" (posiciona como SAC, não vendas)
- "Chatbot com IA" como descrição principal
- Listar features sem resultado ("tem score" → "lead chega pontuado sem você fazer nada")

---

## 5. Narrativa Correta

### A sequência de persuasão

```
PROBLEMA: "Lead não respondido = receita perdida para o concorrente"
↓
CAUSA: "Seu time não atende 24/7. A IA atende."
↓
SOLUÇÃO: "O agente qualifica → CRM se preenche → você abre na segunda com pipeline pronto"
↓
PROVA: "Score 89/100. Resumo gerado por IA. ROAS 4.1x atribuído à campanha."
↓
RESULTADO: "R$18.200 de pipeline este mês. +34% MoM."
```

### Headlines que funcionam (para usar em variações)

**Para audiência de PME:**
> "Lead qualificado no CRM antes de você abrir o computador."

**Para audiência geral (mais forte):**
> "Cada conversa que seu time não responde é receita que vai para o concorrente."

**Para audiência de agência:**
> "Prove que seus leads se tornam receita."

**Para audiência de gestor comercial:**
> "Seu time só fala com lead quente."

### Subheadline padrão:
> "Não é um chatbot. É o sistema que transforma cada conversa em dado comercial — score, forecast e atribuição em uma plataforma só."

---

## 6. Identidade Visual

### Paleta de cores (LP V2 — usar sempre)

```
Background principal: #09090C  (dark quasi-preto, leve azul frio)
Background elevado:   #0F0F14  (cards, superfícies elevadas)
Background sutil:     #141419  (seções alternadas)

Primária (Teal):      #0D9488  (identidade, links, bordas de destaque)
Primária dark:        #0F766E  (hover, sombras)
Primária glow:        #14B8A6  (texto teal, glow, eyebrow)

Accent (Âmbar):       #D97706  (CTA principal ÚNICO — "Começar grátis")
Accent light:         #F59E0B  (hover do CTA)
Accent glow:          rgba(217,119,6,0.20)

Texto principal:      #F8FAFC
Texto secundário:     #94A3B8
Texto terciário:      #475569

Borda sutil:          rgba(255,255,255,0.07)
Borda de foco:        rgba(255,255,255,0.12)

Teal/5:  rgba(13,148,136,0.05)   (background de badge teal)
Teal/10: rgba(13,148,136,0.10)   (ícones em background)
Teal/20: rgba(13,148,136,0.20)   (glow de card IA)
```

### Regras de cor invioláveis

1. **Teal = identidade.** Links, ícones, bordas de destaque, eyebrow badges.
2. **Âmbar = ação.** EXCLUSIVAMENTE para o CTA principal "Começar grátis". Nunca em outros elementos.
3. **Nunca misturar teal e âmbar no mesmo componente.**
4. **Sem gradiente no H1.** "O Flux já deu." em teal sólido — nunca `gradient-text`.
5. **Sem grid-bg.** Hero usa radial gradient teal de opacidade 0.15–0.22. Nunca grid.

### Tipografia

```
Display (H1, H2, badges): Space Grotesk
  H1 hero: font-weight 800, letter-spacing -0.03em, line-height 1.02
  H2 seção: font-weight 700, letter-spacing -0.02em, line-height 1.1

Body: Inter
  Regular: font-weight 400, line-height 1.7
  Medium: font-weight 500

Dados/métricas: JetBrains Mono
  tabular-nums, usado em: scores, MRR, ROAS, timestamps
```

### Espaçamento base: 8px (todo espaçamento = múltiplo de 8)

---

## 7. Princípios de Motion

*(baseado em Emil Kowalski — motion serve à compreensão, não à decoração)*

### Regras fundamentais

1. **Animar apenas `opacity` e `transform` (translate, scale)** — nunca width/height/top/left
2. **Amplitude baixa:** translate máximo 16px, scale máximo 1.03 em hover
3. **Easing natural:** `cubic-bezier(0.16, 1, 0.3, 1)` como padrão de entrada
4. **prefers-reduced-motion:** todos os elementos aparecem no estado final, nenhum conteúdo escondido
5. **Máximo 2 loops simultâneos:** hero glow (5s) + bloco IA pulse (3s)

### Tokens de easing

```
Padrão de entrada: cubic-bezier(0.16, 1, 0.3, 1)   /* expo-out */
Hover/spring:      cubic-bezier(0.34, 1.56, 0.64, 1) /* spring leve */
Loops:             cubic-bezier(0.4, 0, 0.6, 1)      /* ease-in-out */
```

### Sequência de entrada do hero (0ms → 4500ms)

```
T+100ms  → Eyebrow badge (fade+slide 8px, 400ms)
T+250ms  → H1 linha 1 (fade+slide 12px, 500ms)
T+380ms  → H1 linha 2 (fade+slide 12px, 500ms)
T+650ms  → Subheadline (fade+slide 10px, 450ms)
T+800ms  → CTAs (fade+slide 8px, 400ms)
T+900ms  → Trust line (fade apenas, 350ms, opacity máx 0.7)
T+1000ms → Mockup container (fade+scale 0.97→1.0, 600ms)
T+1200ms → Interno do mockup começa (nodes, linhas SVG, chat)
T+4500ms → Estado final — background glow respira (5s loop)
```

### Motion Graphics padronizados

| MG | Elemento | Especificação |
|---|---|---|
| MG-01 | Score counter | 0 → N em 1200ms, ease-out, JetBrains Mono tabular-nums |
| MG-02 | SVG draw-on | stroke-dashoffset animation, 250–600ms, teal ou âmbar |
| MG-03 | Badge scale | 0.8→1.0 com spring, 400ms |
| MG-04 | Revenue line chart | barras crescem da base, 800ms; forecast dashed |
| MG-05 | Notification slide | translateY(-100%)→0, 400ms, auto-dismiss 2s |
| MG-06 | Data particles | 3–4 linhas finas fluindo para bloco IA, opacity 0.4 |

---

## 8. Assets Disponíveis

### Estado atual dos assets

**ATENÇÃO:** No momento da criação deste documento, os seguintes assets ainda não existem como arquivos reais no repositório. Precisam ser gerados/capturados:

| Asset | Status | Prioridade |
|---|---|---|
| Screenshot Lead Intelligence (2x) | ❌ Não existe | 🔴 Crítico |
| Screenshot Revenue Attribution (2x) | ❌ Não existe | 🔴 Crítico |
| Screenshot CRM Pipeline com dados (2x) | ❌ Não existe | 🔴 Crítico |
| Screenshot AI Builder gerando (2x) | ❌ Não existe | 🟡 Alta |
| Screenshot Revenue Dashboard (2x) | ❌ Não existe | 🟡 Alta |
| HTML snapshot Lead Intelligence card | ❌ Não existe | 🟡 Alta |
| HTML snapshot Attribution panel | ❌ Não existe | 🟡 Alta |
| Screen recording AI Builder (60fps) | ❌ Não existe | 🟡 Alta |
| Screen recording Score counter | ❌ Não existe | 🟡 Alta |

### Como criar assets Tipo B (HTML Snapshots) — Alternativa imediata

Enquanto screenshots reais não existem, usar HTML auto-contido com dados fictícios realistas.

**Padrão de dados fictícios:**
```
Nomes: Rafael Souza, Marcos Silva, Carla Lima, Beatriz Ferreira
Empresas: Construtora MV, Imobiliária Nova Era, Clínica Estética Luz
Scores: 87, 89, 74, 92 (nunca 95+)
MRR pipeline: R$14.200 a R$18.500
ROAS: 3.8x a 4.2x
CPL: R$18
Horários: 23h42, 08h15, 14h32 (específicos = credíveis)
Canal: WhatsApp (sempre o primeiro)
```

### Estrutura de pastas esperada para assets

```
assets/product-movie/
├── raw/screenshots/
├── raw/screen-recordings/
├── raw/html-snapshots/
├── motion-graphics/
└── output/
```

---

## 9. Screenshots Disponíveis

**Status atual:** nenhum screenshot exportado existe no repositório.

**O que deve existir para execução do Product Movie:**
1. `lead-intelligence-card-2x.png` — card completo com score, resumo IA, next action
2. `revenue-attribution-panel-2x.png` — painel com campanha → ROAS
3. `crm-pipeline-with-leads-2x.png` — kanban com leads e scores visíveis
4. `ai-builder-generating-2x.png` — campo de instrução + fluxo surgindo
5. `revenue-dashboard-2x.png` — MRR + forecast + growth

**Para gerar:** acessar o app em `http://localhost:8080/dashboard` (ou deploy), popular com dados fictícios realistas, capturar com Playwright ou ScreenFlow em resolução 2x.

---

## 10. Jornada Visual Ideal

A jornada visual do visitante na LP segue esta sequência:

```
1. NAV           → "Flux Agent Studio" — categoria: Conversational Revenue OS
2. EYEBROW       → "⚡ Conversational Revenue OS" (badge teal)
3. H1            → dor + resolução em 2 linhas
4. SUBHEADLINE   → "Não é um chatbot. É o sistema que..."
5. CTAs          → âmbar "Começar grátis" + outline "Ver uma conversa virar receita"
6. TRUST LINE    → sem cartão · 14 dias · LGPD · cancele
7. MOCKUP HERO   → Revenue Intelligence (Lead Intelligence + CRM + Attribution)
8. SEÇÃO PROVA   → logos + métricas de resultado
9. SEÇÃO JORNADA → PublicBot → IA → Lead Intelligence → CRM (scrollytelling)
10. SEÇÃO PRODUTO → AI Builder ao vivo
11. SEÇÃO REVENUE → Dashboard MRR + Attribution
12. FAQ + LGPD   → objeções removidas
13. CTA FINAL    → bloco âmbar com argumento nuclear
14. FOOTER       → links + marca
```

**Regra de hierarquia visual por seção:**
- Seções de produto: screenshot/mockup do produto como elemento visual primário (nunca ícone isolado)
- Seções de prova: números reais em destaque (fonte mono, tabular-nums)
- Seções de narrativa: texto denso mas respirável (line-height 1.7, parágrafos curtos)

---

## 11. Landing Page V2

### O que já foi implementado

**Hero V2 (commit `c896ef5`):**
- Nav com "Flux Agent Studio" + Zap icon teal + CTA âmbar
- Eyebrow "CONVERSATIONAL REVENUE OS"
- H1: "Seu próximo cliente está esperando resposta. O Flux já deu."
- Subheadline, CTAs, trust line com LGPD
- Mockup com canvas animado (Builder-first) — **awaiting refinement**

**O que precisa ser refinado (aprovado em HERO-REFINEMENT.md):**
- Substituir mockup Builder-first por Revenue Intelligence (Lead Intelligence + CRM + Attribution)
- Substituir headline atual pela versão Revenue-first aprovada
- Substituir subheadline por "Não é um chatbot. É o sistema..."
- Substituir "Ver demonstração" por "Ver uma conversa virar receita"

**O que ainda não existe:**
- Seções 3–12 da LP (Prova, Jornada, Produto, Revenue, FAQ, CTA Final)
- Seções futuras aguardam aprovação do Hero refinado primeiro

---

## 12. Os Vídeos

### Hierarquia de vídeos

```
Nível 1: Director's Cut (90s, 16:9) — todas as 8 cenas
Nível 2: LP Hero Loop (30–45s, 16:9) — cenas 2+3+4+5
Nível 3: Performance Ads (15–30s, 1:1 ou 9:16) — variações por ICP
Nível 4: Google Bumper (6s, 16:9) — 1 cena + logo
Nível 5: Onboarding (60s, 16:9) — cenas 2+3+4+5
```

### As 8 cenas do Director's Cut

| # | Nome | Duração | Tela principal |
|---|---|---|---|
| 1 | O Problema | 12s | WhatsApp sem resposta |
| 2 | A Conversa | 16s | PublicBot ao vivo |
| 3 | A IA | 14s | Bloco IA + score subindo |
| 4 | Lead Intelligence | 18s | Card completo (protagonista) |
| 5 | CRM | 12s | Pipeline preenchido |
| 6 | Revenue | 12s | MRR dashboard |
| 7 | Attribution | 18s | ROAS por campanha |
| 8 | O Resultado | 12s | Segunda-feira, pipeline pronto |

---

## 13. Hero Loops

**O Hero Loop é o vídeo de 30–45s que roda em autoplay muted na LP.**

**Conteúdo do loop (cenas 2+3+4+5):**
- Sem cena do problema (visitante já está na LP, contexto estabelecido)
- Começa direto no produto funcionando
- Mostra: conversa → IA → Lead Intelligence → CRM
- Termina no score + pipeline → volta ao início (loop suave)

**Regras do loop:**
- Autoplay muted obrigatório
- Deve contar a história SEM SOM (teste de narração visual obrigatório)
- Duração total incluindo fadeout: ≤ 45 segundos
- Loop crossfade: dissolve de 500ms no último para o primeiro frame

---

## 14. Ads

### Meta Ads (Feed 1:1, 15s)

**Versão PME:**
```
0:00–0:03 Problema: WhatsApp sem resposta (texto: "Esse lead não voltou.")
0:03–0:09 Score surgindo: 0 → 89/100
0:09–0:13 Trust: "Respondido em 3s. Score em 60s. CRM automático."
0:13–0:15 Logo + "Começar grátis"
```

**Versão Agência (Attribution):**
```
0:00–0:03 Dor: "Qual campanha fechou o cliente?"
0:03–0:10 Attribution: seta âmbar Campanha → ROAS 4.1x
0:10–0:13 "Prove o ROI de cada lead que você gera."
0:13–0:15 Logo + "Começar grátis"
```

### Meta Stories/Reels (9:16, 15–30s)

**Estrutura vertical — regra: uma tela = um argumento**

```
Hierarquia de frame vertical:
[8% topo]   badge de categoria
[70% meio]  tela do produto (zoom single-element)
[22% base]  copy + CTA
```

### Google Bumper (6s, 16:9)

**Apenas um argumento, logo no final:**
```
0:00–0:04 Score 89/100 aparecendo (zoom in no Lead Intelligence card)
0:04–0:05 "Lead qualificado. Automático."
0:05–0:06 Logo + tagline
```

---

## 15. Motion Graphics (Referência Rápida)

| Código | Nome | Onde usar | Duração | Easing |
|---|---|---|---|---|
| MG-01 | Score Counter | Cena 3 + 4 + Google Ads | 1200ms | ease-out |
| MG-02 | SVG Draw-on (teal) | Conexões canvas + jornada | 250–600ms | expo-out |
| MG-02b | SVG Draw-on (âmbar) | Attribution seta | 600ms | expo-out |
| MG-03 | Badge Scale | Lead Intelligence card | 400ms | spring |
| MG-04 | Revenue Line | Cena 6 | 800ms | ease-in-out |
| MG-05 | Notification | Cena 8 + LP hero | 400ms + 2s hold | ease-out |
| MG-06 | Data Particles | Cena 3 (IA block) | 600ms loop | ease-in-out |

---

## Glossário de Termos Oficiais

| Use | Não use |
|---|---|
| Flux Agent Studio | FluxBot, Flux, Fluxbot |
| Conversational Revenue OS | chatbot platform, builder |
| Agente | bot, chatbot, robô |
| Lead Intelligence | lead scoring, pontuação |
| Revenue Attribution | rastreamento, tracking |
| AI Builder | gerador automático, wizard |
| Knowledge Base | base de conhecimento |
| Connector Hub | integrações, webhooks |
| Score 0–100 | pontuação, ranking |
| ROAS implícito | retorno sobre anúncio |
| Pipeline | funil de vendas |

---

*Criado: 2026-06-03 · FASE 26A.8*  
*Este documento é self-contained — suficiente para briefar Claude Design sem contexto adicional.*
