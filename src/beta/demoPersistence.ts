/**
 * Phase 26B.1C — Demo Runtime persistence overlay.
 *
 * When `isDemoMode()` is true, the persistence facade routes reads
 * through this overlay BEFORE touching the real backend (mock or
 * Supabase). The real workspace is never consulted in demo mode.
 *
 * Only READ methods are overridden — demo mode is a viewer, not a
 * data-entry surface. Mutating calls (create/update/delete) fall
 * through to the underlying repository so live writes still work if
 * the user toggles demo mode off and back on. Within a session, demo
 * mutations are stored in module-local arrays so the kanban reacts
 * to drag/drop and tag edits during screenshots/recordings.
 */
import type {
  Bot, Conversation, CrmStats, ExecutionEvent, Flow, ID, Lead,
  LeadCreateInput, LeadStage, ListParams, Message, Paginated,
  PipelineStage, Session, Channel, Template, Variable,
} from "@/types";
import type {
  BotRepository, ChannelRepository, ConversationRepository,
  FlowRepository, LeadRepository, TemplateRepository,
  VariableRepository,
} from "@/domain/repositories";
import {
  DEMO_BOTS, DEMO_LEADS, DEMO_STAGES, DEMO_FLOW, DEMO_CHANNELS,
  DEMO_CONVERSATIONS, DEMO_SESSIONS, DEMO_MESSAGES,
  DEMO_LEAD_TIMELINE, DEMO_LEAD_CONVERSATIONS,
} from "./demoDataset";
import { countConverted } from "@/lib/leadStages";
import { fixedIso } from "@/mocks/_shared";

/* ---------------- Session-local mutable stores ---------------- */

const leadsStore: Lead[] = [...DEMO_LEADS];
const botsStore: Bot[] = [...DEMO_BOTS];

function paginate<T>(items: T[], page = 1, pageSize = 100): Paginated<T> {
  const start = (page - 1) * pageSize;
  return { items: items.slice(start, start + pageSize), total: items.length, page, pageSize };
}

function filterBySearch<T>(items: T[], search: string | undefined, keys: (keyof T)[]): T[] {
  if (!search?.trim()) return items;
  const q = search.toLowerCase();
  return items.filter((i) => keys.some((k) => String(i[k] ?? "").toLowerCase().includes(q)));
}

/* ---------------- Bots ---------------- */

const bots: Partial<BotRepository> = {
  async list(params: ListParams = {}) {
    const filtered = filterBySearch(botsStore, params.search, ["name", "description", "channel"]);
    return paginate(filtered, params.page, params.pageSize ?? 100);
  },
  async get(id) { return botsStore.find((b) => b.id === id) ?? null; },
  async getBySlug(slug: string) { return botsStore.find((b) => b.slug === slug) ?? null; },
};

/* ---------------- Flows ---------------- */

const flows: Partial<FlowRepository> = {
  async getByBot(botId: ID) {
    if (botId === "lumina-qualify") return DEMO_FLOW;
    return null;
  },
};

/* ---------------- Leads ---------------- */

const leadTimelineStore = new Map<ID, ExecutionEvent[]>(
  Object.entries(DEMO_LEAD_TIMELINE),
);

