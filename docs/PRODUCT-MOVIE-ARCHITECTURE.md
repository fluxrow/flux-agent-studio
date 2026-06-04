# Flux Agent Studio — Product Movie Architecture
## FASE 26D.1 · Sistema Cinematográfico de Vídeos do Produto

> Define como transformar o produto real em uma sequência de vídeos para LP,
> Meta Ads, Google Ads, LinkedIn, Sales Deck e Onboarding.
> Perspectiva: diretor de produto, CMO, editor de vídeo, operador de Claude Design.
> Não implementa. Define a arquitetura completa para execução futura.

---

## Premissa

Screenshots estáticos vendem funcionalidades.  
Vídeos vendem transformações.

O Flux Agent Studio precisa de ambos — mas o vídeo é onde a narrativa de Revenue OS se torna irrefutável. Nenhum concorrente pode mostrar, em 90 segundos, uma conversa de WhatsApp virando um pipeline com MRR em reais e ROAS atribuído por campanha. Porque nenhum faz isso.

**Objetivo do sistema de vídeos:** tornar a promessa visceralmente óbvia antes de qualquer copy ser lida.

---

## Nota sobre docs não encontrados

`docs/JOURNEY-ASSETS.md` e `docs/LP-ASSETS-FINAL.md` não existem ainda.  
Este documento foi escrito com base nos docs disponíveis e serve como referência
para quando esses assets forem criados. Os storyboards abaixo definem
exatamente quais telas/capturas precisarão constar nesses documentos.

---

## Parte 1 — Telas de Maior Percepção de Valor

### Classificação por impacto visual × diferenciação competitiva

| Tela | Percepção de Valor | Diferenciação | Score |
|---|---|---|---|
| Lead Intelligence (Score + Resumo IA + Próx. Ação) | 10 | 10 | 20/20 |
| Revenue Attribution (Campanha → MRR → ROAS) | 10 | 10 | 20/20 |
| AI Builder gerando fluxo em tempo real | 9 | 10 | 19/20 |
| Pipeline CRM com MRR em reais + forecast | 9 | 8 | 17/20 |
| PublicBot respondendo em WhatsApp + Web + IG | 8 | 7 | 15/20 |
| Tracking Inspector com UTM → lead → receita | 8 | 9 | 17/20 |
| Builder Canvas com IA Block + conexões | 6 | 5 | 11/20 |
| Chat preview (conversa genérica) | 4 | 2 | 6/20 |
| Config de Connector Hub | 5 | 6 | 11/20 |

**Top 4 telas para qualquer vídeo de produto:**
1. Lead Intelligence
2. Revenue Attribution
3. AI Builder (geração ao vivo)
4. Pipeline CRM com MRR

---

## Parte 2 — Ordem de Aparição

### Princípio: Dor → Causa → Solução → Prova → Resultado

**Erros comuns de ordem em SaaS:**
- Mostrar o produto antes de nomear o problema → o visitante não tem contexto para valorizar o que vê
- Mostrar o builder antes de mostrar o resultado → vende ferramenta, não transformação
- Mostrar números antes de explicar de onde vieram → parece genérico

**Ordem correta para o Flux:**

```
Frame 1: O problema (dor reconhecível)
Frame 2: O input (conversa acontece)
Frame 3: A IA trabalhando (inteligência em movimento)
Frame 4: O output imediato (Lead Intelligence)
Frame 5: O destino (CRM com score e resumo)
Frame 6: O número (MRR pipeline)
Frame 7: A prova (Attribution: campanha → real)
Frame 8: O resultado (segunda-feira de manhã — pipeline preenchido)
```

Essa sequência segue a estrutura PAS-T (Problema → Agitação → Solução → Transformação) em formato visual.

---

## Parte 3 — Storyboard Principal (LP Hero + Sales Deck)

### Duração base: 90 segundos (versão completa)

---

### 🎬 CENA 1 — O Problema (0:00 – 0:12)

**Visual:**
Tela escura. Cursor piscando. Notificação de WhatsApp aparece: "Olá, tenho interesse no serviço."  
Contador de tempo passa: 5 min → 30 min → 2h → "Mensagem não respondida."  
Lead marca o rival como escolhido.

