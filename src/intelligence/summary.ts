/**
 * Phase 18 — Lead Summary generator.
 *
 * Default implementation is a deterministic heuristic so the UI works
 * without external API keys. The signature matches AI providers so a
 * future adapter can swap in (see `AISummaryProvider`).
 */
import type { Lead } from "@/types/lead";
import type { LeadSummary } from "./types";
import { emitIntelligenceEvent } from "./events";

export interface SummaryContext {
  variables?: Record<string, unknown>;
  knowledgeHits?: Array<{ title: string; snippet: string }>;
  provider?: string;
}

export interface AISummaryProvider {
  id: string;
  generate(lead: Lead, ctx: SummaryContext): Promise<LeadSummary>;
}

function pickVar(vars: Record<string, unknown> | undefined, keys: string[]): string | undefined {
  if (!vars) return undefined;
  for (const k of keys) {
    const v = vars[k];
    if (typeof v === "string" && v.trim().length > 0) return v.trim();
  }
  return undefined;
}

function detectUrgency(lead: Lead, vars?: Record<string, unknown>): LeadSummary["urgency"] {
  const tf = pickVar(vars, ["timeframe", "prazo"])?.toLowerCase() ?? "";
  if (/hoje|agora|urgente|imediato|24h/.test(tf)) return "high";
  if (/semana|7 dias|próximos? dias/.test(tf)) return "medium";
  if (lead.temperature === "quente") return "high";
  if (lead.temperature === "morno") return "medium";
  return "low";
}

export function generateSummary(lead: Lead, ctx: SummaryContext = {}): LeadSummary {
  const vars = ctx.variables;
  const mainInterest = pickVar(vars, ["interest", "interesse", "produto", "product"])
    ?? lead.tags?.[0];
  const goal = pickVar(vars, ["goal", "objetivo"]);
  const budget = pickVar(vars, ["budget", "orcamento", "orçamento"]);
  const timeframe = pickVar(vars, ["timeframe", "prazo"]);
  const objectionsRaw = pickVar(vars, ["objection", "objecao", "objeção"]);
  const objections = objectionsRaw ? [objectionsRaw] : [];

  const narrative = [
    `${lead.name} chegou via ${lead.source}.`,
    mainInterest ? `Interesse principal: ${mainInterest}.` : "Interesse principal não informado.",
    goal ? `Objetivo: ${goal}.` : null,
    budget ? `Orçamento: ${budget}.` : null,
    timeframe ? `Prazo: ${timeframe}.` : null,
    `Estágio atual: ${lead.stage}, temperatura ${lead.temperature}.`,
  ].filter(Boolean).join(" ");

  const summary: LeadSummary = {
    leadId: lead.id,
    mainInterest,
    goal,
    budget,
    timeframe,
    objections,
    urgency: detectUrgency(lead, vars),
    narrative,
    generatedAt: new Date().toISOString(),
    provider: ctx.provider ?? "mock",
  };

  emitIntelligenceEvent("lead_summary_generated", {
    leadId: lead.id,
    provider: summary.provider,
  });

  return summary;
}

/** Build a prompt that AI providers (Phase 12) can consume. */
export function buildSummaryPrompt(lead: Lead, ctx: SummaryContext = {}): string {
  const lines = [
    "Resuma o lead a seguir em PT-BR em 4 linhas, incluindo:",
    "- Interesse principal",
    "- Objetivo",
    "- Orçamento",
    "- Prazo / urgência / objeções",
    "",
    `Nome: ${lead.name}`,
    `Origem: ${lead.source}`,
    `Estágio: ${lead.stage}`,
    `Tags: ${(lead.tags ?? []).join(", ") || "—"}`,
    ctx.variables ? `Variáveis: ${JSON.stringify(ctx.variables)}` : "",
    ctx.knowledgeHits?.length
      ? `Conhecimento: ${ctx.knowledgeHits.map((h) => h.title).join(", ")}`
      : "",
  ];
  return lines.filter(Boolean).join("\n");
}
