# Flux Agent Studio — Hero Refinement
## FASE 26C.1A · Diagnóstico e Recomendação Final

> Análise do Hero V2 sob a ótica de categoria (Revenue OS, não chatbot).
> Fonte: POSITIONING.md, PRODUCT-INTELLIGENCE.md, MESSAGING-ARCHITECTURE.md,
> ECONOMIC-ENGINE-GTM.md, HIDDEN-ADVANTAGES.md, HERO-V2.md, HERO-MOTION.md.
> Não altera código. Define o que deve ser implementado no próximo ciclo.

---

## Diagnóstico Central

**O problema em uma frase:**
O mockup atual conta a história de *como o produto funciona* (blocos conectados → chat). Ele deveria contar a história de *o que o produto entrega* (lead entra → dinheiro sai).

Um visitante que cobre o logo e olha só para o mockup pensa: builder de fluxo com chat preview. Isso é a definição visual de Typebot, Landbot, ou ManyChat.

Um Revenue OS teria como protagonista visual: inteligência, dados, receita — não o canvas de arrastar blocos.

---

## Parte 1 — Análise do Mockup Atual

### Inventário de elementos e o que cada um comunica

| Elemento | Comunica | Força do sinal |
|---|---|---|
| Painel "Blocos" (palette esquerda) | Builder de fluxo | 🔴 Forte sinal de chatbot builder |
| Nodes "Saudação", "Coleta dados" | Formulário conversacional | 🔴 Forte sinal de chatbot |
| Node "IA ✦ Qualifica lead" | IA diferenciada | 🟡 Positivo, mas genérico |
| Conexão âmbar → CRM | Lead entra no CRM | 🟡 Parcialmente Revenue |
| Node "CRM · Pipeline" com âmbar | CRM nativo | 🟢 Revenue — bom |
| Chat preview (3 bolhas) | Conversa ao vivo | 🔴 Forte sinal de chatbot |
| "Lead Score 87/100" | Lead Intelligence | 🟢 Revenue — ótimo |
| "▲ Alto potencial" | Forecast/Intelligence | 🟢 Revenue — ótimo |
| Chrome bar "fluxagent.studio/builder" | Builder (URL reforça) | 🔴 "builder" na URL = chatbot |

### Veredito do diagnóstico

**4 de 9 elementos comunicam chatbot/builder.**
**3 de 9 comunicam Revenue.**
**2 de 9 são neutros (IA genérico).**

O score visual da categoria atual: **~33% Revenue OS.**
O score necessário para comunicar a categoria: **≥ 70% Revenue OS.**

### O elemento mais danoso

A palette lateral de "Blocos" (Mensagem, Pergunta, IA, CRM, Webhook, Score) é o elemento que mais âncora o produto em "builder de chatbot". É o primeiro elemento que o olho lê no painel esquerdo — e ele diz exatamente a mesma coisa que o sidebar do Typebot.

### O elemento mais valioso que está subaproveitado

O **Lead Score 87/100** está no canto inferior do chat preview — pequeno, fora da hierarquia visual principal. É o elemento que mais diferencia o produto e está escondido. É como ter "Revenue Attribution" como rodapé.

---

## Parte 2 — Três Alternativas de Mockup

### VERSÃO A — "Da Conversa à Receita" (Funil Vertical)

**Conceito:** O mockup mostra um painel de Revenue Intelligence, não um canvas de builder. O protagonista visual é o dado comercial resultante da conversa — não o processo de criação do bot.

**Estrutura:**
```
┌─────────────────────────────────────────────────────────┐
│  chrome: fluxagent.studio/crm/pipeline                  │
├──────────────────────┬──────────────────────────────────┤
│  FUNIL ATIVO         │  LEAD DETAIL — Marcos Silva      │
│  ─────────────────   │  ─────────────────────────────── │
│  🟢 Qualificados 12  │  Score: 92/100  ↑ Alto potencial │
│  🟡 Em contato  8    │  Canal: WhatsApp · Hoje 14:32    │
│  🔵 Proposta    3    │                                  │
│  ✅ Fechados    2    │  Resumo IA:                       │
│                      │  "Interesse em plano Pro, budget │
│  ─────────────────   │  confirmado R$800/mês, decisor   │
│  MRR Pipeline:       │  único. Próxima ação: demo."     │
│  R$ 14.200 /mês      │                                  │
│                      │  Campanha origem:                │
│                      │  Meta Ads · "Imob Nov" · ROAS 4x │
└──────────────────────┴──────────────────────────────────┘
```

