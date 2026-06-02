/**
 * Ingestion pipeline: parse → chunk → embed → persist. Each step updates
 * the document's status so the UI can show progress. Emits the events the
 * Tracking Engine listens to.
 */
import { parseDocument, type ParseInput } from "./parsers";
import { chunkText } from "./chunker";
import { knowledgeStore } from "./store";
import { knowledgeCost } from "./cost";
import { emitKnowledgeEvent } from "./events";
import { getEmbeddingProvider } from "./embeddings";
import type {
  KnowledgeBase, KnowledgeChunk, KnowledgeDocument, KnowledgeSourceKind,
} from "./types";
import type { ID } from "@/types/common";

function nid(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}
const iso = () => new Date().toISOString();

export interface IngestInput {
  base: KnowledgeBase;
  source: KnowledgeSourceKind;
  file?: File;
  content?: string;
  ref?: string;
  title?: string;
}

export async function ingestDocument(input: IngestInput): Promise<KnowledgeDocument> {
  const { base } = input;

  const docId = nid("doc");
  let doc: KnowledgeDocument = {
    id: docId,
    baseId: base.id,
    workspaceId: base.workspaceId,
    title: input.title ?? input.file?.name ?? input.ref ?? "Documento",
    source: input.source,
    ref: input.ref ?? input.file?.name,
    status: "parsing",
    text: "",
    chunkCount: 0,
    bytes: 0,
    createdAt: iso(),
    updatedAt: iso(),
  };
  knowledgeStore.upsertDocument(doc);
  emitKnowledgeEvent({
    type: "knowledge_uploaded",
    workspaceId: base.workspaceId, baseId: base.id,
    payload: { documentId: doc.id, source: doc.source, title: doc.title },
  });

  try {
    const parsed = await parseDocument({
      source: input.source, file: input.file, content: input.content, ref: input.ref,
    } as ParseInput);
    doc = { ...doc, status: "chunking", text: parsed.text, bytes: parsed.bytes, title: input.title ?? parsed.title, updatedAt: iso() };
    knowledgeStore.upsertDocument(doc);

    const pieces = chunkText(parsed.text, base.chunking);
    doc = { ...doc, status: "embedding", chunkCount: pieces.length, updatedAt: iso() };
    knowledgeStore.upsertDocument(doc);

    const provider = getEmbeddingProvider(base.embeddingProvider);
    const embed = await provider.embed({ texts: pieces, model: base.embeddingModel });

    knowledgeCost.record({
      id: nid("usg"),
      workspaceId: base.workspaceId, baseId: base.id,
      at: iso(),
      kind: "embed",
      provider: provider.id,
      model: embed.model,
      inputTokens: embed.inputTokens,
      estimatedCost: embed.estimatedCost,
      meta: { documentId: doc.id, chunks: pieces.length },
    });

    const chunks: KnowledgeChunk[] = pieces.map((text, idx) => ({
      id: nid("chk"),
      baseId: base.id,
      documentId: doc.id,
      workspaceId: base.workspaceId,
      index: idx,
      text,
      embedding: embed.vectors[idx] ?? [],
      createdAt: iso(),
    }));
    knowledgeStore.replaceChunksForDocument(doc.id, chunks);

    doc = { ...doc, status: "ready", chunkCount: chunks.length, updatedAt: iso() };
    knowledgeStore.upsertDocument(doc);

    emitKnowledgeEvent({
      type: "knowledge_indexed",
      workspaceId: base.workspaceId, baseId: base.id,
      payload: {
        documentId: doc.id,
        chunks: chunks.length,
        provider: provider.id,
        model: embed.model,
        tokens: embed.inputTokens,
      },
    });

    return doc;
  } catch (err: any) {
    doc = { ...doc, status: "error", error: err?.message ?? "Falha desconhecida", updatedAt: iso() };
    knowledgeStore.upsertDocument(doc);
    return doc;
  }
}

export function createKnowledgeBase(input: {
  workspaceId: ID;
  name: string;
  description?: string;
}): KnowledgeBase {
  const base: KnowledgeBase = {
    id: nid("kb"),
    workspaceId: input.workspaceId,
    name: input.name,
    description: input.description,
    embeddingProvider: "mock",
    embeddingModel: "mock-small",
    chunking: { strategy: "paragraph", chunkSize: 800, chunkOverlap: 100 },
    createdAt: iso(),
    updatedAt: iso(),
  };
  knowledgeStore.upsertBase(base);
  return base;
}
