/**
 * AI Provider Layer — Phase 12.
 *
 * Models a transport-agnostic contract every AI provider must honour.
 * Stub implementations live in `./providers/*`; real Lovable AI Gateway
 * adapters can replace them later without touching consumers (Runtime,
 * Builder, Playground, Inspector).
 */
import type { ID, ISODate } from "@/types/common";

export type AIProviderId = "openai" | "anthropic" | "gemini";

export interface AIModelInfo {
  id: string;
  label: string;
  /** USD per 1K input tokens. Used by mock cost estimator. */
  inputCostPer1k: number;
  outputCostPer1k: number;
}

export interface AIGenerateInput {
  prompt: string;
  system?: string;
  temperature?: number;
  maxTokens?: number;
  model?: string;
  variables?: Record<string, unknown>;
}

export interface AIClassifyInput {
  prompt: string;
  labels: string[];
  model?: string;
  variables?: Record<string, unknown>;
}

export interface AISchemaProperty {
  type: "string" | "number" | "boolean" | "string[]";
  description?: string;
  enum?: string[];
}

export type AIOutputSchema = Record<string, AISchemaProperty | "string" | "number" | "boolean">;

export interface AIExtractInput<S extends AIOutputSchema = AIOutputSchema> {
  prompt: string;
  schema: S;
  model?: string;
  temperature?: number;
  variables?: Record<string, unknown>;
}

export interface AIUsage {
  inputTokens: number;
  outputTokens: number;
  /** USD, estimated using the model's published mock prices. */
  estimatedCost: number;
}

export interface AIResponse<T = unknown> {
  provider: AIProviderId;
  model: string;
  output: T;
  /** Raw text the provider returned (also stored for inspection). */
  rawText: string;
  usage: AIUsage;
  /** Time in ms the call took (end-to-end, including network simulation). */
  durationMs: number;
  finishedAt: ISODate;
  meta?: Record<string, unknown>;
}

export interface AIProvider {
  id: AIProviderId;
  label: string;
  description: string;
  models: AIModelInfo[];
  defaultModel: string;

  /** Free-form text generation. */
  generate(input: AIGenerateInput): Promise<AIResponse<string>>;
  /** Structured extraction validated against a JSON-ish schema. */
  extract<S extends AIOutputSchema>(input: AIExtractInput<S>): Promise<AIResponse<Record<string, unknown>>>;
  /** Single-label classification against a fixed set. */
  classify(input: AIClassifyInput): Promise<AIResponse<string>>;
}

/* ---------------- AI Block configuration ---------------- */

export interface AIBlockVariableMapping {
  /** Path in the AI output (e.g. "cidade"). */
  from: string;
  /** Flow variable to write to (e.g. "cidade" or "lead.city"). */
  to: string;
}

export interface AIBlockKnowledgeConfig {
  baseId: string;
  topK?: number;
  minScore?: number;
  /** When true (default), prepend retrieved chunks as a CONTEXT block. */
  injectAsContext?: boolean;
  /** Optional flow variable to store retrieved chunks for later use. */
  outputVariable?: string;
}

export interface AIBlockConfig {
  prompt?: string;
  provider?: AIProviderId;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  /** When present, runner uses extract() instead of generate(). */
  outputSchema?: AIOutputSchema;
  /** Variable mapping applied AFTER a successful structured response. */
  mappings?: AIBlockVariableMapping[];
  /** When extract() is not used, store the raw answer in this variable. */
  outputVariable?: string;
  /** Optional Knowledge Base retrieval (Phase 13). */
  knowledge?: AIBlockKnowledgeConfig;
}

/* ---------------- Inspector records ---------------- */

export interface AIRunRecord {
  id: ID;
  at: ISODate;
  provider: AIProviderId;
  model: string;
  prompt: string;
  response: unknown;
  rawText: string;
  usage: AIUsage;
  durationMs: number;
  sessionId?: ID;
  blockId?: ID;
  flowId?: ID;
  ok: boolean;
  error?: string;
  schema?: AIOutputSchema;
}
