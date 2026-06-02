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

---

## Phase 10 — Channel Engine

Decoupled transport layer. The Runtime keeps emitting blocks; channels turn
them into platform-specific messages without ever touching the engine.

### Building blocks
- **`src/channels/types.ts`** — `ChannelAdapter`, `ChannelMessage`
  (text · buttons · quick_reply · image · video · audio · file · location ·
  template), `ChannelSession`, `ChannelUser`, `ChannelEvent`.
- **`channelRegistry`** — single index of available adapters
  (`channelRegistry.list()`, `.get(id)`).
- **`sessionRouter`** — `(channelId, userId) → ChannelSession`, ensuring the
  same conversation is reused across reconnects.
- **`channelBus`** — pub/sub for channel events; every event is mirrored into
  `runtimeEventBus` as `channel:*` so Tracking + Inspector see it.
- **`bootChannels()`** — registers all adapters once on app start
  (`src/main.tsx`) and emits `channel_connected`.

### Adapters
| id          | status | notes |
|-------------|--------|-------|
| `web`       | active | wraps the existing public-runtime (`recordPublicMessage`) |
| `whatsapp`  | stub   | emits events only, ready for Meta Cloud API |
| `instagram` | stub   | ready for IG Messaging API |
| `messenger` | stub   | ready for Messenger Platform |
| `telegram`  | stub   | ready for Bot API |

### Channel Events (mirrored into the runtime bus)
`channel_connected`, `session_opened`, `session_closed`,
`message_sent`, `message_received`.

### Inspector
Internal route **`/channels/debug`** lists adapters, open sessions, and a
live stream of every sent / received message.

### Public Runtime integration
`/bot/:slug` opens a `WebChannel` session right after the runtime session
starts and routes every bot/user message through `webChannelHelpers`.
Visible behaviour is unchanged; the inspector and future omnichannel work
are unlocked.

## Phase 11 — OAuth Foundation + Omnichannel Setup

Architectural groundwork to connect external accounts (Instagram, Facebook,
WhatsApp, Telegram, Google Business) and bind bots to channels. **No real
OAuth flows yet** — every provider is a stub that simulates the handshake
so the UI, store and event bus can be exercised end-to-end.

### Connected Accounts (`src/types/connectedAccount.ts`)
Domain model with fields `id`, `workspaceId`, `provider`, `accountName`,
`accountIdentifier`, `status`, `connectedAt`, `lastSyncAt`, `meta`.
Status: `connected | disconnected | expired | pending`.
Persisted in `localStorage` via `src/oauth/store.ts` (subscribable). The
store also keeps `ChannelBinding` rows linking `bot → account`.

### OAuth Manager (`src/oauth/manager.ts`)
Single facade used by the UI and future webhook layers:
- `oauthManager.connect(workspaceId, provider, name?)`
- `oauthManager.disconnect(accountId)`
- `oauthManager.reconnect(accountId)` (refresh)
- `oauthManager.remove(accountId)`
- `oauthManager.bindBot({ workspaceId, botId, accountId })`
- `oauthManager.unbindBot(botId)`
- `oauthManager.list() / .bindings() / .subscribe()`

Each provider implements `OAuthProvider`:
```ts
connect(input?): Promise<OAuthConnectResult>
disconnect(account): Promise<void>
refresh(account): Promise<OAuthConnectResult>
getStatus(account): Promise<ConnectedAccountStatus>
```
Stubs live in `src/oauth/providers.ts` — when real adapters exist they
replace the stubs one-for-one; consumers do not change.

### Account Center
**Settings → Contas conectadas** lists every account with provider, status,
identifier, connected/last-sync timestamps and a per-account bot binder.
Buttons: **Conectar**, **Desconectar**, **Reconectar**, **Remover**.

### Channel Binding
A bot can be linked to one connected account at a time
(`Bot → ConnectedAccount → Channel`). Bindings are stored in
`oauthStore` and surfaced in the Account Center.

### Inbox Foundation (`src/inbox/sources.ts`)
Declares `ConversationSource` for `web` (ready) and stubs for `instagram`,
`facebook`, `whatsapp`, `telegram`. Future Inbox UI reads from this
registry — no real messages yet.

### Omnichannel Dashboard Widget
`src/components/dashboard/OmnichannelWidget.tsx` shows: connected accounts,
bound bots, active channels, plus a chip row of all inbox sources.

### Events (routed through the existing runtime EventBus)
- `account_connected`
- `account_disconnected`
- `account_reconnected`
- `channel_bound`
- `channel_unbound`

These events are visible in the Event Inspector and consumed by Tracking
Destinations exactly like every other runtime event.

