-- ============================================================
-- Meta Channels — Phase 27A.4
-- ============================================================
CREATE TABLE public.meta_channel_connections (
  id               UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id     UUID    NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  platform         TEXT    NOT NULL CHECK (platform IN ('whatsapp','instagram','messenger')),
  display_name     TEXT    NOT NULL DEFAULT '',
  phone_number_id  TEXT,
  page_id          TEXT,
  ig_user_id       TEXT,
  access_token     TEXT    NOT NULL,
  webhook_verified BOOLEAN NOT NULL DEFAULT false,
  status           TEXT    NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive','error')),
  error_message    TEXT,
  meta             JSONB   NOT NULL DEFAULT '{}'::jsonb,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_meta_conn_workspace ON public.meta_channel_connections(workspace_id);
CREATE INDEX idx_meta_conn_phone ON public.meta_channel_connections(phone_number_id) WHERE phone_number_id IS NOT NULL;
CREATE INDEX idx_meta_conn_page ON public.meta_channel_connections(page_id) WHERE page_id IS NOT NULL;
GRANT ALL ON public.meta_channel_connections TO service_role;
ALTER TABLE public.meta_channel_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage connections" ON public.meta_channel_connections FOR ALL TO authenticated
  USING (public.has_workspace_role(workspace_id, auth.uid(), ARRAY['owner','admin']::public.workspace_role[]));
CREATE TRIGGER trg_meta_conn_updated BEFORE UPDATE ON public.meta_channel_connections
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.meta_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  connection_id UUID NOT NULL REFERENCES public.meta_channel_connections(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('whatsapp','instagram','messenger')),
  external_conversation_id TEXT NOT NULL,
  contact_external_id TEXT NOT NULL,
  contact_name TEXT NOT NULL DEFAULT 'Desconhecido',
  contact_avatar TEXT,
  preview TEXT NOT NULL DEFAULT '',
  unread INTEGER NOT NULL DEFAULT 0,
  handoff_status TEXT NOT NULL DEFAULT 'agent' CHECK (handoff_status IN ('agent','human','resolved')),
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (connection_id, external_conversation_id)
);
CREATE INDEX idx_meta_convs_ws ON public.meta_conversations(workspace_id, last_message_at DESC);
CREATE INDEX idx_meta_convs_conn ON public.meta_conversations(connection_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.meta_conversations TO authenticated;
GRANT ALL ON public.meta_conversations TO service_role;
ALTER TABLE public.meta_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members view meta conversations" ON public.meta_conversations FOR SELECT TO authenticated
  USING (public.is_workspace_member(workspace_id, auth.uid()));
CREATE POLICY "Members update meta conversations" ON public.meta_conversations FOR UPDATE TO authenticated
  USING (public.is_workspace_member(workspace_id, auth.uid()));
CREATE TRIGGER trg_meta_convs_updated BEFORE UPDATE ON public.meta_conversations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.meta_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  conversation_id UUID NOT NULL REFERENCES public.meta_conversations(id) ON DELETE CASCADE,
  external_message_id TEXT NOT NULL UNIQUE,
  direction TEXT NOT NULL CHECK (direction IN ('inbound','outbound')),
  message_type TEXT NOT NULL DEFAULT 'text',
  message_text TEXT,
  contact_external_id TEXT NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL,
  raw_payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_meta_msgs_conv ON public.meta_messages(conversation_id, sent_at DESC);
CREATE INDEX idx_meta_msgs_ws ON public.meta_messages(workspace_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.meta_messages TO authenticated;
GRANT ALL ON public.meta_messages TO service_role;
ALTER TABLE public.meta_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members view meta messages" ON public.meta_messages FOR SELECT TO authenticated
  USING (public.is_workspace_member(workspace_id, auth.uid()));
CREATE POLICY "Members insert meta messages" ON public.meta_messages FOR INSERT TO authenticated
  WITH CHECK (public.is_workspace_member(workspace_id, auth.uid()));

ALTER PUBLICATION supabase_realtime ADD TABLE public.meta_channel_connections;
ALTER PUBLICATION supabase_realtime ADD TABLE public.meta_conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.meta_messages;

-- ============================================================
-- Google Calendar tables
-- ============================================================
CREATE TABLE public.user_calendar_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  google_sub TEXT NOT NULL,
  email TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  scopes TEXT[] NOT NULL DEFAULT '{}',
  default_calendar_id TEXT NOT NULL DEFAULT 'primary',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','disconnected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, workspace_id)
);
GRANT ALL ON public.user_calendar_tokens TO service_role;
ALTER TABLE public.user_calendar_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_calendar_tokens_service_role" ON public.user_calendar_tokens FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE TABLE public.calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  session_id UUID REFERENCES public.sessions(id) ON DELETE SET NULL,
  external_event_id TEXT NOT NULL,
  calendar_id TEXT NOT NULL DEFAULT 'primary',
  summary TEXT NOT NULL DEFAULT '',
  description TEXT,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'America/Sao_Paulo',
  attendees JSONB NOT NULL DEFAULT '[]'::jsonb,
  meet_link TEXT,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed','tentative','cancelled')),
  etag TEXT,
  sequence INTEGER DEFAULT 0,
  google_updated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, workspace_id, external_event_id)
);
CREATE INDEX calendar_events_workspace_id_idx ON public.calendar_events (workspace_id);
CREATE INDEX calendar_events_lead_id_idx ON public.calendar_events (lead_id);
CREATE INDEX calendar_events_start_at_idx ON public.calendar_events (start_at);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.calendar_events TO authenticated;
GRANT ALL ON public.calendar_events TO service_role;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "calendar_events_workspace_member" ON public.calendar_events FOR ALL TO authenticated
  USING (public.is_workspace_member(workspace_id, auth.uid()))
  WITH CHECK (public.is_workspace_member(workspace_id, auth.uid()));
