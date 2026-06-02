/**
 * Phase 18.5 — QA Dashboard
 * Internal checklist with manual status updates.
 */
import type { QAItem, QAItemKey, QAStatus } from "./types";

const DEFAULT: Omit<QAItem, "status" | "updatedAt">[] = [
  { key: "signup",                  label: "Cadastro de usuário",                    group: "Auth" },
  { key: "login",                   label: "Login + Google OAuth",                   group: "Auth" },
  { key: "builder",                 label: "Editor visual de flows",                 group: "Builder" },
  { key: "builder_dnd",             label: "Adicionar bloco via drag-and-drop",      group: "Builder" },
  { key: "builder_move",            label: "Mover bloco existente no canvas",        group: "Builder" },
  { key: "builder_connect",         label: "Conectar saída → entrada entre blocos", group: "Builder" },
  { key: "builder_save_reload",     label: "Salvar rascunho + recarregar persiste", group: "Builder" },
  { key: "publish_valid",           label: "Publicar flow válido",                   group: "Publish" },
  { key: "publish_invalid_blocked", label: "Flow inválido NÃO publica",              group: "Publish" },
  { key: "public_runtime",          label: "Runtime pública (/bot/:slug)",           group: "Public" },
  { key: "public_link",             label: "Abrir link público e conversar",         group: "Public" },
  { key: "lead_in_crm",             label: "Lead gerado aparece no CRM",             group: "CRM" },
  { key: "crm",                     label: "CRM + pipeline de leads",                group: "CRM" },
  { key: "lead_intelligence",       label: "Lead Intelligence (score/insights)",     group: "Intelligence" },
  { key: "knowledge_base",          label: "Knowledge Base end-to-end",              group: "AI" },
  { key: "connectors",              label: "Connector Hub (real adapters)",          group: "Integrations" },
  { key: "tracking",                label: "Tracking + destinations",                group: "Analytics" },
  { key: "ai_builder",              label: "AI Builder (geração por NL)",            group: "AI" },
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
