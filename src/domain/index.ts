import type { Repositories } from "./repositories";
import { mockBotRepository } from "./mock/botRepository";
import { mockFlowRepository } from "./mock/flowRepository";
import { mockLeadRepository } from "./mock/leadRepository";
import { mockConversationRepository } from "./mock/conversationRepository";
import { mockTemplateRepository } from "./mock/templateRepository";
import { mockChannelRepository } from "./mock/channelRepository";
import { mockVariableRepository } from "./mock/variableRepository";

/**
 * Single entry point for all data access in the app.
 *
 * Today it's wired to in-memory mocks. When Lovable Cloud is enabled,
 * swap each line to `supabaseXRepository` — page code does not change.
 *
 * Example future wiring:
 *   bots: import.meta.env.VITE_USE_SUPABASE
 *     ? supabaseBotRepository
 *     : mockBotRepository,
 */
export const repositories: Repositories = {
  bots: mockBotRepository,
  flows: mockFlowRepository,
  leads: mockLeadRepository,
  conversations: mockConversationRepository,
  templates: mockTemplateRepository,
  channels: mockChannelRepository,
  variables: mockVariableRepository,
};

export type { Repositories } from "./repositories";
export * from "./repositories";
