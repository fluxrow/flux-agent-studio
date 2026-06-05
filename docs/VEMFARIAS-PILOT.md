# @VEMFARIAS PILOT
**FASE 27C.1 — Criado em 2026-06-05**

> Operação real do perfil @vemfarias dentro do Flux Agent Studio.
> Sem funcionalidades novas. Apenas o que existe hoje.
> Baseado em leitura direta do código-fonte.

---

## O que @vemfarias precisa

```
Reel/Anúncio → Pessoa interessada → DM/conversa → Qualificação → Score → CRM → Agendamento → Fechamento
```

O produto entrega **4 das 7 etapas** hoje — com configuração, não com desenvolvimento.

---

## 1. Entrada de lead

### A. Bot Web (`/bot/vemfarias`) — **FUNCIONA HOJE**

**Como funciona:**
- Rota `/bot/:slug` renderizada por `src/pages/PublicBot.tsx`
- Carrega o flow do bot publicado via `loadPublicBot(slug)`
- Executa `src/runtime/engine.ts` — conversação real, não mock
- Captura UTM: `?utm_source=instagram&utm_campaign=mentoria-abril` → gravado em localStorage via `src/tracking/visitor.ts`
- Ao finalizar: `crm-bridge.ts` cria lead automaticamente com variáveis `lead.*`

**O que o @vemfarias precisa fazer:**
1. Criar o bot no AI Builder (ver Seção 2)
2. Publicar com slug `vemfarias` → URL: `https://<projeto>.supabase.co/bot/vemfarias` (ou domínio customizado)
3. Colocar o link no bio do Instagram (`linkinbio` ou direto)
4. Nos anúncios: destino = o link do bot com UTM

**Vantagem imediata:** todo lead que entrar tem score calculado automaticamente, nome/email/WhatsApp capturado, e UTM da campanha de origem registrado. Zero trabalho manual.

---

### B. Instagram DM — **NÃO FUNCIONA (stub)**

`src/channels/stubs.ts` → `makeStub("instagram", "Instagram DM")`

Não há chamada real à Meta Graph API. O canal emite eventos internos mas não recebe nem envia mensagens reais.

**Workaround disponível hoje:** o CTA dos Reels e stories pode ser "Link na bio" em vez de "Enviar mensagem". O lead clica, vai para o bot web, qualifica lá.

**Quando vai funcionar:** após deploy das Edge Functions Meta (FASE 27A.7 — pendente de execução manual).

---

### C. ManyChat — **PARCIAL via webhook**

Se @vemfarias já tem fluxo ManyChat ativo com audiência, é possível capturar o lead sem migrar:

1. No ManyChat: adicionar "External Request" no final do fluxo existente
2. URL do webhook: `https://<projeto>.supabase.co/functions/v1/public-ingest` (ou criar endpoint simples)
3. Payload: `{ name, phone, email, source: "manychat" }`
4. Lead entra no CRM Flux via API

**Limitação:** requer criação de um endpoint receptor simples (Edge Function de ~20 linhas). Não existe hoje.

---

### D. WhatsApp — **NÃO FUNCIONA (precisa de deploy)**

Código implementado (FASE 27A.4). Deployment pendente — ver `docs/META-PHYSICAL-SMOKE-TEST-REPORT.md`.

Após deploy: anúncio Click-to-WhatsApp → mensagem abre no número cadastrado → lead entra no CRM automaticamente via `useMetaLeadBridge`.

---

## 2. Qualificação

### Bot de qualificação recomendado para @vemfarias

**Criar no AI Builder com estas perguntas em sequência:**

