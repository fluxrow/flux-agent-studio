/**
 * Stub adapters for repositories that aren't fully ported to Supabase yet
 * (flows, conversations, templates, variables, versions). The schema is
 * ready — these wire-ups will come in later phases. Returning empty data
 * keeps the UI from crashing while we iterate.
 */
import type {
  ConversationRepository,
  FlowRepository,
  TemplateRepository,
  VariableRepository,
  VersionRepository,
} from "../contracts";

const empty = <T>(value: T) => Promise.resolve(value);
const emptyList = () =>
  Promise.resolve({ items: [], total: 0, page: 1, pageSize: 50 });

export const supabaseFlowRepository: FlowRepository = {
  async getByBot() {
    return null;
  },
  async saveBlocks() {},
  async saveConnections() {},
};

export const supabaseConversationRepository: ConversationRepository = {
  async list() {
    return emptyList();
  },
  async get() {
    return null;
  },
  async messagesBySession() {
    return [];
  },
  async sessionById() {
    return null;
  },
};

export const supabaseTemplateRepository: TemplateRepository = {
  async list() {
    return empty([]);
  },
  async get() {
    return null;
  },
};

export const supabaseVariableRepository: VariableRepository = {
  async listByBot() {
    return empty([]);
  },
  async listWorkspace() {
    return empty([]);
  },
};

export const supabaseVersionRepository: VersionRepository = {
  async listByBot() {
    return empty([]);
  },
  async get() {
    return null;
  },
  async publish(_botId, snapshot, note) {
    return {
      id: "ver_pending",
      botId: _botId,
      version: 1,
      status: "published",
      snapshot,
      createdAt: new Date().toISOString(),
      note,
    };
  },
  async rollback(_botId, _versionId) {
    throw new Error("Not implemented yet (Phase 6).");
  },
};
