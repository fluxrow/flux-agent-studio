/**
 * Token management for Google Calendar OAuth.
 *
 * getValidToken() is the single entry point for all API callers.
 * It reads the token from Supabase, refreshes if needed, and returns
 * a fresh access token. All callers should use this — never read
 * tokens from storage directly.
 *
 * Tokens are stored in `user_calendar_tokens` (server-side via edge
 * function). Frontend only holds the access_token temporarily in memory
 * for the duration of the tab session.
 */
import { createClient } from "@supabase/supabase-js";
import { GOOGLE_TOKEN_URL } from "./config";
import type { OAuthToken } from "../types";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

function supabase() {
  return createClient(SUPABASE_URL, SUPABASE_KEY);
}

const REFRESH_BUFFER_MS = 5 * 60 * 1000; // refresh 5min before expiry

/** In-memory cache to avoid hammering Supabase on every API call. */
const tokenCache = new Map<string, OAuthToken>();

export async function getValidToken(userId: string): Promise<OAuthToken> {
  const cached = tokenCache.get(userId);
  if (cached && new Date(cached.expiresAt).getTime() - Date.now() > REFRESH_BUFFER_MS) {
    return cached;
  }

  const db = supabase();
  const { data, error } = await db
    .from("user_calendar_tokens")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    throw new Error(`Usuário ${userId} não tem Google Calendar conectado.`);
  }

  const token = rowToToken(data);

  if (new Date(token.expiresAt).getTime() - Date.now() <= REFRESH_BUFFER_MS) {
    return refreshToken(userId, token, db);
  }

  tokenCache.set(userId, token);
  return token;
}

async function refreshToken(
  userId: string,
  current: OAuthToken,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: ReturnType<typeof supabase>
): Promise<OAuthToken> {
  const gcalClientId = import.meta.env.VITE_GCAL_CLIENT_ID as string;

  // Refresh must go through the edge function to keep client_secret server-side.
  const res = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/google-oauth-callback`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "refresh", userId }),
    }
  );

  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: string };
    if (body.error === "invalid_grant") {
      await db
        .from("user_calendar_tokens")
        .update({ status: "disconnected" } as Record<string, unknown>)
        .eq("user_id", userId);
      tokenCache.delete(userId);
      throw new Error("Google Calendar desconectado — refresh token revogado. Reconecte.");
    }
    throw new Error(`Falha ao renovar token: ${body.error ?? res.statusText}`);
  }

  const { access_token, expires_in } = await res.json() as {
    access_token: string;
    expires_in: number;
  };

  const expiresAt = new Date(Date.now() + expires_in * 1000).toISOString();

  await db
    .from("user_calendar_tokens")
    .update({ access_token, expires_at: expiresAt, updated_at: new Date().toISOString() })
    .eq("user_id", userId);

  const refreshed: OAuthToken = { ...current, accessToken: access_token, expiresAt };
  tokenCache.set(userId, refreshed);
  return refreshed;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToToken(row: Record<string, any>): OAuthToken {
  return {
    userId: row.user_id,
    workspaceId: row.workspace_id,
    googleSub: row.google_sub,
    email: row.email,
    accessToken: row.access_token,
    refreshToken: row.refresh_token,
    expiresAt: row.expires_at,
    scopes: row.scopes ?? [],
    defaultCalendarId: row.default_calendar_id ?? "primary",
  };
}

export function clearTokenCache(userId: string): void {
  tokenCache.delete(userId);
}
