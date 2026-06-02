
-- ============================================================
-- Phase 5 — Supabase Foundation
-- Multi-tenant schema, RLS scoped by workspace membership
-- ============================================================

-- ---------- ENUMS ----------
CREATE TYPE public.workspace_role AS ENUM ('owner', 'admin', 'editor', 'viewer');
CREATE TYPE public.workspace_plan AS ENUM ('free', 'starter', 'growth', 'scale');
CREATE TYPE public.bot_status AS ENUM ('ativo', 'rascunho', 'arquivado');
CREATE TYPE public.bot_version_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE public.channel_status AS ENUM ('connected', 'disconnected', 'em_breve');
CREATE TYPE public.lead_stage AS ENUM ('novo', 'qualificado', 'negociacao', 'convertido', 'perdido');
CREATE TYPE public.lead_temperature AS ENUM ('frio', 'morno', 'quente');
CREATE TYPE public.session_status AS ENUM ('ativa', 'encerrada', 'humano', 'expirada');
CREATE TYPE public.message_role AS ENUM ('bot', 'user', 'agent', 'system');

-- ---------- updated_at helper ----------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- ============================================================
-- workspaces
-- ============================================================
CREATE TABLE public.workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  plan public.workspace_plan NOT NULL DEFAULT 'free',
  owner_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workspaces TO authenticated;
GRANT ALL ON public.workspaces TO service_role;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- profiles (1:1 with auth.users)
-- ============================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- workspace_members
-- ============================================================
CREATE TABLE public.workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.workspace_role NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, user_id)
);
CREATE INDEX idx_wm_user ON public.workspace_members(user_id);
CREATE INDEX idx_wm_workspace ON public.workspace_members(workspace_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workspace_members TO authenticated;
GRANT ALL ON public.workspace_members TO service_role;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Security definer helpers (avoid RLS recursion)
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_workspace_member(_workspace_id UUID, _user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE workspace_id = _workspace_id AND user_id = _user_id
  );
$$;

CREATE OR REPLACE FUNCTION public.has_workspace_role(_workspace_id UUID, _user_id UUID, _roles public.workspace_role[])
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE workspace_id = _workspace_id
      AND user_id = _user_id
      AND role = ANY(_roles)
  );
$$;

-- ============================================================
-- workspaces RLS
-- ============================================================
CREATE POLICY "Members can view their workspaces"
  ON public.workspaces FOR SELECT TO authenticated
  USING (public.is_workspace_member(id, auth.uid()));

CREATE POLICY "Authenticated users can create workspaces"
  ON public.workspaces FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners and admins can update workspace"
  ON public.workspaces FOR UPDATE TO authenticated
  USING (public.has_workspace_role(id, auth.uid(), ARRAY['owner','admin']::public.workspace_role[]));

CREATE POLICY "Only owner can delete workspace"
  ON public.workspaces FOR DELETE TO authenticated
  USING (owner_id = auth.uid());

-- ============================================================
-- profiles RLS (own profile only)
-- ============================================================
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid());

-- ============================================================
-- workspace_members RLS
-- ============================================================
CREATE POLICY "Members can view membership of their workspaces"
  ON public.workspace_members FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_workspace_member(workspace_id, auth.uid()));

CREATE POLICY "Owners and admins can add members"
  ON public.workspace_members FOR INSERT TO authenticated
  WITH CHECK (public.has_workspace_role(workspace_id, auth.uid(), ARRAY['owner','admin']::public.workspace_role[]));

CREATE POLICY "Owners and admins can update members"
  ON public.workspace_members FOR UPDATE TO authenticated
  USING (public.has_workspace_role(workspace_id, auth.uid(), ARRAY['owner','admin']::public.workspace_role[]));

CREATE POLICY "Owners and admins can remove members"
  ON public.workspace_members FOR DELETE TO authenticated
  USING (public.has_workspace_role(workspace_id, auth.uid(), ARRAY['owner','admin']::public.workspace_role[]));

