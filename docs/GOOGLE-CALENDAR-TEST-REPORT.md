# Google Calendar — Test Report
**FASE 28C · 2026-06-08**

---

## Status geral

| Item | Status |
|------|--------|
| Build TypeScript | ✅ Zero erros |
| Migrations SQL criadas (3) | ✅ |
| OAuth flow (frontend → edge function) | ✅ Implementado |
| Token refresh automático | ✅ Implementado |
| Consulta disponibilidade (`freeBusy`) | ✅ Implementado |
| Criação de evento + Google Meet | ✅ Implementado |
| Atualização de evento | ✅ Implementado |
| Cancelamento de evento | ✅ Implementado |
| Atualização CRM após criação | ✅ Implementado |
| Persistência tokens (Supabase) | ✅ Implementado |
| Push notifications (events.watch) | ✅ Implementado |
| Pull incremental (syncToken) | ✅ Implementado |
| Renovação de canal (watch-refresh) | ✅ Implementado |
| Multi-workspace | ✅ `workspace_id` em todas as tabelas + RLS |
| Builder blocks (3) | ✅ Implementado |
| Teste com credenciais reais | ⚠️ SKIPPED — credenciais GCAL não disponíveis no CI |

---

## Arquivos criados

### Frontend / lib (`src/calendar/`)

| Arquivo | O que faz |
|---------|-----------|
| `types.ts` | Tipos: `CalendarEvent`, `OAuthToken`, `TimeSlot`, `CreateEventInput`, ... |
| `events.ts` | Tipos dos runtime events de calendário |
| `oauth/config.ts` | `VITE_GCAL_CLIENT_ID`, scopes, URLs |
| `oauth/flow.ts` | `initiateAuth()` (redirect para Google), `validateState()` (CSRF check) |
| `oauth/tokens.ts` | `getValidToken()` — lê do Supabase, refresh automático via edge function |
| `client.ts` | `calendarFetch()` — wrapper fetch com auth header, retry em 401 |
| `freebusy.ts` | `checkAvailability()` — POST /freeBusy, calcula slots livres |
| `events-api.ts` | `createEvent()`, `updateEvent()`, `cancelEvent()` |
| `meet.ts` | `buildMeetConferenceData()`, `extractMeetLink()` |
| `bridge.ts` | `calendarBridge` — persiste em `calendar_events`, atualiza lead, emite runtime event |
| `sync/pull.ts` | `pullIncremental()` — lógica de sync incremental com syncToken |
| `sync/push.ts` | `registerWatch()`, `unregisterWatch()`, `renewWatch()` |
| `index.ts` | Barrel de exports públicos |

### Builder blocks (`src/builder/blocks/calendar/`)

| Arquivo | Block type | O que faz |
|---------|-----------|-----------|
| `checkAvailability.ts` | `calendar_check_availability` | Consulta freeBusy → escreve `available_slots` em variável |
| `createEvent.ts` | `calendar_create_event` | Cria evento + Meet → escreve `calendar.event_id`, `calendar.meet_link` |
| `cancelEvent.ts` | `calendar_cancel_event` | Cancela evento pelo event_id nas variáveis do flow |

### Migrations Supabase (`supabase/migrations/`)

| Migration | Tabela | O que cria |
|-----------|--------|-----------|
| `20260609000001_user_calendar_tokens.sql` | `user_calendar_tokens` | Tokens OAuth por usuário. UNIQUE(user_id). RLS: self + service_role. |
| `20260609000002_calendar_events.sql` | `calendar_events` | Espelho local dos eventos. UNIQUE(user_id, external_event_id). RLS: workspace_member. Realtime habilitado. |
| `20260609000003_calendar_watch_channels.sql` | `calendar_watch_channels` | Canais push. UNIQUE(user_id, calendar_id). RLS: self + service_role. |

### Edge Functions (`supabase/functions/`)

| Função | Modo | O que faz |
|--------|------|-----------|
| `google-oauth-callback/index.ts` | GET (OAuth redirect) + POST (refresh) | Troca code→tokens, salva em `user_calendar_tokens`. POST faz refresh. |
| `calendar-webhook/index.ts` | POST (Google push) | Valida `X-Goog-Channel-Token`, dispara sync para o usuário. |
| `calendar-sync/index.ts` | POST direto + cron | Pull incremental por syncToken; upsert em `calendar_events`. |
| `calendar-watch-refresh/index.ts` | Cron diário | Renova canais que expiram em <48h. |