**Sinal por elemento:**
- CRM pipeline com MRR: 🟢🟢 Revenue
- Score 92/100: 🟢🟢 Intelligence
- Resumo IA: 🟢 Intelligence
- Campanha + ROAS: 🟢🟢 Attribution (único no mercado)
- Chat preview oculto: sem sinal de chatbot

**Score de Revenue OS: ~85%**

**Trade-off:** Perde a demonstração do fluxo de conversa. Visitante pode não entender como o lead chegou ali. Compensa com o "Canal: WhatsApp · Hoje 14:32" que implica a conversa aconteceu.

---

### VERSÃO B — "AI Builder → Revenue" (Processo + Resultado)

**Conceito:** Tela dividida: à esquerda, o AI Builder gerando um fluxo (mostra a velocidade de criação); à direita, o resultado — um painel de Lead Intelligence já com dados reais.

**Estrutura:**
```
┌─────────────────────────────────────────────────────────┐
│  chrome: fluxagent.studio/builder                       │
├──────────────────────┬──────────────────────────────────┤
│  AI BUILDER          │  RESULTADO AO VIVO               │
│  ─────────────────   │  ─────────────────────────────── │
│  "Crie um agente     │  ✅ Agente publicado             │
│  para qualificar     │     WhatsApp · Web · Instagram   │
│  leads de imobili-   │                                  │
│  árias com score     │  📊 Últimas 24h:                 │
│  automático"         │  ┌─────────────────────────────┐ │
│                      │  │ 47 conversas               │ │
│  ⠿ Gerando...        │  │ 31 qualificados (66%)       │ │
│                      │  │ Score médio: 78/100         │ │
│  [Saudação]──►       │  │ MRR pipeline: R$ 9.400      │ │
│  [Coleta]──►         │  └─────────────────────────────┘ │
│  [IA Score]──►       │                                  │
│  [CRM]──►            │  🔗 Atribuição: Meta Ads "Nov"  │
│  [Forecast]          │     CPL: R$18 → LTV: R$1.200    │
└──────────────────────┴──────────────────────────────────┘
```

**Sinal por elemento:**
- AI Builder: 🟡 diferencial do produto (velocidade)
- Publicado em 3 canais: 🟢 omnichannel
- 47 conversas / 31 qualificados: 🟢🟢 Intelligence
- MRR pipeline: 🟢🟢 Revenue
- CPL → LTV: 🟢🟢🟢 Attribution (ninguém tem isso)

**Score de Revenue OS: ~75%**

**Trade-off:** Mais complexo de ler em 3 segundos. Dois contextos simultâneos (builder + resultado). Ganha em mostrar o diferencial de velocidade do AI Builder.

---

### VERSÃO C — "Score → Forecast → Receita" (Intelligence Dashboard)

**Conceito:** O mockup mostra um dashboard de Revenue Intelligence — como se o visitante estivesse olhando o painel do gestor comercial na segunda-feira. Zero builder, zero chat. Pura inteligência gerada automaticamente.

**Estrutura:**
```
┌─────────────────────────────────────────────────────────┐
│  chrome: fluxagent.studio/intelligence                  │
├────────────┬──────────────────┬──────────────────────────┤
│ HOJE       │  PIPELINE        │  ATRIBUIÇÃO              │
│ ─────────  │  ─────────────   │  ─────────────────────── │
│ 23 leads   │  Score médio     │  Campanha "Meta Nov"     │
│ 15 qualif  │  ████████ 81/100 │  Leads: 47              │
│            │                  │  Qualif: 31 (66%)       │
│ Forecast:  │  Próximas ações: │  MRR atribuído:         │
│ R$ 8.200   │  • Demo: 4       │  R$ 12.400              │
│ este mês   │  • Proposta: 2   │  ROAS implícito: 4.1x   │
│            │  • Follow-up: 9  │                         │
│ ─────────  │                  │  Campanha "Google SDR"  │
│ +34% MoM   │  MRR pipeline:   │  Leads: 22              │
│            │  R$ 14.200       │  Qualif: 9 (41%)        │
└────────────┴──────────────────┴──────────────────────────┘
```

