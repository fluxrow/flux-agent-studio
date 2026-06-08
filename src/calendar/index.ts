/**
 * Google Calendar integration — public entry point.
 */

export { initiateAuth, validateState } from "./oauth/flow";
export { getValidToken, clearTokenCache } from "./oauth/tokens";
export { checkAvailability } from "./freebusy";
export { createEvent, updateEvent, cancelEvent } from "./events-api";
export { registerWatch, unregisterWatch, renewWatch } from "./sync/push";
export { calendarBridge } from "./bridge";
export type {
  CalendarEvent,
  FreeBusyWindow,
  TimeSlot,
  OAuthToken,
  CreateEventInput,
  UpdateEventInput,
  CancelEventInput,
  CheckAvailabilityInput,
  WorkingHours,
} from "./types";
