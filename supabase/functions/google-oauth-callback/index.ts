/**
 * Google Calendar OAuth callback and authenticated token broker.
 *
 * GET  ?code=...&state=...       Exchanges an authorization code.
 * POST { action:"create_state" }  Creates a signed, expiring OAuth state.
 * POST { action:"get_token" }     Returns a short-lived access token for the
 *                                 authenticated user, refreshing when needed.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const CLIENT_ID = Deno.env.get("GCAL_CLIENT_ID")!;
const CLIENT_SECRET = Deno.env.get("GCAL_CLIENT_SECRET")!;
const REDIRECT_URI = Deno.env.get("GCAL_REDIRECT_URI")!;
const STATE_SECRET = Deno.env.get("GCAL_STATE_SECRET")!;

const db = createClient(SUPABASE_URL, SERVICE_KEY);
const encoder = new TextEncoder();
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

type StatePayload = {
  userId: string;
  workspaceId: string;
  nonce: string;
  expiresAt: number;
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });

  if (req.method === "POST") {
    const userId = await authenticate(req);
    if (!userId) return json({ error: "unauthorized" }, 401);

    const body = await req.json().catch(() => ({})) as {
      action?: string;
      workspaceId?: string;
    };

    if (body.action === "create_state") {
      if (!STATE_SECRET || STATE_SECRET.length < 32) {
        return json({ error: "state_secret_not_configured" }, 500);
      }
      const workspaceId = await resolveWorkspace(userId, body.workspaceId);
      if (!workspaceId) return json({ error: "workspace_not_found" }, 403);

      const nonce = crypto.randomUUID();
      const expiresAt = Date.now() + 10 * 60 * 1000;
      const { error: nonceError } = await db.from("oauth_state_nonces").insert({
        nonce,
        user_id: userId,
        workspace_id: workspaceId,
        expires_at: new Date(expiresAt).toISOString(),
      });
      if (nonceError) return json({ error: "state_storage_failed" }, 500);

      const state = await signState({
        userId,
        workspaceId,
        nonce,
        expiresAt,
      });
      return json({ state });
    }

    if (body.action === "get_token") {
      const workspaceId = await resolveWorkspace(userId, body.workspaceId);
      if (!workspaceId) return json({ error: "workspace_not_found" }, 403);
      return getAccessToken(userId, workspaceId);
    }

    return json({ error: "invalid_request" }, 400);
  }

  if (req.method !== "GET") return json({ error: "method_not_allowed" }, 405);

  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const errParam = url.searchParams.get("error");

  if (errParam) {
    return redirectToApp(`error=${encodeURIComponent(errParam)}`);
  }
  if (!code || !state) return json({ error: "missing_params" }, 400);

  const statePayload = await verifyState(state);
  if (!statePayload) return json({ error: "invalid_state" }, 400);

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      code,
      grant_type: "authorization_code",
    }),
  });

  const tokens = await tokenRes.json() as {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
    id_token?: string;
    error?: string;
  };
  if (!tokenRes.ok || !tokens.access_token || !tokens.refresh_token) {
    return json({ error: tokens.error ?? "token_exchange_failed" }, 400);
  }

  const identity = await loadGoogleIdentity(tokens.access_token);
  if (!identity) return json({ error: "identity_verification_failed" }, 400);
  const now = new Date().toISOString();
  const expiresAt = new Date(Date.now() + (tokens.expires_in ?? 3600) * 1000).toISOString();

  const { error: upsertError } = await db.from("user_calendar_tokens").upsert(
    {
      user_id: statePayload.userId,
      workspace_id: statePayload.workspaceId,
      google_sub: identity.googleSub,
      email: identity.email,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: expiresAt,
      scopes: ["calendar.events", "calendar.readonly"],
      status: "active",
      updated_at: now,
    },
    { onConflict: "user_id,workspace_id" },
  );

  if (upsertError) return json({ error: "token_storage_failed" }, 500);
  return redirectToApp("connected=1");
});

async function authenticate(req: Request): Promise<string | null> {
  const token = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return null;
  const { data, error } = await db.auth.getUser(token);
  return error ? null : data.user?.id ?? null;
}

async function resolveWorkspace(userId: string, requested?: string): Promise<string | null> {
  let query = db
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", userId);
  if (requested) query = query.eq("workspace_id", requested);

  const { data } = await query.limit(1).maybeSingle();
  return data?.workspace_id ?? null;
}

async function getAccessToken(
  userId: string,
  workspaceId: string,
): Promise<Response> {
  const { data: row, error } = await db
    .from("user_calendar_tokens")
    .select("access_token, refresh_token, expires_at, workspace_id, google_sub, email, scopes, default_calendar_id")
    .eq("user_id", userId)
    .eq("workspace_id", workspaceId)
    .eq("status", "active")
    .single();

  if (error || !row) return json({ error: "token_not_found" }, 404);

  let accessToken = row.access_token;
  let expiresAt = row.expires_at;
  if (new Date(expiresAt).getTime() - Date.now() <= 5 * 60 * 1000) {
    const refreshed = await refreshAccessToken(
      userId,
      workspaceId,
      row.refresh_token,
    );
    if ("error" in refreshed) return json({ error: refreshed.error }, 400);
    accessToken = refreshed.accessToken;
    expiresAt = refreshed.expiresAt;
  }

  return json({
    user_id: userId,
    workspace_id: row.workspace_id,
    google_sub: row.google_sub,
    email: row.email,
    access_token: accessToken,
    expires_at: expiresAt,
    scopes: row.scopes ?? [],
    default_calendar_id: row.default_calendar_id ?? "primary",
  });
}

async function refreshAccessToken(
  userId: string,
  workspaceId: string,
  refreshToken: string,
): Promise<{ accessToken: string; expiresAt: string } | { error: string }> {
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  const data = await tokenRes.json() as {
    access_token?: string;
    expires_in?: number;
    error?: string;
  };
  if (!tokenRes.ok || !data.access_token) return { error: data.error ?? "refresh_failed" };

  const expiresAt = new Date(Date.now() + (data.expires_in ?? 3600) * 1000).toISOString();
  await db
    .from("user_calendar_tokens")
    .update({ access_token: data.access_token, expires_at: expiresAt, updated_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("workspace_id", workspaceId);

  return { accessToken: data.access_token, expiresAt };
}

async function stateKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(STATE_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

async function signState(payload: StatePayload): Promise<string> {
  const encoded = base64UrlEncode(encoder.encode(JSON.stringify(payload)));
  const signature = await crypto.subtle.sign("HMAC", await stateKey(), encoder.encode(encoded));
  return `${encoded}.${base64UrlEncode(new Uint8Array(signature))}`;
}

async function verifyState(state: string): Promise<StatePayload | null> {
  const [encoded, encodedSignature] = state.split(".");
  if (!encoded || !encodedSignature || !STATE_SECRET) return null;

  const valid = await crypto.subtle.verify(
    "HMAC",
    await stateKey(),
    base64UrlDecode(encodedSignature),
    encoder.encode(encoded),
  );
  if (!valid) return null;

  try {
    const payload = JSON.parse(new TextDecoder().decode(base64UrlDecode(encoded))) as StatePayload;
    if (!payload.userId || !payload.workspaceId || payload.expiresAt < Date.now()) return null;
    const workspaceId = await resolveWorkspace(payload.userId, payload.workspaceId);
    if (!workspaceId) return null;

    const { data: consumed } = await db
      .from("oauth_state_nonces")
      .update({ consumed_at: new Date().toISOString() })
      .eq("nonce", payload.nonce)
      .eq("user_id", payload.userId)
      .eq("workspace_id", payload.workspaceId)
      .is("consumed_at", null)
      .gt("expires_at", new Date().toISOString())
      .select("nonce")
      .maybeSingle();

    return consumed ? payload : null;
  } catch {
    return null;
  }
}

async function loadGoogleIdentity(
  accessToken: string,
): Promise<{ googleSub: string; email: string } | null> {
  const response = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) return null;

  const payload = await response.json() as { sub?: string; email?: string };
  if (!payload.sub || !payload.email) return null;
  return { googleSub: payload.sub, email: payload.email };
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecode(value: string): Uint8Array {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  return Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));
}

function redirectToApp(query: string): Response {
  const appBase = Deno.env.get("APP_URL") ?? REDIRECT_URI.split("/api")[0];
  return Response.redirect(`${appBase}/settings/calendar?${query}`, 302);
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  });
}
