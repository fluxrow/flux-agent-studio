// Lovable AI Gateway proxy.
// Frontend calls this function; this function calls Lovable AI with the
// server-side LOVABLE_API_KEY. No user-provided OpenAI key required.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const authClient = createClient(SUPABASE_URL, SERVICE_KEY);
const ALLOWED_MODELS = new Set([
  "google/gemini-3-flash-preview",
  "google/gemini-2.5-flash",
  "google/gemini-2.5-pro",
  "openai/gpt-5-mini",
  "openai/gpt-5",
]);
const MAX_OUTPUT_TOKENS = 4096;
const MAX_BODY_BYTES = 128_000;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-public-ai-session, x-public-ai-token",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return json({ error: { message: "Method not allowed" } }, 405);
  }

  const access = await authorizeRequest(req);
  if (access.status !== "allowed") {
    return json({ error: { message: access.message } }, access.httpStatus);
  }

  const { allowed: rateLimitAllowed, error: rateLimitError } = access;
  if (rateLimitError) {
    console.error("[lovable-ai] rate limit check failed", rateLimitError);
    return json({ error: { message: "Rate limit unavailable" } }, 503);
  }
  if (!rateLimitAllowed) {
    return json({ error: { message: "Rate limit exceeded" } }, 429);
  }

  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) {
    return new Response(
      JSON.stringify({ error: { message: "LOVABLE_API_KEY not configured" } }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const rawBody = await req.text();
  if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
    return json({ error: { message: "Request body too large" } }, 413);
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return json({ error: { message: "Invalid JSON body" } }, 400);
  }

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return json({ error: { message: "messages is required" } }, 400);
  }
  if (typeof body.model !== "string" || !ALLOWED_MODELS.has(body.model)) {
    return json({ error: { message: "Model not allowed" } }, 400);
  }
  body.max_tokens = Math.min(
    Number.isFinite(Number(body.max_tokens)) ? Number(body.max_tokens) : MAX_OUTPUT_TOKENS,
    MAX_OUTPUT_TOKENS,
  );

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${key}`,
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  return new Response(text, {
    status: res.status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});

type AccessResult =
  | {
      status: "allowed";
      allowed: boolean;
      error: unknown;
    }
  | {
      status: "denied";
      message: string;
      httpStatus: number;
    };

async function authorizeRequest(req: Request): Promise<AccessResult> {
  const sessionId = req.headers.get("x-public-ai-session");
  const publicToken = req.headers.get("x-public-ai-token");
  if (sessionId || publicToken) {
    if (!sessionId || !publicToken) {
      return { status: "denied", message: "Unauthorized", httpStatus: 401 };
    }

    const rateLimit = await authClient.rpc("consume_public_ai_session", {
      target_session_id: sessionId,
      target_token: publicToken,
      max_requests: 20,
      max_bot_requests: 60,
    });
    if (rateLimit.error) {
      console.error("[lovable-ai] public session validation failed", rateLimit.error);
      return {
        status: "denied",
        message: "Public session validation unavailable",
        httpStatus: 503,
      };
    }
    if (rateLimit.data !== true) {
      return { status: "denied", message: "Unauthorized", httpStatus: 401 };
    }

    return { status: "allowed", allowed: true, error: null };
  }

  const bearer = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
  if (bearer) {
    const { data, error } = await authClient.auth.getUser(bearer);
    if (!error && data.user) {
      const rateLimit = await authClient.rpc("consume_ai_rate_limit", {
        target_user_id: data.user.id,
        max_requests: 30,
      });
      return {
        status: "allowed",
        allowed: rateLimit.data === true,
        error: rateLimit.error,
      };
    }
  }

  return { status: "denied", message: "Unauthorized", httpStatus: 401 };
}

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
