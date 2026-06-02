import type { ConditionConfig, ConditionOperator, Variables } from "./types";

/**
 * Evaluate a condition against the current variable store.
 * Numeric comparisons coerce both sides; missing variables resolve to "".
 */
export function evaluateCondition(cfg: ConditionConfig, variables: Variables): boolean {
  const raw = variables[cfg.variable];
  const left = raw === undefined || raw === null ? "" : raw;
  const right = cfg.value;
  return compare(cfg.operator, left, right);
}

function compare(
  op: ConditionOperator,
  left: string | number | boolean,
  right: string | number,
): boolean {
  switch (op) {
    case "equals":
      return String(left).trim().toLowerCase() === String(right).trim().toLowerCase();
    case "contains":
      return String(left).toLowerCase().includes(String(right).toLowerCase());
    case "greater_than":
      return Number(left) > Number(right);
    case "less_than":
      return Number(left) < Number(right);
    default:
      return false;
  }
}
