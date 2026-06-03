# LP V2 — Auditoria Visual de Assets (Fase 26B.1A)

> Auditoria visual de prontidão dos assets para a Landing Page V2.
> **Não modifica código, UI, design system, LP ou Home.** É documento de planejamento.
> Complementa `LP-ASSETS-INVENTORY.md` e `LP-SCREENSHOTS.md` com avaliação de prontidão visual.

Legenda de status:
- **READY** — pode virar screenshot hoje, com dados demo (`setDemoMode(true)`), sem nenhum ajuste de código.
- **NEEDS POLISH** — funciona, mas requer ajustes pequenos (zoom, ordenação, dados, ocultar painéis de debug) ou popular dados demo controlados antes do shot.
- **BLOCKED** — não dá para virar asset hoje; depende de dados reais (ex.: receita atribuída) ou de melhorias de UI ainda não feitas.

Legenda de qualidade visual atual (subjetiva, 1–5):
- ★☆☆☆☆ rascunho · ★★☆☆☆ funcional cru · ★★★☆☆ bom · ★★★★☆ ótimo · ★★★★★ pronto para hero

---

## S1 — Builder
- **Rota:** `/builder/:botId`
- **Qualidade atual:** ★★★★☆ — canvas, paleta, FlowSummaryPanel, FlowHealthCheck, BuilderTour e save status já entregam um visual robusto pós-Fase 23D.
- **Pode virar screenshot hoje?** Sim, com workspace demo.
- **Precisa de polish?** Pequeno — zoom adequado (~80%), esconder dev tools, garantir 4–6 blocos conectados.
- **Precisa de dados?** Sim — flow demo "Boas-vindas + captura nome/email/phone + ramificação".
- **Precisa de empty state?** Não para a LP (queremos canvas populado).
- **Precisa de mock controlado?** Sim — flow demo determinístico em demoMode.
- **Status:** **READY**

## S2 — AI Builder
- **Rota:** `/ai-builder`
- **Qualidade atual:** ★★★☆☆ — UI funcional; o "wow" depende do prompt + preview gerado lado a lado.
- **Pode virar screenshot hoje?** Sim.
- **Precisa de polish?** Médio — destacar prompt + resultado, evitar estado de loading no shot.
- **Precisa de dados?** Sim — prompt realista (ex.: "Atendimento para clínica odontológica") com flow gerado consistente.
- **Precisa de empty state?** Não.
- **Precisa de mock controlado?** Sim — fixar resposta do gerador em demoMode para o shot ser reprodutível.
- **Status:** **NEEDS POLISH**

## S3 — Publicação
- **Rota:** Modal `PublishDialog` em `/builder/:botId`
- **Qualidade atual:** ★★★★☆ — dialog limpo, com slug, validação e LeadCaptureWarningDialog (Fase 25A).
- **Pode virar screenshot hoje?** Sim.
- **Precisa de polish?** Pequeno — slug bonito, estado "pronto para publicar".
- **Precisa de dados?** Não — só um bot válido.
- **Precisa de empty state?** Não.
- **Precisa de mock controlado?** Não.
- **Status:** **READY**

## S4 — PublicBot
- **Rota:** `/bot/:slug`
- **Qualidade atual:** ★★★★★ — renderers (WhatsApp, Instagram, Messenger, ChatGPT, Form) com tipagem realista; visualmente o ativo mais forte do produto.
- **Pode virar screenshot hoje?** Sim — preferir WhatsApp + Instagram lado a lado.
- **Precisa de polish?** Não.
- **Precisa de dados?** Sim — snapshot publicado de bot demo.
- **Precisa de empty state?** Não.
- **Precisa de mock controlado?** Sim — conversa demo com 4–6 trocas.
- **Status:** **READY**

## S5 — Lead Intelligence
- **Rota:** `/leads/:leadId` (`LeadIntelligencePanel`)
- **Qualidade atual:** ★★★★☆ — score, temperatura, timeline e atribuição entregam densidade visual.
- **Pode virar screenshot hoje?** Sim, com lead "rico".
- **Precisa de polish?** Médio — garantir score alto e timeline com 6+ eventos para impacto.
- **Precisa de dados?** Sim — lead demo com histórico completo (visitas, mensagens, conversão).
- **Precisa de empty state?** Não.
- **Precisa de mock controlado?** Sim.
- **Status:** **NEEDS POLISH**

