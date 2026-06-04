# Flux Agent Studio — Autonomous Support Engine
## FASE 26A.7 · Arquitetura de Suporte Orientado por IA

> Arquitetura funcional e operacional para transformar bug reports, feedbacks, feature requests e dúvidas em fluxos resolvidos por IA — com mínima intervenção humana.
> Não é código. É a lógica do sistema.

---

## O Problema que Este Sistema Resolve

**Sem este sistema:**
Um usuário reporta um bug. Ele entra num canal (WhatsApp, email, formulário). Alguém lê. Alguém classifica. Alguém responde. Alguém repassa para o dev. O dev age (ou não). O usuário não sabe o que aconteceu. 3 dias depois, o usuário desistiu.

**Com este sistema:**
O bug é relatado. A IA classifica em segundos, verifica se é um problema conhecido, responde com solução se existir, cria um ticket estruturado se for novo, estima prioridade, e notifica o dev. O usuário recebe atualizações automáticas. O time age só quando necessário.

---

## Arquitetura em Camadas

```
┌─────────────────────────────────────────────────────────────────┐
│  CAMADA 1 — CAPTURA                                             │
│  Todos os canais de entrada convergem para um único intake      │
├─────────────────────────────────────────────────────────────────┤
│  CAMADA 2 — CLASSIFICAÇÃO                                       │
│  IA determina tipo, urgência, componente, duplicidade           │
├─────────────────────────────────────────────────────────────────┤
│  CAMADA 3 — TRIAGEM                                             │
│  Roteamento: resolver agora vs. enfileirar vs. escalar          │
├─────────────────────────────────────────────────────────────────┤
│  CAMADA 4 — RESOLUÇÃO                                           │
│  Resposta automática, knowledge base, FAQ dinâmico              │
├─────────────────────────────────────────────────────────────────┤
│  CAMADA 5 — ROADMAP                                             │
│  Feature requests agrupados, votados, priorizados               │
├─────────────────────────────────────────────────────────────────┤
│  CAMADA 6 — ESCALONAMENTO                                       │
│  Critérios objetivos para chegar ao humano                      │
├─────────────────────────────────────────────────────────────────┤
│  CAMADA 7 — FECHAMENTO + APRENDIZADO                            │
│  Satisfação, atualização da knowledge base, melhoria do modelo  │
└─────────────────────────────────────────────────────────────────┘
```

---

## CAMADA 1 — Captura

### Canais de Entrada

| Canal | Tipo de usuário | Volume esperado | Prioridade |
|---|---|---|---|
| Widget in-app (feedback flutuante) | Usuário ativo | Alto | Alta |
| Email suporte@ | Todos | Médio | Média |
| WhatsApp Business | PME/Agências | Médio | Alta |
| GitHub Issues (beta) | Usuários técnicos | Baixo | Alta |
| Formulário de onboarding | Novo usuário | Baixo | Alta |
| NPS pós-sessão | Usuário recorrente | Alto | Baixa |

### Normalização

Independente do canal, cada item entra no sistema como um **Ticket Unificado**:

```
TicketUnificado {
  id: uuid
  canal: enum(widget|email|whatsapp|github|form|nps)
  timestamp: datetime
  user_id: string
  workspace_id: string
  raw_text: string          ← texto original, sem edição
  attachments: string[]     ← screenshots, logs
  contexto_tecnico: {
    url: string             ← página onde estava
    user_agent: string
    plano: string           ← free|pro|agency
    tempo_de_conta: number  ← dias desde cadastro
    ultima_acao: string     ← última coisa que fez no produto
  }
  status: "novo"
}
```

**Por que capturar `ultima_acao`:** 90% dos bugs fazem mais sentido quando você sabe o que o usuário estava fazendo. Essa informação costuma estar disponível no frontend mas ninguém coleta.

---

## CAMADA 2 — Classificação

### Tipos de Item

```
BUG           → O produto não faz o que deveria fazer
DUVIDA        → Usuário não sabe como usar algo existente
FEATURE       → Usuário quer algo que não existe
FEEDBACK      → Opinião sem pedido específico
ONBOARDING    → Bloqueio na ativação
BILLING       → Problema com pagamento/plano
CRITICO       → Produto fora do ar / perda de dados
```

### Dimensões da Classificação

Cada ticket recebe automaticamente:

**1. Tipo** (acima)

