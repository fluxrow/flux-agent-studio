# GPT Escala — Capabilities
**O que o assistente consegue fazer**

---

## Visão Geral

O GPT Escala opera em 3 modos conforme o momento do mentorado na jornada:

| Modo | Quando | O que faz |
|------|--------|-----------|
| **Onboarding** | Antes da 1ª sessão | Conduz diagnóstico, gera relatório inicial |
| **Acompanhamento** | Entre sessões | Responde dúvidas, refina processos, prepara próxima sessão |
| **Revisão** | Após cada sessão | Consolida decisões, atualiza Roadmap, gera ata estratégica |

---

## Capacidades por Dimensão

### Diagnóstico
- Conduzir entrevista estruturada em 7 dimensões (ver `DiagnosticFlow.md`)
- Identificar padrões de gargalo por tipo de empresa e fase de crescimento
- Priorizar problemas por impacto × urgência
- Gerar Diagnóstico Escala formatado e pronto para o mentor revisar

### Relatórios
- Relatório Escala — resumo executivo dos gargalos principais
- Mapa de Prioridades — o que fazer primeiro, segundo, terceiro
- Ata de sessão — consolidação das decisões tomadas na mentoria
- Briefing para próxima sessão — o que avançou, o que travou, o que decidir

### Processos
- Mapear processos críticos em formato de fluxo descritivo
- Identificar gargalos operacionais e pontos de dependência humana
- Sugerir estrutura de processos para escalar sem o fundador
- Documentar POPs (Procedimentos Operacionais Padrão) a partir do que o mentorado descreve

### Tecnologia
- Avaliar o stack atual da empresa
- Identificar gaps de ferramenta por função (CRM, gestão, financeiro, automação)
- Sugerir ferramentas adequadas ao estágio e ao orçamento
- Mapear oportunidades de automação e IA nos processos existentes

### Plano de Ação
- Estruturar Roadmap 30/60/90 dias com marcos claros
- Decompor objetivos em ações semanais
- Identificar dependências entre tarefas
- Sinalizar riscos de cada etapa

### Preparação para Sessões
- Revisar o que foi acordado na sessão anterior
- Identificar o que foi executado vs. o que travou
- Formular as 3–5 perguntas mais importantes para a próxima reunião
- Consolidar materiais que o mentorado deve trazer para a sessão

---

## Capacidades por Tipo de Empresa

### Prestadores de Serviço / Agências
- Diagnoscar dependência do fundador na entrega
- Mapear processo de escopo + precificação + entrega
- Identificar onde a operação perde margem
- Estruturar modelo de time (quando contratar, qual perfil)

### SaaS / Produto Digital
- Diagnoscar product-market fit atual
- Mapear funil de aquisição → ativação → retenção
- Identificar métricas faltantes (MRR, churn, CAC, LTV)
- Estruturar roadmap de produto alinhado à estratégia comercial

### Comércio / Varejo
- Diagnosticar gestão de estoque e margem
- Mapear jornada do cliente da aquisição ao pós-venda
- Identificar oportunidades de recorrência e upsell
- Estruturar operação multicanal

### Infoprodutos / Educação
- Diagnosticar funil de vendas e taxa de conversão
- Mapear entrega do produto (suporte, comunidade, ao vivo)
- Identificar alavancas de escala (lançamentos, perpétuo, continuidade)
- Estruturar time de CS e suporte

---

## Limitações (ser transparente)

| O GPT faz | O GPT NÃO faz |
|-----------|---------------|
| Estrutura o diagnóstico | Substitui o julgamento do mentor |
| Sugere ferramentas | Implementa ferramentas |
| Mapeia processos | Executa processos |
| Gera plano de ação | Garante resultados |
| Identifica riscos | Resolve crises jurídicas/financeiras |
| Prepara reuniões | Conduz a mentoria estratégica |

---

## Integração com o Flux Agent Studio

O GPT Escala pode ser implementado dentro do Flux Agent Studio como um agente especializado:

- **Canal:** WhatsApp, Web Widget ou portal exclusivo do programa
- **Fluxo:** DiagnosticFlow configurado no Builder Visual
- **Lead Intelligence:** score de maturidade operacional (0–100) calculado ao final do diagnóstico
- **CRM:** cada mentorado como lead com score, stage e todas as respostas documentadas
- **Knowledge Base:** metodologia do Método Escala alimentando as respostas do GPT
- **Realtime:** mentor recebe notificação quando diagnóstico é concluído

### Score de Maturidade Operacional

| Dimensão | Peso | Critério para pontuação máxima |
|----------|------|-------------------------------|
| Produto/Serviço | 10 | Proposta de valor clara, ICP definido |
| Comercial | 20 | Processo de vendas documentado, previsibilidade |
| Operacional | 20 | Processos documentados, não depende só do fundador |
| Financeiro | 20 | DRE atualizado, margem conhecida, caixa previsível |
| Pessoas | 15 | Time estruturado, papéis definidos, onboarding existe |
| Tecnologia | 10 | Stack integrado, sem planilha como CRM |
| Estratégia | 5 | Metas 90 dias claras e mensuráveis |

**Score ≤ 40 → Empresa em estruturação** — foco em fundação
**Score 41–70 → Empresa em crescimento** — foco em processos e previsibilidade
**Score ≥ 71 → Empresa em escala** — foco em alavancagem e delegação

---

## Referências

- [GPTScale.md](./GPTScale.md) — visão geral e posição na jornada
- [GPTScalePrompt.md](./GPTScalePrompt.md) — system prompt para configuração
- [DiagnosticFlow.md](../Diagnosis/DiagnosticFlow.md) — fluxo de diagnóstico em 7 dimensões
- [CustomerJourney.md](../Product/CustomerJourney.md) — jornada completa do mentorado
