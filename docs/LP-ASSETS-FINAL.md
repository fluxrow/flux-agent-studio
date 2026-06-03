# LP V2 — Assets Finais (Fase 26B.2)

> Captura final dos screenshots reais da LP V2, com `setDemoMode(true)` ativo no Demo Runtime (cenário **Agência Growth Demo / Clínica Lumina**).
> Não modifica LP, Home, posicionamento ou design system. Documento de planejamento.

Origem dos arquivos: `/mnt/documents/lp-screenshots/` (PNG, tema dark, viewport desktop).
Para cada item: nome, rota, resolução, uso na LP, observações.

---

## S1 — Dashboard
- **Arquivo:** `S1-dashboard.png`
- **Rota:** `/dashboard`
- **Resolução:** 1905 × 2002 (full-page)
- **Uso na LP:** **Hero principal** — mockup do produto sob o headline.
- **Observações:** Cobertura total do "uau" — saudação, KPIs (3 bots / 12 leads / 5 conversas / 3 conversões), card CRM com pipeline e leads recentes, Workspace Score, AI Builder highlight, Omnichannel, Top bots. Polish opcional: ocultar o card "Tarefas de ativação" para destacar somente métricas.

## S2 — Builder
- **Arquivo:** `S2-builder.png`
- **Rota:** `/builder/lumina-qualify`
- **Resolução:** 1920 × 1080
- **Uso na LP:** Seção **"Construa visualmente"**.
- **Observações:** Paleta de blocos + canvas com 5 blocos visíveis (Message, Input, Message, Choice, Choice, Condition) + painel Propriedades. Layout do canvas não recentralizou ("Fit view" não reposicionou); blocos aparecem cortados à esquerda/direita. **NEEDS POLISH** — ideal centralizar canvas e enquadrar 4–6 blocos conectados.

## S3 — AI Builder
- **Arquivo:** `S3-ai-builder.png`
- **Rota:** `/ai-builder`
- **Resolução:** 1905 × 1186 (full-page)
- **Uso na LP:** Seção **"Crie um agente em 30 segundos"** / CTA principal.
- **Observações:** Prompt + segmento + objetivo preenchidos à esquerda; blueprint gerado à direita (11 blocos, custo R$ 0,0002, 336ms, modelo gpt-5-mini), abas Flow/CRM/Knowledge/Conversa. Polish: labels `bot_name_mock` / `summary_mock` deveriam virar nomes reais (ex.: "Agente Lumina" / resumo em PT). Toast "Blueprint gerado" deve ser ocultado no shot final.

## S4a — PublicBot (WhatsApp)
- **Arquivo:** `S4-publicbot-whatsapp.png`
- **Rota:** `/bot/lumina-qualify` (renderer WhatsApp)
- **Resolução:** 1920 × 1080
- **Uso na LP:** Seção **"Publique em qualquer canal"** (esquerda do par lado-a-lado).
- **Observações:** Header verde "online", 2 balões iniciais da Clínica Lumina, input "Digite sua resposta". Polish: adicionar 2–3 trocas pré-renderizadas para criar densidade visual.

## S4b — PublicBot (Instagram DM)
- **Arquivo:** `S4-publicbot-instagram.png`
- **Rota:** `/bot/lumina-qualify` (renderer Instagram)
- **Resolução:** 1920 × 1080
- **Uso na LP:** Seção **"Publique em qualquer canal"** (direita do par lado-a-lado).
- **Observações:** Header rosa "Ativo agora", balão de saudação + typing indicator (`•••`). Mesmo bot, outro canal — comprova omnichannel.

## S5 — Leads (CRM Kanban)
- **Arquivo:** `S5-leads-crm.png`
- **Rota:** `/leads`
- **Resolução:** 1920 × 1080
- **Uso na LP:** Seção **"CRM integrado"**.
- **Observações:** Pipeline 5 colunas (Novo 4 · Qualificado 3 · Em negociação 1 · Convertido 3 · Perdido 1) com 12 leads reais, scores, temperaturas, tags UTM e origens. **Pronto.**

## S6a — Lead Detail (Timeline)
- **Arquivo:** `S6-lead-timeline.png`
- **Rota:** `/leads/demo-marina` (aba Timeline)
- **Resolução:** 1905 × 1418 (full-page)
- **Uso na LP:** Seção **"Lead Intelligence"** ou complemento de CRM.
- **Observações:** Lead Marina Costa (score 92, quente), dados completos, tags, e timeline com 8 eventos (lead created → flow started → input received → choice selected × 2 → input received → conversation completed → lead updated). Densidade ideal.

