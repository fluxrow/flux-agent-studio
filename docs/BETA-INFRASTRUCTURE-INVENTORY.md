# BETA INFRASTRUCTURE INVENTORY
**FASE 27B.1 — Criado em 2026-06-05**

> Inventário completo de credenciais e integrações necessárias para colocar o
> Flux Agent Studio em operação real. Baseado em leitura direta do código-fonte,
> `.env`, migrations e documentação técnica existente.
>
> Classificação: **[OBR]** Obrigatório · **[REC]** Recomendado · **[OPC]** Opcional

---

## 1. Supabase

### Projeto atual

| Campo | Valor |
|-------|-------|
| Project Ref | `bgzczvsmfcnypwqveotx` |
| URL | `https://bgzczvsmfcnypwqveotx.supabase.co` |
| Publishable Key | `sb_publishable_PmE7AwBoVZIk0pXDs5eWbA_zH2tgQUq` |
| Região | Não confirmada (projeto não acessível via MCP desta sessão) |
| `VITE_USE_SUPABASE` | `true` (default no runtime-config) |

### Variáveis de ambiente (.env)

| Variável | Status | Classificação |
|---------|--------|--------------|
| `VITE_SUPABASE_URL` | ✅ Configurada | [OBR] |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | ✅ Configurada | [OBR] |
| `VITE_SUPABASE_PROJECT_ID` | ✅ Configurada | [OBR] |
| `VITE_USE_SUPABASE` | Default `true` via runtime-config | [OBR] |

### Secrets das Edge Functions (configurar no Dashboard → Edge Functions → Secrets)

| Secret | Valor | Classificação |
|--------|-------|--------------|
| `META_VERIFY_TOKEN` | `flux_meta_verify` (valor fixo) | [OBR] — sem isso webhook Meta não verifica |
| `META_APP_SECRET` | App Secret do Meta App (Settings → Basic) | [OBR] — sem isso HMAC retorna 401 para todos os payloads |
| `SUPABASE_URL` | Auto-injetado pelo runtime | — |
| `SUPABASE_SERVICE_ROLE_KEY` | Auto-injetado pelo runtime | — |

### Migrations pendentes de aplicação

| Arquivo | Status | Conteúdo |
|---------|--------|----------|
| `20260602114630_*.sql` | ❓ Desconhecido — projeto inacessível | Schema base: workspaces, bots, leads, sessions, RLS helpers |
| `20260602114654_*.sql` | ❓ Desconhecido | Complementos schema |
| `20260602120256_*.sql` | ❓ Desconhecido | Complementos schema |
| `20260602121119_*.sql` | ❓ Desconhecido | Complementos schema |
| `20260602122138_*.sql` | ❓ Desconhecido | Complementos schema |
| `20260604000001_meta_channels.sql` | **PENDENTE** | 3 tabelas Meta + RLS + 2 RPCs SECURITY DEFINER |
| `20260604000002_meta_realtime.sql` | **PENDENTE** | ALTER PUBLICATION supabase_realtime para tabelas Meta |

**Comando para aplicar:**
```bash
supabase link --project-ref bgzczvsmfcnypwqveotx
supabase db push
```

### Edge Functions pendentes de deploy

| Function | verify_jwt | Status | Notas |
|----------|-----------|--------|-------|
| `meta-webhook` | `false` — Meta não envia JWT | **PENDENTE** | Recebe webhooks WhatsApp/IG/Messenger |
| `meta-send` | `true` | **PENDENTE** | Proxy outbound para Meta Graph API |

**Comando para deploiar:**
```bash
supabase functions deploy meta-webhook --no-verify-jwt
supabase functions deploy meta-send
```

---

## 2. OpenAI

### Estado atual

Todos os três providers (`openai`, `anthropic`, `gemini`) usam `buildMockProvider()` em `src/ai/providers/index.ts`. Nenhuma chamada real à API acontece hoje.

### O que é necessário

| Item | Classificação | Detalhe |
|------|--------------|---------|
| `OPENAI_API_KEY` | [OBR] para IA real | Obter em platform.openai.com → API Keys |
| Modelo padrão | `gpt-4o-mini` | Melhor custo-benefício para qualificação de leads |
| Modelo premium | `gpt-4o` | Para análise complexa / blueprints detalhados |

### Variável necessária

```
# NÃO usar VITE_OPENAI_API_KEY — expõe a chave no frontend
# Usar como secret da Edge Function ou via backend
OPENAI_API_KEY=sk-proj-...
```

