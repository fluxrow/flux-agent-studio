/**
 * calendar-watch-refresh — Supabase Edge Function
 *
 * Cron: daily at 03:00 UTC (via supabase/config.toml).
 * Renews all watch channels expiring within the next 48 hours.
 *
 * Required secrets:
 *   GCAL_CLIENT_ID, GCAL_CLIENT_SECRET — for token refresh
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY — auto-injected
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL  = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY   = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const CLIENT_ID     = Deno.env.get("GCAL_CLIENT_ID")!;
const CLIENT_SECRET = Deno.env.get("GCAL_CLIENT_SECRET")!;

const db = createClient(SUPABASE_URL, SERVICE_KEY);
const GCAL = "https://www.googleapis.com/calendar/v3";

Deno.serve(async (_req: Request) => {
  const threshold = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

  const { data: channels, error } = await db
    .from("calendar_watch_channels")
    .select("id, user_id, calendar_id, channel_id, resource_id")
    .lt("expires_at", threshold);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  let renewed = 0;
  let failed = 0;

  for (const ch of channels ?? []) {
    try {
      // Get fresh access token for this user
      const { data: tokenRow } = await db
        .from("user_calendar_tokens")
        .select("access_token, refresh_token, expires_at, workspace_id")
        .eq("user_id", ch.user_id)
        .single();

      if (!tokenRow) continue;

      let accessToken = tokenRow.access_token;
      if (new Date(tokenRow.expires_at).getTime() - Date.now() < 5 * 60 * 1000) {
        accessToken = await refreshToken(ch.user_id, tokenRow.refresh_token);
      }

      // Stop old channel
      await fetch(`${GCAL}/channels/stop`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ id: ch.channel_id, resourceId: ch.resource_id }),
      });

      // Register new channel
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

      if (!watchRes.ok) throw new Error(`watch failed ${watchRes.status}`);
      const watchData = await watchRes.json() as { resourceId: string; expiration: string };

      await db
        .from("calendar_watch_channels")
        .update({
          channel_id:    newChannelId,
          resource_id:   watchData.resourceId,
          channel_token: newToken,
          expires_at:    new Date(Number(watchData.expiration)).toISOString(),
          updated_at:    new Date().toISOString(),
        })
        .eq("id", ch.id);

      renewed++;
    } catch (err) {
      console.error("[watch-refresh] failed for channel", ch.id, err);
      failed++;
    }
  }

  return new Response(
    JSON.stringify({ renewed, failed, checked: (channels ?? []).length }),
    { headers: { "Content-Type": "application/json" } }
  );
});

async function refreshToken(userId: string, refreshToken: string): Promise<string> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  const data = await res.json() as { access_token?: string; expires_in?: number };
  if (!data.access_token) throw new Error("refresh failed");
  const expiresAt = new Date(Date.now() + (data.expires_in ?? 3600) * 1000).toISOString();
  await db
    .from("user_calendar_tokens")
    .update({ access_token: data.access_token, expires_at: expiresAt, updated_at: new Date().toISOString() })
    .eq("user_id", userId);
  return data.access_token;
}
