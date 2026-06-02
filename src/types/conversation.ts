import type { ID, Timestamps } from "./common";
import type { SessionStatus } from "./session";

/**
 * Conversation = read model that joins a Session with its Lead and last Message
 * for the inbox UI. Stored separately so the UI doesn't need to assemble it.
 */
export interface Conversation extends Timestamps {
  id: ID;
  sessionId: ID;
  leadName: string;
  botName: string;
  preview: string;
  unread: number;
  time: string;
  status: SessionStatus;
}
