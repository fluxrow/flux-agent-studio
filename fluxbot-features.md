# FluxBot — Features & Architecture Log

This document tracks every shipped phase so we can use the running
feature set as a differentiation base for the landing page and as a
single source of truth for QA.

---

## Phase 3 — Runtime Engine (local)
- Framework-agnostic execution engine in `src/runtime/`
- Session lifecycle, variable store, condition resolver
- React-free core; `useEngine` hook + `RuntimeInspector` UI
- `/simulator` page to run any mocked Flow

## Phase 3.5 — Builder Runtime Integration
- Flow serialization between visual Builder and Engine
- Validator (`src/runtime/validator.ts`) + Validation panel
- Block registry, Builder context, Preview panel
- Architecture: Builder → Flow → Validator → Runtime → Preview

## Phase 4 — Persistence Architecture + Execution Events
- Unified `Persistence` facade and per-domain repository contracts
- Runtime Event Bus (`src/runtime/events/`)
- Analytics adapter with pluggable destinations
- Event Inspector tab in Simulator
- Mock repositories for Workspace / User / Version / Session / Event

## Phase 5 — Supabase Foundation
- 14-table multi-tenant schema with RLS + `has_workspace_role` /
  `is_workspace_member` security-definer functions
- Auth providers: email/senha + Google
- `AuthProvider`, `WorkspaceProvider`, `ProtectedRoute`
- DI toggle `VITE_USE_SUPABASE` → flips entire persistence layer
- Supabase repository adapters (bots, leads, channels, sessions,
  events, workspaces, users) + stubs for the rest
- Auto-create profile + workspace on signup (trigger)
- Manual "Carregar demo" seed in Settings → Workspace

## Phase 5.5 — Supabase QA + Hardening
- **System Health panel** (Settings → Sistema): visual checklist for
  auth, workspace, persistence mode, RLS, repos, demo seed and event
  adapter — with re-check button.
- **/debug/repositories** page: live table of every domain showing
  adapter type (mock / supabase / stub), call count, error count,
  last fetch, last error. Includes "Pingar repos" and "Limpar".
- **Persistence telemetry** (`src/lib/persistence-telemetry.ts`):
  every repository call is wrapped in a Proxy and reported to the
  telemetry store; consumed by both panels above.
- **Reusable fallbacks**: `EmptyState` and `ErrorState`
  (`src/components/ui/empty-state.tsx`) with retry support.
- **Env-driven mode switch validated**: `VITE_USE_SUPABASE=false`
  keeps mock; `=true` uses Supabase. App boots on empty workspace
  without crashing — stub adapters return empty collections, RLS
  filters by workspace.

## Phase 6 — CRM Engine
- **Leads schema** extended with `company`, `owner_id`, `notes`,
  `last_activity_at` (+ touch trigger). `events.lead_id` added so the
  timeline can be filtered per lead.
- **Repository contract** for leads is now full CRUD: `create`,
  `update`, `remove`, `addTag`, `removeTag`, plus `timeline(leadId)`,
  `conversations(leadId)` and `crmStats()`. Mock and Supabase adapters
  both implement it end-to-end.
- **`useCreateLead` / `useUpdateLead` / `useDeleteLead` / `useLead` /
  `useLeadTimeline` / `useLeadConversations` / `useCrmStats` /
  `useAddLeadTag` / `useRemoveLeadTag`** — hooks layer points at the
  persistence facade so it flips with `VITE_USE_SUPABASE`.
- **Pipeline Kanban** (`/leads`): 5 stages, "Novo lead" dialog, cards
  link to detail, hover reveals a "Mover para…" stage select that
  writes to the DB.
- **Lead Detail** (`/leads/:id`): sidebar with data / score slider /
  tag editor + delete; tabs for Timeline, Conversas and Notas. Stage
  changes, tag edits and score updates emit `lead_updated` events
  that populate the timeline automatically.
- **Runtime → CRM bridge** (`src/lib/crm-bridge.ts`): subscribes to
  the runtime event bus, accumulates `lead.*` variables per session
  and persists a real lead on `conversation_completed` /
  `flow_completed`. Session is linked back to the lead so its
  conversations show up on the detail page.
- **CRM Dashboard widget** on `/dashboard`: totals, taxa de ganho,
  funil por estágio e leads recentes — tudo via `useCrmStats()`.
- **Ownership groundwork**: `owner_id` column + index in place to
  support team assignment in a later phase.


---

## Manual Smoke Test (Phase 5.5)

Run after every Supabase-touching change.

1. **Login** — go to `/auth`, sign up with email or Google. Expect
   redirect to `/dashboard` and avatar in sidebar.
2. **Workspace auto-created** — open Settings → Workspace; the
   personal workspace appears with role `owner`.
