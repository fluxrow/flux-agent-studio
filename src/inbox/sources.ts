/**
 * Inbox Foundation — Phase 11
 *
 * Declares the "ConversationSource" registry that the future omnichannel
 * inbox will read from. Sources here describe WHERE conversations can
 * originate (Instagram DM, FB Messenger, WhatsApp, Telegram) — they do
 * NOT yet fetch real messages. Real adapters will be wired in Phase 12+.
 */
import type { OAuthProviderId } from "@/types/connectedAccount";

export interface ConversationSource {
  id: OAuthProviderId | "web";
  label: string;
  status: "ready" | "stub";
  description: string;
  /** Marketing/help copy for what this inbox will look like once enabled. */
  preview: string;
}

export const conversationSources: ConversationSource[] = [
  {
    id: "web",
    label: "Public Bot",
    status: "ready",
    description: "Sessions started from /bot/:slug public runtime.",
    preview: "Visitor opens your link and starts a flow — already live.",
  },
  {
    id: "instagram",
    label: "Instagram DM",
    status: "stub",
    description: "Direct messages from connected Instagram Business accounts.",
    preview: "Reply to story mentions and DMs through the bot or a human handoff.",
  },
  {
    id: "facebook",
    label: "Facebook Messenger",
    status: "stub",
    description: "Page inbox via Messenger Platform.",
    preview: "All Page messages routed into a single unified inbox.",
  },
  {
    id: "whatsapp",
    label: "WhatsApp Business",
    status: "stub",
    description: "WhatsApp Cloud API conversations.",
    preview: "Inbound + outbound WhatsApp with template support.",
  },
  {
    id: "telegram",
    label: "Telegram",
    status: "stub",
    description: "Bot-driven Telegram channels and groups.",
    preview: "Run flows inside Telegram chats with the same Runtime.",
  },
];

export function getConversationSource(id: string): ConversationSource | undefined {
  return conversationSources.find((s) => s.id === id);
}