**Motion:**
- Câmera estática, plano fechado no smartphone
- Texto do contador: fonte mono, aparece em fade, velocidade crescente
- Cor: roxo desbotado (mundo sem Flux) — contraste deliberado com teal do produto
- Fade to black no "mensagem não respondida"

**Copy sobreposta (se vídeo com texto):**
> `"Esse lead não voltou."`

**Duração:** 12 segundos  
**Emoção: reconhecimento + dor**

---

### 🎬 CENA 2 — A Conversa (0:12 – 0:28)

**Visual:**
Interface do PublicBot no WhatsApp. Mensagem chega.  
Em 3 segundos: agente responde.  
Fluxo de qualificação: nome → interesse → orçamento → decisor.  
Cada resposta do usuário faz um nó no canvas ficar verde ao fundo (vidro).

**Motion:**
- Split: 70% WhatsApp chat (foco), 30% canvas ao fundo em desfoque
- Digitação sem letra-a-letra: bolhas aparecem completas (mais natural)
- Timeline visual: "Respondido em 3s" aparece como badge teal
- Fade de entrada: canvas aparece revelado progressivamente ao fundo

**Copy sobreposta:**
> `"Respondido em 3 segundos. Às 23h de domingo."`

**Duração:** 16 segundos  
**Emoção: alívio + surpresa**

---

### 🎬 CENA 3 — A IA (0:28 – 0:42)

**Visual:**
Zoom no nó "IA ✦ Qualifica" do canvas. Glow teal pulsando.  
Dado fluindo para dentro: nome, interesse, orçamento, hesitações detectadas.  
Score sendo calculado: barra preenchendo 0 → 89/100.

**Motion:**
- Câmera: zoom-in suave (scale 1.0 → 1.15) no bloco IA, easing expo-out
- Partículas de dados fluindo para o bloco (sem exagero — 3–4 linhas finas)
- Score counter: fonte mono, tabular-nums, sobe de 0 a 89 em 1.2s
- Glow loop: aiGlow teal conforme especificado em HERO-MOTION.md

**Copy sobreposta:**
> `"A IA leu a conversa. Pensou. Pontuou."`

**Duração:** 14 segundos  
**Emoção: confiança + interesse**

---

### 🎬 CENA 4 — Lead Intelligence (0:42 – 1:00)

**Visual:**
Card de Lead Intelligence em tela cheia. Aparece element-by-element:
1. Nome + foto placeholder
2. Score: 89/100 + badge "Alto potencial"
3. Resumo IA: "Decisor único. Budget R$900/mês. Quer proposta até quarta."
4. Próxima ação recomendada: "Enviar proposta →"
5. Canal: "WhatsApp · Dom 23h42"

**Motion:**
- Câmera: plano fixo, elementos surgem com lpEnter (translateY + opacity)
- Cada linha do resumo IA aparece como se estivesse sendo escrita: não letra-a-letra, mas linha por linha com fade rápido
- Score badge: scale 0.8→1.0 com spring (lp-ease-spring)
- "Próxima ação" pulsa suavemente em âmbar (indica urgência, não loop irritante)

**Copy sobreposta:**
> `"Não é só um lead. É inteligência. Gerada automaticamente."`

**Duração:** 18 segundos — a cena mais longa, é o argumento central  
**Emoção: admiração + desejo**

---

### 🎬 CENA 5 — CRM (1:00 – 1:12)

**Visual:**
Transição: o card de Lead Intelligence "voa" para o pipeline.  
Pipeline CRM aparece: kanban com colunas (Qualificado → Contato → Proposta → Fechado).  
Lead de Rafael Souza aparece na coluna "Qualificado" com score visível.  
Outros leads já estão preenchidos — pipeline não está vazio.

**Motion:**
- Card transition: transform do card para mini-chip no pipeline (morphing suave, 400ms)
- Pipeline: aparece em fade, colunas têm leads com diferentes scores (não todos perfeitos — realismo)
- Counter: "14 leads qualificados" conta rapidamente
- Câmera: leve pan horizontal da esquerda (Qualificado) para a direita (Fechado) — implica progresso