3. **System Health green** — Settings → Sistema. Every check must be
   green except "Modo de persistência" (amber in mock).
4. **Carregar demo** — Settings → Workspace → "Carregar demo". Toast
   reports counts of bots / leads / channels created.
5. **Listar bots** — `/bots` shows the demo bots. Empty workspace
   shows `EmptyState`, never a crash.
6. **Abrir builder** — click any bot → `/builder/:id`. Canvas opens,
   Validation panel reports status.
7. **Executar preview** — Builder → Preview. Runtime Engine runs the
   flow; Event Inspector lists `flow_started`, `block_entered`, etc.
8. **Listar leads** — `/leads` shows seeded leads with stage/score.
9. **Registrar evento** — open `/debug/repositories`, click
   "Pingar repos"; the `events` and `bots` rows update counts and
   timestamps. Running a Preview should bump `events` again.

If any step fails, open `/debug/repositories` and check the
"Último erro" column — that's the first place to look.

---

## Phase 6.5 — Public Bot Runtime + CRM QA
- **Public route `/bot/:slug`** — engine-driven chat with bubbles,
  free-text input, choice buttons, loading + error + ended states.
  No sidebar, no auth, no internal workspace data exposed.
- **Bots schema**: new columns `slug`, `published_snapshot`,
  `published_at`; auto-slug trigger.
- **Publish RPC `publish_bot(bot_id, snapshot, slug, note)`**
  (SECURITY DEFINER, editor+). Updates the bot, stores the snapshot
  and creates a new `bot_versions` row.
- **Public RPCs (anon-safe)**: `get_public_bot`, `record_public_session`,
  `record_public_event`, `record_public_message`, `record_public_lead`.
  All scoped to bots where `status='ativo'` AND `published_snapshot IS NOT NULL`.
- **Persistence**: `BotRepository.publish()` + `getBySlug()` for mock
  and Supabase modes; mock writes to `mockFlows` and the in-memory bot
  store; Supabase calls `publish_bot` RPC.
- **Builder**: new **PublishDialog** opens after clicking *Publicar*.
  Lets the user edit the slug, see the public URL preview, copy the
  generated link and open it in a new tab.
- **Public runtime façade** (`src/lib/public-runtime.ts`): mock or
  Supabase mode picked by `VITE_USE_SUPABASE`; the page goes through
  this module, never the persistence facade.
- **CRM bridge in public**: variables `name/email/phone/company` (and
  their `lead.*` aliases) are accumulated client-side and persisted via
  `record_public_lead` once `flow_completed` fires. Lead surfaces in
  CRM with source `public-bot`.
- **SystemHealthPanel** new checks:
  - Bot publicado — counts bots with `slug` + `publishedAt`
  - Link público gerado — shows first public URL
  - Lead criado via bot público — counts leads with `source='public-bot'`

### How to publish a bot
1. Open Builder → `/builder/:id`.
2. Click **Publicar** (top right). If the flow is invalid, fix the
   errors first.
3. In the dialog, choose a slug (auto-suggested from the bot name).
4. Click **Publicar** again. A toast confirms; the public URL appears
   with copy and open-in-new-tab buttons.

### How to test `/bot/:slug`
1. Open the link from the PublishDialog (or `/bot/<slug>`).
2. Conversation auto-starts. Type input for `input` blocks or pick
   options for `choice` blocks.
3. When the flow reaches an `end` block, the chat shows the ended
   banner and posts `flow_completed`.

### How to validate the lead landed in the CRM
1. Make sure the flow captures a `name` (or `lead.name`) variable —
   without a name the bridge skips lead creation by design.
2. Open `/leads` after completing the public conversation. The new
   lead appears in the **Novo** stage with source `public-bot`.
3. Open the lead detail page — the linked session is listed under
   **Conversas** and `flow_completed` shows up in **Timeline**.

### Simulator vs Public Runtime
| | Simulator (`/simulator`) | Public Runtime (`/bot/:slug`) |
|---|---|---|
| Audience | Authenticated operator | Anonymous visitor |
| Source | Latest draft flow | Published snapshot only |
| Auth | Required (ProtectedRoute) | None — anon RPCs |
| Sidebar / chrome | Full app shell | Standalone chat surface |
| Persistence | Direct via `persistence` facade | Via `public-runtime` RPCs |
| Lead creation | `crmBridge` listens to bus | Page captures vars + `record_public_lead` |


---

## Phase 7 — Tracking Core

End-to-end tracking layer that turns every visitor of a public bot into a
persistent profile + attribution + session, ready to be forwarded to Meta,
Google or n8n in a later phase.

### Architecture

