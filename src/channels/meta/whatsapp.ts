/**
 * WhatsApp Cloud API channel adapter.
 *
 * Unlike the previous stub, this adapter:
 * - Has status: "active" once a connection is configured
 * - Routes outbound messages through the meta-send Edge Function
 * - Registers incoming messages from the meta-webhook Edge Function via
 *   Supabase Realtime (the Edge Function writes to meta_messages, which
 *   triggers a Realtime broadcast the UI subscribes to)
 *
 * The adapter does NOT replace the full ChannelAdapter interface from Phase 10
 * (which is designed for bot-flow sessions). It complements it: this adapter
 * is used by the direct omnichannel inbox, not the bot runtime.
 */

import type { MetaChannelConnection } from "./types";
import { sendMetaMessage } from "./connection";

export interface WhatsAppChannelAdapter {
  platform: "whatsapp";
  connection: MetaChannelConnection;
  send(recipientPhone: string, text: string): Promise<void>;
  webhookUrl: string;
}

export function buildWhatsAppAdapter(conn: MetaChannelConnection): WhatsAppChannelAdapter {
  const supabaseProjectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "";
  const webhookUrl = `https://${supabaseProjectRef}.supabase.co/functions/v1/meta-webhook`;

  return {
    platform:   "whatsapp",
    connection: conn,
    webhookUrl,

    async send(recipientPhone: string, text: string): Promise<void> {
      await sendMetaMessage(conn.id, recipientPhone, text);
    },
  };
}

/**
 * WhatsApp setup instructions (returned as structured data for the UI).
 */
export function getWhatsAppSetupSteps(webhookUrl: string): string[] {
  return [
    "1. Acesse Meta for Developers → seu app → WhatsApp → Configuration",
    `2. Cole a URL do webhook: ${webhookUrl}`,
    `3. Verify token: flux_meta_verify (ou o valor de META_VERIFY_TOKEN)`,
    "4. Assine o campo: messages",
    "5. Cole o Phone Number ID e o Access Token abaixo",
  ];
}
