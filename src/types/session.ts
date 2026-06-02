import type { ID, ISODate, Timestamps } from "./common";

export type SessionStatus = "ativa" | "encerrada" | "humano" | "expirada";

export interface Session extends Timestamps {
  id: ID;
  botId: ID;
  leadId?: ID;
  visitorId: string;
  channel: string;
  status: SessionStatus;
  startedAt: ISODate;
  endedAt?: ISODate;
  variables: Record<string, unknown>;
  currentBlockId?: ID;
}

export type MessageRole = "bot" | "user" | "agent" | "system";

export interface Message extends Timestamps {
  id: ID;
  sessionId: ID;
  role: MessageRole;
  text: string;
  blockId?: ID;
  sentAt: ISODate;
}
