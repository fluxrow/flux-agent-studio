# Flux Agent Studio — Hero Narrative Architecture
## FASE 26C.1B · A Narrativa Visual que Comunica Revenue OS sem Parecer CRM

> Responde ao risco identificado na FASE 26C.1A: remover o Builder do hero
> pode substituir a associação errada (Typebot) por outra associação errada
> (HubSpot/Pipedrive). Este documento resolve a tensão.
>
> Fonte: HERO-REFINEMENT.md, POSITIONING.md, PRODUCT-INTELLIGENCE.md,
> MESSAGING-ARCHITECTURE.md, ECONOMIC-ENGINE-GTM.md.
> Não altera código.

---

## O Risco Real

A análise anterior concluiu corretamente: o mockup atual comunica "builder de chatbot".  
A solução ingênua — substituir por um dashboard de CRM — cria outro problema:

```
Builder visível → "parece Typebot"
CRM visível     → "parece HubSpot"
Revenue visível → "parece Pipedrive"
```

**O produto não é nenhum dos três.** É a ponte entre eles — e nenhum dos três cobre o loop inteiro.

O hero precisa comunicar a *transformação*, não o ponto de partida nem o ponto de chegada.

Um visitante que já usa HubSpot precisa entender: "Isso alimenta o meu CRM com algo que ele não consegue fazer sozinho."  
Um visitante que já usa Typebot precisa entender: "Isso é o que vem depois do bot — a inteligência que o bot não gera."  
Um visitante que não usa nada precisa entender: "Do zero ao pipeline qualificado. Automático."

**A narrativa visual do hero deve ser a transformação, não o estado final.**

---

## Parte 1 — A Primeira Tela que um Usuário Ama

**Resposta: AI Builder**

Não o canvas de blocos — o *AI Builder específico*: o campo de texto onde você digita uma instrução em linguagem natural e o fluxo completo aparece em segundos.

Por quê é a tela que gera amor:
- Cria um momento de "uau" que acontece em menos de 60 segundos
- É visceralmente diferente de qualquer concorrente: não existe no Typebot, no Voiceflow, no ManyChat
- Demonstra a tese do produto inteiro: você descreve o resultado, a IA faz o trabalho
- É a funcionalidade que mais aparece em NPS positivos e referências orgânicas
- É o elemento com menor fricção de entrada — sem curva de aprendizado

**O AI Builder é o hook emocional do produto.** É a prova de que o produto pensa *com* você, não apenas *para* você.

---

## Parte 2 — A Primeira Tela que Faz Alguém Comprar

**Resposta: Lead Intelligence**

O que converte não é o que impressiona — é o que resolve o problema mais caro do visitante.

A tela que faz alguém abrir o cartão de crédito é aquela onde:
- O lead tem score e o vendedor não precisou fazer nada
- O resumo da conversa foi gerado pela IA em linguagem humana
- A próxima ação recomendada está pronta antes do vendedor chegar
- O campo "Campanha de origem: Meta Ads · ROAS 3.8x" existe — e o visitante sabe que nunca tinha visto esse dado antes

**Lead Intelligence é o argumento de fechamento.** É onde o visitante vê que o produto *pensa*, não apenas *captura*. É onde o ROI se torna concreto.

A distância entre "isso é interessante" e "preciso disso agora" é a distância entre ver o Builder e ver o Lead Intelligence.

---

## Parte 3 — A Primeira Tela que Explica o Produto

**Resposta: A jornada completa em um único frame**

Nenhuma tela individual explica o produto. O produto se explica pela *sequência*:

```
Conversa (input) → IA qualifica → Lead Intelligence (output) → CRM (destino)
```

A tela que explica o produto não é um screenshot — é uma narrativa visual que mostra os quatro momentos em ordem, sem obrigar o visitante a imaginar as conexões.

O erro mais comum em SaaS: mostrar uma tela e assumir que o visitante entende o sistema inteiro por ela. Cada tela é apenas um frame — a história precisa dos quatro.

---

## Parte 4 — Três Conceitos de Hero

---

### CONCEITO A — Builder-first

