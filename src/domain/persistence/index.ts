/**
 * Persistence facade — single switchable surface for the whole app.
 *
 * Mode is controlled by `VITE_USE_SUPABASE`:
 *   - false (default) → in-memory mocks. App boots without auth.
 *   - true            → Supabase adapters. Requires authenticated user
 *                       and an active workspace (see WorkspaceProvider).
 *
 * Page code never touches adapters directly — only `persistence`.
 */
import { USE_SUPABASE } from "@/lib/runtime-config";
import type { Persistence } from "./contracts";

import { repositories as coreMockRepositories } from "@/domain";
import { mockWorkspaceRepository } from "./mock/workspaceRepository";
import { mockUserRepository } from "./mock/userRepository";
import { mockVersionRepository } from "./mock/versionRepository";
import { mockSessionRepository } from "./mock/sessionRepository";
import { mockEventRepository } from "./mock/eventRepository";

import { supabaseBotRepository } from "./supabase/botRepository";
import { supabaseLeadRepository } from "./supabase/leadRepository";
import { supabaseChannelRepository } from "./supabase/channelRepository";
import { supabaseSessionRepository } from "./supabase/sessionRepository";
import { supabaseEventRepository } from "./supabase/eventRepository";
import { supabaseWorkspaceRepository } from "./supabase/workspaceRepository";
import { supabaseUserRepository } from "./supabase/userRepository";
import {
  supabaseConversationRepository,
  supabaseFlowRepository,
  supabaseTemplateRepository,
  supabaseVariableRepository,
  supabaseVersionRepository,
} from "./supabase/notImplemented";

const mockPersistence: Persistence = {
  ...coreMockRepositories,
  workspaces: mockWorkspaceRepository,
  users: mockUserRepository,
  versions: mockVersionRepository,
  sessions: mockSessionRepository,
  events: mockEventRepository,
};

const supabasePersistence: Persistence = {
  bots: supabaseBotRepository,
  flows: supabaseFlowRepository,
  leads: supabaseLeadRepository,
  conversations: supabaseConversationRepository,
  templates: supabaseTemplateRepository,
  channels: supabaseChannelRepository,
  variables: supabaseVariableRepository,
  workspaces: supabaseWorkspaceRepository,
  users: supabaseUserRepository,
  versions: supabaseVersionRepository,
  sessions: supabaseSessionRepository,
  events: supabaseEventRepository,
};

export const persistence: Persistence = USE_SUPABASE
  ? supabasePersistence
  : mockPersistence;

export * from "./contracts";
export { USE_SUPABASE } from "@/lib/runtime-config";
