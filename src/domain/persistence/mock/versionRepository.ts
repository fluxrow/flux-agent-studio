import type { Flow, ID } from "@/types";
import type { FlowVersion, VersionRepository } from "../contracts";
import { nowIso } from "@/mocks/_shared";
import { delay } from "@/domain/mock/_helpers";

const store: FlowVersion[] = [];
let counter = 1;

export const mockVersionRepository: VersionRepository = {
  async listByBot(botId: ID) {
    return delay(store.filter((v) => v.botId === botId).sort((a, b) => b.version - a.version));
  },
  async get(id: ID) {
    return delay(store.find((v) => v.id === id) ?? null);
  },
  async publish(botId: ID, snapshot: Flow, note?: string) {
    const latest = store
      .filter((v) => v.botId === botId)
      .reduce((max, v) => Math.max(max, v.version), 0);
    const version: FlowVersion = {
      id: `ver_${counter++}_${Math.random().toString(36).slice(2, 6)}`,
      botId,
      version: latest + 1,
      status: "published",
      snapshot,
      createdAt: nowIso(),
      note,
    };
    // Mark previous published as archived (single published version per bot).
    store
      .filter((v) => v.botId === botId && v.status === "published")
      .forEach((v) => (v.status = "archived"));
    store.push(version);
    return delay(version);
  },
  async rollback(botId: ID, versionId: ID) {
    const target = store.find((v) => v.id === versionId && v.botId === botId);
    if (!target) throw new Error(`Version ${versionId} not found`);
    return this.publish(botId, target.snapshot, `Rollback to v${target.version}`);
  },
};
