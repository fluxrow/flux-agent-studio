/**
 * Parsing pipeline stubs. Each parser turns a raw upload into plain text
 * the chunker can ingest. Phase 13 ships mocks — Supabase Storage + real
 * PDF/DOCX extraction land in a later phase.
 */
import type { KnowledgeSourceKind } from "./types";

export interface ParseInput {
  source: KnowledgeSourceKind;
  /** File when source is pdf/docx/txt. Optional for url/text. */
  file?: File;
  /** Used for url/text sources. */
  content?: string;
  ref?: string;
}

export interface ParseOutput {
  text: string;
  bytes: number;
  title: string;
}

async function readTextFile(file: File): Promise<string> {
  return await file.text();
}

function summarizeBinaryFile(file: File, kind: string): string {
  // Mock extraction — produces representative text so the rest of the
  // pipeline (chunking, embedding, retrieval) can be exercised.
  return [
    `[${kind.toUpperCase()} mock extraction] ${file.name}`,
    "",
    "Este é um conteúdo simulado gerado pelo parser stub do FluxBot.",
    "Quando conectarmos a extração real, este texto será substituído pelo",
    "conteúdo completo do arquivo enviado.",
    "",
    `Tamanho original: ${file.size} bytes.`,
  ].join("\n");
}

export async function parseDocument(input: ParseInput): Promise<ParseOutput> {
  switch (input.source) {
    case "txt": {
      const file = input.file!;
      const text = await readTextFile(file);
      return { text, bytes: file.size, title: file.name };
    }
    case "pdf":
    case "docx": {
      const file = input.file!;
      return {
        text: summarizeBinaryFile(file, input.source),
        bytes: file.size,
        title: file.name,
      };
    }
    case "url": {
      const url = input.ref ?? input.content ?? "";
      const text = [
        `[URL mock fetch] ${url}`,
        "",
        "Conteúdo simulado da página. O fetcher real respeitará robots.txt,",
        "extrairá apenas o corpo principal e ignorará navegação/rodapé.",
      ].join("\n");
      return { text, bytes: text.length, title: url || "URL" };
    }
    case "text":
    default: {
      const text = (input.content ?? "").trim();
      return { text, bytes: text.length, title: input.ref ?? "Texto colado" };
    }
  }
}
