# LP V2 — Demo Dataset (Fase 26B.1B)

> Dataset determinístico que alimenta screenshots, mockups e motion graphics da Landing Page V2.
> **Não altera Landing Page, Home, rotas públicas, design system ou copy.**
> Ativa-se exclusivamente quando `setDemoMode(true)` (toggle disponível no Dashboard).

---

## 1. Cenário principal — "Agência Growth Demo"

Uma agência digital usa o Flux Agent Studio para capturar, qualificar e atribuir
receita dos leads dos seus clientes.

| Campo            | Valor                                       |
|------------------|---------------------------------------------|
| Cliente          | Clínica Lumina                              |
| Campanha         | Meta Ads · Avaliação Estética               |
| UTM campaign     | `avaliacao-estetica-junho`                  |
| Bot principal    | Agente de Qualificação Lumina (`lumina-qualify`) |
| Lead hero        | **Marina Costa** — quente · score 92 · R$ 8.400 · etapa Negociação |

---

## 2. Entidades criadas (em demo mode)

Fonte única: [`src/beta/demoDataset.ts`](../src/beta/demoDataset.ts).

### Bots (3)
- `lumina-qualify` — **publicado** · WhatsApp · 1.842 conversas · 327 conversões
- `lumina-followup` — ativo · WhatsApp · 612 conversas · 96 conversões
- `lumina-ai-draft` — **rascunho gerado pelo AI Builder**

### Fluxos
- Fluxo demo "SDR" reaproveitado de `mockFlows["sdr-imob"]` (10 blocos, ramificação, condition, end).

### Leads (12)
- 1 hero (Marina Costa) — Negociação · 92
- 3 quentes adicionais (Bruna, Felipe, Carolina) — Qualificado / Convertido
- 3 convertidos com `value` (Felipe R$ 12.500 · Carolina R$ 0 (organic) · Tiago + Marina pipeline)
- Restante distribuído em Novo / Qualificado / Perdido para encher o kanban
- Tags: `meta-ads`, `google-ads`, `avaliacao-estetica-junho`, `organico`, `fechou`

### Conversas
- 5 sessões demo (reaproveitadas de `mockConversations`) com histórico de mensagens reais.

### Eventos / tracking
- 8+ eventos via flow runtime + atribuição UTM em `lead_attribution`.

### Conversões com `value`
- 3 conversões com `value` em `DEMO_LEAD_VALUES` (R$ 8.400 / R$ 6.200 / R$ 12.500).

### Revenue Intelligence (`DEMO_REVENUE`)
- Receita atribuída: **R$ 87.400**
- Conversões: **12** · Ticket médio: **R$ 7.283** · ROAS: **6,15x**
- Forecast 30 dias: **R$ 132.000**
- Quebra por canal: Meta Ads · Google Ads · Instagram · Orgânico
- Top campanhas: `avaliacao-estetica-junho`, `protocolo-facial-q2`, `remarketing-30d`
- Série diária 7 dias para gráfico de tendência

### AI Builder demo (fixo)
- Prompt pré-preenchido: _"Crie um agente para qualificar leads de uma clínica estética que recebe campanhas do Meta Ads."_
- Segmento: Saúde · Produto: Avaliação estética · Objetivo: qualificar_leads
- Resultado gerado: fluxo Saudação → Nome → WhatsApp → Intenção → Orçamento → Análise IA → Handoff → Fim, com variáveis `lead_name`, `lead_phone`, `intent`, `budget`, `ai_summary` e tags `saúde`, `qualificar-leads`.

---

## 3. Como ativar

1. Abrir o **Dashboard**.
2. Toggle **"Demo mode"** (já existe — `setDemoMode(true)`).
3. Recarregar a página — a seed determinística é injetada em `src/mocks/index.ts` ao carregar.
4. O banner de demo permanece visível para sinalizar visualmente que o workspace é de demonstração.

> Toggle persiste em `localStorage` (`fluxbot.demoMode = "1"`). Não cria dados em backend real.

---

## 4. Rotas prontas para screenshot

Com demo mode ativo:

| # | Rota                | Status visual         |
|---|---------------------|-----------------------|
| 1 | `/dashboard`        | READY (workspace ativo, KPIs populados) |
| 2 | `/builder/sdr-imob` | READY (canvas com 10 blocos) |
| 3 | `/ai-builder`       | READY (prompt + contexto pré-preenchidos; basta clicar **Gerar**) |
| 4 | `/leads`            | READY (kanban com 12 leads, 3 convertidos) |
| 5 | `/leads/demo-marina`| READY (lead hero com score 92, timeline e tags) |
| 6 | `/conversations`    | READY (5 sessões com histórico) |
| 7 | `/analytics`        | READY (séries demo) |
| 8 | `/revenue`          | **READY (desbloqueado em demo mode)** |
| 9 | `/attribution`      | READY (UTM Meta Ads na campanha hero) |
| 10| `/channels`         | READY (estados de conexão) |
| 11| `/bot/lumina-qualify` | READY (PublicBot publicado) |

---

## 5. Atualização ao `LP-ASSETS-READY.md`

Após esta fase, telas mudam de status:

| Tela | Antes         | Depois (com demo mode) |
|------|---------------|------------------------|
| S2 AI Builder         | NEEDS POLISH | **READY** |
| S5 Lead Intelligence  | NEEDS POLISH | **READY** |
| S7 Analytics          | NEEDS POLISH | **READY** |
| S8 Revenue            | **BLOCKED**  | **READY** |
| S10 Conversations     | NEEDS POLISH | **READY** |
| S12 Health            | NEEDS POLISH | **READY** |

Todas as 13 telas do inventário (S1–S13) ficam **READY** com demo mode ativo.

---

## 6. Garantias

- ✅ Determinístico: mesmos IDs, mesmos valores, mesma ordem.
- ✅ Idempotente: re-injetar não duplica entidades.
- ✅ Isolado: só age quando `isDemoMode() === true`.
- ✅ Não toca Landing Page, Home, design system, copy pública ou rotas públicas.
- ✅ Não envia nada para backend real.

---

## 7. Não fizemos nesta fase

- Não implementamos LP V2.
- Não alteramos hero / copy pública.
- Não modificamos design system.
- Não criamos novos componentes públicos.
- Apenas preparamos munição visual.
