/**
 * Compliance event emitter — bridges Phase 15 actions onto the shared
 * runtime EventBus so analytics / audit sinks can consume them uniformly.
 */
import { runtimeEventBus } from "@/runtime/events/bus";
import type { ExecutionEvent } from "@/runtime/events/types";

export type ComplianceEventType =
  | "privacy_updated"
  | "terms_updated"
  | "data_deletion_updated"
  | "consent_granted"
  | "consent_revoked"
  | "credential_added"
  | "credential_removed"
  | "credential_rotated"
  | "audit_log_created";

export function emitComplianceEvent(
  type: ComplianceEventType,
  payload: Record<string, unknown> = {},
): void {
  const event: ExecutionEvent = {
    id: `compl_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    type: type as ExecutionEvent["type"],
    sessionId: "compliance",
    flowId: "compliance",
    at: new Date().toISOString(),
    payload,
  };
  runtimeEventBus.emit(event);
}
