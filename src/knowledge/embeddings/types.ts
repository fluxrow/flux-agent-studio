import type { EmbeddingProviderId } from "../types";

export interface EmbeddingModelInfo {
  id: string;
  label: string;
  dimensions: number;
  /** USD per 1K input tokens (mock prices for now). */
  costPer1k: number;
}

export interface EmbeddingResult {
  provider: EmbeddingProviderId;
  model: string;
  vectors: number[][];
  inputTokens: number;
  estimatedCost: number;
  durationMs: number;
}

export interface EmbeddingProvider {
  id: EmbeddingProviderId;
  label: string;
  description: string;
  models: EmbeddingModelInfo[];
  defaultModel: string;
  embed(input: { texts: string[]; model?: string }): Promise<EmbeddingResult>;
}
