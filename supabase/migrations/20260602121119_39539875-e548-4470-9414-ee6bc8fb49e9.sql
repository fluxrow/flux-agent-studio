
-- 1. Schema additions
ALTER TABLE public.bots
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS published_snapshot JSONB,
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

CREATE UNIQUE INDEX IF NOT EXISTS bots_slug_unique ON public.bots(slug) WHERE slug IS NOT NULL;

-- Slug auto-generation helper
CREATE OR REPLACE FUNCTION public.slugify(_input TEXT)
RETURNS TEXT
LANGUAGE sql IMMUTABLE
AS $$
  SELECT trim(both '-' from regexp_replace(lower(coalesce(_input, '')), '[^a-z0-9]+', '-', 'g'))
$$;

CREATE OR REPLACE FUNCTION public.bots_assign_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  base TEXT;
  candidate TEXT;
  i INT := 0;
BEGIN
  IF NEW.slug IS NOT NULL AND length(NEW.slug) > 0 THEN
    RETURN NEW;
  END IF;
  base := public.slugify(NEW.name);
  IF length(base) = 0 THEN base := 'bot'; END IF;
  candidate := base;
  WHILE EXISTS (SELECT 1 FROM public.bots WHERE slug = candidate AND id <> NEW.id) LOOP
    i := i + 1;
    candidate := base || '-' || i::TEXT;
  END LOOP;
  NEW.slug := candidate;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS bots_assign_slug_trigger ON public.bots;
CREATE TRIGGER bots_assign_slug_trigger
BEFORE INSERT OR UPDATE OF name, slug ON public.bots
FOR EACH ROW EXECUTE FUNCTION public.bots_assign_slug();

-- Backfill existing rows
UPDATE public.bots SET slug = NULL WHERE slug = '';
UPDATE public.bots b SET name = name WHERE slug IS NULL;

-- 2. Publish RPC (editor+)
CREATE OR REPLACE FUNCTION public.publish_bot(_bot_id UUID, _snapshot JSONB, _slug TEXT DEFAULT NULL, _note TEXT DEFAULT NULL)
RETURNS public.bots
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  bot_row public.bots;
  ws_id UUID;
  ver INT;
  desired_slug TEXT;
  final_slug TEXT;
  base TEXT;
  i INT := 0;
BEGIN
  SELECT * INTO bot_row FROM public.bots WHERE id = _bot_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Bot not found'; END IF;
  ws_id := bot_row.workspace_id;

  IF NOT public.has_workspace_role(ws_id, auth.uid(),
       ARRAY['owner'::workspace_role, 'admin'::workspace_role, 'editor'::workspace_role]) THEN
    RAISE EXCEPTION 'Not authorized to publish in this workspace';
  END IF;

  -- Resolve slug
  desired_slug := NULLIF(trim(_slug), '');
  IF desired_slug IS NULL THEN
    final_slug := COALESCE(bot_row.slug, public.slugify(bot_row.name));
  ELSE
    base := public.slugify(desired_slug);
    IF length(base) = 0 THEN base := 'bot'; END IF;
    final_slug := base;
    WHILE EXISTS (SELECT 1 FROM public.bots WHERE slug = final_slug AND id <> _bot_id) LOOP
      i := i + 1;
      final_slug := base || '-' || i::TEXT;
    END LOOP;
  END IF;

  SELECT COALESCE(MAX(version), 0) + 1 INTO ver FROM public.bot_versions WHERE bot_id = _bot_id;

  INSERT INTO public.bot_versions (bot_id, workspace_id, version, status, snapshot, note, created_by)
  VALUES (_bot_id, ws_id, ver, 'published', _snapshot, _note, auth.uid());

  UPDATE public.bots
    SET slug = final_slug,
        status = 'ativo',
        published_snapshot = _snapshot,
        published_at = now(),
        updated_at = now()
    WHERE id = _bot_id
    RETURNING * INTO bot_row;

  RETURN bot_row;
END;
$$;

GRANT EXECUTE ON FUNCTION public.publish_bot(UUID, JSONB, TEXT, TEXT) TO authenticated;

-- 3. Public read RPC (anon)
CREATE OR REPLACE FUNCTION public.get_public_bot(_slug TEXT)
RETURNS JSONB
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'id', b.id,
    'slug', b.slug,
    'name', b.name,
    'description', b.description,
    'channel', b.channel,
    'workspaceId', b.workspace_id,
    'snapshot', b.published_snapshot,
    'publishedAt', b.published_at
  )
  FROM public.bots b
  WHERE b.slug = _slug
    AND b.status = 'ativo'
    AND b.published_snapshot IS NOT NULL
  LIMIT 1
