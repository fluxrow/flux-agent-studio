/**
 * meta-webhook — Supabase Edge Function
 *
 * Handles Meta Platform webhook events for WhatsApp, Instagram DM
 * and Facebook Messenger. Must be deployed as a Supabase Edge Function
 * so it has a stable HTTPS URL for Meta's webhook subscription.
 *
 * GET  /functions/v1/meta-webhook  — hub challenge verification
 * POST /functions/v1/meta-webhook  — inbound events
 *
 * Required env vars (set in Supabase Dashboard → Edge Functions → Secrets):
 *   META_VERIFY_TOKEN   — arbitrary string used during webhook setup
 *   META_APP_SECRET     — from Meta App → Settings → Basic → App Secret
 *   SUPABASE_URL        — auto-injected by Supabase runtime
 *   SUPABASE_SERVICE_ROLE_KEY — auto-injected by Supabase runtime
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL            = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY    = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const META_VERIFY_TOKEN       = Deno.env.get("META_VERIFY_TOKEN") ?? "flux_meta_verify";
const META_APP_SECRET         = Deno.env.get("META_APP_SECRET") ?? "";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ---- HMAC-SHA256 verification --------------------------------
async function verifySignature(body: string, sigHeader: string | null): Promise<boolean> {
  if (!META_APP_SECRET || !sigHeader) return false;
  const [algo, hex] = sigHeader.split("=");
  if (algo !== "sha256" || !hex) return false;
  const key  = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(META_APP_SECRET),
    { name: "HMAC", hash: "SHA-256" }, false, ["verify"]
  );
  const sig  = new Uint8Array(hex.match(/.{2}/g)!.map(b => parseInt(b, 16)));
  const data = new TextEncoder().encode(body);
  return crypto.subtle.verify("HMAC", key, sig, data);
}

// ---- Message normalizer -------------------------------------
interface NormalizedMessage {
  platform:             "whatsapp" | "instagram" | "messenger";
  externalConvoId:      string;
  externalMessageId:    string;
  contactExternalId:    string;
  contactName:          string;
  messageText:          string;
  messageType:          string;
  sentAt:               Date;
  phoneNumberId?:       string;
  pageId?:              string;
}

function extractWhatsApp(entry: any): NormalizedMessage[] {
  const msgs: NormalizedMessage[] = [];
  for (const change of entry.changes ?? []) {
    const val = change.value;
    if (!val?.messages) continue;
    const phoneNumberId = val.metadata?.phone_number_id ?? "";
    for (const msg of val.messages) {
      const contact = val.contacts?.find((c: any) => c.wa_id === msg.from);
      msgs.push({
        platform:          "whatsapp",
        externalConvoId:   msg.from,
        externalMessageId: msg.id,
        contactExternalId: msg.from,
        contactName:       contact?.profile?.name ?? msg.from,
        messageText:       msg.text?.body ?? msg.type,
        messageType:       msg.type ?? "text",
        sentAt:            new Date(Number(msg.timestamp) * 1000),
        phoneNumberId,
      });
    }
  }
  return msgs;
}

function extractInstagram(entry: any): NormalizedMessage[] {
  const msgs: NormalizedMessage[] = [];
  for (const msg of entry.messaging ?? []) {
    if (!msg.message) continue;
    msgs.push({
      platform:          "instagram",
      externalConvoId:   msg.sender.id,
      externalMessageId: msg.message.mid,
      contactExternalId: msg.sender.id,
      contactName:       msg.sender.name ?? msg.sender.id,
      messageText:       msg.message.text ?? "",
      messageType:       msg.message.attachments ? "attachment" : "text",
      sentAt:            new Date(msg.timestamp),
      pageId:            entry.id,
    });
  }
  return msgs;
}

function extractMessenger(entry: any): NormalizedMessage[] {
  const msgs: NormalizedMessage[] = [];
  for (const msg of entry.messaging ?? []) {
    if (!msg.message) continue;
    msgs.push({
      platform:          "messenger",
      externalConvoId:   msg.sender.id,
      externalMessageId: msg.message.mid,
      contactExternalId: msg.sender.id,
      contactName:       msg.sender.name ?? msg.sender.id,
      messageText:       msg.message.text ?? "",
      messageType:       msg.message.attachments ? "attachment" : "text",
      sentAt:            new Date(msg.timestamp),
      pageId:            entry.id,
    });
  }
  return msgs;
}

// ---- Route message to workspace and persist ------------------
async function routeAndStore(msg: NormalizedMessage): Promise<void> {
  const { data: conn, error } = await supabase.rpc("find_meta_connection", {
    _platform:        msg.platform,
    _phone_number_id: msg.phoneNumberId ?? null,
    _page_id:         msg.pageId ?? null,
  });

  if (error || !conn || conn.length === 0) {
    console.warn("[meta-webhook] no active connection for", msg.platform, msg.phoneNumberId ?? msg.pageId);
    return;
  }

  const connection = conn[0];

  const { error: rpcErr } = await supabase.rpc("store_meta_inbound", {
    _connection_id:       connection.id,
    _platform:            msg.platform,
    _external_convo_id:   msg.externalConvoId,
    _contact_external_id: msg.contactExternalId,
    _contact_name:        msg.contactName,
    _message_text:        msg.messageText,
    _message_type:        msg.messageType,
    _external_message_id: msg.externalMessageId,
    _sent_at:             msg.sentAt.toISOString(),
    _raw_payload:         {},
  });

  if (rpcErr) console.error("[meta-webhook] store_meta_inbound failed", rpcErr);
}

// ---- Main handler -------------------------------------------
Deno.serve(async (req: Request) => {
  // Hub challenge (GET)
  if (req.method === "GET") {
    const url    = new URL(req.url);
    const mode   = url.searchParams.get("hub.mode");
    const token  = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");

    if (mode === "subscribe" && token === META_VERIFY_TOKEN && challenge) {
      return new Response(challenge, { status: 200 });
    }
    return new Response("Forbidden", { status: 403 });
  }

  // Inbound events (POST)
  if (req.method === "POST") {
    const rawBody = await req.text();

    // Verify HMAC (skip in dev if secret not set)
    if (META_APP_SECRET) {
      const sig = req.headers.get("x-hub-signature-256");
      const valid = await verifySignature(rawBody, sig);
      if (!valid) return new Response("Invalid signature", { status: 401 });
    }

    let body: any;
    try { body = JSON.parse(rawBody); } catch {
      return new Response("Bad JSON", { status: 400 });
    }

    // Respond 200 immediately — process async
    const process = async () => {
      for (const entry of body.entry ?? []) {
        let messages: NormalizedMessage[] = [];

        if (body.object === "whatsapp_business_account") {
          messages = extractWhatsApp(entry);
        } else if (body.object === "instagram") {
          messages = extractInstagram(entry);
        } else if (body.object === "page") {
          messages = extractMessenger(entry);
        }

        for (const msg of messages) {
          await routeAndStore(msg);
        }
      }
    };

    // Fire and forget (Edge Function must respond within timeout)
    process().catch(e => console.error("[meta-webhook] process error", e));

    return new Response("EVENT_RECEIVED", { status: 200 });
  }

  return new Response("Method Not Allowed", { status: 405 });
});
