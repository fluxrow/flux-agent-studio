# Deliverables — Entregáveis do Método Escala
**O que cada mentorado recebe ao longo do programa**

---

## Visão Geral

Todo mentorado do Método Escala sai do programa com 7 entregáveis concretos.

Não são documentos genéricos. São mapeamentos específicos da empresa do mentorado, construídos ao longo das sessões e refinados pelo GPT Escala.

---

## 1. Diagnóstico Escala

**O que é:** mapa completo da empresa em 7 dimensões.

**Quem produz:** GPT Escala (rascunho) + mentor (validação e aprofundamento)

**Quando:** ao final do onboarding (antes da 1ª sessão)

**Estrutura:**
```
Contexto da empresa
├── Produto/Serviço — o que entrega e para quem
├── Comercial — como vende, volume, gargalo
├── Operacional — como entrega, onde trava
├── Financeiro — faturamento, margem, previsibilidade
├── Pessoas — time, papéis críticos, dependências
├── Tecnologia — stack atual, gaps, automações
└── Estratégia — onde quer estar em 90 dias
```

**Formato:** documento estruturado (markdown / PDF)

**Uso:** base para toda a mentoria. Revisado ao final do programa para medir evolução.

---

## 2. Relatório Escala

**O que é:** resumo executivo dos principais gargalos identificados.

**Quem produz:** GPT Escala (gerado automaticamente do diagnóstico)

**Quando:** ao final do onboarding e atualizado após cada sessão de revisão

**Estrutura:**
```
Relatório Escala — [Nome da Empresa] — [Data]

Situação Atual
└── [2–3 frases sobre o momento da empresa]

Top 3 Gargalos
1. [Gargalo mais crítico + impacto estimado]
2. [Segundo gargalo + impacto estimado]
3. [Terceiro gargalo + impacto estimado]

Oportunidades Identificadas
└── [1–3 alavancas de crescimento]

Perguntas Estratégicas para a Próxima Sessão
└── [3–5 perguntas que o mentor deve aprofundar]
```

**Formato:** 1 página — objetivo é ser lido em 3 minutos

---

## 3. Roadmap Escala

**O que é:** plano de evolução em 3 horizontes: 30, 60 e 90 dias.

**Quem produz:** mentor (define com mentorado na 1ª sessão) + GPT Escala (documenta)

**Quando:** ao final da 1ª sessão ao vivo

**Estrutura:**
```
Roadmap Escala — [Nome da Empresa]

Meta dos 90 dias
└── [1 objetivo principal mensurável]

30 dias — Fundação
├── [Iniciativa 1 + responsável + data]
├── [Iniciativa 2 + responsável + data]
└── [Marco de validação]

60 dias — Tração
├── [Iniciativa 1 + responsável + data]
├── [Iniciativa 2 + responsável + data]
└── [Marco de validação]

90 dias — Escala
├── [Iniciativa 1 + responsável + data]
├── [Iniciativa 2 + responsável + data]
└── [Marco de validação]

Indicadores de Progresso
├── [Métrica 1 — baseline → meta]
├── [Métrica 2 — baseline → meta]
└── [Métrica 3 — baseline → meta]
```

**Revisão:** a cada sessão ao vivo — o que avançou, o que travou, o que muda

---

## 4. Mapa de Prioridades

**O que é:** o que deve ser feito primeiro — e por quê.

**Quem produz:** mentor (com input do GPT Escala)

**Quando:** ao final da 1ª sessão e revisado a cada sessão

**Lógica de priorização:**

Cada iniciativa é avaliada em 2 eixos:

| Eixo | Critério |
|------|----------|
| Impacto | Quanto resolve ou quanto gera em receita/margem/capacidade |
| Esforço | Tempo + custo + complexidade de implementação |

