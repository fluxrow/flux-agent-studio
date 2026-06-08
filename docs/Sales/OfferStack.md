# Offer Stack — Estrutura da Oferta
**O que o Flux Agent Studio entrega e como comunicar valor**

---

## A Oferta Central

**Flux Agent Studio** é a plataforma que transforma conversas em receita previsível.

### Em uma frase para cada ICP:

**Para agências:**
> "Prove pra cada cliente qual campanha gerou cada venda — automaticamente."

**Para PME:**
> "Nunca mais perca lead no WhatsApp. O bot qualifica, o CRM preenche sozinho."

**Para gestor comercial:**
> "Seu time de vendas só fala com leads quentes. O Flux faz o resto."

---

## Os 5 Componentes da Oferta

### 1. AI Builder
**O que é:** construção de bot por IA a partir de descrição em texto.

**O que entrega:**
- Bot completo (perguntas, lógica de qualificação, respostas por IA) em ≤ 30 minutos
- Sem código, sem configuração técnica
- Atualização do fluxo em segundos quando mudar a estratégia

**Valor percebido:** elimina o custo de agência/dev para montar o bot. Valor de mercado: R$ 800–3.000 de setup.

---

### 2. Lead Intelligence
**O que é:** qualificação automática com score 0–100, forecast de receita e resumo por IA.

**O que entrega:**
- Score em 7 fatores calculado no momento da conversa
- Forecast: probabilidade de fechar + data estimada + valor estimado
- Resumo em linguagem natural: "João, 32, sócio de imobiliária, budget R$ 2k/mês, urgência alta — ligar hoje"
- Temperatura visual: 🔥 Quente / 🟡 Morno / 🔵 Frio

**Valor percebido:** SDR ou vendedor sabe exatamente em qual lead investir tempo. Reduz ciclo de vendas.

---

### 3. CRM Nativo
**O que é:** pipeline de vendas integrado, sem ferramenta separada.

**O que entrega:**
- Lead criado automaticamente após cada conversa (sem digitação)
- Pipeline visual com stages personalizáveis
- Histórico completo de interações por lead
- Filtros por score, source, stage, valor estimado

**Valor percebido:** elimina o custo de HubSpot starter (R$ 500/mês) ou planilha manual.

---

### 4. Revenue Attribution
**O que é:** rastreamento UTM → lead → receita em uma única plataforma.

**O que entrega:**
- Captura automática de UTM em todo lead (source, medium, campaign, content, term)
- Dashboard mostrando receita por canal de origem
- Meta CAPI incluso: envia eventos de conversão para o algoritmo da Meta otimizar por venda real

**Valor percebido:** para agências, resolve o maior gap do cliente. Para PMEs, justifica onde investir em mídia.

---

### 5. Canais Multi-plataforma
**O que é:** bot operando em todos os canais relevantes.

**O que entrega:**
- Web Widget (já ativo)
- WhatsApp via Meta API
- Instagram DM
- Facebook Messenger
- Telegram

**Valor percebido:** lead é atendido onde ele está, não onde é conveniente para a empresa.

---

## Stack de Valor vs. Custo de Construir Separado

| Componente | Ferramenta equivalente no mercado | Custo de mercado |
|-----------|----------------------------------|-----------------|
| AI Builder | Agência de automação | R$ 1.500–5.000 setup |
| Lead Score + Forecast | HubSpot Sales Hub Pro | R$ 1.600/mês |
| CRM | Pipedrive Essential | R$ 280/mês |
| Revenue Attribution | Triple Whale / Northbeam | R$ 800–2.500/mês |
| Meta CAPI | Configuração técnica avulsa | R$ 500–2.000 setup |
| Canais multi | ManyChat + Telegram bot | R$ 200–600/mês |
| **Total** | | **R$ 3.380–7.000/mês + setup** |
| **Flux Agent Studio** | | **Ver PricingModel.md** |

---

## Garantias e Redutores de Risco

- **14 dias grátis** — sem cartão de crédito
- **Sem contrato** — cancela quando quiser
- **LGPD nativo** — consentimento, audit log, data deletion
- **Onboarding incluso** — 1 sessão de 30 min com especialista (planos pagos)
- **Suporte via WhatsApp** — resposta em até 4h úteis

---

## O que NÃO está na oferta (ser honesto)

| Funcionalidade | Status | Quando |
|---------------|--------|--------|
| IA com OpenAI real (não mock) | Em desenvolvimento | Sprint 2 |
| Follow-up automático por e-mail | Roadmap | Sprint 3–4 |
| Relatórios exportáveis (PDF/Excel) | Roadmap | Sprint 3 |
| App mobile nativo | Não planejado | — |
| Integração nativa com RD Station | Roadmap | Sprint 4 |
| Voz (ligações automáticas) | Não planejado | — |

> **Regra:** nunca vender funcionalidade que não existe. Se o lead perguntar por algo não disponível, informar o prazo estimado e oferecer lista de espera.

---

## Upsell Natural

Sequência de expansão de conta:

```
Plano inicial (1 bot, 1 canal)
        ↓
Adicionar canais (WhatsApp + Instagram)
        ↓
Adicionar mais bots (por produto/segmento)
        ↓
Plano agência (múltiplos clientes/workspaces)
        ↓
White-label (agência revende com sua marca)
```

---

## Referências

- [PricingModel.md](./PricingModel.md) — preços e planos
- [PainsAndObjections.md](./PainsAndObjections.md) — como apresentar o valor contra cada objeção
- [ScaleStrategistPrompt.md](../AI/ScaleStrategistPrompt.md) — como o bot usa esse stack na conversa
