# LP V2 — Inventário de Assets

> Preparação para a Landing Page V2.
> Este documento NÃO altera código, layout, LP ou Home.
> Serve como fonte única de verdade para os assets visuais (screenshots, vídeos curtos, GIFs) que serão usados na nova LP.

Legenda de prioridade:
- **CRÍTICO** — sem este asset a LP não comunica o valor central.
- **ALTO** — reforça prova de produto, indispensável em seções principais.
- **MÉDIO** — enriquece seções secundárias / social proof.
- **BAIXO** — opcional, usado em rodapé, docs, ou variações.

---

## 1. Builder
- **URL:** `/builder/:botId`
- **Estado atual:** Funcional. Canvas com empty state, paleta de blocos com tooltips, FlowSummaryPanel, FlowHealthCheck, tour guiado e save status ("Salvo" / "Não salvo") após Fase 23D.
- **Pode virar screenshot?** Sim — canvas com 3–5 blocos conectados + paleta visível.
- **Precisa de dados?** Sim — um flow de exemplo (ex.: boas-vindas → pergunta nome → pergunta email → mensagem final).
- **Precisa de polish?** Pequeno — garantir zoom adequado, sem painéis de debug visíveis.
- **Prioridade:** **CRÍTICO**

## 2. AI Builder
- **URL:** `/ai-builder`
- **Estado atual:** Funcional. Prompt → geração de flow.
- **Pode virar screenshot?** Sim — tela com prompt preenchido + preview do flow gerado.
- **Precisa de dados?** Sim — prompt de exemplo realista (ex.: "Atendimento para clínica odontológica").
- **Precisa de polish?** Médio — destacar CTA "Criar com IA" e resultado.
- **Prioridade:** **CRÍTICO**

## 3. Publicação
- **URL:** Modal `PublishDialog` dentro do `/builder/:botId`
- **Estado atual:** Funcional. Dialog com slug, validação, LeadCaptureWarningDialog (Fase 25A).
- **Pode virar screenshot?** Sim — modal aberto com slug preenchido e status "pronto para publicar".
- **Precisa de dados?** Não — apenas um bot válido.
- **Precisa de polish?** Pequeno — garantir tema escuro + slug bonito.
- **Prioridade:** **ALTO**

## 4. PublicBot
- **URL:** `/bot/:slug`
- **Estado atual:** Funcional. Renderers (WhatsApp, Instagram, Messenger, ChatGPT, Form), tipagem realista.
- **Pode virar screenshot?** Sim — preferencialmente renderer WhatsApp + Instagram lado a lado.
- **Precisa de dados?** Sim — snapshot publicado de um bot real.
- **Precisa de polish?** Não.
- **Prioridade:** **CRÍTICO**

## 5. CRM (Leads)
- **URL:** `/leads`
- **Estado atual:** Funcional. Pipeline em colunas (novo → qualificado → negociação → convertido → perdido). Alerta inteligente "conversas > 0 e leads = 0" (Fase 25A).
- **Pode virar screenshot?** Sim — pipeline com ~8–12 leads distribuídos.
- **Precisa de dados?** Sim — workspace demo com leads em todos os estágios.
- **Precisa de polish?** Pequeno — nomes/empresas realistas.
- **Prioridade:** **CRÍTICO**

## 6. Lead Intelligence
- **URL:** `/leads/:leadId` (painel `LeadIntelligencePanel`)
- **Estado atual:** Funcional. Score, temperatura, timeline, atribuição.
- **Pode virar screenshot?** Sim — lead com score alto, timeline rica.
- **Precisa de dados?** Sim — lead com histórico de eventos.
- **Precisa de polish?** Médio — garantir gráfico/score visível.
- **Prioridade:** **ALTO**

## 7. Conversations
- **URL:** `/conversations`
- **Estado atual:** Funcional. Empty state honesto (Fase 23A); com dados, mostra sessões e mensagens.
- **Pode virar screenshot?** Sim — lista de conversas + uma conversa aberta.
- **Precisa de dados?** Sim — sessões com mensagens reais.
- **Precisa de polish?** Pequeno.
- **Prioridade:** **ALTO**

