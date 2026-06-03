# Flux Agent Studio — Landing Page Strategy
## FASE 26A.1 · Posicionamento, Cores e Diferenciais Reais

> Documento de referência estratégica para a LP V2.
> Fonte primária: documentação interna (`fluxbot-features.md`, `ARCHITECTURE.md`, `README.md`).
> Não contém código. Não contém componentes. É o briefing definitivo antes da implementação.

---

## 1. O que o Flux Agent Studio realmente é

Baseado na documentação interna (18+ fases entregues), o produto **não é um builder de chatbot**.
É uma **plataforma de automação de receita conversacional** com 9 engines desacopladas:

| Engine | O que faz |
|---|---|
| **Runtime Engine** | Executa fluxos conversacionais (framework-agnóstica, React-free) |
| **AI Block Engine** | Providers de IA plugáveis + structured outputs + custo por token |
| **Knowledge Base** | RAG próprio: chunking → embeddings → retrieval cosine-similarity |
| **AI Builder** | Gera bot completo (fluxo + CRM + knowledge) a partir de 1 prompt |
| **Connector Hub** | Integração com qualquer sistema (webhook, OAuth, Google Sheets, Slack, Stripe, Telegram) |
| **Tracking Engine** | Visitor profile, UTM, click-IDs, Meta CAPI, Google — desacoplado da Runtime |
| **CRM Engine** | Pipeline, lead scoring, captura automática via Runtime Bridge |
| **Lead Intelligence** | Score 0–100 com 7 fatores, forecast de receita, recomendação de próxima ação |
| **Compliance Layer** | LGPD/GDPR, Consent, Audit Logs, Privacy Center, Data Deletion |

**Conclusão de posicionamento:** o produto entrega o **ciclo completo Atração → Qualificação → CRM → Receita** dentro de uma única plataforma, com rastreamento atribuído de cada lead à sua origem.

---

## 2. Diferenciais Reais vs. Concorrentes

### vs. Typebot
| Typebot | Flux Agent Studio |
|---|---|
| Builder visual excelente | Builder visual + AI Builder (gera o bot por prompt) |
| Sem CRM nativo | CRM nativo com pipeline, tags, score e bridge automático |
| Sem Intelligence | Lead Intelligence: score, forecast, recomendação de ação |
| Tracking via integrações externas | Tracking Engine nativo com visitor profile e UTM |
| Sem omnichannel nativo | Channel Bus omnichannel (Web ativo, WhatsApp/IG/Telegram prontos) |
| Open-source | Multi-tenant com RLS, compliance LGPD, Audit Logs |

### vs. Chatbase
| Chatbase | Flux Agent Studio |
|---|---|
| Chat-only, UI simples | Fluxos estruturados + IA híbrida (roteiro + improviso) |
| Sem fluxo visual | Canvas visual com blocos, conexões, condições, loops |
| Sem CRM | CRM completo com pipeline e lead scoring |
| Sem tracking | Tracking Engine + Meta CAPI + Google |
| Sem conectores | Connector Hub com webhook, Google Sheets, Slack, Stripe |

### vs. ManyChat
| ManyChat | Flux Agent Studio |
|---|---|
| Focado em WhatsApp/IG básico | Omnichannel + Web Widget como primeiro canal |
| Sem IA real | AI Block com múltiplos providers + Knowledge Base RAG |
| CRM básico por tags | CRM com score 0–100, forecast de receita, Lead Intelligence |
| Sem tracking próprio | Visitor profile + UTM + click-IDs nativo |
| Lock-in de canal | Arquitetura de canais desacoplada — troca sem mudar o fluxo |

### vs. Voiceflow
| Voiceflow | Flux Agent Studio |
|---|---|
| Focado em voice/enterprise | Focado em conversão: lead → CRM → receita |
| Preço enterprise | Freemium/PME |
| Sem CRM/tracking | CRM + Intelligence + Tracking completos |
| Integração por API | Connector Hub nativo (webhook, OAuth, Sheets, Slack, Stripe) |
| Não resolve o funil | Fecha o loop: bot → lead → qualificado → pipeline → receita |