```
[Bloco 1 — Abertura]
"Oi! Sou o assistente do @vemfarias 👋
Antes de te passar mais informações sobre a mentoria,
me deixa entender um pouco mais sobre você.
Pode ser?"

[Bloco 2 — Desafio atual]
Pergunta: "Qual seu maior desafio profissional hoje?"
Tipo: Texto livre
Variável: lead.challenge

[Bloco 3 — Contexto]
Pergunta: "Você está empregado, é autônomo ou empreende?"
Tipo: Botões (3 opções)
Opções: ["Empregado", "Autônomo/Freelancer", "Empreendedor"]
Variável: lead.situation

[Bloco 4 — Tentativas anteriores]
Pergunta: "Você já tentou resolver isso de alguma forma?
(cursos, consultorias, leituras, etc.)"
Tipo: Texto livre
Variável: lead.previous_attempts

[Bloco 5 — Investimento]
Pergunta: "Qual seu nível de investimento disponível
para uma mentoria transformadora?"
Tipo: Botões (4 opções)
Opções: ["Até R$1k", "R$1k–R$3k", "R$3k–R$8k", "R$8k+"]
Variável: lead.investment_range

[Bloco 6 — Captura de dados]
Pergunta: "Perfeito. Me passa seu nome completo:"
Tipo: Input
Variável: lead.name  ← MAPEADO no CRM Bridge

"E seu WhatsApp para eu te enviar mais informações:"
Tipo: Input (tel)
Variável: lead.phone  ← MAPEADO no CRM Bridge

"Seu melhor e-mail:"
Tipo: Input (email)
Variável: lead.email  ← MAPEADO no CRM Bridge

[Bloco 7 — CTA de agendamento]
"Incrível, [lead.name]! Com base no que você me contou,
acho que a mentoria pode ser exatamente o que você precisa.

Quer agendar uma sessão gratuita de 30 minutos
para conhecer o programa?"

Botões:
✅ "Sim, quero agendar" → link Calendly
📅 "Prefiro receber mais informações primeiro" → coleta lead.email se ainda não tem
```

### Variáveis mapeadas automaticamente para o CRM

| Variável no bot | Campo no Lead | Efeito |
|----------------|--------------|--------|
| `lead.name` | `name` | Nome do lead no CRM |
| `lead.email` | `email` | Email do lead |
| `lead.phone` | `phone` | Telefone |
| `lead.source` | `source` | Origem (ex: "meta-ads") |
| `lead.tags` | `tags` | Tags no pipeline |
| `lead.score` | `score` | Score customizado (sobrescreve calculado) |

**Nota:** `lead.challenge`, `lead.situation`, `lead.investment_range` não são mapeados automaticamente para campos do Lead. Ficam em variáveis de sessão — visíveis no Session Inspector mas não no card do CRM sem implementação adicional.

**Workaround:** adicionar `lead.notes` com concatenação:
```
lead.notes = "Desafio: {{lead.challenge}} | Situação: {{lead.situation}} | Investimento: {{lead.investment_range}}"
```

---

### Score automático calculado (`src/intelligence/scorer.ts`)

O score é calculado com 7 fatores e pesos:

| Fator | Peso | Como impacta o @vemfarias |
|-------|------|--------------------------|
| `completeness` (0.15) | 15% | Nome + email + telefone preenchidos = 100 pts neste fator |
| `source` (0.15) | 15% | `meta-ads` = 80 pts · `instagram` = 70 pts · `public-bot` = 60 pts |
| `campaign` (0.10) | 10% | UTM campaign presente = score maior |
| `interaction` (0.20) | 20% | Mais turnos de conversa = score maior (20% do total) |
| `answers` (0.15) | 15% | Perguntas respondidas ÷ total de perguntas |
| `ai_classification` (0.15) | 15% | Mock hoje (sempre 50%) — subirá com OpenAI real |
| `recency` (0.10) | 10% | Leads recentes = score maior |

**Score esperado para lead qualificado @vemfarias:**
- Veio de anúncio + respondeu todas as perguntas + informou nome+email+WhatsApp:
- `completeness` = 100 → 15 pts
- `source` (meta-ads) = 80 → 12 pts
- `campaign` (UTM presente) = ~65 → 6.5 pts
- `interaction` (7 turnos) = ~70 → 14 pts
- `answers` (5/5) = 100 → 15 pts
- `ai_classification` = 50 (mock) → 7.5 pts
- `recency` = 100 (hoje) → 10 pts
- **Total estimado: ~80 pontos → Temperatura: QUENTE**

