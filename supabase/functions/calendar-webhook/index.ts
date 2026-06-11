/**
 * calendar-webhook — Supabase Edge Function
 *
 * Receives Google Calendar push notification headers.
 * Validates channel token, then triggers incremental sync.
 *
 * Headers from Google:
 *   X-Goog-Channel-ID     — our channel_id UUID
 *   X-Goog-Channel-Token  — our stored channel_token
 *   X-Goog-Resource-State — "sync" (handshake) | "exists" | "not_exists"
 *   X-Goog-Resource-ID    — Google's resource ID
 *
 * Required secrets:
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY — auto-injected
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL  = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY   = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const db = createClient(SUPABASE_URL, SERVICE_KEY);

Deno.serve(async (req: Request) => {
  const channelId    = req.headers.get("x-goog-channel-id");
  const channelToken = req.headers.get("x-goog-channel-token");
  const resourceState = req.headers.get("x-goog-resource-state");

  // Handshake — just acknowledge
  if (resourceState === "sync") {
    return new Response("ok", { status: 200 });
  }

  if (!channelId || !channelToken) {
    return new Response("missing headers", { status: 400 });
  }

  // Validate channel token
  const { data: channel, error } = await db
    .from("calendar_watch_channels")
    .select("user_id, workspace_id, calendar_id, sync_token, channel_token")
    .eq("channel_id", channelId)
    .single();

  if (error || !channel) {
    return new Response("unknown channel", { status: 404 });
  }

  if (channel.channel_token !== channelToken) {
    return new Response("invalid token", { status: 401 });
  }

  // Trigger incremental sync for this user
  const syncRes = await fetch(`${SUPABASE_URL}/functions/v1/calendar-sync`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SERVICE_KEY}`,
    },
    body: JSON.stringify({
      userId: channel.user_id,
      workspaceId: channel.workspace_id,
      calendarId: channel.calendar_id,
    }),
  });

  if (!syncRes.ok) {
    console.error("[calendar-webhook] sync trigger failed", await syncRes.text());
  }

  return new Response("ok", { status: 200 });
});
