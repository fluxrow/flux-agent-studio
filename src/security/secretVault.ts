/**
 * In-memory Secret Vault — Phase 18.6 (BUG-01 mitigation).
 *
 * Holds raw credential values (OAuth tokens, API keys, refresh tokens, …)
 * for the lifetime of the current browser tab ONLY. Nothing is persisted
 * to `localStorage`, `sessionStorage`, IndexedDB, or cookies.
 *
 * Why: prior phases stored raw `access_token` / `refresh_token` values in
 * `localStorage`, which is reachable by any script running on the page
 * (XSS, malicious extensions, dev-tools, screen-sharing). The vault keeps
 * the same call sites working without that exposure.
 *
 * Production path: this module is the single seam to swap for a server-side
 * resolver (Supabase Edge Function that decrypts from Vault and returns the
 * value for a single execution). Adapters never receive the secret directly;
 * they call `getSecret(id, key)` which then becomes an async fetch.
 *
 * The vault key convention is `${scope}:${id}` so OAuth accounts and
 * connector credentials never collide.
 */

type Scope = "oauth" | "connector" | "tracking";

const memory = new Map<string, Record<string, string>>();

const k = (scope: Scope, id: string) => `${scope}:${id}`;

/** Replace the full bag of secrets for an entity. */
export function putSecrets(scope: Scope, id: string, values: Record<string, string>): void {
  memory.set(k(scope, id), { ...values });
}

/** Merge new values on top of existing ones. */
export function mergeSecrets(scope: Scope, id: string, patch: Record<string, string>): void {
  const cur = memory.get(k(scope, id)) ?? {};
  memory.set(k(scope, id), { ...cur, ...patch });
}

export function getSecrets(scope: Scope, id: string): Record<string, string> {
  return memory.get(k(scope, id)) ?? {};
}

export function getSecret(scope: Scope, id: string, key: string): string | undefined {
  return memory.get(k(scope, id))?.[key];
}

export function clearSecrets(scope: Scope, id: string): void {
  memory.delete(k(scope, id));
}

export function clearAllSecrets(): void {
  memory.clear();
}

/**
 * Boolean — does the vault currently hold any values for this entity?
 * Useful for showing "Connected (vault)" badges without leaking shapes.
 */
export function hasSecrets(scope: Scope, id: string): boolean {
  const v = memory.get(k(scope, id));
  return !!v && Object.keys(v).length > 0;
}

/** Field names we will never persist anywhere, even in `meta` blobs. */
export const SENSITIVE_KEYS = new Set<string>([
  "accessToken", "access_token",
  "refreshToken", "refresh_token",
  "clientSecret", "client_secret",
  "apiKey", "api_key", "apikey",
  "token", "bearer", "secret",
  "password", "passcode",
  "privateKey", "private_key",
  "signingKey", "signing_key",
]);

/**
 * Returns a shallow copy of `obj` with any sensitive fields removed.
 * Use before writing user-supplied data to disk or telemetry.
 */
export function stripSensitive<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (SENSITIVE_KEYS.has(key)) continue;
    out[key] = value;
  }
  return out as Partial<T>;
}

/**
 * Splits an input record into (publicMeta, secrets). Sensitive keys are
 * routed to the vault, the rest is safe to keep in plain stores.
 */
export function extractSecrets<T extends Record<string, unknown>>(input: T): {
  publicMeta: Partial<T>;
  secrets: Record<string, string>;
} {
  const publicMeta: Record<string, unknown> = {};
  const secrets: Record<string, string> = {};
  for (const [key, value] of Object.entries(input)) {
    if (SENSITIVE_KEYS.has(key) && (typeof value === "string" || typeof value === "number")) {
      secrets[key] = String(value);
    } else {
      publicMeta[key] = value;
    }
  }
  return { publicMeta: publicMeta as Partial<T>, secrets };
}
