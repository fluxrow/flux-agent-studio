/**
 * Tracking Engine.
 *
 * Subscribes to the runtime Event Bus, enriches every emission with
 * visitor + attribution context, keeps an in-memory ring buffer for the
 * Tracking Inspector, and forwards events to a pluggable sink (persistence
 * later, no-op for now).
 *
 *   Runtime → Event Bus → Tracking Engine → Persistence
 *
 * Designed so the same engine can later flush to Supabase, Meta, Google,
 * n8n, etc. without touching the Runtime.
 */
import { runtimeEventBus } from "@/runtime/events";
import type { ExecutionEvent } from "@/types/event";
import type { Attribution, TrackedEvent, TrackedEventType, VisitorProfile } from "./types";
import {
  captureAttributionFromUrl,
  detectBrowser,
  getOrCreateVisitorId,
  loadStoredAttribution,
  loadStoredProfile,
  persistVisitorProfile,
} from "./visitor";

type SessionRecord = {
  sessionId: string;
  startedAt: string;
  endedAt?: string;
  durationMs?: number;
  botId?: string;
  workspaceId?: string;
};

const MAX_EVENTS = 200;

class TrackingEngine {
  private started = false;
  private events: TrackedEvent[] = [];
  private listeners = new Set<(e: TrackedEvent) => void>();
  private visitor: VisitorProfile;
  private attribution: Attribution | null = null;
  private sessions = new Map<string, SessionRecord>();
  private currentSessionId: string | null = null;

  constructor() {
    this.visitor = loadStoredProfile() ?? {
      visitorId: getOrCreateVisitorId(),
      firstSeenAt: new Date().toISOString(),
      lastSeenAt: new Date().toISOString(),
    };
    this.attribution = loadStoredAttribution();
  }

  start() {
    if (this.started) return;
    this.started = true;

    // Capture browser + attribution from current URL on boot.
    const detected = detectBrowser();
    this.visitor = {
      ...this.visitor,
      ...detected,
      firstSeenAt: this.visitor.firstSeenAt || detected.firstSeenAt,
      lastSeenAt: new Date().toISOString(),
    };
    persistVisitorProfile(this.visitor);
    this.attribution = captureAttributionFromUrl() ?? this.attribution;

    this.recordCustom("page_view", {
      url: typeof window !== "undefined" ? window.location.href : undefined,
      referrer: typeof document !== "undefined" ? document.referrer : undefined,
    });

    runtimeEventBus.on((ev) => this.handleRuntimeEvent(ev));
  }

  /* ---------------- Public surface ---------------- */

  getVisitor(): VisitorProfile { return { ...this.visitor }; }
  getAttribution(): Attribution | null {
    return this.attribution ? { ...this.attribution } : null;
  }
  getEvents(): TrackedEvent[] { return [...this.events].reverse(); }
  getCurrentSession(): SessionRecord | null {
    return this.currentSessionId ? this.sessions.get(this.currentSessionId) ?? null : null;
  }
  getSessions(): SessionRecord[] { return [...this.sessions.values()]; }

  on(listener: (e: TrackedEvent) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  recordCustom(type: TrackedEventType, payload: Record<string, unknown> = {}, extra: Partial<TrackedEvent> = {}) {
    const ev: TrackedEvent = {
      id: `t_${Math.random().toString(36).slice(2, 10)}`,
      type,
      at: new Date().toISOString(),
      visitorId: this.visitor.visitorId,
      sessionId: extra.sessionId ?? this.currentSessionId ?? undefined,
      botId: extra.botId,
      workspaceId: extra.workspaceId,
      blockId: extra.blockId,
      payload,
    };
    this.push(ev);
  }

  clear() {
    this.events = [];
  }

  /* ---------------- Internals ---------------- */

  private handleRuntimeEvent(ev: ExecutionEvent) {
    const mapped = this.mapType(ev.type);
    if (!mapped) return;

    // Session lifecycle bookkeeping
    if (ev.type === "flow_started" || ev.type === "conversation_started") {
      if (ev.sessionId && !this.sessions.has(ev.sessionId)) {
        const rec: SessionRecord = {
          sessionId: ev.sessionId,
          startedAt: ev.at,
          botId: ev.botId,
          workspaceId: ev.workspaceId,
        };
        this.sessions.set(ev.sessionId, rec);
        this.currentSessionId = ev.sessionId;
        this.push({
          id: `t_${Math.random().toString(36).slice(2, 10)}`,
          type: "session_started",
          at: ev.at,
          visitorId: this.visitor.visitorId,
          sessionId: ev.sessionId,
          botId: ev.botId,
          workspaceId: ev.workspaceId,
          payload: {},
        });
      }
    }

    if (ev.type === "flow_completed" || ev.type === "flow_abandoned" || ev.type === "conversation_completed") {
      if (ev.sessionId) {
        const rec = this.sessions.get(ev.sessionId);
        if (rec && !rec.endedAt) {
          rec.endedAt = ev.at;
          rec.durationMs = new Date(ev.at).getTime() - new Date(rec.startedAt).getTime();
          this.push({
            id: `t_${Math.random().toString(36).slice(2, 10)}`,
            type: "session_ended",
            at: ev.at,
            visitorId: this.visitor.visitorId,
            sessionId: ev.sessionId,
            botId: ev.botId,
            workspaceId: ev.workspaceId,
            durationMs: rec.durationMs,
            payload: {},
          });
        }
      }
    }

    this.push({
      id: `t_${Math.random().toString(36).slice(2, 10)}`,
      type: mapped,
      at: ev.at,
      visitorId: this.visitor.visitorId,
      sessionId: ev.sessionId,
      botId: ev.botId,
      workspaceId: ev.workspaceId,
      blockId: ev.blockId,
      payload: ev.payload as Record<string, unknown>,
    });
  }

  private mapType(t: ExecutionEvent["type"]): TrackedEventType | null {
    switch (t) {
      case "flow_started": return "flow_started";
      case "flow_completed": return "flow_completed";
      case "flow_abandoned": return "flow_abandoned";
      case "block_entered": return "block_entered";
      case "block_exited": return "block_exited";
      case "input_received": return "input_received";
      case "choice_selected": return "choice_selected";
      case "condition_evaluated": return "condition_evaluated";
      case "variable_updated": return "variable_updated";
      case "lead_created": return "lead_created";
      case "lead_updated": return "lead_updated";
      case "conversation_started":
      case "conversation_completed":
        return null; // already covered via session lifecycle
      default:
        return null;
    }
  }

  private push(ev: TrackedEvent) {
    this.events.push(ev);
    if (this.events.length > MAX_EVENTS) {
      this.events.splice(0, this.events.length - MAX_EVENTS);
    }
    this.listeners.forEach((l) => {
      try { l(ev); } catch (err) { console.error("[tracking] listener error", err); }
    });
  }
}

export const trackingEngine = new TrackingEngine();