Quadrantes:
```
Alto impacto + Baixo esforço  → FAZER AGORA (Quick Wins)
Alto impacto + Alto esforço   → PLANEJAR (Projetos Estratégicos)
Baixo impacto + Baixo esforço → FAZER SE SOBRAR (Tarefas Operacionais)
Baixo impacto + Alto esforço  → NÃO FAZER (Armadilhas)
```

**Formato:** lista priorizada com justificativa de cada posição

---

## 5. Plano de Processos

**O que é:** mapeamento dos processos críticos da empresa.

**Quem produz:** GPT Escala (rascunho baseado no diagnóstico) + mentorado (valida e detalha)

**Quando:** ao longo das sessões, conforme cada processo é priorizado

**O que mapeia:**
- Processos de aquisição de clientes
- Processos de entrega do produto/serviço
- Processos financeiros (fechamento, faturamento, cobrança)
- Processos de gestão de pessoas (onboarding, 1:1, feedback)
- Processos de tecnologia (backup, acesso, segurança)

**Formato por processo:**
```
[Nome do Processo]
├── Objetivo: o que esse processo garante
├── Responsável: quem executa + quem supervisiona
├── Frequência: quando acontece
├── Entradas: o que precisa para começar
├── Passos: 1, 2, 3... (em ordem)
├── Saída esperada: o que deve ter no final
└── Indicador: como saber se funcionou
```

**Critério de sucesso:** empresa consegue executar o processo sem o fundador presente

---

## 6. Plano de Tecnologia

**O que é:** ferramentas recomendadas, integrações e automações mapeadas.

**Quem produz:** GPT Escala (avalia stack atual + recomenda) + mentor (valida)

**Quando:** ao longo das sessões, conforme processos são mapeados

**Estrutura:**
```
Plano de Tecnologia — [Nome da Empresa]

Stack Atual
├── CRM: [ferramenta ou "inexistente"]
├── Financeiro: [ferramenta ou "planilha"]
├── Projeto/Tarefas: [ferramenta]
├── Comunicação: [ferramenta]
└── Outros: [listar]

Gaps Identificados
├── [Gap 1 + impacto operacional]
└── [Gap 2 + impacto operacional]

Recomendações
├── Curto prazo (30 dias): [ferramenta + motivo + custo estimado]
├── Médio prazo (60 dias): [integração ou automação]
└── Longo prazo (90 dias): [IA ou automação avançada]

Automações Prioritárias
├── [Processo a automatizar + ferramenta sugerida + esforço estimado]
└── [...]
```

---

## 7. GPT Escala (acesso durante toda a jornada)

**O que é:** assistente estratégico disponível entre sessões.

**Quando:** ativo desde o onboarding até o final do programa

**O que oferece:**
- Suporte para dúvidas operacionais e estratégicas
- Refinamento de processos e planos
- Preparação de briefings para sessões ao vivo
- Geração de atas e sínteses pós-sessão
- Atualização do diagnóstico com dados novos

Ver detalhes em [GPTScaleCapabilities.md](../AI/GPTScaleCapabilities.md).

---

## Resumo por Etapa da Jornada

| Entregável | Quando | Quem lidera |
|-----------|--------|------------|
| Diagnóstico Escala | Onboarding (antes da 1ª sessão) | GPT Escala |
| Relatório Escala | Onboarding + após cada sessão | GPT Escala |
| Roadmap 30/60/90 | 1ª sessão ao vivo | Mentor |
| Mapa de Prioridades | 1ª sessão + revisão contínua | Mentor |
| Plano de Processos | Ao longo das sessões | GPT + Mentorado |
| Plano de Tecnologia | Ao longo das sessões | GPT + Mentor |
| GPT Escala (acesso) | Do onboarding ao final | GPT Escala |

---

## Referências

- [CustomerJourney.md](./CustomerJourney.md) — quando cada entregável aparece na jornada
- [DiagnosticFlow.md](../Diagnosis/DiagnosticFlow.md) — como o diagnóstico é conduzido
- [GPTScalePrompt.md](../AI/GPTScalePrompt.md) — como o GPT gera os entregáveis
