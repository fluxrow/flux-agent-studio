/**
 * Channel Event Bus — bridges channel-level events into the runtime EventBus
 * so the existing Tracking Engine + Inspector pick them up without changes.
 */
import { runtimeEventBus } from "@/runtime/events/bus";
import type { ChannelEvent, ChannelEventListener } from "./types";
import type { ExecutionEventType } from "@/types/event";

const listeners = new Set<ChannelEventListener>();
const history: ChannelEvent[] = [];
const MAX = 300;

export const channelBus = {
  emit(event: ChannelEvent) {
    history.push(event);
    if (history.length > MAX) history.splice(0, history.length - MAX);

    // Fan-out to channel-only subscribers.
    listeners.forEach((l) => {
      try { l(event); } catch (e) { console.error("[channelBus] listener", e); }
    });

    // Mirror to the runtime EventBus so Tracking / Inspector see it.
    const mirroredType: ExecutionEventType = `channel:${event.type}`;
    runtimeEventBus.emit({
      id: event.id,
      type: mirroredType,
      sessionId: event.sessionId ?? "",
      flowId: "",
      at: event.at,
      payload: {
        channelId: event.channelId,
        message: event.message,
        user: event.user,
        ...(event.payload ?? {}),
      },
    });
  },

  on(listener: ChannelEventListener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  history(): ChannelEvent[] {
    return [...history];
  },

  clear() { history.length = 0; },
};

export function makeChannelEventId(): string {
  return `ch_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}
