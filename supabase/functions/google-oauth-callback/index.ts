/**
 * google-oauth-callback — Supabase Edge Function
 *
 * Two modes:
 *   GET  ?code=...&state=...  — OAuth authorization code exchange
 *   POST { action:"refresh", userId:"..." } — token refresh (called by frontend)
 *
 * Required secrets (set via `supabase secrets set`):
 *   GCAL_CLIENT_ID
 *   GCAL_CLIENT_SECRET
 *   GCAL_REDIRECT_URI       — must match Google Cloud Console exactly
 *   GCAL_STATE_SECRET       — HMAC key for state param (future: HMAC validation)
 *   SUPABASE_URL            — auto-injected
 *   SUPABASE_SERVICE_ROLE_KEY — auto-injected
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL     = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY      = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const CLIENT_ID        = Deno.env.get("GCAL_CLIENT_ID")!;
const CLIENT_SECRET    = Deno.env.get("GCAL_CLIENT_SECRET")!;
const REDIRECT_URI     = Deno.env.get("GCAL_REDIRECT_URI")!;

const db = createClient(SUPABASE_URL, SERVICE_KEY);

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type,authorization",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });

  const url = new URL(req.url);

  // ---- POST: token refresh ----------------------------------------
  if (req.method === "POST") {
    const body = await req.json() as { action?: string; userId?: string };
    if (body.action !== "refresh" || !body.userId) {
      return json({ error: "invalid_request" }, 400);
    }

    const { data: row, error } = await db
      .from("user_calendar_tokens")
      .select("refresh_token")
      .eq("user_id", body.userId)
      .single();

    if (error || !row) return json({ error: "token_not_found" }, 404);

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        refresh_token: row.refresh_token,
        grant_type: "refresh_token",
      }),
    });

    const tokenData = await tokenRes.json() as {
      access_token?: string;
      expires_in?: number;
      error?: string;
    };

    if (!tokenRes.ok || !tokenData.access_token) {
      return json({ error: tokenData.error ?? "refresh_failed" }, 400);
    }

    const expiresAt = new Date(Date.now() + (tokenData.expires_in ?? 3600) * 1000).toISOString();

    await db
      .from("user_calendar_tokens")
      .update({ access_token: tokenData.access_token, expires_at: expiresAt, updated_at: new Date().toISOString() })
      .eq("user_id", body.userId);

    return json({ access_token: tokenData.access_token, expires_in: tokenData.expires_in });
  }

  // ---- GET: authorization code exchange ---------------------------
  const code  = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const errParam = url.searchParams.get("error");

  if (errParam) {
    return Response.redirect(`${SUPABASE_URL.replace(".supabase.co", "")}/settings/calendar?error=${errParam}`, 302);
  }

  if (!code || !state) return json({ error: "missing_params" }, 400);

  // Decode state to get userId
  let userId: string;
  try {
    const decoded = JSON.parse(atob(state)) as { userId: string };
    userId = decoded.userId;
    if (!userId) throw new Error("no userId");
  } catch {
    return json({ error: "invalid_state" }, 400);
  }

  // Exchange code for tokens
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

  if (!tokenRes.ok || !tokens.access_token) {
    return json({ error: tokens.error ?? "token_exchange_failed" }, 400);
  }

  // Decode id_token to get google_sub and email
  let googleSub = "";
  let email = "";
  if (tokens.id_token) {
    try {
      const payload = JSON.parse(atob(tokens.id_token.split(".")[1])) as {
        sub?: string;
        email?: string;
      };
      googleSub = payload.sub ?? "";
      email = payload.email ?? "";
    } catch { /* ignore */ }
  }

  // Get workspaceId for the user
  const { data: member } = await db
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", userId)
    .limit(1)
    .single();

  const workspaceId = member?.workspace_id ?? "";
  const expiresAt = new Date(Date.now() + (tokens.expires_in ?? 3600) * 1000).toISOString();
  const now = new Date().toISOString();

  await db.from("user_calendar_tokens").upsert(
    {
      user_id: userId,
      workspace_id: workspaceId,
      google_sub: googleSub,
      email,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token ?? "",
      expires_at: expiresAt,
      scopes: ["calendar.events", "calendar.readonly"],
      status: "active",
      updated_at: now,
    },
    { onConflict: "user_id" }
  );

  return Response.redirect(
    `${REDIRECT_URI.split("/api")[0]}/settings/calendar?connected=1`,
    302
  );
});

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  });
}