**Sinal por elemento:**
- "Forecast: R$ 8.200 este mês": 🟢🟢🟢 Revenue
- "+34% MoM": 🟢🟢 Growth
- "Próximas ações" recomendadas: 🟢🟢 Intelligence
- "MRR atribuído: R$ 12.400": 🟢🟢🟢 Attribution
- "ROAS implícito 4.1x": 🟢🟢🟢 Attribution (único no mercado)

**Score de Revenue OS: ~95%**

**Trade-off:** Zero demonstração do processo conversacional. Visitante pode não entender que "os leads chegam automaticamente via conversa". Precisa que a copy explique o input; o mockup mostra só o output.

---

### Comparativo das Versões

| Critério | Versão A | Versão B | Versão C |
|---|---|---|---|
| Score Revenue OS | 85% | 75% | 95% |
| Compreensibilidade em 3s | Alta | Média | Alta |
| Diferenciação vs. concorrentes | Muito alta | Alta | Máxima |
| Demonstra o "como" | Parcial | Sim | Não |
| Demonstra o "resultado" | Sim | Parcial | Máximo |
| Risco de confusão | Baixo | Médio | Médio |
| Complexidade de implementação | Média | Alta | Média |

**Recomendação de mockup:** **Versão A com elementos da Versão C.**

Razão: A Versão A mostra o CRM pipeline com dados reais (o "resultado") e implica a conversa pelo campo "Canal: WhatsApp". Adicionar o ROAS/Attribution como card lateral da Versão C cria o argumento nuclear visual: *"lead entrou pelo WhatsApp → foi qualificado → está no CRM → gerou R$ X atribuído à campanha Y."*

---

## Parte 3 — 10 Alternativas de Headline

### Contexto de avaliação

Cada headline será avaliada em 3 critérios:
- **Categoria** (0–5): quanto grita "Revenue OS" e não "chatbot"
- **Clareza** (0–5): entendível sem contexto em 3 segundos
- **Urgência** (0–5): cria pressão para agir agora

---

**H1.** `Seu próximo cliente está esperando resposta. O Flux já deu.` *(atual)*
- Categoria: 2/5 — fala de resposta, não de receita
- Clareza: 5/5 — imediato
- Urgência: 4/5 — urgência de velocidade
- **Total: 11/15**

**H2.** `Da primeira mensagem ao CRM qualificado. Automaticamente.`
- Categoria: 4/5 — CRM + automação = Revenue adjacente
- Clareza: 4/5 — precisa saber o que é CRM
- Urgência: 2/5 — descritivo, não urgente
- **Total: 10/15**

**H3.** `Cada conversa que seu time não responde é receita que vai para o concorrente.`
- Categoria: 5/5 — receita explícita
- Clareza: 5/5 — dor direta
- Urgência: 5/5 — FOMO máximo
- **Total: 15/15** ← candidata forte

**H4.** `Seu funil comercial inteiro. Da primeira mensagem à receita.`
*(da POSITIONING.md — hero tagline recomendada no documento)*
- Categoria: 5/5 — "funil comercial" + "receita" = Revenue OS claro
- Clareza: 5/5 — sem jargão
- Urgência: 2/5 — descritivo, não urgente
- **Total: 12/15**

**H5.** `Lead qualificado no CRM antes de você abrir o computador.`
*(da ECONOMIC-ENGINE-GTM.md — launch narrative)*
- Categoria: 4/5 — CRM + qualificação = Revenue
- Clareza: 5/5 — visual e concreto
- Urgência: 4/5 — "antes de você abrir" = madrugada trabalhando para você
- **Total: 13/15** ← candidata forte

