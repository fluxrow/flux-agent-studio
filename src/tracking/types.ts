/**
 * Tracking Core types.
 *
 * The Tracking Engine sits between the runtime Event Bus and the persistence
 * layer. It enriches every runtime event with a visitor profile + attribution
 * context so analytics can be built on top without coupling to any specific
 * destination (Meta, Google, n8n, etc.).
 */

export interface VisitorProfile {
  visitorId: string;
  firstSeenAt: string;
  lastSeenAt: string;
  browser?: string;
  os?: string;
  deviceType?: "desktop" | "mobile" | "tablet" | "unknown";
  language?: string;
  timezone?: string;
  country?: string;
  state?: string;
  city?: string;
  referrer?: string;
  landingPage?: string;
  userAgent?: string;
}

export interface Attribution {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  fbclid?: string;
  gclid?: string;
  ttclid?: string;
  msclkid?: string;
  referrer?: string;
  landingPage?: string;
  capturedAt: string;
}

export type TrackedEventType =
  | "page_view"
  | "bot_loaded"
  | "flow_started"
  | "flow_completed"
  | "flow_abandoned"
  | "block_entered"
  | "block_exited"
  | "input_received"
  | "choice_selected"
  | "condition_evaluated"
  | "variable_updated"
  | "lead_created"
  | "lead_updated"
  | "session_started"
  | "session_ended";

export interface TrackedEvent {
  id: string;
  type: TrackedEventType;
  at: string;
  visitorId: string;
  sessionId?: string;
  botId?: string;
  workspaceId?: string;
  blockId?: string;
  durationMs?: number;
  payload: Record<string, unknown>;
}
