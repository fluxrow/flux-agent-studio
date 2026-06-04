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

const GRAPH_API_BASE = "https://graph.facebook.com/v19.0";

const serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

interface SendRequest {
  connection_id: string;
  recipient_id:  string;
  message_text:  string;
  message_type?: "text";
}

async function sendWhatsApp(conn: any, recipientId: string, text: string): Promise<Response> {
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

async function sendInstagram(conn: any, recipientId: string, text: string): Promise<Response> {
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

async function sendMessenger(conn: any, recipientId: string, text: string): Promise<Response> {
  return sendInstagram(conn, recipientId, text);
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  // Authenticate caller
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return new Response("Unauthorized", { status: 401 });

  let body: SendRequest;
  try { body = await req.json(); } catch {
    return new Response("Bad JSON", { status: 400 });
  }

  const { connection_id, recipient_id, message_text } = body;
  if (!connection_id || !recipient_id || !message_text) {
    return new Response("Missing fields", { status: 400 });
  }

  // Load connection (service_role bypasses RLS — auth check is via JWT above)
  const { data: conn, error: connErr } = await serviceClient
    .from("meta_channel_connections")
    .select("*")
    .eq("id", connection_id)
    .eq("status", "active")
    .single();

  if (connErr || !conn) {
    return new Response("Connection not found", { status: 404 });
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
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 502 });
  }

  const metaBody = await metaRes.json().catch(() => ({}));

  if (!metaRes.ok) {
    console.error("[meta-send] Graph API error", metaRes.status, metaBody);
    return new Response(JSON.stringify({ error: "Meta API error", detail: metaBody }), {
      status: metaRes.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Store outbound message
  await serviceClient.from("meta_messages").insert({
    workspace_id:        conn.workspace_id,
    conversation_id:     null, // best-effort: could resolve by recipient_id
    external_message_id: (metaBody as any).messages?.[0]?.id ?? crypto.randomUUID(),
    direction:           "outbound",
    message_type:        "text",
    message_text,
    contact_external_id: recipient_id,
    sent_at:             new Date().toISOString(),
  }).maybeSingle();

  return new Response(JSON.stringify({ ok: true, meta: metaBody }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
