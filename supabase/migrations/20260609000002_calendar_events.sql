-- ============================================================
-- calendar_events — mirror of Google Calendar events
-- Phase 28C (Google Calendar Integration)
-- ============================================================

CREATE TABLE public.calendar_events (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id        UUID        NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id             UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lead_id             UUID        REFERENCES public.leads(id) ON DELETE SET NULL,
  session_id          UUID        REFERENCES public.sessions(id) ON DELETE SET NULL,
  external_event_id   TEXT        NOT NULL,
  calendar_id         TEXT        NOT NULL DEFAULT 'primary',
  summary             TEXT        NOT NULL DEFAULT '',
  description         TEXT,
  start_at            TIMESTAMPTZ NOT NULL,
  end_at              TIMESTAMPTZ NOT NULL,
  timezone            TEXT        NOT NULL DEFAULT 'America/Sao_Paulo',
  attendees           JSONB       NOT NULL DEFAULT '[]'::jsonb,
  meet_link           TEXT,
  status              TEXT        NOT NULL DEFAULT 'confirmed'
                      CHECK (status IN ('confirmed', 'tentative', 'cancelled')),
  etag                TEXT,
  sequence            INTEGER     DEFAULT 0,
  google_updated_at   TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, external_event_id)
);

CREATE INDEX calendar_events_workspace_id_idx ON public.calendar_events (workspace_id);
CREATE INDEX calendar_events_lead_id_idx      ON public.calendar_events (lead_id);
CREATE INDEX calendar_events_start_at_idx     ON public.calendar_events (start_at);

GRANT SELECT, INSERT, UPDATE, DELETE
  ON public.calendar_events TO authenticated;
GRANT ALL
  ON public.calendar_events TO service_role;

ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

-- Members of the workspace can read/write events in that workspace
CREATE POLICY "calendar_events_workspace_member"
  ON public.calendar_events
  FOR ALL
  USING (is_workspace_member(auth.uid(), workspace_id))
  WITH CHECK (is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "calendar_events_service_role"
  ON public.calendar_events
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Realtime: subscribe to calendar event changes
ALTER PUBLICATION supabase_realtime ADD TABLE public.calendar_events;
