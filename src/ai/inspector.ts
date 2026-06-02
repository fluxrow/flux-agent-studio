/**
 * AI Inspector store — keeps the last N AI run records in localStorage so
 * the Builder tab, Playground and DevTools can replay them. Lightweight
 * pub/sub so React panels can subscribe without bringing in React Query.
 */
import type { AIRunRecord } from "./types";

const KEY = "fluxbot.ai.runs.v1";
const MAX = 100;

type Listener = () => void;
const listeners = new Set<Listener>();
const notify = () => listeners.forEach((l) => { try { l(); } catch {} });

function read(): AIRunRecord[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as AIRunRecord[]) : [];
  } catch { return []; }
}
function write(items: AIRunRecord[]) {
  try { localStorage.setItem(KEY, JSON.stringify(items.slice(-MAX))); } catch {}
}

export const aiInspector = {
  list(): AIRunRecord[] {
    return read().slice().reverse();
  },
  record(rec: AIRunRecord) {
    const all = read();
    all.push(rec);
    write(all);
    notify();
  },
  clear() { write([]); notify(); },
  subscribe(l: Listener): () => void {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  /** Aggregate cost stats over the current buffer. */
  stats() {
    const items = read();
    return items.reduce(
      (acc, r) => ({
        runs: acc.runs + 1,
        inputTokens: acc.inputTokens + r.usage.inputTokens,
        outputTokens: acc.outputTokens + r.usage.outputTokens,
        cost: acc.cost + r.usage.estimatedCost,
      }),
      { runs: 0, inputTokens: 0, outputTokens: 0, cost: 0 },
    );
  },
};
