# 30-Day Execution Plan
## FASE R1.1 · Plano de Execução Real — Junho 2026

> Este documento é derivado de leitura direta de código, não de aspiração de produto.
> Fontes: REALITY-CHECK-AUDIT.md · VEMFARIAS-OPERATION.md · FLUXROW-GAP-ANALYSIS.md · AI-BUILDER-REALITY.md
>
> Regra de ouro: **nenhuma tarefa neste plano existe para impressionar. Existe para desbloquear.**

---

## Diagnóstico de partida

O produto hoje é um formulário inteligente com CRM — não um funil automatizado de vendas. Tem arquitetura sólida, mas roda em modo demo por padrão. Os bloqueadores não são complexidade técnica — são ausência de configuração e de três features críticas.

**O que paralisa tudo:**

| Bloqueador | Impacto | Esforço para remover |
|---|---|---|
| `VITE_USE_SUPABASE` não setado | Todos os dados somem no reload | **XS — 1 hora** |
| Todos os providers de IA são mock | Bot responde strings hardcoded | **XS — 4–6h** (criar um arquivo, swap de uma linha) |
| Instagram DM não existe | Fluxo principal do @vemfarias impossível | **L — 3–6 semanas + aprovação Meta** |
| Follow-up módulo não existe | Leads esfriados sem ação manual | **M — 2–4 semanas** |
| Calendário não existe | Bot não fecha o ciclo de agendamento | **M — 2–3 semanas** |

---

## Critérios de Classificação

| Nível | Critério |
|---|---|
| **P0** | Sem isso, nada funciona ou nada pode ser vendido com confiança |
| **P1** | Sem isso, a operação funciona mas é manual ou incompleta |
| **P2** | Melhora a qualidade do produto mas não bloqueia nenhuma operação |

---

## Semana 1 — Acender o Motor (D1–D7)

**Objetivo:** fazer o produto funcionar de verdade, não em modo demo. Zero feature nova. Zero canal novo. Só ligar o que já existe.

---

### P0-S1-A — Ativar Supabase em produção

**O que está bloqueado:** toda a persistência. Leads somem. Bots somem. Sessões somem.

**O que fazer:**
1. Criar projeto no Supabase (ou usar o existente se já configurado)
2. Rodar as migrations existentes em `supabase/migrations/`
3. Setar `VITE_USE_SUPABASE=true` no `.env` de produção
4. Setar `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`
5. Criar um workspace e conta de teste
6. Publicar um bot e confirmar que o lead persiste após reload

**Critério de conclusão:** lead criado via bot ainda existe 24h depois. CRM mostra dados reais.

**Esforço:** 2–4 horas.  
**Responsável:** dev ou founder técnico.  
**Dependência:** acesso ao Supabase project.

---

### P0-S1-B — Conectar provider de IA real (OpenAI)

**O que está bloqueado:** toda qualificação conversacional livre. O bot responde `"Resposta gerada (mock)"`.

**O que fazer:**
1. Criar `src/ai/providers/openai.ts` implementando a interface `AIProvider`
   - `generate()` → `POST api.openai.com/v1/chat/completions`
   - `extract()` → mesmo endpoint com `response_format: json_object` + prompt instrução
   - `classify()` → same endpoint, forçar output a um dos labels via system prompt
2. Atualizar `src/ai/registry.ts`: trocar `buildMockProvider({id: "openai",...})` por instância real
3. Adicionar `VITE_OPENAI_API_KEY` ao `.env`
4. Testar no PreviewPanel: enviar mensagem a um AI Block e confirmar resposta real

**Critério de conclusão:** AI Block em um bot responde com conteúdo real contextualizado ao prompt, não string hardcoded.

**Esforço:** 4–6 horas.  
**Dependência:** chave OpenAI com crédito ativo.

**Nota de segurança:** `VITE_` expõe a chave no bundle de cliente. Para demo interno e fase beta é aceitável. Para produção com usuários externos, mover para edge function antes do lançamento público.

---

### P1-S1-C — Conectar Revenue e Attribution a dados reais

**O que está bloqueado:** páginas Revenue e Attribution mostram `R$184.2k` e `ROAS 4.8x` hardcoded. Qualquer demo para cliente potencial que abrir essas páginas vê dados falsos.

