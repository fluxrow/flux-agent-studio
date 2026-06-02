/**
 * Phase 18 — Lead Insights generator.
 *
 * Builds high-signal observations about a lead based on tracking,
 * CRM stage and event activity.
 */
import type { Lead } from "@/types/lead";
import type { LeadInsight } from "./types";
import { emitIntelligenceEvent } from "./events";

export interface InsightsContext {
  channelTotals?: Record<string, number>;  // channel -> conversions
  campaignTotals?: Record<string, number>; // campaign -> conversions
  eventCount?: number;
  lastInteractionAt?: string;
}

let _id = 0;
const nextId = () => `ins_${Date.now()}_${++_id}`;

export function generateInsights(lead: Lead, ctx: InsightsContext = {}): LeadInsight[] {
  const now = new Date().toISOString();
  const insights: LeadInsight[] = [];

  const channelEntries = Object.entries(ctx.channelTotals ?? {});
  if (channelEntries.length > 0) {
    const best = channelEntries.sort((a, b) => b[1] - a[1])[0];
    insights.push({
      id: nextId(),
      leadId: lead.id,
      kind: "channel_efficiency",
      title: `Canal mais eficiente: ${best[0]}`,
      detail: `${best[0]} concentra ${best[1]} conversões no histórico do workspace.`,
      confidence: 0.7,
      generatedAt: now,
    });
  }

  const campaignEntries = Object.entries(ctx.campaignTotals ?? {});
  if (campaignEntries.length > 0) {
    const best = campaignEntries.sort((a, b) => b[1] - a[1])[0];
    insights.push({
      id: nextId(),
      leadId: lead.id,
      kind: "campaign_efficiency",
      title: `Campanha destaque: ${best[0]}`,
      detail: `Esta campanha originou ${best[1]} conversões similares.`,
      confidence: 0.65,
      generatedAt: now,
    });
  }

  const stageMap: Record<Lead["stage"], string> = {
    novo: "qualificado",
    qualificado: "negociacao",
    negociacao: "convertido",
    convertido: "convertido",
    perdido: "perdido",
  };
  insights.push({
    id: nextId(),
    leadId: lead.id,
    kind: "likely_stage",
    title: `Próximo estágio provável: ${stageMap[lead.stage]}`,
    detail: `Lead com temperatura ${lead.temperature} costuma evoluir para '${stageMap[lead.stage]}' em até 7 dias.`,
    confidence: lead.temperature === "quente" ? 0.8 : lead.temperature === "morno" ? 0.6 : 0.4,
    generatedAt: now,
  });

  const last = ctx.lastInteractionAt ?? lead.lastActivityAt ?? lead.updatedAt;
  if (last) {
    const ageDays = (Date.now() - new Date(last).getTime()) / (1000 * 60 * 60 * 24);
    if (ageDays > 3) {
      insights.push({
        id: nextId(),
        leadId: lead.id,
        kind: "abandon_risk",
        title: "Risco de abandono",
        detail: `Sem interação há ${Math.round(ageDays)} dias — recomenda-se reengajar.`,
        confidence: Math.min(0.9, 0.4 + ageDays / 30),
        generatedAt: now,
      });
    }
  }

  if ((ctx.eventCount ?? 0) >= 5) {
    insights.push({
      id: nextId(),
      leadId: lead.id,
      kind: "engagement_trend",
      title: "Engajamento crescente",
      detail: `${ctx.eventCount} eventos recentes indicam interesse ativo.`,
      confidence: 0.7,
      generatedAt: now,
    });
  }

  insights.forEach((i) =>
    emitIntelligenceEvent("lead_insight_generated", {
      leadId: lead.id,
      kind: i.kind,
    }),
  );

  return insights;
}
