/**
 * Knowledge events bridge. Emits onto the shared runtimeEventBus using
 * `knowledge:*` event types so the existing Event Inspector, Tracking
 * Engine and Channel bus can observe them without any new plumbing.
 */
import { runtimeEventBus } from "@/runtime/events/bus";
import type { ID, ISODate } from "@/types/common";

export type KnowledgeEventType =
  | "knowledge_uploaded"
  | "knowledge_indexed"
  | "knowledge_retrieved"
  | "knowledge_used";

function makeId(prefix = "kn") {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

export function emitKnowledgeEvent(input: {
  type: KnowledgeEventType;
  workspaceId?: ID;
  baseId?: ID;
  sessionId?: ID;
  flowId?: ID;
  blockId?: ID;
  payload?: Record<string, unknown>;
}) {
  const at: ISODate = new Date().toISOString();
  runtimeEventBus.emit({
    id: makeId(),
    type: input.type,
    sessionId: input.sessionId ?? "",
    flowId: input.flowId ?? "",
    workspaceId: input.workspaceId,
    blockId: input.blockId,
    at,
    payload: { baseId: input.baseId, ...(input.payload ?? {}) },
  });
}