### Migration path to real integrations
When real providers arrive (Meta, WhatsApp Cloud API, Telegram Bot API,
GBP), only `src/oauth/providers.ts` changes — every consumer
(`ConnectedAccountsPanel`, `OmnichannelWidget`, Channel adapters) keeps
working against the same `OAuthProvider` contract.

## Phase 12 — AI Block Engine

Adds first-class AI to FluxBot **without changing the Runtime Engine**.
The AI block is a normal block in the Flow; the engine dispatches to a
provider-agnostic runner and waits for the result before advancing.

### AI Provider Layer (`src/ai`)
Single contract every provider must honour:
```ts
interface AIProvider {
  id: "openai" | "anthropic" | "gemini";
  models: AIModelInfo[];
  generate(input): Promise<AIResponse<string>>;
  extract(input): Promise<AIResponse<Record<string, unknown>>>;
  classify(input): Promise<AIResponse<string>>;
}
```
Stubs ship under `src/ai/providers/` (`openai`, `anthropic`, `gemini`).
Each one returns deterministic mock answers, fake token counts and a real
cost estimate using per-model `inputCostPer1k` / `outputCostPer1k`. Swap
the body of `_mock.ts` with a Lovable AI Gateway call to ship real
providers — every consumer keeps working.

### AI Block (`type: "ai"`)
Configurable through Builder → Propriedades:
- `prompt` (with `{{variavel}}` interpolation)
- `provider` + `model`
- `temperature` + `maxTokens`
- `outputSchema` (string / number / boolean / string[] + enums)
- `mappings` (AI field → flow variable, e.g. `cidade → lead.city`)
- `outputVariable` (raw text fallback)

### Structured Outputs
When `outputSchema` is present the runner calls `provider.extract()` and
validates the JSON with `validateSchema` before merging into the Flow
context. Invalid responses are rejected, logged in the Inspector with
`ok: false`, and the engine falls through to the next block.

### Runtime Integration
`src/runtime/engine.ts` adds:
```ts
case "ai":
  void this.runAiBlock(block);
  return;
```
`runAiBlock` calls `runAiBlock()` from `src/ai/runner`, pushes a bot
transcript with the response, writes mapped variables, emits
`variable_updated` for each, and finally `advanceFrom(block.id)` — the
exact same path every other block uses. The runner also emits a new
`ai_block_executed` event on the runtime EventBus, so the existing
Tracking Engine and Destinations layer pick it up automatically.

### Variable Mapping → CRM
Mappings can target lead-flavoured variables (`lead.tags`, `lead.score`,
`lead.email`, etc.). The existing `crm-bridge` already turns those into
real lead fields, so the AI block can update tags / score / contact data
on a finished flow without bespoke code.

### AI Inspector (Builder → tab "IA")
`src/components/builder/AIInspectorPanel.tsx` shows every recent run:
prompt, response (raw + parsed), provider, model, duration, token usage
and estimated cost. Records are persisted in `localStorage` via
`aiInspector` (ring buffer of 100).

### Cost Tracking
Each `AIRunRecord` stores:
```
provider, model, inputTokens, outputTokens, estimatedCost,
durationMs, sessionId, blockId, flowId, ok, error
```
Aggregates show up at the top of the Inspector (runs, total tokens, $).

### AI Playground (`/ai/playground`)
Stand-alone page to test prompts and schemas without editing a flow.
Pick provider/model, set temperature, paste a JSON schema, and run —
results land in the same Inspector buffer used by the Builder.

### Files
- `src/ai/types.ts` — provider contract, run records, block config
- `src/ai/schema.ts` — runtime schema validator + JSON salvager
- `src/ai/providers/_mock.ts` — shared mock factory (latency + tokens + cost)
- `src/ai/providers/index.ts` — openai / anthropic / gemini stubs
- `src/ai/registry.ts` — provider lookup
- `src/ai/inspector.ts` — localStorage run buffer + pub/sub
- `src/ai/runner.ts` — single entry called by engine + playground
- `src/components/builder/AIBlockEditor.tsx` — block properties UI
- `src/components/builder/AIInspectorPanel.tsx` — Inspector tab + Playground reuse
- `src/pages/AIPlayground.tsx` — `/ai/playground` page

## Phase 13 — Knowledge Base Engine

The AI Block can now answer with workspace-specific knowledge without any
change to the Runtime Engine or the AI providers. Everything sits in
`src/knowledge/*` and is wired into the AI runner through a single
optional `config.knowledge` block.

