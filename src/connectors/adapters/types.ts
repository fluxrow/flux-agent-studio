/**
 * Connector adapter contract.
 *
 * An adapter is the *implementation* side of a manifest: it knows how to
 * actually execute one of the manifest's actions. The Connector Runtime only
 * speaks to adapters through this interface — it never imports vendor SDKs
 * directly, so Runtime/CRM/Tracking/AI/Knowledge stay vendor-agnostic.
 */
import type { ConnectorAction, ConnectorManifest } from "../types";

export interface AdapterExecutionContext {
  workspaceId: string;
  connectorId: string;
  manifest: ConnectorManifest;
  /** Decrypted credential values (from the Credentials Manager). */
  credentials: Record<string, string>;
  /** Parameters supplied by the Builder/Runtime. */
  parameters: Record<string, unknown>;
  /** AbortSignal honored by the underlying fetch. */
  signal?: AbortSignal;
}

export interface AdapterExecutionResult {
  /** Free-form response payload — exposed to variable mapping. */
  data?: unknown;
  /** Optional HTTP status when applicable. */
  status?: number;
  /** Provider-side identifier (e.g. message_id, row index). */
  externalId?: string;
}

export interface ConnectorAdapter {
  /** Manifest id this adapter implements (e.g. "webhook"). */
  manifestId: string;
  /** Per-action runners keyed by action.key. */
  execute(action: ConnectorAction, ctx: AdapterExecutionContext): Promise<AdapterExecutionResult>;
}
