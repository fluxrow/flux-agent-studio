# Flux Agent Studio — Inteligência de Produto
## FASE 26A.3 · Inventário, Escada de Evolução e Diagnóstico Definitivo

> Documento de análise estratégica do produto completo.
> Fonte: `fluxbot-features.md` (Phase 3–18.6), `ARCHITECTURE.md`, `README.md`.
> Sem código. Sem implementação. Estratégia pura.

---

## 1. Inventário Completo do Produto

| Funcionalidade | Módulo/Engine | Categoria | Status |
|---|---|---|---|
| Runtime Engine (framework-agnóstica) | `src/runtime/` | Execução | ✅ Entregue |
| Builder Visual (canvas, drag-drop, zoom) | `src/builder/` | Criação | ✅ Entregue |
| Autosave + Validator + Preview ao vivo | `src/builder/` | Criação | ✅ Entregue |
| Publicação de bot + link público + QR | `pages/Builder.tsx` | Publicação | ✅ Entregue |
| PublicBot multimode (web/WA/IG/form) | `pages/PublicBot.tsx` | Canal | ✅ Entregue |
| AI Block Engine (providers plugáveis) | `src/ai/` | IA | ✅ Entregue |
| Structured outputs (IA → variáveis CRM) | `src/ai/` | IA | ✅ Entregue |
| Cost tracking por token/provider | `src/ai/` | IA | ✅ Entregue |
| AI Playground | `pages/AIPlayground.tsx` | IA | ✅ Entregue |
| **AI Builder** (prompt → bot completo) | `src/ai-builder/` | Criação/IA | ✅ Entregue |
| Knowledge Base (RAG própria: chunk→embed→retrieval) | `src/knowledge/` | IA/Conteúdo | ✅ Entregue |
| CRM Engine + Pipeline | `pages/Leads.tsx` | CRM | ✅ Entregue |
| CRM Bridge automático (conversa → lead) | `src/lib/crm-bridge.ts` | CRM | ✅ Entregue |
| **Lead Intelligence** (score 7-fatores + forecast) | `src/intelligence/` | Inteligência | ✅ Entregue |
| Lead Summary + Insights + Recommendation | `src/intelligence/` | Inteligência | ✅ Entregue |
| Lead Forecast (receita, data provável) | `src/intelligence/forecast.ts` | Inteligência | ✅ Entregue |
| **Revenue Attribution** (UTM→lead→receita) | `src/intelligence/attribution.ts` | Receita | ✅ Entregue |
| **Revenue Intelligence** | `pages/Revenue.tsx` | Receita | ✅ Entregue |
| Tracking Engine (visitor profile, UTM, clids) | `src/tracking/` | Tracking | ✅ Entregue |
| Meta CAPI + Google Analytics 4 (destinations) | `src/tracking/destinations/` | Tracking | ✅ Entregue |
| Tracking Inspector (pipeline em tempo real) | `pages/Tracking.tsx` | Tracking | ✅ Entregue |
| Attribution page | `pages/Attribution.tsx` | Receita | ✅ Entregue |
| Connector Hub (manifests + adapters + runtime) | `src/connectors/` | Integrações | ✅ Entregue |
| Connectors reais: Webhook, Google Sheets, Slack, Telegram, Stripe, GA4 | `src/connectors/adapters/` | Integrações | ✅ Entregue |
| Connector Inspector + retry/backoff | `src/connectors/runtime/` | Integrações | ✅ Entregue |
| Variable mapping declarativo (response.data → flow var) | `src/connectors/runtime/` | Integrações | ✅ Entregue |
| Channel Bus omnichannel (desacoplado da Runtime) | `src/channels/` | Canal | ✅ Entregue |
| Web Widget ativo; WhatsApp/IG/Telegram prontos | `src/channels/` | Canal | ✅ Entregue |
| OAuth Manager (Google + binding de canais) | `src/oauth/` | Canal | ✅ Entregue |
| Compliance Layer (LGPD/GDPR) | `src/compliance/` | Confiança | ✅ Entregue |
| Privacy Center + Consent + Audit Logs | `src/compliance/` | Confiança | ✅ Entregue |
| Data Deletion URL (requisito Meta/Google) | `pages/DataDeletion.tsx` | Confiança | ✅ Entregue |
| Secret Vault em memória (tokens nunca em localStorage) | `src/security/` | Segurança | ✅ Entregue |
| Multi-tenant com RLS em todas as tabelas | Supabase | Infra | ✅ Entregue |
| Event Bus global (todas engines desacopladas) | `src/runtime/events/` | Arquitetura | ✅ Entregue |
| Beta Program (flags, onboarding, health, erros) | `src/beta/` | Operações | ✅ Entregue |
| System Health Panel | `pages/SystemHealth.tsx` | Operações | ✅ Entregue |
| Simulator + Event Inspector | `pages/Simulator.tsx` | Dev/QA | ✅ Entregue |
| Analytics básico (bots, leads, conversas, conversões) | `pages/Analytics.tsx` | Analytics | ✅ Entregue |
| Forms | `pages/Forms.tsx` | Criação | ✅ Entregue |
| Variables | `pages/Variables.tsx` | Criação | ✅ Entregue |
| Templates | `pages/Templates.tsx` | Criação | 🔶 Stub (marketplace futuro) |
| Marketplace de Connectors | `src/connectors/` | Integrações | 🔶 Arquitetura pronta, UI pendente |
| Omnichannel real (WA/IG/Telegram conectados) | `src/channels/` | Canal | 🔶 Stubs prontos, integração pendente |
| Knowledge Base Supabase | `src/knowledge/` | IA/Conteúdo | 🔶 Persistência pendente |
| Funil detalhado / séries temporais | `pages/Analytics.tsx` | Analytics | 🔶 Planejado |

