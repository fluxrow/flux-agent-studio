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
