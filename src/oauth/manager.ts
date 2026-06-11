/**
 * OAuth Manager — orchestrates providers + store + event bus.
 *
 * Consumers (UI / future webhooks) should always go through the manager.
 * Providers stay swappable: today they are stubs, tomorrow they can be
 * real OAuth integrations without changing call sites.
 */
import { runtimeEventBus } from "@/runtime/events/bus";
import type { ConnectedAccount, OAuthProviderId } from "@/types/connectedAccount";
import { oauthStore } from "./store";
import { allProviders } from "./providers";
import type { OAuthProvider } from "./types";

type OAuthEventType =
  | "account_connected"
  | "account_disconnected"
  | "account_reconnected"
  | "channel_bound"
  | "channel_unbound";

function getProvider(id: OAuthProviderId): OAuthProvider {
  const p = allProviders.find((x) => x.id === id);
  if (!p) throw new Error(`Unknown OAuth provider: ${id}`);
  return p;
}

function emit(type: OAuthEventType, payload: Record<string, unknown>) {
  runtimeEventBus.emit({
    id: `oauth_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    type,
    sessionId: "",
    flowId: "",
    at: new Date().toISOString(),
    payload,
  });
}

export const oauthManager = {
  providers(): OAuthProvider[] { return allProviders; },
  list(): ConnectedAccount[] { return oauthStore.listAccounts(); },

  async connect(workspaceId: string, providerId: OAuthProviderId, accountName?: string): Promise<ConnectedAccount> {
    const provider = getProvider(providerId);
    const result = await provider.connect({ accountName });
    const account = oauthStore.upsertAccount({
      workspaceId,
      provider: providerId,
      accountName: result.accountName,
      accountIdentifier: result.accountIdentifier,
      status: result.status,
      connectedAt: new Date().toISOString(),
      lastSyncAt: new Date().toISOString(),
      meta: result.meta,
    });
    emit("account_connected", { accountId: account.id, provider: providerId, workspaceId });
    return account;
  },

  async disconnect(accountId: string): Promise<void> {
    const account = oauthStore.getAccount(accountId);
    if (!account) return;
    await getProvider(account.provider).disconnect(account);
    oauthStore.updateAccount(accountId, { status: "disconnected", lastSyncAt: new Date().toISOString() });
    emit("account_disconnected", { accountId, provider: account.provider });
  },

  async reconnect(accountId: string): Promise<ConnectedAccount | undefined> {
    const account = oauthStore.getAccount(accountId);
    if (!account) return undefined;
    const result = await getProvider(account.provider).refresh(account);
    const updated = oauthStore.updateAccount(accountId, {
      status: result.status,
      accountIdentifier: result.accountIdentifier,
      accountName: result.accountName,
      lastSyncAt: new Date().toISOString(),
      meta: result.meta,
    });
    emit("account_reconnected", { accountId, provider: account.provider });
    return updated;
  },

  remove(accountId: string) {
    const account = oauthStore.getAccount(accountId);
    if (!account) return;
    oauthStore.removeAccount(accountId);
    emit("account_disconnected", { accountId, provider: account.provider, removed: true });
  },

  /* ---------- channel binding ---------- */
  bindBot(input: { workspaceId: string; botId: string; accountId: string }) {
    const account = oauthStore.getAccount(input.accountId);
    if (!account) throw new Error("Account not found");
    const binding = oauthStore.bind({
      workspaceId: input.workspaceId,
      botId: input.botId,
      accountId: input.accountId,
      provider: account.provider,
    });
    emit("channel_bound", {
      bindingId: binding.id, botId: binding.botId,
      accountId: binding.accountId, provider: binding.provider,
    });
    return binding;
  },

  unbindBot(botId: string) {
    const existing = oauthStore.listBindings().find((b) => b.botId === botId);
    oauthStore.unbind(botId);
    if (existing) {
      emit("channel_unbound", { botId, accountId: existing.accountId, provider: existing.provider });
    }
  },

  bindings() { return oauthStore.listBindings(); },
  subscribe: oauthStore.subscribe.bind(oauthStore),
};