```
Runtime Engine  →  runtimeEventBus  →  TrackingEngine  →  Persistence (visitor_profiles, lead_attribution, events)
                                            ↓
                                    in-memory ring buffer (Inspector)
```

The TrackingEngine lives in `src/tracking/` and is completely decoupled
from the Runtime. It subscribes once at boot (`main.tsx`) and emits a
parallel stream of `TrackedEvent`s — never touching the runtime
internals.

### New tables

- `visitor_profiles` — one row per `(workspace_id, visitor_id)`. Stores
  browser, OS, device, language, timezone, referrer, landing page, UA.
- `lead_attribution` — every UTM hit / click-id captured from the URL.
  `lead_id` is null until the conversation completes and is then linked
  via the `attach_public_attribution_to_lead` RPC.

Both tables: RLS scoped to workspace members; admins+ can delete.

### Anon-callable RPCs (extend Phase 6.5)

- `record_public_visitor_profile(slug, visitor_id, browser, os, …)`
- `record_public_attribution(slug, visitor_id, session_id, utm_*, *clid, …)`
- `attach_public_attribution_to_lead(session_id, lead_id, visitor_id)`

All SECURITY DEFINER, gated by `bots.status='ativo' AND published_snapshot IS NOT NULL`.

### Visitor identity

- Stored in `localStorage` under `fluxbot:visitor_id`.
- `getOrCreateVisitorId()` returns a stable `v_xxx_yyy` id.
- `detectBrowser()` snapshots browser/OS/device/language/timezone/referrer.
- `captureAttributionFromUrl()` reads `utm_source`, `utm_medium`,
  `utm_campaign`, `utm_content`, `utm_term`, `fbclid`, `gclid`,
  `ttclid`, `msclkid` from the current URL and persists them under
  `fluxbot:attribution` for the session.
