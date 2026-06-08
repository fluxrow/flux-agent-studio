# Google Calendar — Implementation Plan (FASE 28B)

**Data:** 2026-06-08
**Status atual:** `ROADMAP` (ver `docs/GOOGLE-CALENDAR-REALITY.md`).
**Escopo deste documento:** arquitetura real, sem UI, sem mock. Apenas o plano de implementação que sucessores podem executar literalmente.

---

## 1. Respostas diretas

| Pergunta | Resposta |
|---|---|
| OAuth necessário? | **Sim**, **per-user** (não connector gateway). Cada usuário do workspace que precisa agendar autoriza seu próprio Google. Connector gateway `google_calendar` só serviria a conta do dono do workspace e não cobre "atendente A agenda na agenda dela / atendente B na dele". |
| Scopes necessários? | `https://www.googleapis.com/auth/calendar.events` (CRUD em eventos do calendário do usuário), `https://www.googleapis.com/auth/calendar.readonly` (listar `calendarList` e `freeBusy`), `openid email profile` (identificação). Não precisa de `calendar` full. |
| Google Meet necessário? | **Sim, opcional por evento.** Criado via `conferenceData.createRequest` no `events.insert` com `conferenceDataVersion=1`. Não exige scope extra além de `calendar.events`. |
| Como criar evento? | `POST /calendars/{calendarId}/events?conferenceDataVersion=1` com `summary`, `description`, `start`, `end`, `attendees[]`, opcional `conferenceData.createRequest`. Idempotência via `requestId` no createRequest e `id` próprio do evento. |
| Como consultar disponibilidade? | `POST /freeBusy` com `timeMin`, `timeMax`, `timeZone`, `items: [{id: calendarId}]`. Retorna janelas ocupadas. Disponibilidade = complemento dentro do horário de trabalho do bot. |
| Como atualizar CRM após agendamento? | Após sucesso de `events.insert`: (a) gravar `calendar_events` linkado a `lead_id`; (b) atualizar `leads.next_action_at` e `leads.stage='scheduled'`; (c) emitir `runtime_event` `calendar_event_created` para tracking/intelligence/CRM bridge consumirem (mesma malha já usada em `src/lib/crm-bridge.ts`). |
| Como cancelar? | `DELETE /calendars/{calendarId}/events/{eventId}?sendUpdates=all` → marcar `calendar_events.status='cancelled'` → emitir `calendar_event_cancelled`. |
| Como sincronizar alterações? | Duas vias: **(1) Pull incremental** via `events.list?syncToken=...` em cron edge function (`calendar-sync`, a cada 5 min por workspace ativo). **(2) Push** via `events.watch` com canal endereçando edge function `calendar-webhook`; renovação obrigatória a cada ≤7 dias por job `calendar-watch-refresh`. Reconciliação bidirecional: `external_event_id` é a chave; última `updated` vence (last-write-wins por timestamp). |

---

## 2. Arquivos a criar

### Frontend / lib

```
src/calendar/
  index.ts                      # public entry; bootCalendar()
  types.ts                      # CalendarEvent, FreeBusyWindow, OAuthToken
  events.ts                     # runtime event types (calendar_event_*)
  oauth/
    config.ts                   # client_id (VITE_GCAL_CLIENT_ID), scopes, authorize URL
    flow.ts                     # initiateAuth(), handleCallback(code)
    tokens.ts                   # getValidToken(userId) com refresh automático
  client.ts                     # fetch wrapper p/ Google Calendar API v3 (refresh on 401)
  freebusy.ts                   # checkAvailability({calendarId, from, to, slotMin})
  events-api.ts                 # createEvent / updateEvent / cancelEvent
  meet.ts                       # buildMeetConferenceData(requestId)
  sync/
    pull.ts                     # consumer de syncToken → upsert local
    push.ts                     # registerWatch / unregisterWatch / renewWatch
  bridge.ts                     # ponte → CRM (lead update + runtime_event emit)
```

### Builder blocks

