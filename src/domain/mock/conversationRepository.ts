import type { Conversation, ID, ListParams, Message, Session } from "@/types";
import type { ConversationRepository } from "../repositories";
import { mockConversations, mockMessages, mockSessions } from "@/mocks";
import { delay, filterBySearch, paginate } from "./_helpers";

export const mockConversationRepository: ConversationRepository = {
  async list(params: ListParams = {}) {
    const filtered = filterBySearch(mockConversations, params.search, ["leadName", "botName", "preview"]);
    return delay(paginate(filtered, params.page, params.pageSize ?? 100));
  },
  async get(id: ID) {
    return delay(mockConversations.find((c) => c.id === id) ?? null);
  },
  async messagesBySession(sessionId: ID): Promise<Message[]> {
    return delay(mockMessages.filter((m) => m.sessionId === sessionId));
  },
  async sessionById(id: ID): Promise<Session | null> {
    return delay(mockSessions.find((s) => s.id === id) ?? null);
  },
};
