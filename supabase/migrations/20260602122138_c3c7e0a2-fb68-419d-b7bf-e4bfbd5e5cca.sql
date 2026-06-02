-- visitor_profiles
CREATE TABLE public.visitor_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL,
  visitor_id TEXT NOT NULL,
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  browser TEXT,
  os TEXT,
  device_type TEXT,
  language TEXT,
  timezone TEXT,
  country TEXT,
  state TEXT,
  city TEXT,
  referrer TEXT,
  landing_page TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, visitor_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.visitor_profiles TO authenticated;
GRANT ALL ON public.visitor_profiles TO service_role;

ALTER TABLE public.visitor_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members view visitor profiles"
  ON public.visitor_profiles FOR SELECT TO authenticated
  USING (public.is_workspace_member(workspace_id, auth.uid()));
CREATE POLICY "Members insert visitor profiles"
  ON public.visitor_profiles FOR INSERT TO authenticated
  WITH CHECK (public.is_workspace_member(workspace_id, auth.uid()));
CREATE POLICY "Members update visitor profiles"
  ON public.visitor_profiles FOR UPDATE TO authenticated
  USING (public.is_workspace_member(workspace_id, auth.uid()));
CREATE POLICY "Admins+ delete visitor profiles"
  ON public.visitor_profiles FOR DELETE TO authenticated
  USING (public.has_workspace_role(workspace_id, auth.uid(), ARRAY['owner'::workspace_role,'admin'::workspace_role]));

CREATE TRIGGER visitor_profiles_updated_at
  BEFORE UPDATE ON public.visitor_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_visitor_profiles_workspace ON public.visitor_profiles(workspace_id);
CREATE INDEX idx_visitor_profiles_visitor ON public.visitor_profiles(visitor_id);

