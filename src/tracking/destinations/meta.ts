/**
 * MetaAdapter — Pixel + Conversion API ready.
 *
 * Currently runs in mock mode (no upstream call). When the user supplies a
 * pixelId and (optionally) a CAPI access token, real dispatch can be wired
 * without touching the Tracking Engine.
 *
 * Supported events: PageView, ViewContent, Lead, CompleteRegistration,
 *                   Schedule, Purchase, InitiateCheckout.
 */
import type { DestinationAdapter, DestinationConfig, MappedEvent } from "./types";
import { commonContext, mappingsFor } from "../mappings";

const SUPPORTED = new Set([
  "PageView",
  "ViewContent",
  "Lead",
  "CompleteRegistration",
  "Schedule",
  "Purchase",
  "InitiateCheckout",
]);

export const metaAdapter: DestinationAdapter = {
  id: "meta",
  label: "Meta (Pixel + CAPI)",

  map(event) {
    const names = mappingsFor(event.type).meta ?? [];
    return names.filter((n) => SUPPORTED.has(n)).map<MappedEvent>((name) => ({
      name,
      source: event,
      payload: {
        event_name: name,
        event_time: Math.floor(new Date(event.at).getTime() / 1000),
        event_id: event.id,
        action_source: "website",
        user_data: {
          external_id: event.visitorId,
          fbc: (event.payload as any)?.fbc,
          fbp: (event.payload as any)?.fbp,
        },
        custom_data: {
          ...commonContext(event),
          block_id: event.blockId,
          ...((event.payload as Record<string, unknown>) ?? {}),
        },
      },
    }));
  },

  async send(mapped, config) {
    if (config.mock || !config.credentials?.pixelId) {
      // Mock mode — Inspector still records this dispatch as success.
      return;
    }
    const pixelId = config.credentials.pixelId;
    const accessToken = config.credentials.accessToken;
    if (!accessToken) {
      // Pixel-only browser mode would happen client-side via fbq(); not in scope here.
      return;
    }
    // BUG-02: never put `access_token` on the URL — it leaks into Referer,
    // browser history, proxy logs, and the Network panel. Meta CAPI accepts
    // the token inside the JSON body, which keeps it scoped to the request.
    const res = await fetch(`https://graph.facebook.com/v19.0/${pixelId}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ access_token: accessToken, data: [mapped.payload] }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => res.statusText);
      throw new Error(`Meta CAPI ${res.status}: ${text}`);
    }
  },

  statusFor(config) {
    if (!config.enabled) return "disconnected";
    if (config.mock) return "mock";
    return config.credentials?.pixelId ? "connected" : "mock";
  },
};
