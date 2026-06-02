/**
 * Phase 18 — Lead Intelligence Engine
 * Domain types. Pure data, no runtime dependencies.
 */
import type { ID, ISODate } from "@/types/common";
import type { Lead } from "@/types/lead";

export type LeadScoreFactorKey =
  | "completeness"
  | "source"
  | "campaign"
  | "interaction"
  | "answers"
  | "ai_classification"
  | "recency";

export interface LeadScoreFactor {
  key: LeadScoreFactorKey;
  label: string;
  weight: number;  // 0..1
  value: number;   // 0..100 (raw contribution before weighting)
  reason: string;
}

export interface LeadScore {
  leadId: ID;
  score: number; // 0..100
  temperature: Lead["temperature"];
  factors: LeadScoreFactor[];
  computedAt: ISODate;
}

export interface LeadSummary {
  leadId: ID;
  mainInterest?: string;
  goal?: string;
  budget?: string;
  timeframe?: string;
  objections: string[];
  urgency: "low" | "medium" | "high";
  narrative: string;
  generatedAt: ISODate;
  provider: string; // "mock" | "openai" | ...
}

export type LeadInsightKind =
  | "channel_efficiency"
  | "campaign_efficiency"
  | "likely_stage"
  | "abandon_risk"
  | "engagement_trend";

export interface LeadInsight {
  id: ID;
  leadId: ID;
  kind: LeadInsightKind;
  title: string;
  detail: string;
  confidence: number; // 0..1
  generatedAt: ISODate;
}

export type RecommendedChannel = "whatsapp" | "email" | "call" | "instagram" | "sms";

export interface LeadRecommendation {
  id: ID;
  leadId: ID;
  nextAction: string;
  bestTime: string;      // e.g. "Hoje 14h–16h"
  bestChannel: RecommendedChannel;
  suggestedMessage: string;
  rationale: string;
  generatedAt: ISODate;
}

export interface LeadForecast {
  leadId: ID;
  conversionProbability: number; // 0..1
  expectedRevenue: number;
  expectedCloseAt?: ISODate;
  confidence: number;
}

export interface RevenueAttributionRow {
  source: string;
  campaign?: string;
  leadId: ID;
  leadName: string;
  converted: boolean;
  revenue: number;
  attributedAt: ISODate;
}

export interface LeadIntelligence {
  score: LeadScore;
  summary?: LeadSummary;
  insights: LeadInsight[];
  recommendation?: LeadRecommendation;
  forecast?: LeadForecast;
}
