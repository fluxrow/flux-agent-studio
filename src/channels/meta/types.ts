export type MetaPlatform = "whatsapp" | "instagram" | "messenger";

export type MetaHandoffStatus = "agent" | "human" | "resolved";

export interface MetaChannelConnection {
  id:             string;
  workspaceId:    string;
  platform:       MetaPlatform;
  displayName:    string;
  phoneNumberId?: string;
  pageId?:        string;
  igUserId?:      string;
  webhookVerified: boolean;
  status:         "active" | "inactive" | "error";
  errorMessage?:  string;
  meta:           Record<string, unknown>;
  createdAt:      string;
  updatedAt:      string;
}

export interface MetaConversation {
  id:                    string;
  workspaceId:           string;
  connectionId:          string;
  platform:              MetaPlatform;
  externalConversationId: string;
  contactExternalId:     string;
  contactName:           string;
  contactAvatar?:        string;
  preview:               string;
  unread:                number;
  handoffStatus:         MetaHandoffStatus;
  lastMessageAt:         string;
  createdAt:             string;
  updatedAt:             string;
}

export interface MetaMessage {
  id:                 string;
  workspaceId:        string;
  conversationId:     string;
  externalMessageId:  string;
  direction:          "inbound" | "outbound";
  messageType:        string;
  messageText?:       string;
  contactExternalId:  string;
  sentAt:             string;
  rawPayload?:        Record<string, unknown>;
  createdAt:          string;
}

export interface CreateMetaConnectionInput {
  platform:        MetaPlatform;
  displayName:     string;
  accessToken:     string;
  phoneNumberId?:  string;
  pageId?:         string;
  igUserId?:       string;
}

/** Unified inbox item — works for both meta_conversations and web sessions */
export interface InboxItem {
  id:             string;
  source:         "meta" | "web";
  platform:       MetaPlatform | "web";
  contactName:    string;
  contactAvatar?: string;
  preview:        string;
  unread:         number;
  status:         MetaHandoffStatus | "ativa" | "encerrada" | "humano";
  lastMessageAt:  string;
  /** Meta only */
  connectionId?:  string;
  contactExternalId?: string;
  externalConversationId?: string;
}
