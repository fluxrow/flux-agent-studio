/**
 * Dynamic personalization helper.
 *
 * Renderers receive engine state with `context.variables`. Any string can
 * be interpolated with `{{name}}`, `{{empresa}}`, `{{cidade}}`, etc.
 *
 * The Runtime already interpolates message text via `runtime/interpolate`,
 * but renderers may want to personalize header titles, placeholders, and
 * empty-state copy as well — that's what this helper is for.
 */
import type { Variables } from "@/runtime/types";

const TOKEN = /\{\{\s*([\w.-]+)\s*\}\}/g;

const ALIASES: Record<string, string[]> = {
  nome: ["nome", "name", "lead.name", "first_name"],
  empresa: ["empresa", "company", "lead.company"],
  cidade: ["cidade", "city", "lead.city"],
  email: ["email", "lead.email"],
  telefone: ["telefone", "phone", "lead.phone"],
};

function resolve(key: string, vars: Variables): string | null {
  const lower = key.toLowerCase();
  if (vars[key] != null) return String(vars[key]);
  if (vars[lower] != null) return String(vars[lower]);
  const aliases = ALIASES[lower] ?? [lower];
  for (const a of aliases) {
    if (vars[a] != null) return String(vars[a]);
  }
  return null;
}

export function personalize(text: string, variables: Variables | undefined): string {
  if (!text || !variables) return text;
  return text.replace(TOKEN, (_, key) => resolve(key, variables) ?? "");
}