CREATE POLICY "calendar_events_service_role" ON public.calendar_events FOR ALL TO service_role
  USING (true) WITH CHECK (true);
ALTER PUBLICATION supabase_realtime ADD TABLE public.calendar_events;

CREATE TABLE public.calendar_watch_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  calendar_id TEXT NOT NULL DEFAULT 'primary',
  channel_id TEXT NOT NULL,
  resource_id TEXT,
  channel_token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  sync_token TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, workspace_id, calendar_id)
);
CREATE INDEX calendar_watch_expires_at_idx ON public.calendar_watch_channels (expires_at);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.calendar_watch_channels TO authenticated;
GRANT ALL ON public.calendar_watch_channels TO service_role;
ALTER TABLE public.calendar_watch_channels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "calendar_watch_self" ON public.calendar_watch_channels FOR ALL TO authenticated
  USING (auth.uid() = user_id AND public.is_workspace_member(workspace_id, auth.uid()))
  WITH CHECK (auth.uid() = user_id AND public.is_workspace_member(workspace_id, auth.uid()));
CREATE POLICY "calendar_watch_service_role" ON public.calendar_watch_channels FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- ============================================================
-- Security hardening (Phase 1)
-- ============================================================
CREATE TABLE public.oauth_state_nonces (
  nonce UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.oauth_state_nonces ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.oauth_state_nonces FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.oauth_state_nonces TO service_role;

CREATE TABLE public.ai_rate_limit_windows (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  window_started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  request_count INTEGER NOT NULL DEFAULT 0
);
ALTER TABLE public.ai_rate_limit_windows ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.ai_rate_limit_windows FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.ai_rate_limit_windows TO service_role;

CREATE OR REPLACE FUNCTION public.consume_ai_rate_limit(target_user_id UUID, max_requests INTEGER DEFAULT 30)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE current_count INTEGER;
BEGIN
  INSERT INTO public.ai_rate_limit_windows (user_id, window_started_at, request_count)
  VALUES (target_user_id, now(), 1)
  ON CONFLICT (user_id) DO UPDATE
  SET window_started_at = CASE WHEN ai_rate_limit_windows.window_started_at < now() - interval '1 minute' THEN now() ELSE ai_rate_limit_windows.window_started_at END,
      request_count = CASE WHEN ai_rate_limit_windows.window_started_at < now() - interval '1 minute' THEN 1 ELSE ai_rate_limit_windows.request_count + 1 END
  RETURNING request_count INTO current_count;
  RETURN current_count <= greatest(max_requests, 1);
END; $$;
REVOKE ALL ON FUNCTION public.consume_ai_rate_limit(UUID, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.consume_ai_rate_limit(UUID, INTEGER) TO service_role;

CREATE TABLE public.public_ai_session_tokens (
  session_id UUID PRIMARY KEY REFERENCES public.sessions(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT now() + interval '24 hours',
  window_started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  request_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.public_ai_session_tokens ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.public_ai_session_tokens FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.public_ai_session_tokens TO service_role;

CREATE TABLE public.public_ai_bot_rate_limit_windows (
  bot_id UUID PRIMARY KEY REFERENCES public.bots(id) ON DELETE CASCADE,
  window_started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  request_count INTEGER NOT NULL DEFAULT 0
);
ALTER TABLE public.public_ai_bot_rate_limit_windows ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.public_ai_bot_rate_limit_windows FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.public_ai_bot_rate_limit_windows TO service_role;

CREATE TABLE public.public_session_creation_rate_limit_windows (
  bot_id UUID PRIMARY KEY REFERENCES public.bots(id) ON DELETE CASCADE,
  window_started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  request_count INTEGER NOT NULL DEFAULT 0
);
ALTER TABLE public.public_session_creation_rate_limit_windows ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.public_session_creation_rate_limit_windows FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.public_session_creation_rate_limit_windows TO service_role;

CREATE TABLE public.public_session_write_rate_limit_windows (
  session_id UUID PRIMARY KEY REFERENCES public.sessions(id) ON DELETE CASCADE,
  window_started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  request_count INTEGER NOT NULL DEFAULT 0
);
ALTER TABLE public.public_session_write_rate_limit_windows ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.public_session_write_rate_limit_windows FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.public_session_write_rate_limit_windows TO service_role;

CREATE OR REPLACE FUNCTION public.record_public_session_with_ai_token(_slug TEXT, _visitor_id TEXT, _variables JSONB DEFAULT '{}'::jsonb)
RETURNS TABLE (session_id UUID, ai_token TEXT) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE bot_row public.bots; creation_count INTEGER; existing_session_id UUID; existing_token TEXT; new_session_id UUID; new_token TEXT;
BEGIN
  SELECT * INTO bot_row FROM public.bots WHERE slug = _slug AND status = 'ativo' AND published_snapshot IS NOT NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'Public bot not found'; END IF;
  IF length(_visitor_id) = 0 OR length(_visitor_id) > 128 THEN RAISE EXCEPTION 'Invalid visitor id'; END IF;
  SELECT s.id, t.token INTO existing_session_id, existing_token
    FROM public.sessions s JOIN public.public_ai_session_tokens t ON t.session_id = s.id
    WHERE s.bot_id = bot_row.id AND s.visitor_id = _visitor_id AND s.status = 'ativa' AND t.expires_at > now()
    ORDER BY s.created_at DESC LIMIT 1;
  IF existing_session_id IS NOT NULL THEN RETURN QUERY SELECT existing_session_id, existing_token; RETURN; END IF;
  INSERT INTO public.public_session_creation_rate_limit_windows (bot_id, window_started_at, request_count)
    VALUES (bot_row.id, now(), 1)
    ON CONFLICT (bot_id) DO UPDATE
    SET window_started_at = CASE WHEN public_session_creation_rate_limit_windows.window_started_at < now() - interval '1 minute' THEN now() ELSE public_session_creation_rate_limit_windows.window_started_at END,
        request_count = CASE WHEN public_session_creation_rate_limit_windows.window_started_at < now() - interval '1 minute' THEN 1 ELSE public_session_creation_rate_limit_windows.request_count + 1 END
    RETURNING request_count INTO creation_count;
  IF creation_count > 120 THEN RETURN; END IF;
  INSERT INTO public.sessions (bot_id, workspace_id, visitor_id, channel, status, variables)
    VALUES (bot_row.id, bot_row.workspace_id, _visitor_id, 'web', 'ativa', COALESCE(_variables, '{}'::jsonb))
    RETURNING id INTO new_session_id;
  new_token := replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '');
  INSERT INTO public.public_ai_session_tokens (session_id, token) VALUES (new_session_id, new_token);
  RETURN QUERY SELECT new_session_id, new_token;
END; $$;
REVOKE ALL ON FUNCTION public.record_public_session_with_ai_token(TEXT, TEXT, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_public_session_with_ai_token(TEXT, TEXT, JSONB) TO anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.record_public_session(TEXT, TEXT, JSONB) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.consume_public_session_write(target_session_id UUID, target_token TEXT, max_requests INTEGER DEFAULT 240)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE current_count INTEGER;
BEGIN
  PERFORM 1 FROM public.public_ai_session_tokens t
    JOIN public.sessions s ON s.id = t.session_id
    JOIN public.bots b ON b.id = s.bot_id
    WHERE t.session_id = target_session_id AND t.token = target_token AND t.expires_at > now()
      AND s.status = 'ativa' AND b.status = 'ativo' AND b.published_snapshot IS NOT NULL
    FOR UPDATE OF t;
  IF NOT FOUND THEN RETURN FALSE; END IF;
  INSERT INTO public.public_session_write_rate_limit_windows (session_id, window_started_at, request_count)
    VALUES (target_session_id, now(), 1)
    ON CONFLICT (session_id) DO UPDATE
    SET window_started_at = CASE WHEN public_session_write_rate_limit_windows.window_started_at < now() - interval '1 minute' THEN now() ELSE public_session_write_rate_limit_windows.window_started_at END,
        request_count = CASE WHEN public_session_write_rate_limit_windows.window_started_at < now() - interval '1 minute' THEN 1 ELSE public_session_write_rate_limit_windows.request_count + 1 END
    RETURNING request_count INTO current_count;
  RETURN current_count <= greatest(max_requests, 1);
END; $$;
REVOKE ALL ON FUNCTION public.consume_public_session_write(UUID, TEXT, INTEGER) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_public_session_write(UUID, TEXT, INTEGER) TO service_role;

REVOKE EXECUTE ON FUNCTION public.record_public_event(UUID, TEXT, JSONB, TEXT) FROM PUBLIC, anon, authenticated;
CREATE OR REPLACE FUNCTION public.record_public_event(_session_id UUID, _session_token TEXT, _type TEXT, _payload JSONB DEFAULT '{}'::jsonb, _block_key TEXT DEFAULT NULL)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE session_row public.sessions; target_flow_id UUID;
BEGIN
  IF NOT public.consume_public_session_write(_session_id, _session_token, 240) THEN RAISE EXCEPTION 'unauthorized public session' USING ERRCODE = '42501'; END IF;
  IF length(_type) = 0 OR length(_type) > 100 OR pg_column_size(COALESCE(_payload, '{}'::jsonb)) > 16384 THEN RAISE EXCEPTION 'invalid event data' USING ERRCODE = '22023'; END IF;
  SELECT * INTO session_row FROM public.sessions WHERE id = _session_id;
  SELECT id INTO target_flow_id FROM public.flows WHERE bot_id = session_row.bot_id;
  INSERT INTO public.events (workspace_id, bot_id, flow_id, session_id, lead_id, type, payload, block_key)
  VALUES (session_row.workspace_id, session_row.bot_id, target_flow_id, session_row.id, session_row.lead_id, _type, COALESCE(_payload, '{}'::jsonb), left(_block_key, 255));
END; $$;
GRANT EXECUTE ON FUNCTION public.record_public_event(UUID, TEXT, TEXT, JSONB, TEXT) TO anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.record_public_message(UUID, TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
CREATE OR REPLACE FUNCTION public.record_public_message(_session_id UUID, _session_token TEXT, _role TEXT, _text TEXT, _block_key TEXT DEFAULT NULL)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE session_row public.sessions;
BEGIN
  IF NOT public.consume_public_session_write(_session_id, _session_token, 240) THEN RAISE EXCEPTION 'unauthorized public session' USING ERRCODE = '42501'; END IF;
  IF _role NOT IN ('bot','user','system') OR length(COALESCE(_text, '')) > 20000 THEN RAISE EXCEPTION 'invalid message data' USING ERRCODE = '22023'; END IF;
  SELECT * INTO session_row FROM public.sessions WHERE id = _session_id;
  INSERT INTO public.messages (workspace_id, session_id, role, text, block_key)
  VALUES (session_row.workspace_id, session_row.id, _role::message_role, _text, left(_block_key, 255));
END; $$;
GRANT EXECUTE ON FUNCTION public.record_public_message(UUID, TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.record_public_lead(UUID, TEXT, TEXT, TEXT, TEXT, TEXT[], INTEGER) FROM PUBLIC, anon, authenticated;
CREATE OR REPLACE FUNCTION public.record_public_lead(_session_id UUID, _session_token TEXT, _name TEXT, _email TEXT DEFAULT NULL, _phone TEXT DEFAULT NULL, _company TEXT DEFAULT NULL, _tags TEXT[] DEFAULT NULL, _score INTEGER DEFAULT 0)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE session_row public.sessions; new_lead_id UUID;
BEGIN
  IF NOT public.consume_public_session_write(_session_id, _session_token, 240) THEN RAISE EXCEPTION 'unauthorized public session' USING ERRCODE = '42501'; END IF;
  IF length(trim(COALESCE(_name, ''))) = 0 OR length(_name) > 200 OR length(COALESCE(_email,'')) > 320 OR length(COALESCE(_phone,'')) > 64 OR length(COALESCE(_company,'')) > 200 OR cardinality(COALESCE(_tags, ARRAY[]::TEXT[])) > 30 THEN RAISE EXCEPTION 'invalid lead data' USING ERRCODE = '22023'; END IF;
  SELECT * INTO session_row FROM public.sessions WHERE id = _session_id FOR UPDATE;
  IF session_row.lead_id IS NOT NULL THEN RETURN session_row.lead_id; END IF;
  INSERT INTO public.leads (workspace_id, bot_id, name, email, phone, company, source, tags, score, stage)
  VALUES (session_row.workspace_id, session_row.bot_id, trim(_name), _email, _phone, _company, 'public-bot', _tags, greatest(least(COALESCE(_score, 0), 100), 0), 'novo'::lead_stage)
  RETURNING id INTO new_lead_id;
  UPDATE public.sessions SET lead_id = new_lead_id, updated_at = now() WHERE id = _session_id;
  RETURN new_lead_id;
END; $$;
GRANT EXECUTE ON FUNCTION public.record_public_lead(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT[], INTEGER) TO anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.record_public_visitor_profile(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
CREATE OR REPLACE FUNCTION public.record_public_visitor_profile(_session_id UUID, _session_token TEXT, _visitor_id TEXT, _browser TEXT DEFAULT NULL, _os TEXT DEFAULT NULL, _device_type TEXT DEFAULT NULL, _language TEXT DEFAULT NULL, _timezone TEXT DEFAULT NULL, _referrer TEXT DEFAULT NULL, _landing_page TEXT DEFAULT NULL, _user_agent TEXT DEFAULT NULL)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE session_row public.sessions; profile_id UUID;
BEGIN
  IF NOT public.consume_public_session_write(_session_id, _session_token, 240) THEN RAISE EXCEPTION 'unauthorized public session' USING ERRCODE = '42501'; END IF;
  SELECT * INTO session_row FROM public.sessions WHERE id = _session_id AND visitor_id = _visitor_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'visitor mismatch' USING ERRCODE = '42501'; END IF;
  INSERT INTO public.visitor_profiles (workspace_id, visitor_id, browser, os, device_type, language, timezone, referrer, landing_page, user_agent)
  VALUES (session_row.workspace_id, left(_visitor_id, 128), left(_browser, 100), left(_os, 100), left(_device_type, 100), left(_language, 50), left(_timezone, 100), left(_referrer, 2048), left(_landing_page, 2048), left(_user_agent, 2048))
  ON CONFLICT (workspace_id, visitor_id) DO UPDATE
  SET last_seen_at = now(),
      browser = COALESCE(EXCLUDED.browser, visitor_profiles.browser),
      os = COALESCE(EXCLUDED.os, visitor_profiles.os),
      device_type = COALESCE(EXCLUDED.device_type, visitor_profiles.device_type),
      language = COALESCE(EXCLUDED.language, visitor_profiles.language),
      timezone = COALESCE(EXCLUDED.timezone, visitor_profiles.timezone),
      referrer = COALESCE(visitor_profiles.referrer, EXCLUDED.referrer),
      landing_page = COALESCE(visitor_profiles.landing_page, EXCLUDED.landing_page),
      user_agent = COALESCE(EXCLUDED.user_agent, visitor_profiles.user_agent)
  RETURNING id INTO profile_id;
  RETURN profile_id;
END; $$;
GRANT EXECUTE ON FUNCTION public.record_public_visitor_profile(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.record_public_attribution(TEXT, TEXT, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
CREATE OR REPLACE FUNCTION public.record_public_attribution(_session_id UUID, _session_token TEXT, _visitor_id TEXT, _utm_source TEXT DEFAULT NULL, _utm_medium TEXT DEFAULT NULL, _utm_campaign TEXT DEFAULT NULL, _utm_content TEXT DEFAULT NULL, _utm_term TEXT DEFAULT NULL, _fbclid TEXT DEFAULT NULL, _gclid TEXT DEFAULT NULL, _ttclid TEXT DEFAULT NULL, _msclkid TEXT DEFAULT NULL, _referrer TEXT DEFAULT NULL, _landing_page TEXT DEFAULT NULL)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE session_row public.sessions; attribution_id UUID;
BEGIN
  IF NOT public.consume_public_session_write(_session_id, _session_token, 240) THEN RAISE EXCEPTION 'unauthorized public session' USING ERRCODE = '42501'; END IF;
  SELECT * INTO session_row FROM public.sessions WHERE id = _session_id AND visitor_id = _visitor_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'visitor mismatch' USING ERRCODE = '42501'; END IF;
  SELECT id INTO attribution_id FROM public.lead_attribution WHERE session_id = _session_id ORDER BY created_at DESC LIMIT 1;
  IF attribution_id IS NULL THEN
    INSERT INTO public.lead_attribution (workspace_id, visitor_id, session_id, utm_source, utm_medium, utm_campaign, utm_content, utm_term, fbclid, gclid, ttclid, msclkid, referrer, landing_page)
    VALUES (session_row.workspace_id, _visitor_id, _session_id, _utm_source, _utm_medium, _utm_campaign, _utm_content, _utm_term, _fbclid, _gclid, _ttclid, _msclkid, _referrer, _landing_page)
    RETURNING id INTO attribution_id;
  END IF;
  RETURN attribution_id;
END; $$;
GRANT EXECUTE ON FUNCTION public.record_public_attribution(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.attach_public_attribution_to_lead(UUID, UUID, TEXT) FROM PUBLIC, anon, authenticated;
CREATE OR REPLACE FUNCTION public.attach_public_attribution_to_lead(_session_id UUID, _session_token TEXT, _lead_id UUID, _visitor_id TEXT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE session_row public.sessions;
BEGIN
  IF NOT public.consume_public_session_write(_session_id, _session_token, 240) THEN RAISE EXCEPTION 'unauthorized public session' USING ERRCODE = '42501'; END IF;
  SELECT * INTO session_row FROM public.sessions WHERE id = _session_id AND visitor_id = _visitor_id AND lead_id = _lead_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'lead mismatch' USING ERRCODE = '42501'; END IF;
  UPDATE public.lead_attribution SET lead_id = _lead_id, updated_at = now()
  WHERE workspace_id = session_row.workspace_id AND session_id = _session_id AND visitor_id = _visitor_id AND lead_id IS NULL;
END; $$;
GRANT EXECUTE ON FUNCTION public.attach_public_attribution_to_lead(UUID, TEXT, UUID, TEXT) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.consume_public_ai_session(target_session_id UUID, target_token TEXT, max_requests INTEGER DEFAULT 20, max_bot_requests INTEGER DEFAULT 60)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE target_bot_id UUID; session_count INTEGER; bot_count INTEGER;
BEGIN
  SELECT s.bot_id INTO target_bot_id
  FROM public.public_ai_session_tokens t JOIN public.sessions s ON s.id = t.session_id JOIN public.bots b ON b.id = s.bot_id
  WHERE t.session_id = target_session_id AND t.token = target_token AND t.expires_at > now()
    AND s.status = 'ativa' AND b.status = 'ativo' AND b.published_snapshot IS NOT NULL
  FOR UPDATE OF t;
  IF target_bot_id IS NULL THEN RETURN FALSE; END IF;
  UPDATE public.public_ai_session_tokens t
  SET window_started_at = CASE WHEN t.window_started_at < now() - interval '1 minute' THEN now() ELSE t.window_started_at END,
      request_count = CASE WHEN t.window_started_at < now() - interval '1 minute' THEN 1 ELSE t.request_count + 1 END
  WHERE t.session_id = target_session_id
  RETURNING t.request_count INTO session_count;
  INSERT INTO public.public_ai_bot_rate_limit_windows (bot_id, window_started_at, request_count)
  VALUES (target_bot_id, now(), 1)
  ON CONFLICT (bot_id) DO UPDATE
  SET window_started_at = CASE WHEN public_ai_bot_rate_limit_windows.window_started_at < now() - interval '1 minute' THEN now() ELSE public_ai_bot_rate_limit_windows.window_started_at END,
      request_count = CASE WHEN public_ai_bot_rate_limit_windows.window_started_at < now() - interval '1 minute' THEN 1 ELSE public_ai_bot_rate_limit_windows.request_count + 1 END
  RETURNING request_count INTO bot_count;
  RETURN session_count <= greatest(max_requests, 1) AND bot_count <= greatest(max_bot_requests, 1);
END; $$;
GRANT EXECUTE ON FUNCTION public.consume_public_ai_session(UUID, TEXT, INTEGER, INTEGER) TO service_role;

-- Meta connection management RPCs (require admin role)
CREATE OR REPLACE FUNCTION public.list_meta_channel_connections(target_workspace_id UUID)
RETURNS TABLE (id UUID, workspace_id UUID, platform TEXT, display_name TEXT, phone_number_id TEXT, page_id TEXT, ig_user_id TEXT, webhook_verified BOOLEAN, status TEXT, error_message TEXT, meta JSONB, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ)
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT c.id, c.workspace_id, c.platform, c.display_name, c.phone_number_id, c.page_id, c.ig_user_id, c.webhook_verified, c.status, c.error_message, c.meta, c.created_at, c.updated_at
  FROM public.meta_channel_connections c
  WHERE c.workspace_id = target_workspace_id AND public.is_workspace_member(target_workspace_id, auth.uid())
  ORDER BY c.created_at;
$$;
GRANT EXECUTE ON FUNCTION public.list_meta_channel_connections(UUID) TO authenticated;

CREATE OR REPLACE FUNCTION public.create_meta_channel_connection(target_workspace_id UUID, target_platform TEXT, target_display_name TEXT, target_access_token TEXT, target_phone_number_id TEXT DEFAULT NULL, target_page_id TEXT DEFAULT NULL, target_ig_user_id TEXT DEFAULT NULL)
RETURNS TABLE (id UUID, workspace_id UUID, platform TEXT, display_name TEXT, phone_number_id TEXT, page_id TEXT, ig_user_id TEXT, webhook_verified BOOLEAN, status TEXT, error_message TEXT, meta JSONB, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE created_id UUID;
BEGIN
  IF length(trim(target_access_token)) < 10 OR length(trim(target_display_name)) = 0 THEN RAISE EXCEPTION 'invalid connection data' USING ERRCODE = '22023'; END IF;
  IF NOT public.has_workspace_role(target_workspace_id, auth.uid(), ARRAY['owner','admin']::public.workspace_role[]) THEN RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501'; END IF;
  INSERT INTO public.meta_channel_connections (workspace_id, platform, display_name, access_token, phone_number_id, page_id, ig_user_id, status)
  VALUES (target_workspace_id, target_platform, target_display_name, target_access_token, target_phone_number_id, target_page_id, target_ig_user_id, 'inactive')
  RETURNING meta_channel_connections.id INTO created_id;
  RETURN QUERY SELECT c.id, c.workspace_id, c.platform, c.display_name, c.phone_number_id, c.page_id, c.ig_user_id, c.webhook_verified, c.status, c.error_message, c.meta, c.created_at, c.updated_at FROM public.meta_channel_connections c WHERE c.id = created_id;
END; $$;
GRANT EXECUTE ON FUNCTION public.create_meta_channel_connection(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;

CREATE OR REPLACE FUNCTION public.mark_meta_connection_verified(target_connection_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE target_workspace_id UUID;
BEGIN
  SELECT workspace_id INTO target_workspace_id FROM public.meta_channel_connections WHERE id = target_connection_id;
  IF target_workspace_id IS NULL THEN RAISE EXCEPTION 'connection not found' USING ERRCODE = 'P0002'; END IF;
  UPDATE public.meta_channel_connections SET status = 'active', error_message = NULL, meta = COALESCE(meta, '{}'::jsonb) || jsonb_build_object('credentials_verified_at', now()) WHERE id = target_connection_id;
END; $$;
GRANT EXECUTE ON FUNCTION public.mark_meta_connection_verified(UUID) TO service_role;

CREATE OR REPLACE FUNCTION public.set_meta_connection_status(target_connection_id UUID, target_status TEXT, target_error_message TEXT DEFAULT NULL)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE target_workspace_id UUID;
BEGIN
  IF target_status NOT IN ('inactive','error') THEN RAISE EXCEPTION 'invalid status' USING ERRCODE = '22023'; END IF;
  SELECT workspace_id INTO target_workspace_id FROM public.meta_channel_connections WHERE id = target_connection_id;
  IF target_workspace_id IS NULL OR NOT public.has_workspace_role(target_workspace_id, auth.uid(), ARRAY['owner','admin']::public.workspace_role[]) THEN RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501'; END IF;
  UPDATE public.meta_channel_connections SET status = target_status, error_message = target_error_message WHERE id = target_connection_id;
END; $$;
GRANT EXECUTE ON FUNCTION public.set_meta_connection_status(UUID, TEXT, TEXT) TO authenticated;

CREATE OR REPLACE FUNCTION public.delete_meta_connection(target_connection_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE target_workspace_id UUID;
BEGIN
  SELECT workspace_id INTO target_workspace_id FROM public.meta_channel_connections WHERE id = target_connection_id;
  IF target_workspace_id IS NULL OR NOT public.has_workspace_role(target_workspace_id, auth.uid(), ARRAY['owner','admin']::public.workspace_role[]) THEN RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501'; END IF;
  DELETE FROM public.meta_channel_connections WHERE id = target_connection_id;
END; $$;
GRANT EXECUTE ON FUNCTION public.delete_meta_connection(UUID) TO authenticated;

CREATE OR REPLACE FUNCTION public.store_meta_inbound(_connection_id UUID, _platform TEXT, _external_convo_id TEXT, _contact_external_id TEXT, _contact_name TEXT, _message_text TEXT, _message_type TEXT, _external_message_id TEXT, _sent_at TIMESTAMPTZ, _raw_payload JSONB DEFAULT '{}'::jsonb)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE target_workspace_id UUID; target_conversation_id UUID; inserted_message_id UUID;
BEGIN
  SELECT workspace_id INTO target_workspace_id FROM public.meta_channel_connections WHERE id = _connection_id AND status = 'active';
  IF target_workspace_id IS NULL THEN RAISE EXCEPTION 'active meta connection not found'; END IF;
  INSERT INTO public.meta_conversations (workspace_id, connection_id, platform, external_conversation_id, contact_external_id, contact_name, preview, unread, last_message_at)
  VALUES (target_workspace_id, _connection_id, _platform, _external_convo_id, _contact_external_id, _contact_name, '', 0, _sent_at)
  ON CONFLICT (connection_id, external_conversation_id) DO UPDATE
  SET contact_name = CASE WHEN EXCLUDED.contact_name <> '' THEN EXCLUDED.contact_name ELSE meta_conversations.contact_name END,
      updated_at = now()
  RETURNING id INTO target_conversation_id;
  INSERT INTO public.meta_messages (workspace_id, conversation_id, external_message_id, direction, message_type, message_text, contact_external_id, sent_at, raw_payload)
  VALUES (target_workspace_id, target_conversation_id, _external_message_id, 'inbound', _message_type, _message_text, _contact_external_id, _sent_at, COALESCE(_raw_payload, '{}'::jsonb))
  ON CONFLICT (external_message_id) DO NOTHING
  RETURNING id INTO inserted_message_id;
  IF inserted_message_id IS NOT NULL THEN
    UPDATE public.meta_conversations SET preview = left(COALESCE(_message_text, ''), 120), unread = unread + 1, last_message_at = _sent_at, updated_at = now() WHERE id = target_conversation_id;
  END IF;
  RETURN target_conversation_id;
END; $$;
GRANT EXECUTE ON FUNCTION public.store_meta_inbound(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TIMESTAMPTZ, JSONB) TO service_role;

DROP FUNCTION IF EXISTS public.find_meta_connection(TEXT, TEXT, TEXT);
CREATE FUNCTION public.find_meta_connection(_platform TEXT, _phone_number_id TEXT DEFAULT NULL, _page_id TEXT DEFAULT NULL)
RETURNS TABLE (id UUID, workspace_id UUID, status TEXT) LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE matching_connections INTEGER;
BEGIN
  SELECT count(*) INTO matching_connections FROM public.meta_channel_connections c
  WHERE c.platform = _platform AND c.status = 'active'
    AND ((_phone_number_id IS NOT NULL AND c.phone_number_id = _phone_number_id) OR (_page_id IS NOT NULL AND c.page_id = _page_id));
  IF matching_connections > 1 THEN RAISE EXCEPTION 'ambiguous active meta connection'; END IF;
  RETURN QUERY SELECT c.id, c.workspace_id, c.status FROM public.meta_channel_connections c
  WHERE c.platform = _platform AND c.status = 'active'
    AND ((_phone_number_id IS NOT NULL AND c.phone_number_id = _phone_number_id) OR (_page_id IS NOT NULL AND c.page_id = _page_id));
END; $$;
GRANT EXECUTE ON FUNCTION public.find_meta_connection(TEXT, TEXT, TEXT) TO service_role;

CREATE UNIQUE INDEX meta_active_whatsapp_phone_unique ON public.meta_channel_connections (phone_number_id)
  WHERE platform = 'whatsapp' AND status = 'active' AND phone_number_id IS NOT NULL;
CREATE UNIQUE INDEX meta_active_page_platform_unique ON public.meta_channel_connections (platform, page_id)
  WHERE platform IN ('instagram','messenger') AND status = 'active' AND page_id IS NOT NULL;

GRANT EXECUTE ON FUNCTION public.is_workspace_member(uuid, uuid) TO authenticated, anon;