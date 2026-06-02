import type { Workspace } from "@/types";
import type { WorkspaceRepository } from "../contracts";
import { MOCK_WORKSPACE_ID, nowIso } from "@/mocks/_shared";
import { delay } from "@/domain/mock/_helpers";

const store: Workspace = {
  id: MOCK_WORKSPACE_ID,
  name: "FluxBot Demo",
  slug: "fluxbot-demo",
  plan: "growth",
  ownerId: "usr_demo_owner",
  createdAt: nowIso(),
  updatedAt: nowIso(),
};

export const mockWorkspaceRepository: WorkspaceRepository = {
  async current() {
    return delay(store);
  },
  async get(id) {
    return delay(id === store.id ? store : null);
  },
  async update(id, patch) {
    if (id !== store.id) throw new Error(`Workspace ${id} not found`);
    Object.assign(store, patch, { updatedAt: nowIso() });
    return delay(store);
  },
};