**Premissa narrativa:**
> "Você descreve o agente que quer. Em 10 minutos ele está qualificando leads e alimentando o seu CRM."

**O que o mockup mostra:**
O AI Builder em ação. Campo de instrução preenchido, fluxo sendo gerado em tempo real, e — ao lado — um mini-painel de resultado mostrando que o agente já está ativo e já gerou leads pontuados.

```
┌───────────────────────────────────────────────────────────────┐
│  chrome: fluxagent.studio/ai-builder                          │
├─────────────────────────────────────┬─────────────────────────┤
│  AI BUILDER                         │  AGENTE ATIVO           │
│  ───────────────────────────────    │  ─────────────────────  │
│  "Crie um agente para qualificar    │  ✅ Publicado           │
│   leads de imobiliária. Pergunte    │     WhatsApp + Web      │
│   nome, renda e interesse.          │                         │
│   Score automático. CRM Pipedrive." │  Últimas 2h:            │
│                                     │  ████ 8 conversas       │
│  ⠿ Gerando fluxo...                 │  ████ 6 qualificados    │
│                                     │  Score médio: 81/100    │
│  ─────────── Resultado ──────────   │                         │
│  [Saudação] → [Nome] → [Renda]      │  MRR pipeline:          │
│  → [IA Score] → [CRM] → [Notify]   │  R$ 4.200 em 2h         │
│                                     │                         │
│  [Publicar agente →]                │  [Ver pipeline →]       │
└─────────────────────────────────────┴─────────────────────────┘
```

**O que este conceito comunica:**
- Velocidade: fluxo criado em linguagem natural → publicado → resultados
- AI Builder como diferencial de entrada (zero no concorrente)
- Resultado imediato visível: 8 conversas, 6 qualificados, R$4.200

**Pontuação:**

| Critério | Nota (0–10) | Justificativa |
|---|---|---|
| Clareza | 9 | O visitante entende: descreve → cria → resultado |
| Diferenciação | 9 | AI Builder não existe no Typebot/Voiceflow |
| Conversão | 7 | Impressiona quem já sabe que quer um bot; confunde quem não sabe que precisa |
| Revenue OS | 6 | O resultado (R$4.200/MRR) está no painel — mas o protagonista é o Builder |
| Escalabilidade futura | 8 | AI Builder vai evoluir — o hero evolui junto |
| **Total** | **39/50** | |

**Risco principal:** Para o visitante de tráfego frio que não sabe que quer um bot, a narrativa começa pelo meio (o como), não pelo problema (o porquê). O Builder é a resposta para uma pergunta que o visitante ainda não fez.

---

### CONCEITO B — Revenue-first

**Premissa narrativa:**
> "Na segunda-feira de manhã, seu pipeline já está preenchido. Seus leads já estão qualificados. Você só precisa fechar."

**O que o mockup mostra:**
Uma tela de Revenue Intelligence — o estado do pipeline como o usuário vê na segunda de manhã, depois que o agente trabalhou o fim de semana. Zero builder visível. Zero chat. Só dados: pipeline, scores, resumos, atribuição.

```
┌──────────────────────────────────────────────────────────────┐
│  chrome: fluxagent.studio/intelligence                       │
├────────────────┬──────────────────────┬──────────────────────┤
│  PIPELINE      │  LEAD — Rafael Souza │  ATRIBUIÇÃO          │
│  ──────────    │  ─────────────────   │  ─────────────────── │
│  Qualif.  14   │  Score: 89/100       │  Meta "Imob Nov"     │
│  Contato   9   │  ↑ Alto potencial    │  Leads: 47           │
│  Proposta  4   │  WhatsApp · Dom 23h  │  Qualif: 31 (66%)    │
│                │                      │  MRR atrib: R$12.4k  │
│  MRR total:    │  Resumo IA:          │  ROAS: 4.1x          │
│  R$18.200/mês  │  "Decisor único.     │  ──────────────────  │
│                │  Budget R$900/mês.   │  Google "SDR Nov"    │
│  +34% MoM ↑   │  Quer proposta até   │  Leads: 22           │
│                │  quarta."            │  Qualif: 9 (41%)     │
│                │                      │  MRR atrib: R$5.1k   │
│                │  Próx. ação:         │                      │
│                │  Enviar proposta →   │  CPL: R$18 → LTV R$1.2k
└────────────────┴──────────────────────┴──────────────────────┘
```

