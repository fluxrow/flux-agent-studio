/**
 * Variable mapping for Connector responses.
 *
 * Resolves dotted paths like `response.id`, `data.user.email`, or
 * `items[0].sku` against an arbitrary adapter result so Flow variables can be
 * populated without bespoke parsing in every adapter.
 */

/** Resolve a dotted/bracket path against an object. */
export function resolvePath(source: unknown, path: string): unknown {
  if (!path) return source;
  const parts = path.replace(/\[(\w+)\]/g, ".$1").split(".").filter(Boolean);
  let cur: any = source;
  for (const p of parts) {
    if (cur == null) return undefined;
    cur = cur[p];
  }
  return cur;
}

/**
 * Given an `{ outputVariable: "response.id" }` style mapping, returns the
 * resolved values keyed by the variable name on the flow.
 *
 * Mappings shape:
 *   { lead_id: "data.id", lead_email: "data.email" }
 *
 * The `response` envelope below is what the runtime exposes to mappings:
 *   { data, status, externalId }
 */
export function mapResponseToVariables(
  response: { data?: unknown; status?: number; externalId?: string },
  mappings: Record<string, string> | undefined,
): Record<string, unknown> {
  if (!mappings) return {};
  const envelope = { response, data: response.data, status: response.status };
  const out: Record<string, unknown> = {};
  for (const [variable, path] of Object.entries(mappings)) {
    out[variable] = resolvePath(envelope, path);
  }
  return out;
}
