/**
 * GoogleAnalyticsAdapter — GA4 + Measurement Protocol ready.
 *
 * Mock mode by default. When measurementId + apiSecret are provided, it
 * posts to the GA4 Measurement Protocol endpoint.
 *
 * Supported events: page_view, session_start, generate_lead,
 *                   qualified_lead, schedule_meeting, sale, begin_checkout.
 */
import type { DestinationAdapter, DestinationConfig, MappedEvent } from "./types";
import { commonContext, mappingsFor } from "../mappings";

const SUPPORTED = new Set([
  "page_view",
  "session_start",
  "generate_lead",
  "qualified_lead",
  "schedule_meeting",
  "sale",
  "begin_checkout",
]);

export const googleAdapter: DestinationAdapter = {
  id: "google",
  label: "Google Analytics 4",

  map(event) {
    const names = mappingsFor(event.type).google ?? [];
    return names.filter((n) => SUPPORTED.has(n)).map<MappedEvent>((name) => ({
      name,
      source: event,
      payload: {
        client_id: event.visitorId,
        events: [{
          name,
          params: {
            ...commonContext(event),
            block_id: event.blockId,
            engagement_time_msec: event.durationMs ?? 1,
            ...((event.payload as Record<string, unknown>) ?? {}),
          },
        }],
      },
    }));
  },

  async send(mapped, config) {
    if (config.mock || !config.credentials?.measurementId || !config.credentials?.apiSecret) return;
    const { measurementId, apiSecret } = config.credentials;
    const url = `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mapped.payload),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => res.statusText);
      throw new Error(`GA4 MP ${res.status}: ${text}`);
    }
  },

  statusFor(config) {
    if (!config.enabled) return "disconnected";
    if (config.mock) return "mock";
    return config.credentials?.measurementId && config.credentials?.apiSecret ? "connected" : "mock";
  },
};