$$;

GRANT EXECUTE ON FUNCTION public.get_public_bot(TEXT) TO anon, authenticated;

-- 4. Public session creation (anon)
CREATE OR REPLACE FUNCTION public.record_public_session(_slug TEXT, _visitor_id TEXT, _variables JSONB DEFAULT '{}'::jsonb)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  bot_row public.bots;
  new_session_id UUID;
BEGIN
  SELECT * INTO bot_row FROM public.bots
    WHERE slug = _slug AND status = 'ativo' AND published_snapshot IS NOT NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'Public bot not found'; END IF;

  INSERT INTO public.sessions (bot_id, workspace_id, visitor_id, channel, status, variables)
  VALUES (bot_row.id, bot_row.workspace_id, _visitor_id, 'web', 'ativa', _variables)
  RETURNING id INTO new_session_id;

  RETURN new_session_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.record_public_session(TEXT, TEXT, JSONB) TO anon, authenticated;

-- 5. Public event (anon) — scoped to a known public session
CREATE OR REPLACE FUNCTION public.record_public_event(_session_id UUID, _type TEXT, _payload JSONB DEFAULT '{}'::jsonb, _block_key TEXT DEFAULT NULL)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  s public.sessions;
  bot_row public.bots;
BEGIN
  SELECT * INTO s FROM public.sessions WHERE id = _session_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Session not found'; END IF;
  -- Verify the session belongs to a still-published bot
  SELECT * INTO bot_row FROM public.bots
    WHERE id = s.bot_id AND status = 'ativo' AND published_snapshot IS NOT NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'Bot not public'; END IF;

  INSERT INTO public.events (workspace_id, bot_id, flow_id, session_id, lead_id, type, payload, block_key)
  VALUES (s.workspace_id, s.bot_id, s.bot_id, s.id, s.lead_id, _type, COALESCE(_payload, '{}'::jsonb), _block_key);
END;
$$;

GRANT EXECUTE ON FUNCTION public.record_public_event(UUID, TEXT, JSONB, TEXT) TO anon, authenticated;

-- 6. Public message (anon)
CREATE OR REPLACE FUNCTION public.record_public_message(_session_id UUID, _role TEXT, _text TEXT, _block_key TEXT DEFAULT NULL)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  s public.sessions;
  bot_row public.bots;
BEGIN
  SELECT * INTO s FROM public.sessions WHERE id = _session_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Session not found'; END IF;
  SELECT * INTO bot_row FROM public.bots
    WHERE id = s.bot_id AND status = 'ativo' AND published_snapshot IS NOT NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'Bot not public'; END IF;

  INSERT INTO public.messages (workspace_id, session_id, role, text, block_key)
  VALUES (s.workspace_id, s.id, _role::message_role, _text, _block_key);
END;
$$;

GRANT EXECUTE ON FUNCTION public.record_public_message(UUID, TEXT, TEXT, TEXT) TO anon, authenticated;

-- 7. Public lead creation (anon)
CREATE OR REPLACE FUNCTION public.record_public_lead(
  _session_id UUID,
  _name TEXT,
  _email TEXT DEFAULT NULL,
  _phone TEXT DEFAULT NULL,
  _company TEXT DEFAULT NULL,
  _tags TEXT[] DEFAULT NULL,
  _score INT DEFAULT 0
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  s public.sessions;
  bot_row public.bots;
  new_lead_id UUID;
BEGIN
  SELECT * INTO s FROM public.sessions WHERE id = _session_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Session not found'; END IF;
  SELECT * INTO bot_row FROM public.bots
    WHERE id = s.bot_id AND status = 'ativo' AND published_snapshot IS NOT NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'Bot not public'; END IF;

  INSERT INTO public.leads (workspace_id, bot_id, name, email, phone, company, source, tags, score, stage)
  VALUES (s.workspace_id, s.bot_id, _name, _email, _phone, _company, 'public-bot', _tags, COALESCE(_score, 0), 'novo'::lead_stage)
  RETURNING id INTO new_lead_id;

  UPDATE public.sessions SET lead_id = new_lead_id, updated_at = now() WHERE id = _session_id;
  RETURN new_lead_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.record_public_lead(UUID, TEXT, TEXT, TEXT, TEXT, TEXT[], INT) TO anon, authenticated;
