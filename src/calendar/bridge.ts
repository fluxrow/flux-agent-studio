/**
 * Calendar → CRM bridge.
 *
 * After every calendar event mutation:
 *  1. Upserts `calendar_events` in Supabase
 *  2. Updates the linked lead (stage, next_action_at)
 *  3. Emits runtime events on runtimeEventBus
 */
import { createClient } from "@supabase/supabase-js";
import { runtimeEventBus } from "@/runtime/events";
import type { CalendarEvent } from "./types";
import type { ID } from "@/types/common";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

function supabase() {
  return createClient(SUPABASE_URL, SUPABASE_KEY);
}

interface CreatePayload {
  workspaceId: ID;
  userId: ID;
  leadId?: ID;
  sessionId?: ID;
  externalEventId: string;
  calendarId: string;
  summary: string;
  description?: string;
  startAt: string;
  endAt: string;
  timezone: string;
  attendees: unknown[];
  meetLink?: string;
  etag?: string;
  sequence?: number;
  googleUpdatedAt?: string;
}

async function afterCreate(payload: CreatePayload): Promise<CalendarEvent> {
  const db = supabase();
  const now = new Date().toISOString();

  const row = {
    workspace_id: payload.workspaceId,
    user_id: payload.userId,
    lead_id: payload.leadId ?? null,
    session_id: payload.sessionId ?? null,
    external_event_id: payload.externalEventId,
    calendar_id: payload.calendarId,
    summary: payload.summary,
    description: payload.description ?? null,
    start_at: payload.startAt,
    end_at: payload.endAt,
    timezone: payload.timezone,
    attendees: JSON.stringify(payload.attendees),
    meet_link: payload.meetLink ?? null,
    status: "confirmed",
    etag: payload.etag ?? null,
    sequence: payload.sequence ?? null,
    google_updated_at: payload.googleUpdatedAt ?? null,
    created_at: now,
    updated_at: now,
  };

  const { data, error } = await db
    .from("calendar_events")
    .insert(row)
    .select()
    .single();

  if (error) {
    console.error("[calendarBridge] afterCreate insert error", error);
    throw error;
  }

  // Update lead stage
  if (payload.leadId) {
    await db
      .from("leads")
      .update({
        stage: "scheduled",
        next_action_at: payload.startAt,
        updated_at: now,
      })
      .eq("id", payload.leadId)
      .eq("workspace_id", payload.workspaceId);
  }

  // Emit runtime event
  runtimeEventBus.emit({
    id: crypto.randomUUID(),
    type: "lead_updated",
    sessionId: payload.sessionId ?? crypto.randomUUID(),
    flowId: "calendar",
    workspaceId: payload.workspaceId,
    at: now,
    payload: {
      _calendarEventType: "calendar_event_created",
      eventId: data.id,
      externalEventId: payload.externalEventId,
      leadId: payload.leadId,
      meetLink: payload.meetLink,
      startAt: payload.startAt,
      workspaceId: payload.workspaceId,
    },
  });

  return rowToCalendarEvent(data);
}

async function afterUpdate(
  workspaceId: ID,
  externalEventId: string,
  changes: {
    summary?: string;
    startAt?: string;
    endAt?: string;
    googleUpdatedAt?: string;
  }
): Promise<CalendarEvent> {
  const db = supabase();
  const now = new Date().toISOString();

  const patch: Record<string, unknown> = { updated_at: now };
  if (changes.summary) patch.summary = changes.summary;
  if (changes.startAt) patch.start_at = changes.startAt;
  if (changes.endAt) patch.end_at = changes.endAt;
  if (changes.googleUpdatedAt) patch.google_updated_at = changes.googleUpdatedAt;

  const { data, error } = await db
    .from("calendar_events")
    .update(patch)
    .eq("external_event_id", externalEventId)
    .eq("workspace_id", workspaceId)
    .select()
    .single();

  if (error) throw error;

  // Update lead next_action_at if start changed
  if (changes.startAt && data.lead_id) {
    await db
      .from("leads")
      .update({ next_action_at: changes.startAt, updated_at: now })
      .eq("id", data.lead_id)
      .eq("workspace_id", workspaceId);
  }

  runtimeEventBus.emit({
    id: crypto.randomUUID(),
    type: "lead_updated",
    sessionId: crypto.randomUUID(),
    flowId: "calendar",
    workspaceId,
    at: now,
    payload: {
      _calendarEventType: "calendar_event_updated",
      eventId: data.id,
      externalEventId,
      changes,
      workspaceId,
    },
  });

  return rowToCalendarEvent(data);
}

async function afterCancel(
  workspaceId: ID,
  userId: ID,
  externalEventId: string
): Promise<void> {
  const db = supabase();
  const now = new Date().toISOString();

  const { data } = await db
    .from("calendar_events")
    .update({ status: "cancelled", updated_at: now })
    .eq("external_event_id", externalEventId)
    .eq("workspace_id", workspaceId)
    .select("id, lead_id")
    .single();

  runtimeEventBus.emit({
    id: crypto.randomUUID(),
    type: "lead_updated",
    sessionId: crypto.randomUUID(),
    flowId: "calendar",
    workspaceId,
    at: now,
    payload: {
      _calendarEventType: "calendar_event_cancelled",
      eventId: data?.id,
      externalEventId,
      leadId: data?.lead_id,
      workspaceId,
    },
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToCalendarEvent(row: Record<string, any>): CalendarEvent {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    userId: row.user_id,
    leadId: row.lead_id ?? undefined,
    sessionId: row.session_id ?? undefined,
    externalEventId: row.external_event_id,
    calendarId: row.calendar_id,
    summary: row.summary,
    description: row.description ?? undefined,
    startAt: row.start_at,
    endAt: row.end_at,
    timezone: row.timezone,
    attendees: typeof row.attendees === "string"
      ? JSON.parse(row.attendees)
      : (row.attendees ?? []),
    meetLink: row.meet_link ?? undefined,
    status: row.status,
    etag: row.etag ?? undefined,
    sequence: row.sequence ?? undefined,
    googleUpdatedAt: row.google_updated_at ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const calendarBridge = { afterCreate, afterUpdate, afterCancel };