**H6.** `Enquanto você dormia, 14 leads foram qualificados e estão no seu CRM.`
- Categoria: 4/5 — pipeline preenchido = Revenue
- Clareza: 5/5 — imagem mental perfeita
- Urgência: 4/5 — FOMO de ficar de fora
- **Total: 13/15** ← candidata forte

**H7.** `O pipeline que se preenche sozinho. O CRM que não depende do time.`
- Categoria: 5/5 — pipeline + CRM + independência = Revenue OS
- Clareza: 4/5 — dois conceitos em paralelo exigem leitura
- Urgência: 3/5 — mais posicionamento do que urgência
- **Total: 12/15**

**H8.** `Sua campanha gerou leads. O Flux transformou em receita.`
- Categoria: 5/5 — receita explícita + campanha = Attribution
- Clareza: 5/5 — dois momentos causais claros
- Urgência: 3/5 — passado ("gerou") é menos urgente que presente
- **Total: 13/15** ← candidata forte para ICP marketing

**H9.** `Do "oi" no WhatsApp ao lead pontuado no pipeline. Sem tocar em nada.`
- Categoria: 4/5 — pipeline = Revenue
- Clareza: 5/5 — jornada completa em uma frase
- Urgência: 3/5 — mais processo do que urgência
- **Total: 12/15**

**H10.** `Seu processo comercial não para mais às 18h.`
- Categoria: 3/5 — "processo comercial" é adjacente a Revenue
- Clareza: 5/5 — instantâneo
- Urgência: 5/5 — dor familiar e constante
- **Total: 13/15** ← candidata por urgência

---

### Ranking final de headlines

| Pos. | Headline | Total | Motivo |
|---|---|---|---|
| 🥇 | H3 — "Cada conversa que seu time não responde é receita que vai para o concorrente." | 15/15 | Receita explícita + FOMO + dor de mercado |
| 🥈 | H5 — "Lead qualificado no CRM antes de você abrir o computador." | 13/15 | Visual, concreto, 24/7 implícito |
| 🥉 | H6 — "Enquanto você dormia, 14 leads foram qualificados e estão no seu CRM." | 13/15 | Imagem mental perfeita, dado específico |
| 4 | H8 — "Sua campanha gerou leads. O Flux transformou em receita." | 13/15 | Melhor para ICP marketing/agência |
| 5 | H4 — "Seu funil comercial inteiro. Da primeira mensagem à receita." | 12/15 | Mais seguro, menos criativo |

---

## Parte 4 — 10 Alternativas de Subheadline

### O que a subheadline atual comunica

> "Agentes de IA que atendem, qualificam leads e entram no seu CRM automaticamente — 24/7, em qualquer canal. Sem código."

**Problema:** lista *features* (atender, qualificar, entrar no CRM). O visitante lê e entende "é um chatbot que salva no CRM". Não entende que o produto *gera inteligência comercial e previsão de receita*.

**O que a subheadline deveria comunicar:**
> Conversa → inteligência → receita. Não só captura — previsão, score, atribuição.

---

**S1.** `Cada conversa vira um lead pontuado, resumido e pronto para o vendedor — automaticamente, a qualquer hora.`
- O que adiciona: score + resumo IA + disponibilidade
- Score Revenue: 3/5

**S2.** `Do primeiro "oi" à previsão de receita atribuída à campanha de origem — sem código, sem planilha, sem intervenção humana.`
- O que adiciona: previsão + atribuição + zero intervenção
- Score Revenue: 5/5 — cobre o argumento nuclear

**S3.** `Seu agente qualifica, pontua e coloca cada lead no pipeline com score e próxima ação. Você abre o CRM e o trabalho já foi feito.`
- O que adiciona: pipeline + score + next action + zero esforço
- Score Revenue: 4/5

**S4.** `A plataforma que fecha o loop entre sua campanha, a conversa e a receita gerada. O relatório que todo gestor de tráfego sempre precisou.`
- O que adiciona: attribution loop completo + pain do gestor
- Score Revenue: 5/5 — melhor para ICP agência/marketing

