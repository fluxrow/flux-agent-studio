# FLUXROW — GAP ANALYSIS: Capacidade Operacional vs. Flux Agent Studio

> **Versão:** 1.0 | **Data:** 04 de junho de 2026 | **Confidencial — Uso Interno**

---

## Sumário Executivo

O Flux Agent Studio possui uma base técnica sólida: motor de runtime conversacional, CRM com pipeline kanban, atribuição de receita UTM→lead→revenue e uma camada de IA generativa para construção de bots. No entanto, para operar a Fluxrow como um negócio de vendas e sucesso do cliente em produção, existem lacunas críticas que impedem o lançamento autônomo — especialmente no canal WhatsApp (principal canal de vendas B2C no Brasil), em sequências de follow-up automatizado e em agendamento de reuniões. Estas três lacunas são **bloqueadores de lançamento (P0)**. Os demais gaps são relevantes mas contornáveis com processos manuais ou ferramentas externas no curto prazo.

---

## Matriz de Prioridade — Visão Consolidada

| # | Área | GAP Principal | Impacto | Prioridade | Esforço | Bloqueia Lançamento? |
|---|------|--------------|---------|------------|---------|----------------------|
| 1 | WhatsApp | API Meta não conectada — canal principal inoperante | HIGH | P0 | L | SIM |
| 2 | Follow-up | Sem sequências drip/re-engajamento automático | HIGH | P0 | M | SIM |
| 3 | Agendamento | Sem integração nativa de calendário | HIGH | P0 | M | SIM |
| 4 | SDR | Sem email outbound; sem multi-idioma | HIGH | P1 | L | NÃO |
| 5 | CRM | Sem importação em massa de leads | MEDIUM | P1 | S | NÃO |
| 6 | Conteúdo | KB sem persistência estável no Supabase | HIGH | P1 | M | NÃO (workaround existe) |
| 7 | Relatórios | Sem funil temporal detalhado; sem NPS/CSAT | MEDIUM | P1 | M | NÃO |
| 8 | Attribution | Funcional em produção — GAP menor | LOW | P2 | S | NÃO |
| 9 | Revenue | Forecast existe; sem previsão de churn | MEDIUM | P2 | M | NÃO |
| 10 | Onboarding | Beta Program ativo; sem módulo CS dedicado | MEDIUM | P1 | M | NÃO |
| 11 | Automações | Sem A/B testing; sem Zapier/Make nativo | MEDIUM | P2 | M | NÃO |

---

## Análise Detalhada por Área

---

### 1. SDR — Sales Development Representative Automation

> Cobertura da automação de prospecção e qualificação de leads entrantes e outbound.

| Dimensão | Detalhe |
|----------|---------|
| **Capacidade Atual** | AI Builder gera bot de qualificação a partir de 1 prompt. Lead Intelligence score 0–100 com 7 fatores. CRM Engine captura leads automaticamente via CRM Bridge. Connector Hub envia alertas para Slack. Pipeline kanban com estágios configuráveis. |
| **Parcial** | Templates de SDR = stub (arquitetura existe, conteúdo de templates não publicado). Canal web widget funcional para captura inbound. |
| **GAP** | Sem canal de email outbound nativo. Sem sequências de cadência (cold outreach multi-step). Sem integração com ferramentas de prospecção externas (Apollo, Hunter, etc.). Sem flows multi-idioma para prospecção internacional. Sem A/B testing de scripts de qualificação. |
| **Impacto** | HIGH — O SDR automatizado é o core da proposta de valor da Fluxrow. |
| **Prioridade** | P1 |
| **Esforço** | L (email channel = novo canal no Channel Bus; cadências = novo módulo de automação) |
| **Bloqueio para Lançamento?** | NÃO — SDR via web widget funciona para inbound. Outbound pode usar webhook + ferramenta externa no curto prazo. |

**O que funciona hoje para a Fluxrow:**
- Qualificação de leads inbound via chat web widget
- Score automático com próxima ação recomendada
- Notificação do time via Slack quando lead qualificado
- Criação de bot de SDR em minutos via AI Builder

**O que não funciona:**
- Prospecção outbound por email
- Cadências automatizadas de follow-up (ver seção 3)
- WhatsApp como canal de outbound (ver seção 4)

---

### 2. CRM — Gestão de Leads, Pipeline e Kanban

> Cobertura do ciclo de vida do lead do primeiro contato até o fechamento.

