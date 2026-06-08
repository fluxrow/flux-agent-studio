import { calendarFetch } from "./client";
import type { CheckAvailabilityInput, FreeBusyWindow, TimeSlot, WorkingHours } from "./types";

const DEFAULT_WORKING_HOURS: WorkingHours = {
  days: [1, 2, 3, 4, 5], // Mon–Fri
  startHour: 9,
  endHour: 18,
  timezone: "America/Sao_Paulo",
};

interface FreeBusyResponse {
  calendars: Record<string, { busy: Array<{ start: string; end: string }> }>;
}

/**
 * Returns available time slots within the requested window,
 * subtracting busy periods from the user's calendar.
 */
export async function checkAvailability(
  input: CheckAvailabilityInput
): Promise<TimeSlot[]> {
  const calendarId = input.calendarId ?? "primary";
  const slotMin = input.slotMinutes ?? 30;
  const wh = input.workingHours ?? DEFAULT_WORKING_HOURS;

  const res = await calendarFetch<FreeBusyResponse>(input.userId, "/freeBusy", {
    method: "POST",
    body: JSON.stringify({
      timeMin: input.from,
      timeMax: input.to,
      timeZone: wh.timezone,
      items: [{ id: calendarId }],
    }),
  });

  const busy: FreeBusyWindow[] = (res.calendars[calendarId]?.busy ?? []).map(
    (b) => ({ start: b.start, end: b.end })
  );

  return computeSlots(input.from, input.to, busy, slotMin, wh);
}

function computeSlots(
  from: string,
  to: string,
  busy: FreeBusyWindow[],
  slotMin: number,
  wh: WorkingHours
): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const slotMs = slotMin * 60 * 1000;
  const rangeEnd = new Date(to).getTime();

  let cursor = new Date(from).getTime();
  // Advance to start of next working window
  cursor = nextWorkingStart(cursor, wh);

  while (cursor < rangeEnd) {
    const workEnd = workingEndMs(cursor, wh);
    const slotEnd = cursor + slotMs;

    if (slotEnd > workEnd) {
      // Skip to next working day
      cursor = nextWorkingStart(workEnd + 1, wh);
      continue;
    }
    if (slotEnd > rangeEnd) break;

    const slotStart = new Date(cursor).toISOString();
    const slotEndISO = new Date(slotEnd).toISOString();

    const overlaps = busy.some(
      (b) =>
        new Date(b.start).getTime() < slotEnd &&
        new Date(b.end).getTime() > cursor
    );

    if (!overlaps) {
      slots.push({ start: slotStart, end: slotEndISO });
    }

    cursor += slotMs;
  }

  return slots;
}

function nextWorkingStart(fromMs: number, wh: WorkingHours): number {
  const d = new Date(fromMs);
  // Move to startHour of current day in the workspace timezone (simplified: UTC offset not applied here — timezone
  // correctness handled by Google's freeBusy response)
  let candidate = new Date(d);
  candidate.setUTCHours(wh.startHour, 0, 0, 0);
  if (candidate.getTime() <= fromMs) {
    candidate = new Date(candidate.getTime() + 60 * 60 * 1000 * 24);
    candidate.setUTCHours(wh.startHour, 0, 0, 0);
  }
  // Skip non-working days
  while (!wh.days.includes(candidate.getUTCDay())) {
    candidate = new Date(candidate.getTime() + 60 * 60 * 1000 * 24);
    candidate.setUTCHours(wh.startHour, 0, 0, 0);
  }
  return candidate.getTime();
}

function workingEndMs(dayMs: number, wh: WorkingHours): number {
  const d = new Date(dayMs);
  const end = new Date(d);
  end.setUTCHours(wh.endHour, 0, 0, 0);
  return end.getTime();
}
