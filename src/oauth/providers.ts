import type { OAuthProvider, OAuthConnectResult } from "./types";
import type { OAuthProviderId } from "@/types/connectedAccount";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function randomHandle(provider: OAuthProviderId, name?: string): OAuthConnectResult {
  const slug = (name ?? "demo").toLowerCase().replace(/[^a-z0-9]+/g, "_").slice(0, 18) || "demo";
  const suffix = Math.random().toString(36).slice(2, 6);
  const id = `${slug}_${suffix}`;
  return {
    accountName: name ?? defaultLabelFor(provider),
    accountIdentifier: identifierFor(provider, id),
    status: "connected",
    meta: { mock: true, connectedVia: "stub" },
  };
}

function defaultLabelFor(p: OAuthProviderId): string {
  return {
    instagram: "Instagram Business",
    facebook: "Facebook Page",
    whatsapp: "WhatsApp Business",
    telegram: "Telegram Bot",
    gbp: "Google Business Profile",
  }[p];
}

function identifierFor(p: OAuthProviderId, id: string): string {
  switch (p) {
    case "instagram": return `@${id}`;
    case "facebook":  return `fb_page_${id}`;
    case "whatsapp":  return `+55 11 ${id.slice(0,5)}`;
    case "telegram":  return `@${id}_bot`;
    case "gbp":       return `gbp://${id}`;
  }
}

function makeStub(id: OAuthProviderId, label: string, description: string): OAuthProvider {
  return {
    id, label, description,
    async connect(input) {
      await sleep(450);
      return randomHandle(id, input?.accountName);
    },
    async disconnect() { await sleep(150); },
    async refresh(account) {
      await sleep(300);
      return {
        accountName: account.accountName,
        accountIdentifier: account.accountIdentifier,
        status: "connected",
        meta: { ...(account.meta ?? {}), refreshedAt: new Date().toISOString() },
      };
    },
    async getStatus(account) { return account.status; },
  };
}

export const instagramProvider = makeStub("instagram", "Instagram", "Business + Creator accounts via Meta Login.");
export const facebookProvider  = makeStub("facebook",  "Facebook",  "Pages, ads attribution and Messenger inbox.");
export const whatsappProvider  = makeStub("whatsapp",  "WhatsApp",  "Cloud API number connected via Meta Business.");
export const telegramProvider  = makeStub("telegram",  "Telegram",  "Bot token issued through @BotFather.");
export const gbpProvider       = makeStub("gbp",       "Google Business", "GBP profile for chat and reviews.");

export const allProviders: OAuthProvider[] = [
  instagramProvider, facebookProvider, whatsappProvider, telegramProvider, gbpProvider,
];
