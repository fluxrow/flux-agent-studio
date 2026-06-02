/**
 * Phase 18.5 — Usage Analytics
 */
import type { UsageMetric, UsageMetricKey } from "./types";

const store = new Map<string, UsageMetric>(); // key: `${ws}:${metric}`

const LABELS: Record<UsageMetricKey, string> = {
  bots_created:      "Bots criados",
  bots_published:    "Bots publicados",
  leads_generated:   "Leads gerados",
  flows_executed:    "Flows executados",
  ai_builder_used:   "AI Builder utilizado",
  knowledge_used:    "Knowledge utilizada",
  connector_used:    "Conector utilizado",
};

export const USAGE_KEYS: UsageMetricKey[] = Object.keys(LABELS) as UsageMetricKey[];
export const usageLabel = (k: UsageMetricKey) => LABELS[k];

const k = (ws: string, key: UsageMetricKey) => `${ws}:${key}`;

export function incrementUsage(
  workspaceId: string,
  key: UsageMetricKey,
  by = 1,
): UsageMetric {
  const cur = store.get(k(workspaceId, key));
  const next: UsageMetric = {
    workspaceId,
    key,
    value: (cur?.value ?? 0) + by,
    updatedAt: new Date().toISOString(),
  };
  store.set(k(workspaceId, key), next);
  return next;
}

export function getUsage(workspaceId: string, key: UsageMetricKey): UsageMetric {
  return (
    store.get(k(workspaceId, key)) ?? {
      workspaceId,
      key,
      value: 0,
      updatedAt: new Date().toISOString(),
    }
  );
}

export function listUsage(workspaceId: string): UsageMetric[] {
  return USAGE_KEYS.map((key) => getUsage(workspaceId, key));
}
