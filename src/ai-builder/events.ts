/**
 * AI Builder event helpers — wires generation lifecycle into the shared
 * runtime event bus so Tracking destinations, the EventInspector and
 * future Supabase realtime listeners see the same stream.
 */
import { runtimeEventBus } from "@/runtime/events/bus";

export type AIBuilderEventType =
  | "ai_blueprint_generated"
  | "ai_flow_generated"
  | "ai_crm_generated"
  | "ai_knowledge_suggested"
  | "ai_bot_materialized";

export function emitAIBuilderEvent(
  type: AIBuilderEventType,
  payload: Record<string, unknown>,
) {
  runtimeEventBus.emit({
    id: `aib_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    type,
    sessionId: "",
    flowId: "",
    at: new Date().toISOString(),
    payload,
  });
}
