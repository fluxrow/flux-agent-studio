/**
 * Future destination adapters — registered but inert.
 *
 * Keeps the registry/UI shape ready for n8n, generic Webhooks, LinkedIn
 * and TikTok without implementing dispatch yet.
 */
import type { DestinationAdapter } from "./types";

function stub(id: string, label: string): DestinationAdapter {
  return {
    id,
    label,
    map: () => [],
    async send() { /* noop — coming soon */ },
    statusFor: () => "disconnected",
  };
}

export const n8nAdapter = stub("n8n", "n8n Workflows");
export const webhookAdapter = stub("webhook", "Generic Webhook");
export const linkedinAdapter = stub("linkedin", "LinkedIn Ads");
export const tiktokAdapter = stub("tiktok", "TikTok Pixel");
