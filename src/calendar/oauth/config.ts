export const GCAL_CLIENT_ID =
  (import.meta.env.VITE_GCAL_CLIENT_ID as string | undefined) ?? "";

const SUPABASE_URL =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined) ?? "";

export const GCAL_REDIRECT_URI =
  (import.meta.env.VITE_GCAL_REDIRECT_URI as string | undefined) ??
  `${SUPABASE_URL}/functions/v1/google-oauth-callback`;

export const GCAL_SCOPES = [
  "openid",
  "email",
  "profile",
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/calendar.readonly",
].join(" ");

export const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
export const GOOGLE_CALENDAR_API = "https://www.googleapis.com/calendar/v3";
