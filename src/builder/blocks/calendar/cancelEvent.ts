/**
 * Builder block: calendar.cancel_event
 *
 * Cancels a Google Calendar event. Reads externalEventId from a flow
 * variable, deletes on Google, marks local row cancelled, emits
 * calendar_event_cancelled runtime event.
 *
 * Config shape:
 *   userId:              string — flow variable; falls back to auth.userId
 *   workspaceId:         string — flow variable; falls back to auth.workspaceId
 *   externalEventIdVar:  string — flow variable holding Google event ID
 *   calendarId:          string — default "primary"
 */
import type { BlockConfig } from "@/types";
import { cancelEvent } from "@/calendar/events-api";

export const BLOCK_TYPE = "calendar_cancel_event" as const;

export interface CancelEventBlockConfig extends BlockConfig {
  userId?: string;
  workspaceId?: string;
  externalEventIdVar?: string;
  calendarId?: string;
}

export async function executeCancelEvent(
  config: CancelEventBlockConfig,
  variables: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const userId =
    (config.userId ? variables[config.userId] as string : null) ??
    variables["auth.userId"] as string;
  const workspaceId =
    (config.workspaceId ? variables[config.workspaceId] as string : null) ??
    variables["auth.workspaceId"] as string;

  const externalEventId = config.externalEventIdVar
    ? (variables[config.externalEventIdVar] as string)
    : (variables["calendar.event_id"] as string);

  if (!userId) throw new Error("calendar.cancel_event: userId não disponível.");
  if (!workspaceId) throw new Error("calendar.cancel_event: workspaceId não disponível.");
  if (!externalEventId) throw new Error("calendar.cancel_event: externalEventId não disponível.");

  await cancelEvent({
    userId,
    workspaceId,
    externalEventId,
    calendarId: config.calendarId,
  });

  return { "calendar.cancelled": true };
}
