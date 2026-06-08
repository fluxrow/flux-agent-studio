/**
 * Incremental pull sync using Google Calendar syncToken.
 *
 * Called by the calendar-sync edge function (cron 5min) and by the
 * calendar-webhook edge function when Google pushes a change notification.
 *
 * NOT called directly from the frontend. This file is used by edge functions
 * via Deno import. Included here for completeness; the identical logic lives
 * in supabase/functions/calendar-sync/index.ts.
 */

export type SyncResult = {
  upserted: number;
  deleted: number;
  newSyncToken?: string;
};

/**
 * Pulls events since the last syncToken, upserts to calendar_events,
 * returns the new syncToken for the next run.
 *
 * @param accessToken fresh Google access token
 * @param calendarId  usually "primary"
 * @param syncToken   last known syncToken; undefined = full sync
 * @param supabase    Supabase service-role client
 * @param userId
 * @param workspaceId
 */
export async function pullIncremental(
  accessToken: string,
  calendarId: string,
  syncToken: string | undefined,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userId: string,
  workspaceId: string
): Promise<SyncResult> {
  const GCAL = "https://www.googleapis.com/calendar/v3";
  let result: SyncResult = { upserted: 0, deleted: 0 };

  const params = new URLSearchParams({
    singleEvents: "true",
    maxResults: "250",
    showDeleted: "true",
    orderBy: "updated",
  });

  if (syncToken) {
    params.set("syncToken", syncToken);
  } else {
    const timeMin = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    params.set("timeMin", timeMin);
  }

  const url = `${GCAL}/calendars/${encodeURIComponent(calendarId)}/events?${params}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (res.status === 410) {
    // syncToken gone — full resync
    return pullIncremental(accessToken, calendarId, undefined, supabase, userId, workspaceId);
  }

  if (!res.ok) throw new Error(`Google Events list error ${res.status}`);

  const data = await res.json() as {
    items?: Array<Record<string, unknown>>;
    nextSyncToken?: string;
    nextPageToken?: string;
  };

  const items = data.items ?? [];

  for (const item of items) {
    if (item.status === "cancelled") {
      await supabase
        .from("calendar_events")
        .update({ status: "cancelled", updated_at: new Date().toISOString() })
        .eq("external_event_id", item.id)
        .eq("user_id", userId);
      result.deleted++;
    } else {
      const start = (item.start as { dateTime?: string; date?: string } | undefined);
      const end = (item.end as { dateTime?: string; date?: string } | undefined);
      await supabase.from("calendar_events").upsert(
        {
          workspace_id: workspaceId,
          user_id: userId,
          external_event_id: item.id,
          calendar_id: calendarId,
          summary: item.summary ?? "",
          description: item.description ?? null,
          start_at: start?.dateTime ?? start?.date ?? null,
          end_at: end?.dateTime ?? end?.date ?? null,
          timezone: (start as { timeZone?: string } | undefined)?.timeZone ?? "UTC",
          attendees: JSON.stringify(item.attendees ?? []),
          meet_link: extractMeetLinkFromItem(item),
          status: (item.status as string) ?? "confirmed",
          etag: item.etag ?? null,
          sequence: item.sequence ?? null,
          google_updated_at: item.updated ?? null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,external_event_id" }
      );
      result.upserted++;
    }
  }

  result.newSyncToken = data.nextSyncToken;
  return result;
}

function extractMeetLinkFromItem(item: Record<string, unknown>): string | null {
  const conf = item.conferenceData as {
    entryPoints?: Array<{ entryPointType?: string; uri?: string }>;
  } | undefined;
  return conf?.entryPoints?.find((e) => e.entryPointType === "video")?.uri ?? null;
}
