# Flux Agent Studio — Claude Design Execution Prompt
## FASE 26A.8 · Prompt Final Otimizado para Copiar e Colar

> Este arquivo contém prompts prontos para uso no Claude Design.
> Cada prompt é auto-contido, otimizado e baseado em toda a documentação estratégica.
> Copiar o prompt da seção relevante e colar diretamente no Claude Design.

---

## PROMPT MASTER (Hero V2 + Motion + LP Visual System)

> Usar este prompt como base para qualquer geração visual do Flux Agent Studio.
> Inclui todo o contexto necessário. Adaptar a seção "TAREFA ESPECÍFICA" para cada uso.

---

```
Você está criando assets visuais para o Flux Agent Studio — um Conversational Revenue OS para o mercado brasileiro B2B.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IDENTIDADE DO PRODUTO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Nome: Flux Agent Studio
Empresa: Fluxrow
Categoria: Conversational Revenue OS
Idioma: Português do Brasil (PT-BR)

O produto transforma conversas (WhatsApp, Web, Instagram) em:
→ Lead qualificado com Score 0–100 (gerado por IA, 7 fatores)
→ Resumo da conversa em linguagem natural (ex: "Decisor único. Budget R$900/mês.")
→ Próxima ação recomendada automaticamente
→ Entry no CRM com forecast de MRR
→ Revenue Attribution: qual campanha gerou qual real (ROAS implícito)

Tudo automático. 24/7. Sem código. LGPD nativa.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
O QUE NÃO SOMOS (CRÍTICO — LER ANTES DE QUALQUER VISUAL)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ NÃO somos um chatbot builder (≠ Typebot, Landbot, Voiceflow)
❌ NÃO somos ferramenta de broadcast (≠ ManyChat)
❌ NÃO somos um CRM (≠ HubSpot, Pipedrive)
❌ NÃO somos ferramenta de Q&A (≠ Chatbase)

TESTE OBRIGATÓRIO: cobrir o logo e perguntar "o que é isso?".
Se a resposta for "chatbot builder", "CRM", ou "ferramenta de marketing" → revisar.
A resposta correta é "Revenue OS" ou "sistema de inteligência comercial".

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IDENTIDADE VISUAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CORES:
Background:   #09090C  (dark quasi-preto, leve azul frio)
Bg elevado:   #0F0F14  (cards)
Bg sutil:     #141419  (seções alternadas)
Teal:         #0D9488  (identidade, links, bordas de destaque)
Teal glow:    #14B8A6  (texto em destaque, eyebrow)
Âmbar:        #D97706  (CTA principal APENAS — nunca outro elemento)
Âmbar hover:  #F59E0B
Texto:        #F8FAFC
Muted:        #94A3B8
Borda:        rgba(255,255,255,0.07)
Borda foco:   rgba(255,255,255,0.12)
Teal/10:      rgba(13,148,136,0.10)

REGRAS DE COR INVIOLÁVEIS:
→ Âmbar EXCLUSIVO para botão "Começar grátis". Nada mais.
→ Teal para identidade, links, destaques. Nunca em botão de conversão.
→ NUNCA gradiente no H1. Texto em teal sólido apenas.
→ NUNCA grid isométrico de fundo.
→ Glow de fundo: radial gradient teal opacity 0.15–0.22. Nunca grid.

TIPOGRAFIA:
H1 hero:   Space Grotesk 800, tracking -0.03em, line-height 1.02
H2 seção:  Space Grotesk 700, tracking -0.02em, line-height 1.1
Body:      Inter 400, line-height 1.7
Dados:     JetBrains Mono, tabular-nums (scores, MRR, ROAS, timestamps)

MODO: Dark-only. Fundo #09090C em todos os assets.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COPY OFICIAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Eyebrow:      "⚡ Conversational Revenue OS"
H1 (opção A): "Cada conversa que seu time não responde é receita que vai para o concorrente."
H1 (opção B): "Lead qualificado no CRM antes de você abrir o computador."
Subheadline:  "Não é um chatbot. É o sistema que transforma cada conversa em dado comercial — score, forecast e atribuição em uma plataforma só."
CTA primário: "Começar grátis →" (âmbar)
CTA sec.:     "Ver uma conversa virar receita" (outline)
Trust line:   "✓ Sem cartão de crédito  ✓ 14 dias grátis  ✓ LGPD compliant  ✓ Cancele quando quiser"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TELAS DE MAIOR IMPACTO (priorizar nesta ordem)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

#1 LEAD INTELLIGENCE CARD (protagonista absoluto):
┌─────────────────────────────────────────────┐
│  LEAD — Rafael Souza                        │
│  Score: 89 / 100   ↑ Alto potencial         │
│  ⚡ WhatsApp · Dom 23h42                    │
│                                             │
│  Resumo IA:                                 │
│  "Decisor único. Budget R$900/mês.          │
│   Quer proposta até quarta."                │
│                                             │
│  Próxima ação: Enviar proposta →            │
└─────────────────────────────────────────────┘
Score teal/âmbar. Resumo em Inter 13px muted. Next action em âmbar.

#2 REVENUE ATTRIBUTION (argumento nuclear para agências):
┌─────────────────────────────────────────────┐
│  Meta Ads · "Imob Nov"                      │
│  47 leads → 31 qualificados (66%)           │
│  MRR atribuído: R$12.400                    │
│  ROAS implícito: 4.1x   ←── destacar       │
└─────────────────────────────────────────────┘
Seta âmbar conectando campanha → ROAS. ROAS em destaque.

#3 CRM PIPELINE:
┌──────────────────────────────────────────────────┐
│  Qualificados 14  │  Contato 9  │  Proposta 4     │
│  ────────────     │  ────────   │  ─────────       │
│  [Rafael 89]      │  [Carla 74] │  [Marcos 92]    │
│  [Beatriz 81]     │  [João 67]  │                 │
│                                                   │
│  MRR total: R$18.200/mês    +34% MoM ↑           │
└──────────────────────────────────────────────────┘
MRR em JetBrains Mono. Scores visíveis em cada card.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MOTION PRINCIPLES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

→ Animar apenas: opacity e transform (translate, scale). NUNCA width/height/top/left.
→ Easing padrão: cubic-bezier(0.16, 1, 0.3, 1) para entradas
→ Hover/spring: cubic-bezier(0.34, 1.56, 0.64, 1)
→ Amplitude máxima: translate 16px, scale 1.03
→ Duração de movimentos de câmera: 400–1200ms (nunca fora desse range)
→ Máximo 2 tipos de transição por vídeo
→ Score counter: JetBrains Mono, sobe de 0 ao valor em 1200ms
→ SVG draw-on (stroke-dashoffset): teal para fluxo, âmbar para receita
→ prefers-reduced-motion: tudo aparece no estado final, sem transição

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DADOS FICTÍCIOS PADRONIZADOS (usar sempre estes)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Nomes: Rafael Souza, Marcos Silva, Carla Lima, Beatriz Ferreira
Empresas: Construtora MV, Imobiliária Nova Era, Clínica Estética Luz
Scores: 87, 89, 74, 92 (NUNCA 95+ — parece fabricado)
MRR pipeline: R$14.200 a R$18.500
ROAS: 3.8x a 4.2x (credível para Meta Ads Brasil)
CPL: R$18
Horários: 23h42, 08h15, 14h32 (específicos = credíveis)
Canais: WhatsApp primeiro, Web segundo

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREFA ESPECÍFICA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[SUBSTITUIR AQUI — ver seções abaixo para tarefas específicas]
```

