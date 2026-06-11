import type { ID, ISODate } from "@/types/common";

export interface OAuthToken {
  userId: ID;
  workspaceId: ID;
  googleSub: string;
  email: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: ISODate;
  scopes: string[];
  defaultCalendarId: string;
}

export interface CalendarEvent {
  id: ID;
  workspaceId: ID;
  userId: ID;
  leadId?: ID;
  sessionId?: ID;
  externalEventId: string;
  calendarId: string;
  summary: string;
  description?: string;
  startAt: ISODate;
  endAt: ISODate;
  timezone: string;
  attendees: CalendarAttendee[];
  meetLink?: string;
  status: "confirmed" | "tentative" | "cancelled";
  etag?: string;
  sequence?: number;
  googleUpdatedAt?: ISODate;
  createdAt: ISODate;
  updatedAt: ISODate;
}

export interface CalendarAttendee {
  email: string;
  responseStatus?: "accepted" | "declined" | "tentative" | "needsAction";
  displayName?: string;
  self?: boolean;
  organizer?: boolean;
}

export interface FreeBusyWindow {
  start: ISODate;
  end: ISODate;
}

export interface TimeSlot {
  start: ISODate;
  end: ISODate;
}

export interface WorkingHours {
  days: number[];      // 0=Sun 1=Mon ... 6=Sat
  startHour: number;   // e.g. 9
  endHour: number;     // e.g. 18
  timezone: string;    // e.g. "America/Sao_Paulo"
}

export interface CreateEventInput {
  userId: ID;
  workspaceId: ID;
  leadId?: ID;
  sessionId?: ID;
  calendarId?: string;
  summary: string;
  description?: string;
  startAt: ISODate;
  durationMinutes: number;
  timezone?: string;
  attendees?: CalendarAttendee[];
  withMeet?: boolean;
}

export interface UpdateEventInput {
  userId: ID;
  workspaceId: ID;
  externalEventId: string;
  calendarId?: string;
  summary?: string;
  description?: string;
  startAt?: ISODate;
  durationMinutes?: number;
  attendees?: CalendarAttendee[];
}

export interface CancelEventInput {
  userId: ID;
  workspaceId: ID;
  externalEventId: string;
  calendarId?: string;
}

export interface CheckAvailabilityInput {
  userId: ID;
  workspaceId: ID;
  calendarId?: string;
  from: ISODate;
  to: ISODate;
  slotMinutes?: number;
  workingHours?: WorkingHours;
}

export interface WatchChannel {
  id: ID;
  userId: ID;
  calendarId: string;
  channelId: string;
  resourceId: string;
  channelToken: string;
  expiresAt: ISODate;
  syncToken?: string;
}