**O que fazer:**
1. Localizar `src/pages/Revenue.tsx` e `src/pages/Attribution.tsx`
2. Remover `import { revenueSeries, aiCosts, aiInsights } from "@/lib/analytics-mock"`
3. Substituir pelo motor de atribuição real em `src/intelligence/attribution.ts` — as funções `buildAttributionRow()` e `summarizeAttribution()` já existem
4. Para leads com `utm_source` registrado: pipeline UTM → lead → valor do deal já existe
5. Adicionar estado vazio com mensagem honesta: "Nenhum dado de receita ainda. Conecte seu primeiro bot e converta leads para ver atribuição real."

**Critério de conclusão:** página Revenue mostra zero (ou dados reais de teste) — não `R$184.2k` fictício.

**Esforço:** 4–8 horas.

---

### P1-S1-D — Desconectar Conversations de lib/mock

**O que está bloqueado:** página de Conversations (`src/pages/Conversations.tsx`) importa conversas hardcoded de `src/lib/mock`. Qualquer conversa real via Web Widget não aparece na inbox.

**O que fazer:**
1. Remover `import { conversations, sampleChat } from "@/lib/mock"`
2. Conectar ao channel bus real — sessions do Web Widget já geram eventos
3. Com `VITE_USE_SUPABASE=true`, sessões são persistidas; inbox pode listar sessões reais
4. Adicionar estado vazio honesto enquanto não há conversas

**Critério de conclusão:** conversa feita via bot publicado aparece na inbox. Não mais dados mock.

**Esforço:** 4–6 horas.

---

### Checkpoint Semana 1

Ao final da semana 1, o produto deve:
- [ ] Persistir dados reais (Supabase ativo)
- [ ] Responder com IA real em AI Blocks (OpenAI conectado)
- [ ] Mostrar receita/atribuição real (ou zero, não dados falsos)
- [ ] Mostrar conversas reais na inbox

**Este é o mínimo para mostrar o produto a qualquer pessoa sem mentir.**

---

## Semana 2 — Desbloquear @vemfarias (D8–D14)

**Objetivo:** fazer a operação mínima do @vemfarias funcionar. Não o fluxo ideal — o fluxo possível. Um criador de conteúdo deve conseguir usar o produto para capturar, qualificar e registrar leads de mentoria sem tocar em código.

---

### P0-S2-A — Criar bot de qualificação de mentoria

**O que fazer:**
1. Usar o AI Builder para gerar um bot a partir do prompt:
   > "Quero qualificar interessados em mentoria de negócios. O bot deve descobrir: objetivo, situação atual, principal obstáculo, disponibilidade de investimento e email de contato."
2. Ajustar o flow gerado no Builder Visual
3. Adicionar Knowledge Base com informações do programa de mentoria
4. Publicar o bot com slug personalizado (`/bot/vemfarias`)
5. Testar o flow completo: visitar o bot, responder, confirmar lead no CRM

**Critério de conclusão:** lead qualificado com score calculado aparece no CRM após conversa no bot.

**Esforço:** 2–4 horas (não é desenvolvimento — é uso do produto).

---

### P0-S2-B — Configurar tracking de campanha

**O que fazer:**
1. Criar links de entrada com UTM: `?utm_source=instagram&utm_medium=bio&utm_campaign=mentoria-junho`
2. Confirmar que o Tracking Engine captura os parâmetros em `localStorage`
3. Confirmar que o lead criado carrega o `utm_source` no CRM
4. Testar com um lead real: abrir link com UTM → conversar → ver origem no CRM

**Critério de conclusão:** lead no CRM mostra "Origem: Instagram / Campanha: mentoria-junho".

**Esforço:** 1–2 horas.

---

### P1-S2-C — Workaround de agendamento (Calendly link no bot)

**O que fazer:**
1. No último bloco do bot de qualificação, adicionar bloco de mensagem:
   > "Perfeito! Para agendar sua sessão gratuita de 30 min, acesse: [link Calendly]"
2. Garantir que o link abre em nova aba
3. Adicionar captura de preferência de horário como variável no flow (fallback manual)

**Critério de conclusão:** bot envia link de agendamento ao final da qualificação.

