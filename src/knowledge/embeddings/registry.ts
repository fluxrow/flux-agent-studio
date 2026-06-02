/**
 * Embedding providers registry. Only the mock provider is wired today;
 * OpenAI and Gemini are declared as stubs so the UI/AI block can already
 * surface them. Swap the body of `embed` with a real Lovable AI Gateway
 * call when ready.
 */
import type { EmbeddingProviderId } from "../types";
import type { EmbeddingProvider } from "./types";
import { mockEmbeddingProvider } from "./mock";

function notWired(id: EmbeddingProviderId, label: string, defaultModel: string, dims: number, costPer1k: number): EmbeddingProvider {
  return {
    id,
    label,
    description: `${label} (stub — conectar ao Lovable AI Gateway na próxima fase).`,
    models: [{ id: defaultModel, label: defaultModel, dimensions: dims, costPer1k }],
    defaultModel,
    async embed() {
      throw new Error(`Embedding provider "${id}" ainda não está configurado.`);
    },
  };
}

const openaiEmbeddingProvider = notWired("openai", "OpenAI Embeddings", "text-embedding-3-small", 1536, 0.00002);
const geminiEmbeddingProvider = notWired("gemini", "Gemini Embeddings", "gemini-embedding-001", 3072, 0.00001);

const registry: Record<EmbeddingProviderId, EmbeddingProvider> = {
  mock: mockEmbeddingProvider,
  openai: openaiEmbeddingProvider,
  gemini: geminiEmbeddingProvider,
};

export function getEmbeddingProvider(id: EmbeddingProviderId): EmbeddingProvider {
  return registry[id] ?? mockEmbeddingProvider;
}
export function listEmbeddingProviders(): EmbeddingProvider[] {
  return Object.values(registry);
}
export const DEFAULT_EMBEDDING_PROVIDER: EmbeddingProviderId = "mock";