| Dimensão | Detalhe |
|----------|---------|
| **Capacidade Atual** | CRM Engine completo com pipeline kanban. Tags automáticas por comportamento. Auto-captura de leads via CRM Bridge. Lead score com 7 fatores (engajamento, intent, frequência, recência, etc.). Forecast de conversão. Next action recommendation. Histórico de interações. Multi-tenant com RLS (dados isolados por cliente). |
| **Parcial** | Importação de leads = não existe UI; possível apenas via API/webhook manual. Campos customizados de CRM = limitados ao schema atual. |
| **GAP** | Sem importação em massa (CSV/Excel) de leads existentes. Sem campos custom ilimitados no lead record. Sem merge de leads duplicados. Sem integração bidirecional com CRMs externos (HubSpot, Pipedrive, Salesforce). Sem histórico de email no timeline do lead. |
| **Impacto** | MEDIUM — CRM funciona bem para leads novos; migração de base existente é problema. |
| **Prioridade** | P1 |
| **Esforço** | S (importação CSV é feature isolada) |
| **Bloqueio para Lançamento?** | NÃO — Para clientes novos sem base legada, o CRM atual é suficiente. |

**O que funciona hoje para a Fluxrow:**
- Pipeline visual completo
- Lead scoring automático
- Captura e enriquecimento automático via bot
- Forecast de pipeline

**O que não funciona:**
- Migrar base de leads de outro CRM sem intervenção técnica
- Sincronizar com CRM externo já em uso pelo cliente

---

### 3. Follow-up — Re-engajamento Automatizado

> Cobertura de sequências de nutrição, reativação de leads frios e drip campaigns.

| Dimensão | Detalhe |
|----------|---------|
| **Capacidade Atual** | Nenhuma. O produto não possui módulo de sequências de follow-up. |
| **Parcial** | Webhook connector pode disparar eventos para sistemas externos que executem follow-ups. Connector para Slack/Telegram pode enviar alertas para o time agir manualmente. |
| **GAP** | Sem drip sequences (email ou WhatsApp). Sem gatilhos temporais ("se lead não respondeu em 48h, enviar mensagem X"). Sem lógica de re-engajamento por segmento. Sem filas de follow-up com priorização. Sem templates de nurturing. |
| **Impacto** | HIGH — Sem follow-up automatizado, leads esfriados exigem ação manual constante. Taxa de conversão cai drasticamente. |
| **Prioridade** | **P0 — BLOQUEADOR DE LANÇAMENTO** |
| **Esforço** | M (trigger engine temporal + templates de sequência) |
| **Bloqueio para Lançamento?** | **SIM** — A proposta central da Fluxrow é automação de vendas. Sem follow-up automático, o produto não executa o ciclo completo de vendas prometido. Workaround: Zapier/Make + webhook, mas adiciona dependência externa e custo. |

**O que funciona hoje para a Fluxrow:**
- Webhooks podem disparar tools externas para follow-up manual
- Lead score identifica leads que precisam de atenção

**O que não funciona:**
- Nenhuma sequência automatizada nativa
- Nenhum gatilho temporal sem integração externa

---

### 4. WhatsApp — Integração de Canal

> Cobertura do canal WhatsApp Business API como canal de atendimento e vendas.

| Dimensão | Detalhe |
|----------|---------|
| **Capacidade Atual** | Arquitetura do Channel Bus preparada. UI de configuração de canal existe. Runtime Engine pode executar flows em qualquer canal quando conectado. |
| **Parcial** | WhatsApp listado como canal no Channel Bus — arquitetura pronta, mas API Meta não está conectada a nenhum número real. Instagram e Telegram igualmente em estado de stub/ready sem conexão real. |
| **GAP** | Sem integração ativa com Meta Cloud API ou BSP (Business Solution Provider). Sem número de WhatsApp Business conectado. Sem envio/recebimento real de mensagens WhatsApp. Sem suporte a templates HSM (mensagens outbound). Sem gestão de opt-in/opt-out WhatsApp conforme política Meta. Sem fallback de canal (WhatsApp → SMS → email). |
| **Impacto** | HIGH — No Brasil, WhatsApp é o canal primário de vendas. Sem WhatsApp real, a Fluxrow opera apenas via web widget, alcançando fração do mercado-alvo. |
| **Prioridade** | **P0 — BLOQUEADOR DE LANÇAMENTO** |
| **Esforço** | L (integração Meta Cloud API, aprovação de templates, gestão de número, webhook bidirecional) |
| **Bloqueio para Lançamento?** | **SIM** — Clientes da Fluxrow esperam WhatsApp como canal principal. Lançar sem WhatsApp real compromete posicionamento e proposta de valor. |

