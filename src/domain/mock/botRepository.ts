import type { Bot, BotCreateInput, Flow, ID, ListParams } from "@/types";
import type { BotRepository } from "../repositories";
import { mockBots, mockFlows } from "@/mocks";
import { MOCK_WORKSPACE_ID, nowIso } from "@/mocks/_shared";
import { delay, filterBySearch, paginate } from "./_helpers";

const store: Bot[] = [...mockBots];

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "bot";

export const mockBotRepository: BotRepository = {
  async list(params: ListParams = {}) {
    const filtered = filterBySearch(store, params.search, ["name", "description", "channel"]);
    return delay(paginate(filtered, params.page, params.pageSize ?? 50));
  },
  async get(id: ID) {
    return delay(store.find((b) => b.id === id) ?? null);
  },
  async create(input: BotCreateInput) {
    const now = nowIso();
    const bot: Bot = {
      id: `bot_${Math.random().toString(36).slice(2, 9)}`,
      workspaceId: MOCK_WORKSPACE_ID,
      name: input.name,
      description: input.description ?? "",
      status: "rascunho",
      channel: input.channel,
      metrics: { conversations: 0, conversions: 0 },
      createdAt: now,
      updatedAt: now,
    };
    store.unshift(bot);
    return delay(bot);
  },
  async update(id: ID, patch: Partial<Bot>) {
    const idx = store.findIndex((b) => b.id === id);
    if (idx === -1) throw new Error(`Bot ${id} not found`);
    store[idx] = { ...store[idx], ...patch, updatedAt: nowIso() };
    return delay(store[idx]);
  },
  async remove(id: ID) {
    const idx = store.findIndex((b) => b.id === id);
    if (idx !== -1) store.splice(idx, 1);
    return delay(undefined);
  },
  async publish(id: ID, snapshot: Flow, slug?: string, _note?: string) {
    const idx = store.findIndex((b) => b.id === id);
    if (idx === -1) throw new Error(`Bot ${id} not found`);
    const base = slugify(slug?.trim() || store[idx].name || "bot");
    let final = base;
    let i = 0;
    while (store.some((b) => b.slug === final && b.id !== id)) {
      i += 1;
      final = `${base}-${i}`;
    }
    mockFlows[id] = snapshot;
    store[idx] = {
      ...store[idx],
      status: "ativo",
      slug: final,
      publishedSnapshot: snapshot,
      publishedAt: nowIso(),
      updatedAt: nowIso(),
    };
    return delay(store[idx]);
  },
  async getBySlug(slug: string) {
    return delay(store.find((b) => b.slug === slug) ?? null);
  },
};