- **Domain (`src/knowledge/types.ts`)** — `KnowledgeBase`,
  `KnowledgeDocument`, `KnowledgeChunk`, `KnowledgeSearchResult`,
  `KnowledgeUsageRecord`.
- **Storage (`src/knowledge/store.ts`)** — workspace-isolated localStorage
  store for bases, documents and chunks. Designed to be swapped for
  Supabase + pgvector with no consumer changes.
- **Parsing (`src/knowledge/parsers.ts`)** — stubs for PDF, DOCX, TXT, URL
  and pasted text. Ready for Supabase Storage + real extractors.
- **Chunking (`src/knowledge/chunker.ts`)** — configurable strategies:
  `fixed`, `paragraph`, `semantic` (stub falls back to paragraph).
- **Embeddings (`src/knowledge/embeddings/*`)** — `EmbeddingProvider`
  contract. `MockEmbeddingProvider` ships today (deterministic 64-dim
  hash vectors); `OpenAIEmbeddingProvider` and `GeminiEmbeddingProvider`
  are declared as stubs ready for the Lovable AI Gateway.
- **Pipeline (`src/knowledge/pipeline.ts`)** — `ingestDocument` runs
  parse → chunk → embed → persist with per-step status updates.
- **Retrieval (`src/knowledge/retriever.ts`)** — `retrieveKnowledge`
  performs cosine similarity, returns `KnowledgeSearchResult[]`, and
  `formatContext` renders chunks as a prompt-ready block.
- **AI integration (`src/ai/runner.ts`)** — when
  `AIBlockConfig.knowledge.baseId` is set the runner retrieves chunks,
  prepends them as `CONTEXTO DA BASE DE CONHECIMENTO`, and optionally
  stores them in a flow variable. AI providers and the Runtime Engine
  remain untouched.
- **Workspace isolation** — all reads/writes are scoped by `workspaceId`;
  bases never leak across workspaces.
- **Cost tracking (`src/knowledge/cost.ts`)** — every embed and search
  call is logged with provider, model, tokens and estimated cost.
- **Events (`src/knowledge/events.ts`)** — emits `knowledge_uploaded`,
  `knowledge_indexed`, `knowledge_retrieved`, `knowledge_used` on the
  shared `runtimeEventBus`, so the existing Event Inspector and Tracking
  Engine pick them up automatically.
- **Playground (`src/pages/Knowledge.tsx`, route `/knowledge`)** — create
  bases, upload/index content, inspect documents and chunks, run live
  retrieval queries and watch cost stats update.

## Phase 14 — AI Builder Engine

Generate complete bots from a natural-language description without
touching the Runtime, Builder, CRM, AI Block or Knowledge layers.

- **Domain (`src/ai-builder/types.ts`)** — `BotBlueprint`, `FlowBlueprint`,
  `LeadModelBlueprint`, `KnowledgeBlueprint`, `ConversationBlueprint`.
  Blueprints are intermediate; nothing in the Runtime knows about them.
- **Generator (`src/ai-builder/generator.ts`)**
    - Heuristic detection of objective and segment from the prompt.
    - Calls the existing `AIProvider.extract()` so token usage, latency
      and cost flow through the same surfaces as a normal AI Block.
    - Produces a multi-step flow with `start`, `message`, `input`,
      `choice`, `condition`, `ai` and `end` blocks plus a populated CRM
      seed (fields, tags, initial score, pipeline) and Knowledge hints.
    - `blueprintToFlow()` converts a blueprint into a real `Flow`
      (`Block[]` + `Connection[]`) compatible with the Runtime Engine.
    - `materializeBlueprint()` creates the bot via the bot repository,
      persists the flow via the flow repository, and returns the new
      `botId`. Builder, Runtime, CRM, Tracking and Knowledge consume it
      with zero changes.
- **Cost tracking (`src/ai-builder/cost.ts`)** — ring buffer of the last
  50 generations: provider, model, tokens, duration, USD cost and the
  materialized `botId` once published.
- **Events (`src/ai-builder/events.ts`)** — `ai_blueprint_generated`,
  `ai_flow_generated`, `ai_crm_generated`, `ai_knowledge_suggested`,
  `ai_bot_materialized` are emitted into the shared `runtimeEventBus`
  so the Event Inspector and Tracking destinations pick them up.
- **UI (`src/pages/AIBuilder.tsx`, route `/ai-builder`)** — prompt input,
  optional segment/product/process/objective hints, blueprint preview
  with Flow / CRM / Knowledge / Conversation tabs, cost panel, and
  "Abrir no Builder" which materializes and navigates to `/builder/:id`.
- **Bots page CTA (`src/pages/Bots.tsx`)** — new "Gerar com IA" action
  next to "Criar bot" routes to `/ai-builder`.