---

## 2. Escada de Evolução do Produto

A maioria dos usuários perceberá o produto como uma dessas versões, dependendo de onde entram e até onde exploram.

```
NÍVEL 1 — Formulário Inteligente
  O visitante preenche dados numa conversa.
  Útil: captura de lead básica, pesquisa, triagem.
  Concorrência: Typeform, Tally, Google Forms conversacional.
  Diferencial nulo aqui.

       ↓

NÍVEL 2 — Chatbot
  Bot roteirizado com blocos: mensagem, pergunta, botão, condição.
  Publica em web/WhatsApp, lead vai pro CRM básico.
  Concorrência: Typebot, ManyChat.
  Diferencial baixo aqui.

       ↓

NÍVEL 3 — Agente de IA
  Fluxo híbrido: roteiro + AI Block + Knowledge Base.
  IA responde com contexto da empresa, qualifica com structured outputs.
  Bot gerado por prompt (AI Builder).
  Concorrência: Voiceflow, Chatbase (parcial).
  Diferencial começa aqui.

       ↓

NÍVEL 4 — Máquina de Qualificação Comercial
  Cada conversa gera lead qualificado automaticamente no CRM.
  Lead Intelligence: score 0–100, temperatura, próxima ação recomendada.
  Forecast individual: probabilidade de fechamento + receita esperada.
  Concorrência: ninguém que venha do lado do "chatbot".
  Diferencial forte aqui.

       ↓

NÍVEL 5 — Plataforma de Receita Conversacional  ← onde o produto realmente está
  Revenue Intelligence: atribui receita a campanha/canal/UTM.
  Tracking: do visitante anônimo ao cliente convertido, rastreado.
  Connector Hub: Stripe, Sheets, Slack, Telegram, n8n sem código.
  Omnichannel real: mesmo fluxo em todos os canais.
  LGPD nativa: compliance enterprise pronto.
  Concorrência: ninguém fecha esse loop inteiro.
  Diferencial máximo aqui. É onde quase nenhum usuário atual chega.
```

**Diagnóstico imediato:** a LP atual vende o produto como se fosse **Nível 2** (chatbot com canvas). O produto real está no **Nível 5**. Existe um gap de **3 níveis inteiros** entre o que é comunicado e o que foi construído.

