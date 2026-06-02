import type { ID, Timestamps } from "./common";

export type BotStatus = "ativo" | "rascunho" | "arquivado";

export interface Bot extends Timestamps {
  id: ID;
  workspaceId: ID;
  name: string;
  description: string;
  status: BotStatus;
  channel: string;
  metrics: {
    conversations: number;
    conversions: number;
  };
}

export interface BotCreateInput {
  name: string;
  description?: string;
  channel: string;
  templateId?: ID;
}