### vs. CRMs comuns (HubSpot, Pipedrive, RD Station)
| CRM Tradicional | Flux Agent Studio |
|---|---|
| Lead chega manual | Lead capturado automaticamente pelo bot |
| Qualificação por humano | Qualificação por IA (AI Block + Intelligence score) |
| Sem bot de conversação | Bot é o ponto de entrada — canal, não integração |
| Sem tracking conversacional | Tracking de cada mensagem, block, UTM, visitor |
| Ferramenta separada do canal | Canal + CRM + Intelligence em uma plataforma |

---

## 3. Diferenciais por Categoria

### 3A · Técnicos
- Runtime Engine framework-agnóstica com Event Bus — nenhuma engine conhece outra
- DI por env flag: troca de mock para Supabase sem alterar UI
- Multi-tenant first com RLS em todas as tabelas (workspace_id em tudo)
- AI Block com structured outputs + cost tracking por token
- Knowledge Base RAG própria (cosine similarity, chunking, embeddings) — não depende de provider
- Connector Hub marketplace-ready (manifests declarativos, adapters plugáveis)
- Secret Vault em memória — tokens nunca vão para localStorage
- Compliance layer nativo (LGPD/GDPR/cookies/audit logs)

### 3B · Comerciais
- Do prompt ao bot publicado: **1 comando no AI Builder**
- Lead capturado automaticamente na conversa → CRM sem integração manual
- Score de lead 0–100 com 7 fatores + temperatura (frio/morno/quente)
- Forecast de receita e data provável de fechamento por lead
- Revenue Intelligence: atribui receita à campanha/canal de origem
- Tracking UTM + click-IDs ligados diretamente ao lead (não ao visitante anônimo)

### 3C · UX
- Builder canvas infinito com drag-and-drop, autosave, zoom, preview ao vivo
- AI Builder: um prompt gera fluxo + CRM seed + hints de knowledge
- Tour guiado automático no primeiro acesso ao Builder
- Onboarding de 6 passos com progresso persistido
- PublicBot renderiza em 5 modos: web/WhatsApp/Instagram/Messenger/form (query param)
- System Health panel: checklist visual do estado de cada subsistema

### 3D · IA
- IA híbrida: mistura roteiro (blocks) + improviso (AI Block) no mesmo fluxo
- Knowledge Base RAG: o bot responde com base no conteúdo da empresa
- AI Builder gera bot completo por linguagem natural (Flow + CRM + Knowledge + Conversation)
- Structured outputs: IA preenche variáveis do CRM diretamente
- Cost tracking: custo em USD por sessão, por AI provider, por knowledge query
- AI Playground para testar providers e prompts antes de publicar

### 3E · CRM
- Captura automática via Runtime Bridge (variáveis name/email/phone/company)
- Pipeline com stages customizáveis
- Lead scoring 0–100 com trace de raciocínio
- Lead Intelligence tab: score breakdown + summary + insights + recommendation + forecast
- Hot/cold leads no dashboard com receita atribuída
- CRM Dashboard widget: totals, taxa de ganho, top campanhas

### 3F · Tracking
- Visitor profile persistido (anonimizado) antes de captura do lead
- UTM + Google click-ID (gclid) + Meta click-ID (fbclid) capturados automaticamente
- Attribution: UTM vinculado ao lead_id na conversão
- Meta CAPI + Google Analytics 4 como destinations nativas
- Tracking Inspector: pipeline de dispatch em tempo real no `/tracking`
- Conformidade Meta Business: Pixel, CAPI, hash de dados

### 3G · Automação
- Connector Hub: webhook, Google Sheets, Slack, Telegram, Stripe, GA4 nativos
- Retry policy por connector (attempts, backoffMs, errorPolicy)
- Variable mapping declarativo: `response.data.id` → variável do fluxo
- Connector Inspector: execute qualquer ação, veja request/response/status/retry
- n8n-compatible via webhook universal

