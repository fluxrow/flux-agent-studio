/**
 * Webhook Connector — real adapter.
 *
 * Pure fetch — works in browser, edge, or Node. Honors a small but useful
 * subset of HTTP options (headers, query params, body, auth, timeout).
 */
import type { ConnectorAdapter, AdapterExecutionContext, AdapterExecutionResult } from "./types";

type AuthMode = "none" | "bearer" | "basic" | "api_key";

function buildAuthHeaders(creds: Record<string, string>, params: Record<string, unknown>): Record<string, string> {
  const mode = (params.auth_mode as AuthMode) ?? "none";
  switch (mode) {
    case "bearer": {
      const token = (params.bearer_token as string) || creds.bearer_token || creds.secret;
      return token ? { Authorization: `Bearer ${token}` } : {};
    }
    case "basic": {
      const user = (params.basic_user as string) || creds.basic_user || "";
      const pass = (params.basic_pass as string) || creds.basic_pass || "";
      if (!user && !pass) return {};
      const encoded = typeof btoa !== "undefined" ? btoa(`${user}:${pass}`) : Buffer.from(`${user}:${pass}`).toString("base64");
      return { Authorization: `Basic ${encoded}` };
    }
    case "api_key": {
      const header = (params.api_key_header as string) || "X-API-Key";
      const value = (params.api_key as string) || creds.api_key || "";
      return value ? { [header]: value } : {};
    }
    default:
      return {};
  }
}

function parseMaybeJson(v: unknown): unknown {
  if (typeof v !== "string") return v;
  const t = v.trim();
  if (!t) return undefined;
  if (t.startsWith("{") || t.startsWith("[")) {
    try { return JSON.parse(t); } catch { return v; }
  }
  return v;
}

async function sendRequest(ctx: AdapterExecutionContext): Promise<AdapterExecutionResult> {
  const p = ctx.parameters;
  const url = String(p.url ?? "");
  if (!url) throw new Error("webhook.send_request: missing 'url'");
  const method = String(p.method ?? "POST").toUpperCase();
  const timeoutMs = Number(p.timeout_ms ?? 15000);

  const query = (parseMaybeJson(p.query_params) as Record<string, string> | undefined) ?? {};
  const fullUrl = (() => {
    if (!query || Object.keys(query).length === 0) return url;
    const u = new URL(url);
    for (const [k, v] of Object.entries(query)) u.searchParams.set(k, String(v));
    return u.toString();
  })();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((parseMaybeJson(p.headers) as Record<string, string> | undefined) ?? {}),
    ...buildAuthHeaders(ctx.credentials, p),
  };

  const hasBody = !["GET", "HEAD"].includes(method);
  const body = hasBody ? JSON.stringify(parseMaybeJson(p.body) ?? {}) : undefined;

  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), timeoutMs);
  try {
    const res = await fetch(fullUrl, { method, headers, body, signal: ctx.signal ?? ac.signal });
    const text = await res.text();
    let data: unknown = text;
    try { data = JSON.parse(text); } catch { /* keep text */ }
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${typeof data === "string" ? data : JSON.stringify(data)}`);
    }
    return { data, status: res.status };
  } finally {
    clearTimeout(timer);
  }
}

export const webhookAdapter: ConnectorAdapter = {
  manifestId: "webhook",
  async execute(action, ctx) {
    if (action.key === "send_request" || action.key === "send") return sendRequest(ctx);
    throw new Error(`webhook: unsupported action '${action.key}'`);
  },
};