**O que funciona hoje para a Fluxrow:**
- Web Widget 100% funcional como canal de captura
- Runtime Engine já preparado para multi-canal
- Compliance LGPD/GDPR já implementado (ajuda no opt-in WhatsApp)

**O que não funciona:**
- Nenhuma mensagem real via WhatsApp
- Nenhum bot ativo em número WhatsApp Business

---

### 5. Attribution — UTM → Lead → Revenue

> Cobertura do rastreamento de origem do lead até a receita gerada.

| Dimensão | Detalhe |
|----------|---------|
| **Capacidade Atual** | Tracking Engine completo: visitor profile, UTMs, click-IDs (fbclid, gclid). Revenue Attribution loop UTM→visitor→lead→revenue funcional. Revenue Intelligence page (/revenue) em produção. Meta CAPI + GA4 destinations ativos. Tracking Inspector com visibilidade em tempo real do pipeline de atribuição. |
| **Parcial** | Atribuição multi-touch = modelo atual é last-click/first-click; modelos avançados (linear, time-decay) não documentados como disponíveis. |
| **GAP** | Sem atribuição de receita para leads vindos via WhatsApp (canal não conectado). Sem integração nativa com plataformas de mídia além de Meta e GA4 (TikTok Ads, LinkedIn Ads). Sem relatório de ROAS por campanha dentro do produto. |
| **Impacto** | LOW para o que existe; MEDIUM quando WhatsApp for conectado. |
| **Prioridade** | P2 |
| **Esforço** | S (extensões de destino no Connector Hub) |
| **Bloqueio para Lançamento?** | NÃO — Atribuição via web funciona. GAP se resolve quando WhatsApp for conectado. |

**O que funciona hoje para a Fluxrow:**
- Atribuição completa de leads web
- CAPI Meta para conversões offline
- Relatório de revenue com origem UTM

**O que não funciona:**
- Atribuição de vendas fechadas via WhatsApp (canal não ativo)
- ROAS consolidado dentro da plataforma

---

### 6. Revenue — Forecasting e Pipeline MRR

> Cobertura de previsão de receita, MRR de pipeline e saúde financeira do funil.

| Dimensão | Detalhe |
|----------|---------|
| **Capacidade Atual** | Revenue Intelligence page em produção. Lead Intelligence com forecast de conversão por lead. Pipeline kanban com valores de deal associáveis. |
| **Parcial** | MRR de pipeline = calculável se deal values forem preenchidos, mas não há painel dedicado de MRR/ARR. Forecast agregado de pipeline = não confirmado como feature em produção. |
| **GAP** | Sem dashboard de MRR/ARR do pipeline. Sem previsão de churn. Sem cohort analysis de receita. Sem integração com ferramentas de billing para reconciliação automática (exceto Stripe via connector). Sem alerta de risco de deal (deal aging, sem atividade). |
| **Impacto** | MEDIUM — Revenue Intelligence existe, mas é limitada para gestão financeira avançada. |
| **Prioridade** | P2 |
| **Esforço** | M (dashboard MRR, churn prediction model) |
| **Bloqueio para Lançamento?** | NÃO — Connector Stripe + pipeline kanban cobrem necessidade básica no lançamento. |

**O que funciona hoje para a Fluxrow:**
- Rastreamento de receita atribuída
- Forecast individual de lead
- Connector Stripe para dados de pagamento

**O que não funciona:**
- Visão consolidada de MRR do pipeline
- Alertas de deals em risco de perda

---

### 7. Onboarding — Ativação do Cliente

> Cobertura do processo de onboarding de novos clientes da Fluxrow no produto.

| Dimensão | Detalhe |
|----------|---------|
| **Capacidade Atual** | Beta Program ativo com feature flags e health monitoring. System Health Panel para visibilidade do estado da instância. AI Builder permite criar primeiro bot em minutos (1 prompt). Compliance Layer para configuração LGPD já no onboarding. |
| **Parcial** | Checklists de onboarding = Beta Program tem estrutura mas não há fluxo guiado step-by-step para novos usuários. Templates marketplace = stub. |
| **GAP** | Sem módulo de Customer Success dedicado (health score do cliente, alertas de risco de churn). Sem onboarding interativo guiado (product tours). Sem templates prontos por vertical (e-commerce, SaaS, clínicas, etc.). Sem integração com ferramentas de CS externas (Intercom, Gainsight). Sem NPS/CSAT automatizado pós-onboarding. |
| **Impacto** | MEDIUM — Onboarding atual funciona para early adopters técnicos; não escala para clientes não-técnicos. |
| **Prioridade** | P1 |
| **Esforço** | M (product tour + templates por vertical) |
| **Bloqueio para Lançamento?** | NÃO — Para beta/early access com suporte humano, o produto atual é suficiente. Torna-se P0 para escala self-service. |

