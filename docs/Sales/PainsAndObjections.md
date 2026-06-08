# Pains & Objections — Mapa de Dores e Objeções
**Inteligência de vendas do Flux Agent Studio**

---

## Dores Primárias por ICP

### ICP 1 — Agência Digital (ticket R$ 1.500–5.000/mês)

| Dor | Frequência | Como o Flux resolve |
|-----|-----------|---------------------|
| Clientes reclamam que não conseguem medir ROI do marketing | Alta | Revenue Attribution fecha o loop UTM → lead → receita |
| Processo de onboarding de leads é manual e demorado | Alta | Bot qualifica e entra no CRM automaticamente |
| Equipe passa tempo demais em leads não qualificados | Alta | Lead Score elimina desperdício antes do primeiro contato humano |
| Dificuldade em escalar sem aumentar headcount | Média | Agentes operam 24/7 sem custo marginal |
| Cada cliente tem um CRM diferente | Média | Connector Hub com webhook genérico + integrações nativas |

**Frase de dor mais comum:**
> "Meu cliente investe R$ 10k/mês em tráfego e não sabe de qual campanha veio cada cliente."

---

### ICP 2 — PME de Serviços (ticket R$ 300–800/mês)

| Dor | Frequência | Como o Flux resolve |
|-----|-----------|---------------------|
| Perde lead no WhatsApp por demora na resposta | Muito alta | Bot responde em segundos, 24/7 |
| Não tem CRM — usa planilha ou memória | Alta | CRM nativo, sem custo extra, sem setup |
| Leads chegam mas não qualificam → perda de tempo | Alta | Qualificação automática com score antes do contato humano |
| Não sabe qual conteúdo/canal traz mais clientes | Média | UTM tracking automático em todos os leads |
| Não tem time técnico para configurar ferramentas | Alta | AI Builder — bot em 30 min sem código |

**Frase de dor mais comum:**
> "Eu respondo WhatsApp a noite inteira e mesmo assim perco cliente pra concorrente que responde mais rápido."

---

### ICP 3 — Gestor Comercial de SaaS/Médio Porte (ticket R$ 1.000–4.000/mês)

| Dor | Frequência | Como o Flux resolve |
|-----|-----------|---------------------|
| SDRs desperdiçam tempo com leads sem fit | Muito alta | Lead Score + resumo por IA — SDR só entra no lead quente |
| Forecast de vendas é manual e impreciso | Alta | Forecast automático por lead com probabilidade + valor estimado |
| Onboarding de SDR novo leva semanas | Média | Bot qualifica com os critérios exatos definidos pelo gestor |
| Alto churn de SDRs — conhecimento vai embora | Média | Lógica de qualificação fica no bot, não na cabeça do vendedor |
| Dados de CRM incompletos — vendedores não registram | Alta | Dados coletados automaticamente na conversa, sem depender do SDR |

**Frase de dor mais comum:**
> "Meu time de SDR trabalha muito mas a qualidade dos leads que chegam pra AE é baixa. Precisamos de mais qualificação antes."

---

## Mapa de Objeções

### Objeção 1 — Preço / "Está caro"

**Variações:**
- "Não tenho orçamento agora"
- "Vou ver se consigo aprovação"
- "Vou comparar com outras opções"

**Diagnóstico:** geralmente não é sobre preço — é sobre percepção de valor ou timing.

**Resposta:**
```
"Entendo. Me ajuda a entender: o que você gastaria para resolver esse
problema com a solução atual? Seja em tempo da equipe, em ferramentas
separadas, ou em leads perdidos por mês?"
```

**Se for timing real:**
```
"Faz sentido. Quando seria o momento ideal? Posso reservar sua vaga
e entrar em contato em [data específica]."
```

**Números para usar:**
- PME que perde 1 lead/semana por falta de resposta rápida = ~R$ 2.400/mês perdidos (ticket R$ 600 × 4)
- Agência com cliente sem attribution = risco de perder o cliente inteiro

---

### Objeção 2 — "Já tenho chatbot / já uso ManyChat / Typebot"

**Diagnóstico:** não entendem a diferença entre captura e qualificação inteligente.

**Resposta:**
```
"O ManyChat captura. O Flux qualifica — com score de 0 a 100, forecast
de receita individual e o lead já entrando no CRM com todos os dados.
São camadas diferentes. O que o seu chatbot atual faz depois que o lead
responde o fluxo?"
```

**Objetivo:** mostrar que o Flux não substitui — complementa ou substitui com mais valor.

---

### Objeção 3 — "Não tenho equipe técnica"

**Diagnóstico:** medo de complexidade técnica.

**Resposta:**
```
"Esse é exatamente o perfil de quem mais usa o Flux. O AI Builder monta
o bot completo a partir de uma descrição em texto. Você escreve o que
quer — a IA configura. Sem código, sem integração manual, sem suporte
técnico. Posso te mostrar como funciona em 5 minutos?"
```

---

### Objeção 4 — "Preciso pensar / vou pesquisar"

**Diagnóstico:** falta informação específica ou não criou urgência suficiente.

**Resposta:**
```
"Claro. O que você precisa ver antes de tomar uma decisão?
Falta mais clareza sobre como funciona tecnicamente, ou é mais
uma questão de momento?"
```

**Se "momento":**
```
"Entendo. O que precisaria mudar na sua operação para esse ser
o momento certo?"
```

---

### Objeção 5 — "E se o bot errar / der resposta errada?"

**Diagnóstico:** medo de perder controle da comunicação.

**Resposta:**
```
"Boa pergunta. O bot só responde dentro do que você aprovou no
Knowledge Base. Para qualquer coisa fora do escopo, ele redireciona
para você. Você tem controle total — decide quando o bot atende e
quando um humano entra. Quer ver como essa configuração funciona?"
```

---

### Objeção 6 — "LGPD / segurança dos dados"

**Diagnóstico:** preocupação legítima, especialmente em saúde e educação.

**Resposta:**
```
"O Flux foi construído com LGPD nativo desde o início: banner de
consentimento, registro de aceite, endpoint de exclusão de dados e
audit logs. Cada workspace é isolado com Row Level Security — seus
dados nunca se misturam com os de outros clientes. Posso enviar a
documentação técnica de segurança se quiser."
```

---

## Competidores — Como Posicionar

> **Regra:** nunca falar mal de concorrente pelo nome. Posicionar por valor diferencial.

| Categoria | O que fazem | O que o Flux faz diferente |
|-----------|------------|---------------------------|
| Chatbots (ManyChat, Typebot) | Captura e automação de fluxo | + Qualificação com IA + CRM nativo + Revenue Attribution |
| CRMs (HubSpot, Pipedrive, RD) | Gestão de leads que alguém criou | + Criação automática de leads a partir de conversas |
| IA generativa solta (ChatGPT) | Responde perguntas | + Qualifica + Registra + Atribui receita automaticamente |
| Plataformas de outbound | Prospecção ativa | Flux é inbound-first — lead que já quer comprar |

**Posicionamento único:**
> "O Flux fecha o loop que nenhuma ferramenta fecha sozinha: da primeira mensagem do lead até a campanha de origem da venda."

---

## Sinais de Compra

Reconhecer estes sinais e acelerar:
- Perguntou sobre integração com CRM específico que já usa
- Perguntou sobre preço de planos anuais
- Mencionou urgência ou data de início
- Pediu para ver uma demo
- Comparou com uma solução específica que já testou
- Mencionou um problema de negócio com número concreto
