# Google Calendar — Reality Check (FASE 27I)

**Data:** 2026-06-08  
**Status geral:** `ROADMAP` (não existe nada no código).

## Método

Varredura estática do repositório por termos:
`google.?calendar`, `gcal`, `google.?meet`, `oauth.*google`, `calendar`,
`availability`, `disponibilidade`, `booking`, `agenda` em
`src/**` e `supabase/functions/**` (excluindo `src/components/ui/calendar.tsx`,
que é apenas o date picker do shadcn, e ícones lucide).

## Respostas diretas

| Pergunta | Resposta | Evidência |
|---|---|---|
| Existe integração Google Calendar hoje? | **Não** | Nenhum arquivo em `src/` ou `supabase/functions/` referencia Google Calendar API. |
| Existe OAuth Google hoje? | **Parcial — só auth de login** | `src/pages/Auth.tsx` usa `lovable.auth.signInWithOAuth("google", …)` (Lovable Cloud managed). **Não** há OAuth com scopes de Calendar/Meet, nem token storage por usuário. |
| Existe Google Meet hoje? | **Não** | Zero referências a Meet, `hangoutLink`, `conferenceData`. |
| Existe criação de evento? | **Não** | Nenhum `events.insert`, nenhum endpoint, nenhum bloco de Builder. |
| Existe leitura de agenda? | **Não** | Nenhum `events.list`, nenhum `calendarList`. |
| Existe disponibilidade (freebusy)? | **Não** | Nenhum `freeBusy.query`. |
| Existe webhook (Calendar push notifications)? | **Não** | Nenhum canal `events.watch`, nenhuma edge function recebendo `X-Goog-Channel-*`. |
| Existe sync com CRM? | **Não** | `src/intelligence/recommendations.ts` e templates apenas **sugerem** "agendar reunião" como texto; nada grava evento real no CRM/Lead. |

## O que existe (parcial / adjacente)

- **Login Google (Lovable Cloud managed)** — `src/pages/Auth.tsx`. Scope só `openid email profile`. Não serve para Calendar.
- **Connector manifests Google** — `src/connectors/builtins.ts`: `google-sheets` (id: `google-sheets`) e `google-analytics`. Nenhum manifest `google-calendar`.
- **OAuth provider stubs** — `src/oauth/providers.ts` cobre `instagram | facebook | whatsapp | telegram | gbp`. **Não inclui Google Calendar**.
- **Templates de "agendamento"** — `src/pages/BotNew.tsx`, `src/mocks/templates.ts`, `src/ai-builder/generator.ts` mencionam "agendar reunião" como **objetivo de bot** (texto/copy). Não criam evento de calendário.
- **`src/components/ui/calendar.tsx`** — apenas o componente shadcn de date picker. Sem qualquer relação com Google Calendar.

## Classificação por capacidade

| Capacidade | Classificação |
|---|---|
| OAuth Google (login) | `REAL` |
| OAuth Google (Calendar scope) | `ROADMAP` |
| Criação de evento | `ROADMAP` |
| Leitura de agenda | `ROADMAP` |
| Free/busy & disponibilidade | `ROADMAP` |
| Google Meet (auto link) | `ROADMAP` |
| Webhook (push notifications) | `ROADMAP` |
| Sync com CRM/Lead | `ROADMAP` |
| Bloco "Agendar" no Builder | `MOCK` (existe template/copy, não executa) |

## O que falta (mínimo para `PARCIAL`)

1. Connector manifest `google-calendar` em `src/connectors/builtins.ts` + adapter em `src/connectors/adapters/googleCalendar.ts` (chamando gateway `https://connector-gateway.lovable.dev/google_calendar/calendar/v3`).
2. Conexão via `standard_connectors--connect` com `connector_id: "google_calendar"` (gateway-enabled, refresh automático).
3. Bloco Builder `calendar.create_event` (parâmetros: calendarId, summary, start, end, attendees, conferenceData=meet).
4. Bloco Builder `calendar.check_availability` (freebusy.query).
5. Tabela `public.calendar_events` (workspace_id, lead_id, external_event_id, calendar_id, start, end, status) + RLS + GRANT.
6. CRM bridge: ao criar evento, gravar `event_id` no lead + emitir `runtime_event` `calendar_event_created`.
7. (Opcional) Edge function `calendar-webhook` para `events.watch` push.

## O que falta para `REAL` end-to-end

- Per-user OAuth (não só workspace owner) — cada usuário do app autoriza seu próprio Google. Hoje connector gateway só serve a conta do dono do workspace.
- Renovação automática de canais `events.watch` (expiram em 7 dias).
- Reconciliação bidirecional (CRM ↔ Calendar).

## Conclusão

**Status: `ROADMAP`.** Não existe integração Google Calendar. Existe apenas
login Google (sem scopes de Calendar) e copy/templates de "agendamento" sem
execução real. Implementação mínima viável estimada: connector manifest +
adapter + 2 blocos + 1 tabela + RLS — caminho claro via gateway
`google_calendar` já disponível.