**O que funciona hoje para a Fluxrow:**
- AI Builder reduz tempo de criação do primeiro bot de dias para minutos
- Health monitoring da plataforma
- Feature flags para rollout gradual

**O que não funciona:**
- Onboarding self-service para clientes não-técnicos
- Templates prontos por setor
- Monitoramento de saúde do cliente (churn risk)

---

### 8. Automações — Workflow Automation

> Cobertura da criação e gestão de automações de processos internos e de vendas.

| Dimensão | Detalhe |
|----------|---------|
| **Capacidade Atual** | Runtime Engine executa flows 24/7. Builder Visual drag-drop para criação de workflows conversacionais. AI Block Engine com multi-provider LLM e structured outputs. Connector Hub: Webhook, Google Sheets, Slack, Telegram, Stripe, GA4. Variables e Forms no builder. |
| **Parcial** | Connector marketplace UI = arquitetura pronta, UI em desenvolvimento. Templates de automação = stub. |
| **GAP** | Sem A/B testing de flows (variante A vs variante B de script). Sem conector nativo Zapier ou Make (apenas webhook genérico — requer configuração técnica). Sem lógica de branching condicional avançada baseada em dados externos em tempo real. Sem agendamento de flows (executar automação às 09h toda segunda-feira). Sem versionamento de flows com rollback. Sem logs de execução detalhados por flow step. |
| **Impacto** | MEDIUM — Para o caso de uso core da Fluxrow (bot de vendas), o que existe é suficiente. A/B testing e Zapier são aceleradores, não bloqueadores. |
| **Prioridade** | P2 |
| **Esforço** | M (A/B testing infra; Zapier connector = parceria/SDK) |
| **Bloqueio para Lançamento?** | NÃO — Webhook cobre integrações externas no lançamento. A/B testing melhora performance mas não bloqueia operação. |

**O que funciona hoje para a Fluxrow:**
- Automação de qualificação e roteamento de leads
- Integrações via webhook com qualquer sistema externo
- Sheets para registro automático de leads qualificados
- Alertas Slack em tempo real

**O que não funciona:**
- Testes A/B de performance de scripts
- Integração Zapier/Make sem conhecimento técnico
- Agendamento temporal de automações

---

### 9. Conteúdo — Knowledge Base e Respostas com IA

> Cobertura da base de conhecimento que alimenta as respostas do bot e do agente.

| Dimensão | Detalhe |
|----------|---------|
| **Capacidade Atual** | Knowledge Base RAG com chunking, embedding e recuperação por similaridade coseno. AI Block Engine para geração de respostas contextualizadas. Multi-provider LLM (flexibilidade de modelo). Structured outputs para respostas formatadas. |
| **Parcial** | Persistência da Knowledge Base no Supabase = em desenvolvimento. Atualmente pode haver perda de dados entre sessões ou deploys. |
| **GAP** | Sem editor de Knowledge Base com UI amigável (WYSIWYG). Sem importação de documentos (PDF, DOCX, URL scraping). Sem versionamento de conteúdo da KB. Sem analytics de quais perguntas a KB não conseguiu responder (gaps de conteúdo). Sem suporte multi-idioma nos flows. |
| **Impacto** | HIGH no curto prazo por causa da persistência instável. |
| **Prioridade** | P1 |
| **Esforço** | M (estabilizar persistência Supabase; UI de upload de documentos) |
| **Bloqueio para Lançamento?** | NÃO tecnicamente, mas persistência instável da KB é risco operacional alto. Workaround: re-fazer upload de conteúdo se necessário. Deve ser resolvido antes de clientes em produção. |

**O que funciona hoje para a Fluxrow:**
- RAG funcional para responder perguntas com base em conteúdo carregado
- Respostas contextuais com LLM de alta qualidade
- Structured outputs para formatos consistentes

**O que não funciona:**
- Garantia de persistência dos dados da KB
- Upload fácil de documentos existentes
- Identificação de lacunas de conteúdo

---

### 10. Agendamento — Calendário e Scheduling

> Cobertura da marcação de reuniões, demos e calls de vendas diretamente pelo bot.

