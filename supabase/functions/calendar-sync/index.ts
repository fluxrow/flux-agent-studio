/**
 * calendar-sync — Supabase Edge Function
 *
 * Cron: every 5 minutes via supabase/config.toml schedule.
 * Also called directly by calendar-webhook on push notification.
 *
 * Pulls incremental event changes for each active user (or a specific
 * userId if POSTed), upserts to calendar_events, updates sync_token.
 *
 * Required secrets:
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY — auto-injected
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL  = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY   = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const GCAL          = "https://www.googleapis.com/calendar/v3";

const db = createClient(SUPABASE_URL, SERVICE_KEY);

Deno.serve(async (req: Request) => {
  let targetUserId: string | null = null;
  let targetCalendarId = "primary";

  if (req.method === "POST") {
    const body = await req.json().catch(() => ({})) as {
      userId?: string;
      calendarId?: string;
    };
    targetUserId = body.userId ?? null;
    targetCalendarId = body.calendarId ?? "primary";
  }

  // Fetch users to sync
  let query = db
    .from("user_calendar_tokens")
    .select("user_id, workspace_id, access_token, refresh_token, expires_at")
    .eq("status", "active");

  if (targetUserId) {
    query = query.eq("user_id", targetUserId);
  }

  const { data: users, error } = await query;

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  const results: Array<{ userId: string; upserted: number; deleted: number; error?: string }> = [];

  for (const user of users ?? []) {
    try {
      // Refresh token if expired
      let accessToken = user.access_token;
      if (new Date(user.expires_at).getTime() - Date.now() < 5 * 60 * 1000) {
        const refreshed = await refreshAccessToken(user.user_id, user.refresh_token);
        accessToken = refreshed;
      }

      const { data: watchRow } = await db
        .from("calendar_watch_channels")
        .select("sync_token")
        .eq("user_id", user.user_id)
        .eq("calendar_id", targetCalendarId)
        .single();

      const { upserted, deleted, newSyncToken } = await pullEvents(
        accessToken,
        targetCalendarId,
        watchRow?.sync_token,
        user.user_id,
        user.workspace_id
      );

      if (newSyncToken && watchRow) {
        await db
          .from("calendar_watch_channels")
          .update({ sync_token: newSyncToken, updated_at: new Date().toISOString() })
          .eq("user_id", user.user_id)
          .eq("calendar_id", targetCalendarId);
      }

      results.push({ userId: user.user_id, upserted, deleted });
    } catch (err) {
      console.error("[calendar-sync] error for user", user.user_id, err);
      results.push({ userId: user.user_id, upserted: 0, deleted: 0, error: String(err) });
    }
  }

  return new Response(JSON.stringify({ synced: results.length, results }), {
    headers: { "Content-Type": "application/json" },
  });
});

async function refreshAccessToken(userId: string, refreshToken: string): Promise<string> {
  const CLIENT_ID     = Deno.env.get("GCAL_CLIENT_ID")!;
  const CLIENT_SECRET = Deno.env.get("GCAL_CLIENT_SECRET")!;

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
  const data = await res.json() as { access_token?: string; expires_in?: number; error?: string };
  if (!res.ok || !data.access_token) throw new Error(`refresh failed: ${data.error}`);

  const expiresAt = new Date(Date.now() + (data.expires_in ?? 3600) * 1000).toISOString();
  await db
    .from("user_calendar_tokens")
    .update({ access_token: data.access_token, expires_at: expiresAt, updated_at: new Date().toISOString() })
    .eq("user_id", userId);

  return data.access_token;
}

async function pullEvents(
  accessToken: string,
  calendarId: string,
  syncToken: string | undefined,
  userId: string,
  workspaceId: string
): Promise<{ upserted: number; deleted: number; newSyncToken?: string }> {
  const params = new URLSearchParams({
    singleEvents: "true",
    maxResults: "250",
    showDeleted: "true",
  });

  if (syncToken) {
    params.set("syncToken", syncToken);
  } else {
    const timeMin = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    params.set("timeMin", timeMin);
  }

  const res = await fetch(
    `${GCAL}/calendars/${encodeURIComponent(calendarId)}/events?${params}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  // syncToken expired — full resync
  if (res.status === 410) {
    return pullEvents(accessToken, calendarId, undefined, userId, workspaceId);
  }

  if (!res.ok) throw new Error(`Google Events list error ${res.status}`);

  const data = await res.json() as {
    items?: Array<Record<string, unknown>>;
    nextSyncToken?: string;
  };

  let upserted = 0;
  let deleted = 0;

  for (const item of data.items ?? []) {
    if ((item.status as string) === "cancelled") {
      await db
        .from("calendar_events")
        .update({ status: "cancelled", updated_at: new Date().toISOString() })
        .eq("external_event_id", item.id as string)
        .eq("user_id", userId);
      deleted++;
    } else {
      const start = item.start as { dateTime?: string; date?: string } | undefined;
      const end   = item.end as { dateTime?: string; date?: string } | undefined;
      const conf  = item.conferenceData as { entryPoints?: Array<{ entryPointType?: string; uri?: string }> } | undefined;
      const meetLink = conf?.entryPoints?.find((e) => e.entryPointType === "video")?.uri ?? null;

      await db.from("calendar_events").upsert(
        {
          workspace_id: workspaceId,
          user_id: userId,
          external_event_id: item.id as string,
          calendar_id: calendarId,
          summary: (item.summary as string) ?? "",
          description: (item.description as string | null) ?? null,
          start_at: start?.dateTime ?? start?.date ?? null,
          end_at:   end?.dateTime ?? end?.date ?? null,
          timezone: (start as { timeZone?: string } | undefined)?.timeZone ?? "UTC",
          attendees: JSON.stringify(item.attendees ?? []),
          meet_link: meetLink,
          status: "confirmed",
          etag: (item.etag as string | null) ?? null,
          sequence: (item.sequence as number | null) ?? null,
          google_updated_at: (item.updated as string | null) ?? null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,external_event_id" }
      );
      upserted++;
    }
  }

  return { upserted, deleted, newSyncToken: data.nextSyncToken };
}
