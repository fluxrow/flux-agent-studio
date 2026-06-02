/**
 * Tracking Destinations — types.
 *
 * A Destination is a pluggable adapter that receives mapped events
 * (internal → external schema) and forwards them to a marketing or
 * automation platform (Meta, Google, n8n, webhook, …).
 *
 * The Runtime + Event Bus + Tracking Engine remain destination-agnostic.
 */
import type { TrackedEvent } from "../types";

export type DestinationStatus = "connected" | "disconnected" | "mock";

export type DispatchOutcome = "success" | "failure" | "skipped";

export interface MappedEvent {
  /** External event name (e.g. "Lead", "generate_lead"). */
  name: string;
  /** Payload as the destination expects it. */
  payload: Record<string, unknown>;
  /** Source internal event reference. */
  source: TrackedEvent;
}

export interface DispatchRecord {
  id: string;
  destination: string;
  internalType: string;
  externalName: string;
  outcome: DispatchOutcome;
  at: string;
  error?: string;
  payload: Record<string, unknown>;
}

export interface DestinationConfig {
  enabled: boolean;
  /** When true, destination only logs to console / inspector — never calls upstream. */
  mock: boolean;
  /** Free-form credentials, persisted via destination registry only. */
  credentials?: Record<string, string>;
}

export interface DestinationAdapter {
  /** Stable id, e.g. "meta", "google". */
  id: string;
  /** Human label. */
  label: string;
  /** Map an internal tracked event to zero, one or many external events. */
  map(event: TrackedEvent): MappedEvent[];
  /** Deliver a mapped event. Throw on failure so the registry can record it. */
  send(mapped: MappedEvent, config: DestinationConfig): Promise<void>;
  /** Compute current status from config alone. */
  statusFor(config: DestinationConfig): DestinationStatus;
}
