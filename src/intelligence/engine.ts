/**
 * Phase 18 — Aggregator that returns the full LeadIntelligence bundle.
 *
 * All inputs are optional context; with zero context the engine still
 * produces useful deterministic output from the Lead alone, ensuring the
 * UI always has something to render.
 */
import type { Lead } from "@/types/lead";
import type { LeadIntelligence } from "./types";
import { scoreLead, type ScoreContext } from "./scorer";
import { generateSummary, type SummaryContext } from "./summary";
import { generateInsights, type InsightsContext } from "./insights";
import { generateRecommendation, type RecommendationContext } from "./recommendations";
import { forecastLead } from "./forecast";

export interface IntelligenceContext {
  score?: ScoreContext;
  summary?: SummaryContext;
  insights?: InsightsContext;
  recommendation?: RecommendationContext;
  averageTicket?: number;
}

export function computeLeadIntelligence(
  lead: Lead,
  ctx: IntelligenceContext = {},
): LeadIntelligence {
  const score = scoreLead(lead, ctx.score);
  const summary = generateSummary(lead, ctx.summary);
  const insights = generateInsights(lead, ctx.insights);
  const recommendation = generateRecommendation(lead, {
    ...(ctx.recommendation ?? {}),
    score,
  });
  const forecast = forecastLead(lead, {
    score,
    averageTicket: ctx.averageTicket,
  });
  return { score, summary, insights, recommendation, forecast };
}
