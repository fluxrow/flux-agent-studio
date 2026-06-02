/**
 * Workspace-isolated Knowledge store. Persists bases, documents and chunks
 * in localStorage keyed by workspaceId. Designed to be swapped for
 * Supabase + pgvector in a later phase without touching the retriever or
 * the AI block integration.
 */
import type {
  KnowledgeBase, KnowledgeChunk, KnowledgeDocument,
} from "./types";
import type { ID } from "@/types/common";

const KEY_BASES = "fluxbot.knowledge.bases.v1";
const KEY_DOCS = "fluxbot.knowledge.docs.v1";
const KEY_CHUNKS = "fluxbot.knowledge.chunks.v1";

type Listener = () => void;
const listeners = new Set<Listener>();
const notify = () => listeners.forEach((l) => { try { l(); } catch {} });

function read<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch { return []; }
}
function write<T>(key: string, items: T[]) {
  try { localStorage.setItem(key, JSON.stringify(items)); } catch {}
}

export const knowledgeStore = {
  /* ---- Bases ---- */
  listBases(workspaceId: ID): KnowledgeBase[] {
    return read<KnowledgeBase>(KEY_BASES).filter((b) => b.workspaceId === workspaceId);
  },
  getBase(id: ID): KnowledgeBase | undefined {
    return read<KnowledgeBase>(KEY_BASES).find((b) => b.id === id);
  },
  upsertBase(base: KnowledgeBase) {
    const all = read<KnowledgeBase>(KEY_BASES);
    const idx = all.findIndex((b) => b.id === base.id);
    if (idx >= 0) all[idx] = base; else all.push(base);
    write(KEY_BASES, all);
    notify();
  },
  deleteBase(id: ID) {
    write(KEY_BASES, read<KnowledgeBase>(KEY_BASES).filter((b) => b.id !== id));
    write(KEY_DOCS, read<KnowledgeDocument>(KEY_DOCS).filter((d) => d.baseId !== id));
    write(KEY_CHUNKS, read<KnowledgeChunk>(KEY_CHUNKS).filter((c) => c.baseId !== id));
    notify();
  },

  /* ---- Documents ---- */
  listDocuments(baseId: ID): KnowledgeDocument[] {
    return read<KnowledgeDocument>(KEY_DOCS).filter((d) => d.baseId === baseId);
  },
  upsertDocument(doc: KnowledgeDocument) {
    const all = read<KnowledgeDocument>(KEY_DOCS);
    const idx = all.findIndex((d) => d.id === doc.id);
    if (idx >= 0) all[idx] = doc; else all.push(doc);
    write(KEY_DOCS, all);
    notify();
  },
  deleteDocument(id: ID) {
    write(KEY_DOCS, read<KnowledgeDocument>(KEY_DOCS).filter((d) => d.id !== id));
    write(KEY_CHUNKS, read<KnowledgeChunk>(KEY_CHUNKS).filter((c) => c.documentId !== id));
    notify();
  },

  /* ---- Chunks ---- */
  listChunks(baseId: ID): KnowledgeChunk[] {
    return read<KnowledgeChunk>(KEY_CHUNKS).filter((c) => c.baseId === baseId);
  },
  listChunksByDocument(documentId: ID): KnowledgeChunk[] {
    return read<KnowledgeChunk>(KEY_CHUNKS).filter((c) => c.documentId === documentId);
  },
  replaceChunksForDocument(documentId: ID, chunks: KnowledgeChunk[]) {
    const others = read<KnowledgeChunk>(KEY_CHUNKS).filter((c) => c.documentId !== documentId);
    write(KEY_CHUNKS, [...others, ...chunks]);
    notify();
  },

  subscribe(l: Listener) { listeners.add(l); return () => listeners.delete(l); },
  clearAll() {
    write(KEY_BASES, []); write(KEY_DOCS, []); write(KEY_CHUNKS, []);
    notify();
  },
};
