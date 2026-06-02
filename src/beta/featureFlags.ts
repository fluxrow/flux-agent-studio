/**
 * Phase 18.5 — Feature Flags
 * In-memory, workspace-scoped. Designed to move to Supabase later.
 */
import type { FeatureFlag, FeatureKey } from "./types";

const flags = new Map<string, FeatureFlag>(); // key: `${workspaceId}:${key}`

// Phase 18.6: stabilization defaults. Only features with a real persistence
// path are on by default. Mock-only subsystems stay dark until their
// Supabase backend lands so beta testers do not see fake data.
const DEFAULTS: Record<FeatureKey, { enabled: boolean; rollout: number }> = {
  ai_builder:        { enabled: true,  rollout: 100 },
  knowledge_base:    { enabled: false, rollout: 0   }, // mock pipeline only
  connectors:        { enabled: true,  rollout: 100 },
  lead_intelligence: { enabled: true,  rollout: 100 },
  omnichannel:       { enabled: false, rollout: 0   }, // requires Phase 19 channels
  marketplace:       { enabled: false, rollout: 0   }, // not started
};

const k = (ws: string, key: FeatureKey) => `${ws}:${key}`;

export const FEATURE_KEYS: FeatureKey[] = Object.keys(DEFAULTS) as FeatureKey[];

export function getFeatureFlag(workspaceId: string, key: FeatureKey): FeatureFlag {
  const existing = flags.get(k(workspaceId, key));
  if (existing) return existing;
  const d = DEFAULTS[key];
  return {
    workspaceId,
    key,
    enabled: d.enabled,
    rollout: d.rollout,
    updatedAt: new Date().toISOString(),
  };
}

export function listFeatureFlags(workspaceId: string): FeatureFlag[] {
  return FEATURE_KEYS.map((key) => getFeatureFlag(workspaceId, key));
}

export function setFeatureFlag(
  workspaceId: string,
  key: FeatureKey,
  patch: Partial<Pick<FeatureFlag, "enabled" | "rollout">>,
): FeatureFlag {
  const current = getFeatureFlag(workspaceId, key);
  const next: FeatureFlag = {
    ...current,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  flags.set(k(workspaceId, key), next);
  return next;
}

export function isFeatureEnabled(workspaceId: string, key: FeatureKey): boolean {
  return getFeatureFlag(workspaceId, key).enabled;
}