**Esforço:** 30 minutos.

---

### P1-S2-D — Workaround de follow-up (webhook → ferramenta externa)

**O que fazer:**
1. Configurar um webhook no Connector Hub para disparar quando lead é criado
2. Conectar o webhook ao Zapier ou Make
3. No Zapier: criar sequência de e-mail em 3 passos: D+1, D+3, D+7 com mensagens diferentes
4. Testar: criar lead → confirmar e-mail de follow-up enviado em D+1

**Critério de conclusão:** lead criado no bot recebe e-mail de follow-up automaticamente sem ação manual.

**Esforço:** 3–5 horas (Zapier/Make + configuração de sequência). Custo externo: ~$20–50/mês dependendo do volume.

---

### Checkpoint Semana 2

Ao final da semana 2, o @vemfarias deve conseguir:
- [ ] Colocar o link do bot no bio do Instagram
- [ ] Receber interessados via bot e qualificá-los automaticamente
- [ ] Ver todos os leads no CRM com score e origem
- [ ] Ter um link de agendamento funcionando
- [ ] Ter follow-up básico por e-mail ativo (via Zapier)

**Este é o mínimo viável para um beta real com criadores de conteúdo.**

---

## Semana 3 — Desbloquear Cliente Beta (D15–D21)

**Objetivo:** o produto deve ser capaz de receber o primeiro cliente beta pagante. Não precisa ser perfeito. Precisa ser honesto e funcional o suficiente para entregar valor documentado.

---

### P0-S3-A — Iniciar processo de aprovação Meta para WhatsApp Business API

**Contexto:** a aprovação da Meta pode levar de 1 a 4 semanas. É o gargalo mais longo do roadmap. Precisa começar agora mesmo que o desenvolvimento ainda não comece.

**O que fazer:**
1. Criar conta no Meta Business Manager (se não existir)
2. Registrar um número de WhatsApp Business
3. Criar App na Meta Developer Platform com permissão `whatsapp_business_messaging`
4. Submeter para aprovação
5. Iniciar desenvolvimento do adapter em paralelo (não esperar a aprovação para começar o código)

**Critério de conclusão desta semana:** processo de aprovação submetido. Número registrado.

**Esforço:** 4–8 horas de configuração burocrática. Sem desenvolvimento ainda.

---

### P1-S3-B — Templates verticais no AI Builder

**O que fazer:**
1. Criar 3 templates prontos de bot, hardcoded no AI Builder (não precisa de marketplace ainda):
   - **Mentoria/Coaching:** qualifica objetivo, situação atual, investimento, agenda sessão
   - **Clínica/Saúde:** qualifica tipo de consulta, plano de saúde, urgência, agenda consulta
   - **Imobiliária:** qualifica tipo de imóvel, bairro, orçamento, agenda visita
2. Exibir esses templates como opção na tela inicial do AI Builder ("ou escolha um template")
3. Usuário seleciona template → bot é gerado com flow pré-configurado

**Critério de conclusão:** cliente beta consegue criar bot relevante para seu setor em menos de 5 minutos sem digitar prompt.

**Esforço:** 8–12 horas.

---

### P1-S3-C — Onboarding mínimo guiado

**O que fazer:**
1. Criar checklist de 5 passos que aparece na primeira vez que o usuário loga:
   - [ ] Criar seu primeiro bot
   - [ ] Publicar o bot
   - [ ] Fazer uma conversa de teste
   - [ ] Ver o lead no CRM
   - [ ] Configurar uma integração (Slack ou Sheets)
2. Marcar cada passo como concluído automaticamente quando a ação acontecer
3. Mostrar barra de progresso no header

**Critério de conclusão:** cliente beta não precisa de onboarding humano para as primeiras ações básicas.

**Esforço:** 6–10 horas.

---

### P1-S3-D — Estabilizar Knowledge Base no Supabase

**Contexto (de FLUXROW-GAP-ANALYSIS.md):** KB tem risco de perda de dados entre sessões ou deploys.

**O que fazer:**
1. Confirmar que embeddings e chunks são persistidos em tabela Supabase (não em memória)
2. Testar: carregar documento, reiniciar servidor, confirmar que KB ainda funciona
3. Testar: fazer deploy, confirmar que KB sobrevive