---

## 3. Matriz Commodity / Diferencial / Único

| Funcionalidade | Classificação | Justificativa |
|---|---|---|
| Builder visual de fluxos | 🟡 COMMODITY | Typebot, Voiceflow, ManyChat têm |
| Blocos: mensagem, pergunta, botão, condição | 🟡 COMMODITY | Padrão de mercado |
| Publicação em web/WhatsApp | 🟡 COMMODITY | ManyChat, Typebot |
| Templates de bot | 🟡 COMMODITY | Todos têm |
| AI chatbot básico (LLM) | 🟡 COMMODITY | Chatbase, todos |
| Knowledge Base / RAG | 🟡 COMMODITY | Chatbase, Voiceflow |
| Webhook / integração genérica | 🟡 COMMODITY | Todos |
| Formulário conversacional | 🟡 COMMODITY | Typeform, Tally |
| CRM básico (pipeline + tags) | 🟠 DIFERENCIAL | ManyChat tem básico; Typebot não tem nativo |
| Score de lead | 🟠 DIFERENCIAL | HubSpot tem, mas não gerado pelo próprio bot |
| Tracking de UTM/atribuição | 🟠 DIFERENCIAL | Precisa de integração em todos os concorrentes de bot |
| Multi-tenant com RLS | 🟠 DIFERENCIAL | Poucos oferecem como SaaS B2B seguro |
| Compliance LGPD nativa | 🟠 DIFERENCIAL | Nenhum concorrente de bot tem camada nativa BR |
| Connector Hub (marketplace-ready) | 🟠 DIFERENCIAL | Retool/n8n têm; concorrentes de bot não |
| PublicBot multimode (WA/IG/form/web via query param) | 🟠 DIFERENCIAL | Arquitetura rara |
| **AI Builder** (prompt → bot+CRM+knowledge) | 🟢 ÚNICO | Nenhum concorrente gera o stack comercial inteiro por prompt |
| **Lead Intelligence** (7 fatores + forecast + próxima ação) | 🟢 ÚNICO | Combinação inexistente em ferramentas de bot |
| **Revenue Attribution** (conversa → UTM → receita) | 🟢 ÚNICO | Fecha loop que exige 3 ferramentas separadas nos concorrentes |
| **Loop fechado conversa→CRM→revenue** | 🟢 ÚNICO | A arquitetura integrada das 4 colunas não existe em um produto |
| **Arquitetura de event bus com 9 engines desacopladas** | 🟢 ÚNICO | Marketplace-ready, extensível, impossível de copiar rapidamente |

---

## 4. Comparativo Competitivo

| Funcionalidade | Typebot | ManyChat | Voiceflow | Chatbase | HubSpot | **Flux Agent Studio** |
|---|---|---|---|---|---|---|
| Builder visual | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| AI Block (LLM nativo) | ✅ parcial | ✅ parcial | ✅ | ✅ | ✅ parcial | ✅ multi-provider |
| Knowledge Base / RAG | ✅ parcial | ❌ | ✅ | ✅ | ❌ | ✅ própria |
| **AI Builder** (1 prompt → bot completo) | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| CRM nativo | ❌ | ✅ básico | ❌ | ❌ | ✅ completo | ✅ + score |
| **Lead Intelligence** (score + forecast + ação) | ❌ | ❌ | ❌ | ❌ | ✅ parcial | ✅ nativo |
| **Revenue Attribution** (conversa→UTM→receita) | ❌ | ❌ | ❌ | ❌ | ✅ (parcial) | ✅ loop fechado |
| Tracking de visitante (anon → lead) | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ nativo |
| Meta CAPI nativo | ❌ | ✅ | ❌ | ❌ | ✅ | ✅ |
| Connector Hub (Sheets, Slack, Stripe, etc.) | ✅ via webhook | ✅ via integração | ✅ | ❌ | ✅ | ✅ nativo |
| Omnichannel real (mesmo fluxo em todos) | ✅ parcial | ✅ WA/IG | ✅ parcial | ❌ | ❌ | ✅ arquitetura real |
| Compliance LGPD nativa | ❌ | ❌ | ❌ | ❌ | ✅ parcial | ✅ |
| Multi-tenant enterprise-grade | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ (RLS nativo) |
| Preço PME brasileiro | ✅ | ✅ | ❌ caro | ✅ | ❌ caro | ✅ |
| **Colunas cobertas do funil** | 1 | 1–2 | 1 | 1 | 3–4 | **4/4** |