**Atenção:** o plano técnico em `docs/OPENAI-IMPLEMENTATION-PLAN.md` usa `import.meta.env.VITE_OPENAI_API_KEY` — isso expõe a chave no bundle. O correto é criar uma Edge Function proxy ou usar o backend Supabase como intermediário.

### Custo estimado (gpt-4o-mini)

| Operação | Tokens médios | Custo por conversa |
|---------|--------------|-------------------|
| Qualificação (10 turnos) | ~3.000 tokens | ~$0.0015 |
| Blueprint de bot | ~2.000 tokens | ~$0.0010 |
| Extração de dados | ~1.000 tokens | ~$0.0005 |
| **100 leads/dia** | ~300.000 tokens/dia | **~$0.15/dia (~$4,50/mês)** |

### Ambiente

| Ambiente | Recomendação |
|---------|-------------|
| Beta (< 50 leads/dia) | `gpt-4o-mini` — custo irrelevante |
| Produção (> 500 leads/dia) | `gpt-4o-mini` para qualificação, `gpt-4o` apenas para blueprints |
| Limite de gasto | Configurar `Usage Limits` no OpenAI Dashboard (ex: $20/mês hard cap) |

---

## 3. Meta

### Estrutura de contas necessária

```
Conta Facebook Pessoal (do owner)
  └── Meta Business Manager
        ├── Meta App (tipo: Business)
        │     ├── Produto: WhatsApp Business API
        │     ├── Produto: Instagram Basic Display ou Messenger
        │     └── Produto: Webhooks
        ├── Facebook Page (necessária para IG + Messenger)
        │     └── Conectada à conta Instagram Business/Creator
        └── WhatsApp Business Account (WABA)
              └── Número de telefone registrado
```

### Credenciais por plataforma

#### WhatsApp Business API (Cloud API)

| Credencial | Onde obter | Classificação |
|-----------|-----------|--------------|
| `access_token` | Meta Business Suite → System User → Gerar Token → permissão `whatsapp_business_messaging` | [OBR] |
| `phone_number_id` | Meta App Dashboard → WhatsApp → Getting Started → Phone Number ID | [OBR] |
| `META_APP_SECRET` | Meta App Dashboard → Settings → Basic → App Secret | [OBR] |
| `META_VERIFY_TOKEN` | Valor livre — usar `flux_meta_verify` | [OBR] |

**Sandbox disponível:** o WhatsApp Cloud API oferece 5 números de teste sem aprovação. Ideal para beta.

**Aprovação para produção:** submeter Business Verification no Meta Business Manager. Prazo: 1–4 semanas.

#### Instagram Messaging

| Credencial | Onde obter | Classificação |
|-----------|-----------|--------------|
| `access_token` | Page token com permissão `instagram_manage_messages` | [OBR] |
| `page_id` | Facebook Page → About → Page ID | [OBR] |
| `ig_user_id` | Graph API: `GET /me?fields=instagram_business_account` | [OPC] |

**Pré-requisito:** conta Instagram conectada como Business ou Creator à Facebook Page. Permissão `instagram_manage_messages` requer aprovação Meta App Review (1–2 semanas para apps em produção; sandbox dispensa).

#### Messenger

| Credencial | Onde obter | Classificação |
|-----------|-----------|--------------|
| `access_token` | Mesmo token da Page usado para Instagram | [OBR] |
| `page_id` | Mesmo da Page | [OBR] |

**Pré-requisito:** permissão `pages_messaging`. Sem approval em sandbox/desenvolvimento.

### Configuração de Webhooks

| Campo | Valor |
|-------|-------|
| URL | `https://bgzczvsmfcnypwqveotx.supabase.co/functions/v1/meta-webhook` |
| Verify Token | `flux_meta_verify` |
| Campos (WA) | `messages` |
| Campos (IG) | `messages` |
| Campos (Messenger) | `messages` |

**Onde configurar:** Meta App Dashboard → cada produto → Webhooks → Edit Subscription

### Fluxo de aprovação resumido

```
Hoje (sandbox)        → WhatsApp: 5 números de teste disponíveis imediatamente
                       → Messenger: disponível em desenvolvimento sem aprovação
                       → Instagram: disponível para contas de teste sem aprovação

Beta (< 1.000 msg/dia) → WhatsApp: requerer aprovação de Business Verification
Semana 1–4            → Aguardar aprovação Meta

Produção              → Todos os canais com rate limits elevados
```

