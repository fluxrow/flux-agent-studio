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
  | "conversation_completed"
  | "ai_block_executed"
  | "ai_blueprint_generated"
  | "ai_flow_generated"
  | "ai_crm_generated"
  | "ai_knowledge_suggested"
  | "ai_bot_materialized"
  | "knowledge_uploaded"
  | "knowledge_indexed"
  | "knowledge_retrieved"
  | "knowledge_used"
  | "connector_installed"
  | "connector_configured"
  | "connector_connected"
  | "connector_disconnected"
  | "connector_disabled"
  | "connector_error"
  | "connector_action_started"
  | "connector_action_completed"
  | "connector_action_failed"
  | "connector_action_executed"
  | "connector_retry"
  | "connector_trigger_received"
  | "privacy_updated"
  | "terms_updated"
  | "data_deletion_updated"
  | "consent_granted"
  | "consent_revoked"
  | "credential_added"
  | "credential_removed"
  | "credential_rotated"
  | "audit_log_created"
  | "lead_scored"
  | "lead_summary_generated"
  | "lead_insight_generated"
  | "lead_recommendation_generated"
  | "lead_forecast_generated"
  | "account_connected"
  | "account_disconnected"
  | "account_reconnected"
  | "channel_bound"
  | "channel_unbound"
  | `channel:${
      | "channel_connected"
      | "session_opened"
      | "session_closed"
      | "message_received"
      | "message_sent"}`;

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
