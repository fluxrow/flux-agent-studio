/**
 * Knowledge Base domain — Phase 13.
 *
 * Pure data contracts shared by the upload pipeline, chunker, embedding
 * providers, retriever and the AI Block integration. The Runtime Engine
 * never imports from here — only the AI runner does, so the knowledge
 * layer stays fully decoupled.
 */
import type { ID, ISODate } from "@/types/common";

export type KnowledgeSourceKind = "pdf" | "docx" | "txt" | "url" | "text";

export type KnowledgeDocumentStatus =
  | "uploaded"
  | "parsing"
  | "chunking"
  | "embedding"
  | "ready"
  | "error";

export type ChunkingStrategy = "fixed" | "paragraph" | "semantic";

export type EmbeddingProviderId = "mock" | "openai" | "gemini";

export interface KnowledgeBase {
  id: ID;
  workspaceId: ID;
  name: string;
  description?: string;
  embeddingProvider: EmbeddingProviderId;
  embeddingModel: string;
  chunking: {
    strategy: ChunkingStrategy;
    /** Chars per chunk (used by `fixed`, soft target for others). */
    chunkSize: number;
    chunkOverlap: number;
  };
  createdAt: ISODate;
  updatedAt: ISODate;
}

export interface KnowledgeDocument {
  id: ID;
  baseId: ID;
  workspaceId: ID;
  title: string;
  source: KnowledgeSourceKind;
  /** Filename or URL — purely informational. */
  ref?: string;
  status: KnowledgeDocumentStatus;
  /** Raw extracted text (truncated for the mock store). */
  text: string;
  chunkCount: number;
  bytes: number;
  error?: string;
  createdAt: ISODate;
  updatedAt: ISODate;
}

export interface KnowledgeChunk {
  id: ID;
  baseId: ID;
  documentId: ID;
  workspaceId: ID;
  index: number;
  text: string;
  /** Dense vector produced by the embedding provider. */
  embedding: number[];
  /** Free-form metadata captured at chunk time. */
  metadata?: Record<string, unknown>;
  createdAt: ISODate;
}

export interface KnowledgeSearchResult {
  chunk: KnowledgeChunk;
  document: Pick<KnowledgeDocument, "id" | "title" | "source" | "ref">;
  /** Cosine similarity in [-1, 1]. */
  score: number;
}

export interface KnowledgeUsageRecord {
  id: ID;
  workspaceId: ID;
  baseId?: ID;
  at: ISODate;
  kind: "embed" | "search";
  provider: EmbeddingProviderId;
  model: string;
  inputTokens: number;
  estimatedCost: number;
  meta?: Record<string, unknown>;
}
