/**
 * meta-send — Supabase Edge Function
 *
 * Proxies outbound message requests to the Meta Graph API.
 * The frontend cannot call Meta APIs directly (CORS). This Edge Function
 * acts as the secure proxy — it reads the access_token from the DB
 * (never exposing it to the browser) and forwards the message.
 *
 * POST /functions/v1/meta-send
 * Body: { connection_id, recipient_id, message_text, message_type? }
 * Auth: Supabase JWT (authenticated user only)
 *
 * Required env vars:
 *   SUPABASE_URL              — auto-injected
 *   SUPABASE_SERVICE_ROLE_KEY — auto-injected
 *   SUPABASE_ANON_KEY         — auto-injected
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL         = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const GRAPH_API_VERSION = Deno.env.get("META_GRAPH_API_VERSION");
const GRAPH_API_BASE = GRAPH_API_VERSION
  ? `https://graph.facebook.com/${GRAPH_API_VERSION}`
  : "https://graph.facebook.com";
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

function response(body: BodyInit | null, status = 200, json = false): Response {
  return new Response(body, {
    status,
    headers: {
      ...CORS,
      ...(json ? { "Content-Type": "application/json" } : {}),
    },
  });
}

async function authenticate(req: Request): Promise<string | null> {
  const token = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return null;

  const { data, error } = await serviceClient.auth.getUser(token);
  return error ? null : data.user?.id ?? null;
}

interface SendRequest {
  connection_id: string;
  recipient_id:  string;
  message_text:  string;
  message_type?: "text";
}

interface MetaConnection {
  id: string;
  workspace_id: string;
  platform: "whatsapp" | "instagram" | "messenger";
  access_token: string;
  phone_number_id: string | null;
}

interface MetaApiResponse {
  messages?: Array<{ id?: string }>;
  [key: string]: unknown;
}

async function sendWhatsApp(conn: MetaConnection, recipientId: string, text: string): Promise<Response> {
  const url = `${GRAPH_API_BASE}/${conn.phone_number_id}/messages`;
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${conn.access_token}`,
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type:    "individual",
      to:                recipientId,
      type:              "text",
      text:              { body: text },
    }),
  });
}

async function sendInstagram(conn: MetaConnection, recipientId: string, text: string): Promise<Response> {
  const url = `${GRAPH_API_BASE}/me/messages`;
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${conn.access_token}`,
    },
    body: JSON.stringify({
      recipient: { id: recipientId },
      message:   { text },
    }),
  });
}

async function sendMessenger(conn: MetaConnection, recipientId: string, text: string): Promise<Response> {
  return sendInstagram(conn, recipientId, text);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return response(null, 204);
  }
  if (req.method !== "POST") {
    return response("Method Not Allowed", 405);
  }

  const userId = await authenticate(req);
  if (!userId) return response("Unauthorized", 401);

  let body: SendRequest;
  try { body = await req.json(); } catch {
    return response("Bad JSON", 400);
  }

  const { connection_id, recipient_id, message_text } = body;
  if (!connection_id || !recipient_id || !message_text) {
    return response("Missing fields", 400);
  }

  // Load connection (service_role bypasses RLS — auth check is via JWT above)
  const { data: conn, error: connErr } = await serviceClient
    .from("meta_channel_connections")
    .select("*")
    .eq("id", connection_id)
    .eq("status", "active")
    .single();

  if (connErr || !conn) {
    return response("Connection not found", 404);
  }

  const { data: membership, error: membershipError } = await serviceClient
    .from("workspace_members")
    .select("workspace_id")
    .eq("workspace_id", conn.workspace_id)
    .eq("user_id", userId)
    .maybeSingle();

  if (membershipError || !membership) {
    return response("Forbidden", 403);
  }

  let metaRes: Response;
  try {
    if (conn.platform === "whatsapp") {
      metaRes = await sendWhatsApp(conn, recipient_id, message_text);
    } else if (conn.platform === "instagram") {
      metaRes = await sendInstagram(conn, recipient_id, message_text);
    } else {
      metaRes = await sendMessenger(conn, recipient_id, message_text);
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Meta request failed";
    return response(JSON.stringify({ error: message }), 502, true);
  }

  const metaBody = await metaRes.json().catch(() => ({})) as MetaApiResponse;

  if (!metaRes.ok) {
    console.error("[meta-send] Graph API error", metaRes.status, metaBody);
    return response(
      JSON.stringify({ error: "Meta API error", detail: metaBody }),
      metaRes.status,
      true,
    );
  }

  // Resolve conversation_id — upsert conversation for this recipient so the
  // outbound message satisfies the NOT NULL FK constraint.
  const externalConvoId = recipient_id;
  const { data: existingConversation, error: existingConversationError } =
    await serviceClient
      .from("meta_conversations")
      .select("id")
      .eq("connection_id", connection_id)
      .eq("external_conversation_id", externalConvoId)
      .maybeSingle();

  if (existingConversationError) {
    console.error("[meta-send] failed to load conversation", existingConversationError);
  }

  const conversationResult = existingConversation
    ? await serviceClient
        .from("meta_conversations")
        .update({
          preview: message_text.slice(0, 120),
          last_message_at: new Date().toISOString(),
        })
        .eq("id", existingConversation.id)
        .select("id")
        .single()
    : await serviceClient
        .from("meta_conversations")
        .insert({
          workspace_id:             conn.workspace_id,
          connection_id,
          platform:                 conn.platform,
          external_conversation_id: externalConvoId,
          contact_external_id:      recipient_id,
          contact_name:             recipient_id,
          preview:                  message_text.slice(0, 120),
          last_message_at:          new Date().toISOString(),
        })
        .select("id")
        .single();

  const { data: convRow, error: convErr } = conversationResult;
  if (convErr || !convRow) {
    console.error("[meta-send] failed to upsert conversation", convErr);
    return response(
      JSON.stringify({
        ok: true,
        persisted: false,
        warning: "Message delivered but conversation persistence failed",
        meta: metaBody,
      }),
      200,
      true,
    );
  }

  // Store outbound message
  const { error: messageInsertError } = await serviceClient.from("meta_messages").insert({
    workspace_id:        conn.workspace_id,
    conversation_id:     convRow.id,
    external_message_id: metaBody.messages?.[0]?.id ?? crypto.randomUUID(),
    direction:           "outbound",
    message_type:        "text",
    message_text,
    contact_external_id: recipient_id,
    sent_at:             new Date().toISOString(),
  });

  if (messageInsertError) {
    console.error("[meta-send] message delivered but persistence failed", messageInsertError);
  }

  return response(
    JSON.stringify({
      ok: true,
      persisted: !messageInsertError,
      meta: metaBody,
    }),
    200,
    true,
  );
});
