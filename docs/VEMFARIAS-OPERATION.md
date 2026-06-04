# @vemfarias — Operational Blueprint
## FASE 26Z.4 · Como essa operação funciona dentro do Flux Agent Studio

> Este documento não é sobre software. É sobre uma operação real.
> @vemfarias cria conteúdo, roda anúncios, recebe DMs no Instagram,
> qualifica interessados e vende mentorias. O que o produto consegue
> executar disso hoje — e o que ainda não consegue.
>
> Criado em: 2026-06-04.
> Baseado em: REALITY-CHECK-AUDIT.md + FLUXROW-GAP-ANALYSIS.md.

---

## O Fluxo Desejado

```
Conteúdo (Reels, Stories, Posts)
       ↓
    Anúncio (Meta Ads)
       ↓
   Instagram (impressão → toque)
       ↓
      DM (conversa abre)
       ↓
      IA (qualifica automaticamente)
       ↓
  Qualificação (score + contexto)
       ↓
     CRM (lead registrado)
       ↓
   Follow-up (re-engajamento automático)
       ↓
  Agendamento (call/sessão marcada)
       ↓
   Mentoria (entregue)
```

Dez etapas. O produto executa três com confiança, duas parcialmente, e trava em cinco.

---

## Etapa por etapa — o que existe, o que falta, o que bloqueia

---

### 1. Conteúdo

**O que o Flux faz aqui:** nada. Não é uma ferramenta de criação de conteúdo.

**O que a operação precisa:** esse passo fica fora do produto. O conteúdo é criado em outro lugar (CapCut, Notion, Canva, câmera). O Flux entra depois que o conteúdo gera resultado — quando alguém clica ou manda mensagem.

**Status:** fora de escopo. Sem bloqueio.

---

### 2. Anúncio (Meta Ads)

**O que o Flux faz aqui:** captura o UTM do anúncio que originou o lead.

`src/tracking/visitor.ts` — quando um visitante abre o link do bot (`/bot/:slug?utm_source=meta&utm_campaign=mentoria-abril`), os parâmetros UTM são capturados em `localStorage` e associados ao perfil do visitante.

Isso significa que se o anúncio aponta para um link do bot (não para o Instagram diretamente), a origem do lead é rastreada de verdade.

**O problema:** o anúncio do @vemfarias provavelmente aponta para o Instagram (Click-to-DM) ou para um link de bio — não para um bot do Flux. Isso quebra o tracking.

**O que falta:** o anúncio precisaria apontar para um link do Flux (ex: `fluxagent.studio/bot/vemfarias?utm_campaign=mentoria`) ou o Meta CAPI precisaria ser configurado para enviar eventos de conversão de volta para o anúncio.

**Status:** PARCIAL. Tracking funciona se o fluxo de entrada for via link do Flux. Não funciona se a entrada for Instagram DM direto.

---

### 3. Instagram → DM

**Este é o maior bloqueador de toda a operação.**

O @vemfarias posta um Reel. Aparece um anúncio. O interessado clica em "Enviar mensagem" no perfil do Instagram. Abre um DM.

O Flux Agent Studio não consegue interceptar esse DM.

`src/channels/stubs.ts`:
```
export const instagramChannel = makeStub("instagram", "Instagram DM");
// "None of these talk to a real platform yet"
```

Não existe nenhuma chamada à Meta Graph API. Não existe webhook para receber mensagem do Instagram. A integração é um arquivo stub que emite eventos internos para o sistema parecer preparado — mas não faz nada real.

**Para isso funcionar de verdade precisa:**
- Conta do Instagram Business conectada ao Meta Business Manager
- App na Meta Developer Platform aprovado com permissão `instagram_manage_messages`
- Webhook configurado para receber DMs em tempo real
- Adapter real implementado em `src/channels/` que envie e receba mensagens via Graph API

Isso é trabalho de desenvolvimento. Não existe hoje.

**Workaround possível:** mudar o fluxo de entrada. Em vez de receber o interessado no DM do Instagram, o CTA do conteúdo e do anúncio aponta para um link de bio ou botão que abre o bot web do Flux (`/bot/vemfarias`). A conversa acontece no Flux, não no Instagram. Perde a naturalidade do DM, mas ganha tudo que o produto oferece.

**Status:** BLOQUEADOR. Sem workaround fiel ao fluxo original.

---

### 4. IA — Atendimento e Qualificação automática