**Copy sobreposta:**
> `"No CRM. Antes de você acordar."`

**Duração:** 12 segundos  
**Emoção: ordem + controle**

---

### 🎬 CENA 6 — Revenue (1:12 – 1:24)

**Visual:**
Dashboard de Revenue Intelligence. MRR em destaque: R$18.200/mês.  
Counter sobe suavemente: R$12.000 → R$18.200 (não rapidamente — o número grande tem peso).  
"+34% vs. mês anterior" aparece em verde.  
Forecast: "R$24.000 projetado" — linha pontilhada no gráfico.

**Motion:**
- Câmera: zoom-out leve do número para o contexto (o número ocupa 60% da tela → 30%)
- Gráfico de barras: barras crescem da base (como mercado de capitais, não como slideshow)
- Forecast line: stroke-dashoffset animation (mesmo efeito do SVG canvas)
- Cor: verde para o crescimento, teal para o número principal

**Copy sobreposta:**
> `"R$18.200 de pipeline. Gerado por conversas. Sem SDR."`

**Duração:** 12 segundos  
**Emoção: ambição + prova**

---

### 🎬 CENA 7 — Attribution (1:24 – 1:42)

**Visual:**
Painel de Attribution em foco. Linha do tempo visual:
- Campanha "Meta Ads · Imob Nov" →
- 47 leads gerados →
- 31 qualificados (66%) →
- MRR atribuído: R$12.400 →
- ROAS implícito: 4.1x

Seta conectando cada etapa. A seta é âmbar e se desenha (stroke-dashoffset).

**Motion:**
- Câmera: pan da esquerda (campanha) para a direita (ROAS) acompanhando a seta
- Seta: draw-on animation em âmbar, 600ms, easing expo-out
- Cada número aparece em sequência (não todos de uma vez)
- ROAS "4.1x" aparece por último — hold 1.5s — é o argumento mais forte

**Copy sobreposta:**
> `"Você sabe exatamente qual campanha gerou qual real."`

**Duração:** 18 segundos  
**Emoção: clareza + poder**

---

### 🎬 CENA 8 — O Resultado (1:42 – 1:54)

**Visual:**
Câmera recua. Tela inteira do Intelligence Dashboard.  
Relógio no canto: 08h15 segunda-feira.  
Notificação do sistema: "14 leads qualificados enquanto você dormia."  
Usuário abre o laptop. Pipeline preenchido. Coffee mug. Calm.

**Motion:**
- Câmera: zoom-out máximo — de detalhe para visão geral (o "reveal" final)
- Relógio: clock-face ou timestamp no canto superior direito
- Notificação: slide de cima, badge âmbar, desaparece após 2s
- Último frame: tela estática. Dashboard. Título do produto.

**Copy sobreposta:**
> `"Flux Agent Studio. Seu processo comercial não para mais."`

**Duração:** 12 segundos  
**Emoção: paz + aspiração**

---

**TOTAL: 114 segundos (~1:54) — versão completa "director's cut"**

---

## Parte 4 — Formatos e Durações por Canal

### Grid de formatos

| Canal | Ratio | Resolução | Duração ideal | Cenas incluídas |
|---|---|---|---|---|
| LP Hero (loop) | 16:9 | 1920×1080 | 30–45s | Cenas 2, 3, 4, 5 (produto em ação) |
| Meta Ads (feed) | 1:1 | 1080×1080 | 15s | Cenas 1 + 4 + 8 (dor → resultado) |
| Meta Ads (stories/reels) | 9:16 | 1080×1920 | 15–30s | Cenas 1 + 2 + 4 (problema → conversa → intel) |
| Google Ads (bumper) | 16:9 | 1280×720 | 6s | Cena 4 ou 8 (só o argumento mais forte) |
| Google Ads (in-stream) | 16:9 | 1920×1080 | 15–30s | Cenas 2 + 4 + 7 (conversa → intel → atribuição) |
| LinkedIn (feed) | 16:9 ou 1:1 | 1920×1080 | 30–60s | Cenas 3 + 4 + 6 + 7 (IA → intel → revenue → attribution) |
| Sales Deck | 16:9 | 1920×1080 | 90s completo | Todas as 8 cenas |
| Onboarding | 16:9 | 1920×1080 | 60s | Cenas 2 + 3 + 4 + 5 (produto sem problema) |

