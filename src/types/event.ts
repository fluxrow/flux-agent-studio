import type { ID, ISODate } from "./common";

/**
 * Execution event taxonomy emitted by the Runtime Engine and consumed by the
 * Event Bus, analytics adapters, and persistence layer.
 */
export type ExecutionEventType =
  | "flow_started"
  | "flow_completed"
  | "flow_abandoned"
  | "block_entered"
  | "block_exited"
  | "input_received"
  | "choice_selected"
  | "condition_evaluated"
  | "variable_updated"
  | "lead_created"
  | "lead_updated"
  | "conversation_started"
  | "conversation_completed";

export interface ExecutionEvent<P = Record<string, unknown>> {
  id: ID;
  type: ExecutionEventType;
  sessionId: ID;
  flowId: ID;
  botId?: ID;
  workspaceId?: ID;
  blockId?: ID;
  at: ISODate;
  payload: P;
}

/**
 * ExecutionHistory = ordered log of every event produced during a session.
 * Persisted per-session so we can replay, audit and feed analytics.
 */
export interface ExecutionHistory {
  sessionId: ID;
  flowId: ID;
  botId?: ID;
  startedAt: ISODate;
  endedAt?: ISODate;
  events: ExecutionEvent[];
}
