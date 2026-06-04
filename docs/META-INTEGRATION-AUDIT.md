# FASE R2 — Meta Integration Audit

Auditoria de toda a superfície Meta (WhatsApp Cloud API, Instagram Graph, Messenger Platform, Pixel + CAPI) atualmente existente no código.

**Metodologia:** leitura estática de `src/channels/*`, `src/oauth/*`, `src/tracking/destinations/*`, `src/connectors/*`, `supabase/functions/*` e referências cruzadas via `rg`. Nenhum código foi alterado.

**Legenda:**
- 🟢 **REAL** — envia/recebe dados de verdade contra a Meta em produção.
- 🟡 **PARCIAL** — contrato existe e dispara eventos internos, mas não fala com a Meta.
- 🔴 **MOCK** — placeholder com retorno fake (`Math.random`, `console.info`).
- ⚪ **ROADMAP** — documentado/planejado, sem nenhum código.

---

## 1. WhatsApp — o que existe?

| Camada | Arquivo | Status | Observações |
|---|---|---|---|
| ChannelAdapter | `src/channels/stubs.ts` (`whatsappChannel`) | 🟡 PARCIAL | `send()` faz `console.info("[whatsapp/stub] would send")`. `receive()` apenas emite `message_received` no `channelBus`. Não há transporte. |
| Registro no engine | `src/channels/index.ts` (`bootChannels`) | 🟢 REAL | Adapter é registrado; inspector mostra "connected". |
| OAuth Provider | `src/oauth/providers.ts` (`whatsappProvider`) | 🔴 MOCK | `connect()` faz `sleep(450)` e devolve handle aleatório (`+55 11 xxxxx`). `meta: { mock: true }`. |
| ConnectedAccount type | `src/types/connectedAccount.ts` | 🟢 REAL | Tipo `OAuthProviderId = "whatsapp" \| …` definido. |
| UI Channel card | `src/pages/Channels.tsx`, `ChannelCard` | 🟡 PARCIAL | Mostra status e label, mas botão Connect chama o provider mock. |
| Settings → ConnectedAccountsPanel | `src/components/settings/ConnectedAccountsPanel.tsx` | 🟡 PARCIAL | Lista contas conectadas; persistência local via `oauth/store`. |
| Webhook receiver (Cloud API) | — | ⚪ ROADMAP | **Não existe** nenhuma edge function. `supabase/functions/` está vazio. |
| Verify token / `hub.challenge` | — | ⚪ ROADMAP | Nenhuma referência a `hub.verify_token` no repo. |
| Envio via Graph API (`/messages`) | — | ⚪ ROADMAP | Nenhum `fetch("graph.facebook.com")` para mensagens. |
| Templates HSM | — | ⚪ ROADMAP | Tipo `ChannelMessageKind = "template"` existe (`channels/types.ts`) mas sem catálogo nem envio. |
| Mapeamento de mídia (image/audio/file) | `src/channels/types.ts` | 🟡 PARCIAL | Contrato pronto, sem upload para `media` endpoint. |

---

## 2. Instagram — o que existe?

| Camada | Arquivo | Status | Observações |
|---|---|---|---|
| ChannelAdapter | `src/channels/stubs.ts` (`instagramChannel`) | 🟡 PARCIAL | Mesmo padrão de stub; `send()` apenas loga. |
| OAuth Provider | `src/oauth/providers.ts` (`instagramProvider`) | 🔴 MOCK | Retorna `@handle_xxxx` aleatório. Label: "Instagram Business". |
| UI / Channels page | `src/pages/Channels.tsx` | 🟡 PARCIAL | Renderiza card; conexão é mock. |
| Webhook IG DM | — | ⚪ ROADMAP | Sem edge function para `instagram` webhook. |
| Subscribed fields (`messages`, `messaging_postbacks`) | — | ⚪ ROADMAP | Não há configuração de App Subscriptions. |
| Story mentions / Comments | — | ⚪ ROADMAP | Tipo `ChannelMessageKind` não cobre `story_reply` nem `comment`. |
| Envio via Graph (`/me/messages`) | — | ⚪ ROADMAP | Inexistente. |
| Identidade IGSID ↔ Lead | — | ⚪ ROADMAP | Sem `contact_identities`; ver `OMNICHANNEL-VALIDATION.md` Q2/Q3. |

