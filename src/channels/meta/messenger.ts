/**
 * Facebook Messenger channel adapter.
 *
 * Messenger requires a Facebook Page with Messaging permission.
 * Inbound: meta-webhook Edge Function (body.object === "page")
 * Outbound: meta-send Edge Function
 */

import type { MetaChannelConnection } from "./types";
import { sendMetaMessage } from "./connection";

export interface MessengerChannelAdapter {
  platform: "messenger";
  connection: MetaChannelConnection;
  send(recipientPsid: string, text: string): Promise<void>;
  webhookUrl: string;
}

export function buildMessengerAdapter(conn: MetaChannelConnection): MessengerChannelAdapter {
  const supabaseProjectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "";
  const webhookUrl = `https://${supabaseProjectRef}.supabase.co/functions/v1/meta-webhook`;

  return {
    platform:   "messenger",
    connection: conn,
    webhookUrl,

    async send(recipientPsid: string, text: string): Promise<void> {
      await sendMetaMessage(conn.id, recipientPsid, text);
    },
  };
}

export function getMessengerSetupSteps(webhookUrl: string): string[] {
  return [
    "1. Crie ou use um app Meta for Developers com produto 'Messenger'",
    "2. Selecione uma Página do Facebook para conectar",
    "3. Gere um Page Access Token com pages_messaging permission",
    `4. Configure o webhook URL: ${webhookUrl}`,
    "5. Assine os campos: messages, messaging_postbacks",
    "6. Cole o Page ID e o Page Access Token abaixo",
  ];
}