**Critério de conclusão:** Knowledge Base não perde dados entre deploys.

**Esforço:** 4–8 horas.

---

### Checkpoint Semana 3

Ao final da semana 3:
- [ ] Processo Meta/WhatsApp em andamento (submetido)
- [ ] Templates verticais disponíveis no AI Builder
- [ ] Onboarding guiado funcional
- [ ] Knowledge Base persistente e estável

**Neste ponto o produto pode receber o primeiro cliente beta com suporte humano.**

---

## Semana 4 — Desbloquear Venda Recorrente (D22–D30)

**Objetivo:** construir as bases para um cliente pagar mensalmente e sentir que está recebendo valor crescente. Isso exige que o produto mostre ROI de forma clara e que o ciclo de vendas do próprio produto seja automatizado.

---

### P0-S4-A — Desenvolver motor de follow-up nativo (início)

**Contexto:** o workaround Zapier da semana 2 funciona, mas cria dependência externa, custo adicional e quebra o loop de atribuição. O follow-up nativo precisa começar.

**O que fazer nesta semana (não entrega completa — inicia o módulo):**
1. Definir o schema do `FollowUpSequence`:
   - `id`, `name`, `triggerEvent` (lead_created, lead_not_responded, stage_changed)
   - `steps[]`: `{ delayHours, channelId, templateText, conditions }`
2. Criar a tabela Supabase para sequências e execuções
3. Criar o trigger engine básico: cron job (ou Supabase Edge Function com pg_cron) que avalia quais leads precisam de follow-up
4. Criar o primeiro step: "se lead não respondeu em 24h, enviar mensagem de follow-up via Web Widget"

**Critério de conclusão desta semana:** primeiro step do follow-up funciona para Web Widget. Lead sem resposta em 24h recebe mensagem automática.

**Esforço:** 12–16 horas.

---

### P0-S4-B — Dashboard de ROI do cliente

**Contexto:** cliente paga mensalmente porque vê ROI crescente. Sem painel que mostre "você gastou X em anúncios, gerou Y leads, converteu Z, receita atribuída = W", o cliente não tem argumento para renovar.

**O que fazer:**
1. Criar painel de ROI na página Analytics com:
   - Leads gerados no período (real, com Supabase ativo)
   - Taxa de conversão (leads → deals fechados)
   - Receita atribuída ao bot (via UTM tracking)
   - Custo por lead (se conectado a dados de anúncio via CAPI)
2. Período selecionável: últimos 7d / 30d / 90d
3. Exportação básica em CSV

**Critério de conclusão:** cliente consegue mostrar para o próprio chefe/sócio que o bot gerou leads e conversões com número real.

**Esforço:** 8–12 horas.

---

### P1-S4-C — Início do desenvolvimento WhatsApp adapter

**Contexto:** aprovação Meta foi submetida na semana 3. Enquanto aguarda, o desenvolvimento pode começar.

**O que fazer:**
1. Criar `src/channels/whatsapp.ts` implementando a interface `Channel` do Channel Bus
2. Configurar webhook handler para receber mensagens da Meta Cloud API
3. Implementar `send()` via Meta Graph API (`POST /messages`)
4. Implementar `receive()` para inbound messages
5. Testar com número sandbox da Meta (disponível antes da aprovação final)

**Critério de conclusão desta semana:** bot responde mensagem de texto enviada pelo WhatsApp sandbox da Meta.

**Esforço:** 16–20 horas.

---

### P1-S4-D — Relatório de performance comparativo de bots

**O que fazer:**
1. Na página Analytics, adicionar seção "Performance por bot":
   - Tabela com cada bot: conversas iniciadas, completadas, taxa de conclusão, leads gerados
2. Destacar o bot com melhor e pior performance
3. Adicionar link "editar" para o bot direto da tabela

**Critério de conclusão:** cliente consegue identificar qual bot está convertendo melhor sem exportar dados manualmente.

**Esforço:** 4–6 horas.

---

### Checkpoint Semana 4

