/**
 * Phase 18.5 — QA Dashboard
 * Internal checklist with manual status updates.
 */
import type { QAItem, QAItemKey, QAStatus } from "./types";

const DEFAULT: Omit<QAItem, "status" | "updatedAt">[] = [
  { key: "signup",             label: "Cadastro de usuário",           group: "Auth" },
  { key: "login",              label: "Login + Google OAuth",          group: "Auth" },
  { key: "builder",            label: "Editor visual de flows",        group: "Core" },
  { key: "public_runtime",     label: "Runtime pública (/bot/:slug)",  group: "Core" },
  { key: "crm",                label: "CRM + pipeline de leads",       group: "CRM" },
  { key: "lead_intelligence",  label: "Lead Intelligence (score/insights)", group: "Intelligence" },
  { key: "knowledge_base",     label: "Knowledge Base end-to-end",     group: "AI" },
  { key: "connectors",         label: "Connector Hub (real adapters)", group: "Integrations" },
  { key: "tracking",           label: "Tracking + destinations",       group: "Analytics" },
  { key: "ai_builder",         label: "AI Builder (geração por NL)",   group: "AI" },
];

const store = new Map<QAItemKey, QAItem>();

export function listQAItems(): QAItem[] {
  return DEFAULT.map((def) => {
    const existing = store.get(def.key);
    if (existing) return existing;
    return { ...def, status: "pending" as QAStatus, updatedAt: new Date().toISOString() };
  });
}

export function setQAStatus(key: QAItemKey, status: QAStatus, note?: string): QAItem {
  const def = DEFAULT.find((d) => d.key === key);
  if (!def) throw new Error(`Unknown QA item: ${key}`);
  const next: QAItem = { ...def, status, note, updatedAt: new Date().toISOString() };
  store.set(key, next);
  return next;
}

export function qaSummary() {
  const items = listQAItems();
  return {
    total: items.length,
    pass: items.filter((i) => i.status === "pass").length,
    fail: items.filter((i) => i.status === "fail").length,
    pending: items.filter((i) => i.status === "pending").length,
  };
}