Temperatura: `score >= 75` → 🔥 Quente · `score >= 45` → Morno · abaixo → Frio

---

## 3. CRM

### Pipeline recomendado para @vemfarias

| Estágio | Critério de entrada | Ação manual |
|--------|-------------------|------------|
| `novo` | Lead criado automaticamente pelo bot | — |
| `qualificado` | Score > 65 + WhatsApp informado | Mover manualmente ou criar automação via webhook |
| `negociacao` | Lead abriu o Calendly ou pediu mais info | Mover após contato |
| `convertido` | Pagamento confirmado | Mover + registrar valor |
| `perdido` | Sem resposta após 7 dias + follow-up tentado | Mover |

### Tags recomendadas

Configurar no bot via `lead.tags`:

```
- "mentoria-beta"           (todos os leads do piloto)
- "investimento-alto"       (quem selecionou R$3k–8k ou R$8k+)
- "investimento-médio"      (R$1k–3k)
- "agendou-sessão"          (clicou no link Calendly)
- "fonte-anuncio"           (veio de meta-ads)
- "fonte-bio"               (veio de link de bio orgânico)
```

### O que funciona no CRM hoje

- ✅ Kanban visual com drag-and-drop entre estágios
- ✅ Card do lead com score + temperatura + dados coletados
- ✅ `LeadIntelligencePanel`: score, temperatura, próxima ação recomendada, forecast
- ✅ UTM de origem visível no card
- ✅ Criação automática ao terminar conversa (com Supabase ativo)
- ❌ Transição automática de estágios — manual por enquanto
- ❌ Notificação quando lead quente entra — não implementado

---

## 4. Agendamento

### Workaround atual (funcional hoje)

**Opção A — Link Calendly no bot (recomendado):**
1. Criar conta gratuita em calendly.com
2. Configurar "Sessão Gratuita 30 min" com disponibilidade
3. No último bloco do bot, botão "Agendar" → link do Calendly
4. Calendly envia confirmação por e-mail automaticamente
5. @vemfarias recebe notificação no e-mail do Calendly

**Limitação:** o agendamento não entra automaticamente no CRM. O @vemfarias precisa mover o lead para "Em Negociação" manualmente após ver o agendamento confirmado no Calendly.

**Opção B — Pergunta estruturada no bot:**
```
"Qual seu dia preferido para uma conversa de 30 min?"
Botões: ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"]
Variável: lead.pref_day

"Qual período funciona melhor?"
Botões: ["Manhã (9h–12h)", "Tarde (14h–17h)", "Noite (19h–21h)"]
Variável: lead.pref_time
```
→ @vemfarias vê a preferência no CRM e confirma o horário por WhatsApp manualmente.

**Vantagem da Opção B:** o dado fica no CRM sem dependência externa. Desvantagem: mais trabalho manual para confirmar e enviar o link do Meet.

### Google Calendar — não implementado

`src/connectors/types.ts` lista `"calendar"` como tipo futuro. Nenhum adapter existe. Prazo: roadmap Sprint 4 estimado.

---

## 5. Conversão e acompanhamento

### Reunião/Sessão gratuita

**Ferramentas externas ao Flux (zero integração necessária):**
- Google Meet / Zoom: criar link e enviar por WhatsApp manual ou via bot
- Notion: usar para registrar notas da sessão
- WhatsApp pessoal: para confirmação do horário

**O que o Flux faz nessa etapa:**
- ✅ Exibir o histórico da conversa de qualificação (para @vemfarias se preparar)
- ✅ Mostrar score e fatores (qual pergunta o lead não respondeu, temperatura)
- ✅ Notas internas no lead card

### Fechamento

**Ação manual no CRM:**
1. Lead aceita a proposta → mover para `convertido`
2. Registrar valor da mentoria no campo `notas` (campo de receita real = roadmap)
3. Tag: `"mentoria-confirmada"`

