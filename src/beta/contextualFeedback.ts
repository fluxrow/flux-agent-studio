/**
 * Phase 21 — Contextual Feedback ("Isso ajudou?")
 *
 * Lightweight thumbs up/down on specific surfaces (docs, onboarding, analytics, builder).
 * Persisted to localStorage and surfaced in /beta for review.
 */
export type ContextualFeedbackVerdict = "up" | "down";

export interface ContextualFeedbackEntry {
  id: string;
  surface: string;          // e.g. "docs", "analytics", "builder", "onboarding"
  topic?: string;           // optional sub-area
  verdict: ContextualFeedbackVerdict;
  workspaceId: string;
  page?: string;
  at: string;
}

const STORAGE_KEY = "fluxbot.contextualFeedback.v1";

function read(): ContextualFeedbackEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ContextualFeedbackEntry[]) : [];
  } catch { return []; }
}

function write(items: ContextualFeedbackEntry[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 500))); } catch { /* noop */ }
}

const uid = () => `cf_${Math.random().toString(36).slice(2, 10)}`;

export function recordContextualFeedback(
  input: Omit<ContextualFeedbackEntry, "id" | "at">,
): ContextualFeedbackEntry {
  const entry: ContextualFeedbackEntry = { id: uid(), at: new Date().toISOString(), ...input };
  const items = read();
  items.unshift(entry);
  write(items);
  return entry;
}

export function listContextualFeedback(workspaceId?: string): ContextualFeedbackEntry[] {
  const items = read();
  return workspaceId ? items.filter((i) => i.workspaceId === workspaceId) : items;
}
