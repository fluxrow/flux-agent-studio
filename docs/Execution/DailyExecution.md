# Daily Execution — Rotina Operacional
**Ritual diário para crescimento consistente do Flux Agent Studio**

---

## Filosofia

Consistência supera intensidade. Um dia ruim com a rotina executada vale mais que uma semana de sprints sem estrutura. Este documento define o mínimo diário não-negociável.

---

## Rotina Diária

### Manhã (30 min) — 08h00

#### 08h00 — Dashboard (5 min)
Abrir o Flux Agent Studio e verificar:
- [ ] Novos leads no CRM (criados nas últimas 24h)
- [ ] Conversas Meta sem resposta (WhatsApp/Instagram)
- [ ] Score médio dos leads da semana

#### 08h05 — Follow-ups prioritários (15 min)
Abrir CRM → filtrar por `stage: qualificado` → listar leads com score ≥ 60 sem contato nas últimas 48h.

Para cada um:
1. Ver `notes` do lead (o que o bot coletou)
2. Enviar mensagem personalizada com o nome + dor declarada
3. Oferecer 2 horários de reunião específicos
4. Registrar ação no CRM (`notes` ou mudança de stage)

**Regra:** máximo 5 follow-ups por manhã. Qualidade > quantidade.

#### 08h20 — Conteúdo do dia (10 min)
Definir 1 post para Instagram/WhatsApp Status:
- Tema: dor do ICP ou resultado de cliente
- CTA: direto para DM ou link do bot
- Publicar ou agendar

---

### Tarde (20 min) — 14h00

#### 14h00 — Reuniões e propostas
- [ ] Realizar reuniões agendadas (bloco 14h–17h)
- [ ] Enviar proposta em até 2h após reunião
- [ ] Registrar objeção principal no CRM se não fechou

#### 14h00 (dias sem reunião) — Prospecção ativa (20 min)
- 5 DMs manuais para perfis que interagiram com o conteúdo
- Responder comentários + redirecionamentos para bot
- Checar se novos leads chegaram via bot desde a manhã

---

### Fim do dia (10 min) — 19h00

#### Registro diário
Preencher a tabela em `docs/FIRST-REVENUE-TEST.md` com os números do dia:
- Conversas iniciadas
- Bot iniciado
- Leads capturados
- Reuniões agendadas
- Vendas fechadas

#### Revisão rápida
1. O que funcionou hoje?
2. O que travar amanhã cedo?
3. Algum lead quente que precisa de ação antes de amanhã?

---

## Semana Padrão

| Dia | Foco principal | Meta |
|-----|---------------|------|
| Segunda | Planejamento semanal + conteúdo programado | 5 posts agendados |
| Terça | Prospecção ativa + DMs | 10 DMs enviadas |
| Quarta | Reuniões | 1–2 reuniões realizadas |
| Quinta | Follow-up de propostas + prospecção | Resposta de todas as propostas abertas |
| Sexta | Análise da semana + ajustes no bot | 1 melhoria no fluxo de qualificação |
| Sábado | Conteúdo da semana seguinte | 3 posts rascunhados |
| Domingo | Opcional — responder DMs urgentes apenas | — |

---

## Métricas Semanais (revisar às sextas)

| Métrica | Meta semanal | Real |
|---------|-------------|------|
| Leads capturados | ≥ 5 | |
| Taxa bot start | ≥ 60% | |
| Taxa qualificação | ≥ 50% | |
| Reuniões realizadas | ≥ 1 | |
| Propostas enviadas | ≥ 1 | |
| Vendas fechadas | ≥ 0,25 (1/mês) | |

---

## Bloqueadores Comuns e Como Resolver

| Bloqueador | Solução |
|-----------|---------|
| "Não tenho tempo para seguir a rotina" | Cortar para 15 min/dia: só dashboard + 2 follow-ups |
| "Não estou gerando leads suficientes" | Aumentar frequência de conteúdo antes de aumentar prospecção ativa |
| "Os leads chegam mas não agendam" | Revisar trigger de agendamento no bot — score mínimo muito alto? |
| "As reuniões acontecem mas não fecham" | Gravar 1 reunião e revisar — onde a proposta perde força? |
| "O bot não está respondendo" | Verificar Edge Functions + Supabase logs antes de qualquer outra coisa |

---

## Automações que já existem (não fazer manualmente)

- ✅ Lead criado no CRM automaticamente após conversa Meta
- ✅ Score calculado automaticamente ao criar lead
- ✅ Forecast gerado automaticamente com score
- ✅ UTM capturado automaticamente do link de origem
- ⚠️ Follow-up automático: **ainda não implementado** — fazer manualmente até Sprint 3

---

## Referências

- [FIRST-REVENUE-TEST.md](../FIRST-REVENUE-TEST.md) — metas e métricas do teste inicial
- [VEMFARIAS-PILOT.md](../VEMFARIAS-PILOT.md) — fluxo de bot configurado
- [MASTER-ROADMAP.md](../MASTER-ROADMAP.md) — estado geral do produto
