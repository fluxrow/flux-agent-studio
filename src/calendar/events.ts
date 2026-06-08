import type { ID, ISODate } from "@/types/common";

export type CalendarEventType =
  | "calendar_connected"
  | "calendar_disconnected"
  | "calendar_event_created"
  | "calendar_event_updated"
  | "calendar_event_cancelled"
  | "calendar_sync_failed";

export interface CalendarConnectedPayload {
  userId: ID;
  email: string;
}

export interface CalendarDisconnectedPayload {
  userId: ID;
  reason: string;
}

export interface CalendarEventCreatedPayload {
  eventId: ID;
  externalEventId: string;
  leadId?: ID;
  meetLink?: string;
  startAt: ISODate;
  workspaceId: ID;
}

export interface CalendarEventUpdatedPayload {
  eventId: ID;
  externalEventId: string;
  changes: Record<string, unknown>;
  workspaceId: ID;
}

export interface CalendarEventCancelledPayload {
  eventId: ID;
  externalEventId: string;
  leadId?: ID;
  workspaceId: ID;
}

export interface CalendarSyncFailedPayload {
  userId: ID;
  code: string;
  message: string;
}