| Dimensão | Detalhe |
|----------|---------|
| **Capacidade Atual** | Nenhuma integração nativa de calendário. |
| **Parcial** | Connector Hub pode enviar webhook para sistemas externos de agendamento (Calendly, Cal.com), mas requer configuração técnica e não é uma experiência integrada. |
| **GAP** | Sem integração nativa com Google Calendar, Outlook Calendar, Calendly ou Cal.com. Sem lógica de disponibilidade em tempo real dentro do flow. Sem confirmação e lembrete automático de reunião. Sem link de agendamento personalizado gerado pelo bot. Sem sincronização de reuniões agendadas como atividade no CRM. |
| **Impacto** | HIGH — Para SDRs automatizados, agendar demos/calls é a ação de conversão principal. Sem agendamento nativo, o bot não fecha o ciclo. |
| **Prioridade** | **P0 — BLOQUEADOR DE LANÇAMENTO** |
| **Esforço** | M (integração Google Calendar API + Calendly API; UI de configuração no builder) |
| **Bloqueio para Lançamento?** | **SIM** — A conversão final do SDR bot é "agendar uma reunião". Sem essa capacidade nativa, o bot envia o lead para um link externo sem rastreamento, quebrando o loop de atribuição e a experiência do usuário. Workaround parcial: enviar link Calendly no chat, mas sem integração de dados. |

**O que funciona hoje para a Fluxrow:**
- Bot pode exibir link de Calendly como mensagem de texto
- Webhook pode notificar sistema externo sobre intenção de agendamento

**O que não funciona:**
- Verificação de disponibilidade em tempo real
- Confirmação automática integrada ao CRM
- Lembretes automáticos de reunião

---

### 11. Relatórios — Analytics e Reporting

> Cobertura de dashboards operacionais, relatórios de performance e insights de negócio.

| Dimensão | Detalhe |
|----------|---------|
| **Capacidade Atual** | Analytics básico: bots ativos, leads captados, conversas, conversões. Revenue Intelligence page com atribuição. Tracking Inspector em tempo real. Lead Intelligence por lead individual. System Health Panel para infraestrutura. |
| **Parcial** | Funil detalhado com série temporal = planejado, não em produção. Analytics de performance por flow/step = não confirmado. |
| **GAP** | Sem funil visual com drop-off por etapa e série temporal. Sem relatório comparativo de performance entre bots. Sem NPS/CSAT integrado. Sem relatório de atendimento (tempo de resposta, taxa de resolução). Sem exportação de relatórios (PDF, CSV). Sem alertas configuráveis (ex: "taxa de conversão caiu 20% hoje"). Sem relatório de ROI por cliente (para a Fluxrow apresentar para seus clientes). |
| **Impacto** | MEDIUM — Analytics básico cobre o necessário para operar; gap se torna crítico para retenção de clientes (eles querem ver ROI). |
| **Prioridade** | P1 |
| **Esforço** | M (funil temporal + exportação + NPS) |
| **Bloqueio para Lançamento?** | NÃO — Analytics básico é suficiente para o lançamento. Relatórios avançados são necessários para retenção e expansão. |

**O que funciona hoje para a Fluxrow:**
- Visão de volume (leads, conversas, conversões)
- Atribuição de receita por UTM
- Tracking em tempo real

**O que não funciona:**
- Comparação de performance entre períodos
- Funil visual com identificação de gargalos
- Relatório de ROI para apresentar ao cliente

---

## Bloqueadores Críticos para Lançamento (P0)

Estes três itens **impedem o lançamento comercial** da Fluxrow com sua proposta de valor central. Sem resolver os três, o produto pode ser demonstrado mas não vendido com confiança como solução completa.

---

### P0-1: WhatsApp Real (Meta Cloud API)

**Por que é P0:** O Brasil tem 147 milhões de usuários de WhatsApp. O mercado-alvo da Fluxrow (PMEs brasileiras) usa WhatsApp como canal principal de vendas e atendimento. Lançar sem WhatsApp é lançar um produto incompleto para o mercado brasileiro.

**O que está pronto:** Arquitetura do Channel Bus, UI de configuração, Runtime Engine preparado para multi-canal, Compliance LGPD para opt-in.

**O que falta:** Integração com Meta Cloud API (ou BSP parceiro), número de WhatsApp Business aprovado, suporte a templates HSM, webhook bidirecional de mensagens.