### 3H · Omnichannel
- Channel Bus desacoplado da Runtime (troca de canal sem mudar fluxo)
- Web Widget ativo, WhatsApp/Instagram/Telegram prontos como stubs com arquitetura real
- PublicBot `/bot/:slug?mode=whatsapp|instagram|form` — visitante escolhe o modo
- Account Center com OAuth (Google) + binding de canais
- Inbox Foundation preparada para unificar mensagens de todos os canais

---

## 4. Alocação dos Diferenciais na LP

### 4A · No Hero
- "Um agente que atende, qualifica e entrega o lead pronto no CRM — 24/7"
- IA híbrida (roteiro + improviso)
- Múltiplos canais em um só bot
- Sem código · 14 dias · LGPD

### 4B · Na Jornada (5 passos)
- Criar: Builder visual + AI Builder (1 prompt)
- Publicar: link/QR + canal em minutos
- Capturar: lead criado automaticamente na conversa
- Qualificar: score 0–100 + Intelligence tab + forecast
- Converter: Analytics + Revenue Intelligence

### 4C · Nas Seções de Produto
- Builder: canvas + paleta + drag-drop + autosave + tour
- AI Builder: prompt → fluxo completo (diferencial técnico único vs. Typebot/ManyChat)
- Lead Intelligence: score breakdown, forecast, recomendação de ação
- Tracking: visitor → UTM → lead → receita (cadeia fechada)
- Connector Hub: Google Sheets, Slack, Stripe, webhook sem código
- Compliance: LGPD nativo, Consent, Audit Logs

### 4D · Em FAQ/Objeções
- "É difícil configurar?" → Onboarding 6 passos + AI Builder (1 prompt)
- "Integra com meu CRM/WhatsApp?" → Connector Hub + Channel Bus
- "Meus dados ficam seguros?" → Secret Vault + RLS + LGPD + Audit Logs
- "Precisa de desenvolvedor?" → Sem código; Builder visual + AI Builder
- "Quanto tempo até meu primeiro bot?" → Minutos; templates prontos
- "É diferente de Typebot/ManyChat?" → CRM + Intelligence + Tracking nativos

---

## 5. Cinco Opções de Posicionamento

### P1 — "O agente que nunca perde um lead"
- **Headline:** Seu próximo cliente está esperando uma resposta. O FluxBot já deu.
- **Subheadline:** Crie agentes que atendem, qualificam e entram no CRM sozinhos — em qualquer canal, a qualquer hora.
- **Promessa central:** Zero lead perdido por demora de resposta.
- **Público principal:** Gestores comerciais com time pequeno e volume alto de leads inbound.
- **Risco de interpretação:** Pode soar como "apenas chatbot de atendimento".
- **Força comercial:** ★★★★★ — dor direta, mensurável, universal no B2B brasileiro.

### P2 — "Do WhatsApp ao CRM sem tocar em código"
- **Headline:** Seu time comercial qualificando leads — enquanto você dorme.
- **Subheadline:** Construa o fluxo no canvas, publique no WhatsApp, receba o lead pontuado no pipeline. Tudo automático.
- **Promessa central:** Automação do funil completo, da conversa ao CRM.
- **Público principal:** Dono de empresa que quer escalar vendas sem contratar.
- **Risco de interpretação:** "WhatsApp" pode limitar percepção de produto completo.
- **Força comercial:** ★★★★☆ — concreto e direto, mas reduz o produto.

### P3 — "A plataforma que fecha o loop entre conversa e receita"
- **Headline:** Toda conversa vira dado. Todo lead vira previsão de receita.
- **Subheadline:** FluxBot conecta bot, CRM e Analytics em uma plataforma. Você sabe de onde vem cada venda.
- **Promessa central:** Visibilidade total do funil — da mensagem à receita.
- **Público principal:** Gestor de marketing que precisa provar ROI de canal.
- **Risco de interpretação:** Abstrato demais para dono de empresa pequena.
- **Força comercial:** ★★★★☆ — muito forte para marketing/RevOps, médio para PME.

