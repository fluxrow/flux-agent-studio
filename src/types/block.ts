import type { ID, Timestamps } from "./common";

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
  /** Optional condition label, e.g. "sim" / "não" for choice branches. */
  condition?: string;
}

export interface Flow {
  botId: ID;
  blocks: Block[];
  connections: Connection[];
}
