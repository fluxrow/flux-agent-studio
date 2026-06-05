# FIRST REVENUE TEST
**FASE 27C.2 — Plano de Validação Comercial Inicial**
*Meta: 10 leads → 3 reuniões → 1 venda em 14 dias*

---

## Meta Principal

| Indicador | Meta | Prazo |
|-----------|------|-------|
| Leads qualificados capturados | 10 | 14 dias |
| Reuniões agendadas | 3 | 14 dias |
| Venda fechada | 1 | 14 dias |
| Ticket mínimo aceitável | R$ 300/mês | — |
| MRR incremental | R$ 300 | — |

**Propósito:** confirmar que o ciclo `conversa → qualificação → CRM → reunião → venda` funciona com dados reais antes de escalar. Uma venda real, por menor que seja, valida cada camada da stack.

---

## Configuração para o Teste

### Canal de entrada
- **WhatsApp** via número @vemfarias (único canal com Meta configurado)
- **Web Widget** como fallback — link direto no bio do Instagram
- **Fonte de tráfego:** posts orgânicos + stories + redirecionamento de DMs manuais

### Bot (pré-configurado no `docs/VEMFARIAS-PILOT.md`)
- 7 perguntas de qualificação
- Score mínimo para "Quente": 60 pts
- Trigger de reunião: score ≥ 60 + budget confirmado

### CRM
- Pipeline: `novo → qualificado → reunião agendada → proposta → fechado`
- Todo lead capturado pelo bot entra em `stage: "novo"` automaticamente
- Promoção manual após reunião agendada

### Critério de lead qualificado
Lead que responde pelo menos 5 das 7 perguntas E tem:
- Budget declarado ≥ R$ 300/mês, **ou**
- Urgência declarada (precisa em ≤ 30 dias), **ou**
- Score ≥ 60 pts

---

## Métricas Diárias

Registrar todos os dias às 19h:

| Métrica | D1 | D2 | D3 | D4 | D5 | D6 | D7 | D8 | D9 | D10 | D11 | D12 | D13 | D14 |
|---------|----|----|----|----|----|----|----|----|----|----|-----|-----|-----|-----|
| Conversas iniciadas | | | | | | | | | | | | | | |
| Bot iniciado | | | | | | | | | | | | | | |
| Qualificação completa (≥5 respostas) | | | | | | | | | | | | | | |
| Leads capturados no CRM | | | | | | | | | | | | | | |
| Score médio dos leads | | | | | | | | | | | | | | |
| Reuniões agendadas | | | | | | | | | | | | | | |
| Reuniões realizadas | | | | | | | | | | | | | | |
| Propostas enviadas | | | | | | | | | | | | | | |
| Vendas fechadas | | | | | | | | | | | | | | |

### KPIs de conversão (calcular semanalmente)

```
Taxa bot start     = Bot iniciados / Conversas iniciadas     → meta ≥ 60%
Taxa qualificação  = Qualificações completas / Bot iniciados → meta ≥ 50%
Taxa reunião       = Reuniões agendadas / Leads qualificados → meta ≥ 30%
Taxa fechamento    = Vendas / Reuniões realizadas            → meta ≥ 33%
```

---

## Checklist de Execução

### Dia 0 — Setup (antes de começar)
- [ ] Bot configurado conforme `docs/VEMFARIAS-PILOT.md`
- [ ] CRM pipeline com 5 estágios criado
- [ ] Número WhatsApp conectado ao app (ou ManyChat ativado como fallback)
- [ ] Link do bot no bio do Instagram
- [ ] Supabase migrations aplicadas (`supabase db push`)
- [ ] Edge Functions deployadas (`meta-webhook` + `meta-send`)
- [ ] Secrets configurados (`META_VERIFY_TOKEN` + `META_APP_SECRET`)
- [ ] Teste manual: enviar "oi" para o número e confirmar bot responde

### Dias 1–3 — Geração de tráfego inicial
- [ ] 1 post por dia no Instagram com CTA para DM
- [ ] Responder 100% das DMs manuais redirecionando para o bot
- [ ] Monitorar `meta_conversations` no Supabase (confirmar chegada de leads)
- [ ] Revisar CRM ao final do dia — corrigir leads duplicados ou sem score