**S5.** `Cada lead chega ao seu time com score 0–100, resumo da conversa e próxima ação recomendada. Gerado pela IA antes do vendedor tocar no telefone.`
- O que adiciona: score + resumo + recomendação + timing
- Score Revenue: 4/5 — mais vendas, menos marketing

**S6.** `Não é um chatbot. É o sistema que transforma cada conversa em dado comercial — score, forecast e atribuição em uma plataforma só.`
- O que adiciona: contraste explícito com chatbot + trifeta diferencial
- Score Revenue: 5/5 — posiciona a categoria

**S7.** `Capture leads, qualifique com IA, preveja receita e rastreie qual campanha fechou qual cliente — tudo em uma plataforma, sem código.`
- O que adiciona: forecast + attribution explícitos
- Score Revenue: 5/5 — lista completa de diferenciais

**S8.** `Enquanto você não atende, o agente qualifica. Enquanto você dorme, o CRM se preenche. Quando você acorda, o pipeline tem score e forecast.`
- O que adiciona: narrativa temporal + autonomia total
- Score Revenue: 4/5 — mais emocional, menos técnico

**S9.** `O sistema que cria leads qualificados onde antes só havia conversas — e diz exatamente qual campanha está gerando receita real.`
- O que adiciona: cria vs. apenas captura + attribution
- Score Revenue: 5/5 — foca em criação de valor, não só automação

**S10.** `Agentes de IA que operam seu processo comercial: qualificam, pontuam, preveem e registram. Você só faz o que humano precisa fazer: fechar.`
- O que adiciona: processos completos + role do vendedor
- Score Revenue: 5/5 — elimina SDR manual

---

### Ranking de subheadlines

| Pos. | Subheadline | Motivo |
|---|---|---|
| 🥇 | S6 | "Não é um chatbot" quebra âncora errada antes de ela se formar |
| 🥈 | S2 | Cobre o argumento nuclear em uma frase, sem buzzword |
| 🥉 | S9 | "Cria leads onde antes havia conversas" — posicionamento de categoria |
| 4 | S4 | Melhor para ICP agência — attribution loop explícito |
| 5 | S7 | Lista mais completa de diferenciais — bom para ICP técnico |

---

## Parte 5 — 10 Alternativas de CTA Secundário

### Problema com "Ver demonstração"

Fraco por dois motivos:
1. Não diz *o que* será demonstrado
2. "Demonstração" implica apresentação de vendas — cria atrito psicológico

Um CTA secundário forte deveria ou criar curiosidade específica ou reduzir o risco de entrar sem contexto.

---

**C1.** `Ver demonstração` *(atual)*
- Problema: genérico, não diz o que mostrar

**C2.** `Ver o pipeline em ação`
- Por quê funciona: "pipeline" = Revenue language; "em ação" = ao vivo, não apresentação

**C3.** `Ver lead sendo qualificado`
- Por quê funciona: mostra o diferencial central ao vivo — score surgindo em tempo real

**C4.** `Como funciona em 2 minutos`
- Por quê funciona: promessa de tempo específica remove o medo da demo longa

**C5.** `Ver score ao vivo`
- Por quê funciona: "score ao vivo" é o diferencial mais visual do produto

**C6.** `Como o lead chega ao CRM`
- Por quê funciona: explica exatamente a jornada que o visitante quer ver

**C7.** `Ver uma conversa virar receita`
- Por quê funciona: entrega a promessa da categoria em 5 palavras

**C8.** `Explorar o produto grátis`
- Por quê funciona: PLG — reduz atrito de "demo = call com vendedor"

**C9.** `Ver em ação →`
- Por quê funciona: minimalista, direto, seta implica movimento

**C10.** `Assistir demo de 90 segundos`
- Por quê funciona: 90 segundos é curto o suficiente para não assustar e longo o suficiente para ser levado a sério

---

### Ranking de CTAs secundários