## S6b — Lead Detail (Intelligence)
- **Arquivo:** `S6b-lead-intelligence.png`
- **Rota:** `/leads/demo-marina` (aba Intelligence)
- **Resolução:** 1905 × 1791 (full-page)
- **Uso na LP:** Hero secundário de **"Lead Intelligence"** — provavelmente o asset mais denso para essa seção.
- **Observações:** Score breakdown (64/100 com 6 pesos), Resumo IA, Recomendação (próxima ação, melhor horário, melhor canal, mensagem sugerida), Insights (próximo estágio + engajamento), Forecast (58% / R$ 1.455 / 17/06/2026). Polish: badge "MOCK" do Resumo deve ser removida ou renomeada para "IA".

## S7 — Conversations
- **Arquivo:** `S7-conversations.png`
- **Rota:** `/conversations`
- **Resolução:** 1920 × 1080
- **Uso na LP:** Seção **"Conversas em um só lugar"**.
- **Observações:** Inbox unificado com 5 conversas (Marina, Bruna, Felipe, Tiago, Paula) e status (ativa / humano / encerrada). **NEEDS POLISH** — UI atual é só lista, sem painel de thread aberta. Ou (a) implementar split-view com thread, ou (b) usar somente este shot em layout pequeno na LP.

## S8 — Analytics
- **Arquivo:** `S8-analytics.png`
- **Rota:** `/analytics`
- **Resolução:** 1920 × 1080
- **Uso na LP:** Seção **"Decisões com dados"**.
- **Observações:** Apenas 4 KPI cards + mensagem "funil detalhado, performance por bloco e séries temporais estarão disponíveis em breve". **NEEDS POLISH alto** — visualmente fraco para LP. Recomendação: substituir por crop do gráfico Revenue (S9) ou implementar gráfico time-series demo antes da LP.

## S9 — Revenue Intelligence
- **Arquivo:** `S9-revenue.png`
- **Rota:** `/revenue`
- **Resolução:** 1920 × 1080
- **Uso na LP:** Seção **"ROI mensurável"** / hero secundário.
- **Observações:** 4 KPIs (R$ 87.400 · 12 conv · R$ 7.283 ticket · ROAS 6.15x), Receita por canal com barras e ROAS (Meta 5.82x · Google 5.98x · IG 7.00x · Orgânico 11.20x), Forecast 30 dias R$ 132.000 (+51%), Top campanhas. Polish menor: barras do gráfico "Receita diária 7 dias" estão renderizando muito baixas (quase invisíveis).

## S10 — Attribution
- **Arquivo:** `S10-attribution.png`
- **Rota:** `/attribution`
- **Resolução:** 1920 × 1080
- **Uso na LP:** Sub-seção de **"ROI mensurável"** — complementa S9.
- **Observações:** KPIs (7.826 visitantes · 595 leads · 14 conversões · R$ 101.400) + tabela multi-touch (facebook/google/instagram/direct × campanha × visitantes/leads/conv/receita) com ROAS médio 6.15x. **Pronto.**

## S11 — Channels
- **Arquivo:** `S11-channels.png`
- **Rota:** `/channels`
- **Resolução:** 1905 × 1139 (full-page)
- **Uso na LP:** Seção **"Onde quiser falar com seus clientes"**.
- **Observações:** Grid 7 canais — WhatsApp Cloud API, Instagram Direct, Facebook Messenger, Widget de Site, Telegram, TikTok, Google Business Profile, Canal customizado via API. Estados Conectado / Desconectado / Em breve. **Pronto.**

---

## Resumo

| ID  | Tela                  | Resolução   | Uso na LP                          | Status        |
|-----|-----------------------|-------------|------------------------------------|---------------|
| S1  | Dashboard             | 1905×2002   | Hero principal                     | READY         |
| S2  | Builder               | 1920×1080   | Construa visualmente               | NEEDS POLISH  |
| S3  | AI Builder            | 1905×1186   | Crie em 30s / CTA                  | NEEDS POLISH  |
| S4a | PublicBot WhatsApp    | 1920×1080   | Publique em qualquer canal (E)     | READY         |
| S4b | PublicBot Instagram   | 1920×1080   | Publique em qualquer canal (D)     | READY         |
| S5  | Leads CRM             | 1920×1080   | CRM integrado                      | READY         |
| S6a | Lead Timeline         | 1905×1418   | Lead Intelligence (timeline)       | READY         |
| S6b | Lead Intelligence     | 1905×1791   | Lead Intelligence (IA)             | READY         |
| S7  | Conversations         | 1920×1080   | Conversas em um só lugar           | NEEDS POLISH  |
| S8  | Analytics             | 1920×1080   | Decisões com dados                 | NEEDS POLISH  |
| S9  | Revenue               | 1920×1080   | ROI mensurável (hero)              | READY         |
| S10 | Attribution           | 1920×1080   | ROI mensurável (suporte)           | READY         |
| S11 | Channels              | 1905×1139   | Onde quiser falar com clientes     | READY         |
