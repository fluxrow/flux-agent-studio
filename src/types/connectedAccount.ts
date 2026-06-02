import type { ID, ISODate } from "./common";

export type OAuthProviderId =
  | "instagram"
  | "facebook"
  | "whatsapp"
  | "telegram"
  | "gbp";

export type ConnectedAccountStatus =
  | "connected"
  | "disconnected"
  | "expired"
  | "pending";

export interface ConnectedAccount {
  id: ID;
  workspaceId: ID;
  provider: OAuthProviderId;
  accountName: string;
  accountIdentifier: string;
  status: ConnectedAccountStatus;
  connectedAt: ISODate;
  lastSyncAt?: ISODate;
  meta?: Record<string, unknown>;
}

export interface ChannelBinding {
  id: ID;
  workspaceId: ID;
  botId: ID;
  accountId: ID;
  provider: OAuthProviderId;
  createdAt: ISODate;
}
