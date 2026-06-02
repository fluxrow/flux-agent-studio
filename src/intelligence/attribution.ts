/**
 * Phase 18 — Revenue Attribution.
 * Uses Tracking + CRM data to relate Origin / Campaign / Lead / Revenue.
 */
import type { Lead } from "@/types/lead";
import type { RevenueAttributionRow } from "./types";

export interface AttributionInput {
  lead: Lead;
  campaign?: string;
  revenue?: number;
  convertedAt?: string;
}

export function buildAttributionRow(input: AttributionInput): RevenueAttributionRow {
  const converted = input.lead.stage === "convertido";
  return {
    source: input.lead.source,
    campaign: input.campaign,
    leadId: input.lead.id,
    leadName: input.lead.name,
    converted,
    revenue: converted ? (input.revenue ?? 0) : 0,
    attributedAt: input.convertedAt ?? input.lead.updatedAt ?? new Date().toISOString(),
  };
}

export interface AttributionSummary {
  totalRevenue: number;
  byCampaign: Array<{ campaign: string; revenue: number; leads: number }>;
  bySource: Array<{ source: string; revenue: number; leads: number }>;
}

export function summarizeAttribution(rows: RevenueAttributionRow[]): AttributionSummary {
  const campaignMap = new Map<string, { revenue: number; leads: number }>();
  const sourceMap = new Map<string, { revenue: number; leads: number }>();
  let total = 0;
  for (const r of rows) {
    total += r.revenue;
    if (r.campaign) {
      const c = campaignMap.get(r.campaign) ?? { revenue: 0, leads: 0 };
      c.revenue += r.revenue;
      c.leads += 1;
      campaignMap.set(r.campaign, c);
    }
    const s = sourceMap.get(r.source) ?? { revenue: 0, leads: 0 };
    s.revenue += r.revenue;
    s.leads += 1;
    sourceMap.set(r.source, s);
  }
  return {
    totalRevenue: total,
    byCampaign: Array.from(campaignMap.entries())
      .map(([campaign, v]) => ({ campaign, ...v }))
      .sort((a, b) => b.revenue - a.revenue),
    bySource: Array.from(sourceMap.entries())
      .map(([source, v]) => ({ source, ...v }))
      .sort((a, b) => b.revenue - a.revenue),
  };
}
