/**
 * Validates a saved Meta connection using the Graph API, then activates it.
 * Access tokens remain server-side and are never returned to the browser.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const GRAPH_API_VERSION = Deno.env.get("META_GRAPH_API_VERSION");
const GRAPH_API_BASE = GRAPH_API_VERSION
  ? `https://graph.facebook.com/${GRAPH_API_VERSION}`
  : "https://graph.facebook.com";
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const db = createClient(SUPABASE_URL, SERVICE_KEY);

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

async function authenticate(req: Request): Promise<string | null> {
  const token = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return null;
  const { data, error } = await db.auth.getUser(token);
  return error ? null : data.user?.id ?? null;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const userId = await authenticate(req);
  if (!userId) return json({ error: "unauthorized" }, 401);

  const body = await req.json().catch(() => ({})) as { connection_id?: string };
  if (!body.connection_id) return json({ error: "connection_id_required" }, 400);

  const { data: connection, error: connectionError } = await db
    .from("meta_channel_connections")
    .select("id, workspace_id, platform, access_token, phone_number_id, page_id, ig_user_id")
    .eq("id", body.connection_id)
    .maybeSingle();
  if (connectionError || !connection) return json({ error: "connection_not_found" }, 404);

  const { data: membership } = await db
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", connection.workspace_id)
    .eq("user_id", userId)
    .in("role", ["owner", "admin"])
    .maybeSingle();
  if (!membership) return json({ error: "forbidden" }, 403);

  const externalId = connection.platform === "whatsapp"
    ? connection.phone_number_id
    : connection.platform === "instagram"
      ? connection.ig_user_id ?? connection.page_id
      : connection.page_id;
  if (!externalId) return json({ error: "platform_identifier_missing" }, 400);

  const fields = connection.platform === "whatsapp"
    ? "id,display_phone_number,verified_name"
    : connection.platform === "instagram"
      ? "id,username,name"
      : "id,name";
  const graphUrl = new URL(`${GRAPH_API_BASE}/${encodeURIComponent(externalId)}`);
  graphUrl.searchParams.set("fields", fields);

  const graphResponse = await fetch(graphUrl, {
    headers: { Authorization: `Bearer ${connection.access_token}` },
  });
  const graphData = await graphResponse.json().catch(() => ({})) as {
    id?: string;
    error?: { message?: string; code?: number };
    [key: string]: unknown;
  };

  if (!graphResponse.ok || graphData.id !== String(externalId)) {
    const message = graphData.error?.message ?? "Meta credentials could not be verified";
    await db
      .from("meta_channel_connections")
      .update({ status: "error", error_message: message })
      .eq("id", connection.id)
      .eq("workspace_id", connection.workspace_id);
    return json({ error: "meta_verification_failed", detail: message }, 422);
  }

  const { error: activateError } = await db.rpc("mark_meta_connection_verified", {
    target_connection_id: connection.id,
  });
  if (activateError) return json({ error: "activation_failed" }, 500);

  return json({
    ok: true,
    connection_id: connection.id,
    status: "active",
    profile: graphData,
  });
});
