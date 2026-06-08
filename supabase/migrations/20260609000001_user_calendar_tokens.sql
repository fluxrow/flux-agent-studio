-- ============================================================
-- user_calendar_tokens — Google Calendar OAuth tokens per user
-- Phase 28C (Google Calendar Integration)
-- ============================================================

CREATE TABLE public.user_calendar_tokens (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id        UUID        NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  google_sub          TEXT        NOT NULL,
  email               TEXT        NOT NULL,
  access_token        TEXT        NOT NULL,
  refresh_token       TEXT        NOT NULL,
  expires_at          TIMESTAMPTZ NOT NULL,
  scopes              TEXT[]      NOT NULL DEFAULT '{}',
  default_calendar_id TEXT        NOT NULL DEFAULT 'primary',
  status              TEXT        NOT NULL DEFAULT 'active'
                      CHECK (status IN ('active', 'disconnected')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

-- Only service_role and the owning user may access tokens
GRANT SELECT, INSERT, UPDATE, DELETE
  ON public.user_calendar_tokens TO authenticated;
GRANT ALL
  ON public.user_calendar_tokens TO service_role;

ALTER TABLE public.user_calendar_tokens ENABLE ROW LEVEL SECURITY;

-- User can only read/write their own token row
CREATE POLICY "user_calendar_tokens_self"
  ON public.user_calendar_tokens
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Service role bypass (edge functions use service_role key)
CREATE POLICY "user_calendar_tokens_service_role"
  ON public.user_calendar_tokens
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
