import type { ID, ISODate, Timestamps } from "./common";

export type BlockType =
  | "start"
  | "message"
  | "input"
  | "choice"
  | "condition"
  | "ai"
  | "webhook"
  | "delay"
  | "end";

export interface BlockPosition {
  x: number;
  y: number;
}

/** Loose config shape — each block type can extend its own contract later. */
export interface BlockConfig {
  text?: string;
  prompt?: string;
  variable?: string;
  options?: string[];
  url?: string;
  delayMs?: number;
  operator?: "equals" | "contains" | "greater_than" | "less_than";
  value?: string | number;
  [key: string]: unknown;
}

export interface Block extends Timestamps {
  id: ID;
  botId: ID;
  type: BlockType;
  label: string;
  position: BlockPosition;
  config: BlockConfig;
}

export interface Connection extends Timestamps {
  id: ID;
  botId: ID;
  fromBlockId: ID;
  toBlockId: ID;
  /** Optional condition label, e.g. "sim" / "não" / "true" / "false". */
  condition?: string;
}

/* ---------------- Flow envelope ---------------- */

export type FlowStatus = "draft" | "published" | "archived";

export type FlowVariableType = "string" | "number" | "boolean";

export interface FlowVariableDecl {
  name: string;
  type?: FlowVariableType;
  defaultValue?: string | number | boolean | null;
  description?: string;
}

export interface FlowMetadata {
  name: string;
  description?: string;
  version: number;
  primaryChannel?: string;
  status: FlowStatus;
  lastEditedAt: ISODate;
}

export interface FlowVersionRef {
  version: number;
  status: FlowStatus;
  createdAt: ISODate;
  note?: string;
}

export interface Flow {
  botId: ID;
  blocks: Block[];
  connections: Connection[];
  variables?: FlowVariableDecl[];
  metadata?: FlowMetadata;
  publishedVersion?: number;
  versions?: FlowVersionRef[];
}
