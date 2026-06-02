/**
 * Slack Connector — real adapter.
 *
 * Uses Slack's Web API with a bot token. All endpoints accept
 * application/json bodies when the token is set in Authorization.
 */
import type { ConnectorAdapter, AdapterExecutionContext, AdapterExecutionResult } from "./types";

const BASE = "https://slack.com/api";

async function slack<T = unknown>(method: string, token: string, body?: Record<string, unknown>): Promise<T> {
  const init: RequestInit = body
    ? { method: "POST", body: JSON.stringify(body), headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json; charset=utf-8" } }
    : { method: "GET", headers: { Authorization: `Bearer ${token}` } };
  const res = await fetch(`${BASE}/${method}`, init);
  const data = await res.json();
  if (!res.ok || data.ok === false) throw new Error(`Slack ${method} failed: ${JSON.stringify(data)}`);
  return data as T;
}

function token(ctx: AdapterExecutionContext): string {
  const t = ctx.credentials.bot_token;
  if (!t) throw new Error("slack: missing 'bot_token'");
  return t;
}

export const slackAdapter: ConnectorAdapter = {
  manifestId: "slack",
  async execute(action, ctx): Promise<AdapterExecutionResult> {
    const t = token(ctx);
    switch (action.key) {
      case "send_message": {
        const data = await slack("chat.postMessage", t, {
          channel: ctx.parameters.channel,
          text: ctx.parameters.text,
        });
        return { data };
      }
      case "lookup_channel": {
        const name = String(ctx.parameters.name ?? "").replace(/^#/, "");
        const data = await slack<{ channels: Array<{ id: string; name: string }> }>(
          "conversations.list?limit=1000", t,
        );
        const found = data.channels?.find((c) => c.name === name);
        return { data: found ?? null };
      }
      case "lookup_user": {
        const email = String(ctx.parameters.email ?? "");
        const data = await slack(`users.lookupByEmail?email=${encodeURIComponent(email)}`, t);
        return { data };
      }
      default:
        throw new Error(`slack: unsupported action '${action.key}'`);
    }
  },
};
