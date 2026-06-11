/**
 * calendar-watch-refresh — Supabase Edge Function
 *
 * Cron: daily at 03:00 UTC (via supabase/config.toml).
 * Renews all watch channels expiring within the next 48 hours.
 *
 * Required secrets:
 *   GCAL_CLIENT_ID, GCAL_CLIENT_SECRET — for token refresh
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY — auto-injected
 *   CALENDAR_INTERNAL_SECRET — optional alternative internal auth secret
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const INTERNAL_SECRET = Deno.env.get("CALENDAR_INTERNAL_SECRET");
const CLIENT_ID = Deno.env.get("GCAL_CLIENT_ID");
const CLIENT_SECRET = Deno.env.get("GCAL_CLIENT_SECRET");

const GCAL = "https://www.googleapis.com/calendar/v3";

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return jsonResponse({ error: "method not allowed" }, 405, { Allow: "POST" });
  }

  if (!SUPABASE_URL || !SERVICE_KEY || !CLIENT_ID || !CLIENT_SECRET) {
    console.error("[watch-refresh] required server configuration is missing");
    return jsonResponse({ error: "server configuration error" }, 500);
  }

  const bearerAuthorized =
    req.headers.get("Authorization") === `Bearer ${SERVICE_KEY}`;
  const internalSecretAuthorized =
    Boolean(INTERNAL_SECRET) &&
    req.headers.get("x-internal-secret") === INTERNAL_SECRET;

  if (!bearerAuthorized && !internalSecretAuthorized) {
    return jsonResponse({ error: "unauthorized" }, 401);
  }

  const db = createClient(SUPABASE_URL, SERVICE_KEY);
  const threshold = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

  const { data: channels, error } = await db
    .from("calendar_watch_channels")
    .select("id, user_id, workspace_id, calendar_id, channel_id, resource_id")
    .lt("expires_at", threshold);

  if (error) {
    console.error("[watch-refresh] failed to load channels", error);
    return jsonResponse({ error: "failed to load watch channels" }, 500);
  }

  let renewed = 0;
  let failed = 0;

  for (const ch of channels ?? []) {
    try {
      // Get fresh access token for this user
      const { data: tokenRow, error: tokenError } = await db
        .from("user_calendar_tokens")
        .select("access_token, refresh_token, expires_at, workspace_id")
        .eq("user_id", ch.user_id)
        .eq("workspace_id", ch.workspace_id)
        .single();

      if (tokenError) {
        throw new Error(`token lookup failed: ${tokenError.message}`);
      }
      if (!tokenRow) {
        throw new Error("calendar token not found");
      }

      let accessToken = tokenRow.access_token;
      if (new Date(tokenRow.expires_at).getTime() - Date.now() < 5 * 60 * 1000) {
        accessToken = await refreshToken(
          db,
          ch.user_id,
          ch.workspace_id,
          tokenRow.refresh_token,
          CLIENT_ID,
          CLIENT_SECRET,
        );
      }

      // Register and persist the replacement before retiring the old channel.
      const newChannelId = crypto.randomUUID();
      const newToken     = crypto.randomUUID();
      const ttl7d        = Date.now() + 7 * 24 * 60 * 60 * 1000;
      const webhookUrl   = `${SUPABASE_URL}/functions/v1/calendar-webhook`;

      const watchRes = await fetch(
        `${GCAL}/calendars/${encodeURIComponent(ch.calendar_id)}/events/watch`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            id: newChannelId,
            type: "web_hook",
            address: webhookUrl,
            token: newToken,
            expiration: ttl7d,
          }),
        }
      );

      if (!watchRes.ok) {
        throw new Error(`watch registration failed (${watchRes.status})`);
      }
      const watchData = await watchRes.json() as { resourceId: string; expiration: string };
      const expiration = Number(watchData.expiration);
      if (!watchData.resourceId || !Number.isFinite(expiration)) {
        throw new Error("watch registration returned an invalid response");
      }

      const { error: updateError } = await db
        .from("calendar_watch_channels")
        .update({
          channel_id:    newChannelId,
          resource_id:   watchData.resourceId,
          channel_token: newToken,
          expires_at:    new Date(expiration).toISOString(),
          updated_at:    new Date().toISOString(),
        })
        .eq("id", ch.id);

      if (updateError) {
        throw new Error(`channel update failed: ${updateError.message}`);
      }

      if (ch.resource_id) {
        const stopRes = await fetch(`${GCAL}/channels/stop`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            id: ch.channel_id,
            resourceId: ch.resource_id,
          }),
        });
        if (!stopRes.ok) {
          console.warn(
            "[watch-refresh] replacement active, old channel cleanup failed",
            ch.id,
            stopRes.status,
          );
        }
      }

      renewed++;
    } catch (err) {
      console.error("[watch-refresh] failed for channel", ch.id, err);
      failed++;
    }
  }

  return jsonResponse(
    { renewed, failed, checked: (channels ?? []).length },
    failed > 0 ? 500 : 200
  );
});

async function refreshToken(
  db: ReturnType<typeof createClient>,
  userId: string,
  workspaceId: string,
  refreshToken: string,
  clientId: string,
  clientSecret: string,
): Promise<string> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) {
    throw new Error(`token refresh failed (${res.status})`);
  }

  const data = await res.json() as { access_token?: string; expires_in?: number };
  if (!data.access_token) {
    throw new Error("token refresh returned no access token");
  }

  const expiresAt = new Date(Date.now() + (data.expires_in ?? 3600) * 1000).toISOString();
  const { error } = await db
    .from("user_calendar_tokens")
    .update({ access_token: data.access_token, expires_at: expiresAt, updated_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("workspace_id", workspaceId);

  if (error) {
    throw new Error(`token persistence failed: ${error.message}`);
  }

  return data.access_token;
}

function jsonResponse(
  body: Record<string, unknown>,
  status = 200,
  headers: HeadersInit = {},
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });
}
