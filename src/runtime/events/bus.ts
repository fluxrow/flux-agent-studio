/**
 * Tiny pub/sub event bus for runtime execution events.
 *
 * Framework-agnostic. Multiple subscribers can attach (UI inspector,
 * analytics adapter, persistence sink, future Supabase realtime, etc.).
 */
import type {
  ExecutionEvent,
  ExecutionEventListener,
  ExecutionUnsubscribe,
} from "./types";

export class EventBus {
  private listeners = new Set<ExecutionEventListener>();
  private history: ExecutionEvent[] = [];
  private maxHistory: number;

  constructor(maxHistory = 500) {
    this.maxHistory = maxHistory;
  }

  emit(event: ExecutionEvent): void {
    this.history.push(event);
    if (this.history.length > this.maxHistory) {
      this.history.splice(0, this.history.length - this.maxHistory);
    }
    this.listeners.forEach((l) => {
      try {
        l(event);
      } catch (err) {
        // Subscribers must not break each other.
        console.error("[EventBus] listener error", err);
      }
    });
  }

  on(listener: ExecutionEventListener): ExecutionUnsubscribe {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  getHistory(): ExecutionEvent[] {
    return [...this.history];
  }

  clear(): void {
    this.history = [];
  }
}

/** App-wide singleton bus. */
export const runtimeEventBus = new EventBus();