---

## PROMPT 1 — Hero V2 Refinado (Mockup Revenue-first)

Adicionar ao final do PROMPT MASTER:

```
TAREFA ESPECÍFICA: Hero V2 — Mockup Revenue-first

Criar o mockup do hero da landing page com as seguintes especificações:

LAYOUT:
- Chrome bar no topo: "fluxagent.studio/intelligence"
- 3 painéis horizontais:
  ESQUERDO (25%): Pipeline CRM com MRR
  CENTRAL (45%): Lead Detail — Lead Intelligence completo
  DIREITO (30%): Revenue Attribution com ROAS

PAINEL ESQUERDO — Pipeline:
- Header: "PIPELINE" em uppercase tracking-wide, 10px, muted
- Linhas: "Qualificados 14 · Contato 9 · Proposta 4"
- Separador
- "MRR total: R$18.200/mês" em JetBrains Mono, teal glow
- "+34% MoM ↑" em verde (#4ade80)

PAINEL CENTRAL — Lead Intelligence (protagonista):
- Header: "LEAD — Rafael Souza"
- Score badge: "89 / 100" grande (Space Grotesk 800, teal), "↑ Alto potencial" em verde
- "⚡ WhatsApp · Dom 23h42" em 11px muted com ícone âmbar
- Linha divisória
- "Resumo IA:" em uppercase tracking 10px muted
- Texto: "Decisor único. Budget R$900/mês. Quer proposta até quarta." em Inter 13px
- "Próxima ação:" label + "Enviar proposta →" em âmbar com seta

PAINEL DIREITO — Attribution:
- Header: "ATRIBUIÇÃO" uppercase tracking muted
- Card: "Meta · 'Imob Nov'" → "47 leads · 66% qualif." → "MRR: R$12.400" → "ROAS: 4.1x" EM DESTAQUE (âmbar bold)
- Segundo card menor: "Google · 'SDR Nov'" → "22 leads · 41% qualif." → "R$5.100"
- Footer: "CPL: R$18 → LTV: R$1.200" em muted

ANIMAÇÃO (sequência após mockup aparecer):
1. 1200ms: Painel esquerdo faz fade in
2. 1400ms: Score badge aparece com scale 0.8→1.0 (spring)
3. 1600ms: Linhas do resumo aparecem uma a uma (stagger 150ms)
4. 1900ms: "Próxima ação" pulsa suavemente em âmbar (1 vez, não loop)
5. 2200ms: Seta âmbar do painel direito se desenha (stroke-dashoffset)
6. 2500ms: ROAS "4.1x" aparece em destaque (scale 0.9→1.0)
7. Estado final: score pulsa levemente em loop 4s (opacity 1.0→0.85→1.0)

IMPORTANTE:
- Zero palette de blocos
- Zero canvas de builder
- Zero chat preview genérico
- URL chrome: "/intelligence" não "/builder"
- Esse mockup deve, ao ser visto sem o logo, parecer uma categoria nova — não HubSpot nem Typebot
```

