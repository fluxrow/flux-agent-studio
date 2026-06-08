/**
 * Builder block: calendar.create_event
 *
 * Creates a Google Calendar event from flow variables, optionally
 * with Google Meet. Writes event_id and meet_link back to variables.
 *
 * Config shape:
 *   userId:           string — flow variable; falls back to auth.userId
 *   workspaceId:      string — flow variable; falls back to auth.workspaceId
 *   leadId:           string — flow variable (optional)
 *   summaryVariable:  string — flow variable for event title
 *   summaryDefault:   string — static title if summaryVariable not set
 *   descriptionVar:   string — flow variable for description
 *   startAtVariable:  string — flow variable (ISO datetime)
 *   durationMinutes:  number — default 30
 *   attendeesVar:     string — flow variable (JSON array of {email})
 *   withMeet:         boolean — create Google Meet link; default true
 *   outputEventId:    string — variable to write event_id
 *   outputMeetLink:   string — variable to write meet_link
 */
import type { BlockConfig } from "@/types";
import { createEvent } from "@/calendar/events-api";

export const BLOCK_TYPE = "calendar_create_event" as const;

export interface CreateEventBlockConfig extends BlockConfig {
  userId?: string;
  workspaceId?: string;
  leadId?: string;
  summaryVariable?: string;
  summaryDefault?: string;
  descriptionVar?: string;
  startAtVariable?: string;
  durationMinutes?: number;
  attendeesVar?: string;
  withMeet?: boolean;
  outputEventId?: string;
  outputMeetLink?: string;
}

export async function executeCreateEvent(
  config: CreateEventBlockConfig,
  variables: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const userId =
    (config.userId ? variables[config.userId] as string : null) ??
    variables["auth.userId"] as string;
  const workspaceId =
    (config.workspaceId ? variables[config.workspaceId] as string : null) ??
    variables["auth.workspaceId"] as string;

  if (!userId) throw new Error("calendar.create_event: userId não disponível.");
  if (!workspaceId) throw new Error("calendar.create_event: workspaceId não disponível.");

  const summary =
    (config.summaryVariable ? variables[config.summaryVariable] as string : null) ??
    config.summaryDefault ??
    "Reunião agendada";

  const description = config.descriptionVar
    ? (variables[config.descriptionVar] as string | undefined)
    : undefined;

  const startAt = config.startAtVariable
    ? (variables[config.startAtVariable] as string)
    : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  const leadId = config.leadId ? (variables[config.leadId] as string | undefined) : undefined;

  const attendees = (() => {
    if (!config.attendeesVar) return undefined;
    const raw = variables[config.attendeesVar];
    if (!raw) return undefined;
    try {
      return typeof raw === "string" ? JSON.parse(raw) : raw as Array<{ email: string }>;
    } catch {
      return undefined;
    }
  })();

  const event = await createEvent({
    userId,
    workspaceId,
    leadId,
    summary,
    description,
    startAt,
    durationMinutes: config.durationMinutes ?? 30,
    attendees,
    withMeet: config.withMeet !== false, // default true
  });

  const out: Record<string, unknown> = {};
  if (config.outputEventId) out[config.outputEventId] = event.externalEventId;
  if (config.outputMeetLink) out[config.outputMeetLink] = event.meetLink ?? null;
  out["calendar.event_id"] = event.externalEventId;
  out["calendar.meet_link"] = event.meetLink ?? null;
  out["calendar.start_at"] = event.startAt;

  return out;
}