---

### Adaptação por formato vertical (9:16)

O formato vertical exige simplificação radical:

**Regra de ouro para 9:16:**
> Uma tela = um argumento. Nunca dois painéis lado a lado.

**Hierarquia vertical:**
```
[8% topo]   — badge de categoria / copy superior
[70% meio]  — mockup ou tela do produto (centralizado, zoom maior)
[22% base]  — copy principal + CTA
```

**Cenas que funcionam em 9:16 sem adaptação:**
- Cena 1 (smartphone com WhatsApp — naturalmente vertical)
- Cena 4 (Lead Intelligence card — adaptável com zoom no score)
- Cena 8 (resultado final — simplificado para número + copy)

**Cenas que precisam de re-corte para 9:16:**
- Cenas 5, 6, 7 — painéis horizontais precisam de pan vertical ou zoom em elemento único

---

### Adaptação para 1:1 (quadrado)

**Regra de ouro para 1:1:**
> O elemento principal ocupa 60% do frame. Copy e contexto ficam nos 40% restantes.

**Versão de 15s para Meta Feed (1:1):**
```
0:00–0:03  Problema (texto: "Esse lead não voltou.")
0:03–0:09  Score surgindo: 0 → 89/100 (zoom no Score card)
0:09–0:13  ROAS: 4.1x (zoom no Attribution)
0:13–0:15  Logo + CTA: "Começar grátis"
```

---

## Parte 5 — Movimentos de Câmera, Zooms, Transições e Motion Graphics

### Vocabulário de câmera

| Movimento | Quando usar | Easing | Amplitude |
|---|---|---|---|
| **Zoom-in suave** | Revelar detalhe importante (score, ROAS) | expo-out | scale 1.0 → 1.15 (máximo) |
| **Zoom-out reveal** | Mostrar contexto após detalhe (dashboard completo) | expo-out | scale 1.15 → 1.0 |
| **Pan horizontal** | Percorrer pipeline (esquerda = início, direita = resultado) | ease-in-out | máx 15% do frame |
| **Pan vertical** | Revelar seção abaixo da dobra (mobile-first) | ease-in-out | máx 20% do frame |
| **Câmera estática** | Resultado final, números de impacto — deixa o dado falar | — | — |

**Regra absoluta:** nenhum movimento de câmera dura menos de 400ms ou mais de 1200ms. Rápido demais = agressivo. Lento demais = entediante.

---

### Zooms específicos por tela

| Tela | Zoom-in em | Ponto inicial | Duração |
|---|---|---|---|
| Lead Intelligence | Score "89/100" | Tela cheia → card centralizado | 600ms |
| Revenue Dashboard | Número "R$18.200" | Dashboard → número em destaque | 800ms |
| Attribution | "ROAS 4.1x" | Painel → campo ROAS | 700ms |
| AI Builder | Campo de instrução sendo preenchido | Tela cheia → campo | 500ms |
| Pipeline CRM | Lead entrando na coluna | Kanban → card do lead | 400ms |

---

### Transições entre cenas

| Transição | Uso | Técnica |
|---|---|---|
| **Fade to black** | Cena 1 → 2 (problema → solução) | opacity 0ms → 200ms, hold 100ms |
| **Morph / element transition** | Cena 4 → 5 (card → pipeline) | transform do card para posição no kanban |
| **Cut direto** | Dentro de uma cena (mostrar dado → outro dado) | 0ms — corte editorial |
| **Wipe horizontal (teal)** | Cena 5 → 6 (CRM → Revenue) | barra teal percorre frame, revela próxima tela |
| **Dissolve suave** | Cena 7 → 8 (attribution → resultado final) | 300ms cross-dissolve |
| **Zoom-out + fade** | Cena 8 (resultado → tela final com logo) | scale + opacity simultâneos |

**Regra de transição:** máximo 2 tipos de transição diferentes em um vídeo de 90s. Variedade de transição = amadorismo de edição.

---