-- lead_attribution
CREATE TABLE public.lead_attribution (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL,
  lead_id UUID,
  visitor_id TEXT NOT NULL,
  session_id UUID,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  fbclid TEXT,
  gclid TEXT,
  ttclid TEXT,
  msclkid TEXT,
  referrer TEXT,
  landing_page TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.lead_attribution TO authenticated;
GRANT ALL ON public.lead_attribution TO service_role;

ALTER TABLE public.lead_attribution ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members view lead attribution"
  ON public.lead_attribution FOR SELECT TO authenticated
  USING (public.is_workspace_member(workspace_id, auth.uid()));
CREATE POLICY "Members insert lead attribution"
  ON public.lead_attribution FOR INSERT TO authenticated
  WITH CHECK (public.is_workspace_member(workspace_id, auth.uid()));
CREATE POLICY "Members update lead attribution"
  ON public.lead_attribution FOR UPDATE TO authenticated
  USING (public.is_workspace_member(workspace_id, auth.uid()));
CREATE POLICY "Admins+ delete lead attribution"
  ON public.lead_attribution FOR DELETE TO authenticated
  USING (public.has_workspace_role(workspace_id, auth.uid(), ARRAY['owner'::workspace_role,'admin'::workspace_role]));

CREATE TRIGGER lead_attribution_updated_at
  BEFORE UPDATE ON public.lead_attribution
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_lead_attribution_workspace ON public.lead_attribution(workspace_id);
CREATE INDEX idx_lead_attribution_visitor ON public.lead_attribution(visitor_id);
CREATE INDEX idx_lead_attribution_lead ON public.lead_attribution(lead_id);

-- RPC: public visitor profile upsert (anon-callable)
CREATE OR REPLACE FUNCTION public.record_public_visitor_profile(
  _slug TEXT,
  _visitor_id TEXT,
  _browser TEXT DEFAULT NULL,
  _os TEXT DEFAULT NULL,
  _device_type TEXT DEFAULT NULL,
  _language TEXT DEFAULT NULL,
  _timezone TEXT DEFAULT NULL,
  _referrer TEXT DEFAULT NULL,
  _landing_page TEXT DEFAULT NULL,
  _user_agent TEXT DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  bot_row public.bots;
  vp_id UUID;
BEGIN
  SELECT * INTO bot_row FROM public.bots
    WHERE slug = _slug AND status = 'ativo' AND published_snapshot IS NOT NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'Public bot not found'; END IF;

  INSERT INTO public.visitor_profiles (
    workspace_id, visitor_id, browser, os, device_type, language, timezone,
    referrer, landing_page, user_agent
  ) VALUES (
    bot_row.workspace_id, _visitor_id, _browser, _os, _device_type, _language, _timezone,
    _referrer, _landing_page, _user_agent
  )
  ON CONFLICT (workspace_id, visitor_id) DO UPDATE
  SET last_seen_at = now(),
      browser = COALESCE(EXCLUDED.browser, public.visitor_profiles.browser),
      os = COALESCE(EXCLUDED.os, public.visitor_profiles.os),
      device_type = COALESCE(EXCLUDED.device_type, public.visitor_profiles.device_type),
      language = COALESCE(EXCLUDED.language, public.visitor_profiles.language),
      timezone = COALESCE(EXCLUDED.timezone, public.visitor_profiles.timezone),
      referrer = COALESCE(public.visitor_profiles.referrer, EXCLUDED.referrer),
      landing_page = COALESCE(public.visitor_profiles.landing_page, EXCLUDED.landing_page),
      user_agent = COALESCE(EXCLUDED.user_agent, public.visitor_profiles.user_agent)
  RETURNING id INTO vp_id;

  RETURN vp_id;
END;
$$;

-- RPC: public attribution capture (anon-callable; lead_id may be null at first)
CREATE OR REPLACE FUNCTION public.record_public_attribution(
  _slug TEXT,
  _visitor_id TEXT,
  _session_id UUID DEFAULT NULL,
  _utm_source TEXT DEFAULT NULL,
  _utm_medium TEXT DEFAULT NULL,
  _utm_campaign TEXT DEFAULT NULL,
  _utm_content TEXT DEFAULT NULL,
  _utm_term TEXT DEFAULT NULL,
  _fbclid TEXT DEFAULT NULL,
  _gclid TEXT DEFAULT NULL,
  _ttclid TEXT DEFAULT NULL,
  _msclkid TEXT DEFAULT NULL,
  _referrer TEXT DEFAULT NULL,
  _landing_page TEXT DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  bot_row public.bots;
  attr_id UUID;
BEGIN
  SELECT * INTO bot_row FROM public.bots
    WHERE slug = _slug AND status = 'ativo' AND published_snapshot IS NOT NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'Public bot not found'; END IF;

  INSERT INTO public.lead_attribution (
    workspace_id, visitor_id, session_id,
    utm_source, utm_medium, utm_campaign, utm_content, utm_term,
    fbclid, gclid, ttclid, msclkid, referrer, landing_page
  ) VALUES (
    bot_row.workspace_id, _visitor_id, _session_id,
    _utm_source, _utm_medium, _utm_campaign, _utm_content, _utm_term,
    _fbclid, _gclid, _ttclid, _msclkid, _referrer, _landing_page
  )
  RETURNING id INTO attr_id;

  RETURN attr_id;
END;
$$;

-- Modify record_public_lead to also link latest attribution to the lead
CREATE OR REPLACE FUNCTION public.attach_public_attribution_to_lead(
  _session_id UUID,
  _lead_id UUID,
  _visitor_id TEXT
) RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  s public.sessions;
BEGIN
  SELECT * INTO s FROM public.sessions WHERE id = _session_id;
  IF NOT FOUND THEN RETURN; END IF;

  UPDATE public.lead_attribution
    SET lead_id = _lead_id, updated_at = now()
    WHERE workspace_id = s.workspace_id
      AND visitor_id = _visitor_id
      AND lead_id IS NULL;
END;
$$;