**Esforço estimado:** L — 3 a 6 semanas de desenvolvimento + processo de aprovação Meta (pode levar 1-4 semanas adicionais).

---

### P0-2: Follow-up Automatizado (Drip Sequences)

**Por que é P0:** A proposta de valor da Fluxrow é "nunca perder um lead por falta de follow-up". Sem sequências automatizadas, a plataforma captura leads mas não os nutre. O time humano precisaria fazer follow-up manual — eliminando o diferencial de automação.

**O que está pronto:** Lead scoring identifica quem precisa de atenção. Connector Hub pode disparar webhooks como ponto de saída.

**O que falta:** Motor de trigger temporal, sequências de mensagens configuráveis, gestão de opt-out por sequência, templates de nurturing.

**Esforço estimado:** M — 2 a 4 semanas de desenvolvimento.

---

### P0-3: Agendamento Integrado (Calendar/Scheduling)

**Por que é P0:** Para SDRs B2B, a conversão principal é "agendar uma demo/call". Para B2C, é "marcar uma consulta/visita". Sem agendamento nativo, o bot não completa o ciclo de vendas — envia o lead para um link externo quebrando o rastreamento e a experiência.

**O que está pronto:** Bot pode enviar texto com link externo. Webhook pode notificar sistema externo.

**O que falta:** Integração Google Calendar API e/ou Calendly/Cal.com, verificação de disponibilidade em tempo real, confirmação automática, registro da reunião no CRM.

**Esforço estimado:** M — 2 a 3 semanas de desenvolvimento.

---

## O Que Funciona para as Operações da Fluxrow Hoje

A Fluxrow pode operar **parcialmente** com o produto atual para os seguintes casos de uso:

### Funcionando em Produção

| Operação | Como funciona hoje |
|----------|-------------------|
| Criar e publicar bots de qualificação | AI Builder: 1 prompt → bot publicado em minutos |
| Capturar leads via web widget | Runtime Engine + CRM Bridge auto-captura |
| Qualificar leads com IA | AI Block Engine + Lead Intelligence score |
| Rastrear origem dos leads (UTMs) | Tracking Engine + Revenue Attribution loop |
| Enviar alertas para o time de vendas | Connector Slack em tempo real |
| Registrar leads em planilha | Connector Google Sheets |
| Atribuir receita a campanhas | Revenue Intelligence + Meta CAPI + GA4 |
| Gerenciar pipeline de vendas | CRM kanban com tags e scoring |
| Responder perguntas com base de conhecimento | Knowledge Base RAG + AI Block |
| Monitorar saúde da plataforma | System Health Panel + Beta Program |
| Garantir conformidade LGPD | Compliance Layer + Consent + Audit Logs |

### Operações que Requerem Contorno Manual ou Ferramenta Externa

| Operação | Contorno atual | Custo/Esforço do contorno |
|----------|---------------|--------------------------|
| Follow-up automatizado | Zapier/Make + webhook de saída | Alto — requer configuração técnica + custo de ferramenta |
| WhatsApp | Web widget como substituto (inferior) | Alto — perda significativa de alcance no mercado BR |
| Agendamento de reuniões | Link Calendly enviado manualmente no chat | Médio — quebra o loop de atribuição |
| Importação de base de leads | Script manual via API | Alto — não self-service |
| Relatório de ROI para clientes | Exportar dados manualmente e montar em planilha | Alto — não escala |
| Nurturing de leads frios | Time humano faz follow-up manual | Inviável em escala |

---

## Recomendações de Sequência de Desenvolvimento

Com base na análise, a sequência recomendada para viabilizar o lançamento comercial completo é:

1. **(Semanas 1-2)** Estabilizar persistência da Knowledge Base no Supabase — risco operacional ativo.
2. **(Semanas 1-4)** Iniciar processo de aprovação Meta para WhatsApp Business API (aprovação pode ser o gargalo mais longo).
3. **(Semanas 2-4)** Desenvolver motor de follow-up automatizado com triggers temporais.
4. **(Semanas 3-5)** Integrar Google Calendar e/ou Calendly para agendamento nativo no flow.
5. **(Semanas 4-6)** Conectar WhatsApp real ao Channel Bus após aprovação Meta.
6. **(Semanas 5-8)** Templates por vertical (e-commerce, SaaS, clínicas) para acelerar onboarding.
7. **(Pós-lançamento)** A/B testing, relatórios avançados, NPS/CSAT, módulo de CS.

---

*Documento gerado para uso interno da equipe de produto e operações da Fluxrow. Não deve ser compartilhado externamente.*