## 8. Analytics
- **URL:** `/analytics`
- **Estado atual:** Funcional. Usa `isConvertedStage` (Fase 25B). KPIs reais.
- **Pode virar screenshot?** Sim — KPIs + gráficos.
- **Precisa de dados?** Sim — pelo menos uma semana de eventos/leads.
- **Precisa de polish?** Médio — confirmar que gráficos não ficam vazios.
- **Prioridade:** **ALTO**

## 9. Revenue Intelligence
- **URL:** `/revenue`
- **Estado atual:** Empty state honesto (Fase 23A). Sem receita atribuída ainda.
- **Pode virar screenshot?** **Não no estado atual.** Para virar asset precisa de leads convertidos com `value` populado.
- **Precisa de dados?** Sim — conversões + valores.
- **Precisa de polish?** Alto — habilitar layout com dados antes do shot.
- **Prioridade:** **MÉDIO**

## 10. Attribution
- **URL:** `/attribution`
- **Estado atual:** Empty state honesto (Fase 23A). Com dados de tracking, mostra origens/canais.
- **Pode virar screenshot?** Condicional — precisa de dados de tracking (utm, referrer).
- **Precisa de dados?** Sim — sessões com UTM.
- **Precisa de polish?** Médio.
- **Prioridade:** **MÉDIO**

## 11. Dashboard
- **URL:** `/dashboard`
- **Estado atual:** Funcional. KPIs reais, ActivationBanner, NextStepCTA, CrmDashboardWidget, OmnichannelWidget, AIBuilderHighlightCard (Fase 23C).
- **Pode virar screenshot?** Sim — versão "workspace ativo" (não-vazio).
- **Precisa de dados?** Sim — workspace demo com bots/leads/conversas.
- **Precisa de polish?** Pequeno — saudação e nome de workspace bonitos.
- **Prioridade:** **CRÍTICO**

## 12. Channels
- **URL:** `/channels`
- **Estado atual:** Funcional. Cards de canais (WhatsApp, Instagram, Messenger, Web, etc.).
- **Pode virar screenshot?** Sim — grid de canais.
- **Precisa de dados?** Não — estático.
- **Precisa de polish?** Pequeno — ícones e estados conectados.
- **Prioridade:** **MÉDIO**

## 13. Templates
- **URL:** `/templates`
- **Estado atual:** Funcional. Galeria de templates.
- **Pode virar screenshot?** Sim — galeria com cards.
- **Precisa de dados?** Não — templates já existem.
- **Precisa de polish?** Pequeno — thumbnails consistentes.
- **Prioridade:** **MÉDIO**

## 14. Onboarding
- **URL:** `/onboarding`
- **Estado atual:** Funcional. Wizard/checklist.
- **Pode virar screenshot?** Sim — passo inicial com checklist visível.
- **Precisa de dados?** Não.
- **Precisa de polish?** Pequeno.
- **Prioridade:** **BAIXO**

---

## Resumo por prioridade

| Prioridade | Telas |
|---|---|
| CRÍTICO | Builder, AI Builder, PublicBot, CRM, Dashboard |
| ALTO    | Publicação, Lead Intelligence, Conversations, Analytics |
| MÉDIO   | Revenue, Attribution, Channels, Templates |
| BAIXO   | Onboarding |

## Dados de demonstração necessários
Para gerar os screenshots críticos sem violar a regra "nada fake em produção", usar o **modo demonstração** (`setDemoMode(true)` — Dashboard já expõe esse toggle) em um workspace isolado. O modo demo não afeta dados reais do usuário.

Cobertura mínima do workspace demo:
- 3–5 bots (1 publicado, 1 rascunho, 1 com AI Builder).
- 1 flow rico (boas-vindas + captura nome/email/phone + ramificação).
- ~20 leads distribuídos em todos os estágios, com pelo menos 3 convertidos com `value`.
- ~30 conversas com mensagens.
- Eventos de tracking com UTM em pelo menos metade das sessões.