---

## 3. Messenger (Facebook Page) — o que existe?

| Camada | Arquivo | Status | Observações |
|---|---|---|---|
| ChannelAdapter | `src/channels/stubs.ts` (`messengerChannel`) | 🟡 PARCIAL | Stub idêntico aos demais. |
| OAuth Provider | `src/oauth/providers.ts` (`facebookProvider`) | 🔴 MOCK | Devolve `fb_page_xxxx`. Descrição menciona "Messenger inbox". |
| Page access token storage | — | ⚪ ROADMAP | `oauth/store.ts` guarda `accountIdentifier` mas não token real (vault não populado). |
| Webhook (`/webhook/messenger`) | — | ⚪ ROADMAP | Não existe edge function. |
| Send API (`/me/messages?access_token=…`) | — | ⚪ ROADMAP | Nada implementado. |
| Persistent menu / Get started | — | ⚪ ROADMAP | Inexistente. |
| Handover Protocol | — | ⚪ ROADMAP | Inexistente. |

---

## 4. Adapters existentes (mapa)

### 4.1 Canais (`src/channels/`)

| Adapter | id | status declarado | Implementação real? |
|---|---|---|---|
| `webChannel` | `web` | `active` | 🟢 REAL — usa `recordPublicMessage`, persiste em `messages`. |
| `whatsappChannel` | `whatsapp` | `stub` | 🟡 PARCIAL (stub). |
| `instagramChannel` | `instagram` | `stub` | 🟡 PARCIAL (stub). |
| `messengerChannel` | `messenger` | `stub` | 🟡 PARCIAL (stub). |
| `telegramChannel` | `telegram` | `stub` | 🟡 PARCIAL (stub). |
| TikTok | `tiktok` (no `ChannelId`) | — | ⚪ ROADMAP (tipo existe, adapter não). |

### 4.2 OAuth Providers (`src/oauth/providers.ts`)

Todos são `makeStub(…)`. Sequência:
- `instagramProvider` 🔴 MOCK
- `facebookProvider` 🔴 MOCK
- `whatsappProvider` 🔴 MOCK
- `telegramProvider` 🔴 MOCK
- `gbpProvider` 🔴 MOCK

Nenhum faz redirect OAuth real; nenhum troca `code` por `access_token`; nenhum chama `/oauth/access_token` da Meta.

### 4.3 Tracking Destinations (`src/tracking/destinations/`)

| Adapter | Status | Detalhe |
|---|---|---|
| `metaAdapter` (Pixel + CAPI) | 🟡 PARCIAL → 🟢 REAL condicional | `meta.ts` faz `POST graph.facebook.com/v19.0/{pixelId}/events` com `access_token` no body. Funciona se o usuário fornecer `pixelId` + `accessToken` via `CredentialsPanel`. Em modo `mock: true` (default), apenas registra dispatch. **Esta é a única integração Meta com código de transporte real no repo.** |
| `googleAdapter` | — | fora do escopo. |
| outros (n8n, webhook, linkedin, tiktok) | 🔴 MOCK / ⚪ ROADMAP | stubs. |

---

## 5. Endpoints existentes

### 5.1 Edge Functions (`supabase/functions/`)

**Nenhuma.** Diretório vazio. Não há:
- `whatsapp-webhook`
- `instagram-webhook`
- `messenger-webhook`
- `meta-oauth-callback`
- `meta-capi-relay`

### 5.2 URLs de webhook expostos pela LP

Inexistentes. O `Settings → Channels` não mostra "Callback URL" para colar no Meta App.

### 5.3 Chamadas saintes para Meta

