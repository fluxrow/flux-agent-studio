/**
 * KnowledgeRetriever — cosine-similarity search over a workspace's
 * knowledge base. Embeds the query through the same provider used by the
 * base and emits `knowledge_retrieved` so Tracking can observe usage.
 */
import { knowledgeStore } from "./store";
import { getEmbeddingProvider } from "./embeddings";
import { knowledgeCost } from "./cost";
import { emitKnowledgeEvent } from "./events";
import type { KnowledgeBase, KnowledgeSearchResult } from "./types";

function cosine(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom === 0 ? 0 : dot / denom;
}

export interface RetrieveInput {
  baseId: string;
  query: string;
  topK?: number;
  minScore?: number;
  sessionId?: string;
  flowId?: string;
  blockId?: string;
}

export async function retrieveKnowledge(input: RetrieveInput): Promise<KnowledgeSearchResult[]> {
  const base: KnowledgeBase | undefined = knowledgeStore.getBase(input.baseId);
  if (!base) return [];

  const provider = getEmbeddingProvider(base.embeddingProvider);
  const embed = await provider.embed({ texts: [input.query], model: base.embeddingModel });
  const queryVec = embed.vectors[0];

  knowledgeCost.record({
    id: `usg_${Date.now().toString(36)}`,
    workspaceId: base.workspaceId,
    baseId: base.id,
    at: new Date().toISOString(),
    kind: "search",
    provider: provider.id,
    model: embed.model,
    inputTokens: embed.inputTokens,
    estimatedCost: embed.estimatedCost,
  });

  const chunks = knowledgeStore.listChunks(base.id);
  const docs = new Map(
    knowledgeStore
      .listDocuments(base.id)
      .map((d) => [d.id, { id: d.id, title: d.title, source: d.source, ref: d.ref }]),
  );

  const scored = chunks
    .map((c) => ({ chunk: c, score: cosine(queryVec, c.embedding) }))
    .filter((r) => r.score >= (input.minScore ?? -1))
    .sort((a, b) => b.score - a.score)
    .slice(0, input.topK ?? 4)
    .map<KnowledgeSearchResult>((r) => ({
      chunk: r.chunk,
      score: r.score,
      document: docs.get(r.chunk.documentId) ?? {
        id: r.chunk.documentId, title: "Documento", source: "text",
      },
    }));

  emitKnowledgeEvent({
    type: "knowledge_retrieved",
    workspaceId: base.workspaceId,
    baseId: base.id,
    sessionId: input.sessionId,
    flowId: input.flowId,
    blockId: input.blockId,
    payload: {
      query: input.query,
      results: scored.length,
      topScore: scored[0]?.score ?? 0,
    },
  });

  return scored;
}

/** Format chunks as a single context block for prompt injection. */
export function formatContext(results: KnowledgeSearchResult[]): string {
  if (!results.length) return "";
  return results
    .map((r, i) => `[#${i + 1} · ${r.document.title} · score=${r.score.toFixed(3)}]\n${r.chunk.text}`)
    .join("\n\n---\n\n");
}
