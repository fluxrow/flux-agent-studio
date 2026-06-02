import type { ID, Timestamps } from "./common";

export type VariableScope = "bot" | "workspace" | "session";
export type VariableType = "string" | "number" | "boolean" | "json";

export interface Variable extends Timestamps {
  id: ID;
  botId?: ID;
  workspaceId: ID;
  key: string;
  type: VariableType;
  scope: VariableScope;
  defaultValue?: string | number | boolean | Record<string, unknown> | null;
  description?: string;
}
