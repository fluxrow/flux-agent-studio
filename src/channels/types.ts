/**
 * Channel Engine — Phase 10
 *
 * Abstraction layer that decouples the Runtime Engine from message transports.
 * The Runtime knows nothing about channels: it emits blocks, the channel
 * adapter turns them into platform-specific messages.
 */
import type { ID, ISODate } from "@/types/common";

/* ---------------- Universal Message Model ---------------- */

export type ChannelMessageKind =
  | "text"
  | "buttons"
  | "quick_reply"
  | "image"
  | "video"
  | "audio"
  | "file"
  | "location"
  | "template";

export interface ChannelMessageButton {
  id?: string;
  label: string;
  value?: string;
  url?: string;
}

export interface ChannelMessage {
  id: string;
  kind: ChannelMessageKind;
  text?: string;
  mediaUrl?: string;
  caption?: string;
  buttons?: ChannelMessageButton[];
  quickReplies?: ChannelMessageButton[];
  latitude?: number;
  longitude?: number;
  templateName?: string;
  meta?: Record<string, unknown>;
}

/* ---------------- Identity ---------------- */

export interface ChannelUser {
  id: string;            // platform user id (or visitor id for web)
  channelId: ChannelId;  // which channel they came from
  name?: string;
  phone?: string;
  email?: string;
  metadata?: Record<string, unknown>;
}

/* ---------------- Sessions ---------------- */

export type ChannelSessionStatus = "open" | "closed";

export interface ChannelSession {
  id: ID;
  channelId: ChannelId;
  user: ChannelUser;
  botId?: ID;
  workspaceId?: ID;
  status: ChannelSessionStatus;
  openedAt: ISODate;
  closedAt?: ISODate;
  meta?: Record<string, unknown>;
}

/* ---------------- Channel Adapter ---------------- */

export type ChannelId =
  | "web"
  | "whatsapp"
  | "instagram"
  | "messenger"
  | "telegram"
  | "tiktok";

export type ChannelStatus = "active" | "stub" | "disabled";

export interface ChannelOpenInput {
  user: ChannelUser;
  botId?: ID;
  workspaceId?: ID;
  meta?: Record<string, unknown>;
}

/**
 * ChannelAdapter — contract every transport must honour.
 *
 *   receive  — inbound message from platform (called by webhook/bridge)
 *   send     — outbound message to platform
 *   openSession / closeSession — lifecycle
 *   identify — resolve a platform-user id into a ChannelUser
 *
 * Adapters never call the Runtime directly: the SessionRouter glues them.
 */
export interface ChannelAdapter {
  id: ChannelId;
  label: string;
  status: ChannelStatus;

  openSession(input: ChannelOpenInput): Promise<ChannelSession>;
  closeSession(sessionId: ID): Promise<void>;

  send(sessionId: ID, message: ChannelMessage): Promise<void>;
  receive?(sessionId: ID, message: ChannelMessage): Promise<void>;

  identify(rawId: string, hint?: Partial<ChannelUser>): Promise<ChannelUser>;
}

/* ---------------- Channel Events ---------------- */

export type ChannelEventType =
  | "channel_connected"
  | "session_opened"
  | "session_closed"
  | "message_received"
  | "message_sent";

export interface ChannelEvent {
  id: string;
  type: ChannelEventType;
  channelId: ChannelId;
  sessionId?: ID;
  at: ISODate;
  message?: ChannelMessage;
  user?: ChannelUser;
  payload?: Record<string, unknown>;
}

export type ChannelEventListener = (event: ChannelEvent) => void;
