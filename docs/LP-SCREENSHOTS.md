# LP V2 — Lista de Screenshots

> Lista canônica de screenshots a serem capturados para a Landing Page V2.
> Identificadores `S#` são estáveis e devem ser referenciados pela LP quando importar os assets.
> Este documento NÃO altera a LP nem o código — é planejamento.

Convenções:
- Resolução alvo: 1920×1200 (desktop) e 390×844 (mobile) quando aplicável.
- Tema: dark (padrão do produto).
- Capturar com **modo demonstração** ativo para garantir dados realistas sem expor dados de usuários reais.

---

## Críticos (Hero + seções principais)

### S1 — Dashboard "workspace ativo"
- **Rota:** `/dashboard`
- **Objetivo:** Mostrar visão geral do produto com KPIs reais, widgets de CRM e omnichannel.
- **Onde será usado:** Hero principal da LP (mockup do produto).

### S2 — Builder com flow conectado
- **Rota:** `/builder/:botId` (flow demo de boas-vindas + captura)
- **Objetivo:** Provar que existe um construtor visual robusto.
- **Onde será usado:** Seção "Construa visualmente" / segundo fold.

### S3 — AI Builder gerando flow
- **Rota:** `/ai-builder` com prompt preenchido e resultado renderizado
- **Objetivo:** Demonstrar criação de agente em segundos com IA.
- **Onde será usado:** Seção "Crie um agente em 30 segundos" / CTA principal.

### S4 — PublicBot (WhatsApp + Instagram)
- **Rota:** `/bot/:slug?mode=whatsapp` e `/bot/:slug?mode=instagram`
- **Objetivo:** Provar omnichannel real (mesmo bot, vários canais).
- **Onde será usado:** Seção "Publique em qualquer canal" — dois mockups lado a lado.

### S5 — CRM Pipeline
- **Rota:** `/leads`
- **Objetivo:** Mostrar pipeline kanban com leads em todos os estágios.
- **Onde será usado:** Seção "CRM integrado".

---

## Altos (reforço de prova)

### S6 — PublishDialog aberto
- **Rota:** Modal dentro de `/builder/:botId`
- **Objetivo:** Mostrar fluxo de publicação simples (slug + 1 clique).
- **Onde será usado:** Seção "Publique em segundos" / animação ou print.

### S7 — Lead Intelligence
- **Rota:** `/leads/:leadId`
- **Objetivo:** Score, temperatura, timeline e atribuição.
- **Onde será usado:** Seção "Lead Intelligence".

### S8 — Conversations
- **Rota:** `/conversations` com uma conversa aberta
- **Objetivo:** Mostrar inbox unificado com mensagens reais.
- **Onde será usado:** Seção "Conversas em um só lugar".

### S9 — Analytics
- **Rota:** `/analytics`
- **Objetivo:** KPIs e gráficos de conversão.
- **Onde será usado:** Seção "Decisões com dados".

---

## Médios (seções secundárias)

### S10 — Revenue Intelligence (com dados demo)
- **Rota:** `/revenue` (requer leads convertidos com value)
- **Objetivo:** Receita atribuída por canal/origem.
- **Onde será usado:** Seção "ROI mensurável".

### S11 — Attribution
- **Rota:** `/attribution` (requer sessões com UTM)
- **Objetivo:** Origens, canais, ROAS.
- **Onde será usado:** Seção "ROI mensurável" / suporte ao S10.

### S12 — Channels
- **Rota:** `/channels`
- **Objetivo:** Grid de canais suportados.
- **Onde será usado:** Seção "Onde quiser falar com seus clientes".

### S13 — Templates
- **Rota:** `/templates`
- **Objetivo:** Galeria de templates prontos.
- **Onde será usado:** Seção "Comece com um template".

---

## Baixos (rodapé / variações)

### S14 — Onboarding
- **Rota:** `/onboarding`
- **Objetivo:** Mostrar simplicidade do primeiro acesso.
- **Onde será usado:** Eventualmente em "Como funciona" ou docs.

---

## Mapeamento → seções da LP (preview)

| Seção da LP                           | Screenshots |
|---------------------------------------|-------------|
| Hero                                  | S1, S3      |
| Construa visualmente                  | S2          |
| Criação com IA                        | S3          |
| Publique em qualquer canal            | S4, S6      |
| CRM integrado + Lead Intelligence     | S5, S7      |
| Conversas unificadas                  | S8          |
| Analytics + ROI                       | S9, S10, S11|
| Canais e Templates                    | S12, S13    |
| Como funciona / Onboarding            | S14         |
