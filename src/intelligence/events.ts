/**
 * Phase 18 — Lead Intelligence event bridge.
 * Emits intelligence events on the shared runtime EventBus without
 * altering Runtime Engine semantics.
 */
import { runtimeEventBus } from "@/runtime/events/bus";
import type { ExecutionEvent } from "@/runtime/events/types";

export type IntelligenceEventType =
  | "lead_scored"
  | "lead_summary_generated"
  | "lead_insight_generated"
  | "lead_recommendation_generated"
  | "lead_forecast_generated";

export function emitIntelligenceEvent(
  type: IntelligenceEventType,
  payload: Record<string, unknown> = {},
): void {
  const event: ExecutionEvent = {
    id: `intel_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    type: type as ExecutionEvent["type"],
    sessionId: "intelligence",
    flowId: "intelligence",
    at: new Date().toISOString(),
    payload,
  };
  runtimeEventBus.emit(event);
}