### Dias 4–7 — Qualificação e agendamento
- [ ] Para leads com score ≥ 60: enviar mensagem manual com link Calendly
- [ ] Para leads com score < 60: nutrir com conteúdo (resposta manual)
- [ ] Verificar se `useMetaLeadBridge` criou leads automaticamente (sem duplicatas)
- [ ] Ajustar perguntas do bot se taxa de qualificação < 30%

### Dias 8–11 — Reuniões
- [ ] Realizar reuniões agendadas (60 min)
- [ ] Registrar objeções no campo `notes` do CRM
- [ ] Enviar proposta em até 24h após reunião
- [ ] Fazer follow-up em 48h se sem resposta

### Dias 12–14 — Fechamento
- [ ] Pressão suave: "Você tem até [data] para garantir o preço de beta"
- [ ] Registrar resultado: fechou / perdeu / adiou
- [ ] Documentar motivo de perda (objeção principal)

---

## Critérios de Sucesso

### Sucesso total
- ≥ 1 venda fechada em 14 dias, ticket ≥ R$ 300/mês
- Leads aparecendo no CRM automaticamente (sem entrada manual)
- Realtime funcionando (lead aparece em ≤ 5s sem reload)

### Sucesso parcial (aprender, não celebrar)
- 3+ reuniões realizadas, nenhuma venda
- 10+ leads capturados, < 3 reuniões
- Venda fechada mas entrada manual necessária

### Falha operacional
- Bot não responde após configuração
- Leads não aparecem no CRM automaticamente
- < 5 leads capturados em 14 dias

---

## Critérios de Falha e Ação Corretiva

| Situação | Diagnóstico | Ação |
|----------|-------------|------|
| Bot iniciado < 30% | CTA fraco ou link quebrado | Checar link do bio; testar fluxo de entrada |
| Qualificação < 20% | Perguntas longas ou jargão | Encurtar para 5 perguntas; linguagem informal |
| Reuniões agendadas = 0 | Link Calendly não está sendo enviado | Criar trigger automático no bot para score ≥ 60 |
| Venda não fecha | Proposta fora do budget / timing | Baixar ticket de entrada (R$ 150/mês); oferta de 30 dias grátis |
| Lead não aparece no CRM | Bug ou migration não aplicada | Verificar `meta_conversations` direto no Supabase; re-aplicar migration |

---

## Aprendizados por Resultado

### Se fechar 1+ venda
- Documentar: qual objeção foi superada, qual argumento funcionou
- Identificar: qual pergunta do bot foi mais preditiva do fechamento
- Calibrar: ajustar peso do score para o fator que previu melhor
- Próximo passo: escalar tráfego (paid), não mudar o produto

### Se não fechar nenhuma
- Diagnóstico obrigatório em 3 camadas:
  1. **Tráfego:** chegaram leads qualificados? (score ≥ 60)
  2. **Reunião:** chegou a apresentar proposta?
  3. **Proposta:** qual foi a objeção principal?
- Nunca concluir "o produto não funciona" antes de validar as 3 camadas
- Próximo passo: ajustar apenas a camada com maior gargalo

### Se capturou leads mas ninguém agendou reunião
- Avaliar: o bot está coletando email ou WhatsApp para follow-up ativo?
- Adicionar: mensagem de follow-up manual no D+2 para leads com score ≥ 50
- Testar: oferecer diagnóstico gratuito de 15 min como isca de reunião

### Se o bot não iniciou conversas
- Prioridade 1: verificar funcionamento técnico (logs no Supabase)
- Prioridade 2: validar que o número está publicado e acessível
- Fallback: usar formulário web + Web Widget enquanto WhatsApp não funciona

---

## Referências

- [VEMFARIAS-PILOT.md](./VEMFARIAS-PILOT.md) — bot e fluxo completo
- [BETA-INFRASTRUCTURE-INVENTORY.md](./BETA-INFRASTRUCTURE-INVENTORY.md) — checklist de credenciais
- [META-PHYSICAL-SMOKE-TEST-REPORT.md](./META-PHYSICAL-SMOKE-TEST-REPORT.md) — passos manuais de deploy
- [MASTER-ROADMAP.md](./MASTER-ROADMAP.md) — estado geral do projeto
