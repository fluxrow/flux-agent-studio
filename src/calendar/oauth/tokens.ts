/**
 * Authenticated Google Calendar token broker.
 *
 * Refresh tokens and token-table rows stay server-side. The browser receives
 * only the short-lived access token required by the existing calendar client.
 */
import { supabase } from "@/integrations/supabase/client";
import type { OAuthToken } from "../types";

const REFRESH_BUFFER_MS = 5 * 60 * 1000;
const tokenCache = new Map<string, OAuthToken>();

function cacheKey(userId: string, workspaceId: string): string {
  return `${workspaceId}:${userId}`;
}

export async function getValidToken(
  userId: string,
  workspaceId: string,
): Promise<OAuthToken> {
  const key = cacheKey(userId, workspaceId);
  const cached = tokenCache.get(key);
  if (cached && new Date(cached.expiresAt).getTime() - Date.now() > REFRESH_BUFFER_MS) {
    return cached;
  }

  const { data, error } = await supabase.functions.invoke("google-oauth-callback", {
    body: { action: "get_token", workspaceId },
  });
  if (error || !data?.access_token) {
    throw new Error(data?.error ?? "Google Calendar não conectado.");
  }
  if (data.user_id !== userId) {
    throw new Error("A sessão atual não corresponde ao calendário solicitado.");
  }
  if (data.workspace_id !== workspaceId) {
    throw new Error("O calendário não pertence ao workspace solicitado.");
  }

  const token: OAuthToken = {
    userId: data.user_id,
    workspaceId: data.workspace_id,
    googleSub: data.google_sub,
    email: data.email,
    accessToken: data.access_token,
    refreshToken: "",
    expiresAt: data.expires_at,
    scopes: data.scopes ?? [],
    defaultCalendarId: data.default_calendar_id ?? "primary",
  };
  tokenCache.set(key, token);
  return token;
}

export function clearTokenCache(userId: string, workspaceId: string): void {
  tokenCache.delete(cacheKey(userId, workspaceId));
}
