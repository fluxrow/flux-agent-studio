/**
 * Phase 21 — Activation Metrics
 *
 * Tracks the first time a workspace performs key value-realization actions.
 * Persisted in localStorage so refreshes don't lose the milestones.
 * Pure data layer; UI lives in components/dashboards.
 */
export type ActivationKey =
  | "first_bot_created"
  | "first_bot_published"
  | "first_lead_captured"
  | "first_conversation"
  | "first_ai_used"
  | "first_knowledge_used";

export interface ActivationEvent {
  key: ActivationKey;
  workspaceId: string;
  at: string;
}

const STORAGE_KEY = "fluxbot.activation.v1";

type Store = Record<string, Partial<Record<ActivationKey, ActivationEvent>>>;

function read(): Store {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Store) : {};
  } catch {
    return {};
  }
}

function write(store: Store) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    /* quota / private mode */
  }
}

export function recordActivation(workspaceId: string, key: ActivationKey): ActivationEvent {
  const store = read();
  const ws = store[workspaceId] ?? {};
  if (ws[key]) return ws[key]!;
  const evt: ActivationEvent = { key, workspaceId, at: new Date().toISOString() };
  ws[key] = evt;
  store[workspaceId] = ws;
  write(store);
  // Tell subscribers (Dashboard widgets) that activation state changed.
  try {
    window.dispatchEvent(new CustomEvent("fluxbot:activation", { detail: evt }));
  } catch {
    /* SSR / non-browser */
  }
  return evt;
}

export function getActivation(workspaceId: string): Partial<Record<ActivationKey, ActivationEvent>> {
  return read()[workspaceId] ?? {};
}

export const ACTIVATION_LABELS: Record<ActivationKey, string> = {
  first_bot_created:     "Primeiro bot criado",
  first_bot_published:   "Primeiro bot publicado",
  first_lead_captured:   "Primeiro lead capturado",
  first_conversation:    "Primeira conversa",
  first_ai_used:         "Primeiro uso de IA",
  first_knowledge_used:  "Primeira knowledge base",
};

export const ACTIVATION_KEYS: ActivationKey[] = Object.keys(ACTIVATION_LABELS) as ActivationKey[];
