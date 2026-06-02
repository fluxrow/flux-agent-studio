/**
 * Local persistence for ConnectedAccounts + ChannelBindings.
 *
 * Phase 11 is architectural foundation only — no real OAuth handshake and
 * no Supabase tables yet. We keep the data in localStorage so the UI feels
 * real and survives reloads. Swapping this for a Supabase-backed repository
 * later only requires implementing the same surface.
 */
import type { ConnectedAccount, ChannelBinding, OAuthProviderId } from "@/types/connectedAccount";

const ACCOUNTS_KEY = "fluxbot.oauth.accounts.v1";
const BINDINGS_KEY = "fluxbot.oauth.bindings.v1";

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

export const oauthStore = {
  /* ---------- accounts ---------- */
  listAccounts(): ConnectedAccount[] { return read<ConnectedAccount>(ACCOUNTS_KEY); },
  getAccount(id: string): ConnectedAccount | undefined {
    return this.listAccounts().find((a) => a.id === id);
  },
  upsertAccount(account: Omit<ConnectedAccount, "id"> & { id?: string }): ConnectedAccount {
    const all = this.listAccounts();
    const id = account.id ?? uid("acc");
    const next: ConnectedAccount = { ...account, id };
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
    all[idx] = { ...all[idx], ...patch };
    write(ACCOUNTS_KEY, all);
    notify();
    return all[idx];
  },
  removeAccount(id: string) {
    write(ACCOUNTS_KEY, this.listAccounts().filter((a) => a.id !== id));
    write(BINDINGS_KEY, this.listBindings().filter((b) => b.accountId !== id));
    notify();
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
