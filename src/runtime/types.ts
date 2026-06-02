/**
 * Runtime engine types. Framework-agnostic; no React imports.
 */
import type { Block, Flow, ID, ISODate } from "@/types";

export type Variables = Record<string, string | number | boolean | null>;

export type EngineStatus =
  | "idle"
  | "running"
  | "awaiting_input"
  | "awaiting_choice"
  | "ended"
  | "error";

export interface RuntimeContext {
  sessionId: ID;
  flowId: ID;
  currentBlockId: ID | null;
  variables: Variables;
  visitedBlocks: ID[];
  startedAt: ISODate;
  endedAt?: ISODate;
  status: EngineStatus;
  error?: string;
}

export type TranscriptItem =
  | { kind: "bot"; blockId: ID; text: string; at: ISODate }
  | { kind: "user"; text: string; at: ISODate }
  | { kind: "system"; text: string; at: ISODate };

export interface EngineState {
  context: RuntimeContext;
  transcript: TranscriptItem[];
  /** Currently awaited block, when status is awaiting_*. */
  awaiting: Block | null;
}

export type EngineEvent =
  | { type: "state"; state: EngineState }
  | { type: "message"; blockId: ID; text: string }
  | { type: "await_input"; block: Block; prompt: string }
  | { type: "await_choice"; block: Block; prompt: string; options: string[] }
  | { type: "ended"; context: RuntimeContext }
  | { type: "error"; message: string };

export type ConditionOperator = "equals" | "contains" | "greater_than" | "less_than";

export interface ConditionConfig {
  variable: string;
  operator: ConditionOperator;
  value: string | number;
}

export interface EngineOptions {
  initialVariables?: Variables;
  sessionId?: ID;
}

export type EngineListener = (event: EngineEvent) => void;
export type Unsubscribe = () => void;
