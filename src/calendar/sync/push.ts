/**
 * Google Calendar push notifications (events.watch).
 *
 * registerWatch  — creates a watch channel for a user's calendar
 * unregisterWatch — stops a watch channel (e.g., on user disconnect)
 * renewWatch     — called by calendar-watch-refresh cron when expiry <48h
 */
import { calendarFetch } from "../client";
import { getValidToken } from "../oauth/tokens";
import { createClient } from "@supabase/supabase-js";
import type { ID } from "@/types/common";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

function supabase() {
  return createClient(SUPABASE_URL, SUPABASE_KEY);
}

const WEBHOOK_URL = `${SUPABASE_URL}/functions/v1/calendar-webhook`;

interface WatchResponse {
  id: string;
  resourceId: string;
  resourceUri: string;
  expiration: string;
}

export async function registerWatch(
  userId: ID,
  workspaceId: ID,
  calendarId = "primary"
): Promise<void> {
  const channelId = crypto.randomUUID();
  const channelToken = crypto.randomUUID(); // stored and validated in webhook

  const ttl7d = Date.now() + 7 * 24 * 60 * 60 * 1000;

  const res = await calendarFetch<WatchResponse>(
    userId,
    workspaceId,
    `/calendars/${encodeURIComponent(calendarId)}/events/watch`,
    {
      method: "POST",
      body: JSON.stringify({
        id: channelId,
        type: "web_hook",
        address: WEBHOOK_URL,
        token: channelToken,
        expiration: ttl7d,
      }),
    }
  );

  const db = supabase();
  await db.from("calendar_watch_channels").upsert(
    {
      user_id: userId,
      workspace_id: workspaceId,
      calendar_id: calendarId,
      channel_id: channelId,
      resource_id: res.resourceId,
      channel_token: channelToken,
      expires_at: new Date(Number(res.expiration)).toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,workspace_id,calendar_id" }
  );
}

export async function unregisterWatch(
  userId: ID,
  workspaceId: ID,
  calendarId = "primary",
): Promise<void> {
  const db = supabase();
  const { data } = await db
    .from("calendar_watch_channels")
    .select("channel_id, resource_id")
    .eq("user_id", userId)
    .eq("workspace_id", workspaceId)
    .eq("calendar_id", calendarId)
    .single();

  if (!data) return;

  await calendarFetch(userId, workspaceId, "/channels/stop", {
    method: "POST",
    body: JSON.stringify({ id: data.channel_id, resourceId: data.resource_id }),
  });

  await db
    .from("calendar_watch_channels")
    .delete()
    .eq("user_id", userId)
    .eq("workspace_id", workspaceId)
    .eq("calendar_id", calendarId);
}

export async function renewWatch(
  userId: ID,
  workspaceId: ID,
  calendarId = "primary",
): Promise<void> {
  await unregisterWatch(userId, workspaceId, calendarId);
  await getValidToken(userId, workspaceId);
  await registerWatch(userId, workspaceId, calendarId);
}