### P4 — "Crie seu bot com IA. Publique em minutos."
- **Headline:** Descreva o bot que você quer. A IA monta, você publica.
- **Subheadline:** AI Builder transforma um parágrafo em fluxo completo — com CRM, qualificação e canais configurados.
- **Promessa central:** Velocidade: de ideia a bot no ar em menos de 10 minutos.
- **Público principal:** Early adopter, gestor de marketing digital.
- **Risco de interpretação:** Pode soar como "mais um AI wrapper" sem profundidade.
- **Força comercial:** ★★★☆☆ — forte para aquisição viral, fraco para enterprise.

### P5 — "O único builder que transforma conversa em previsibilidade comercial"
- **Headline:** Pare de perder leads para o silêncio. Comece a converter com previsibilidade.
- **Subheadline:** Builder visual + IA + CRM + Revenue Intelligence em uma plataforma. Do primeiro contato ao fechamento — rastreado, qualificado e automatizado.
- **Promessa central:** Previsibilidade de receita a partir de conversas automatizadas.
- **Público principal:** Dono de empresa e gestor comercial com meta de crescimento.
- **Risco de interpretação:** Headline mais longa, pode perder impacto em 3s.
- **Força comercial:** ★★★★★ — é o diferencial técnico mais difícil de copiar.

### 🎯 Recomendação de Posicionamento
**P1 como espinha dorsal + P5 como promessa da seção CRM/Intelligence.**

P1 tem a dor mais universal e mensurável para o público B2B brasileiro (PME). P5 fecha o argumento para quem já está convencido e quer entender o diferencial real (Revenue Intelligence + previsibilidade). P2 e P3 como copy secundário nas seções de produto.

**Headline recomendada para o Hero:**
> Seu próximo cliente está esperando resposta. O FluxBot já deu.

**Subheadline recomendada:**
> Agentes que atendem, qualificam leads e entram no seu CRM sozinhos — 24/7, em qualquer canal. Sem código.

---

## 6. Psicologia das Cores — 5 Caminhos

### Caminho 1 — Roxo/Azul atual
- **Percepção psicológica:** criatividade, tecnologia, modernidade. Em excesso: genérico.
- **Adequação B2B brasileiro:** média — associado mais a tech/startup do que a vendas.
- **Risco genérico:** ⚠️ ALTO. É a cor default de 80% das LPs de IA de 2024-25.
- **Risco imaturidade:** baixo isolado, alto no contexto de "mais uma IA roxa".
- **Relação com IA:** forte (associação cultural estabelecida).
- **Relação com vendas:** fraca — roxo não remete a conversão/dinheiro.
- **Relação com confiança:** média.
- **Continuidade com sistema atual:** total — zero custo de migração.

### Caminho 2 — Azul Enterprise
- **Percepção psicológica:** confiança, estabilidade, corporativo, segurança.
- **Adequação B2B brasileiro:** alta — azul é a cor dominante no enterprise brasileiro (bancos, SaaS B2B).
- **Risco genérico:** médio — Salesforce, HubSpot, Pipedrive são azuis. Familiar mas não único.
- **Risco imaturidade:** baixo.
- **Relação com IA:** média (menos associado a IA generativa).
- **Relação com vendas:** boa — azul é a cor de CRMs.
- **Relação com confiança:** ★★★★★
- **Continuidade:** média — exige refactor do design system.

### Caminho 3 — Verde/Teal (Confiança e Crescimento)
- **Percepção psicológica:** crescimento, dinheiro, saúde, confiança, inovação. Teal específico: sofisticado + fresco.
- **Adequação B2B brasileiro:** alta — verde = dinheiro/resultado no Brasil; teal = diferenciação.
- **Risco genérico:** BAIXO — pouquíssimos SaaS de automação conversacional usam teal como primária.
- **Risco imaturidade:** baixo — teal/verde profundo parece maduro.
- **Relação com IA:** boa — usado por produtos como Anthropic (verde) e Linear (para features de IA).
- **Relação com vendas:** ★★★★★ — verde é universalmente "conversão, crescimento, dinheiro".
- **Relação com confiança:** forte.
- **Continuidade:** requer mudança do design system (vale o diferencial).