| Pos. | CTA | Motivo |
|---|---|---|
| 🥇 | C7 — "Ver uma conversa virar receita" | Entrega a promessa da categoria. É o argumento nuclear em 5 palavras. |
| 🥈 | C4 — "Como funciona em 2 minutos" | Promessa de tempo remove atrito. Funciona para todos os ICPs. |
| 🥉 | C3 — "Ver lead sendo qualificado" | Mostra o diferencial central ao vivo. Específico. |
| 4 | C6 — "Como o lead chega ao CRM" | Melhor para ICP gestor comercial. |
| 5 | C10 — "Assistir demo de 90 segundos" | Melhor se existir vídeo real de 90s. |

---

## Parte 6 — Protagonista Visual: Qual Elemento Deveria Ser o Hero?

### Opções avaliadas

**Builder (canvas de fluxo)**
- O que comunica: "posso criar bots"
- Categoria comunicada: nível 2 (chatbot builder)
- Veredicto: ❌ Protagonista errado. É o como, não o o quê.

**Chat/Conversa**
- O que comunica: "tem interface de chat"
- Categoria comunicada: nível 2–3 (chatbot / AI agent)
- Veredicto: ❌ Protagonista errado. Qualquer chatbot tem isso.

**CRM / Pipeline**
- O que comunica: "leads chegam qualificados"
- Categoria comunicada: nível 4–5 (Commercial Machine / Revenue Platform)
- Veredicto: 🟡 Bom, mas genérico se não incluir dados de inteligência.

**Lead Intelligence (Score + Resumo IA + Próxima Ação)**
- O que comunica: "o sistema pensa sobre o lead, não apenas o captura"
- Categoria comunicada: nível 5 (Revenue OS)
- Veredicto: ✅ Protagonista correto. É o elemento que nenhum concorrente tem.

**Revenue Attribution (Campanha → Lead → Receita)**
- O que comunica: "sei exatamente qual campanha gerou qual real"
- Categoria comunicada: nível 5+ (único no mercado brasileiro)
- Veredicto: ✅✅ Protagonista mais diferenciado. Mas exige que o visitante já entenda o problema de atribuição — segmento específico.

### Recomendação de protagonista visual

**Lead Intelligence é o protagonista principal.**

Justificativa:
1. É o único diferencial que *nenhum concorrente direto* (Typebot, Chatbase, Voiceflow, ManyChat) tem
2. É visualmente denso e impressionante: score + resumo gerado por IA + próxima ação recomendada = parece poderoso
3. É intuitivo para qualquer ICP — dono de PME entende "87/100 = lead bom" sem explicação
4. Cria a prova visual de que o produto pensa, não apenas captura

**Revenue Attribution como elemento de apoio** (card lateral, não protagonista central):
- Específico demais para ser o elemento primário (exige que o visitante entenda UTM/atribuição)
- Mas quando visto por um gestor de marketing ou agência, é o argumento que fecha o debate

**Estrutura ideal do mockup:**
```
Protagonista: Lead Intelligence Card (grande, central)
Suporte 1: CRM pipeline com MRR (à esquerda)
Suporte 2: Attribution snippet (card inferior direito)
Implícito: canal de origem (WhatsApp/Hoje 14:32) — indica que veio de conversa
```

---

## Parte 7 — Recomendação Final

### Headline Recomendada

**Opção principal (FOMO + Receita):**
> `Cada conversa que seu time não responde é receita que vai para o concorrente.`

**Por que vence:**
- Receita explícita (não "resposta", não "automação")
- FOMO competitivo (o concorrente já está usando)
- Não precisa de contexto para entender a dor
- Zero jargão técnico
- Funciona para todos os ICPs

**Opção alternativa A/B (mais suave — melhor para tráfego frio):**
> `Lead qualificado no CRM antes de você abrir o computador.`

**Por que como alternativa:**
- Mais concreto e visual ("abrir o computador" cria imagem real)
- Não confronta — convida
- Melhor para ICP que ainda não sabe que tem o problema

---

### Subheadline Recomendada

> `Não é um chatbot. É o sistema que transforma cada conversa em dado comercial — score, forecast e atribuição em uma plataforma só.`