## Phase 15 — Integration Readiness Layer
- **Compliance domain (`src/compliance/`)** — typed entities for
  `ComplianceDocument`, `ConsentRecord`, `AuditLogEntry`, `CredentialRecord`
  and `ReadinessCheck`. Workspace-scoped localStorage adapters ready to
  swap for Supabase tables without touching pages.
- **Public compliance pages** — `/privacy`, `/terms`, `/data-deletion`
  rendered through `CompliancePublicLayout` with a minimal markdown
  renderer. Required by Meta / Google review and linked from the public
  footer.
- **Compliance Center (`Settings → Compliance`)** — edit Privacy / Terms /
  Data Deletion documents, bump version, open the public page; updates
  emit `privacy_updated` / `terms_updated` and an audit entry.
- **Credentials Manager (`Settings → Credenciais`)** — register OpenAI,
  Anthropic, Gemini, Meta, Google and Webhook secrets. Only masked
  previews live in the UI; full values are slated for Supabase Secrets
  when real integrations land. Validate / rotate / remove flows emit
  `credential_*` events into the shared `runtimeEventBus`.
- **Consent Tracking (`Settings → Consent`)** — LGPD / GDPR / cookies /
  communication consent records per visitor. `recordConsent()` is the
  single entry point used by future public-bot consent UIs.
- **Audit Logs (`Settings → Auditoria`)** — `recordAudit()` captures
  `login`, `logout`, `oauth_connect/disconnect`, `publish_bot`,
  `delete_bot`, `change_workspace`, `knowledge_upload`, plus credential
  and compliance lifecycle events. Ring buffer of the last 1000 entries.
- **Integration Readiness (`Settings → Readiness`)** — live checklist
  scoring Privacy Policy, Terms, Data Deletion URL, Audit Logs, Consent
  Tracking, Meta Review, Google OAuth, Custom Domain and HTTPS. Drives
  the percentage shown at the top of the dashboard.
- **Event Bus integration** — every Phase 15 action funnels through
  `emitComplianceEvent()` so the Event Inspector, Tracking destinations
  and any future Supabase realtime subscriber receive the same payloads.

## Phase 16 — Connector Hub Foundation

Single architectural layer for every external integration. The Runtime, CRM,
Tracking, AI and Knowledge engines never reference a specific vendor — they
only see the **Connector** abstraction.

### Connector Domain (`src/connectors/`)
- **`types.ts`** — `Connector`, `ConnectorManifest`, `ConnectorCredential`,
  `ConnectorAction`, `ConnectorTrigger`, `ConnectorPermission`,
  `ConnectorEvent`, plus the `ConnectorKind` (`app | mcp | api | webhook |
  internal`) and `ConnectorCategory` taxonomy.
- **`registry.ts`** — `connectorRegistry` registers, discovers, lists and
  validates manifests. Marketplace-ready: every manifest carries name,
  description, category, version, author, permissions, actions and triggers.
- **`store.ts`** — workspace-scoped persistence for installations and
  credentials. Credentials are stored with **masked previews** only; real
  secret material is delegated to the Credentials Manager (Phase 15).
- **`events.ts`** — bridges connector lifecycle into `runtimeEventBus`:
  `connector_installed`, `connector_configured`, `connector_connected`,
  `connector_disconnected`, `connector_disabled`, `connector_error`,
  `connector_action_executed`, `connector_trigger_received`.
- **`builtins.ts`** — mocked first-party manifests: Google Sheets, Slack,
  Webhook, Telegram, Stripe, Google Analytics 4.

### Lifecycle
`installed → configured → connected → disconnected | error | disabled` —
exposed through the helpers `installConnector`, `configureConnector`,
`connectConnector`, `disconnectConnector`, `disableConnector`, and
`recordActionExecution`.

### Connector Center (`/connectors`)
New page listing every manifest with status badges, install/configure/connect
controls, a credentials dialog driven by the manifest's `CredentialField[]`
spec, and an expandable view of each connector's actions & triggers.

### Builder Integration
`src/components/builder/ConnectorBlockEditor.tsx` is the future Connector
block editor. It already lets users select **manifest → action → parameters**
visually; runtime execution will plug in when adapters land (per spec the
block has no real execution yet).

### Marketplace Compatibility
Every manifest contains `id`, `name`, `description`, `category`, `version`,
`author`, `permissions`, `actions`, `triggers`, and optional `tags` — making
the same shape valid for a future Lovable marketplace import/export.

## Phase 17 — Real Connectors (Wave 1)