**O que o Flux faz aqui:** o bot executa o fluxo criado no Builder. Para cada mensagem, o AI Block processa e responde.

**O problema descoberto no Reality Check:** todos os providers de IA (OpenAI, Anthropic, Gemini) estão em modo mock. `src/ai/providers/index.ts` usa `buildMockProvider()` para os três. As respostas são strings pré-definidas — não chamadas reais a nenhuma API.

Isso significa que o bot conversa, mas a "inteligência" é simulada. As respostas são do tipo `"Resposta gerada (mock). Esta é uma simulação até conectarmos o provider real."` — o que é um problema sério para uma conversa de qualificação de mentoria.

**O que funciona:**
- O fluxo estruturado (perguntas fixas, botões, coleta de dados) funciona sem IA real
- O scoring de lead é calculado com lógica real — o mock atrapalha a qualidade do input, não a lógica do score
- O bot pode qualificar com perguntas diretas e condicionais mesmo sem IA real

**O que falta:**
- Conectar um provider real (trocar `buildMockProvider` por chamada real à API da OpenAI ou Anthropic)
- O arquivo `src/ai/providers/_mock.ts` documenta exatamente onde fazer o swap

**Status:** PARCIAL. Qualificação por perguntas estruturadas funciona. Qualificação com IA conversacional livre não funciona até conectar provider real.

---

### 5. Qualificação — Score e Contexto

**Este passo funciona melhor do que parece.**

`src/intelligence/scorer.ts` — o cálculo de score 0–100 é código funcional real. Não depende de IA externa. Avalia:

- Completude dos dados coletados (nome, e-mail, telefone, empresa)
- Fonte de origem (meta-ads recebe score 80, organic 65, referral 90)
- Se havia campanha rastreada
- Número de interações na conversa
- Respostas completadas vs total de perguntas
- Classificação por IA (mock por ora, mas o slot existe)
- Tempo desde última interação

Para o @vemfarias: um interessado que veio de anúncio, respondeu todas as perguntas, informou nome, e-mail e objetivo — chega com score alto. Um que só mandou "oi" e sumiu — chega com score baixo.

O `LeadIntelligencePanel` exibe isso: score, temperatura (frio/morno/quente), resumo, próxima ação recomendada (ex: "ligar hoje"), forecast.

**O que precisa estar ativo:** `VITE_USE_SUPABASE=true` para que os leads sejam persistidos.

**Status:** REAL (lógica). PARCIAL (dados entram mock sem Supabase ativo).

---

### 6. CRM — Lead Registrado

**Funciona, condicionalmente.**

Quando o visitante termina a conversa no bot web, o `CRM Bridge` (`src/lib/crm-bridge.ts`) cria automaticamente um lead no pipeline. Sem digitação manual. O lead aparece no Kanban da página de Leads com todos os dados coletados na conversa.

**Condição:** `VITE_USE_SUPABASE=true`. Sem isso, o lead some no reload.

Para o @vemfarias: o pipeline funcionaria assim:
- Novo → lead acabou de conversar com o bot
- Qualificado → score acima de X, respondeu as perguntas-chave
- Em negociação → recebeu proposta, aguardando resposta
- Convertido → pagou a mentoria
- Perdido → esfriou sem resposta

**O que falta:** a transição entre estágios ainda é manual. Não existe lógica automática que mova um lead de "Qualificado" para "Em negociação" quando o follow-up é enviado ou quando o agendamento acontece.

**Status:** REAL com Supabase ativo.

---

### 7. Follow-up — Re-engajamento automático

**Este é o segundo maior bloqueador.**

Não existe nenhum módulo de follow-up no produto. Zero. Nenhuma sequência de mensagens, nenhum gatilho temporal, nenhuma lógica de "se não respondeu em 48h, fazer X".

`src/lib/mock.ts` tem uma linha: `"enviou follow-up automático"` — mas é dado de interface fictício, não funcionalidade.

Para o @vemfarias a operação seria: lead qualifica, não agenda na hora, IA enviaria mensagem no dia seguinte, depois em 3 dias, depois em 7 dias — cada uma com ângulo diferente. Isso não existe.

**Workarounds possíveis:**

**Opção A — Manual:** o @vemfarias abre o CRM todo dia, vê leads com score alto sem resposta, e manda mensagem manualmente. Funciona. Não é automático.

**Opção B — Conector + Ferramenta externa:** o Connector Hub tem webhook real. Ao criar um lead, um webhook dispara para o Zapier ou Make, que inicia uma sequência de e-mails via ActiveCampaign ou Brevo. Custo adicional. Dependência externa.

