# Fase 26I.1 — Analytics Upgrade

Tela `/analytics` reconstruída para ser **screenshot-ready**. Zero mock
inline. Todos os números vêm da camada `persistence` — quando o **Demo
Runtime** está ativo (`isDemoMode() === true`), os dados vêm do
`demoDataset` (workspace real **NÃO** é consultado). Fora do demo, as
mesmas agregações rodam contra o workspace ativo.

## Respostas (cenário Demo · "Agência Growth")

| # | Métrica            | Valor          | Origem                                                                   |
|---|--------------------|----------------|--------------------------------------------------------------------------|
| 1 | Leads              | **12**         | `persistence.leads.list({ pageSize: 500 })`                              |
| 2 | Qualificados       | **7**          | leads em `qualificado` + `negociacao` + `convertido` (3 + 1 + 3)         |
| 3 | Convertidos        | **3**          | `isConvertedStage(stage)` → felipe, carolina, tiago                      |
| 4 | Receita realizada  | **R$ 29.900**  | Σ `DEMO_LEAD_VALUES` dos leads convertidos (12.500 + 9.800 + 7.600)      |
| 5 | Receita prevista   | **R$ 44.620**  | Σ valor · probabilidade do estágio (novo 10% · qual. 40% · nego. 70% · conv. 100%) |
| 6 | Canal vencedor     | **Google Ads** | R$ 12.500 em receita (Felipe). Ranking: Google → Instagram → Meta → Site |
| 7 | Bot vencedor       | **Agente de Qualificação Lumina** | 2 conversões · R$ 22.300 em receita atribuída              |

Taxa convertido/decidido: **75%** (3 ganhos vs 1 perdido).

## Composição visual

A tela agora entrega 4 blocos:

1. **5 KPIs no topo** — Leads, Qualificados, Convertidos (destacado),
   Receita realizada, Receita prevista. Tooltips explicativos em cada
   KPI.
2. **Funil de conversão** — barra por estágio com contagem +
   valor acumulado. Estágio `convertido` em verde, `perdido` em
   vermelho, demais em gradient da marca. Mostra também a *taxa
   convertido/decidido*.
3. **Canal vencedor** — ranking por receita realizada; trophy no
   primeiro lugar; mostra leads · conversões · receita.
4. **Bot vencedor** — ranking por conversões; mostra conversas ·
   conversões · receita atribuída.

Badge **"Demo Runtime · Agência Growth"** aparece quando
`isDemoMode()` está ligado, deixando explícito em qualquer screenshot
que aquilo é o cenário oficial de demonstração.

## Como reproduzir o screenshot

```text
1. /dashboard → botão "Explorar workspace demo"
2. /analytics
3. screenshot a 1440x900 (full page)
4. assets/lp-screenshots/S8_analytics_v2.png
```

Arquivo final: `/mnt/documents/lp-screenshots/S8_analytics_v2.png`
(1440 × 900, dpr=2). Pode ser usado como **hero do trecho "Resultados"**
ou para o slot **Revenue/Analytics da Jornada** da LP V2.

## Implementação

| Arquivo                            | Mudança                                                                                  |
|------------------------------------|------------------------------------------------------------------------------------------|
| `src/beta/demoDataset.ts`          | `DEMO_LEAD_VALUES` agora cobre os 12 leads · novo `DEMO_STAGE_PROBABILITY` para forecast |
| `src/pages/Analytics.tsx`          | Reescrita completa: KPIs reais, funil, ranking de canal e bot, badge de Demo Runtime    |

A página continua usando `useQuery` com `staleTime` de 30s e cai
para `EmptyState` quando o workspace real está vazio. Nenhuma outra
tela foi tocada — Dashboard, Leads, Conversations, Revenue, Attribution
continuam consumindo seus próprios pipelines.

## Gaps encontrados

1. **Sem campo `value` no `Lead`**: o domínio ainda não modela ticket
   por lead. Hoje o Analytics monetário só funciona em Demo Runtime
   porque puxa de `DEMO_LEAD_VALUES`. Para colocar valor real em
   produção é preciso adicionar `value?: number` ao `Lead` e popular
   isso no momento da conversão (campo no kanban + repositórios).
2. **Probabilidades de estágio hardcoded**: `DEMO_STAGE_PROBABILITY`
   vive no dataset demo. Em produção precisa virar configuração do
   workspace (ex.: `WorkspaceForecastConfig`).
3. **Sem série temporal**: não há ainda gráfico de leads/receita por
   dia/semana. Bom candidato para a próxima fase (precisa expor
   `createdAt` agregado por bucket).
4. **Bot vencedor mostra `conversations` do bot, não do período**:
   o número 1842 vem direto de `bot.metrics.conversations` no
   dataset, não de uma agregação sobre `conversations`. Funciona
   para screenshot, mas em produção é preciso recalcular.
5. **Funil só conta leads vivos**: leads excluídos ou arquivados não
   aparecem. Adequado para a foto, mas pode mascarar volume real.

## Plano de implementação (fora do escopo desta fase)

1. **F1 — Domínio**: adicionar `value?: number` ao `Lead`; UI no
   detalhe do lead para registrar ticket ao mover para
   `convertido`; popular `metrics.conversions/revenue` em
   `botRepository` Supabase.
2. **F2 — Forecast configurável**: tabela `workspace_forecast_config`
   guardando probabilidade por `stage`, com defaults iguais aos do
   demo (10/40/70/100).
3. **F3 — Série temporal**: nova agregação
   `persistence.analytics.timeseries({ from, to, bucket })` retornando
   leads/conversões/receita por bucket. Componente `<TrendChart/>`
   plotando com Recharts.
4. **F4 — Drill-down**: clicar em um canal/bot filtra a página
   inteira por aquela dimensão. Querystring (`?source=Meta+Ads`).
5. **F5 — Export**: botão "Exportar CSV" no header (snapshot atual
   dos KPIs + tabela por canal + por bot).

## Status para a LP V2

* **S8 Analytics** sai de **BLOCKING** → **READY**.
* Screenshot disponível em `/mnt/documents/lp-screenshots/S8_analytics_v2.png`.
* Recomendado para o frame **Revenue/Analytics** da seção *A Jornada*
  e como prova visual do bloco *"Onde o dinheiro entrou"* na LP.
