import type { Lead } from "@/types/lead";
import type { LeadForecast, LeadScore } from "./types";
import { emitIntelligenceEvent } from "./events";

export interface ForecastContext {
  score?: LeadScore;
  averageTicket?: number;
}

export function forecastLead(lead: Lead, ctx: ForecastContext = {}): LeadForecast {
  const score = ctx.score?.score ?? lead.score;
  const baseProb = Math.min(0.95, Math.max(0.02, score / 110));
  const ticket = ctx.averageTicket ?? 2500;
  const days = score > 75 ? 5 : score > 50 ? 14 : 30;
  const expectedCloseAt = new Date(Date.now() + days * 86400000).toISOString();
  const forecast: LeadForecast = {
    leadId: lead.id,
    conversionProbability: Number(baseProb.toFixed(2)),
    expectedRevenue: Math.round(baseProb * ticket),
    expectedCloseAt,
    confidence: score > 60 ? 0.7 : 0.45,
  };
  emitIntelligenceEvent("lead_forecast_generated", { leadId: lead.id });
  return forecast;
}