**Opção C — Telegram:** o bot pode enviar uma mensagem de follow-up via Telegram se o lead forneceu o @ do Telegram. O adapter Telegram tem HTTP real em `src/connectors/adapters/telegram.ts`. Nicho, mas funciona.

**Status:** ROADMAP. Não existe no produto. Workarounds possíveis mas custosos.

---

### 8. Agendamento — Call ou Sessão Marcada

**Não existe.**

`src/connectors/types.ts` lista `"calendar"` como tipo de conector possível — mas nenhum adapter foi implementado. Não existe integração com Google Calendar, Calendly, Cal.com ou qualquer API de agenda.

Para o @vemfarias: o bot deveria, após qualificar, perguntar "Qual horário funciona para você?" e registrar automaticamente na agenda. Isso não acontece.

**Workarounds possíveis:**

**Opção A — Link externo no bot:** o fluxo termina com uma mensagem: "Para agendar sua sessão gratuita de 30 min, clique aqui: [link do Calendly]". O lead sai do bot e agenda no Calendly. O agendamento não entra automaticamente no CRM. Mas funciona.

**Opção B — Pergunta estruturada + manual:** o bot pergunta nome, e-mail, objetivo e preferência de horário. O @vemfarias vê isso no CRM e confirma o horário por e-mail. Mais trabalho manual, mas zero dependência.

**Opção C — Webhook + Cal.com API:** o bot coleta o horário desejado, dispara webhook para o Cal.com API e cria o evento programaticamente. Requer desenvolvimento de integração customizada.

**Status:** ROADMAP no produto. Workaround A (Calendly link) é imediato e funcional.

---

### 9. Mentoria — Entrega

**Fora do escopo do produto.**

A mentoria acontece no Zoom, Google Meet, Notion, gravação — em outro lugar. O Flux não entrega a mentoria.

O que o Flux pode fazer aqui:
- Registrar que a mentoria aconteceu (mudança manual de estágio para "Convertido" no CRM)
- Disparar automação pós-mentoria via webhook (ex: enviar material complementar, NPS, upsell)
- Atribuir receita ao lead e à campanha de origem (quando Attribution estiver funcionando)

**Status:** fora de escopo. Sem bloqueio operacional.

---

## Diagnóstico por Pergunta

### 1. O que já existe?

| Etapa | O que funciona |
|---|---|
| Anúncio → bot | UTM capturado se link aponta para o bot Flux |
| Conversa (Web) | Bot conversa via Web Widget — funcional |
| Coleta de dados | Nome, e-mail, telefone, objetivo — coletados em variáveis |
| Score de lead | Calculado automaticamente (0–100, 7 fatores) |
| CRM | Lead criado automaticamente após conversa (com Supabase ativo) |
| Pipeline visual | Kanban de estágios funcional |
| Lead Intelligence | Score + temperatura + próxima ação recomendada |

### 2. O que falta?

| Etapa | O que falta |
|---|---|
| Instagram DM | Integração Meta Graph API (adapter não existe) |
| IA conversacional livre | Provider real (todos são mock) |
| Follow-up automático | Módulo não existe — nenhuma sequência |
| Agendamento | Nenhuma integração de calendário |
| Atribuição de receita | Páginas Revenue/Attribution mostram dados mock |

### 3. O que é bloqueador?

Três coisas bloqueiam a operação do @vemfarias como foi imaginada:

**Bloqueador 1 — Instagram DM não conectado**

O fluxo começa com "interessado manda DM no Instagram". Isso não funciona. O produto não recebe DMs. Para rodar a operação hoje, o ponto de entrada precisa ser outro canal — web widget, link de bio, QR code ou WhatsApp (que também não está conectado).

**Bloqueador 2 — Provider de IA não conectado**

O bot existe, o fluxo existe, mas a inteligência é simulada. Para uma conversa de qualificação de mentoria — onde o interessado faz perguntas abertas sobre o programa, conta a situação atual, descreve objetivos — a IA precisa responder com precisão real. Com mock, o bot responde com strings genéricas pré-definidas.

Solução: conectar OpenAI ou Anthropic (`src/ai/providers/_mock.ts` documenta exatamente onde trocar). Não é desenvolvimento de feature — é configuração de credencial e swap de uma linha.

**Bloqueador 3 — Sem follow-up**

