import type { ID, Lead, LeadStage, ListParams, PipelineStage } from "@/types";
import type { LeadRepository } from "../repositories";
import { mockLeads, mockStages } from "@/mocks";
import { nowIso } from "@/mocks/_shared";
import { delay, filterBySearch, paginate } from "./_helpers";

const store: Lead[] = [...mockLeads];

export const mockLeadRepository: LeadRepository = {
  async list(params: (ListParams & { stage?: LeadStage }) = {}) {
    let items = filterBySearch(store, params.search, ["name", "email", "phone", "source"]);
    if (params.stage) items = items.filter((l) => l.stage === params.stage);
    return delay(paginate(items, params.page, params.pageSize ?? 100));
  },
  async get(id: ID) {
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
  async updateStage(id: ID, stage: LeadStage) {
    const idx = store.findIndex((l) => l.id === id);
    if (idx === -1) throw new Error(`Lead ${id} not found`);
    store[idx] = { ...store[idx], stage, updatedAt: nowIso() };
    return delay(store[idx]);
  },
};
