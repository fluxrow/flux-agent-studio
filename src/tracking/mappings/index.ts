/**
 * Event Mapping Layer.
 *
 * Pure functions that translate FluxBot's internal tracked events into
 * the canonical event names used by external destinations.
 *
 * The Runtime keeps emitting only internal events; adapters consult this
 * table when deciding what (if anything) to forward.
 */
import type { TrackedEvent, TrackedEventType } from "../types";

export interface ExternalMapping {
  meta?: string[];   // Meta Pixel / CAPI event names
  google?: string[]; // GA4 / Measurement Protocol event names
}

export const EVENT_MAP: Record<TrackedEventType, ExternalMapping> = {
  page_view:           { meta: ["PageView"],            google: ["page_view"] },
  bot_loaded:          { meta: ["ViewContent"],         google: ["page_view"] },
  session_started:     { meta: ["ViewContent"],         google: ["session_start"] },
  session_ended:       {},
  flow_started:        { meta: ["InitiateCheckout"],    google: ["begin_checkout"] },
  flow_completed:      { meta: ["Lead"],                google: ["generate_lead"] },
  flow_abandoned:      {},
  block_entered:       {},
  block_exited:        {},
  input_received:      {},
  choice_selected:     {},
  condition_evaluated: {},
  variable_updated:    {},
  lead_created:        { meta: ["CompleteRegistration"], google: ["generate_lead"] },
  lead_updated:        {},
};

export function mappingsFor(type: TrackedEventType): ExternalMapping {
  return EVENT_MAP[type] ?? {};
}

/** Convenience helper to extract common payload fields safely. */
export function commonContext(ev: TrackedEvent) {
  return {
    event_id: ev.id,
    event_time: ev.at,
    visitor_id: ev.visitorId,
    session_id: ev.sessionId,
    bot_id: ev.botId,
    workspace_id: ev.workspaceId,
  };
}