**Webhook pós-venda (opcional):**
Configurar connector Webhook para disparar ao mover lead para `convertido`:
→ Zapier recebe → envia e-mail de boas-vindas → adiciona em lista de e-mail

### Acompanhamento

**Hoje (manual):**
- @vemfarias abre o CRM diariamente
- Filtra por `temperatura: quente` + `stage: novo`
- Envia WhatsApp manual para os 3–5 leads mais quentes do dia

**Automação possível via Connector Webhook:**
- Evento: lead criado com score > 70
- Webhook → Zapier → SMS/WhatsApp via Twilio ou ActiveCampaign

**Follow-up automático no produto:** não implementado. Está no roadmap Sprint 3–4.

---

## O que já funciona hoje (sem nenhum desenvolvimento)

| Funcionalidade | Status | Condição |
|---------------|--------|---------|
| Bot web conversacional | ✅ Funciona | Bot criado no builder e publicado |
| Captura de UTM | ✅ Funciona | UTM na URL do link de bio |
| Criação automática de lead | ✅ Funciona | Supabase ativo + variáveis `lead.*` no bot |
| Score automático 0–100 | ✅ Funciona | Calculado no momento da criação do lead |
| Temperatura (quente/morno/frio) | ✅ Funciona | Derivada do score |
| Pipeline Kanban | ✅ Funciona | Stages: novo → qualificado → negociação → convertido |
| LeadIntelligencePanel | ✅ Funciona | Score + próxima ação recomendada |
| Link Calendly no bot | ✅ Funciona | Bloco de botão com URL externa |
| Tags no lead | ✅ Funciona | Via variável `lead.tags` no bot |

---

## O que exige configuração (sem desenvolvimento)

| Item | O que fazer | Tempo |
|------|------------|-------|
| Supabase ativo | `supabase db push` + confirmar `VITE_USE_SUPABASE=true` | 10 min |
| Bot criado | Criar no AI Builder com as 7 perguntas listadas | 2–3h |
| Bot publicado | Botão "Publicar" no Builder → slug `vemfarias` | 5 min |
| Link de bio | Adicionar URL do bot no bio do Instagram | 5 min |
| Calendly | Criar conta + configurar sessão de 30 min | 20 min |
| UTM nos anúncios | Adicionar `?utm_source=meta-ads&utm_campaign=mentoria-beta` | 10 min |
| Meta App + webhook | Seguir passos do `META-PHYSICAL-SMOKE-TEST-REPORT.md` | 40 min |

---

## O que exige desenvolvimento

| Item | Onde está no roadmap | Esforço |
|------|---------------------|---------|
| IA conversacional real (não mock) | Sprint 1 P0 — OPENAI-IMPLEMENTATION-PLAN.md | 2–3h (XS) |
| Instagram DM real | Sprint 3 — após deploy Meta | Deploy 40min + aprovação Meta 1–4 sem |
| WhatsApp inbound real | Deploy pendente | 40 min (deploy manual) |
| Follow-up automático | Sprint 3–4 | M (2–4 semanas) |
| Agendamento integrado (Google Calendar) | Sprint 4 | M (2–3 semanas) |
| Transição automática de estágios | Não no roadmap ativo | S (1–2 dias) |
| Notificação de lead quente | Não no roadmap ativo | S (1 dia) |
| Receita registrada no CRM | Parcialmente em Revenue page | M (1 semana) |

---

## O que pode ser testado amanhã

Sequência mínima para validar o fluxo completo:

