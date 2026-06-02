/**
 * Persistence facade.
 *
 * The whole app should read/write data through this single object. Swap
 * any line for a Supabase-backed adapter when Lovable Cloud is enabled
 * — page code does not change.
 */
import type { Persistence } from "./contracts";
import { repositories as coreRepositories } from "@/domain";

import { mockWorkspaceRepository } from "./mock/workspaceRepository";
import { mockUserRepository } from "./mock/userRepository";
import { mockVersionRepository } from "./mock/versionRepository";
import { mockSessionRepository } from "./mock/sessionRepository";
import { mockEventRepository } from "./mock/eventRepository";

export const persistence: Persistence = {
  ...coreRepositories,
  workspaces: mockWorkspaceRepository,
  users: mockUserRepository,
  versions: mockVersionRepository,
  sessions: mockSessionRepository,
  events: mockEventRepository,
};

export * from "./contracts";
