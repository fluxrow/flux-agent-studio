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

