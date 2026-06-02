/**
 * Connector Runtime — executes a connector action through its adapter.
 *
 * Responsibilities:
 *  - Resolve credentials from connectorStore (or runtime overrides).
 *  - Apply retry / fallback / continue_on_error / stop_on_error policy.
 *  - Emit lifecycle events (connector_action_started/completed/failed/retry).
 *  - Map adapter responses into Flow variables.
 *  - Keep an in-memory execution log for the Connector Inspector.
 *
 * This module does NOT touch the FlowRuntime: a Connector block (future)
 * will call `executeConnectorAction()`, take the returned variable map and
 * merge it into its own variable scope. Runtime/CRM/Tracking/AI/Knowledge are
 * untouched.
 */
import { bootstrapConnectors, connectorRegistry, connectorStore, recordActionExecution } from "../index";
import { adapterRegistry, bootstrapAdapters } from "../adapters";
import { emitConnectorEvent } from "../events";
import { mapResponseToVariables } from "./variableMapping";
import type { ConnectorAction } from "../types";

export type ErrorPolicy = "stop_on_error" | "continue_on_error" | "fallback";

export interface RetryPolicy {
  attempts?: number;          // total tries including the first
  backoffMs?: number;         // base delay between tries (ms)
}

export interface ExecuteOptions {
  workspaceId: string;
  connectorId: string;        // installation id
  actionKey: string;
  parameters?: Record<string, unknown>;
  /** Credentials override (for tests / inspector). */
  credentialsOverride?: Record<string, string>;
  retry?: RetryPolicy;
  errorPolicy?: ErrorPolicy;
  /** If errorPolicy === "fallback", return this on failure. */
  fallbackValue?: unknown;
  /** Optional Flow variable mapping. */
  variableMapping?: Record<string, string>;
  signal?: AbortSignal;
}

export interface ExecutionRecord {
  id: string;
  at: string;
  connectorId: string;
  manifestId: string;
  actionKey: string;
  parameters?: Record<string, unknown>;
  durationMs: number;
  attempts: number;
  status: "success" | "error" | "fallback";
  response?: unknown;
  httpStatus?: number;
  error?: string;
  variables?: Record<string, unknown>;
}

class ExecutionLog {
  private items: ExecutionRecord[] = [];
  private listeners = new Set<() => void>();
  private max = 100;

  add(rec: ExecutionRecord) {
    this.items.unshift(rec);
    if (this.items.length > this.max) this.items.length = this.max;
    this.listeners.forEach((l) => l());
  }
  list(): ExecutionRecord[] { return [...this.items]; }
  clear() { this.items = []; this.listeners.forEach((l) => l()); }
  subscribe(fn: () => void) { this.listeners.add(fn); return () => this.listeners.delete(fn); }
}

export const connectorExecutionLog = new ExecutionLog();

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function executeConnectorAction(opts: ExecuteOptions): Promise<ExecutionRecord> {
  bootstrapConnectors();
  bootstrapAdapters();

  const installation = connectorStore.get(opts.workspaceId, opts.connectorId);
  if (!installation) throw new Error(`Connector installation not found: ${opts.connectorId}`);
  const manifest = connectorRegistry.get(installation.manifestId);
  if (!manifest) throw new Error(`Manifest not registered: ${installation.manifestId}`);
  const action: ConnectorAction | undefined = manifest.actions.find((a) => a.key === opts.actionKey);
  if (!action) throw new Error(`Action '${opts.actionKey}' not declared on manifest '${manifest.id}'`);
  const adapter = adapterRegistry.get(manifest.id);
  if (!adapter) throw new Error(`No adapter implemented for connector '${manifest.id}'`);

  const credentials = opts.credentialsOverride
    ?? (installation.credentialId
      ? connectorStore.resolveCredentialValues(opts.workspaceId, installation.credentialId)
      : {});
  const parameters = opts.parameters ?? {};
  const attempts = Math.max(1, opts.retry?.attempts ?? 1);
  const backoffMs = Math.max(0, opts.retry?.backoffMs ?? 500);
  const policy: ErrorPolicy = opts.errorPolicy ?? "stop_on_error";

  emitConnectorEvent("connector_action_started", {
    connectorId: installation.id,
    manifestId: manifest.id,
    workspaceId: opts.workspaceId,
    payload: { action: action.key, parameters },
  });

  const t0 = Date.now();
  let lastError: unknown;
  let used = 0;

  for (let i = 1; i <= attempts; i++) {
    used = i;
    try {
      const result = await adapter.execute(action, {
        workspaceId: opts.workspaceId,
        connectorId: installation.id,
        manifest, credentials, parameters, signal: opts.signal,
      });

      const variables = mapResponseToVariables(result, opts.variableMapping);
      const rec: ExecutionRecord = {
        id: `cex_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
        at: new Date().toISOString(),
        connectorId: installation.id,
        manifestId: manifest.id,
        actionKey: action.key,
        parameters, attempts: i,
        durationMs: Date.now() - t0,
        status: "success",
        response: result.data,
        httpStatus: result.status,
        variables,
      };
      connectorExecutionLog.add(rec);
      recordActionExecution({
        workspaceId: opts.workspaceId, connectorId: installation.id, action,
        parameters, outcome: "success",
      });
      emitConnectorEvent("connector_action_executed", {
        connectorId: installation.id, manifestId: manifest.id, workspaceId: opts.workspaceId,
        payload: { action: action.key, phase: "completed", durationMs: rec.durationMs, attempts: i },
      });
      return rec;
    } catch (err) {
      lastError = err;
      if (i < attempts) {
        emitConnectorEvent("connector_action_executed", {
          connectorId: installation.id, manifestId: manifest.id, workspaceId: opts.workspaceId,
          payload: { action: action.key, phase: "retry", attempt: i, error: String((err as Error).message) },
        });
        await sleep(backoffMs * i);
      }
    }
  }

  const message = (lastError as Error)?.message ?? String(lastError);
  const baseRec: ExecutionRecord = {
    id: `cex_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    at: new Date().toISOString(),
    connectorId: installation.id,
    manifestId: manifest.id,
    actionKey: action.key,
    parameters, attempts: used,
    durationMs: Date.now() - t0,
    status: policy === "fallback" ? "fallback" : "error",
    error: message,
    response: policy === "fallback" ? opts.fallbackValue : undefined,
    variables: policy === "fallback"
      ? mapResponseToVariables({ data: opts.fallbackValue }, opts.variableMapping)
      : {},
  };
  connectorExecutionLog.add(baseRec);
  recordActionExecution({
    workspaceId: opts.workspaceId, connectorId: installation.id, action,
    parameters, outcome: "error", error: message,
  });
  emitConnectorEvent("connector_action_executed", {
    connectorId: installation.id, manifestId: manifest.id, workspaceId: opts.workspaceId,
    payload: { action: action.key, phase: "failed", error: message, attempts: used },
  });

  if (policy === "stop_on_error") throw lastError;
  return baseRec;
}
