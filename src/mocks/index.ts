// Mocks barrel. When demo mode is active (Phase 26B.1B), we prepend
// the canonical "Agência Growth Demo" scenario into the live mock
// arrays so every screen renders the same deterministic dataset.
import { mockBots } from "./bots";
import { mockLeads } from "./leads";
import { isDemoMode } from "@/beta/demoMode";
import { DEMO_BOTS, DEMO_LEADS } from "@/beta/demoDataset";

if (isDemoMode()) {
  // Idempotent: only inject if not already present.
  if (!mockBots.some((b) => b.id === "lumina-qualify")) {
    mockBots.unshift(...DEMO_BOTS);
  }
  if (!mockLeads.some((l) => l.id === "demo-marina")) {
    mockLeads.unshift(...DEMO_LEADS);
  }
}

export { mockBots } from "./bots";
export { mockFlows } from "./flows";
export { mockLeads, mockStages } from "./leads";
export { mockSessions, mockMessages, mockConversations } from "./sessions";
export { mockTemplates } from "./templates";
export { mockChannels } from "./channels";
export { mockVariables } from "./variables";
export { MOCK_WORKSPACE_ID } from "./_shared";
