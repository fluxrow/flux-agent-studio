/**
 * Analytics adapter layer.
 *
 * Subscribes to the runtime event bus and forwards events to destinations.
 * Today it only persists to the in-memory EventRepository. Tomorrow we
 * register Supabase, Meta CAPI, Google Ads, n8n, etc. without touching
 * the engine.
 *
 *   Runtime ─► EventBus ─► AnalyticsAdapter ─► [destinations]
 */
import type { ExecutionEvent } from "@/types";
import { runtimeEventBus } from "@/runtime/events";
import { persistence } from "@/domain/persistence";

export interface AnalyticsDestination {
  name: string;
  enabled?: boolean;
  send(event: ExecutionEvent): void | Promise<void>;
}

class AnalyticsAdapter {
  private destinations: AnalyticsDestination[] = [];
  private unsubscribe?: () => void;
  private started = false;

  register(dest: AnalyticsDestination) {
    this.destinations.push(dest);
  }

  start() {
    if (this.started) return;
    this.started = true;
    this.unsubscribe = runtimeEventBus.on((event) => this.dispatch(event));
  }

  stop() {
    this.unsubscribe?.();
    this.started = false;
  }

  private async dispatch(event: ExecutionEvent) {
    for (const d of this.destinations) {
      if (d.enabled === false) continue;
      try {
        await d.send(event);
      } catch (err) {
        console.error(`[analytics:${d.name}] failed`, err);
      }
    }
  }
}

export const analytics = new AnalyticsAdapter();

/* ---- default destinations ---- */

const persistenceDestination: AnalyticsDestination = {
  name: "persistence",
  async send(event) {
    await persistence.events.record(event);
    if (event.sessionId) {
      await persistence.sessions.appendHistory(event.sessionId, event);
    }
  },
};

const consoleDestination: AnalyticsDestination = {
  name: "console",
  enabled: import.meta.env.DEV,
  send(event) {
    // eslint-disable-next-line no-console
    console.debug(`[runtime] ${event.type}`, event);
  },
};

analytics.register(persistenceDestination);
analytics.register(consoleDestination);
analytics.start();
