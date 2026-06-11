/**
 * Builder block: calendar.check_availability
 *
 * Checks free slots in a user's Google Calendar and stores results
 * in a flow variable (`available_slots: ISO[]`).
 *
 * Config shape (BlockConfig extension):
 *   userId:         string  — flow variable holding the connected user's ID
 *   calendarId:     string  — default "primary"
 *   fromVariable:   string  — flow variable for range start (ISO); defaults to now
 *   toVariable:     string  — flow variable for range end (ISO); defaults to now+7d
 *   slotMinutes:    number  — default 30
 *   outputVariable: string  — variable to write slots to; default "available_slots"
 */
import type { BlockConfig } from "@/types";
import { checkAvailability } from "@/calendar/freebusy";

export const BLOCK_TYPE = "calendar_check_availability" as const;

export interface CheckAvailabilityBlockConfig extends BlockConfig {
  userId?: string;
  workspaceId?: string;
  calendarId?: string;
  fromVariable?: string;
  toVariable?: string;
  slotMinutes?: number;
  outputVariable?: string;
}

export async function executeCheckAvailability(
  config: CheckAvailabilityBlockConfig,
  variables: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const userId = (config.userId
    ? (variables[config.userId] as string)
    : undefined) ?? (variables["auth.userId"] as string | undefined);

  if (!userId) throw new Error("calendar.check_availability: userId não encontrado nas variáveis.");
  const workspaceId = (config.workspaceId
    ? (variables[config.workspaceId] as string)
    : undefined) ?? (variables["auth.workspaceId"] as string | undefined);
  if (!workspaceId) {
    throw new Error("calendar.check_availability: workspaceId não encontrado nas variáveis.");
  }

  const from = (config.fromVariable ? variables[config.fromVariable] as string : null)
    ?? new Date().toISOString();
  const to = (config.toVariable ? variables[config.toVariable] as string : null)
    ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const slots = await checkAvailability({
    userId,
    workspaceId,
    calendarId: config.calendarId,
    from,
    to,
    slotMinutes: config.slotMinutes ?? 30,
  });

  const outputVar = config.outputVariable ?? "available_slots";
  return { [outputVar]: slots };
}
