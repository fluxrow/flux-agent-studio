/**
 * Deterministic mock embedding provider. Produces a small dense vector
 * driven by character n-grams so that semantically similar strings yield
 * vectors with meaningful cosine similarity — enough to exercise the
 * retriever and inspect ranking behaviour.
 */
import type { EmbeddingProvider, EmbeddingResult } from "./types";

const DIMS = 64;

function tokenize(text: string): string[] {
  return (text.toLowerCase().match(/[a-z0-9áéíóúãõâêôç]{2,}/giu) ?? []).slice(0, 400);
}

function hash(token: string, seed: number): number {
  let h = seed;
  for (let i = 0; i < token.length; i++) {
    h = (h * 31 + token.charCodeAt(i)) >>> 0;
  }
  return h;
}

function vectorize(text: string, dims = DIMS): number[] {
  const vec = new Array<number>(dims).fill(0);
  const toks = tokenize(text);
  for (const tok of toks) {
    for (let s = 0; s < 3; s++) {
      const idx = hash(tok, s + 7) % dims;
      const sign = (hash(tok, s + 13) & 1) === 0 ? 1 : -1;
      vec[idx] += sign;
    }
  }
  let norm = 0;
  for (const v of vec) norm += v * v;
  norm = Math.sqrt(norm) || 1;
  for (let i = 0; i < dims; i++) vec[i] = vec[i] / norm;
  return vec;
}

function tokensCount(text: string) {
  return Math.max(1, Math.round(text.length / 4));
}

export const mockEmbeddingProvider: EmbeddingProvider = {
  id: "mock",
  label: "Mock embeddings",
  description: "Hash-based vetores determinísticos para desenvolvimento offline.",
  models: [{ id: "mock-small", label: "Mock Small (64d)", dimensions: DIMS, costPer1k: 0 }],
  defaultModel: "mock-small",
  async embed({ texts }): Promise<EmbeddingResult> {
    const t0 = performance.now();
    await new Promise((r) => setTimeout(r, 60 + Math.random() * 80));
    const vectors = texts.map((t) => vectorize(t));
    const inputTokens = texts.reduce((acc, t) => acc + tokensCount(t), 0);
    return {
      provider: "mock",
      model: "mock-small",
      vectors,
      inputTokens,
      estimatedCost: 0,
      durationMs: Math.round(performance.now() - t0),
    };
  },
};
