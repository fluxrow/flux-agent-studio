/**
 * Connector event bridge — pipes connector lifecycle into the shared
 * runtimeEventBus, so EventInspector, Tracking destinations and future
 * Supabase realtime consumers receive the same stream.
 */
import { runtimeEventBus } from "@/runtime/events/bus";
import type { ConnectorEvent, ConnectorEventType } from "./types";

export function emitConnectorEvent(
  type: ConnectorEventType,
  data: Omit<ConnectorEvent, "id" | "type" | "at">,
): ConnectorEvent {
  const event: ConnectorEvent = {
    id: `cn_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    type,
    at: new Date().toISOString(),
    ...data,
  };
  runtimeEventBus.emit({
    id: event.id,
    type: type as any,
    sessionId: "",
    flowId: "",
    at: event.at,
    payload: { connectorId: event.connectorId, manifestId: event.manifestId, ...event.payload },
  } as any);
  return event;
}
