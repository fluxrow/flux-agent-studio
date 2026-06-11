# Phase 1 cleanup backlog

This backlog records cleanup findings only. It does not authorize feature
development, production deployment, or destructive database changes.

## Completed in the current batch

- Protected Meta credentials behind sanitized, role-checked RPCs.
- Restricted Meta webhook routing and inbound persistence RPCs to service role.
- Made inbound Meta message storage idempotent before incrementing unread state.
- Hardened Meta webhook signatures, required configuration, and retry behavior.
- Preserved delivered outbound Meta messages when local persistence fails.
- Restricted Calendar watch refresh to authenticated internal calls.
- Required session-bound tokens and rate limits for all public runtime writes.
- Isolated Google Calendar credentials, watches, and events by workspace.
- Added complete Google Calendar pagination and corrected the OAuth redirect.
- Prevented ambiguous active Meta routing across workspaces.
- Replaced the misleading `notImplemented` repository filename and typed its
  operational implementations.
- Expanded execution event contracts and removed event-bus escape casts.
- Added CI, focused tests, deployment ordering, and security runbooks.

## P0 before production use

- Apply and verify the hardening migration in a staging Supabase project before
  any frontend deployment.
- Add integration tests for Meta webhook replay, ambiguous connection routing,
  outbound delivery with persistence failure, and Calendar renewal failures.
- Validate existing production data for duplicate active Meta identifiers before
  creating the new unique indexes.
- Verify the user/workspace Calendar constraint migration and paginated sync
  against a staging Google account with more than 250 events.
- Move the Meta-to-CRM bridge out of the browser and enforce a server-side
  idempotency key. The current bridge can create duplicate leads.
- Audit every repository `getById`, update, and delete operation for explicit
  workspace ownership instead of relying only on caller-provided IDs.
- Regenerate Supabase types after migrations so frontend code can remove
  untyped RPC client casts.

## P1 architecture cleanup

- Choose one canonical Meta integration path. The repository currently contains
  both real Edge Function flows and connector/channel stubs.
- Connect Calendar modules to the Runtime/Builder only after their ownership
  and execution contracts are defined; today they are largely isolated.
- Consolidate Workspace, Brand, Project, and Client terminology before adding
  the Brand Context model.
- Centralize compliance persistence and remove direct workspace assumptions.
- Version Meta Graph API configuration and add an explicit upgrade policy.
- Add outbound Meta idempotency keys and replay protection for Calendar webhook
  message numbers.
- Add a distributed claim/lock for concurrent Calendar watch renewal workers.

## Removal candidates requiring usage confirmation

- Internal AI playground and beta routes that are not part of the MVP.
- Demo-only providers, sample connectors, and placeholder channel adapters.
- Dead documentation and route aliases tied to FluxBot or Flux Agent Studio.
- Incomplete modules that have no runtime caller, persisted data, or owned UI.

Removal must follow route/import/runtime tracing. No candidate should be deleted
solely because static search reports no frontend import.
