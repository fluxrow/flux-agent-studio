/**
 * Instagram DM channel adapter.
 *
 * Instagram DMs require:
 * - A Facebook Page linked to the Instagram Business account
 * - App approval for instagram_manage_messages permission
 * - Webhook subscription on the "instagram" object
 *
 * Inbound: handled by meta-webhook Edge Function (body.object === "instagram")
 * Outbound: routed through meta-send Edge Function (POST /me/messages)
 */

import type { MetaChannelConnection } from "./types";
import { sendMetaMessage } from "./connection";

export interface InstagramChannelAdapter {
  platform: "instagram";
  connection: MetaChannelConnection;
  send(recipientIgScopedId: string, text: string): Promise<void>;
  webhookUrl: string;
}

export function buildInstagramAdapter(conn: MetaChannelConnection): InstagramChannelAdapter {
  const supabaseProjectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "";
  const webhookUrl = `https://${supabaseProjectRef}.supabase.co/functions/v1/meta-webhook`;

  return {
    platform:   "instagram",
    connection: conn,
    webhookUrl,

    async send(recipientIgScopedId: string, text: string): Promise<void> {
      await sendMetaMessage(conn.id, recipientIgScopedId, text);
    },
  };
}

export function getInstagramSetupSteps(webhookUrl: string): string[] {
  return [
    "1. Crie um app na Meta for Developers com produto 'Messenger' ou 'Instagram Basic Display'",
    "2. Solicite a permissão instagram_manage_messages (pode exigir revisão de app)",
    "3. Vincule sua Página do Facebook à conta do Instagram Business",
    `4. Configure o webhook URL: ${webhookUrl}`,
    "5. Assine o campo: messages no objeto instagram",
    "6. Cole o Page ID e o Page Access Token abaixo",
  ];
}