**O que este conceito comunica:**
- O produto entrega inteligência, não apenas captura
- Revenue Attribution é único e explícito (ROAS 4.1x)
- O lead "WhatsApp · Dom 23h" implica que a conversa aconteceu sem o usuário
- "+34% MoM" promete crescimento, não apenas automação

**Pontuação:**

| Critério | Nota (0–10) | Justificativa |
|---|---|---|
| Clareza | 7 | Imediato para gestor/CMO/CEO; requer contexto para PME |
| Diferenciação | 10 | ROAS + Lead Intelligence + Resumo IA = nenhum concorrente tem |
| Conversão | 8 | Alta para ICP gestor/agência; média para ICP PME |
| Revenue OS | 10 | Comunica Revenue OS puro — MRR, ROAS, forecast, atribuição |
| Escalabilidade futura | 9 | Dashboard de inteligência é o destino premium do produto |
| **Total** | **44/50** | |

**Risco principal:** Para o visitante que não sabe como os leads chegam ali, falta a parte inicial da história. O mockup mostra a segunda-feira de manhã, mas não explica o domingo à noite. Um elemento "canal de origem: WhatsApp" resolve parcialmente — mas exige que o visitante faça a conexão sozinho.

---

### CONCEITO C — Transformation-first

**Premissa narrativa:**
> "Antes: lead chega no WhatsApp → vai para a planilha → some. Depois: lead chega no WhatsApp → é qualificado → entra no CRM com score e resumo → você fecha."

**O que o mockup mostra:**
Uma narrativa em dois painéis com estado explícito de "antes" e "depois". Não é uma tela do produto — é a *transformação que o produto cria*. O mockup é dividido verticalmente: à esquerda, o fluxo caótico (manual, planilha, silêncio); à direita, o estado Flux (agente, score, pipeline, receita).

```
┌──────────────────────────────────────────────────────────────┐
│  chrome: fluxagent.studio/dashboard                          │
├─────────────────────────┬────────────────────────────────────┤
│  ANTES  ░░░░░░░░░░░░░   │  COM FLUX AGENT STUDIO             │
│  ─────────────────────  │  ─────────────────────────────── ⚡ │
│                         │                                    │
│  Lead entra no WhatsApp │  Lead entra no WhatsApp            │
│  ↓                      │  ↓                                 │
│  Você não viu           │  Agente responde em 3 segundos     │
│  ↓                      │  ↓                                 │
│  Lead mandou no rival   │  IA qualifica e pontua             │
│  ↓                      │  ↓                                 │
│  [planilha vazia]       │  CRM: Score 87 · Resumo pronto     │
│                         │  ↓                                 │
│  MRR perdido: ?         │  MRR pipeline: R$14.200/mês        │
│  Atribuição: nenhuma    │  Campanha: Meta Ads · ROAS 3.8x    │
│                         │                                    │
│  ░░░░░░░░░░░░░░░░░░░░░  │  ↑ +34% MoM                        │
└─────────────────────────┴────────────────────────────────────┘
```

**O que este conceito comunica:**
- Transforma o problema em narrativa visual — dor à esquerda, solução à direita
- Zero ambiguidade sobre o antes/depois
- "Lead mandou no rival" é o FOMO mais poderoso possível em formato visual
- Inclui Revenue Attribution sem precisar explicar o que é

**Pontuação:**

| Critério | Nota (0–10) | Justificativa |
|---|---|---|
| Clareza | 10 | Antes/depois é o formato mais universalmente compreensível |
| Diferenciação | 8 | A narrativa é única, mas visualmente pode parecer uma apresentação de slides |
| Conversão | 9 | Alta para todos os ICPs — dor explícita + solução concreta |
| Revenue OS | 8 | Revenue aparece dos dois lados — mas o "antes" cria tanto impacto que pode distrair |
| Escalabilidade futura | 6 | Antes/depois é uma metáfora de lançamento — após maturidade, o produto não precisa mais se comparar ao estado de "sem produto" |
| **Total** | **41/50** | |

