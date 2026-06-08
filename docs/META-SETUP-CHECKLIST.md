# META SETUP CHECKLIST
**FASE 27H — Execução manual passo a passo**

Execute na ordem. Cada etapa desbloqueia a próxima. Tempo total: ~90 minutos.

---

## PRÉ-REQUISITO — O que você precisa ter antes de começar

- [ ] Conta pessoal no Facebook (para acessar o Business Manager)
- [ ] Número de celular pessoal para testes de WhatsApp
- [ ] Supabase CLI instalado (`brew install supabase/tap/supabase`)
- [ ] Repositório clonado e terminal aberto na pasta do projeto

---

## ETAPA 1 — Criar Meta Business Manager

**Onde:** [business.facebook.com](https://business.facebook.com)

- [ ] Acessar [business.facebook.com/overview](https://business.facebook.com/overview)
- [ ] Clicar **"Criar conta"**
- [ ] Preencher: nome do negócio (ex: "Flux Agent Studio"), seu nome, e-mail comercial
- [ ] Confirmar e-mail se solicitado
- [ ] Anotar o **Business ID** (aparece em Configurações do Negócio → Informações do Negócio)

```
Business ID: _______________________________
```

---

## ETAPA 2 — Criar Meta App

**Onde:** [developers.facebook.com](https://developers.facebook.com)

- [ ] Acessar [developers.facebook.com/apps](https://developers.facebook.com/apps)
- [ ] Clicar **"Criar App"**
- [ ] Tipo de app: **"Outros"** → próximo
- [ ] Selecionar: **"Business"** → próximo
- [ ] Preencher:
  - Nome do app: `Flux Agent Studio`
  - E-mail de contato: seu e-mail
  - Business Manager: selecionar o criado na Etapa 1
- [ ] Clicar **"Criar App"**

Ao criar, você estará no painel do app:

- [ ] Ir em **Settings → Basic**
- [ ] Anotar **App ID** e **App Secret** (clicar "Show" para ver o secret)

```
App ID:     _______________________________
App Secret: _______________________________
```

- [ ] Em **App Mode** (topo da página): confirmar que está em **Development**
  > Modo Development é suficiente para testes com números cadastrados como destinatários.
  > Modo Live é necessário para receber mensagens de qualquer número.

---

## ETAPA 3 — Adicionar produto WhatsApp ao App

- [ ] No painel do app → **"Add a Product"** → encontrar **WhatsApp** → clicar **"Set Up"**
- [ ] Aceitar os termos de uso da WhatsApp Business Platform
- [ ] O Meta cria automaticamente:
  - Uma **WABA de teste** (WhatsApp Business Account)
  - Um **número de sandbox** (ex: +1 555-555-XXXX)
- [ ] Ir em **WhatsApp → API Setup**
- [ ] Anotar:

```
Phone Number ID:              _______________________________
WhatsApp Business Account ID: _______________________________
```

- [ ] Em **"Step 2: Send messages with the API"**:
  - Clicar **"Add phone number"** → adicionar SEU número pessoal como destinatário de teste
  - (O Meta vai pedir confirmação por OTP no seu celular)
- [ ] Gerar **Access Token temporário** (válido 24h):
  - Clicar no token exibido → copiar

```
Access Token (temporário): _______________________________
```

> Para produção: criar System User com token permanente (Etapa 7)

---

## ETAPA 4 — Adicionar produto Messenger ao App

- [ ] No painel do app → **"Add a Product"** → **Messenger** → **"Set Up"**
- [ ] Ir em **Messenger → Instagram Settings** (para Instagram DM)
- [ ] Ir em **Messenger → Settings** (para Facebook Messenger)

> A configuração de página e Instagram acontece na Etapa 6.

---

## ETAPA 5 — Deploy Supabase (código pronto)

```bash
# Na pasta do projeto:
supabase link --project-ref bgzczvsmfcnypwqveotx

# Verificar link correto
supabase status
# Deve mostrar: API URL = https://bgzczvsmfcnypwqveotx.supabase.co

# Aplicar migrations pendentes (meta_channels + meta_realtime)
supabase db push

# Deploy edge functions
supabase functions deploy meta-webhook --no-verify-jwt
supabase functions deploy meta-send

# Configurar secrets
supabase secrets set META_VERIFY_TOKEN=flux_meta_verify
supabase secrets set META_APP_SECRET=<App Secret da Etapa 2>
```

- [ ] `supabase link` OK
- [ ] `supabase db push` OK (confirmar tabelas `meta_channel_connections`, `meta_conversations`, `meta_messages` no Dashboard)
- [ ] `meta-webhook` deployada
- [ ] `meta-send` deployada
- [ ] `META_VERIFY_TOKEN` configurado
- [ ] `META_APP_SECRET` configurado

---

## ETAPA 6 — Configurar Webhook WhatsApp

**Onde:** Meta App → WhatsApp → Configuration → Webhook

- [ ] Em **"Webhook"** → clicar **"Edit"** (ou "Configure" se for a primeira vez)
- [ ] Preencher:
  - **Callback URL:** `https://bgzczvsmfcnypwqveotx.supabase.co/functions/v1/meta-webhook`
  - **Verify Token:** `flux_meta_verify`
- [ ] Clicar **"Verify and Save"**
  > O Meta vai fazer um GET na URL com `hub.challenge`. A edge function deve responder com o challenge. Deve aparecer ✅ verde.

- [ ] Em **"Webhook Fields"** → clicar **"Manage"**
- [ ] Ativar: **`messages`**
- [ ] Clicar **"Done"**

- [ ] Em **"Step 3: Configure webhooks"** → selecionar o número de teste → clicar **"Subscribe"**

```
Verificação: ✅ / ❌
```

---

## ETAPA 7 — Configurar Webhook Messenger e Instagram

**Onde:** Meta App → Messenger → Settings → Webhooks

- [ ] Em **Webhooks** → **"Add Callback URL"**
- [ ] Preencher o mesmo URL e Verify Token da Etapa 6
- [ ] **"Verify and Save"**
- [ ] Em **"Subscribed Fields"**: ativar `messages` e `messaging_postbacks`
- [ ] Em **"Subscribed Pages"**: selecionar sua página Facebook

Para Instagram:
- [ ] Messenger → Instagram Settings → Webhooks
- [ ] Mesma URL e token
- [ ] Campo: `messages`

---

## ETAPA 8 — Conectar Página Facebook

**Pré-requisito:** ter uma Página do Facebook criada com a sua conta.

- [ ] Se não tem uma página: [facebook.com/pages/create](https://www.facebook.com/pages/create) → criar página de negócio
- [ ] No Meta App → Messenger → Settings → **"Add or Remove Pages"**
- [ ] Selecionar sua página → confirmar permissões
- [ ] Anotar **Page ID** (visível em Configurações da Página → Informações da Página → ID da Página)

```
Page ID: _______________________________
```

---

## ETAPA 9 — Conectar Instagram

**Pré-requisito:** conta Instagram Business ou Creator, conectada à sua Página do Facebook.

Como conectar Instagram à Página:
- [ ] Ir em [facebook.com](https://facebook.com) → sua Página → Configurações → **Contas Vinculadas → Instagram**
- [ ] Conectar conta Instagram

No Meta App:
- [ ] Messenger → Instagram Settings → selecionar a conta Instagram conectada
- [ ] Anotar **Instagram User ID** (aparece na listagem)

```
Instagram User ID: _______________________________
```

---

## ETAPA 10 — Inserir Conexão no Banco (workaround OAuth)

No **Supabase Dashboard → Table Editor → `meta_channel_connections`**:

```sql
-- WhatsApp
INSERT INTO meta_channel_connections (
  workspace_id,
  platform,
  phone_number_id,
  waba_id,
  access_token,
  display_name,
  status
) VALUES (
  '<seu_workspace_id>',  -- ver auth.users na tabela workspace_members
  'whatsapp',
  '<Phone Number ID da Etapa 3>',
  '<WhatsApp Business Account ID da Etapa 3>',
  '<Access Token da Etapa 3>',
  'WhatsApp @vemfarias',
  'connected'
);

-- Instagram (após ter Instagram User ID)
INSERT INTO meta_channel_connections (
  workspace_id, platform, page_id, access_token, display_name, status
) VALUES (
  '<seu_workspace_id>',
  'instagram',
  '<Instagram User ID da Etapa 9>',
  '<Page Access Token>',
  'Instagram @vemfarias',
  'connected'
);
```

- [ ] Linha WhatsApp inserida
- [ ] Linha Instagram inserida (opcional para MVP)

---

## ETAPA 11 — Validar (testes curl)

```bash
# Teste 1 — hub challenge deve retornar o texto "PING"
curl -i "https://bgzczvsmfcnypwqveotx.supabase.co/functions/v1/meta-webhook\
?hub.mode=subscribe&hub.verify_token=flux_meta_verify&hub.challenge=PING"
# Esperado: HTTP 200, body = PING

# Teste 2 — HMAC inválido deve ser rejeitado
curl -i -X POST "https://bgzczvsmfcnypwqveotx.supabase.co/functions/v1/meta-webhook" \
  -H "Content-Type: application/json" \
  -H "x-hub-signature-256: sha256=invalido" \
  -d '{"object":"whatsapp_business_account","entry":[]}'
# Esperado: HTTP 401
```

- [ ] Teste 1: HTTP 200 ✅
- [ ] Teste 2: HTTP 401 ✅

---

## ETAPA 12 — Teste físico WhatsApp

- [ ] Enviar a mensagem **"oi"** do número pessoal cadastrado na Etapa 3 para o número de sandbox
- [ ] Aguardar 30 segundos e verificar:
  - [ ] Supabase → `meta_conversations` → nova linha criada
  - [ ] Supabase → `meta_messages` → linha com `direction = 'inbound'`
  - [ ] App → Conversas → conversa aparece com badge WhatsApp
  - [ ] App → Leads → lead criado com source `whatsapp`

---

## ETAPA 13 — Sistema User Token (produção, após testes)

O token temporário da Etapa 3 expira em 24h. Para produção:

- [ ] Business Manager → Configurações → **Usuários do Sistema**
- [ ] Criar **Usuário do Sistema** com função "Admin"
- [ ] Adicionar ao app: **Adicionar Ativo** → app criado → permissão "Gerenciar"
- [ ] Gerar token de longa duração: selecionar o app → permissões `whatsapp_business_messaging` + `whatsapp_business_management`
- [ ] Token gerado tem validade de **60 dias** (renovável)
- [ ] Atualizar no banco:

```bash
supabase secrets set WHATSAPP_SYSTEM_USER_TOKEN=<novo_token>
```

E atualizar `access_token` na tabela `meta_channel_connections`:
```sql
UPDATE meta_channel_connections
SET access_token = '<novo_token>'
WHERE platform = 'whatsapp' AND workspace_id = '<seu_workspace_id>';
```

---

## CREDENCIAIS — Mapa completo

| Credencial | Onde pegar | Obrigatório? | Usado em |
|-----------|-----------|-------------|----------|
| `META_APP_SECRET` | developers.facebook.com → App → Settings → Basic → App Secret | **SIM** | `supabase/functions/meta-webhook/index.ts` — validação HMAC |
| `META_VERIFY_TOKEN` | Você escolhe (ex: `flux_meta_verify`) | **SIM** | `supabase/functions/meta-webhook/index.ts` — hub challenge |
| `Phone Number ID` | Meta App → WhatsApp → API Setup | **SIM** | `meta_channel_connections.phone_number_id` → `meta-send` |
| `WhatsApp Business Account ID` | Meta App → WhatsApp → API Setup | **SIM** | `meta_channel_connections.waba_id` |
| `Access Token` (WhatsApp) | Meta App → WhatsApp → API Setup → gerar | **SIM** | `meta_channel_connections.access_token` → `meta-send` |
| `Business ID` | business.facebook.com → Configurações → ID do Negócio | Recomendado | System User Token, futuro billing |
| `App ID` | developers.facebook.com → App → Settings → Basic | Recomendado | OAuth futuro, CAPI |
| `Page ID` (Facebook) | Configurações da Página Facebook → ID da Página | Para Messenger | `meta_channel_connections.page_id` |
| `Instagram User ID` | Meta App → Messenger → Instagram Settings | Para Instagram DM | `meta_channel_connections.page_id` |
| `Page Access Token` | Meta App → Messenger → Generate Token | Para Messenger/Instagram | `meta_channel_connections.access_token` |
| `SUPABASE_URL` | Auto-injetado pelo runtime Supabase | SIM (auto) | `meta-webhook`, `meta-send` |
| `SUPABASE_SERVICE_ROLE_KEY` | Auto-injetado pelo runtime Supabase | SIM (auto) | `meta-webhook`, `meta-send` |

---

## Tempo total estimado

| Etapa | Tempo |
|-------|-------|
| 1–2: Business Manager + App | 20 min |
| 3–4: WhatsApp + Messenger setup | 15 min |
| 5: Deploy Supabase | 10 min |
| 6–7: Webhooks configurados | 15 min |
| 8–9: Página + Instagram | 15 min |
| 10: Inserir conexão no banco | 5 min |
| 11–12: Validação e teste físico | 10 min |
| **Total** | **~90 min** |

---

## Referências

- [META-BLOCKERS.md](./META-BLOCKERS.md) — diagnóstico dos bloqueadores
- [SUPABASE-DEPLOY-CHECKLIST.md](./SUPABASE-DEPLOY-CHECKLIST.md) — deploy completo
- `supabase/functions/meta-webhook/index.ts` — edge function pronta
- `supabase/functions/meta-send/index.ts` — edge function pronta