---

## 4. ManyChat

### Contexto

ManyChat é mencionado como competidor posicionado na Landing Page e no PROJECT-CONSTITUTION. **Não existe integração ManyChat implementada no produto** — é um concorrente, não um parceiro de integração.

### Posicionamento vs. ManyChat

| ManyChat | Flux Agent Studio |
|---------|------------------|
| Broadcast e marketing (disparos em massa) | Qualificação individual e CRM |
| Sem pipeline de vendas integrado | Pipeline completo com score automático |
| Sem attribution de receita | Revenue + Attribution por campanha |
| Fechado, sem programa de parceiros | Roadmap de parceiros setoriais |

### Integração recomendada (se o cliente já usa ManyChat)

Se um lead vem via ManyChat e precisa entrar no Flux:

**Opção A — Webhook de saída:** configurar no ManyChat um "External Request" (webhook) que dispara ao final de uma sequência. O Flux recebe o payload via Connector Hub (webhook adapter real em `src/connectors/adapters/webhook.ts`) e cria o lead manualmente ou via API.

**Opção B — Handoff de canal:** o bot ManyChat termina enviando um link do bot Flux (`/bot/vemfarias`). O lead continua a qualificação no Flux e entra no CRM.

**Webhooks necessários (se Opção A):**

| Endpoint | Método | Payload esperado |
|---------|--------|-----------------|
| `https://<PROJECT>.supabase.co/functions/v1/meta-webhook` | POST | JSON com contato + dados coletados |
| Ou URL pública do bot Flux | GET | Link com UTM params |

**Classificação:** [OPC] — não é necessário para beta com @vemfarias.

---

## 5. @vemfarias — Fluxo de Validação Beta

### Fluxo recomendado (estado atual do produto)

```
[ENTRADA]
Anúncio Meta / Stories / Link de bio
        ↓
Link do bot Flux no bio do Instagram
(https://bgzczvsmfcnypwqveotx.supabase.co/bot/vemfarias?utm_campaign=mentoria)
        ↓
[QUALIFICAÇÃO — Bot Web]
"Qual seu maior desafio profissional hoje?"
"Já tentou resolver de alguma forma?"
"Qual seu nível de investimento para mentoria? (R$1k–3k / R$3k–8k / R$8k+)"
"Deixa seu WhatsApp para eu enviar mais informações"
        ↓
[CRM]
Lead criado automaticamente no pipeline (stage: Novo)
Score calculado: fonte anúncio + perguntas respondidas + WhatsApp informado ≈ 75–85
        ↓
[AGENDAMENTO]
Último bloco do bot exibe:
"Quer agendar uma sessão gratuita de 30 min? [Link Calendly/Cal.com]"
        ↓
[@vemfarias no CRM]
Ver leads com score > 70 → priorizar para follow-up
Pipeline: Novo → Qualificado → Em Negociação → Convertido
        ↓
[FECHAMENTO]
Mover lead para "Convertido" manualmente após pagamento
Registrar valor da mentoria no campo de receita
```

### Quando WhatsApp estiver deployado

```
[ENTRADA ALTERNATIVA]
Anúncio "Click-to-WhatsApp" no Meta Ads
        ↓
Mensagem automática abre no WhatsApp do número cadastrado
        ↓
meta-webhook recebe → store_meta_inbound() → meta_conversations criada
        ↓
useMetaLeadBridge() detecta nova conversa → Lead criado no CRM (source: whatsapp)
        ↓
[INBOX]
@vemfarias ou agente responde via Flux → Conversas
Handoff Bot → Humano → Resolvido
```

### Critério de sucesso mínimo para beta

| Critério | Canal | Status |
|---------|-------|--------|
| Lead entra no CRM automaticamente | Web Widget | ✅ Funcional (com Supabase ativo) |
| Score calculado corretamente | Todos | ✅ Funcional |
| Pipeline visível com Kanban | Todos | ✅ Funcional |
| IA qualifica com perguntas reais | Web | ❌ Mock — precisa de `OPENAI_API_KEY` |
| WhatsApp inbound → CRM | WhatsApp | ❌ Deploy pendente |
| Instagram DM → CRM | Instagram | ❌ Deploy + aprovação Meta pendente |
| Follow-up automático | Todos | ❌ Não implementado (roadmap) |
| Agendamento integrado | Todos | ❌ Workaround: link Calendly |

---

## 6. Checklist Operacional

### [OBR] Obrigatórios — sem estes o produto não funciona em produção