**Por que vence:**
- "Não é um chatbot" — quebra a âncora errada imediatamente, antes de ela se formar
- "Dado comercial" — eleva de automação para inteligência
- "Score, forecast, atribuição" — três diferenciais que nenhum concorrente tem, em uma linha
- "Uma plataforma só" — contra-argumento ao "já tenho CRM + já tenho chatbot"

---

### CTA Secundário Recomendado

> `Ver uma conversa virar receita`

**Por que vence:**
- Entrega a promessa da categoria em 5 palavras
- Cria curiosidade específica (não genérica)
- Remove o medo de "demo = call longa de vendas"
- É o argumento nuclear em formato de ação

---

### Mockup Recomendado

**Estrutura: Versão A + elementos de Versão C**

```
┌─────────────────────────────────────────────────────────┐
│  chrome: fluxagent.studio/intelligence                  │
├──────────────────────┬──────────────────────────────────┤
│  PIPELINE            │  LEAD DETAIL — Rafael Souza      │
│  ─────────────────   │  ─────────────────────────────── │
│  🟢 Qualificados 12  │  Score: 89/100  ↑ Alto potencial │
│  🟡 Em contato  8    │  Canal: WhatsApp · Hoje 09:47    │
│  🔵 Proposta    3    │                                  │
│                      │  Resumo IA:                       │
│  MRR Pipeline:       │  "Interesse confirmado, decisor  │
│  R$ 14.200/mês       │  único, orçamento R$600–900/mês. │
│                      │  Próxima ação: enviar proposta." │
│  ─────────────────   │                                  │
│  +34% vs. mês ant.   │  Campanha origem:                │
│                      │  Meta Ads · "SDR Nov" · ROAS 3.8x│
└──────────────────────┴──────────────────────────────────┘
```

**O que este mockup comunica:**
- "Pipeline com MRR em reais" → Revenue OS
- "Score 89/100" → Lead Intelligence
- "Resumo IA" → ninguém mais tem isso
- "Próxima ação" → o sistema pensa, não só captura
- "Canal: WhatsApp · Hoje 09:47" → veio de uma conversa (implícito)
- "ROAS 3.8x" → Revenue Attribution (argumento nuclear para agência/marketing)
- **Zero canvas de builder** → não parece Typebot

**Score Revenue OS do mockup recomendado: ~90%**

---

### Resumo da Recomendação Final

| Elemento | Atual | Recomendado |
|---|---|---|
| Headline | "Seu próximo cliente está esperando resposta. O Flux já deu." | "Cada conversa que seu time não responde é receita que vai para o concorrente." |
| Subheadline | "Agentes de IA que atendem, qualificam leads e entram no seu CRM automaticamente..." | "Não é um chatbot. É o sistema que transforma cada conversa em dado comercial — score, forecast e atribuição em uma plataforma só." |
| CTA secundário | "Ver demonstração" | "Ver uma conversa virar receita" |
| Mockup protagonista | Canvas de builder (palette + nodes) | Pipeline + Lead Intelligence + Attribution |
| URL no chrome | `/builder/sdr` | `/intelligence` |
| Sinal de Revenue OS | ~33% | ~90% |

---

## Nota sobre o headline atual

O headline "Seu próximo cliente está esperando resposta. O Flux já deu." **não está errado** — é forte, emocional, e funciona para awareness. O problema é que ele comunica *velocidade de resposta*, não *Revenue OS*. Para uma campanha de awareness ou cold traffic, pode ser o melhor headline. Para o posicionamento de categoria, o headline recomendado (H3) é mais preciso.

**Sugestão de uso por contexto:**
- LP principal (tráfego misto): H3 recomendado
- Ads awareness (cold traffic): atual ("Seu próximo cliente...")
- Ads performance (warm traffic): H6 ("Enquanto você dormia, 14 leads...")
- Landing page para agências: H8 ("Sua campanha gerou leads. O Flux transformou em receita.")

---

*Criado: 2026-06-03 · FASE 26C.1A*
*Próximo passo: aprovação → implementação em `src/pages/Landing.tsx`*