| Origem | URL | Propósito | Status |
|---|---|---|---|
| `src/tracking/destinations/meta.ts` | `https://graph.facebook.com/v19.0/{pixelId}/events` | CAPI server-side | 🟢 REAL (quando credenciais existem) |
| Qualquer outro arquivo | — | — | nenhuma |

### 5.4 Inbound (Meta → app)

Nenhum endpoint público recebe payload do Meta hoje. O `recordPublicMessage` em `src/lib/public-runtime.ts` é alimentado apenas pelo widget web (`/bot/:slug`).

---

## 6. O que falta para Meta Cloud API funcionar?

Para uma integração ponta-a-ponta de **WhatsApp Cloud API** (template aplicável quase 1:1 para IG/Messenger), faltam as seguintes peças. Cada item é hoje ⚪ ROADMAP, salvo indicação.

### 6.1 Infraestrutura de credenciais
- [ ] App Meta criado (App ID, App Secret, Verify Token, System User Token de longa duração).
- [ ] Secrets no Lovable Cloud:
  - `META_APP_ID`, `META_APP_SECRET`
  - `META_VERIFY_TOKEN` (escolhido por nós, validado no GET do webhook)
  - `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_BUSINESS_ACCOUNT_ID`
  - `META_SYSTEM_USER_TOKEN` (ou per-tenant via tabela `meta_connections`).
- [ ] Tabela `meta_connections (workspace_id, channel, phone_number_id, page_id, ig_user_id, access_token_encrypted, expires_at, status)` com RLS + GRANTs.

### 6.2 Webhook de entrada (Edge Function)
- [ ] `supabase/functions/whatsapp-webhook/index.ts`
  - **GET**: validar `hub.mode=subscribe` + `hub.verify_token` + ecoar `hub.challenge`.
  - **POST**: validar assinatura `X-Hub-Signature-256` com `META_APP_SECRET` (HMAC-SHA256).
  - Parsear `entry[].changes[].value.messages[]` e `statuses[]`.
  - Idempotência por `message.id` (Meta reentrega).
  - Chamar um novo `recordChannelMessage({channel:"whatsapp", externalId, from, to, body, attachments})` e empilhar no `channelBus`.
- [ ] Análogos: `instagram-webhook`, `messenger-webhook` (mesma assinatura HMAC, schemas diferentes).
- [ ] `config.toml` para cada função com `verify_jwt = false` (webhook público).

### 6.3 Envio de mensagens (outbound)
- [ ] Substituir o `whatsappChannel.send` stub por chamada a `POST https://graph.facebook.com/v20.0/{phone_number_id}/messages` com `Authorization: Bearer {token}`.
- [ ] Suporte aos tipos do `ChannelMessageKind`: `text`, `buttons` (interactive button), `quick_reply` (interactive list), `image/video/audio/file` (via `media_id` ou `link`), `template` (HSM com `language` + `components`).
- [ ] Upload de mídia: `POST /{phone_number_id}/media` antes de mandar.
- [ ] Rate-limit e retry com backoff exponencial; classificar erros `131000+`.

### 6.4 Identidade & Persistência
- [ ] Tabela `contact_identities (workspace_id, channel, external_id, lead_id)` para mapear `wa_id` / `igsid` / `psid` → `lead`.
- [ ] Função `resolveOrCreateLead(channel, externalId, profile)` reutilizada pelos 3 webhooks.
- [ ] `dedupe_key` em `leads` (ver `OMNICHANNEL-VALIDATION.md`).
- [ ] `messages.channel_message_id` (id da Meta) para idempotência.

### 6.5 OAuth real (substituir mocks)
- [ ] Trocar `oauth/providers.ts` mocks por fluxo "Embedded Signup" / "Facebook Login for Business":
  - rota `/oauth/meta/start` → redirect para `https://www.facebook.com/v20.0/dialog/oauth?...`
  - edge function `meta-oauth-callback` → troca `code` por `access_token` em `https://graph.facebook.com/v20.0/oauth/access_token`
  - listar Pages / WABAs / IG accounts do usuário e persistir escolha em `meta_connections`.
- [ ] Refresh do token longo (60d) via `fb_exchange_token`.