Ao final da semana 4:
- [ ] Follow-up nativo iniciado (Web Widget, step básico)
- [ ] Painel de ROI real disponível (não analytics-mock)
- [ ] WhatsApp adapter em desenvolvimento (sandbox funcionando)
- [ ] Relatório comparativo de bots disponível

**Neste ponto o produto tem as bases para retenção e venda recorrente.**

---

## Visão Consolidada — 30 Dias

```
SEMANA 1 — ACENDER O MOTOR
  P0  Supabase ativo — persistência real
  P0  OpenAI conectado — IA real
  P1  Revenue/Attribution sem dados mock
  P1  Conversations sem lib/mock

SEMANA 2 — DESBLOQUEAR @VEMFARIAS
  P0  Bot de mentoria criado e publicado
  P0  Tracking UTM funcionando
  P1  Workaround agendamento (Calendly)
  P1  Workaround follow-up (Zapier → email)

SEMANA 3 — DESBLOQUEAR CLIENTE BETA
  P0  Processo Meta/WhatsApp submetido
  P1  Templates verticais no AI Builder
  P1  Onboarding guiado mínimo
  P1  Knowledge Base estável no Supabase

SEMANA 4 — DESBLOQUEAR VENDA RECORRENTE
  P0  Follow-up nativo — engine básico
  P0  Dashboard ROI real para cliente
  P1  WhatsApp adapter em desenvolvimento
  P1  Relatório comparativo de bots
```

---

## O que pode esperar (P2 — fora dos 30 dias)

| Item | Por que pode esperar |
|---|---|
| Instagram DM real | Depende de aprovação Meta + desenvolvimento L. WhatsApp resolve o maior volume primeiro. |
| Anthropic como provider | OpenAI já resolve. Anthropic é diversificação, não desbloqueador. |
| A/B testing de flows | Melhora performance mas não bloqueia nenhum cliente de usar o produto. |
| White label | Arquitetura existe. Feature depende de ter múltiplos clientes para justificar. |
| Billing / planos | Necessário para escala, mas não para beta com contratos manuais. |
| NPS/CSAT integrado | Importante para retenção, mas não para os primeiros 30 dias. |
| Zapier/Make nativo | Webhook resolve. Integração nativa é polimento, não desbloqueador. |
| Campos customizados ilimitados no CRM | Schema atual cobre todos os casos de uso dos primeiros betas. |
| Exportação de relatórios PDF | CSV resolve no curto prazo. |
| Previsão de churn | Necessário com base instalada. Sem base, não há o que prever. |

---

## Risco principal do plano

**O WhatsApp é o canal que o mercado brasileiro espera.** O plano tem WhatsApp iniciando na semana 3 (submissão de aprovação) e desenvolvendo na semana 4 (adapter). A aprovação da Meta pode levar de 1 a 4 semanas após a submissão. Isso significa que WhatsApp real provavelmente não estará disponível até a semana 5–8.

Nesse intervalo, o produto opera com Web Widget como canal principal. Para betas que aceitam isso, não é bloqueador. Para betas que exigem WhatsApp, é preciso ser honesto sobre o prazo.

**Não prometer WhatsApp como disponível hoje. O processo leva tempo.**

---

## Métricas de sucesso dos 30 dias

| Métrica | Meta |
|---|---|
| Produto rodando sem dados mock | 100% das páginas |
| Bots publicados com leads reais | Mínimo 3 (vemfarias + 2 betas) |
| Leads gerados por esses bots | Mínimo 50 |
| Conversas com IA real (não mock) | 100% das interações |
| Processo WhatsApp submetido | Sim/Não |
| Primeiro cliente beta ativo | Mínimo 1 |
| Follow-up nativo funcionando | Mínimo para Web Widget |

---

*Criado em: 2026-06-04*  
*Baseado em: REALITY-CHECK-AUDIT.md · VEMFARIAS-OPERATION.md · FLUXROW-GAP-ANALYSIS.md · AI-BUILDER-REALITY.md*  
*Sem roadmap aspiracional. Só desbloqueadores reais.*

---

**Ver também:**
- `docs/MASTER-ROADMAP.md` — visão consolidada com todas as sprints, dependências e critérios
- `docs/OPENAI-IMPLEMENTATION-PLAN.md` — plano técnico detalhado para a tarefa P0-S1-B (OpenAI)
