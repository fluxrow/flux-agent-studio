import type {
  Conversation, CrmStats, ExecutionEvent, ID, Lead, LeadCreateInput,
  LeadStage, ListParams, PipelineStage,
} from "@/types";
import type { LeadRepository } from "../repositories";
import { mockLeads, mockStages } from "@/mocks";
import { nowIso } from "@/mocks/_shared";
import { delay, filterBySearch, paginate } from "./_helpers";

const store: Lead[] = [...mockLeads];
const timelines = new Map<ID, ExecutionEvent[]>();
const leadConversations = new Map<ID, Conversation[]>();

const uid = () => `lead_${Math.random().toString(36).slice(2, 10)}`;

function recordTimeline(leadId: ID, type: ExecutionEvent["type"], payload: Record<string, unknown> = {}) {
  const list = timelines.get(leadId) ?? [];
  list.unshift({
    id: `te_${Math.random().toString(36).slice(2, 10)}`,
    type,
    sessionId: "",
    flowId: "",
    at: nowIso(),
    payload,
  });
  timelines.set(leadId, list);
}

export const mockLeadRepository: LeadRepository = {
  async list(params: (ListParams & { stage?: LeadStage }) = {}) {
    let items = filterBySearch(store, params.search, ["name", "email", "phone", "source"]);
    if (params.stage) items = items.filter((l) => l.stage === params.stage);
    return delay(paginate(items, params.page, params.pageSize ?? 100));
  },
  async get(id) {
    return delay(store.find((l) => l.id === id) ?? null);
  },
  async byStage() {
    const grouped = mockStages.reduce((acc, s) => {
      acc[s.id] = store.filter((l) => l.stage === s.id);
      return acc;
    }, {} as Record<LeadStage, Lead[]>);
    return delay(grouped);
  },
  async stages(): Promise<PipelineStage[]> {
    return delay(mockStages);
  },
  async updateStage(id, stage) {
    const idx = store.findIndex((l) => l.id === id);
    if (idx === -1) throw new Error(`Lead ${id} not found`);
    const prev = store[idx];
    store[idx] = { ...prev, stage, updatedAt: nowIso(), lastActivityAt: nowIso() };
    recordTimeline(id, "lead_updated", { from: prev.stage, to: stage, change: "stage" });
    return delay(store[idx]);
  },
  async create(input: LeadCreateInput) {
    const now = nowIso();
    const lead: Lead = {
      id: uid(),
      workspaceId: "mock-ws",
      name: input.name,
      email: input.email,
      phone: input.phone,
      company: input.company,
      source: input.source ?? "manual",
      stage: input.stage ?? "novo",
      score: input.score ?? 0,
      temperature: input.temperature ?? "frio",
      botId: input.botId,
      ownerId: input.ownerId,
      tags: input.tags ?? [],
      notes: input.notes,
      createdAt: now,
      updatedAt: now,
      lastActivityAt: now,
    };
    store.unshift(lead);
    recordTimeline(lead.id, "lead_created", { source: lead.source, stage: lead.stage });
    return delay(lead);
  },
  async update(id, patch) {
    const idx = store.findIndex((l) => l.id === id);
    if (idx === -1) throw new Error(`Lead ${id} not found`);
    const prev = store[idx];
    store[idx] = { ...prev, ...patch, updatedAt: nowIso(), lastActivityAt: nowIso() };
    recordTimeline(id, "lead_updated", { changed: Object.keys(patch) });
    return delay(store[idx]);
  },
  async remove(id) {
    const idx = store.findIndex((l) => l.id === id);
    if (idx !== -1) store.splice(idx, 1);
    timelines.delete(id);
    leadConversations.delete(id);
    return delay(undefined as unknown as void);
  },
  async addTag(id, tag) {
    const idx = store.findIndex((l) => l.id === id);
    if (idx === -1) throw new Error(`Lead ${id} not found`);
    const next = new Set([...(store[idx].tags ?? []), tag]);
    store[idx] = { ...store[idx], tags: [...next], updatedAt: nowIso(), lastActivityAt: nowIso() };
    recordTimeline(id, "lead_updated", { change: "tag_added", tag });
    return delay(store[idx]);
  },
  async removeTag(id, tag) {
    const idx = store.findIndex((l) => l.id === id);
    if (idx === -1) throw new Error(`Lead ${id} not found`);
    store[idx] = {
      ...store[idx],
      tags: (store[idx].tags ?? []).filter((t) => t !== tag),
      updatedAt: nowIso(),
      lastActivityAt: nowIso(),
    };
    recordTimeline(id, "lead_updated", { change: "tag_removed", tag });
    return delay(store[idx]);
  },
  async timeline(leadId) {
    return delay(timelines.get(leadId) ?? []);
  },
  async conversations(leadId) {
    return delay(leadConversations.get(leadId) ?? []);
  },
  async crmStats(): Promise<CrmStats> {
    const byStage = mockStages.reduce((acc, s) => {
      acc[s.id] = store.filter((l) => l.stage === s.id).length;
      return acc;
    }, {} as Record<LeadStage, number>);
    const won = countConverted(store, (l) => l.stage);
    const lost = byStage.perdido ?? 0;
    const decided = won + lost;
    return delay({
      total: store.length,
      byStage,
      conversionRate: decided > 0 ? won / decided : 0,
      wonCount: won,
      lostCount: lost,
      recent: [...store]
        .sort((a, b) => (b.lastActivityAt ?? b.updatedAt).localeCompare(a.lastActivityAt ?? a.updatedAt))
        .slice(0, 8),
    });
  },
};