```
src/builder/blocks/calendar/
  checkAvailability.ts          # block "Verificar disponibilidade"
  createEvent.ts                # block "Agendar reunião" (com toggle Meet)
  cancelEvent.ts                # block "Cancelar agendamento"
```
Registrar em `src/builder/blockRegistry.ts`.

### Edge functions (Supabase)

```
supabase/functions/
  google-oauth-callback/index.ts    # troca code→tokens, salva em user_calendar_tokens
  calendar-webhook/index.ts         # recebe X-Goog-Channel-* (push notifications)
  calendar-sync/index.ts            # cron: pull incremental por workspace
  calendar-watch-refresh/index.ts   # cron diário: renova canais <48h de expirar
```

Todas com `verify_jwt = false` apenas para `google-oauth-callback` (rota pública GET com `state` HMAC) e `calendar-webhook` (Google não envia JWT — validar header `X-Goog-Channel-Token` contra valor armazenado).

### Persistência

```
src/domain/persistence/supabase/calendarRepository.ts
src/domain/persistence/contracts.ts   # adicionar CalendarRepository
```

---

## 3. Rotas

| Rota | Tipo | Função |
|---|---|---|
| `/settings/calendar` | UI futura (fora desta fase) | Conectar/desconectar Google, escolher calendário default |
| `/api/oauth/google/callback` → edge `google-oauth-callback` | público (HTTPS) | OAuth redirect URI registrada no Google Cloud |
| Edge `calendar-webhook` (URL pública gerada) | público | Endpoint registrado em `events.watch` |
| Edge `calendar-sync` | cron interno | `supabase/config.toml` schedule `*/5 * * * *` |
| Edge `calendar-watch-refresh` | cron diário | `0 3 * * *` |

OAuth redirect URI canônico a registrar no Google Cloud Console:
`https://bgzczvsmfcnypwqveotx.functions.supabase.co/google-oauth-callback`

---

## 4. Tabelas

### 4.1 `user_calendar_tokens`
Tokens OAuth por usuário (não por workspace). Refresh token criptografado.

| Coluna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | |
| `user_id` | uuid FK auth.users | UNIQUE |
| `workspace_id` | uuid FK workspaces | |
| `google_sub` | text | `sub` do id_token (estável) |
| `email` | text | |
| `access_token` | text | curto (1h) |
| `refresh_token` | text | criptografado (pgsodium ou vault) |
| `expires_at` | timestamptz | |
| `scopes` | text[] | |
| `default_calendar_id` | text | nullable; usuário escolhe |
| `created_at` / `updated_at` | timestamptz | |

RLS: usuário só lê/escreve a própria linha. `service_role` total. **Nunca anon.**

### 4.2 `calendar_events`
Espelho local dos eventos que o app criou ou observa.

| Coluna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | id local |
| `workspace_id` | uuid FK | |
| `user_id` | uuid FK auth.users | dono da agenda |
| `lead_id` | uuid FK leads | nullable (eventos não-CRM ainda assim podem vir do sync) |
| `session_id` | uuid FK sessions | nullable; preenchido quando criado por bot |
| `external_event_id` | text | id no Google |
| `calendar_id` | text | `primary` por padrão |
| `summary` | text | |
| `description` | text | |
| `start_at` / `end_at` | timestamptz | |
| `timezone` | text | |
| `attendees` | jsonb | `[{email, responseStatus}]` |
| `meet_link` | text | nullable |
| `status` | text | `confirmed` \| `tentative` \| `cancelled` |
| `etag` / `sequence` | text/int | conflito |
| `google_updated_at` | timestamptz | last-write-wins |
| `created_at` / `updated_at` | timestamptz | |

UNIQUE `(user_id, external_event_id)`. RLS por `workspace_id` via `is_workspace_member(auth.uid(), workspace_id)`.

### 4.3 `calendar_watch_channels`
Canais ativos de `events.watch`.

| Coluna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | |
| `user_id` | uuid FK | |
| `calendar_id` | text | |
| `channel_id` | text | UUID enviado para Google |
| `resource_id` | text | retornado pelo Google, usado p/ stop |
| `channel_token` | text | secret validado no webhook |
| `expires_at` | timestamptz | renovar antes |
| `sync_token` | text | último syncToken válido |
| `created_at` / `updated_at` | timestamptz | |

