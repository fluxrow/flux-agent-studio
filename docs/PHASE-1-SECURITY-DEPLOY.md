# Phase 1 security deployment

Deploy the Phase 1 security hardening in this order:

1. Configure Edge Function secrets:
   - `GCAL_CLIENT_ID`
   - `GCAL_CLIENT_SECRET`
   - `GCAL_REDIRECT_URI`
   - `GCAL_STATE_SECRET` with at least 32 random characters
   - `CALENDAR_INTERNAL_SECRET` with at least 32 random characters
   - `META_VERIFY_TOKEN` with at least 32 random characters
   - `META_APP_SECRET`
   - `APP_URL`
   - `LOVABLE_API_KEY`
   - frontend `VITE_GCAL_REDIRECT_URI`, with the exact same Edge Function URL
     configured in `GCAL_REDIRECT_URI` and Google Console
2. Apply `20260610000001_security_hardening.sql`.
3. Deploy `google-oauth-callback`, `calendar-sync`,
   `calendar-watch-refresh`, `meta-webhook`, `meta-send`, and `lovable-ai`.
4. Deploy the frontend.

The migration removes browser access to Meta and Google credential rows.
Deploying the frontend before the migration leaves credentials exposed;
applying the migration without the new frontend temporarily breaks connection
listing and Calendar token retrieval.

`lovable-ai` must be deployed with gateway JWT verification disabled because
published bots run under the anonymous Supabase role. The function itself
fails closed and accepts only one of these proofs:

- a Supabase JWT that resolves to an authenticated user, limited to 30 calls
  per minute per user;
- a random, 24-hour token issued atomically with a public bot session, limited
  to 20 calls per minute per session and 60 calls per minute per published bot.

The public token table is service-role only. A token stops working when it
expires, its session ends, or the associated bot is unpublished.
Creating additional sessions does not reset the per-bot ceiling. Demo and
explicit mock mode use the deterministic local provider and never consume the
production AI gateway.

Public session issuance reuses an active session for the same bot and visitor,
is capped at 120 new sessions per minute per bot, and replaces the legacy
anonymous session RPC. Infrastructure-level rate limiting is still recommended
for volumetric abuse.
Events, messages, leads, visitor profiles, and attribution writes require the
same session token and share a 240-write-per-minute session ceiling. The legacy
anonymous write signatures are revoked.

The Google Calendar client still receives a short-lived access token because
the existing Calendar API client runs in the browser. Refresh tokens and raw
token-table rows remain server-only. Moving all Google API calls behind Edge
Functions is a later hardening step.

`calendar-watch-refresh` accepts only `POST` calls authenticated with either
the service-role bearer token or `x-internal-secret: CALENDAR_INTERNAL_SECRET`.
The scheduler must send one of these credentials. A missing server secret or a
partial channel-renewal failure produces a non-success response.

`meta-webhook` fails closed when `META_VERIFY_TOKEN` or `META_APP_SECRET` is
missing. Inbound storage is idempotent by Meta message ID, and only the service
role may execute the routing and persistence RPCs.

New Meta connections remain inactive. Only the service role may mark a
connection verified and active after server-side ownership validation. Active
WhatsApp phone IDs and Meta page IDs are globally unique to prevent ambiguous
cross-workspace routing.

Google Calendar credentials, watches, and mirrored events are keyed by both
user and workspace. The OAuth redirect must be the deployed
`google-oauth-callback` Edge Function URL, not an application `/api` route.