---

## PROMPT 2 — Product Film (Director's Cut 90s)

Adicionar ao final do PROMPT MASTER:

```
TAREFA ESPECÍFICA: Product Film — Director's Cut 90 segundos

Criar storyboard animado de 8 cenas em formato 16:9 (1920×1080).

CENA 1 (0:00–0:12) — O Problema
Visual: smartphone com WhatsApp, notificação "Olá, tenho interesse". Contador de tempo: 5min → 30min → 2h. Texto final: "Mensagem não respondida." Cor: dessaturada, sem teal. Fade to black.
Copy: "Esse lead não voltou."
Motion: texto do contador em JetBrains Mono, aparece progressivamente. Fade to black em 300ms.

CENA 2 (0:12–0:28) — A Conversa
Visual: 70% WhatsApp chat, 30% canvas desfocado ao fundo. Bot responde em 3 segundos. Badge teal: "Respondido em 3s". Qualificação em andamento.
Copy: "Respondido em 3 segundos. Às 23h de domingo."
Motion: bolhas aparecem completas (não letra-a-letra). Canvas ao fundo em blur 8px.

CENA 3 (0:28–0:42) — A IA
Visual: zoom-in no bloco "IA ✦" do canvas. Glow teal pulsando. Score counter subindo: 0 → 89. Dados fluindo (3 linhas finas, opacity 0.4).
Copy: "A IA leu a conversa. Pensou. Pontuou."
Motion: zoom 1.0→1.15 em 600ms expo-out. Counter em 1200ms ease-out. Glow loop 3s.

CENA 4 (0:42–1:00) — Lead Intelligence [CENA MAIS LONGA — ARGUMENTO CENTRAL]
Visual: Lead Intelligence Card aparecendo element-by-element em tela quase cheia.
Ordem: Nome → Score badge (scale spring) → canal+horário → Resumo IA linha a linha → Próxima ação (âmbar pulse).
Copy: "Não é só um lead. É inteligência. Gerada automaticamente."
Motion: cada elemento com lpEnter (translateY 12px → 0, opacity). Score badge: spring 0.8→1.0.

CENA 5 (1:00–1:12) — CRM
Visual: morph do card → chip no pipeline. Kanban aparece. Lead entra na coluna Qualificado. Pan left→right (imagem de progresso).
Copy: "No CRM. Antes de você acordar."
Motion: morph 400ms. Pan 15% do frame em 800ms ease-in-out.

CENA 6 (1:12–1:24) — Revenue
Visual: MRR Dashboard. Counter R$0 → R$18.200 (devagar — tem peso). "+34% MoM" em verde. Linha de forecast (stroke-dashoffset dashed).
Copy: "R$18.200 de pipeline. Gerado por conversas. Sem SDR."
Motion: counter 2000ms ease-out (desacelera no final). Forecast line 800ms.

CENA 7 (1:24–1:42) — Attribution [SEGUNDA CENA MAIS LONGA]
Visual: painel de Attribution. Seta âmbar se desenha da esquerda (campanha) para direita (ROAS). Números aparecem em sequência. ROAS "4.1x" em destaque — hold 1.5s.
Copy: "Você sabe exatamente qual campanha gerou qual real."
Motion: seta stroke-dashoffset âmbar 600ms. Pan acompanha a seta. ROAS: scale 1.0→1.05 no hold.

CENA 8 (1:42–1:54) — O Resultado
Visual: zoom-out máximo para Intelligence Dashboard completo. Timestamp: segunda 08h15. Notificação slide-in: "14 leads qualificados enquanto você dormia." Câmera estática. Fade final com logo.
Copy: "Flux Agent Studio. Seu processo comercial não para mais."
Motion: zoom-out 1.15→1.0 em 800ms. Notificação translateY(-100%)→0, 400ms, dismiss 2s. Logo fade in 600ms.

ENTREGA: vídeo MP4 H.264, 1920×1080, 24fps mínimo.
```