### Caminho 4 — Preto/Branco Premium + Acento Forte
- **Percepção psicológica:** luxo, minimalismo, seriedade, premium.
- **Adequação B2B brasileiro:** média-alta para enterprise, baixa para PME que quer "tecnologia acessível".
- **Risco genérico:** baixo — Linear faz isso bem, mas poucos SaaS conversacionais usam.
- **Risco imaturidade:** baixo — é o caminho mais "sério" visualmente.
- **Relação com IA:** depende do acento (se o acento for verde/âmbar: boa).
- **Relação com vendas:** fraco isolado — precisa do acento para trazer energia.
- **Continuidade:** alto custo de refactor — tudo muda.

### Caminho 5 — Âmbar/Laranja (Ação e Conversão)
- **Percepção psicológica:** urgência, ação, energia, acessibilidade, calor.
- **Adequação B2B brasileiro:** média — funciona bem como accent (CTA), arriscado como primária.
- **Risco genérico:** médio — Replit, Helicone e alguns SaaS usam laranja/âmbar.
- **Risco imaturidade:** ⚠️ médio-alto como primária — pode parecer "agressivo" ou "barato" no B2B brasileiro.
- **Relação com IA:** fraca como primária.
- **Relação com vendas:** ★★★★★ para CTA — laranja/âmbar é comprovadamente a cor de maior conversão em botões.
- **Relação com confiança:** baixa como primária.
- **Continuidade:** alto custo.

### 🎨 Recomendação Visual Final

**Sistema de 3 cores:**

| Papel | Cor | Hex/Referência | Justificativa |
|---|---|---|---|
| **Primária** | Teal profundo | `#0D7377` ou `#0F766E` (Tailwind teal-700) | Único no nicho, remete a crescimento/dinheiro, maduro, diferencia do roxo-slop |
| **Accent/CTA** | Âmbar quente | `#D97706` ou `#F59E0B` (Tailwind amber-600/400) | Máxima conversão em botões, contraste alto, energia de ação |
| **Fundo** | Dark neutro profundo | `#0A0A0F` ou `#09090B` | Dark-mode refinado, não o preto absoluto |

**Tipografia sugerida:**
- Display: **Bricolage Grotesque** ou **Cabinet Grotesk** (personalidade, não genérica, gratuita via Google Fonts)
- Body: **Inter** (legibilidade comprovada) ou **Geist** (mais técnico)

**Gradientes:** usar com moderação — apenas no hero background e CTA final. Nunca em cards de feature (slop pattern). Gradiente: teal → teal-escuro, não teal → roxo.

**Vale alterar o sistema interno no futuro?**
Sim — quando houver capacidade de design system completo. Para a LP V2, aplicar os tokens novos apenas no `Landing.tsx` sem afetar o app, via override de CSS custom properties na raiz da landing. Isso permite testar a identidade nova sem refatorar o design system inteiro.

---

## 7. Blueprint Atualizado da LP V2

### Estrutura final (12 seções + nav + footer)

```
[NAV]     Logo | Recursos · Jornada · Preços · Docs | [Começar grátis]
[01 HERO]         Headline + sub + 2 CTAs + trust + mockup animado
[02 PROVA]        Faixa de logos + métrica agregada
[03 PROBLEMA]     3 dores nomeadas (resposta lenta, lead perdido, sem dado)
[04 JORNADA]      5 passos com screenshot real cada (scrollytelling)
[05 BUILDER/AI]   Builder canvas + AI Builder (diferencial único)
[06 CRM/INTEL]    Lead Intelligence + pipeline + forecast
[07 ANALYTICS]    Revenue Intelligence + tracking atribuído
[08 CANAIS]       Logos canais + integrações Connector Hub
[09 DEPOIMENTOS]  3 quotes com resultado % + métricas agregadas
[10 OBJEÇÕES]     FAQ accordion + selos LGPD/segurança
[11 CTA FINAL]    Headline de urgência suave + 2 CTAs
[FOOTER]          Links reais + institucional
```

### Headlines por seção