Replaces the mocked Wave-0 adapters with real implementations, while keeping
Runtime, CRM, Tracking, AI and Knowledge completely untouched. All execution
flows through the Connector Hub abstraction added in Phase 16.

### Adapter contract (`src/connectors/adapters/`)
- **`types.ts`** — `ConnectorAdapter.execute(action, ctx)` is the single
  entry point. `ctx` carries decrypted credentials, parameters, manifest, and
  an `AbortSignal`.
- **`registry.ts`** — `adapterRegistry` keyed by `manifest.id`.
- **`webhook.ts`** — universal HTTP client. Supports `GET/POST/PUT/PATCH/DELETE`,
  headers, query params, JSON body, timeout, and four auth modes:
  `bearer`, `basic`, `api_key`, or `none`.
- **`googleSheets.ts`** — Sheets v4 REST: `append_row`, `create_row`,
  `update_row`, `list_rows`, `lookup_row`. Bearer token sourced from the
  Phase-11 OAuth foundation.
- **`telegram.ts`** — Bot API: `send_message`, `send_photo`,
  `send_document`. Exposes a `webhookReceiverPath` for future inbound
  forwarding.
- **`slack.ts`** — Web API: `send_message`, `lookup_channel`,
  `lookup_user`.

### Connector Runtime (`src/connectors/runtime/`)
- **`executor.ts`** — `executeConnectorAction()` resolves the installation +
  manifest + adapter, applies the retry policy (`attempts`, `backoffMs`),
  honors the error policy (`stop_on_error | continue_on_error | fallback`),
  emits lifecycle events (`connector_action_started`,
  `connector_action_completed`, `connector_action_failed`, `connector_retry`)
  and appends each run to `connectorExecutionLog`.
- **`variableMapping.ts`** — `mapResponseToVariables()` resolves dotted paths
  like `response.data.id` or `data.items[0].sku` against the adapter envelope
  so Flow variables are populated declaratively.

### Connector Inspector
`/connectors → Inspector` tab (`ConnectorInspector` component). Pick any
installed connector, choose an action, edit the JSON parameters and the
variable mapping, set retry/backoff/policy and execute. The right panel shows
recent runs with action, duration, attempts, HTTP status, request payload,
response payload and resolved variables.

### Event Bus
New `ConnectorEventType` values are emitted through `runtimeEventBus`, so the
Event Inspector, Tracking destinations and any future Supabase realtime
listener already see the new stream.

## Phase 18 — Lead Intelligence Engine

Adds an intelligence layer that runs *after* lead capture, without touching
Runtime, CRM, Tracking, AI providers or Knowledge Base.

### Domain (`src/intelligence/`)
- **`types.ts`** — `LeadScore`, `LeadSummary`, `LeadInsight`,
  `LeadRecommendation`, `LeadForecast`, `RevenueAttributionRow`,
  `LeadIntelligence` bundle.
- **`scorer.ts`** — Configurable score engine with 7 weighted factors
  (completeness, source, campaign, interaction, answers, AI classification,
  recency). Returns a 0–100 score with a reasoning trace and derived
  temperature (`frio | morno | quente`).
- **`summary.ts`** — Deterministic narrative generator with
  `buildSummaryPrompt()` ready to be consumed by any AIProvider
  (Phase 12) — interest, goal, budget, timeframe, objections, urgency.
- **`insights.ts`** — Channel/campaign efficiency, likely next stage,
  abandon risk, engagement trend.
- **`recommendations.ts`** — Next action, best time, best channel,
  suggested message draft, rationale.
- **`forecast.ts`** — Conversion probability, expected revenue and
  expected close date.
- **`attribution.ts`** — `buildAttributionRow()` + `summarizeAttribution()`
  using Tracking + CRM data to relate Source / Campaign / Lead / Revenue.
- **`engine.ts`** — `computeLeadIntelligence(lead, ctx)` aggregator that
  returns the full bundle ready for the UI.
- **`events.ts`** — Bridges `lead_scored`, `lead_summary_generated`,
  `lead_insight_generated`, `lead_recommendation_generated`,
  `lead_forecast_generated` onto the shared `runtimeEventBus`.

### UI
- **Lead Detail → Intelligence tab** (`LeadIntelligencePanel`) — Renders
  score breakdown, narrative summary, recommendation, insights and
  forecast for any lead.
- **Dashboard → Lead Intelligence widget** — Hot/cold leads count,
  average score, attributed revenue and top campaigns.

### AI Integration
`generateSummary()` accepts a `provider` id and `buildSummaryPrompt()`
emits a structured prompt so any registered AIProvider can replace the
mock summarizer without changes to the engine signature or events.