- `resetVisitor()` wipes the three localStorage keys (used by the
  Tracking page's "Reset visitor" button).

### Tracked events

`page_view`, `bot_loaded`, `session_started`, `session_ended`,
`flow_started`, `flow_completed`, `flow_abandoned`, `block_entered`,
`block_exited`, `input_received`, `choice_selected`,
`condition_evaluated`, `variable_updated`, `lead_created`,
`lead_updated`.

Session lifecycle (`session_started` / `session_ended` + `durationMs`)
is computed from `flow_started` / `flow_completed|abandoned` events
emitted by the Runtime.

### Tracking Inspector (`Settings → Tracking`)

Visual panel at `/tracking` showing in real time:

- Visitor profile (id, browser, OS, device, timezone, referrer, …)
- Current session (id, started_at, duration)
- Attribution (UTMs + click ids + capture timestamp)
- Ring buffer of last 200 events (badge color per type, payload preview)
- Aggregations: leads by source, leads by bot, top tags/campaigns

Empty/loading states are explicit — opening Tracking with no activity
shows hints (e.g. "adicione `?utm_source=meta` para validar").

### Public Bot integration

`/bot/:slug` now:

1. Detects browser + captures URL attribution before starting the session.
2. Calls `record_public_visitor_profile` (Supabase mode) — no-op in mock.
3. Calls `record_public_attribution` once the session id exists.
4. Emits a `bot_loaded` event.
5. When a lead is persisted (`recordPublicLead`), it calls
   `attach_public_attribution_to_lead` so the UTM row is linked.

### Smoke test

1. Publish a bot in the Builder (Phase 6.5).
2. Open `/bot/<slug>?utm_source=meta&utm_campaign=teste-fase-7&fbclid=abc`.
3. Complete the flow providing a name / email.
4. In the workspace, open `/tracking` — visitor + attribution + events visible.
5. Open `/leads` — the new lead has `source=public-bot`.
6. In Supabase: `lead_attribution.lead_id` is set; `visitor_profiles`
   has a row with the captured browser/OS.

Mock mode: steps 1–5 still work; visitor + attribution stay client-side
(localStorage + tracking engine ring buffer) since the RPCs are skipped.

---

## Phase 8 — Meta + Google Connectors

The Tracking Core now ships a decoupled **Destinations** layer. The Runtime keeps emitting only
internal events; mapping + dispatch happens entirely outside the engine.

```
Runtime  →  Event Bus  →  Tracking Engine  →  Destinations Registry
                                                  ├── Meta Adapter   (Pixel + CAPI)
                                                  ├── Google Adapter (GA4 MP)
                                                  └── n8n / Webhook / LinkedIn / TikTok (stubs)
```

### Event Mapping (`src/tracking/mappings`)
Pure lookup table from `TrackedEventType` → external event names:

| Internal            | Meta                    | Google           |
| ------------------- | ----------------------- | ---------------- |
| `page_view`         | PageView                | page_view        |
| `bot_loaded`        | ViewContent             | page_view        |
| `session_started`   | ViewContent             | session_start    |
| `flow_started`      | InitiateCheckout        | begin_checkout   |
| `flow_completed`    | Lead                    | generate_lead    |
| `lead_created`      | CompleteRegistration    | generate_lead    |

### Adapters
- **MetaAdapter** — payload shaped for the Pixel/CAPI `events` array. Mock mode by default; provide
  `Pixel ID` + `CAPI Access Token` in Settings → Destinations to enable real dispatch.
- **GoogleAnalyticsAdapter** — Measurement Protocol body. Provide `Measurement ID` + `API Secret`
  to enable real dispatch.
- **Stubs** — `n8nAdapter`, `webhookAdapter`, `linkedinAdapter`, `tiktokAdapter` are registered but
  inert, ready for future implementation.

### Destinations Panel
`Settings → Destinations` exposes per-adapter cards with:
- Status chip: `Connected | Mock | Disconnected`
- Toggle ativo + toggle mock mode
- Credential inputs (Meta/Google)
- Counters: Sucessos, Mock, Falhas

### Dispatch Inspector
`/tracking` now shows the full pipeline per dispatch:
`internal type → destination → external name → outcome` with the exact payload sent.

### Analytics Validation
Aggregated counters at the top of the Destinations panel:
- Fila (in-flight)
- Sucessos
- Mock (skipped — mock mode)
- Falhas

### Smoke test
1. Settings → Destinations: confirm Meta + Google show "Mock".
2. Open `/simulator` or `/bot/:slug` and complete a flow.
3. Open `/tracking` → "Destination Dispatch": you should see
   `flow_completed → meta → Lead (skipped)` and `flow_completed → google → generate_lead (skipped)`.
4. Add Pixel ID / Measurement ID, disable mock — outcomes flip to `success` (or `failure` with error message).

---

## Phase 9 — Conversational Experience Engine

The Runtime keeps emitting blocks; presentation is now fully decoupled
behind a **ConversationRenderer** layer.

```
RuntimeEngine ──► EngineState ──► ConversationRenderer (Theme + Typing) ──► UI
```

### Renderer Architecture (`src/renderers`)
- `types.ts` — `ConversationRenderer`, `RendererProps`, `RendererTheme`, `TypingConfig`, `DelayConfig`, `Variant`.
- `ConversationFrame.tsx` — shared shell (header / transcript / composer / typing indicator / choices).
- `builtins.tsx` — `whatsappRenderer`, `instagramRenderer`, `messengerRenderer`, `chatgptRenderer`, `formRenderer`.
- `registry.ts` — `getRenderer(id, variant)`, `listRenderers()`, `resolveVariant()` (A/B foundation).

### Theme Engine (`src/renderers/themes.ts`)
Each renderer ships a default `RendererTheme` (background, surface, header, bubbles, accent, font, avatar, bubble radius, subtitle). Themes are pure data — swap to repaint the surface; the engine is untouched.

### Typing Simulation (`src/renderers/typing.ts`)
`useTyping(state, typing, delay)` returns a truncated transcript + `typing` flag, dripping bot messages over time.
Modes:
- `instant` — no delay.
- `realistic` — `msPerChar * text.length` clamped between `minDelayMs` and `maxDelayMs`.
- `custom` — caller supplies `msPerChar`.

### Human Delay
Stacked on top of typing:
- `fixed` — adds `fixedMs` to every message.
- `random` — uniform between `randomMinMs` and `randomMaxMs`.
- `per_block` — adds the block-level `delay` (ms) to the simulated wait.

### Dynamic Personalization (`src/renderers/personalization.ts`)
`personalize(text, variables)` resolves `{{nome}}`, `{{empresa}}`, `{{cidade}}`, `{{email}}`, `{{telefone}}` (with English aliases). Used by the frame on titles, subtitles, placeholders, and rendered bubbles.

### Public Runtime selector
`/bot/:slug?mode=whatsapp|instagram|messenger|chatgpt|form` — visitors can switch render mode; the published bot honors the query string and persists `mode` in tracking events.

### Builder preview
`Builder → Preview` now exposes the renderer selector in its header — same flow, five experiences.

### A/B Testing Foundation
`registry.ts` accepts multiple variants per renderer id; `resolveVariant(id, visitorId)` is the hook for experiments (returns `"a"` today). Analytics integration intentionally deferred.

### Smoke test
1. Open `/bot/<slug>` — default WhatsApp theme renders with typing dots.
2. Click "Instagram DM", "Messenger", "ChatGPT", "Formulário" — same conversation, different chrome.
3. Builder → Preview — toggle renderers mid-conversation; transcript persists.
4. Trigger a block with text containing `{{nome}}` after capturing a `name` variable — the bubble renders the personalized value.