**2. Urgência**
```
P0 — Crítico: produto inoperante, perda de dados, segurança
P1 — Alto: funcionalidade principal bloqueada para > 1 usuário
P2 — Médio: funcionalidade parcialmente quebrada ou workaround existe
P3 — Baixo: UX ruim, sugestão, dúvida de uso
```

**3. Componente**
```
ai-builder | knowledge-base | connector-hub | crm-pipeline |
lead-intelligence | revenue-attribution | tracking | compliance |
public-bot | builder-canvas | auth | billing | onboarding | outros
```

**4. Duplicidade**
- Comparar com tickets abertos (similaridade semântica > 0.85 = duplicata)
- Se duplicata: linkar ao ticket original, não criar novo

**5. Sentimento**
```
frustrado | neutro | positivo | urgente
```
Não para priorizar — para calibrar o tom da resposta automática.

### Como a Classificação Acontece

```
1. IA recebe raw_text + contexto_tecnico
2. Extrai: componente afetado, ação que causou, comportamento esperado, comportamento real
3. Busca na knowledge base: existe artigo ou resolução para isso?
4. Busca em tickets fechados: foi resolvido antes? como?
5. Busca em tickets abertos: é duplicata?
6. Atribui tipo + urgência + componente + duplicidade
7. Gera structured_summary (3 campos máximo)
```

**Structured summary format:**
```
O usuário estava fazendo: [ação específica]
O problema encontrado: [comportamento real]
O que esperava: [comportamento correto]
```

Esse formato é o que o dev recebe — não o texto bruto do usuário.

---

## CAMADA 3 — Triagem

### Árvore de Decisão

```
NOVO TICKET
│
├── É P0 (crítico)?
│   └── SIM → Escalar IMEDIATAMENTE para humano (Camada 6)
│
├── É duplicata?
│   └── SIM → Notificar usuário "estamos trabalhando nisso" + linkar ETA
│
├── É DUVIDA e existe artigo na knowledge base?
│   └── SIM → Responder automaticamente (Camada 4) + CSAT
│
├── É BUG e existe fix conhecido?
│   └── SIM → Responder com workaround + criar ticket técnico de background
│
├── É FEATURE?
│   └── SIM → Camada 5 (Roadmap)
│
├── É FEEDBACK positivo?
│   └── SIM → Agradecer + extrair quote para marketing (com permissão)
│
└── Nenhum dos acima
    └── Enfileirar para revisão humana com classificação e contexto prontos
```

**Meta:** 60-70% dos tickets resolvidos sem intervenção humana no primeiro ano.

---

## CAMADA 4 — Resolução Automática

### Knowledge Base do Suporte

Estrutura separada da Knowledge Base de produto do usuário final.

```
KB-SUPORTE {
  artigos: [
    {
      id: string
      titulo: string
      componente: string[]
      tipo: string[]         ← bug|duvida|feature
      conteudo_md: string
      solucao: string
      workaround: string?
      versao_resolvida: string?
      efetividade: number    ← % de CSATs positivos após envio
    }
  ]
}
```

### Geração Automática de Artigos

Quando um bug é resolvido:
1. Dev fecha o ticket com nota de resolução
2. Sistema gera rascunho de artigo automaticamente
3. Dev aprova ou edita (1 min de trabalho)
4. Artigo entra na KB e começa a resolver casos futuros automaticamente

**Por que isso importa:** A maioria das ferramentas de suporte jogam o conhecimento fora quando fecham um ticket. Este sistema transforma cada resolução em ativo reutilizável.

### Resposta Automática — Regras de Tom

```
Sentimento FRUSTRADO + Urgência P1/P2:
  → Tom: empático primeiro, solução depois
  → Estrutura: "Entendemos que [X] está te impedindo de [Y]. Aqui está o que você pode fazer agora: [solução]. Estamos acompanhando."

Sentimento NEUTRO + Urgência P3:
  → Tom: direto e informativo
  → Estrutura: "Para [ação], você precisa: [passo a passo]"

Sentimento POSITIVO:
  → Tom: caloroso, sem exagero
  → Estrutura: "Fico feliz que [X] esteja funcionando bem para você. [informação adicional se relevante]"
```

**Regra absoluta:** Respostas automáticas nunca devem negar um problema. Se há incerteza, dizer "estamos verificando" é sempre melhor que "funciona corretamente".

---

## CAMADA 5 — Roadmap de Features

