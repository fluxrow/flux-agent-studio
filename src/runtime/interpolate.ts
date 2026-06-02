import type { Variables } from "./types";

/**
 * Replace `{{var_name}}` tokens with values from `variables`.
 * Unknown variables are left empty.
 */
export function interpolate(text: string | undefined, variables: Variables): string {
  if (!text) return "";
  return text.replace(/\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g, (_, key: string) => {
    const v = variables[key];
    return v === undefined || v === null ? "" : String(v);
  });
}