### 6.6 Subscrições e descoberta
- [ ] Após conectar: `POST /{waba_id}/subscribed_apps`, `POST /{page_id}/subscribed_apps?subscribed_fields=messages,messaging_postbacks`, `POST /{ig_user_id}/subscribed_apps`.
- [ ] Salvar `display_phone_number`, `verified_name`, `quality_rating`.

### 6.7 Templates HSM (WhatsApp)
- [ ] Importar templates aprovados via `GET /{waba_id}/message_templates`.
- [ ] UI no Builder para escolher template + preencher variáveis.
- [ ] Política das 24h (free-form só dentro da janela; fora dela, exigir template).

### 6.8 Compliance / segurança
- [ ] Verificação de assinatura HMAC em **todos** os webhooks.
- [ ] Logs `support_events`/audit com `actor=meta`, `ip`, `signature_ok`.
- [ ] Política de privacidade & data deletion (`/webhook/data_deletion` já é exigido pela Meta — não existe).
- [ ] Tela `/data-deletion` (existe `src/pages/DataDeletion.tsx` 🟡 PARCIAL — verificar se endpoint POST está plugado; **não está**).

### 6.9 Observabilidade
- [ ] Mostrar `delivery_status` (sent/delivered/read/failed) na Conversations timeline.
- [ ] Métrica de janela 24h por contato.
- [ ] Dashboard de quality rating do número WhatsApp.

### 6.10 Pixel + CAPI (já parcialmente pronto)
- [ ] Adicionar `fbc`/`fbp` capture no widget web (já há placeholder em `meta.ts` → `payload.fbc/fbp` mas não populado).
- [ ] Deduplicação Pixel × CAPI via `event_id` (já enviado como `event.id`). ✅ ok.
- [ ] Test Events suporte (`test_event_code`). 🔴 falta campo na config.

---

## 7. Ranking final por canal Meta

| Canal | Pixel/CAPI | OAuth | Inbound | Outbound | Identity | Templates | Status agregado |
|---|---|---|---|---|---|---|---|
| **WhatsApp** | 🟢 (compartilhado) | 🔴 MOCK | ⚪ | ⚪ | ⚪ | ⚪ | **🔴 não funcional** |
| **Instagram DM** | 🟢 (compartilhado) | 🔴 MOCK | ⚪ | ⚪ | ⚪ | n/a | **🔴 não funcional** |
| **Messenger** | 🟢 (compartilhado) | 🔴 MOCK | ⚪ | ⚪ | ⚪ | n/a | **🔴 não funcional** |
| **Pixel/CAPI** | — | n/a | n/a | 🟢 REAL (com credenciais) | n/a | n/a | **🟢 pronto** |

---

## 8. Conclusão executiva

- A **única peça Meta com transporte real** é o `metaAdapter` de tracking (Pixel + CAPI server-side), que funciona assim que `pixelId` + `accessToken` são providos.
- Toda a **camada de mensageria** (WhatsApp/IG/Messenger) é um conjunto de **stubs** que apenas emitem eventos no `channelBus`. Não há um único byte trafegando contra `graph.facebook.com` para conversação.
- Toda a **camada de OAuth** Meta (`instagram`/`facebook`/`whatsapp`) é **mock** (`makeStub` retornando handles aleatórios).
- Não existe **nenhuma edge function** em `supabase/functions/`, ou seja, **não há endpoint público** capaz de receber webhook da Meta.
- Para ligar Cloud API de verdade, o caminho crítico mais curto é: **(1)** criar `meta_connections` + secrets, **(2)** edge function `whatsapp-webhook` (GET verify + POST com HMAC + dedupe), **(3)** substituir `whatsappChannel.send` por chamada real ao Graph, **(4)** OAuth callback real para popular tokens. Os demais canais reusam 90% dessa infraestrutura.

**Próxima fase sugerida:** R3 — desenhar `meta_connections` (schema + RLS + GRANTs) e o contrato do `whatsapp-webhook` antes de qualquer migration.
