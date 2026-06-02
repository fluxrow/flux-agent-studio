/**
 * Configurable chunker. Strategies are pluggable so the embedding pipeline
 * can swap them without changing call sites. The `semantic` strategy is a
 * stub that falls back to paragraph splitting until we wire a real
 * sentence-boundary model.
 */
import type { ChunkingStrategy } from "./types";

export interface ChunkOptions {
  strategy: ChunkingStrategy;
  chunkSize: number;
  chunkOverlap: number;
}

function fixedChunks(text: string, size: number, overlap: number): string[] {
  if (size <= 0) return [text];
  const step = Math.max(1, size - overlap);
  const out: string[] = [];
  for (let i = 0; i < text.length; i += step) {
    const slice = text.slice(i, i + size).trim();
    if (slice) out.push(slice);
    if (i + size >= text.length) break;
  }
  return out;
}

function paragraphChunks(text: string, size: number): string[] {
  const paragraphs = text
    .split(/\n\s*\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
  const out: string[] = [];
  let buffer = "";
  for (const para of paragraphs) {
    if ((buffer + "\n\n" + para).length > size && buffer) {
      out.push(buffer.trim());
      buffer = para;
    } else {
      buffer = buffer ? `${buffer}\n\n${para}` : para;
    }
  }
  if (buffer.trim()) out.push(buffer.trim());
  return out;
}

export function chunkText(text: string, opts: ChunkOptions): string[] {
  const clean = (text ?? "").replace(/\r\n/g, "\n").trim();
  if (!clean) return [];
  switch (opts.strategy) {
    case "fixed":
      return fixedChunks(clean, opts.chunkSize, opts.chunkOverlap);
    case "paragraph":
      return paragraphChunks(clean, opts.chunkSize);
    case "semantic":
      // Stub: paragraph splitter for now; the future semantic chunker
      // will use sentence boundaries + embedding similarity to merge.
      return paragraphChunks(clean, opts.chunkSize);
    default:
      return fixedChunks(clean, opts.chunkSize, opts.chunkOverlap);
  }
}