---

## PROMPT 3 — Hero Loop (LP Autoplay)

Adicionar ao final do PROMPT MASTER:

```
TAREFA ESPECÍFICA: Hero Loop — 30–45 segundos, autoplay muted

Criar vídeo loop para a landing page. Sem a cena do problema.
Produto em ação, sem contexto de dor (visitante já está na LP).

SEQUÊNCIA (cenas 2+3+4+5):

0:00–0:08 — Conversa
WhatsApp: "Tenho interesse no serviço." → agente responde: "Olá! Sou a IA da Flux." → "Qual o seu nome e empresa?"
Badge "Respondido em 3s" surge em teal.

0:08–0:16 — IA processando
Zoom no bloco IA com glow teal. Score subindo 0 → 87. Dados fluindo (linhas finas teal).

0:16–0:28 — Lead Intelligence (mais longa)
Card completo aparece: Score → Resumo IA → Próxima ação.
"WhatsApp · Dom 23h42" em destaque.

0:28–0:38 — CRM
Pipeline com 14 leads qualificados. Lead de Rafael no kanban. MRR: R$14.200/mês.

0:38–0:43 — Attribution sneak
ROAS "4.1x" aparece como último frame. Teaser do argumento nuclear.

0:43–0:45 — Crossfade loop
Dissolve suave para o frame inicial da conversa.

REGRAS DO LOOP:
→ Autoplay muted: a história deve ser compreensível sem som
→ Duração total: máx 45s incluindo crossfade
→ Crossfade: dissolve 500ms no último frame
→ Sem copy sobreposta (LP já tem o copy acima do mockup)
→ Fundo: #09090C constante — sem flash de cor clara entre cenas
```

---

## PROMPT 4 — Meta Ads (15s, 1:1 — Versão PME)

Adicionar ao final do PROMPT MASTER:

```
TAREFA ESPECÍFICA: Meta Ads — 15 segundos, formato 1:1 (1080×1080)

ICP: Dono de PME, serviços (imobiliária, clínica, educação)
Objetivo: awareness + conversão para LP
Formato: feed Meta (não stories)

ESTRUTURA:
0:00–0:03
Tela escura. Texto aparece: "Quantos leads foram pro concorrente esta semana?"
Fonte Space Grotesk 700, teal glow, 32px, center.

0:03–0:10
Score Card em tela central (80% do frame).
Badge "89/100" aparece com scale spring.
"⚡ WhatsApp · Dom 23h42" abaixo.
Resumo IA: "Decisor único. Budget R$900/mês." — fade in linha a linha.
Background: #09090C. Bordas teal/20. Dados em Inter 13px.

0:10–0:13
CTA na área inferior:
"Lead qualificado antes de você acordar."
Fonte Inter 500, 18px, branco.

0:13–0:15
Logo + nome: ícone Zap teal + "Flux Agent Studio"
Tagline: "Conversational Revenue OS"
CTA botão: "Começar grátis →" (âmbar, rounded-xl)

REGRAS DO FRAME 1:1:
→ Elemento principal: 60–70% do frame
→ Texto de apoio: 20% inferior
→ Sem dois painéis lado a lado
→ Score badge: o maior elemento visual
→ Fundo: sempre #09090C
```