## S6 — CRM (Leads)
- **Rota:** `/leads`
- **Qualidade atual:** ★★★★☆ — pipeline kanban claro, alerta inteligente (Fase 25A).
- **Pode virar screenshot hoje?** Sim.
- **Precisa de polish?** Pequeno — nomes/empresas realistas, equilíbrio entre colunas.
- **Precisa de dados?** Sim — ~12 leads distribuídos em todos estágios, incluindo 3 convertidos.
- **Precisa de empty state?** Não para LP.
- **Precisa de mock controlado?** Sim.
- **Status:** **READY**

## S7 — Analytics
- **Rota:** `/analytics`
- **Qualidade atual:** ★★★☆☆ — KPIs corretos pós-Fase 25B, mas gráficos podem parecer ralos com pouco dado.
- **Pode virar screenshot hoje?** Sim, com semana cheia de eventos.
- **Precisa de polish?** Médio — garantir séries não-vazias e tooltips fechados no shot.
- **Precisa de dados?** Sim — ≥ 7 dias de eventos/leads/conversões.
- **Precisa de empty state?** Não para LP.
- **Precisa de mock controlado?** Sim — séries temporais demo.
- **Status:** **NEEDS POLISH**

## S8 — Revenue Intelligence
- **Rota:** `/revenue`
- **Qualidade atual:** ★★☆☆☆ — hoje empty state honesto (Fase 23A); sem dados, não impressiona.
- **Pode virar screenshot hoje?** **Não** sem popular conversões com `value`.
- **Precisa de polish?** Alto — habilitar layout completo de receita atribuída.
- **Precisa de dados?** Sim — leads convertidos com `value` + atribuição por canal.
- **Precisa de empty state?** Não para LP (queremos a versão com dados).
- **Precisa de mock controlado?** Sim — receita demo distribuída por canal/origem.
- **Status:** **BLOCKED** (depende de dataset demo de receita; sem ele, vira NEEDS POLISH na próxima fase)

## S9 — Dashboard
- **Rota:** `/dashboard`
- **Qualidade atual:** ★★★★☆ — KPIs reais, ActivationBanner, CrmDashboardWidget, OmnichannelWidget, AIBuilderHighlightCard (Fase 23C).
- **Pode virar screenshot hoje?** Sim — versão "workspace ativo".
- **Precisa de polish?** Pequeno — saudação, nome do workspace, ocultar banner de ativação no shot (workspace já ativo).
- **Precisa de dados?** Sim — bots + leads + conversas populados.
- **Precisa de empty state?** Não para LP.
- **Precisa de mock controlado?** Sim.
- **Status:** **READY**

## S10 — Conversations
- **Rota:** `/conversations`
- **Qualidade atual:** ★★★☆☆ — empty state honesto (Fase 23A); com dados, lista + thread funcionam bem.
- **Pode virar screenshot hoje?** Sim, com sessões demo.
- **Precisa de polish?** Pequeno — selecionar conversa com bom histórico antes do shot.
- **Precisa de dados?** Sim — ~10 sessões com mensagens reais.
- **Precisa de empty state?** Não para LP.
- **Precisa de mock controlado?** Sim.
- **Status:** **NEEDS POLISH**

## S11 — Onboarding
- **Rota:** `/onboarding`
- **Qualidade atual:** ★★★☆☆ — wizard/checklist claro mas visualmente simples.
- **Pode virar screenshot hoje?** Sim.
- **Precisa de polish?** Pequeno.
- **Precisa de dados?** Não.
- **Precisa de empty state?** N/A — onboarding é o próprio estado inicial.
- **Precisa de mock controlado?** Não.
- **Status:** **READY**

## S12 — Health (Workspace Health)
- **Rota:** `WorkspaceHealthCard` no `/dashboard` (não há rota dedicada — `SystemHealth` foi ocultado na Fase 23B).
- **Qualidade atual:** ★★★☆☆ — card compacto com score e sinais; útil como detalhe, não como hero.
- **Pode virar screenshot hoje?** Sim, recortando o card.
- **Precisa de polish?** Pequeno — garantir score alto e sinais positivos.
- **Precisa de dados?** Sim — workspace demo ativo.
- **Precisa de empty state?** Não.
- **Precisa de mock controlado?** Sim.
- **Status:** **NEEDS POLISH**

## S13 — Channels
- **Rota:** `/channels`
- **Qualidade atual:** ★★★★☆ — grid de canais consistente (WhatsApp, Instagram, Messenger, Web, etc.).
- **Pode virar screenshot hoje?** Sim.
- **Precisa de polish?** Pequeno — ícones e estados "conectado" visíveis.
- **Precisa de dados?** Não (estados podem ser demo).
- **Precisa de empty state?** Não.
- **Precisa de mock controlado?** Sim — estados de conexão demo.
- **Status:** **READY**

