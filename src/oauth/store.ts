/**
 * Local persistence for ConnectedAccounts + ChannelBindings.
 *
 * Public metadata (provider, account name, status) is kept in localStorage
 * so the UI rehydrates across reloads. Any sensitive value carried in
 * `account.meta` — access/refresh tokens, client secrets, API keys — is
 * stripped before disk write and routed to the in-memory Secret Vault
 * (Phase 18.6 / BUG-01).
 *
 * On module load we also purge legacy KEY_CREDENTIAL_VALUES entries that
 * earlier phases wrote to localStorage, so upgrading users no longer carry
 * raw tokens around the browser.
 */
import type { ConnectedAccount, ChannelBinding, OAuthProviderId } from "@/types/connectedAccount";
import { extractSecrets, putSecrets, getSecrets, clearSecrets } from "@/security/secretVault";

const ACCOUNTS_KEY = "fluxbot.oauth.accounts.v1";
const BINDINGS_KEY = "fluxbot.oauth.bindings.v1";
const LEGACY_CREDENTIAL_VALUES_KEY = "fluxbot.connector_credential_values.v1";

// One-time cleanup for sensitive data persisted by earlier phases.
if (typeof localStorage !== "undefined") {
  try { localStorage.removeItem(LEGACY_CREDENTIAL_VALUES_KEY); } catch { /* noop */ }
}

type Listener = () => void;
const listeners = new Set<Listener>();
const notify = () => listeners.forEach((l) => { try { l(); } catch {} });

function read<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch { return []; }
}
function write<T>(key: string, value: T[]) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

function uid(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

/** Returns `account` with sensitive meta fields removed; pushes them to vault. */
function vaultAndStrip(account: ConnectedAccount): ConnectedAccount {
  if (!account.meta) return account;
  const { publicMeta, secrets } = extractSecrets(account.meta);
  if (Object.keys(secrets).length > 0) {
    putSecrets("oauth", account.id, secrets);
  }
  return { ...account, meta: publicMeta as Record<string, unknown> };
}

export const oauthStore = {
  /* ---------- accounts ---------- */
  listAccounts(): ConnectedAccount[] { return read<ConnectedAccount>(ACCOUNTS_KEY); },
  getAccount(id: string): ConnectedAccount | undefined {
    return this.listAccounts().find((a) => a.id === id);
  },
  upsertAccount(account: Omit<ConnectedAccount, "id"> & { id?: string }): ConnectedAccount {
    const all = this.listAccounts();
    const id = account.id ?? uid("acc");
    const next = vaultAndStrip({ ...account, id });
    const idx = all.findIndex((a) => a.id === id);
    if (idx >= 0) all[idx] = next; else all.push(next);
    write(ACCOUNTS_KEY, all);
    notify();
    return next;
  },
  updateAccount(id: string, patch: Partial<ConnectedAccount>): ConnectedAccount | undefined {
    const all = this.listAccounts();
    const idx = all.findIndex((a) => a.id === id);
    if (idx < 0) return undefined;
    const merged = vaultAndStrip({ ...all[idx], ...patch, id });
    all[idx] = merged;
    write(ACCOUNTS_KEY, all);
    notify();
    return merged;
  },
  removeAccount(id: string) {
    write(ACCOUNTS_KEY, this.listAccounts().filter((a) => a.id !== id));
    write(BINDINGS_KEY, this.listBindings().filter((b) => b.accountId !== id));
    clearSecrets("oauth", id);
    notify();
  },

  /** Returns the in-vault secrets for an account (empty if not unlocked this tab). */
  getAccountSecrets(id: string): Record<string, string> {
    return getSecrets("oauth", id);
  },

  /* ---------- bindings ---------- */
  listBindings(): ChannelBinding[] { return read<ChannelBinding>(BINDINGS_KEY); },
  bind(input: { workspaceId: string; botId: string; accountId: string; provider: OAuthProviderId }): ChannelBinding {
    const all = this.listBindings().filter((b) => b.botId !== input.botId); // one account per bot for now
    const binding: ChannelBinding = {
      id: uid("bind"),
      workspaceId: input.workspaceId,
      botId: input.botId,
      accountId: input.accountId,
      provider: input.provider,
      createdAt: new Date().toISOString(),
    };
    all.push(binding);
    write(BINDINGS_KEY, all);
    notify();
    return binding;
  },
  unbind(botId: string) {
    write(BINDINGS_KEY, this.listBindings().filter((b) => b.botId !== botId));
    notify();
  },

  /* ---------- subs ---------- */
  subscribe(l: Listener): () => void {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};