---

## PROMPT 5 — Meta Stories/Reels (15s, 9:16)

Adicionar ao final do PROMPT MASTER:

```
TAREFA ESPECÍFICA: Meta Stories/Reels — 15 segundos, formato 9:16 (1080×1920)

ICP: qualquer — formato viral, audiência ampla
Objetivo: awareness, recall de marca, tráfego para LP

ESTRUTURA VERTICAL:
[8% topo]   — badge teal "⚡ Conversational Revenue OS"
[70% meio]  — tela do produto (zoom único no elemento principal)
[22% base]  — copy + CTA

SEQUÊNCIA:
0:00–0:04
Problema: fundo roxo desbotado (cor do "antes"). Texto central:
"Seu lead mandou no concorrente."
Fonte Space Grotesk 700, 38px.
Transition: wipe teal horizontal, 300ms.

0:04–0:10
Lead Intelligence Card em zoom (70% do frame vertical).
Score badge: 89/100 surge (scale spring, teal).
Texto base: "Qualificado pela IA. Automático."

0:10–0:13
Attribution sneak: "ROAS 4.1x atribuído" em fundo teal/10.
Texto: "Você sabe qual campanha fechou."

0:13–0:15
Logo + CTA: "Começar grátis →" (âmbar, full-width, rounded-xl, h-14)
URL: fluxagent.studio

REGRAS DO FRAME 9:16:
→ Um elemento = um argumento. Nunca dois painéis lado a lado.
→ Tipografia: 20% maior que 16:9 (leitura em mobile)
→ CTA: botão full-width no terço inferior
→ Sem texto no topo (UI do Stories sobrepõe)
→ Safe zone: 150px no topo e 250px na base
```

---

## PROMPT 6 — Google Bumper (6s, 16:9)

Adicionar ao final do PROMPT MASTER:

```
TAREFA ESPECÍFICA: Google Bumper — 6 segundos, 16:9

Objetivo: recall de marca. Argumento em 1 imagem + logo.
Sem narração longa. Um argumento visual. Logo. Fim.

ESTRUTURA:
0:00–0:04
Lead Intelligence Card em tela quase cheia (central, 85% do frame).
Score badge "89/100" em teal. Resumo IA visível (não precisa ser legível inteiro).
Badge lateral: "⚡ WhatsApp · Dom 23h42".
Texto superior: "Qualificado. Automático."
Motion: fade in 300ms. Score badge scale spring 0.8→1.0.

0:04–0:05
Copy simples, centro inferior:
"Conversas que viram receita."
Fonte Space Grotesk 600, 22px, branco.

0:05–0:06
Logo em fade:
Ícone Zap teal + "Flux Agent Studio" + tagline "Conversational Revenue OS"
Fade in 400ms. Hold até fim.

REGRA: o espectador não precisa ler o resumo IA — só precisa ver que existe
algo denso e inteligente. O "uau" visual é o argumento. A legibilidade total é secundária.
```

---

## PROMPT 7 — LP Sections (Visual System completo)

Adicionar ao final do PROMPT MASTER:

