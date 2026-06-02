/**
 * Connector Hub — public API.
 *
 * The core (Runtime, CRM, Tracking, AI, Knowledge) only ever imports from this
 * barrel. Individual integrations stay behind the manifest contract.
 */
import { connectorRegistry } from "./registry";
import { connectorStore } from "./store";
import { emitConnectorEvent } from "./events";
import { builtInConnectors } from "./builtins";
import { bootstrapAdapters } from "./adapters";
import type { ConnectorAction } from "./types";

export * from "./types";
export { connectorRegistry } from "./registry";
export { connectorStore } from "./store";
export { emitConnectorEvent } from "./events";
export { builtInConnectors } from "./builtins";
export { bootstrapAdapters, adapterRegistry } from "./adapters";
export * from "./runtime";

/** Idempotent bootstrap — seeds built-in manifests once per process. */
let booted = false;
export function bootstrapConnectors() {
  if (booted) return;
  booted = true;
  for (const m of builtInConnectors) connectorRegistry.register(m);
}

/* ------------ Lifecycle helpers (emit events automatically) ------------ */

export function installConnector(workspaceId: string, manifestId: string) {
  bootstrapConnectors();
  const manifest = connectorRegistry.get(manifestId);
  if (!manifest) throw new Error(`Unknown connector manifest: ${manifestId}`);
  const c = connectorStore.install(workspaceId, manifestId);
  emitConnectorEvent("connector_installed", {
    connectorId: c.id, manifestId, workspaceId,
    payload: { name: manifest.name },
  });
  return c;
}

export function configureConnector(workspaceId: string, connectorId: string, values: Record<string, string>) {
  const c = connectorStore.get(workspaceId, connectorId);
  if (!c) throw new Error("Connector not installed");
  const cred = connectorStore.saveCredential({ workspaceId, connectorId, values });
  connectorStore.setLifecycle(workspaceId, connectorId, "configured", { credentialId: cred.id });
  emitConnectorEvent("connector_configured", {
    connectorId, manifestId: c.manifestId, workspaceId,
    payload: { credentialId: cred.id, fields: Object.keys(values) },
  });
  return cred;
}

export function connectConnector(workspaceId: string, connectorId: string) {
  const c = connectorStore.get(workspaceId, connectorId);
  if (!c) throw new Error("Connector not installed");
  connectorStore.setLifecycle(workspaceId, connectorId, "connected");
  emitConnectorEvent("connector_connected", {
    connectorId, manifestId: c.manifestId, workspaceId,
  });
}

export function disconnectConnector(workspaceId: string, connectorId: string) {
  const c = connectorStore.get(workspaceId, connectorId);
  if (!c) return;
  connectorStore.setLifecycle(workspaceId, connectorId, "disconnected");
  emitConnectorEvent("connector_disconnected", {
    connectorId, manifestId: c.manifestId, workspaceId,
  });
}

export function disableConnector(workspaceId: string, connectorId: string) {
  const c = connectorStore.get(workspaceId, connectorId);
  if (!c) return;
  connectorStore.setLifecycle(workspaceId, connectorId, "disabled");
  emitConnectorEvent("connector_disabled", {
    connectorId, manifestId: c.manifestId, workspaceId,
  });
}

/**
 * Record an action execution (no-op runner for now).
 * Real adapters will hook in later; the event contract is already stable.
 */
export function recordActionExecution(input: {
  workspaceId: string;
  connectorId: string;
  action: ConnectorAction;
  parameters?: Record<string, unknown>;
  outcome?: "success" | "error";
  error?: string;
}) {
  const c = connectorStore.get(input.workspaceId, input.connectorId);
  if (!c) return;
  emitConnectorEvent("connector_action_executed", {
    connectorId: c.id, manifestId: c.manifestId, workspaceId: input.workspaceId,
    payload: {
      action: input.action.key,
      parameters: input.parameters,
      outcome: input.outcome ?? "success",
      error: input.error,
    },
  });
}
