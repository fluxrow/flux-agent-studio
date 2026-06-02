/**
 * Google Sheets Connector — real adapter.
 *
 * Uses the Sheets v4 REST API with an OAuth access token sourced from the
 * Credentials Manager (`access_token` field). Real OAuth handshake is handled
 * by the existing OAuth foundation (Phase 11) — this adapter only needs the
 * resolved bearer token.
 *
 * If no token is configured the adapter throws a structured error so the
 * Connector Runtime can surface a "credentials required" state in the UI.
 */
import type { ConnectorAdapter, AdapterExecutionContext, AdapterExecutionResult } from "./types";

const BASE = "https://sheets.googleapis.com/v4/spreadsheets";

function requireToken(ctx: AdapterExecutionContext): string {
  const t = ctx.credentials.access_token || ctx.credentials.oauth_token;
  if (!t) throw new Error("google-sheets: missing OAuth access_token (connect the account in Settings → Connected Accounts)");
  return t;
}
function requireSheetId(ctx: AdapterExecutionContext): string {
  const id = (ctx.parameters.spreadsheet_id as string) || ctx.credentials.spreadsheet_id;
  if (!id) throw new Error("google-sheets: missing 'spreadsheet_id'");
  return id;
}

async function call<T = unknown>(token: string, path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : ({} as T);
  if (!res.ok) throw new Error(`Sheets API ${res.status}: ${text}`);
  return data as T;
}

export const googleSheetsAdapter: ConnectorAdapter = {
  manifestId: "google-sheets",
  async execute(action, ctx) {
    const token = requireToken(ctx);
    const id = requireSheetId(ctx);
    const sheet = String(ctx.parameters.sheet ?? "Sheet1");
    const values = (ctx.parameters.values as unknown[]) ?? [];

    switch (action.key) {
      case "append_row":
      case "create_row": {
        const data = await call(token, `/${id}/values/${sheet}:append?valueInputOption=USER_ENTERED`, {
          method: "POST",
          body: JSON.stringify({ values: Array.isArray(values[0]) ? values : [values] }),
        });
        return { data } satisfies AdapterExecutionResult;
      }
      case "update_row": {
        const row = Number(ctx.parameters.row ?? 0);
        if (!row) throw new Error("google-sheets.update_row: missing 'row'");
        const range = `${sheet}!A${row}`;
        const data = await call(token, `/${id}/values/${range}?valueInputOption=USER_ENTERED`, {
          method: "PUT",
          body: JSON.stringify({ values: Array.isArray(values[0]) ? values : [values] }),
        });
        return { data };
      }
      case "list_rows": {
        const range = String(ctx.parameters.range ?? sheet);
        const data = await call(token, `/${id}/values/${range}`);
        return { data };
      }
      case "lookup_row": {
        const range = String(ctx.parameters.range ?? sheet);
        const query = String(ctx.parameters.query ?? "");
        const all = await call<{ values?: string[][] }>(token, `/${id}/values/${range}`);
        const match = (all.values ?? []).find((row) => row.some((c) => String(c).includes(query)));
        return { data: match ?? null };
      }
      default:
        throw new Error(`google-sheets: unsupported action '${action.key}'`);
    }
  },
};