-- ============================================================
-- bots
-- ============================================================
CREATE TABLE public.bots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  status public.bot_status NOT NULL DEFAULT 'rascunho',
  channel TEXT NOT NULL DEFAULT 'whatsapp',
  conversations_count INTEGER NOT NULL DEFAULT 0,
  conversions_count INTEGER NOT NULL DEFAULT 0,
  published_version_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_bots_workspace ON public.bots(workspace_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bots TO authenticated;
GRANT ALL ON public.bots TO service_role;
ALTER TABLE public.bots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view bots" ON public.bots FOR SELECT TO authenticated
  USING (public.is_workspace_member(workspace_id, auth.uid()));
CREATE POLICY "Editors+ can create bots" ON public.bots FOR INSERT TO authenticated
  WITH CHECK (public.has_workspace_role(workspace_id, auth.uid(), ARRAY['owner','admin','editor']::public.workspace_role[]));
CREATE POLICY "Editors+ can update bots" ON public.bots FOR UPDATE TO authenticated
  USING (public.has_workspace_role(workspace_id, auth.uid(), ARRAY['owner','admin','editor']::public.workspace_role[]));
CREATE POLICY "Admins+ can delete bots" ON public.bots FOR DELETE TO authenticated
  USING (public.has_workspace_role(workspace_id, auth.uid(), ARRAY['owner','admin']::public.workspace_role[]));

-- ============================================================
-- bot_versions
-- ============================================================
CREATE TABLE public.bot_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_id UUID NOT NULL REFERENCES public.bots(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  status public.bot_version_status NOT NULL DEFAULT 'draft',
  snapshot JSONB NOT NULL,
  note TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (bot_id, version)
);
CREATE INDEX idx_bot_versions_bot ON public.bot_versions(bot_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bot_versions TO authenticated;
GRANT ALL ON public.bot_versions TO service_role;
ALTER TABLE public.bot_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view bot versions" ON public.bot_versions FOR SELECT TO authenticated
  USING (public.is_workspace_member(workspace_id, auth.uid()));
CREATE POLICY "Editors+ can create bot versions" ON public.bot_versions FOR INSERT TO authenticated
  WITH CHECK (public.has_workspace_role(workspace_id, auth.uid(), ARRAY['owner','admin','editor']::public.workspace_role[]));
CREATE POLICY "Editors+ can update bot versions" ON public.bot_versions FOR UPDATE TO authenticated
  USING (public.has_workspace_role(workspace_id, auth.uid(), ARRAY['owner','admin','editor']::public.workspace_role[]));
CREATE POLICY "Admins+ can delete bot versions" ON public.bot_versions FOR DELETE TO authenticated
  USING (public.has_workspace_role(workspace_id, auth.uid(), ARRAY['owner','admin']::public.workspace_role[]));

-- ============================================================
-- flows / flow_blocks / flow_connections
-- ============================================================
CREATE TABLE public.flows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_id UUID NOT NULL UNIQUE REFERENCES public.bots(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Main flow',
  variables JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.flows TO authenticated;
GRANT ALL ON public.flows TO service_role;
ALTER TABLE public.flows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view flows" ON public.flows FOR SELECT TO authenticated
  USING (public.is_workspace_member(workspace_id, auth.uid()));
CREATE POLICY "Editors+ can write flows insert" ON public.flows FOR INSERT TO authenticated
  WITH CHECK (public.has_workspace_role(workspace_id, auth.uid(), ARRAY['owner','admin','editor']::public.workspace_role[]));
CREATE POLICY "Editors+ can write flows update" ON public.flows FOR UPDATE TO authenticated
  USING (public.has_workspace_role(workspace_id, auth.uid(), ARRAY['owner','admin','editor']::public.workspace_role[]));
CREATE POLICY "Admins+ can delete flows" ON public.flows FOR DELETE TO authenticated
  USING (public.has_workspace_role(workspace_id, auth.uid(), ARRAY['owner','admin']::public.workspace_role[]));

CREATE TABLE public.flow_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flow_id UUID NOT NULL REFERENCES public.flows(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  block_key TEXT NOT NULL,
  type TEXT NOT NULL,
  label TEXT,
  position JSONB NOT NULL DEFAULT '{"x":0,"y":0}'::jsonb,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (flow_id, block_key)
);
CREATE INDEX idx_flow_blocks_flow ON public.flow_blocks(flow_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.flow_blocks TO authenticated;
GRANT ALL ON public.flow_blocks TO service_role;
ALTER TABLE public.flow_blocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view flow_blocks" ON public.flow_blocks FOR SELECT TO authenticated
  USING (public.is_workspace_member(workspace_id, auth.uid()));
CREATE POLICY "Editors+ can insert flow_blocks" ON public.flow_blocks FOR INSERT TO authenticated
  WITH CHECK (public.has_workspace_role(workspace_id, auth.uid(), ARRAY['owner','admin','editor']::public.workspace_role[]));
CREATE POLICY "Editors+ can update flow_blocks" ON public.flow_blocks FOR UPDATE TO authenticated
  USING (public.has_workspace_role(workspace_id, auth.uid(), ARRAY['owner','admin','editor']::public.workspace_role[]));
CREATE POLICY "Editors+ can delete flow_blocks" ON public.flow_blocks FOR DELETE TO authenticated
  USING (public.has_workspace_role(workspace_id, auth.uid(), ARRAY['owner','admin','editor']::public.workspace_role[]));

CREATE TABLE public.flow_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flow_id UUID NOT NULL REFERENCES public.flows(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  connection_key TEXT NOT NULL,
  from_block_key TEXT NOT NULL,
  to_block_key TEXT NOT NULL,
  condition TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (flow_id, connection_key)
);
CREATE INDEX idx_flow_connections_flow ON public.flow_connections(flow_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.flow_connections TO authenticated;
GRANT ALL ON public.flow_connections TO service_role;
ALTER TABLE public.flow_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view flow_connections" ON public.flow_connections FOR SELECT TO authenticated
  USING (public.is_workspace_member(workspace_id, auth.uid()));
CREATE POLICY "Editors+ can insert flow_connections" ON public.flow_connections FOR INSERT TO authenticated
  WITH CHECK (public.has_workspace_role(workspace_id, auth.uid(), ARRAY['owner','admin','editor']::public.workspace_role[]));
CREATE POLICY "Editors+ can update flow_connections" ON public.flow_connections FOR UPDATE TO authenticated
  USING (public.has_workspace_role(workspace_id, auth.uid(), ARRAY['owner','admin','editor']::public.workspace_role[]));
CREATE POLICY "Editors+ can delete flow_connections" ON public.flow_connections FOR DELETE TO authenticated
  USING (public.has_workspace_role(workspace_id, auth.uid(), ARRAY['owner','admin','editor']::public.workspace_role[]));

-- ============================================================
-- channels
-- ============================================================
CREATE TABLE public.channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  channel_key TEXT NOT NULL,
  name TEXT NOT NULL,
  status public.channel_status NOT NULL DEFAULT 'disconnected',
  account TEXT,
  description TEXT,
  coming_soon BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, channel_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.channels TO authenticated;
GRANT ALL ON public.channels TO service_role;
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members view channels" ON public.channels FOR SELECT TO authenticated
  USING (public.is_workspace_member(workspace_id, auth.uid()));
CREATE POLICY "Editors+ insert channels" ON public.channels FOR INSERT TO authenticated
  WITH CHECK (public.has_workspace_role(workspace_id, auth.uid(), ARRAY['owner','admin','editor']::public.workspace_role[]));
CREATE POLICY "Editors+ update channels" ON public.channels FOR UPDATE TO authenticated
  USING (public.has_workspace_role(workspace_id, auth.uid(), ARRAY['owner','admin','editor']::public.workspace_role[]));
CREATE POLICY "Admins+ delete channels" ON public.channels FOR DELETE TO authenticated
  USING (public.has_workspace_role(workspace_id, auth.uid(), ARRAY['owner','admin']::public.workspace_role[]));

-- ============================================================
-- leads
-- ============================================================
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  bot_id UUID REFERENCES public.bots(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  source TEXT NOT NULL DEFAULT 'unknown',
  stage public.lead_stage NOT NULL DEFAULT 'novo',
  score INTEGER NOT NULL DEFAULT 0,
  temperature public.lead_temperature NOT NULL DEFAULT 'frio',
  tags TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_leads_workspace ON public.leads(workspace_id);
CREATE INDEX idx_leads_stage ON public.leads(stage);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leads TO authenticated;
GRANT ALL ON public.leads TO service_role;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members view leads" ON public.leads FOR SELECT TO authenticated
  USING (public.is_workspace_member(workspace_id, auth.uid()));
CREATE POLICY "Editors+ insert leads" ON public.leads FOR INSERT TO authenticated
  WITH CHECK (public.has_workspace_role(workspace_id, auth.uid(), ARRAY['owner','admin','editor']::public.workspace_role[]));
CREATE POLICY "Editors+ update leads" ON public.leads FOR UPDATE TO authenticated
  USING (public.has_workspace_role(workspace_id, auth.uid(), ARRAY['owner','admin','editor']::public.workspace_role[]));
CREATE POLICY "Admins+ delete leads" ON public.leads FOR DELETE TO authenticated
  USING (public.has_workspace_role(workspace_id, auth.uid(), ARRAY['owner','admin']::public.workspace_role[]));

-- ============================================================
-- sessions
-- ============================================================
CREATE TABLE public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  bot_id UUID NOT NULL REFERENCES public.bots(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  visitor_id TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'web',
  status public.session_status NOT NULL DEFAULT 'ativa',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  current_block_key TEXT,
  variables JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_sessions_workspace ON public.sessions(workspace_id);
CREATE INDEX idx_sessions_bot ON public.sessions(bot_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sessions TO authenticated;
GRANT ALL ON public.sessions TO service_role;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members view sessions" ON public.sessions FOR SELECT TO authenticated
  USING (public.is_workspace_member(workspace_id, auth.uid()));
CREATE POLICY "Members insert sessions" ON public.sessions FOR INSERT TO authenticated
  WITH CHECK (public.is_workspace_member(workspace_id, auth.uid()));
CREATE POLICY "Members update sessions" ON public.sessions FOR UPDATE TO authenticated
  USING (public.is_workspace_member(workspace_id, auth.uid()));
CREATE POLICY "Admins+ delete sessions" ON public.sessions FOR DELETE TO authenticated
  USING (public.has_workspace_role(workspace_id, auth.uid(), ARRAY['owner','admin']::public.workspace_role[]));

-- ============================================================
-- conversations (read model for inbox)
-- ============================================================
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  bot_id UUID NOT NULL REFERENCES public.bots(id) ON DELETE CASCADE,
  lead_name TEXT NOT NULL DEFAULT 'Visitante',
  bot_name TEXT NOT NULL,
  preview TEXT NOT NULL DEFAULT '',
  unread INTEGER NOT NULL DEFAULT 0,
  status public.session_status NOT NULL DEFAULT 'ativa',
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_conversations_workspace ON public.conversations(workspace_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.conversations TO authenticated;
GRANT ALL ON public.conversations TO service_role;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members view conversations" ON public.conversations FOR SELECT TO authenticated
  USING (public.is_workspace_member(workspace_id, auth.uid()));
CREATE POLICY "Members insert conversations" ON public.conversations FOR INSERT TO authenticated
  WITH CHECK (public.is_workspace_member(workspace_id, auth.uid()));
CREATE POLICY "Members update conversations" ON public.conversations FOR UPDATE TO authenticated
  USING (public.is_workspace_member(workspace_id, auth.uid()));
CREATE POLICY "Admins+ delete conversations" ON public.conversations FOR DELETE TO authenticated
  USING (public.has_workspace_role(workspace_id, auth.uid(), ARRAY['owner','admin']::public.workspace_role[]));

-- ============================================================
-- messages
-- ============================================================
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  role public.message_role NOT NULL,
  text TEXT NOT NULL,
  block_key TEXT,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_messages_session ON public.messages(session_id);
CREATE INDEX idx_messages_workspace ON public.messages(workspace_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members view messages" ON public.messages FOR SELECT TO authenticated
  USING (public.is_workspace_member(workspace_id, auth.uid()));
CREATE POLICY "Members insert messages" ON public.messages FOR INSERT TO authenticated
  WITH CHECK (public.is_workspace_member(workspace_id, auth.uid()));
CREATE POLICY "Admins+ delete messages" ON public.messages FOR DELETE TO authenticated
  USING (public.has_workspace_role(workspace_id, auth.uid(), ARRAY['owner','admin']::public.workspace_role[]));

-- ============================================================
-- events (Runtime Engine execution log)
-- ============================================================
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
  flow_id UUID REFERENCES public.flows(id) ON DELETE SET NULL,
  bot_id UUID REFERENCES public.bots(id) ON DELETE SET NULL,
  block_key TEXT,
  type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_events_workspace ON public.events(workspace_id);
CREATE INDEX idx_events_session ON public.events(session_id);
CREATE INDEX idx_events_type ON public.events(type);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.events TO authenticated;
GRANT ALL ON public.events TO service_role;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members view events" ON public.events FOR SELECT TO authenticated
  USING (public.is_workspace_member(workspace_id, auth.uid()));
CREATE POLICY "Members insert events" ON public.events FOR INSERT TO authenticated
  WITH CHECK (public.is_workspace_member(workspace_id, auth.uid()));
CREATE POLICY "Admins+ delete events" ON public.events FOR DELETE TO authenticated
  USING (public.has_workspace_role(workspace_id, auth.uid(), ARRAY['owner','admin']::public.workspace_role[]));

-- ============================================================
-- updated_at triggers
-- ============================================================
CREATE TRIGGER trg_workspaces_updated BEFORE UPDATE ON public.workspaces FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_workspace_members_updated BEFORE UPDATE ON public.workspace_members FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_bots_updated BEFORE UPDATE ON public.bots FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_flows_updated BEFORE UPDATE ON public.flows FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_flow_blocks_updated BEFORE UPDATE ON public.flow_blocks FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_channels_updated BEFORE UPDATE ON public.channels FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_leads_updated BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_sessions_updated BEFORE UPDATE ON public.sessions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_conversations_updated BEFORE UPDATE ON public.conversations FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- Auto-bootstrap on signup
-- profile + personal workspace + owner membership
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  new_workspace_id UUID;
  base_slug TEXT;
  final_slug TEXT;
  display_name TEXT;
  i INT := 0;
BEGIN
  display_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1));

  INSERT INTO public.profiles (id, full_name, email, avatar_url)
  VALUES (NEW.id, display_name, NEW.email, NEW.raw_user_meta_data->>'avatar_url');

  base_slug := lower(regexp_replace(coalesce(display_name, 'workspace'), '[^a-zA-Z0-9]+', '-', 'g'));
  base_slug := trim(both '-' from base_slug);
  IF length(base_slug) = 0 THEN base_slug := 'workspace'; END IF;
  final_slug := base_slug;
  WHILE EXISTS (SELECT 1 FROM public.workspaces WHERE slug = final_slug) LOOP
    i := i + 1;
    final_slug := base_slug || '-' || i::TEXT;
  END LOOP;

  INSERT INTO public.workspaces (name, slug, plan, owner_id)
  VALUES (display_name || '''s workspace', final_slug, 'free', NEW.id)
  RETURNING id INTO new_workspace_id;

  INSERT INTO public.workspace_members (workspace_id, user_id, role)
  VALUES (new_workspace_id, NEW.id, 'owner');

  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
