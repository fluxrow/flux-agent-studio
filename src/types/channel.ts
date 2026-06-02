import type { ID, Timestamps } from "./common";

export type ChannelKind =
  | "whatsapp"
  | "instagram"
  | "facebook"
  | "telegram"
  | "tiktok"
  | "gbp"
  | "web";

export type ChannelStatus = "connected" | "disconnected" | "soon";

export interface Channel extends Timestamps {
  id: ID;
  workspaceId: ID;
  kind: ChannelKind;
  name: string;
  description: string;
  status: ChannelStatus;
  account?: string;
}
