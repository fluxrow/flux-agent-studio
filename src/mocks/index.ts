// Mocks barrel. The Demo Runtime (Phase 26B.1C) overrides reads at the
// persistence facade level, so we no longer inject demo entities into
// mock arrays here — leaving the mock fixtures untouched.
export { mockBots } from "./bots";
export { mockFlows } from "./flows";
export { mockLeads, mockStages } from "./leads";
export { mockSessions, mockMessages, mockConversations } from "./sessions";
export { mockTemplates } from "./templates";
export { mockChannels } from "./channels";
export { mockVariables } from "./variables";
export { MOCK_WORKSPACE_ID } from "./_shared";