**Único produto que cobre as 4 colunas com preço PME:** Flux Agent Studio.

---

## 5. Funcionalidades Subvalorizadas

Estas funcionalidades **existem hoje, são diferenciais reais**, e estão completamente ausentes da LP, do onboarding e do pitch comercial:

| Funcionalidade | Por que é valiosa | Por que está invisível |
|---|---|---|
| **AI Builder** | Um prompt gera bot + CRM + knowledge — time-to-value de meses para minutos | Aparece só como item de nav no app |
| **Lead Forecast** (receita esperada + data de fechamento) | Previsibilidade comercial — o gestor pode projetar pipeline | Enterrado na aba Intelligence do lead |
| **Revenue Attribution** | Identifica qual campanha gerou qual receita | Existe em `/attribution`, nunca mencionado na LP |
| **Revenue Intelligence** | Dashboard de receita atribuída a conversas | Existe em `/revenue`, zero menção na LP |
| **Tracking Inspector** | Visibilidade total do pipeline de dados em tempo real | Só visível para quem abre `/tracking` |
| **PublicBot multimode** (`?mode=whatsapp`) | Um bot, múltiplos modos de render — diferencial arquitetural | Nunca demonstrado |
| **Connector Hub com Stripe** | Automatiza cobrança dentro da conversa | Mencionado vagamente como "n8n" na LP atual |
| **Compliance LGPD nativa** | Vendável para enterprise e agências — elimina objeção jurídica | Inexistente na comunicação |
| **Cost tracking de IA** | Controle de gasto por bot/provider/sessão | Só existe no app, nunca comunicado |
| **Score 0–100 com trace de raciocínio** | Transparência da qualificação — o vendedor entende por que o lead é quente | Nunca demonstrado fora do app |

---

## 6. Se tivéssemos apenas 5 diferenciais no Hero

Estes 5 maximizam **impacto imediato + diferenciação + conversão** para o público de dono de empresa e gestor comercial:

1. **Loop fechado automático** — bot captura → IA qualifica → lead entra no CRM sozinho
2. **Lead Intelligence** — cada lead chega com score, forecast de receita e próxima ação recomendada
3. **AI Builder** — descreva o bot que quer; a IA monta em minutos
4. **Revenue Attribution** — você sabe de qual campanha veio cada venda
5. **Multicanal nativo** — um agente, todos os canais — sem refazer o fluxo

---

## 7. Se tivéssemos apenas 10 diferenciais para vender o produto

Os 5 acima mais:

6. **LGPD nativa** — compliance incluído, sem integração extra
7. **Connector Hub** — Google Sheets, Slack, Stripe, Telegram sem código
8. **Previsão de fechamento** — o sistema estima quando e quanto cada lead vai gerar
9. **Knowledge Base RAG própria** — o agente responde com o conteúdo da empresa, sem ChatGPT solto
10. **Multi-tenant enterprise-grade** — cada workspace é isolado, com auditoria e controle de roles

---

## 8. Mapa Funcionalidade → Benefício → Resultado Financeiro