### Fluxo de Feature Request

```
1. Usuário reporta feature request
2. IA extrai: [problema que quer resolver] + [solução proposta]
   (O problema é o dado valioso. A solução proposta é apenas um sinal.)
3. Sistema busca features similares no backlog
4. Se similar existe: incrementa contador de votos + notifica usuário
5. Se nova: cria feature card no backlog
```

### Feature Card

```
FeatureCard {
  id: string
  problema: string          ← O que o usuário não consegue fazer
  solucao_sugerida: string  ← Como o usuário quer resolver (pode mudar)
  componente: string
  votos: number
  solicitantes: [
    { user_id, workspace_id, plano, verbatim }
  ]
  mrr_potencial: number     ← Calculado: soma MRR dos solicitantes
  status: enum(backlog|planejado|em-progresso|entregue|descartado)
  notas_internas: string
}
```

**Por que `mrr_potencial`:** Uma feature pedida por 3 clientes enterprise pode valer mais que uma pedida por 50 usuários free. A IA deve conhecer o plano do solicitante para calcular isso.

### Priorização Automática

Score de prioridade (0–100):

```
SCORE =
  (votos_ponderados_por_mrr × 0.35) +
  (frequencia_no_feedback_nao_estruturado × 0.20) +
  (churn_risk_dos_solicitantes × 0.25) +
  (esforco_estimado_inverso × 0.20)
```

- **votos_ponderados_por_mrr:** não trata todos os votos iguais
- **frequencia_no_feedback:** captura o que as pessoas sentem mas não reportam formalmente
- **churn_risk:** features bloqueando renovação têm prioridade máxima
- **esforco_inverso:** quick wins sobem naturalmente (não dominam, mas contam)

O time decide. Mas chega com dados, não com feeling.

---

## CAMADA 6 — Escalonamento Inteligente

### Critérios de Escalonamento para Humano

| Critério | Ação |
|---|---|
| P0 — Crítico | Notificação imediata (push + email) para fundador + dev |
| Ticket sem resolução em 24h (P1) | Escala para dev on-call |
| Ticket sem resolução em 72h (P2) | Escala para gestor + pergunta ao usuário se quer call |
| 3 tickets P2 do mesmo componente em 48h | Cria incidente automático |
| Usuário respondeu "não resolveu" 2x seguidas | Escala para humano com transcrição completa |
| Usuário com plano Agency/Pro + churn signal | Escala para CS com contexto de conta |
| Menção de dados pessoais ou segurança | Escala imediata para responsável LGPD |

### Pacote de Escalonamento

Quando chega ao humano, o ticket não chega cru — chega com:

```
PACOTE DE ESCALONAMENTO {
  resumo_executivo: string      ← 2 frases, o que acontece e por que importa
  historico_completo: Ticket[]  ← todas as interações
  contexto_da_conta: {
    plano: string
    mrr: number
    tempo_de_conta: number
    nps_historico: number[]
    features_usadas: string[]
    ultimo_login: datetime
  }
  tentativas_de_resolucao: string[]
  sugestao_de_acao: string      ← o que a IA acha que deve acontecer
  urgencia_calculada: P0|P1|P2|P3
}
```

O humano abre o ticket e já sabe tudo que precisa saber para agir.

---

## CAMADA 7 — Fechamento e Aprendizado

### Fechamento do Ticket

Um ticket só fecha quando:
1. Usuário confirma resolução, **ou**
2. 7 dias sem resposta após solução enviada (auto-close com aviso), **ou**
3. Humano fecha manualmente com nota

**Nunca fechar sem notificar o usuário.**

### CSAT Automático

Após fechamento, 1 pergunta:
> "Seu problema foi resolvido? 👍 Sim / 👎 Não"

Se Não:
- Reabre automaticamente
- Escala para humano com flag "tentativa de resolução falhou"

Se Sim:
- Pergunta opcional: "O que poderíamos ter feito melhor?" (texto livre)
- Score vai para o feedback loop do modelo

### Feedback Loop

```
FEEDBACK LOOP SEMANAL {
  1. Quais artigos da KB tiveram mais 👎 depois do envio?
     → Reescrever ou marcar para revisão humana
  
  2. Quais componentes geraram mais tickets P1/P2 na semana?
     → Sinal para roadmap: área de atenção técnica
  
  3. Qual a taxa de resolução automática (meta: 60%+)?
     → Se abaixo: KB precisa de mais artigos
  
  4. Quais tickets escalaram para humano mas poderiam ter sido resolvidos?
     → Adicionar à KB como artigo novo
  
  5. Quais features subiram mais de score?
     → Notificar PM com contexto
}
```