| Seção | Headline |
|---|---|
| Hero | Seu próximo cliente está esperando resposta. O FluxBot já deu. |
| Problema | Cada minuto sem resposta é uma venda que não vai acontecer. |
| Jornada | De zero a lead qualificado no CRM. Em minutos. |
| Builder | Monte visualmente. Ou descreva e deixe a IA montar. |
| CRM/Intel | O lead chega com score, contexto e próxima ação recomendada. |
| Analytics | De onde vêm suas conversões. Para onde vai sua receita. |
| Canais | Onde seus clientes estão. FluxBot já está lá. |
| CTA final | Seu primeiro agente no ar hoje. |

### Narrativa principal (arco completo)
```
PROBLEMA:   "Você perde leads toda noite. Não por falta de produto — por falta de resposta."
AGITAÇÃO:   "Lead sem resposta em 5min: 80% menos chance de fechar.
             Fim de semana, almoço, madrugada — o silêncio custa caro."
SOLUÇÃO:    "FluxBot atende na hora. Qualifica com IA. Lança no CRM. Sozinho."
PROVA:      [Jornada visual animada] + [depoimentos com %] + [métricas]
TRANSFORM:  "De caixa de entrada caótica a pipeline previsível.
             Você escolhe quando falar — o bot nunca para."
```

### Seções obrigatórias (não podem sair)
1. Jornada (5 passos) — resolve o gap #1 do audit
2. AI Builder — diferencial técnico único vs. todos os concorrentes
3. Lead Intelligence — diferencial CRM mais difícil de copiar
4. Prova social — bloqueador de conversão mais crítico hoje
5. FAQ + LGPD — objeções são o gargalo final para B2B brasileiro

### Assets prioritários para captura

| # | Asset | Tela | Prioridade |
|---|---|---|---|
| S1 | Builder com fluxo SDR | `/builder/:id` | 🔴 Crítico |
| S2 | AI Builder gerando fluxo | `/ai-builder` | 🔴 Crítico |
| S3 | PublicBot chat real | `/bot/:slug` | 🔴 Crítico |
| S4 | Lead Intelligence tab | `/leads/:id` | 🔴 Crítico |
| S5 | CRM pipeline | `/leads` | 🟡 Alta |
| S6 | Analytics KPIs | `/analytics` | 🟡 Alta |
| S7 | Revenue Intelligence | `/revenue` | 🟡 Alta |
| G1 | GIF: Builder drag-drop | — | 🔴 Crítico |
| G2 | GIF: AI Builder gerando | — | 🔴 Crítico |

### Motion graphics prioritários
| # | Asset | Tipo | Onde |
|---|---|---|---|
| M1 | Mockup do hero se montando | SVG path draw-on / Lottie | Hero |
| M2 | Linha conectando os 5 passos da Jornada | SVG animado | Jornada |
| M3 | Count-up de métricas | CSS/JS | Analytics e depoimentos |

---

## 8. Próxima Fase de Implementação

**Ordem recomendada (por impacto/esforço):**

1. **Tokens de cor/tipo** — override CSS custom properties só no `Landing.tsx` (teal + âmbar + tipografia)
2. **Hero** — headline nova + mockup animado (M1) + trust line com LGPD
3. **Jornada** — 5 passos com screenshots reais (S1-S4) + linha animada (M2)
4. **Builder/AI Builder** — seção dupla com GIFs (G1, G2)
5. **Prova social** — faixa de logos + 2-3 depoimentos (mesmo que sejam founders/beta users)
6. **CRM/Intelligence + Analytics** — screenshots S4-S7
7. **FAQ + LGPD** — accordion real + selos
8. **Nav/Footer** — corrigir todos os links mortos (usar rotas reais existentes: `/privacy`, `/terms`, `/templates`)
9. **Motion pass** — stagger, reveals on-scroll, hover states
10. **Design review** — gstack slop-scan

**O que NÃO implementar até ter assets reais:**
- Seções de produto com telas vazias (theater-of-data)
- Depoimentos inventados
- Métricas fabricadas

---

*Documento criado: 2026-06-03*
*Fontes: `fluxbot-features.md` (Phase 3–18.6), `ARCHITECTURE.md`, `README.md`*
*Próximo artefato: implementação da LP V2 (aguardando aprovação desta estratégia)*