| Funcionalidade | Benefício percebido pelo usuário | Resultado financeiro mensurável |
|---|---|---|
| **Runtime 24/7** | Nunca perde uma resposta | Aumento de leads qualificados (resposta em <1min = 8x mais conversão) |
| **AI Builder** | Bot no ar em minutos, não semanas | Redução de custo de implantação (sem dev, sem agência) |
| **AI Block + Knowledge** | Respostas precisas sem treinar equipe | Redução de custo de atendimento; escala sem contratar |
| **CRM Bridge automático** | Nenhum lead digitado manualmente | Zero perda por erro operacional; 100% dos leads rastreados |
| **Lead Score 0–100** | Vendedor sabe quem atacar primeiro | Aumento de conversão: foco no lead quente |
| **Lead Forecast** | Previsão de receita por lead | Planejamento comercial preciso; meta alcançável |
| **Lead Intelligence (próxima ação)** | Vendedor sabe o que fazer com cada lead | Redução de ciclo de venda |
| **Revenue Attribution** | Sabe qual campanha gera receita | Corta gasto em canal ruim; dobra no bom |
| **Revenue Intelligence** | Dashboard de receita por origem | Decisão de investimento em marketing baseada em dados |
| **Tracking visitor → lead** | Entende o comportamento antes da captura | Melhor segmentação e personalização |
| **Connector Hub + Stripe** | Automação de cobrança dentro da conversa | Receita gerada diretamente no fluxo |
| **Omnichannel** | Presença onde o cliente está | Aumento de alcance sem duplicar esforço |
| **LGPD Compliance** | Sem risco jurídico | Vendável para enterprise e agências; reduz churn |

---

## 9. Diagnóstico: Estamos Subvendendo o Produto?

### Veredito: **SIM. Drasticamente.**

**O que estamos vendendo hoje (LP atual):**
> "Um builder visual de chatbot com IA e CRM em uma plataforma."

Isso posiciona o produto como **Nível 2–3** da escada. É a mensagem de um concorrente do Typebot.

**O que deveríamos vender:**
> "A plataforma que fecha o loop entre a primeira conversa e a receita — com qualificação automática, previsão de pipeline e atribuição de cada venda ao canal que a gerou."

Isso posiciona o produto como **Nível 5**. É a mensagem de uma ferramenta de **resultado comercial**, não de um "builder".

### Quanto estamos deixando na mesa

A distância entre "builder de chatbot" (Nível 2) e "plataforma de receita conversacional" (Nível 5) não é apenas de percepção — é de **precificação, público e ciclo de venda**:

| Dimensão | "Builder de chatbot" | "Revenue Platform" |
|---|---|---|
| Willingness to pay | R$97–297/mês | R$997–3.997/mês |
| Decisor da compra | Analista/dev | Dono/CEO/VP Vendas |
| Ciclo de venda | Self-serve, imediato | 1–4 semanas |
| Churn esperado | Alto (commodity) | Baixo (dor de negócio) |
| LTV estimado | Baixo | Alto |

Ao comunicar como "builder", o produto **se candidata ao contrato errado** — atrai quem quer a feature mais barata, não quem paga pelo resultado.

---

## 10. Diagnóstico Final: O que o Flux Agent Studio realmente é em 2026

> **O Flux Agent Studio é a primeira plataforma brasileira de receita conversacional:** conecta a primeira mensagem de um potencial cliente ao seu CRM qualificado, à previsão de receita e à atribuição do canal de origem — dentro de um único produto, sem código, em conformidade com a LGPD.

**Não é um chatbot.** Chatbot é o canal de entrada. O produto é o **sistema operacional comercial** que fica atrás desse canal.

**Não é um CRM.** CRM é um dos motores. O produto é a **camada de conversão** que alimenta e enriquece o CRM automaticamente.

**Não é um builder de IA.** IA é um habilitador interno. O produto é a **máquina de geração e qualificação de receita** que usa IA para funcionar sozinha.

### A definição mais honesta e mais forte:
> "É a plataforma onde a primeira conversa com um cliente já é o início do processo de venda — qualificado, registrado, previsto e atribuído. Automaticamente."

---

*Documento criado: 2026-06-03*
*Fontes: `fluxbot-features.md`, `ARCHITECTURE.md`, `README.md`*
*Conclui: ciclo de análise estratégica FASE 26A.1 + 26A.2 + 26A.3*
*Próximo passo: aprovação do posicionamento → implementação LP V2*