Um interessado qualificado que não agendou na hora vai sumir. Sem sequência de re-engajamento, a operação depende de ação manual constante para não perder leads. Para um criador de conteúdo solo, isso é insustentável em escala.

### 4. O que pode usar workaround?

| Etapa | Workaround funcional |
|---|---|
| Instagram DM | Link de bio ou botão do anúncio aponta para o bot web (`/bot/vemfarias`) em vez de DM |
| Agendamento | Último bloco do bot exibe link do Calendly + captura preferência de horário no CRM |
| Follow-up | Webhook dispara sequência externa (Zapier + ActiveCampaign ou Brevo) |
| Receita | Registrar manualmente no CRM o valor da mentoria ao converter o lead |
| IA limitada | Fluxo estruturado com perguntas fixas qualifica bem mesmo sem IA livre |

---

## A Operação Possível Hoje

Se o @vemfarias quiser usar o Flux Agent Studio agora — com o produto do jeito que está — o fluxo funcional é este:

```
Anúncio / Stories / Link de bio
       ↓
Link do bot Flux no bio do Instagram
(ex: fluxagent.studio/bot/vemfarias?utm_campaign=mentoria)
       ↓
Bot web conversa (perguntas estruturadas)
  → "Qual seu maior desafio profissional hoje?"
  → "Já tentou resolver de alguma forma?"
  → "Qual seu investimento disponível para mentoria?"
  → "Deixa seu e-mail para eu te enviar mais informações"
       ↓
Lead cai no CRM com score automático
  → Alta completude + veio de anúncio = score ~80+
       ↓
Bot exibe: "Aqui está o link para agendar sua sessão de 30 min gratuita:"
  → [link Calendly]
       ↓
@vemfarias vê no CRM os leads com maior score
  → Prioriza quem tem score >70 e já abriu o Calendly
       ↓
Follow-up manual (ou via webhook → ActiveCampaign)
  para quem não agendou em 24h
```

Esse fluxo funciona. Não é o ideal. Não é automático do começo ao fim. Mas é real.

---

## A Operação Ideal (quando o produto estiver completo)

```
Anúncio dispara → Instagram DM abre automaticamente
IA responde no DM em segundos — com knowledge base do programa
Qualifica com conversa natural, sem roteiro rígido
Lead entra no CRM com score, resumo e próxima ação
Follow-up automático em D+1, D+3, D+7 com mensagens diferentes
Bot oferece horários disponíveis direto no DM
Lead escolhe, agenda confirma no Google Calendar
Receita atribuída ao anúncio que originou o lead
ROAS calculado por campanha dentro do produto
```

Esse fluxo exige: Instagram DM real + provider de IA real + módulo de follow-up + integração de calendário.

Nenhum dos quatro existe hoje.

---

## Prioridade de desenvolvimento para viabilizar @vemfarias

| # | O que precisa ser feito | Impacto | Esforço | Urgência |
|---|---|---|---|---|
| 1 | Conectar provider de IA real (OpenAI/Anthropic) | CRÍTICO | **XS** — é swap de credencial | Imediato |
| 2 | Setar `VITE_USE_SUPABASE=true` e garantir Supabase configurado | CRÍTICO | **XS** — é configuração | Imediato |
| 3 | Implementar Instagram DM (Meta Graph API) | ALTO | **L** — 3–6 semanas + aprovação Meta | Alta |
| 4 | Criar módulo de follow-up (gatilhos temporais + templates) | ALTO | **M** — 2–4 semanas | Alta |
| 5 | Integrar agendamento (Cal.com ou Calendly API) | MÉDIO | **M** — 2–3 semanas | Médio |
| 6 | Conectar Revenue/Attribution a dados reais | MÉDIO | **S** — substituir analytics-mock | Médio |

**Os itens 1 e 2 podem ser feitos hoje. Em horas. Sem nenhum desenvolvimento.**

Os itens 3, 4 e 5 são o que separa o produto do que @vemfarias precisa de verdade.

---

## Uma linha de resumo

**O @vemfarias pode usar o Flux hoje como formulário inteligente com CRM — não como funil automatizado de mentoria. O funil completo exige Instagram DM real, IA real e follow-up automático. Nenhum dos três existe hoje como produto pronto.**

---

*Documento criado em: 2026-06-04*
*Baseado em: REALITY-CHECK-AUDIT.md · FLUXROW-GAP-ANALYSIS.md · leitura direta do código-fonte*
*Sem marketing. Sem posicionamento. Só operação.*
