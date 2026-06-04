-- ============================================================
-- Meta Channels — Phase 27A.4
-- Tables: meta_channel_connections, meta_conversations, meta_messages
-- RPC:    store_meta_inbound (called by Edge Function / service_role)
-- ============================================================

-- ---- meta_channel_connections --------------------------------
-- One row per connected WhatsApp number / Instagram account / Messenger page.
CREATE TABLE public.meta_channel_connections (
  id               UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id     UUID    NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  platform         TEXT    NOT NULL CHECK (platform IN ('whatsapp','instagram','messenger')),
  display_name     TEXT    NOT NULL DEFAULT '',
  -- WhatsApp Cloud API
  phone_number_id  TEXT,
  -- Instagram / Messenger
  page_id          TEXT,
  ig_user_id       TEXT,
  -- Page access token (or system user token)
  access_token     TEXT    NOT NULL,
  -- Lifecycle
  webhook_verified BOOLEAN NOT NULL DEFAULT false,
  status           TEXT    NOT NULL DEFAULT 'active'
                   CHECK (status IN ('active','inactive','error')),
  error_message    TEXT,
  meta             JSONB   NOT NULL DEFAULT '{}'::jsonb,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_meta_conn_workspace ON public.meta_channel_connections(workspace_id);
CREATE INDEX idx_meta_conn_phone     ON public.meta_channel_connections(phone_number_id)
  WHERE phone_number_id IS NOT NULL;
CREATE INDEX idx_meta_conn_page      ON public.meta_channel_connections(page_id)
  WHERE page_id IS NOT NULL;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.meta_channel_connections TO authenticated;
GRANT ALL                            ON public.meta_channel_connections TO service_role;
ALTER TABLE public.meta_channel_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members view connections"
  ON public.meta_channel_connections FOR SELECT TO authenticated
  USING (public.is_workspace_member(workspace_id, auth.uid()));

CREATE POLICY "Admins manage connections"
  ON public.meta_channel_connections FOR ALL TO authenticated
  USING (public.has_workspace_role(
    workspace_id, auth.uid(),
    ARRAY['owner','admin']::public.workspace_role[]
  ));

CREATE TRIGGER trg_meta_conn_updated
  BEFORE UPDATE ON public.meta_channel_connections
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---- meta_conversations ---------------------------------------
-- Inbox read-model for Meta channel conversations.
-- Not tied to bot flows (no session_id / bot_id).
CREATE TABLE public.meta_conversations (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id             UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  connection_id            UUID NOT NULL REFERENCES public.meta_channel_connections(id) ON DELETE CASCADE,
  platform                 TEXT NOT NULL CHECK (platform IN ('whatsapp','instagram','messenger')),
  external_conversation_id TEXT NOT NULL,
  contact_external_id      TEXT NOT NULL,
  contact_name             TEXT NOT NULL DEFAULT 'Desconhecido',
  contact_avatar           TEXT,
  preview                  TEXT NOT NULL DEFAULT '',
  unread                   INTEGER NOT NULL DEFAULT 0,
  handoff_status           TEXT NOT NULL DEFAULT 'agent'
                           CHECK (handoff_status IN ('agent','human','resolved')),
  last_message_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (connection_id, external_conversation_id)
);

CREATE INDEX idx_meta_convs_ws   ON public.meta_conversations(workspace_id, last_message_at DESC);
CREATE INDEX idx_meta_convs_conn ON public.meta_conversations(connection_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.meta_conversations TO authenticated;
GRANT ALL                            ON public.meta_conversations TO service_role;
ALTER TABLE public.meta_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members view meta conversations"
  ON public.meta_conversations FOR SELECT TO authenticated
  USING (public.is_workspace_member(workspace_id, auth.uid()));

CREATE POLICY "Members update meta conversations"
  ON public.meta_conversations FOR UPDATE TO authenticated
  USING (public.is_workspace_member(workspace_id, auth.uid()));

CREATE TRIGGER trg_meta_convs_updated
  BEFORE UPDATE ON public.meta_conversations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---- meta_messages --------------------------------------------
CREATE TABLE public.meta_messages (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id        UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  conversation_id     UUID NOT NULL REFERENCES public.meta_conversations(id) ON DELETE CASCADE,
  external_message_id TEXT NOT NULL UNIQUE,
  direction           TEXT NOT NULL CHECK (direction IN ('inbound','outbound')),
  message_type        TEXT NOT NULL DEFAULT 'text',
  message_text        TEXT,
  contact_external_id TEXT NOT NULL,
  sent_at             TIMESTAMPTZ NOT NULL,
  raw_payload         JSONB,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_meta_msgs_conv ON public.meta_messages(conversation_id, sent_at DESC);
CREATE INDEX idx_meta_msgs_ws   ON public.meta_messages(workspace_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.meta_messages TO authenticated;
GRANT ALL                            ON public.meta_messages TO service_role;
ALTER TABLE public.meta_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members view meta messages"
  ON public.meta_messages FOR SELECT TO authenticated
  USING (public.is_workspace_member(workspace_id, auth.uid()));

CREATE POLICY "Members insert meta messages"
  ON public.meta_messages FOR INSERT TO authenticated
  WITH CHECK (public.is_workspace_member(workspace_id, auth.uid()));

-- ---- RPC: store_meta_inbound ----------------------------------
-- Called by the meta-webhook Edge Function using the service_role key.
-- Upserts the conversation and inserts the message atomically.
CREATE OR REPLACE FUNCTION public.store_meta_inbound(
  _connection_id        UUID,
  _platform             TEXT,
  _external_convo_id    TEXT,
  _contact_external_id  TEXT,
  _contact_name         TEXT,
  _message_text         TEXT,
  _message_type         TEXT,
  _external_message_id  TEXT,
  _sent_at              TIMESTAMPTZ,
  _raw_payload          JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _workspace_id UUID;
  _conv_id      UUID;
BEGIN
  SELECT workspace_id INTO _workspace_id
  FROM public.meta_channel_connections
  WHERE id = _connection_id;

  IF _workspace_id IS NULL THEN
    RAISE EXCEPTION 'meta_channel_connections: not found %', _connection_id;
  END IF;

  INSERT INTO public.meta_conversations (
    workspace_id, connection_id, platform,
    external_conversation_id, contact_external_id,
    contact_name, preview, unread, last_message_at
  ) VALUES (
    _workspace_id, _connection_id, _platform,
    _external_convo_id, _contact_external_id,
    _contact_name, LEFT(COALESCE(_message_text,''), 120), 1, _sent_at
  )
  ON CONFLICT (connection_id, external_conversation_id) DO UPDATE SET
    contact_name    = EXCLUDED.contact_name,
    preview         = EXCLUDED.preview,
    unread          = meta_conversations.unread + 1,
    last_message_at = EXCLUDED.last_message_at,
    updated_at      = now()
  RETURNING id INTO _conv_id;

  INSERT INTO public.meta_messages (
    workspace_id, conversation_id, external_message_id,
    direction, message_type, message_text,
    contact_external_id, sent_at, raw_payload
  ) VALUES (
    _workspace_id, _conv_id, _external_message_id,
    'inbound', _message_type, _message_text,
    _contact_external_id, _sent_at, _raw_payload
  )
  ON CONFLICT (external_message_id) DO NOTHING;

  RETURN _conv_id;
END;
$$;

-- RPC: find_connection_by_identifier ----------------------------
-- Used by webhook to route incoming message to the right workspace.
CREATE OR REPLACE FUNCTION public.find_meta_connection(
  _platform           TEXT,
  _phone_number_id    TEXT DEFAULT NULL,
  _page_id            TEXT DEFAULT NULL
)
RETURNS TABLE (id UUID, workspace_id UUID, access_token TEXT, status TEXT)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, workspace_id, access_token, status
  FROM public.meta_channel_connections
  WHERE platform = _platform
    AND status = 'active'
    AND (
      (_phone_number_id IS NOT NULL AND phone_number_id = _phone_number_id)
      OR
      (_page_id IS NOT NULL AND page_id = _page_id)
    )
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.store_meta_inbound    TO service_role;
GRANT EXECUTE ON FUNCTION public.find_meta_connection  TO service_role;