```
TAREFA ESPECÍFICA: LP Sections — Sistema Visual Completo

Criar o visual system para as seções da landing page V2 após o hero.
O hero já existe (mockup Revenue-first com Lead Intelligence).

SEÇÃO 2 — Prova Social (logos + métricas)
Layout: faixa horizontal, fundo #0F0F14, border teal/10 top e bottom.
Métricas: "3.200+ leads qualificados" · "87% taxa de qualificação" · "4.1x ROAS médio"
Formato de métrica: número em Space Grotesk 800 teal, label em Inter 14px muted.
Logos: placeholder de 6 logos de clientes beta (escala de cinza, opacity 0.5, filtro para dark).

SEÇÃO 3 — Jornada (scrollytelling)
5 passos em alternância L/R:
1. Conversa chega → Screenshot PublicBot + copy "O lead chegou. O agente já está atendendo."
2. IA qualifica → Screenshot bloco IA com glow + copy "A IA leu. Pontuou. Em segundos."
3. Lead Intelligence → Screenshot card completo + copy "Score. Resumo. Próxima ação. Automático."
4. CRM preenchido → Screenshot pipeline + copy "No CRM. Antes de você acordar."
5. Attribution → Screenshot painel + copy "Qual campanha gerou qual real. Finalmente."

Linha conectora: SVG vertical teal, stroke-dashoffset, anima ao entrar no viewport.

SEÇÃO 4 — AI Builder
Layout: destaque único, max-w-4xl, centralizado.
Visual: mockup do AI Builder com campo de instrução preenchido e fluxo surgindo.
Copy: "Descreva o agente que você quer. Em 10 minutos está qualificando leads."
Sub: "O AI Builder transforma linguagem natural em fluxo completo — com CRM configurado, Knowledge Base e webhook prontos."
CTA: "Testar o AI Builder →" (âmbar)

SEÇÃO 5 — Revenue e Attribution
Layout: dois cards lado a lado em desktop, empilhados em mobile.
Card 1 (Revenue): MRR Dashboard screenshot + copy "Pipeline que se preenche sozinho."
Card 2 (Attribution): Attribution panel screenshot + copy "Sabe exatamente qual campanha fecha."
Border: card Revenue em teal/20, card Attribution em âmbar/20.

SEÇÃO 6 — FAQ + LGPD
Accordion com 6 perguntas:
1. "É diferente de um chatbot?" → "Totalmente. Um chatbot responde. O Flux qualifica, pontua e gera receita."
2. "Preciso saber programar?" → "Não. Texto em linguagem natural cria o agente completo."
3. "Funciona com WhatsApp?" → "Sim. E também com Web, Instagram e Telegram — o mesmo agente."
4. "Como funciona a atribuição?" → explicação do loop UTM → lead → receita
5. "É compatível com LGPD?" → "Compliance Layer nativa: consentimento, audit log, exclusão automática."
6. "Posso integrar com meu CRM atual?" → "Connector Hub conecta com Sheets, Pipedrive, HubSpot via webhook configurado."

SEÇÃO 7 — CTA Final
Background: #141419 com borda teal/20, border-radius 24px.
Glow central: radial âmbar/10.
H2: "Seu processo comercial não para mais às 18h."
Sub: "Do primeiro 'oi' à previsão de receita — automático. Comece grátis hoje."
CTA: "Começar grátis →" (âmbar, h-14, px-10)
Trust line: "✓ Sem cartão · ✓ 14 dias · ✓ LGPD · ✓ Cancele quando quiser"

SISTEMA DE CARDS:
→ Border: 1px solid rgba(255,255,255,0.07)
→ Background: #0F0F14
→ Border-radius: 16px
→ Padding: 24px
→ Hover: translateY(-4px), border-color rgba(13,148,136,0.25), 200ms ease-out
→ NUNCA glassmorphism em cards de feature
```

---

## Checklist de Qualidade (Usar Após Qualquer Geração)

```
□ Cobri o logo — o asset ainda comunica Revenue OS? (meta: sim)
□ Sem gradiente roxo? ✓
□ Sem grid isométrico de fundo? ✓
□ Sem glassmorphism em cards? ✓
□ Lead Intelligence está como protagonista? ✓
□ Score nunca é > 92? ✓
□ MRR está em range credível (R$14–18k)? ✓
□ ROAS está em range credível (3.8–4.2x)? ✓
□ Horário de conversa é específico (ex: 23h42, não 23h)? ✓
□ URL no chrome bar é /intelligence ou /crm, nunca /builder? ✓
□ Âmbar APENAS no CTA "Começar grátis"? ✓
□ Teal para identidade, nunca em botão de conversão? ✓
□ Sem chat preview genérico como protagonista? ✓
□ Se vídeo: passa no teste mudo (compreensível sem som)? ✓
□ Se vídeo: máximo 2 tipos de transição? ✓
□ Se vídeo: movimentos de câmera entre 400–1200ms? ✓
```

---

*Criado: 2026-06-03 · FASE 26A.8*  
*Uso: copiar o PROMPT MASTER + o prompt da tarefa específica → colar no Claude Design.*  
*Cada prompt é auto-contido e não requer leitura de documentos adicionais.*
