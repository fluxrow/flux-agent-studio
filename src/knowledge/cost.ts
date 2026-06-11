/**
 * Knowledge cost ledger. Tracks embedding + search usage with a tiny
 * pub/sub backed by localStorage so the Playground can show live stats.
 */
import type { KnowledgeUsageRecord } from "./types";

const KEY = "fluxbot.knowledge.usage.v1";
const MAX = 200;

type Listener = () => void;
const listeners = new Set<Listener>();
const notify = () => listeners.forEach((l) => {
  try { l(); } catch { /* subscribers are isolated */ }
});

function read(): KnowledgeUsageRecord[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as KnowledgeUsageRecord[]) : [];
  } catch { return []; }
}
function write(items: KnowledgeUsageRecord[]) {
  try { localStorage.setItem(KEY, JSON.stringify(items.slice(-MAX))); } catch { /* storage unavailable */ }
}

export const knowledgeCost = {
  record(rec: KnowledgeUsageRecord) {
    const all = read();
    all.push(rec);
    write(all);
    notify();
  },
  list(): KnowledgeUsageRecord[] {
    return read().slice().reverse();
  },
  stats(workspaceId?: string) {
    const items = read().filter((r) => !workspaceId || r.workspaceId === workspaceId);
    return items.reduce(
      (acc, r) => ({
        embeds: acc.embeds + (r.kind === "embed" ? 1 : 0),
        searches: acc.searches + (r.kind === "search" ? 1 : 0),
        tokens: acc.tokens + r.inputTokens,
        cost: acc.cost + r.estimatedCost,
      }),
      { embeds: 0, searches: 0, tokens: 0, cost: 0 },
    );
  },
  clear() { write([]); notify(); },
  subscribe(l: Listener) { listeners.add(l); return () => listeners.delete(l); },
};