### Motion Graphics Específicos

**MG-01 — Score Counter (Cenas 3 e 4)**
```
Tipo: number counter animado
De: 0
Para: 89 (ou valor definido)
Duração: 1200ms
Easing: ease-out (desacelera nos últimos 20%)
Fonte: Space Grotesk 800, tabular-nums
Cor: var(--lp-primary-glow)
```

**MG-02 — SVG Path Draw-on (Cenas 3 e 7)**
```
Tipo: stroke-dashoffset animation
Uso: conexões entre elementos (canvas → CRM, campanha → ROAS)
Duração: 250–600ms por linha
Cor: teal para fluxo de dados, âmbar para fluxo de receita
strokeWidth: 1.5–2px
```

**MG-03 — Badge de Destaque (Cena 4)**
```
Tipo: scale + fade + glow
Elemento: "Score 89/100" badge
Animação: scale 0.8 → 1.0, opacity 0 → 1, box-shadow cresce
Duração: 400ms
Easing: cubic-bezier(0.34, 1.56, 0.64, 1) — spring leve
```

**MG-04 — Revenue Line (Cena 6)**
```
Tipo: stroke-dashoffset em gráfico de linha
Cor: #4ade80 (verde de crescimento)
Linha pontilhada: forecast (stroke-dasharray: 6 4)
Duração: 800ms para linha real, 600ms para forecast
```

**MG-05 — Notification Slide-in (Cena 8)**
```
Tipo: translateY(-100%) → 0
Elemento: notificação do sistema ("14 leads qualificados enquanto você dormia")
Duração: 400ms
Auto-dismiss: 2000ms após entrada
Cor: âmbar (urgência/sucesso)
```

**MG-06 — Data Particles (Cena 3)**
```
Tipo: 3–4 linhas finas fluindo para o bloco IA
Comportamento: linha reta, não curva, opacity 0.4, cor teal
Duração: loop de 600ms, delay stagger entre linhas
IMPORTANTE: baixa amplitude — partículas são AI-slop se exageradas
```

---

## Parte 6 — Como Claude Design Recebe os Assets

### Tipos de Assets Aceitos

