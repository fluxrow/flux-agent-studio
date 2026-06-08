-- ============================================================
-- calendar_watch_channels — Google Calendar push notification channels
-- Phase 28C (Google Calendar Integration)
-- ============================================================

CREATE TABLE public.calendar_watch_channels (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  calendar_id    TEXT        NOT NULL DEFAULT 'primary',
  channel_id     TEXT        NOT NULL,
  resource_id    TEXT,
  channel_token  TEXT        NOT NULL,
  expires_at     TIMESTAMPTZ NOT NULL,
  sync_token     TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, calendar_id)
);

CREATE INDEX calendar_watch_expires_at_idx ON public.calendar_watch_channels (expires_at);

GRANT SELECT, INSERT, UPDATE, DELETE
  ON public.calendar_watch_channels TO authenticated;
GRANT ALL
  ON public.calendar_watch_channels TO service_role;

ALTER TABLE public.calendar_watch_channels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "calendar_watch_self"
  ON public.calendar_watch_channels
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "calendar_watch_service_role"
  ON public.calendar_watch_channels
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
