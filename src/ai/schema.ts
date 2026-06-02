/**
 * Lightweight runtime validator for AI output schemas.
 * Not Zod — kept dependency-free so providers can ship structured
 * responses without pulling a schema library into the runtime bundle.
 */
import type { AIOutputSchema, AISchemaProperty } from "./types";

function normalize(prop: AISchemaProperty | "string" | "number" | "boolean"): AISchemaProperty {
  return typeof prop === "string" ? { type: prop } : prop;
}

export interface ValidationResult {
  ok: boolean;
  value: Record<string, unknown>;
  errors: string[];
}

export function validateSchema(value: unknown, schema: AIOutputSchema): ValidationResult {
  const errors: string[] = [];
  const result: Record<string, unknown> = {};

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { ok: false, value: {}, errors: ["AI response was not a JSON object."] };
  }

  for (const [key, rawProp] of Object.entries(schema)) {
    const prop = normalize(rawProp);
    const raw = (value as Record<string, unknown>)[key];
    if (raw === undefined || raw === null) {
      errors.push(`Missing key: ${key}`);
      continue;
    }
    switch (prop.type) {
      case "string":
        result[key] = String(raw);
        if (prop.enum && !prop.enum.includes(String(raw))) {
          errors.push(`Key ${key} must be one of ${prop.enum.join("|")}`);
        }
        break;
      case "number": {
        const n = typeof raw === "number" ? raw : Number(raw);
        if (Number.isNaN(n)) errors.push(`Key ${key} must be a number.`);
        result[key] = n;
        break;
      }
      case "boolean":
        result[key] = Boolean(raw);
        break;
      case "string[]":
        if (!Array.isArray(raw)) errors.push(`Key ${key} must be an array of strings.`);
        else result[key] = raw.map(String);
        break;
    }
  }

  return { ok: errors.length === 0, value: result, errors };
}

/** Parse a string that may contain JSON inside Markdown fences. */
export function safeParseJSON(text: string): unknown {
  if (!text) return null;
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = fenced ? fenced[1].trim() : trimmed;
  try { return JSON.parse(body); } catch { /* fallthrough */ }
  // Try to slice out the first {...} block.
  const start = body.indexOf("{");
  const end = body.lastIndexOf("}");
  if (start >= 0 && end > start) {
    try { return JSON.parse(body.slice(start, end + 1)); } catch { /* ignore */ }
  }
  return null;
}
