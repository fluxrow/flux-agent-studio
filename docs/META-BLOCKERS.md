# META BLOCKERS — Diagnóstico Real
**FASE 27G — Auditado em 2026-06-08**
*Baseado em: META-INTEGRATION-AUDIT.md · META-SMOKE-TEST-PLAN.md · META-PHYSICAL-SMOKE-TEST-REPORT.md · OMNICHANNEL-VALIDATION.md*

---

## Respostas às 10 perguntas

| # | Pergunta | Resposta | Fonte |
|---|----------|----------|-------|
| 1 | Qual App Meta será usado? | ❌ **Não existe** — nenhum App ID, App Secret ou referência a app real no código | `META-INTEGRATION-AUDIT.md §6.1` |
| 2 | Qual Business Manager será usado? | ❌ **Não existe** — nenhuma referência a Business Manager ID | idem |
| 3 | Existe WABA? | ❌ **Não existe** — `WHATSAPP_BUSINESS_ACCOUNT_ID` não está em nenhum `.env` ou secret | idem |
| 4 | Existe número WhatsApp? | ❌ **Não existe** — `WHATSAPP_PHONE_NUMBER_ID` ausente; OAuth retorna `+55 11 xxxxx` aleatório (mock) | `src/oauth/providers.ts` |
| 5 | Existe página Facebook? | ❌ **Não existe** — `facebookProvider` retorna `fb_page_xxxx` aleatório (mock) | idem |
| 6 | Existe Instagram conectado? | ❌ **Não existe** — `instagramProvider` retorna `@handle_xxxx` aleatório (mock) | idem |
| 7 | Existe token válido? | ❌ **Não existe** — nenhum `access_token` real em nenhum secret, `.env` ou tabela do banco | `META-INTEGRATION-AUDIT.md §4.2` |
| 8 | Existe webhook configurado? | ❌ **Não** — edge functions `meta-webhook`/`meta-send` existem no código mas **não deployadas** (SUPABASE-DEPLOY-CHECKLIST confirma) | `SUPABASE-DEPLOY-CHECKLIST.md` |
| 9 | Existe callback configurado? | ❌ **Não** — nenhuma rota `/oauth/meta/callback` existe; `meta-oauth-callback` é ⚪ ROADMAP | `META-INTEGRATION-AUDIT.md §6.5` |
| 10 | Existe app em modo Live? | ❌ **Não** — sem App criado, impossível estar em modo Live | — |

**Score: 0 de 10 itens confirmados.**

---

## Bloqueadores

---

### BLOQUEADOR 1 — App Meta não existe

**Impacto:**
Sem App Meta, não é possível: gerar tokens, registrar webhooks, conectar WABA, conectar página Facebook, conectar Instagram, nem qualquer coisa relacionada à Meta API.

É o bloqueador raiz de toda a integração Meta.

