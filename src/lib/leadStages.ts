/**
 * Phase 25B — Analytics Integrity
 *
 * Single source of truth for "is this lead stage a conversion?" checks.
 * Every surface (Dashboard, Analytics, Revenue, Attribution, future widgets)
 * MUST use these helpers instead of inline regex or string equality, so a
 * lead in stage "convertido" is reflected consistently across the product.
 */

/**
 * Stage names recognized as a successful conversion ("won" / "closed deal").
 * Stored lowercase; comparisons normalize input.
 *
 * Includes the canonical Portuguese stage "convertido" used by the typed
 * LeadStage union, plus common synonyms used by imported pipelines or by
 * customers that customized their stage labels.
 */
const CONVERTED_STAGE_NAMES: ReadonlySet<string> = new Set([
  "convertido",
  "convertida",
  "ganho",
  "ganha",
  "won",
  "sold",
  "vendido",
  "vendida",
  "fechado",
  "fechada",
  "closed-won",
  "closed_won",
  "closedwon",
]);

/** Normalize a stage value (id or label) for comparison. */
function normalizeStage(stage: unknown): string {
  if (stage == null) return "";
  return String(stage).trim().toLowerCase();
}

/**
 * Returns true when the given stage represents a successful conversion.
 * Accepts the typed LeadStage as well as arbitrary strings (custom pipelines).
 */
export function isConvertedStage(stage: unknown): boolean {
  const s = normalizeStage(stage);
  if (!s) return false;
  return CONVERTED_STAGE_NAMES.has(s);
}

/** Returns true if any of the provided stages counts as converted. */
export function hasConvertedStage(stages: Iterable<unknown>): boolean {
  for (const s of stages) {
    if (isConvertedStage(s)) return true;
  }
  return false;
}

/**
 * Count leads whose `stage` field qualifies as converted. The accessor lets
 * callers pass either Lead objects or pre-grouped stage maps.
 */
export function countConverted<T>(
  items: readonly T[],
  getStage: (item: T) => unknown = (item) => (item as { stage?: unknown })?.stage,
): number {
  let count = 0;
  for (const item of items) {
    if (isConvertedStage(getStage(item))) count += 1;
  }
  return count;
}
