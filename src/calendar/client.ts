/**
 * Fetch wrapper for Google Calendar API v3.
 *
 * - Injects Authorization header automatically
 * - Intercepts 401 → refreshes token once → retries
 * - Throws CalendarApiError with status + message for all non-2xx
 */
import { GOOGLE_CALENDAR_API } from "./oauth/config";
import { getValidToken, clearTokenCache } from "./oauth/tokens";

export class CalendarApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly body?: unknown
  ) {
    super(`Google Calendar API ${status}: ${message}`);
    this.name = "CalendarApiError";
  }
}

export async function calendarFetch<T = unknown>(
  userId: string,
  workspaceId: string,
  path: string,
  init: RequestInit = {},
  retried = false
): Promise<T> {
  const token = await getValidToken(userId, workspaceId);

  const res = await fetch(`${GOOGLE_CALENDAR_API}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token.accessToken}`,
      ...(init.headers ?? {}),
    },
  });

  if (res.status === 401 && !retried) {
    clearTokenCache(userId, workspaceId);
    return calendarFetch<T>(userId, workspaceId, path, init, true);
  }

  if (!res.ok) {
    const body = await res.json().catch(() => null) as {
      error?: { message?: string };
    } | null;
    throw new CalendarApiError(
      res.status,
      body?.error?.message ?? res.statusText,
      body
    );
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
