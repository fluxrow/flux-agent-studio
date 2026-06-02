/**
 * Persistence facade — single switchable surface for the whole app.
 *
 * Mode is controlled by `VITE_USE_SUPABASE`:
 *   - false (default) → in-memory mocks. App boots without auth.
 *   - true            → Supabase adapters. Requires authenticated user
 *                       and an active workspace (see WorkspaceProvider).
 *
 * Page code never touches adapters directly — only `persistence`.
 *
 * Every repository is instrumented (see persistence-telemetry) so the
 * System Health panel and /debug/repositories page can report which
 * adapter is live, when it last ran, and what (if anything) broke.
 */
import { USE_SUPABASE } from "@/lib/runtime-config";
import { instrumentRepository } from "@/lib/persistence-telemetry";
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

export type RepoMode = "mock" | "supabase" | "stub";
export type DomainKey = keyof Persistence;

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

/**
 * Some Supabase repos are placeholder stubs (Phase 6 work). They satisfy
 * the contract but return empty data. We tag them so the debug UI can
 * show "stub" instead of misleading "supabase".
 */
const STUB_DOMAINS: DomainKey[] = USE_SUPABASE
  ? ["flows", "conversations", "templates", "variables", "versions"]
  : [];

const chosen: Persistence = USE_SUPABASE ? supabasePersistence : mockPersistence;

const instrumented = Object.fromEntries(
  (Object.keys(chosen) as DomainKey[]).map((domain) => [
    domain,
    instrumentRepository(domain, chosen[domain] as object),
  ]),
) as Persistence;

export const persistence: Persistence = instrumented;

export function getDomainMode(domain: DomainKey): RepoMode {
  if (!USE_SUPABASE) return "mock";
  return STUB_DOMAINS.includes(domain) ? "stub" : "supabase";
}

export function getAllDomainModes(): Record<DomainKey, RepoMode> {
  return Object.fromEntries(
    (Object.keys(chosen) as DomainKey[]).map((d) => [d, getDomainMode(d)]),
  ) as Record<DomainKey, RepoMode>;
}

export * from "./contracts";
export { USE_SUPABASE } from "@/lib/runtime-config";
