/**
 * Google Calendar events CRUD.
 *
 * createEvent  — creates event, optionally adds Google Meet
 * updateEvent  — patches summary / description / time / attendees
 * cancelEvent  — deletes event (sendUpdates=all)
 *
 * All operations persist to `calendar_events` and emit runtime events
 * via calendarBridge.
 */
import { calendarFetch } from "./client";
import { buildMeetConferenceData, extractMeetLink } from "./meet";
import { getValidToken } from "./oauth/tokens";
import { calendarBridge } from "./bridge";
import type {
  CalendarEvent,
  CreateEventInput,
  UpdateEventInput,
  CancelEventInput,
} from "./types";

function randomId(): string {
  return crypto.randomUUID();
}

function endTime(startAt: string, durationMinutes: number): string {
  return new Date(
    new Date(startAt).getTime() + durationMinutes * 60 * 1000
  ).toISOString();
}

export async function createEvent(input: CreateEventInput): Promise<CalendarEvent> {
  const token = await getValidToken(input.userId);
  const calId = input.calendarId ?? token.defaultCalendarId;
  const tz = input.timezone ?? "America/Sao_Paulo";
  const end = endTime(input.startAt, input.durationMinutes);

  const requestId = randomId();

  const body: Record<string, unknown> = {
    summary: input.summary,
    description: input.description ?? "",
    start: { dateTime: input.startAt, timeZone: tz },
    end: { dateTime: end, timeZone: tz },
    attendees: (input.attendees ?? []).map((a) => ({ email: a.email })),
  };

  if (input.withMeet) {
    body.conferenceData = buildMeetConferenceData(requestId);
  }

  const qs = input.withMeet ? "?conferenceDataVersion=1&sendUpdates=all" : "?sendUpdates=all";
  const raw = await calendarFetch<Record<string, unknown>>(
    input.userId,
    `/calendars/${encodeURIComponent(calId)}/events${qs}`,
    { method: "POST", body: JSON.stringify(body) }
  );

  const meetLink = input.withMeet ? extractMeetLink(raw) : undefined;

  const event = await calendarBridge.afterCreate({
    workspaceId: input.workspaceId,
    userId: input.userId,
    leadId: input.leadId,
    sessionId: input.sessionId,
    externalEventId: raw.id as string,
    calendarId: calId,
    summary: input.summary,
    description: input.description,
    startAt: input.startAt,
    endAt: end,
    timezone: tz,
    attendees: input.attendees ?? [],
    meetLink,
    etag: raw.etag as string | undefined,
    sequence: raw.sequence as number | undefined,
    googleUpdatedAt: raw.updated as string | undefined,
  });

  return event;
}

export async function updateEvent(input: UpdateEventInput): Promise<CalendarEvent> {
  const token = await getValidToken(input.userId);
  const calId = input.calendarId ?? token.defaultCalendarId;

  const patch: Record<string, unknown> = {};
  if (input.summary) patch.summary = input.summary;
  if (input.description !== undefined) patch.description = input.description;
  if (input.startAt && input.durationMinutes) {
    const tz = "America/Sao_Paulo";
    patch.start = { dateTime: input.startAt, timeZone: tz };
    patch.end = { dateTime: endTime(input.startAt, input.durationMinutes), timeZone: tz };
  }
  if (input.attendees) {
    patch.attendees = input.attendees.map((a) => ({ email: a.email }));
  }

  const raw = await calendarFetch<Record<string, unknown>>(
    input.userId,
    `/calendars/${encodeURIComponent(calId)}/events/${encodeURIComponent(input.externalEventId)}?sendUpdates=all`,
    { method: "PATCH", body: JSON.stringify(patch) }
  );

  return calendarBridge.afterUpdate(input.workspaceId, input.externalEventId, {
    summary: raw.summary as string,
    startAt: (raw.start as { dateTime?: string })?.dateTime,
    endAt: (raw.end as { dateTime?: string })?.dateTime,
    googleUpdatedAt: raw.updated as string,
  });
}

export async function cancelEvent(input: CancelEventInput): Promise<void> {
  const token = await getValidToken(input.userId);
  const calId = input.calendarId ?? token.defaultCalendarId;

  await calendarFetch(
    input.userId,
    `/calendars/${encodeURIComponent(calId)}/events/${encodeURIComponent(input.externalEventId)}?sendUpdates=all`,
    { method: "DELETE" }
  );

  await calendarBridge.afterCancel(input.workspaceId, input.userId, input.externalEventId);
}
