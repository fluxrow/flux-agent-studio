/**
 * Phase 18.5 — Error Center
 * Workspace-scoped error log. Subsystems push errors here via `recordError`.
 */
import type { ErrorFilters, ErrorKind, ErrorRecord } from "./types";

const errors: ErrorRecord[] = [];
const MAX = 500;
const listeners = new Set<(e: ErrorRecord) => void>();

const uid = () => `err_${Math.random().toString(36).slice(2, 10)}`;

export interface RecordErrorInput {
  workspaceId: string;
  kind: ErrorKind;
  source: string;
  message: string;
  stack?: string;
  context?: Record<string, unknown>;
}

export function recordError(input: RecordErrorInput): ErrorRecord {
  const rec: ErrorRecord = {
    id: uid(),
    workspaceId: input.workspaceId,
    kind: input.kind,
    source: input.source,
    message: input.message,
    stack: input.stack,
    context: input.context,
    occurredAt: new Date().toISOString(),
  };
  errors.unshift(rec);
  if (errors.length > MAX) errors.length = MAX;
  listeners.forEach((cb) => cb(rec));
  return rec;
}

export function listErrors(filters: ErrorFilters = {}): ErrorRecord[] {
  return errors.filter((e) => {
    if (filters.workspaceId && e.workspaceId !== filters.workspaceId) return false;
    if (filters.kind && e.kind !== filters.kind) return false;
    if (filters.since && e.occurredAt < filters.since) return false;
    if (filters.until && e.occurredAt > filters.until) return false;
    return true;
  });
}

export function clearErrors(): void {
  errors.length = 0;
}

export function onError(cb: (e: ErrorRecord) => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