```
AMANHÃ
─────────────────────────────────────────────────────

Manhã (2–3h):
[ ] 1. Rodar: supabase db push (confirmar Supabase ativo)
[ ] 2. Criar bot @vemfarias no AI Builder
        - 7 blocos com as perguntas desta página
        - variáveis lead.name, lead.phone, lead.email, lead.tags
        - último bloco: botão Calendly
[ ] 3. Publicar bot com slug "vemfarias"
[ ] 4. Criar conta Calendly + link de sessão 30min
[ ] 5. Inserir link Calendly no bot

Tarde (30min):
[ ] 6. Testar o bot você mesmo:
        - Abrir https://<projeto>.supabase.co/bot/vemfarias
        - Responder todas as perguntas
        - Confirmar lead criado no CRM com score correto
        - Confirmar UTM registrado
[ ] 7. Publicar link no bio do Instagram com UTM
[ ] 8. Pedir para 3 pessoas da rede testarem

Resultado esperado:
→ 3 leads no CRM com score automático
→ Temperatura calculada
→ Dados (nome, email, WhatsApp) preenchidos
→ Origem rastreada (UTM)
→ Lead pronto para follow-up manual
```

---

## Checklist operacional completo

### Fase 1 — Bot e CRM (pode fazer hoje/amanhã)

```
[ ] Supabase db push aplicado
[ ] Bot @vemfarias criado no AI Builder
[ ] Perguntas configuradas (7 blocos)
[ ] Variáveis lead.* mapeadas
[ ] Notas de sessão em lead.notes (desafio + situação + investimento)
[ ] Tags configuradas (mentoria-beta, investimento-alto, etc.)
[ ] Bot publicado com slug "vemfarias"
[ ] Calendly criado com sessão de 30min
[ ] Link Calendly inserido no último bloco
[ ] Bot testado por você antes de publicar
[ ] Link no bio do Instagram (com UTM ?utm_source=instagram)
[ ] Anúncio Meta com link do bot (com UTM ?utm_source=meta-ads&utm_campaign=mentoria-<data>)
```

### Fase 2 — WhatsApp (esta semana)

```
[ ] Meta App criado em developers.facebook.com
[ ] supabase functions deploy meta-webhook --no-verify-jwt
[ ] supabase functions deploy meta-send
[ ] supabase secrets set META_VERIFY_TOKEN=flux_meta_verify
[ ] supabase secrets set META_APP_SECRET=<app_secret>
[ ] Webhook URL registrado no Meta App Dashboard
[ ] hub.challenge verificado (curl teste — ver META-PHYSICAL-SMOKE-TEST-REPORT.md)
[ ] Conexão WhatsApp criada no app (MetaConnectModal)
[ ] Teste físico: mensagem enviada → lead criado no CRM
```

### Fase 3 — IA real (esta semana, ~2–3h de dev)

```
[ ] OPENAI_API_KEY obtida em platform.openai.com
[ ] src/ai/providers/openai.ts implementado (plano em OPENAI-IMPLEMENTATION-PLAN.md)
[ ] Edge Function criada como proxy (NUNCA expor chave como VITE_*)
[ ] Limite de gasto configurado na OpenAI ($20/mês)
[ ] Bot @vemfarias testado com IA real (resposta livre, não mock)
```

### Fase 4 — Operação contínua (rotina diária)

```
[ ] Abrir CRM toda manhã
[ ] Filtrar: temperatura = quente, stage = novo
[ ] Para cada lead quente: enviar WhatsApp manual ou via inbox Flux
[ ] Mover leads para estágio correto conforme evolução
[ ] Leads que agendaram: mover para "negociação"
[ ] Leads que pagaram: mover para "convertido" + registrar valor em notas
[ ] Semana 2: analisar score médio dos leads convertidos vs. perdidos
        (calibrar pesos do scorer se necessário)
```

---

## Referências cruzadas

- [VEMFARIAS-OPERATION.md](./VEMFARIAS-OPERATION.md) — análise original do fluxo
- [BETA-INFRASTRUCTURE-INVENTORY.md](./BETA-INFRASTRUCTURE-INVENTORY.md) — credenciais e infraestrutura
- [META-PHYSICAL-SMOKE-TEST-REPORT.md](./META-PHYSICAL-SMOKE-TEST-REPORT.md) — deploy WhatsApp
- [OPENAI-IMPLEMENTATION-PLAN.md](./OPENAI-IMPLEMENTATION-PLAN.md) — IA real
- [MASTER-ROADMAP.md](./MASTER-ROADMAP.md) — plano geral
