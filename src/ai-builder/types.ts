/**
 * AI Builder Engine — Phase 14
 *
 * Domain models for the natural-language → bot generation pipeline.
 * Blueprints are intermediate representations that are converted into
 * Runtime-compatible Flows, CRM seeds, and Knowledge suggestions.
 *
 * The pipeline is:
 *
 *   prompt  →  BotBlueprint  →  { Flow, CRM seed, Knowledge hints }
 *
 * The Runtime / Builder / CRM / AI Block layers are not touched.
 */
import type { BlockType } from "@/types";

export type AIBuilderObjective =
  | "qualificar_leads"
  | "agendar_reuniao"
  | "atendimento"
  | "vendas"
  | "suporte"
  | "outro";

export interface AIBuilderPromptInput {
  /** Free-form description from the user. */
  description: string;
  /** Optional structured hints. */
  segment?: string;
  product?: string;
  process?: string;
  objective?: AIBuilderObjective;
}

/* ---------------- Flow Blueprint ---------------- */

export interface FlowBlueprintStep {
  /** Logical step id (slugged). */
  id: string;
  /** Block type to materialize. */
  type: BlockType;
  label: string;
  /** Free-form text/prompt for the user. */
  text?: string;
  /** Variable name when applicable (input/choice). */
  variable?: string;
  options?: string[];
  /** AI block prompt. */
  aiPrompt?: string;
  /** AI block output variable. */
  aiOutputVariable?: string;
}

export interface FlowBlueprint {
  name: string;
  description: string;
  steps: FlowBlueprintStep[];
}

/* ---------------- Variables / Lead model ---------------- */

export interface LeadFieldBlueprint {
  key: string;
  label: string;
  type: "string" | "number" | "boolean";
  source: "input" | "ai" | "computed";
}

export interface LeadModelBlueprint {
  fields: LeadFieldBlueprint[];
  tags: string[];
  initialScore: number;
  pipeline: Array<{ id: string; label: string }>;
}

/* ---------------- Knowledge suggestions ---------------- */

export interface KnowledgeBlueprint {
  suggestedDocuments: Array<{
    title: string;
    kind: "pdf" | "faq" | "url" | "doc";
    reason: string;
  }>;
}

/* ---------------- Conversation defaults ---------------- */

export interface ConversationBlueprint {
  tone: "amigavel" | "profissional" | "consultivo";
  greeting: string;
  fallback: string;
}

/* ---------------- Top-level Bot Blueprint ---------------- */

export interface BotBlueprint {
  /** Generated bot identity. */
  bot: {
    name: string;
    description: string;
    channel: string;
    objective: AIBuilderObjective;
  };
  flow: FlowBlueprint;
  leadModel: LeadModelBlueprint;
  knowledge: KnowledgeBlueprint;
  conversation: ConversationBlueprint;
  /** Provenance information for cost tracking. */
  meta: {
    provider: string;
    model: string;
    durationMs: number;
    inputTokens: number;
    outputTokens: number;
    estimatedCost: number;
    promptHash: string;
    generatedAt: string;
  };
}