**TIPO A — Screenshots do produto real (preferidos)**
- Formato: PNG ou WebP, mínimo 2x (retina)
- Resolução: 2560×1600 (MacBook Retina) ou 1920×1200
- Estado: produto com dados reais ou dados fictícios realistas
- Fundo: dark (#09090C) — consistente com identidade
- Janela: Chrome/Safari com chrome bar visível quando relevante
- Uso: telas estáticas que aparecem em zooms e pans

**TIPO B — HTML/CSS Snapshots (para composição)**
- Quando usar: quando o produto real não tem dados suficientes para uma tela impressionante
- Formato: HTML + CSS + dados inline (sem dependências externas)
- O HTML deve ser auto-contido (fontes via CDN ou inline, sem fetch)
- Claude Design renderiza o HTML e usa como frame de vídeo
- Vantagem: dados 100% controlados, tipografia perfeita, nenhuma PII real

**TIPO C — Vídeos de tela gravados (ScreenFlow / QuickTime)**
- Formato: MOV ou MP4, codec H.264, mínimo 1080p 60fps
- Cursor: visível (movimento de cursor dá vida)
- Duração: gravar segmentos longos, cortar na edição
- Estado: sem notificações do sistema, modo não-perturbar ativado
- Uso: cenas onde o movimento é essencial (AI Builder gerando, score subindo)

**TIPO D — Motion exports de Figma/After Effects**
- Formato: MP4 transparente (ProRes 4444 se disponível) ou GIF 2x
- Uso: motion graphics (counters, SVG paths, badges)
- Entrega: exportado em separado, composited sobre footage de produto

---

### Estrutura de Pastas de Assets para Claude Design

```
assets/product-movie/
│
├── raw/                          ← assets brutos não editados
│   ├── screenshots/
│   │   ├── lead-intelligence-2x.png
│   │   ├── revenue-attribution-2x.png
│   │   ├── ai-builder-2x.png
│   │   ├── pipeline-crm-2x.png
│   │   └── public-bot-whatsapp-2x.png
│   ├── screen-recordings/
│   │   ├── ai-builder-generation-60fps.mov
│   │   ├── score-counter-60fps.mov
│   │   └── attribution-draw-60fps.mov
│   └── html-snapshots/
│       ├── lead-card-v1.html
│       ├── attribution-panel-v1.html
│       └── revenue-dashboard-v1.html
│
├── motion-graphics/              ← MG-01 a MG-06 exportados
│   ├── score-counter.mp4
│   ├── svg-draw-on-teal.mp4
│   ├── svg-draw-on-amber.mp4
│   ├── revenue-line-chart.mp4
│   └── notification-slide-in.mp4
│
├── audio/                        ← opcional
│   ├── background-music.mp3
│   └── sfx-notification.wav
│
└── output/                       ← vídeos finalizados
    ├── product-movie-90s-16x9.mp4
    ├── product-movie-30s-1x1.mp4
    ├── product-movie-15s-9x16.mp4
    └── product-movie-6s-bumper.mp4
```

---

### Brief para Claude Design (Template Operacional)

Quando submeter assets ao Claude Design, usar este template:

```markdown
## Brief de Vídeo — [Nome do Vídeo]

### Contexto do produto
Flux Agent Studio é um Conversational Revenue OS para o mercado brasileiro.
A promessa: lead entra por conversa → qualificado por IA → CRM com score e resumo.

### Cenas a incluir
[listar cenas do storyboard + duração de cada uma]

### Assets fornecidos
[listar TYPE A/B/C/D com caminho de arquivo]

### Paleta de cores
- Background: #09090C
- Primária (teal): #0D9488 / #14B8A6
- Accent (âmbar): #D97706 / #F59E0B
- Texto: #F8FAFC
- Texto muted: #94A3B8

### Tipografia
- Headlines: Space Grotesk 800
- Body: Inter 400
- Números/dados: JetBrains Mono tabular-nums

### Movimentos permitidos
[listar do Vocabulário de Câmera acima]

### Transições permitidas
[listar máximo 2 do catálogo acima]

### Copy sobreposta
[listar por cena]

### Formato de entrega
Ratio: [16:9 | 9:16 | 1:1]
Duração: [Xs]
Codec: H.264 + AAC
Resolução: 1920×1080 (ou 1080×1920 para vertical)
```

---

## Parte 7 — Documentação Completa

### Hierarquia de Vídeos do Sistema

```
NÍVEL 1 — Director's Cut (90s, 16:9)
  Uso: Sales Deck, apresentação ao vivo, YouTube
  Inclui: todas as 8 cenas
  Tom: cinematográfico, narrativo

NÍVEL 2 — LP Hero (30–45s, 16:9)
  Uso: loop na landing page (autoplay muted)
  Inclui: cenas 2 + 3 + 4 + 5 (produto em ação, sem o problema)
  Tom: produto limpo, sem narração de problema

NÍVEL 3 — Performance Ads (15–30s, vários formatos)
  Uso: Meta/Google/LinkedIn
  Inclui: variações por ICP (ver abaixo)
  Tom: urgente, direto, CTA explícito

NÍVEL 4 — Bumper (6s, 16:9)
  Uso: Google Ads pre-roll
  Inclui: 1 cena + logo
  Tom: recall de marca + argumento nuclear

NÍVEL 5 — Onboarding (60s, 16:9)
  Uso: email de boas-vindas, in-app
  Inclui: cenas 2 + 3 + 4 + 5 (como usar, não problema)
  Tom: educativo, guia passo a passo
```

---

### Variações por ICP (Nível 3 — Performance Ads)

**Variação ICP-1 — Agência Digital (LinkedIn, 30s)**
```
Cena A: campanha sem atribuição (dor do gestor de tráfego)
Cena B: attribution panel — ROAS por campanha
Cena C: logo + "Prove o ROI de cada lead"
```

**Variação ICP-2 — PME Serviços (Meta Reels, 15s)**
```
Cena A: WhatsApp sem resposta às 23h
Cena B: agente respondendo + lead qualificado
Cena C: logo + "Seu time não perde mais lead"
```

**Variação ICP-3 — Gestor Comercial (Google, 30s)**
```
Cena A: CRM vazio — ninguém preencheu
Cena B: pipeline preenchido automaticamente
Cena C: Lead Intelligence card + logo
```

---

## Parte 8 — Checklist Operacional para Futuros Vídeos

### PRE-PRODUÇÃO

```
□ 1. Definir ICP-alvo e canal de distribuição
□ 2. Escolher nível de vídeo (1–5 da hierarquia)
□ 3. Selecionar cenas do storyboard (máximo 4 cenas para ≤30s)
□ 4. Preencher Brief para Claude Design (template Parte 6)
□ 5. Coletar assets:
      □ Screenshots do produto real (2x, fundo dark)
      □ OU HTML snapshots com dados realistas
      □ Screen recordings das cenas de movimento
      □ Motion graphics necessários (MG-01 a MG-06)
□ 6. Verificar: dados fictícios não contêm PII real
□ 7. Verificar: dados são realistas (score 89 > score 100 — 100 parece falso)
```

### DADOS FICTÍCIOS — PADRÕES ESTABELECIDOS

```
Nomes: Rafael Souza, Marcos Silva, Carla Lima, Beatriz Ferreira
Empresas: Construtora MV, Imobiliária Nova Era, Clínica Estética Luz
Score: 87, 89, 74, 92 (nunca 95+ — parece exagerado)
MRR pipeline: R$14.200 a R$18.500 (realista para PME)
ROAS: 3.8x a 4.2x (credível para Meta Ads imobiliário)
CPL: R$18 (credível para Meta Ads Brasil 2026)
Horário conversas: 23h42, 08h15, 14h32 (específicos = credíveis)
```

### PRODUÇÃO

```
□ 8. Gravar screen recordings em máquina limpa (sem notificações)
      □ Resolução: 2x (Retina) mínimo
      □ FPS: 60fps
      □ Browser: Chrome sem extensões visíveis
□ 9. Exportar HTML snapshots como PNG (puppeteer ou playwright)
□ 10. Entregar assets organizados na estrutura de pastas (Parte 6)
□ 11. Submeter Brief ao Claude Design com assets anexados
```

### PÓS-PRODUÇÃO

```
□ 12. Revisar corte: nenhum movimento > 1200ms, nenhum < 400ms
□ 13. Verificar transições: máximo 2 tipos por vídeo
□ 14. Verificar copy sobreposta: máximo 7 palavras por linha
□ 15. Checar fundo: #09090C em todas as telas (sem white flash)
□ 16. Exportar em todos os formatos necessários
□ 17. Teste de autoplay muted (LP) — visual conta a história sem som
□ 18. Teste em mobile (9:16 funciona em portrait sem crop crítico?)
□ 19. Adicionar output/ em assets/product-movie/ com versão e data
```

### QUALITY CHECK FINAL

```
□ 20. Cobrir o logo — o vídeo ainda comunica Revenue OS? (meta: sim)
□ 21. Assistir sem som — a narrativa é compreensível? (meta: sim)
□ 22. Assistir em 1.5x — os dados são legíveis? (meta: sim)
□ 23. Comparar com vídeo de concorrente — é visualmente diferente? (meta: sim)
□ 24. Mostrar para alguém fora do produto — entende em 90s o que o produto faz?
```

---

## Notas para Execução Futura

**Quando `docs/JOURNEY-ASSETS.md` for criado:**  
Adicionar a coluna "Aparece em cena" para cada asset, linkando com o storyboard deste documento.

**Quando `docs/LP-ASSETS-FINAL.md` for criado:**  
Verificar consistência entre assets da LP e assets do vídeo. A mesma tela não deve ter estados diferentes entre LP e vídeo — confunde a percepção do produto.

**Quando o produto tiver dados reais de beta:**  
Substituir dados fictícios por dados reais anonimizados. Um score real de 84 com resumo IA real é mais convincente do que qualquer dado fabricado — porque parece imperfeito, e imperfeito é real.

---

*Criado: 2026-06-03 · FASE 26D.1*
*Próximo passo: gravar screen recordings do produto + criar HTML snapshots → submeter ao Claude Design*