---

## Resumo por status

| Status        | Telas |
|---------------|-------|
| READY         | S1 Builder, S3 Publicação, S4 PublicBot, S6 CRM, S9 Dashboard, S11 Onboarding, S13 Channels |
| NEEDS POLISH  | S2 AI Builder, S5 Lead Intelligence, S7 Analytics, S10 Conversations, S12 Health |
| BLOCKED       | S8 Revenue Intelligence |

---

## Top 10 — telas mais impressionantes (visual / "uau")

Ordenadas por densidade visual, polimento e efeito imediato em quem nunca viu o produto.

1. **S4 PublicBot** — renderers multi-canal lado a lado; é o ativo mais cinematográfico.
2. **S1 Builder** — canvas com flow conectado + paleta; comunica "produto de verdade".
3. **S9 Dashboard** — workspace ativo com KPIs, CRM widget e omnichannel; visão geral rica.
4. **S6 CRM** — pipeline kanban populado; visual familiar e poderoso.
5. **S5 Lead Intelligence** — painel denso com score, timeline e atribuição.
6. **S3 Publicação** — modal limpo que prova "publicar é um clique".
7. **S13 Channels** — grid de canais comunica omnichannel num único frame.
8. **S2 AI Builder** — prompt → flow gerado; é "wow" se o resultado renderizar bem.
9. **S7 Analytics** — KPIs e gráficos; impressiona quando há dados suficientes.
10. **S10 Conversations** — inbox unificado; familiar a qualquer time comercial.

## Top 10 — telas que mais demonstram valor (problema → solução)

Ordenadas pela clareza com que comunicam o **benefício** ao cliente final.

1. **S2 AI Builder** — "crie um agente em 30 segundos" é a promessa #1.
2. **S4 PublicBot** — prova omnichannel real; vende sozinho.
3. **S6 CRM** — pipeline que captura leads do bot; conecta IA → resultado de negócio.
4. **S5 Lead Intelligence** — score + atribuição = "saiba qual lead vale mais".
5. **S9 Dashboard** — sintetiza valor entregue em um único frame.
6. **S1 Builder** — controle visual sobre o agente; combate a sensação de "caixa-preta".
7. **S7 Analytics** — decisões com dados; valida ROI.
8. **S3 Publicação** — fricção zero entre construir e ir ao ar.
9. **S10 Conversations** — todas as conversas em um só lugar.
10. **S13 Channels** — "onde quiser falar com seus clientes".

## Top 10 — telas que devem aparecer na LP V2

Decisão final, balanceando impacto visual + comunicação de valor + prontidão (READY > NEEDS POLISH > BLOCKED).

1. **S9 Dashboard** — Hero principal.
2. **S2 AI Builder** — Seção "Crie um agente em 30 segundos".
3. **S1 Builder** — Seção "Construa visualmente".
4. **S4 PublicBot (WhatsApp + Instagram)** — Seção "Publique em qualquer canal".
5. **S6 CRM** — Seção "CRM integrado".
6. **S5 Lead Intelligence** — Seção "Lead Intelligence".
7. **S10 Conversations** — Seção "Conversas em um só lugar".
8. **S7 Analytics** — Seção "Decisões com dados".
9. **S13 Channels** — Seção "Onde quiser falar com seus clientes".
10. **S3 Publicação** — Sub-seção / animação "Publique em segundos".

> **S8 Revenue** entra na LP **somente após** dataset demo controlado de receita ser preparado (próxima fase). **S11 Onboarding** e **S12 Health** ficam fora do corpo principal da LP — uso em rodapé/docs ou como detalhe secundário.

---

## Pré-requisitos para virar screenshots (resumo executivo)

- **Workspace demo isolado** com `setDemoMode(true)` (toggle já existe no Dashboard).
- **Dataset demo determinístico**: 3–5 bots (1 publicado, 1 rascunho, 1 via AI Builder), 1 flow rico, ~20 leads em todos estágios (3 convertidos com `value`), ~30 conversas com mensagens, eventos com UTM em ≥ 50% das sessões.
- **Fixar resposta do AI Builder em demo** para reprodutibilidade do S2.
- **Popular `value` em conversões** para destravar S8 (Revenue).
- **Resoluções alvo:** 1920×1200 (desktop) e 390×844 (mobile), tema dark.

Tudo acima é planejamento; nenhuma alteração de código foi feita nesta fase.