**Como resolver:**
1. Acessar [developers.facebook.com](https://developers.facebook.com)
2. Criar novo App → tipo **"Business"**
3. Anotar: `App ID` e `App Secret` (Settings → Basic)
4. Adicionar produto **WhatsApp** ao app
5. Adicionar produto **Messenger** ao app (para Facebook + Instagram)
6. Configurar URL de callback do webhook (após deploy da edge function)

**Tempo estimado:** 20 minutos

---

### BLOQUEADOR 2 — WABA (WhatsApp Business Account) não existe

**Impacto:**
Sem WABA não há `phone_number_id`, sem `phone_number_id` não há como enviar nem receber mensagens pelo WhatsApp Cloud API.

**Como resolver:**
1. No Meta App criado → WhatsApp → API Setup
2. O Meta cria automaticamente uma WABA de teste com número sandbox
3. Para produção: conectar WABA real via Business Manager
4. Anotar: `Phone Number ID` e `WhatsApp Business Account ID`

**Tempo estimado:** 10 minutos (sandbox) · 1–7 dias (aprovação WABA de produção)

---

### BLOQUEADOR 3 — Tokens não existem

**Impacto:**
Sem token válido, `meta-send` não consegue enviar mensagens. A edge function faz `fetch(graph.facebook.com/v19.0/{phone_number_id}/messages)` com `Authorization: Bearer {token}` — sem token, retorna 401.

**Como resolver:**
1. No Meta App → WhatsApp → API Setup → gerar **Temporary Access Token** (sandbox, 24h)
2. Para produção: criar **System User** no Business Manager e gerar token de longa duração (60 dias)
3. Salvar como secret no Supabase: `supabase secrets set WHATSAPP_ACCESS_TOKEN=<token>`
4. Na tabela `meta_channel_connections`, salvar `access_token` criptografado por conexão

**Tempo estimado:** 15 minutos (token temporário) · 30 minutos (System User token)

---

### BLOQUEADOR 4 — Edge functions não deployadas

**Impacto:**
Sem `meta-webhook` deployada, o Meta não tem URL para enviar eventos de entrada. Sem URL pública, não é possível nem configurar o webhook no Meta App Dashboard.

**Como resolver:**
```bash
supabase link --project-ref bgzczvsmfcnypwqveotx
supabase db push
supabase functions deploy meta-webhook --no-verify-jwt
supabase functions deploy meta-send
supabase secrets set META_VERIFY_TOKEN=flux_meta_verify
supabase secrets set META_APP_SECRET=<App Secret do Meta>
```

**Tempo estimado:** 10 minutos

---

### BLOQUEADOR 5 — Migrations Meta não aplicadas

**Impacto:**
Sem `20260604000001_meta_channels.sql` no banco, as tabelas `meta_channel_connections`, `meta_conversations` e `meta_messages` não existem. A edge function `meta-webhook` ao receber uma mensagem tentará inserir em tabelas que não existem e retornará 500.

Sem `20260604000002_meta_realtime.sql`, o Realtime não dispara eventos para essas tabelas — o inbox não atualiza em tempo real.

**Como resolver:**
```bash
supabase db push
# aplica as 2 migrations pendentes
```

**Tempo estimado:** 2 minutos

---

### BLOQUEADOR 6 — OAuth Meta é mock (sem fluxo de conexão real)

**Impacto:**
O botão "Conectar WhatsApp/Instagram/Messenger" no app retorna um handle fake aleatório. Nenhum token real é salvo. A tabela `meta_channel_connections` fica vazia.

Isso bloqueia o fluxo multi-tenant: cada workspace precisaria conectar seu próprio canal via OAuth real.

**Como resolver (mínimo viável — contornar OAuth):**
- Inserir manualmente a conexão na tabela `meta_channel_connections` via Supabase Dashboard, com `phone_number_id` e `access_token` do número de teste
- Este workaround cobre o piloto @vemfarias

**Como resolver (definitivo):**
- Implementar `meta-oauth-callback` edge function
- Substituir `oauth/providers.ts` mocks por redirect real para `facebook.com/dialog/oauth`
- Estimativa: 4–6h de desenvolvimento

**Tempo estimado (workaround):** 5 minutos · **Definitivo:** 4–6h dev

---

### BLOQUEADOR 7 — Página Facebook e Instagram não estão conectadas

**Impacto:**
Sem página Facebook conectada ao app, Messenger não funciona. Sem conta Instagram Business conectada à página, Instagram DM não funciona.

**Como resolver:**
1. Meta App → Messenger → configurações → Add/Remove Pages → vincular sua página
2. Garantir que a página Facebook tem conta Instagram Business conectada
3. No app Meta, habilitar subscrição `messages` e `messaging_postbacks` para a página

**Tempo estimado:** 15 minutos

---

## Checklist Operacional Manual

Executar na ordem. Cada item desbloqueia o próximo.

### ETAPA 1 — Meta App (20 min)
- [ ] Acessar [developers.facebook.com](https://developers.facebook.com)
- [ ] Criar App → tipo "Business" → anotar **App ID** e **App Secret**
- [ ] Adicionar produto "WhatsApp" ao app
- [ ] Adicionar produto "Messenger" ao app

### ETAPA 2 — WhatsApp Sandbox (10 min)
- [ ] Meta App → WhatsApp → API Setup
- [ ] Anotar **Phone Number ID** (número de teste gerado automaticamente)
- [ ] Anotar **WhatsApp Business Account ID**
- [ ] Adicionar número pessoal como recipient de teste
- [ ] Gerar **Temporary Access Token** (válido 24h, suficiente para teste inicial)

### ETAPA 3 — Deploy Supabase (10 min)
```bash
supabase link --project-ref bgzczvsmfcnypwqveotx
supabase db push
supabase functions deploy meta-webhook --no-verify-jwt
supabase functions deploy meta-send
supabase secrets set META_VERIFY_TOKEN=flux_meta_verify
supabase secrets set META_APP_SECRET=<App Secret anotado na Etapa 1>
```
- [ ] `supabase link` executado
- [ ] `supabase db push` aplicou migrations (confirmar 3 tabelas Meta no Dashboard)
- [ ] `meta-webhook` deployada
- [ ] `meta-send` deployada
- [ ] Secrets configurados

### ETAPA 4 — Validar webhook (5 min)
```bash
# Teste 1 — hub challenge (deve retornar "TESTE123")
curl "https://bgzczvsmfcnypwqveotx.supabase.co/functions/v1/meta-webhook\
?hub.mode=subscribe&hub.verify_token=flux_meta_verify&hub.challenge=TESTE123"

# Teste 2 — HMAC inválido (deve retornar HTTP 401)
curl -X POST "https://bgzczvsmfcnypwqveotx.supabase.co/functions/v1/meta-webhook" \
  -H "x-hub-signature-256: sha256=invalido" \
  -H "Content-Type: application/json" \
  -d '{"object":"test","entry":[]}'
```
- [ ] Teste 1 retornou `TESTE123` com HTTP 200
- [ ] Teste 2 retornou HTTP 401

### ETAPA 5 — Registrar webhook no Meta (10 min)
- [ ] Meta App → WhatsApp → Configuration → Webhook
  - URL: `https://bgzczvsmfcnypwqveotx.supabase.co/functions/v1/meta-webhook`
  - Verify Token: `flux_meta_verify`
  - Clicar "Verify and Save" → deve mostrar ✅
- [ ] Subscrever campo `messages` no webhook

### ETAPA 6 — Inserir conexão no banco (5 min)
No Supabase Dashboard → Table Editor → `meta_channel_connections`:
```sql
INSERT INTO meta_channel_connections (
  workspace_id, platform, phone_number_id, access_token, status
) VALUES (
  '<seu_workspace_id>',
  'whatsapp',
  '<Phone Number ID da Etapa 2>',
  '<Access Token da Etapa 2>',
  'connected'
);
```
- [ ] Linha inserida na tabela `meta_channel_connections`

### ETAPA 7 — Teste físico WhatsApp (5 min)
- [ ] Enviar "oi" para o número de sandbox pelo celular
- [ ] Verificar em 30s: `meta_conversations` tem nova linha no Supabase
- [ ] Verificar: `meta_messages` tem linha com `direction = 'inbound'`
- [ ] Verificar: app → Conversas → conversa aparece
- [ ] Verificar: app → Leads → lead criado com source `whatsapp`

### ETAPA 8 — Página Facebook + Instagram (15 min, opcional para MVP)
- [ ] Meta App → Messenger → Add/Remove Pages → vincular página Facebook
- [ ] Garantir Instagram Business conectado à página
- [ ] Repetir Etapa 5 para Messenger (mesmo webhook URL, adicionar subscrições `messaging`)
- [ ] Testar DM no Instagram ou Messenger

---

## Resumo de Tempo

| Etapa | Tempo | Dependência |
|-------|-------|-------------|
| 1 — Criar App Meta | 20 min | Nenhuma |
| 2 — WhatsApp Sandbox | 10 min | App Meta criado |
| 3 — Deploy Supabase | 10 min | App Secret disponível |
| 4 — Validar webhook | 5 min | Deploy concluído |
| 5 — Registrar webhook no Meta | 10 min | Webhook validado |
| 6 — Inserir conexão no banco | 5 min | Migrations aplicadas |
| 7 — Teste físico WhatsApp | 5 min | Tudo acima |
| 8 — Facebook/Instagram | 15 min | Opcional |
| **Total MVP WhatsApp** | **~65 min** | — |
| **Total com IG/Messenger** | **~80 min** | — |

---

## O que está pronto no código (não precisa tocar)

| Componente | Status |
|-----------|--------|
| `supabase/functions/meta-webhook/index.ts` | ✅ HMAC fail-closed, hub challenge, parsing de mensagens |
| `supabase/functions/meta-send/index.ts` | ✅ conversation_id resolvido, proxy para Graph API |
| `supabase/migrations/20260604000001_meta_channels.sql` | ✅ 3 tabelas + RLS + RPCs |
| `supabase/migrations/20260604000002_meta_realtime.sql` | ✅ Realtime publication |
| `src/hooks/useMetaLeadBridge.ts` | ✅ CRM automático via Realtime INSERT |
| `src/hooks/useMetaConversations.ts` | ✅ Inbox em tempo real |

**Tudo que precisa acontecer é operacional — não é desenvolvimento.**

---

## Referências

- [SUPABASE-DEPLOY-CHECKLIST.md](./SUPABASE-DEPLOY-CHECKLIST.md) — deploy completo do Supabase
- [META-INTEGRATION-AUDIT.md](./META-INTEGRATION-AUDIT.md) — auditoria de código Meta
- [META-SMOKE-TEST-PLAN.md](./META-SMOKE-TEST-PLAN.md) — 12 testes após deploy
- [META-PHYSICAL-SMOKE-TEST-REPORT.md](./META-PHYSICAL-SMOKE-TEST-REPORT.md) — histórico de bloqueios anteriores