### 4.4 Migrations a aplicar
- `20260609000001_user_calendar_tokens.sql`
- `20260609000002_calendar_events.sql`
- `20260609000003_calendar_watch_channels.sql`

Todas seguem o contrato: `CREATE TABLE` → `GRANT` (authenticated + service_role; nunca anon) → `ENABLE RLS` → `CREATE POLICY` usando `is_workspace_member` / `auth.uid()`.

Realtime: `ALTER PUBLICATION supabase_realtime ADD TABLE public.calendar_events` para que UI futura escute em tempo real.

---

## 5. OAuth — fluxo real

```
1. Front: GET https://accounts.google.com/o/oauth2/v2/auth
     ?client_id=$VITE_GCAL_CLIENT_ID
     &redirect_uri=$GCAL_REDIRECT_URI
     &response_type=code
     &access_type=offline
     &prompt=consent
     &scope=openid email profile
            https://www.googleapis.com/auth/calendar.events
            https://www.googleapis.com/auth/calendar.readonly
     &state=<HMAC(user_id, nonce, ts) com GCAL_STATE_SECRET>
     &include_granted_scopes=true

2. Google → edge `google-oauth-callback?code=...&state=...`
   - valida state (HMAC + janela 10min)
   - POST https://oauth2.googleapis.com/token
       client_id=$GCAL_CLIENT_ID
       client_secret=$GCAL_CLIENT_SECRET
       code, redirect_uri, grant_type=authorization_code
   - decodifica id_token → google_sub, email
   - UPSERT user_calendar_tokens (refresh_token só vem na 1ª autorização)
   - redireciona 302 → /settings/calendar?connected=1

3. Refresh: client.ts intercepta 401 → POST /token grant_type=refresh_token
   - atualiza access_token + expires_at
   - se refresh_token revogado (400 invalid_grant) → marca status=disconnected,
     emite runtime_event calendar_disconnected, força reconexão.
```

Secrets necessários (via `add_secret`, não em código):
- `GCAL_CLIENT_ID` (também espelhado como `VITE_GCAL_CLIENT_ID` público para iniciar auth)
- `GCAL_CLIENT_SECRET` (server-only)
- `GCAL_REDIRECT_URI` (server-only, exato)
- `GCAL_STATE_SECRET` (HMAC do `state`)
- `GCAL_WEBHOOK_TOKEN_SECRET` (HMAC do `channel_token`)

---

## 6. Webhooks — Calendar push

Registro:
```
POST /calendars/{calendarId}/events/watch
{
  "id": "<channel_id uuid>",
  "type": "web_hook",
  "address": "https://<project>.functions.supabase.co/calendar-webhook",
  "token": "<HMAC(user_id, channel_id, GCAL_WEBHOOK_TOKEN_SECRET)>",
  "expiration": <now + 7d em ms>
}
```

Edge `calendar-webhook`:
1. Lê headers `X-Goog-Channel-ID`, `X-Goog-Channel-Token`, `X-Goog-Resource-State`, `X-Goog-Resource-ID`.
2. Valida HMAC do token contra `calendar_watch_channels.channel_token`.
3. Se `Resource-State == 'sync'` → 200 e ignora (handshake).
4. Caso contrário: dispara `calendar-sync` para aquele `user_id` (pull incremental com `syncToken`).
5. Retorna 200 sempre que validar (Google retira o canal em ≥3 falhas).

Stop quando usuário desconectar:
```
POST /channels/stop  { "id": channel_id, "resourceId": resource_id }
```

---

## 7. Fluxos

### 7.1 Verificar disponibilidade no Builder
```
block calendar.check_availability
  inputs:  calendar_id=primary, from=now, to=now+7d, slot_minutes=30,
           working_hours={mon-fri 09-18, tz=America/Sao_Paulo}
  steps:
    1. getValidToken(currentUserId)
    2. POST /freeBusy
    3. complemento dentro de working_hours respeitando slot_minutes
  output:  variable `available_slots: ISO[]`
```