**Risco principal:** O design de "antes/depois" tem potencial de parecer uma apresentação comercial ou um slide de pitch deck — não um produto premium. É um conceito poderoso para ads e landing pages de campanha, mas pode rebaixar a percepção de sofisticação da marca se mal executado.

---

## Parte 5 — Tabela Comparativa Final

| Critério | A: Builder-first | B: Revenue-first | C: Transformation-first |
|---|---|---|---|
| Clareza | 9 | 7 | 10 |
| Diferenciação | 9 | 10 | 8 |
| Conversão | 7 | 8 | 9 |
| Revenue OS | 6 | 10 | 8 |
| Escalabilidade futura | 8 | 9 | 6 |
| **Total** | **39/50** | **44/50** | **41/50** |

---

## Parte 6 — O Vencedor e a Razão

**Vencedor: CONCEITO B — Revenue-first**

Porém com uma modificação crítica em relação ao conceito puro: **adicionar um elemento implícito de origem conversacional que resolve o risco de "parecer HubSpot".**

### Como diferenciá-lo do HubSpot/Pipedrive visualmente

O Conceito B em estado puro comunica "dashboard de CRM" — e aí o risco do HubSpot é real. A diferença está em três elementos que nenhum CRM tradicional tem e que devem estar prominentes no mockup:

**1. "Canal: WhatsApp · Dom 23h"**
Nenhum CRM gera isso automaticamente. Significa que uma conversa aconteceu às 23h de domingo — sem ninguém da equipe presente. É a prova silenciosa de que há um agente operando.

**2. "Resumo IA: 'Decisor único. Budget R$900/mês. Quer proposta até quarta.'"**
Nenhum CRM escreve isso. O HubSpot tem campos. O Flux gera inteligência. Um resumo em linguagem natural, gerado pela IA a partir da conversa, é visualmente inequívoco: isso não é CRM. Isso é Revenue OS.

**3. "ROAS: 4.1x" na coluna de Atribuição**
O HubSpot tem relatórios de funil. O Flux tem ROAS implícito — sabe qual campanha gerou qual real. Isso é Attribution Revenue-grade, não CRM-grade.

**Com esses três elementos, o Conceito B não parece HubSpot. Parece algo que o HubSpot pagaria para ter.**

### A prova do teste de cobertura de logo

Se o visitante cobrir o logo e ver o Conceito B com os três elementos acima:
- Não parece Typebot → zero canvas de builder
- Não parece HubSpot → Resumo IA em linguagem natural + ROAS por campanha
- Não parece Pipedrive → Score 0–100 gerado por IA + canal de origem conversacional
- Parece algo novo → porque é

---

## Parte 7 — Arquitetura Narrativa Final Recomendada

### A narrativa em três atos (todos dentro do Hero)

```
ATO 1 — COPY (eyebrow + H1 + subheadline)
"Cada conversa que seu time não responde é receita que vai para o concorrente."
→ Nomeia o problema. Cria urgência.

ATO 2 — CTA
"Começar grátis" + "Ver uma conversa virar receita"
→ Oferece a solução. Remove o atrito.

ATO 3 — MOCKUP (Revenue Intelligence com origem conversacional)
Pipeline + Lead Intelligence + Attribution
→ Prova que a promessa é real. Diferencia da categoria errada.
```

**O mockup não ilustra o copy — ele completa o argumento que o copy iniciou.**

O copy diz "receita que vai para o concorrente". O mockup mostra que com o Flux, a receita fica aqui: MRR R$18.200/mês, ROAS 4.1x, pipeline preenchido automaticamente à meia-noite do domingo.

---

### Estrutura visual definitiva do mockup (Conceito B refinado)