---

## Fluxo OAuth end-to-end

```
1. Frontend: initiateAuth(userId) → redirect Google consent
      VITE_GCAL_CLIENT_ID + scopes: calendar.events + calendar.readonly
      state: base64(JSON({userId, nonce, ts}))

2. Google → edge google-oauth-callback?code=...&state=...
      → POST /token (code exchange)
      → decode id_token (google_sub, email)
      → UPSERT user_calendar_tokens
      → redirect 302 /settings/calendar?connected=1

3. Frontend: getValidToken(userId) → lê de Supabase
      → se expirado: POST google-oauth-callback {action:"refresh", userId}
      → edge faz POST /token (refresh_token grant)
      → atualiza access_token + expires_at
      → se invalid_grant: marca status=disconnected, throws
```

---

## Fluxo criação de evento + Meet

```
createEvent({
  userId, workspaceId, leadId, summary,
  startAt, durationMinutes: 30,
  attendees: [{email: "lead@email.com"}],
  withMeet: true
})
  → getValidToken(userId)
  → POST /calendars/primary/events?conferenceDataVersion=1&sendUpdates=all
      body: { summary, start, end, attendees,
              conferenceData: { createRequest: { requestId, type: "hangoutsMeet" } } }
  → extractMeetLink(response)
  → INSERT calendar_events (status=confirmed, meet_link=...)
  → UPDATE leads SET stage='scheduled', next_action_at=startAt
  → runtimeEventBus.emit({ type: "lead_updated", payload: { _calendarEventType: "calendar_event_created", ... } })
```

---

## Para ativar

### 1. Google Cloud Console

```
1. Criar projeto (ou usar existente)
2. Ativar: Google Calendar API
3. OAuth Consent Screen: External, scopes: calendar.events + calendar.readonly
4. Criar OAuth Client ID: Web Application
   Authorized redirect URIs:
     https://bgzczvsmfcnypwqveotx.functions.supabase.co/google-oauth-callback
5. Copiar Client ID e Client Secret
```

### 2. Supabase Secrets

```bash
supabase secrets set GCAL_CLIENT_ID=<client_id>
supabase secrets set GCAL_CLIENT_SECRET=<client_secret>
supabase secrets set GCAL_REDIRECT_URI=https://bgzczvsmfcnypwqveotx.functions.supabase.co/google-oauth-callback
supabase secrets set GCAL_STATE_SECRET=$(openssl rand -hex 32)
supabase secrets set GCAL_WEBHOOK_TOKEN_SECRET=$(openssl rand -hex 32)
```

### 3. Frontend `.env`

```bash
VITE_GCAL_CLIENT_ID=<client_id>
```

### 4. Deploy migrations + edge functions

```bash
supabase link --project-ref bgzczvsmfcnypwqveotx
supabase db push
supabase functions deploy google-oauth-callback --no-verify-jwt
supabase functions deploy calendar-webhook --no-verify-jwt
supabase functions deploy calendar-sync
supabase functions deploy calendar-watch-refresh
```

### 5. Supabase config.toml — cron schedules

```toml
[functions.calendar-sync]
schedule = "*/5 * * * *"

[functions.calendar-watch-refresh]
schedule = "0 3 * * *"
```

---

## Teste manual esperado (com credenciais reais)

```
1. initiateAuth(userId) → redirect Google → authorize
2. Callback → user_calendar_tokens populado ✓
3. getValidToken(userId) retorna token fresco ✓
4. checkAvailability({userId, from: now, to: now+7d})
   → slots livres retornados como ISO array ✓
5. createEvent({userId, summary: "Teste", startAt: <slot>, withMeet: true})
   → evento criado no Google Calendar ✓
   → meet_link retornado ✓
   → calendar_events inserido ✓
   → lead.stage = "scheduled" ✓
6. cancelEvent({userId, externalEventId})
   → evento cancelado no Google ✓
   → calendar_events.status = "cancelled" ✓
```