```
[ ] 1. Aplicar migrations no Supabase (supabase db push)
[ ] 2. Confirmar VITE_USE_SUPABASE=true no ambiente de deploy
[ ] 3. Deploy Edge Function meta-webhook (--no-verify-jwt)
[ ] 4. Deploy Edge Function meta-send
[ ] 5. Configurar secret META_VERIFY_TOKEN=flux_meta_verify
[ ] 6. Configurar secret META_APP_SECRET=<app_secret_do_meta>
[ ] 7. Criar Meta App com produto WhatsApp adicionado
[ ] 8. Registrar webhook URL no Meta App Dashboard + verificar hub.challenge
[ ] 9. Conectar canal WhatsApp via MetaConnectModal no app
        (access_token + phone_number_id)
[ ] 10. Testar: enviar mensagem de celular real → verificar em meta_conversations
```

### [REC] Recomendados — habilitam IA real e fluxo @vemfarias completo

```
[ ] 11. Criar OpenAI API Key (platform.openai.com)
[ ] 12. Implementar src/ai/providers/openai.ts (plano em OPENAI-IMPLEMENTATION-PLAN.md)
        (troca de ~50 linhas, XS de esforço)
[ ] 13. Configurar OPENAI_API_KEY como secret em Edge Function intermediária
        (NUNCA como VITE_* — expõe no frontend)
[ ] 14. Criar bot de qualificação para @vemfarias no AI Builder
        (perguntas: desafio, tentativas, investimento, WhatsApp)
[ ] 15. Publicar bot em /bot/vemfarias
[ ] 16. Adicionar link do bot no bio do Instagram do @vemfarias
[ ] 17. Configurar UTM params: ?utm_source=instagram&utm_campaign=mentoria-beta
[ ] 18. Configurar limite de gasto na OpenAI ($20/mês hard cap)
```

### [OPC] Opcionais — melhoram experiência mas não são bloqueadores para beta

```
[ ] 19. Configurar Instagram Messaging (access_token + page_id)
        → DMs do Instagram entram no inbox diretamente
[ ] 20. Configurar Messenger
[ ] 21. Integrar Calendly/Cal.com via link no último bloco do bot
[ ] 22. Configurar webhook Supabase → Zapier/Make para follow-up automático
        (Zapier gratuito suporta 100 tasks/mês — suficiente para beta)
[ ] 23. Submeter Business Verification no Meta Business Manager
        (necessário para WhatsApp produção, pular em sandbox/beta)
[ ] 24. Configurar Realtime no Supabase Dashboard → Database → Replication
        (confirmar meta_conversations e meta_messages na publicação)
[ ] 25. Configurar domínio customizado no deploy (ex: app.fluxagent.studio)
```

---

## Resumo de prioridade

| # | Item | Tempo estimado | Impacto |
|---|------|---------------|---------|
| P0 | `supabase db push` | 5 min | Tabelas Meta disponíveis |
| P0 | Deploy Edge Functions | 10 min | Webhook funcional |
| P0 | Configurar secrets META | 5 min | HMAC ativo |
| P0 | Registrar webhook no Meta App | 15 min | Inbound funcionando |
| P0 | Conectar WhatsApp no app | 5 min | Primeiro canal real |
| P1 | Implementar OpenAI real | 2–3h | IA funcional (não mock) |
| P1 | Bot @vemfarias + publicar | 2–4h | Operação real começa |
| P2 | Instagram DM + Messenger | 1h setup + 1–2 semanas aprovação | Canais adicionais |
| P2 | Follow-up automático (Zapier) | 1–2h | Re-engajamento automático |

**Tempo para beta mínimo funcional:** ~40 minutos de configuração + bot @vemfarias em 2–4 horas.

---

## Referências cruzadas

- [MASTER-ROADMAP.md](./MASTER-ROADMAP.md)
- [META-CHANNELS-IMPLEMENTATION-REPORT.md](./META-CHANNELS-IMPLEMENTATION-REPORT.md)
- [META-PHYSICAL-SMOKE-TEST-REPORT.md](./META-PHYSICAL-SMOKE-TEST-REPORT.md)
- [OPENAI-IMPLEMENTATION-PLAN.md](./OPENAI-IMPLEMENTATION-PLAN.md)
- [VEMFARIAS-OPERATION.md](./VEMFARIAS-OPERATION.md)
- [30-DAY-EXECUTION-PLAN.md](./30-DAY-EXECUTION-PLAN.md)