```
┌──────────────────────────────────────────────────────────────┐
│  fluxagent.studio/intelligence                               │
├────────────────┬──────────────────────┬──────────────────────┤
│  PIPELINE      │  LEAD — Rafael Souza │  ATRIBUIÇÃO          │
│  ──────────    │  ─────────────────   │  ─────────────────── │
│  Qualif.  14   │  Score: 89 / 100     │  Meta · "Imob Nov"   │
│  Contato   9   │  ↑ Alto potencial    │  47 leads · 66% qual.│
│  Proposta  4   │                      │  MRR: R$12.400       │
│                │  ⚡ WhatsApp          │  ROAS implícito: 4.1x│
│  MRR total:    │  Dom 23h42           │                      │
│  R$18.200/mês  │                      │  Google · "SDR Nov"  │
│                │  Resumo IA:          │  22 leads · 41% qual.│
│  +34% MoM      │  "Decisor único.     │  MRR: R$5.100        │
│                │  Budget confirmado.  │                      │
│                │  Quer proposta até   │  CPL → LTV           │
│                │  quarta."            │  R$18 → R$1.200      │
│                │                      │                      │
│                │  Próx. ação: →       │                      │
│                │  Enviar proposta     │                      │
└────────────────┴──────────────────────┴─────────────────────-┘
```

**Hierarquia visual dos elementos:**

| Prioridade | Elemento | Por que aqui |
|---|---|---|
| 1º | Score "89/100 ↑ Alto potencial" | O diferencial central. Lead Intelligence = único no mercado. |
| 2º | "⚡ WhatsApp · Dom 23h42" | Prova que há um agente ativo enquanto o usuário não estava. |
| 3º | Resumo IA em linguagem natural | Diferencia de CRM: o CRM não escreve isso. |
| 4º | "ROAS implícito: 4.1x" | Argumento nuclear para ICP agência/marketing. |
| 5º | "MRR total: R$18.200/mês" | Revenue como número real, não abstrato. |
| 6º | "+34% MoM" | Crescimento — transforma dado pontual em tendência. |

---

### Resposta à pergunta original

**"Como comunicar 'você cria um agente' e 'esse agente gera receita' sem parecer Typebot nem HubSpot?"**

**Resposta: não mostrar o processo de criação no hero. Mostrar o resultado.**

O Builder (canvas de blocos) = a ferramenta. É como mostrar a cozinha num restaurante Michelin — a cozinha não convence a mesa a pedir. O prato convence.

O resultado (Lead Intelligence + Attribution + MRR) = o prato. É o que faz o visitante abrir o cartão.

O Builder aparece em outra seção da LP — "Como funciona" — onde o visitante que já está convencido quer entender o processo. No hero, a pergunta não é "como funciona?" — é "isso resolve o meu problema?".

**A resposta visual do hero deve ser: sim. E aqui está a prova em números.**

---

### Sequência de implementação recomendada

1. **Copy:** Substituir headline e subheadline (conforme HERO-REFINEMENT.md — recomendação final)
2. **CTA secundário:** "Ver uma conversa virar receita" (âncora na seção Jornada)
3. **Mockup:** Substituir canvas de builder pelo Revenue Intelligence (Conceito B refinado)
4. **URL no chrome:** `/intelligence` → sinaliza categoria sem precisar de texto
5. **Eyebrow:** Manter "Conversational Revenue OS" — categoriza antes do H1

---

## Nota Final: O Risco que Ficou Resolvido

O risco da FASE 26C.1B era: "remover o builder pode parecer HubSpot".

A resolução não é "manter o builder". É **usar os elementos que tornam o Revenue OS inequivocamente diferente do HubSpot**:

- HubSpot não gera Resumo IA em linguagem natural a partir de uma conversa de WhatsApp das 23h
- HubSpot não tem Score 0–100 gerado por IA na conversa
- HubSpot não calcula ROAS implícito por campanha via atribuição conversacional
- HubSpot não opera sozinho enquanto o usuário dorme

Cada um desses elementos é visualmente simples de mostrar. Juntos, criam uma tela que não tem categoria — porque o produto criou a categoria.

---

*Criado: 2026-06-03 · FASE 26C.1B*
*Próximo passo: aprovação → implementar Conceito B refinado em `src/pages/Landing.tsx`*