### 7.2 Agendar reunião
```
block calendar.create_event
  inputs:  summary, description, start, duration_min, attendees[], with_meet:boolean
  steps:
    1. getValidToken(userId)
    2. body = { summary, description, start{dateTime,tz}, end{dateTime,tz}, attendees }
    3. if with_meet: body.conferenceData = {
         createRequest: { requestId: uuid(), conferenceSolutionKey: { type: "hangoutsMeet" } }
       }
    4. POST /calendars/{cal}/events?conferenceDataVersion=1&sendUpdates=all
    5. INSERT calendar_events (status=confirmed, meet_link=hangoutLink)
    6. bridge.afterCreate(event) →
         - leads.update({stage:'scheduled', next_action_at:start})
         - runtimeEventBus.emit('calendar_event_created', {event_id, lead_id, meet_link})
         - tracking.dispatch('Schedule', {value:0})
  output:  event_id, meet_link
```

### 7.3 Cancelar
```
block calendar.cancel_event
  steps:
    1. DELETE /calendars/{cal}/events/{external_event_id}?sendUpdates=all
    2. UPDATE calendar_events SET status='cancelled'
    3. emit calendar_event_cancelled
```

### 7.4 Sincronização
- **Pull (cron 5min):** para cada `user_calendar_tokens` ativo, GET `/events?syncToken=...` → upsert local por `external_event_id` (last-write-wins por `updated`). Se 410 Gone, refazer full sync (`timeMin=now-30d`) e reabrir watch.
- **Push:** webhook só sinaliza "algo mudou para esse canal"; a busca real continua via syncToken.
- **Renew watch (cron diário):** todo canal com `expires_at < now+48h` recebe novo `watch` e o antigo é `stop`.

### 7.5 Reconciliação com CRM
- `calendar_event_created` → `crm-bridge.ts` já consome `runtimeEventBus`; estender para mover lead para coluna "Agendado" no pipeline.
- `calendar_event_cancelled` → reverter `stage` para anterior (gravado em `leads.previous_stage`).
- `calendar_event_updated` (start mudou) → atualizar `leads.next_action_at`.

---

## 8. Eventos de runtime adicionados

| Tipo | Payload |
|---|---|
| `calendar_connected` | `{user_id, email}` |
| `calendar_disconnected` | `{user_id, reason}` |
| `calendar_event_created` | `{event_id, external_event_id, lead_id?, meet_link?, start_at}` |
| `calendar_event_updated` | `{event_id, changes}` |
| `calendar_event_cancelled` | `{event_id, lead_id?}` |
| `calendar_sync_failed` | `{user_id, code, message}` |

Adicionar em `src/runtime/events/types.ts`.

---

## 9. Ordem de execução sugerida

1. Provisionar OAuth Client no Google Cloud + adicionar `GCAL_*` via `add_secret`.
2. Criar 3 migrations (tokens / events / watch_channels) + GRANT + RLS.
3. Implementar `src/calendar/oauth/*` + edge `google-oauth-callback`.
4. Implementar `client.ts` + `events-api.ts` + `freebusy.ts` + `meet.ts`.
5. Implementar `bridge.ts` ligando ao `runtimeEventBus` + `leads`.
6. Criar 3 blocks Builder + registrar.
7. Implementar `calendar-sync`, `calendar-webhook`, `calendar-watch-refresh`.
8. Smoke test: conectar conta de teste → criar evento via block → confirmar no Google → cancelar → confirmar sync.

---

## 10. O que está fora desta fase

- UI de `/settings/calendar` (será FASE 28C).
- Suporte multi-calendário por usuário (default-calendar resolve 90%).
- Reagendamento conversacional (FASE 28D).
- Round-robin entre atendentes (FASE 28E).

---

## 11. Classificação final do plano

| Capacidade | Status pós-execução |
|---|---|
| OAuth per-user | `REAL` |
| Criar evento | `REAL` |
| Free/busy | `REAL` |
| Google Meet auto | `REAL` |
| Cancelar | `REAL` |
| Sync push + pull | `REAL` |
| Bridge CRM | `REAL` |
| UI settings | `ROADMAP` (FASE 28C) |