const leads: LeadRepository = {
  async list(params: (ListParams & { stage?: LeadStage }) = {}) {
    let items = filterBySearch(leadsStore, params.search, ["name", "email", "phone", "source"]);
    if (params.stage) items = items.filter((l) => l.stage === params.stage);
    return paginate(items, params.page, params.pageSize ?? 100);
  },
  async get(id) { return leadsStore.find((l) => l.id === id) ?? null; },
  async byStage() {
    return DEMO_STAGES.reduce((acc, s) => {
      acc[s.id] = leadsStore.filter((l) => l.stage === s.id);
      return acc;
    }, {} as Record<LeadStage, Lead[]>);
  },
  async stages(): Promise<PipelineStage[]> { return DEMO_STAGES; },
  async updateStage(id, stage) {
    const idx = leadsStore.findIndex((l) => l.id === id);
    if (idx === -1) throw new Error(`Lead ${id} not found (demo)`);
    leadsStore[idx] = { ...leadsStore[idx], stage, updatedAt: new Date().toISOString() };
    return leadsStore[idx];
  },
  async create(input: LeadCreateInput) {
    const now = new Date().toISOString();
    const lead: Lead = {
      id: `demo_lead_${Math.random().toString(36).slice(2, 8)}`,
      workspaceId: "ws_fluxbot_demo",
      name: input.name,
      email: input.email,
      phone: input.phone,
      company: input.company,
      source: input.source ?? "manual",
      stage: input.stage ?? "novo",
      score: input.score ?? 0,
      temperature: input.temperature ?? "frio",
      botId: input.botId,
      tags: input.tags ?? [],
      notes: input.notes,
      createdAt: now,
      updatedAt: now,
      lastActivityAt: now,
    };
    leadsStore.unshift(lead);
    return lead;
  },
  async update(id, patch) {
    const idx = leadsStore.findIndex((l) => l.id === id);
    if (idx === -1) throw new Error(`Lead ${id} not found (demo)`);
    leadsStore[idx] = { ...leadsStore[idx], ...patch, updatedAt: new Date().toISOString() };
    return leadsStore[idx];
  },
  async remove(id) {
    const idx = leadsStore.findIndex((l) => l.id === id);
    if (idx !== -1) leadsStore.splice(idx, 1);
  },
  async addTag(id, tag) {
    const idx = leadsStore.findIndex((l) => l.id === id);
    if (idx === -1) throw new Error(`Lead ${id} not found (demo)`);
    const tags = new Set([...(leadsStore[idx].tags ?? []), tag]);
    leadsStore[idx] = { ...leadsStore[idx], tags: [...tags] };
    return leadsStore[idx];
  },
  async removeTag(id, tag) {
    const idx = leadsStore.findIndex((l) => l.id === id);
    if (idx === -1) throw new Error(`Lead ${id} not found (demo)`);
    leadsStore[idx] = { ...leadsStore[idx], tags: (leadsStore[idx].tags ?? []).filter((t) => t !== tag) };
    return leadsStore[idx];
  },
  async timeline(leadId) { return leadTimelineStore.get(leadId) ?? []; },
  async conversations(leadId) { return DEMO_LEAD_CONVERSATIONS[leadId] ?? []; },
  async crmStats(): Promise<CrmStats> {
    const byStage = DEMO_STAGES.reduce((acc, s) => {
      acc[s.id] = leadsStore.filter((l) => l.stage === s.id).length;
      return acc;
    }, {} as Record<LeadStage, number>);
    const won = countConverted(leadsStore, (l) => l.stage);
    const lost = byStage.perdido ?? 0;
    const decided = won + lost;
    return {
      total: leadsStore.length,
      byStage,
      conversionRate: decided > 0 ? won / decided : 0,
      wonCount: won,
      lostCount: lost,
      recent: [...leadsStore]
        .sort((a, b) => (b.lastActivityAt ?? b.updatedAt).localeCompare(a.lastActivityAt ?? a.updatedAt))
        .slice(0, 8),
    };
  },
};

/* ---------------- Conversations ---------------- */

const conversations: ConversationRepository = {
  async list(params: ListParams = {}) {
    const filtered = filterBySearch(DEMO_CONVERSATIONS, params.search, ["leadName", "botName", "preview"]);
    return paginate(filtered, params.page, params.pageSize ?? 100);
  },
  async get(id) { return DEMO_CONVERSATIONS.find((c) => c.id === id) ?? null; },
  async messagesBySession(sessionId) { return DEMO_MESSAGES.filter((m) => m.sessionId === sessionId); },
  async sessionById(id) { return DEMO_SESSIONS.find((s) => s.id === id) ?? null; },
};

/* ---------------- Channels ---------------- */

const channels: ChannelRepository = {
  async list() { return DEMO_CHANNELS; },
  async connect(id, account) {
    const c = DEMO_CHANNELS.find((c) => c.id === id);
    if (!c) throw new Error(`Channel ${id} not found (demo)`);
    return { ...c, status: "connected", account };
  },
  async disconnect(id) {
    const c = DEMO_CHANNELS.find((c) => c.id === id);
    if (!c) throw new Error(`Channel ${id} not found (demo)`);
    return { ...c, status: "disconnected", account: undefined };
  },
};

/* ---------------- Templates / Variables (no demo content yet) ---------------- */

const templates: Partial<TemplateRepository> = {
  async list(): Promise<Template[]> { return []; },
};
const variables: Partial<VariableRepository> = {
  async listByBot(): Promise<Variable[]> { return []; },
  async listWorkspace(): Promise<Variable[]> { return []; },
};

/* ---------------- Export overlay ---------------- */

export const demoPersistence = {
  bots,
  flows,
  leads,
  conversations,
  channels,
  templates,
  variables,
} as const;

export type DemoPersistence = typeof demoPersistence;