---

## Integração com o Roadmap do Produto

O Autonomous Support Engine não é isolado — ele alimenta o roadmap diretamente.

```
SUPORTE → PRODUTO

Ticket BUG fechado
  → Dev adiciona nota de resolução
  → Sistema gera artigo KB (aprovação rápida)
  → Versão de fix registrada na nota do artigo

Feature Card com score > 70
  → Notificação automática para PM
  → Card movido para "em análise" com todos os solicitantes

3 tickets do mesmo componente em 48h
  → Incidente criado
  → PM e Dev notificados com contexto agregado
  → Se resolvido: post-mortem automático gerado para aprovação

Satisfação CSAT abaixo de 70% por 2 semanas seguidas
  → Alerta para fundador com breakdown por componente
```

---

## Métricas de Saúde do Sistema

| Métrica | Fórmula | Meta |
|---|---|---|
| Taxa de resolução automática | tickets_resolvidos_por_ia / total_tickets | ≥ 60% |
| Tempo médio de primeira resposta | soma(tempo_para_primeira_resposta) / total | < 2 min (bot), < 4h (humano) |
| Tempo médio de resolução | soma(tempo_para_fechamento) / total | < 24h (P2/P3) |
| CSAT | tickets_com_👍 / tickets_com_csat | ≥ 80% |
| Taxa de reabertura | tickets_reabertos / tickets_fechados | < 10% |
| Cobertura da KB | tickets_resolvidos_com_artigo / bugs_resolvidos | ≥ 70% |
| Escalonamento desnecessário | tickets_escalados_sem_necessidade / total_escalados | < 20% |

---

## Implementação Faseada

### Fase 1 — MVP (semana 1–2)
- Widget in-app básico
- Classificação por IA (tipo + urgência + componente)
- Notificação para humano com pacote estruturado
- KB com 20 artigos iniciais (dúvidas de onboarding)

### Fase 2 — Resolução Automática (semana 3–4)
- Resolução de dúvidas por busca na KB
- Resposta automática com tom calibrado por sentimento
- CSAT pós-resolução
- Deduplicação por similaridade semântica

### Fase 3 — Roadmap Integration (mês 2)
- Feature card com score de prioridade
- Feedback loop semanal automático
- Geração automática de artigos KB após resolução de bug

### Fase 4 — Escalonamento Inteligente (mês 2–3)
- Critérios de churn-risk no escalonamento
- Incidente automático por cluster de bugs
- Pacote de escalonamento com contexto de conta completo

---

## Stack Recomendada

Não prescreve ferramentas — prescreve capacidades:

| Capacidade | Opção simples | Opção escala |
|---|---|---|
| Captura multicanal | Typebot embed + webhook | Chatwoot + API |
| Classificação IA | Claude API (Haiku para volume) | Claude API com caching |
| KB semântica | Supabase pgvector (já existe no produto) | Supabase pgvector |
| Workflow/triagem | N8N self-hosted | Temporal |
| Notificação humano | Slack webhook | PagerDuty para P0 |
| Feature board | Linear (API) | Linear API |
| CSAT | Form embed simples | Delighted |

**Insight chave:** O Flux Agent Studio já tem Knowledge Base com RAG e Lead Intelligence. A mesma infraestrutura (pgvector + embeddings) pode servir como backend do Autonomous Support Engine — sem custo adicional de infraestrutura.

---

## O Diferencial Competitivo Deste Sistema

A maioria dos SaaS de PME opera com suporte reativo manual até ter 500+ clientes.

Com este sistema:
- O Flux Agent Studio pode operar com **1 pessoa de CS cobrindo 500+ clientes**
- Cada resolução de bug **gera valor futuro** (artigo KB)
- Cada feature request **alimenta o roadmap com dados financeiros**
- O churn prevenível é detectado **antes** do cancelamento

E existe um loop de produto natural:
> O Flux Agent Studio usa o próprio Flux Agent Studio para suporte → é o melhor case de uso que existe para demonstrar o produto para novos clientes.

---

*Criado: 2026-06-03 · FASE 26A.7*
