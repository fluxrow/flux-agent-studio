/**
 * Persistence facade — single switchable surface for the whole app.
 *
 * Mode is controlled by `VITE_USE_SUPABASE`:
 *   - false (default) → in-memory mocks. App boots without auth.
 *   - true            → Supabase adapters. Requires authenticated user
 *                       and an active workspace (see WorkspaceProvider).
 *
 * Demo Runtime overlay (Phase 26B.1C): when `isDemoMode()` is true at
 * call time, every domain's READ methods are intercepted and served
 * from `demoPersistence` (deterministic "Agência Growth Demo" dataset).
 * The real workspace is never consulted in demo mode.
 *
 * Page code never touches adapters directly — only `persistence`.
 *
 * Every repository is instrumented (see persistence-telemetry) so the
 * System Health panel and /debug/repositories page can report which
 * adapter is live, when it last ran, and what (if anything) broke.
 */
import { USE_SUPABASE } from "@/lib/runtime-config";
import { instrumentRepository } from "@/lib/persistence-telemetry";
import { isDemoMode } from "@/beta/demoMode";
import { demoPersistence } from "@/beta/demoPersistence";
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

const STUB_DOMAINS: DomainKey[] = USE_SUPABASE ? ["templates"] : [];

const chosen: Persistence = USE_SUPABASE ? supabasePersistence : mockPersistence;

/**
 * Wrap a domain repository with the Demo Runtime overlay. At call time,
 * if demo mode is active AND the overlay provides the requested method,
 * the overlay handles the call — otherwise the real repository does.
 */
function withDemoOverlay<T extends object>(domain: DomainKey, real: T): T {
  return new Proxy(real, {
    get(target, prop, receiver) {
      if (isDemoMode()) {
        const overlay = (demoPersistence as Record<string, any>)[domain as string];
        const fn = overlay?.[prop as string];
        if (typeof fn === "function") return fn.bind(overlay);
      }
      return Reflect.get(target, prop, receiver);
    },
  }) as T;
}

const overlaid = Object.fromEntries(
  (Object.keys(chosen) as DomainKey[]).map((domain) => [
    domain,
    withDemoOverlay(domain, chosen[domain] as object),
  ]),
) as unknown as Persistence;

const instrumented = Object.fromEntries(
  (Object.keys(overlaid) as DomainKey[]).map((domain) => [
    domain,
    instrumentRepository(domain, overlaid[domain] as object),
  ]),
) as unknown as Persistence;

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
