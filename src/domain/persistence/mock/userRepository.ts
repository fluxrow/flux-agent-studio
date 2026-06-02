import type { User } from "@/types";
import type { UserRepository } from "../contracts";
import { MOCK_WORKSPACE_ID, nowIso } from "@/mocks/_shared";
import { delay } from "@/domain/mock/_helpers";

const store: User[] = [
  {
    id: "usr_demo_owner",
    workspaceId: MOCK_WORKSPACE_ID,
    name: "Cauã",
    email: "caua@fluxbot.io",
    role: "owner",
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
];

export const mockUserRepository: UserRepository = {
  async me() {
    return delay(store[0]);
  },
  async listByWorkspace(workspaceId) {
    return delay(store.filter((u) => u.workspaceId === workspaceId));
  },
  async get(id) {
    return delay(store.find((u) => u.id === id) ?? null);
  },
};
