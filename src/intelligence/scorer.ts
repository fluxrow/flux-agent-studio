/**
 * Phase 18 — Configurable Lead Score Engine.
 *
 * Pure function: given a lead and optional context (events, tracking),
 * returns a deterministic LeadScore with reasoning trace.
 */
import type { Lead, LeadTemperature } from "@/types/lead";
import type {
  LeadScore,
  LeadScoreFactor,
  LeadScoreFactorKey,
} from "./types";
import { emitIntelligenceEvent } from "./events";

export interface ScoreWeights {
  completeness: number;
  source: number;
  campaign: number;
  interaction: number;
  answers: number;
  ai_classification: number;
  recency: number;
}

export const DEFAULT_WEIGHTS: ScoreWeights = {
  completeness: 0.15,
  source: 0.15,
  campaign: 0.10,
  interaction: 0.20,
  answers: 0.15,
  ai_classification: 0.15,
  recency: 0.10,
};

export interface ScoreContext {
  eventCount?: number;
  campaign?: string;
  aiClassificationConfidence?: number; // 0..1
  answersCompleted?: number;
  answersTotal?: number;
  lastInteractionAt?: string;
  weights?: Partial<ScoreWeights>;
}

const SOURCE_QUALITY: Record<string, number> = {
  "google-ads": 85,
  "meta-ads": 80,
  "instagram": 70,
  "organic": 65,
  "referral": 90,
  "public-bot": 60,
  "import": 30,
  "unknown": 40,
};

function clamp(n: number, lo = 0, hi = 100): number {
  return Math.max(lo, Math.min(hi, n));
}

function completenessScore(lead: Lead): number {
  let filled = 0;
  let total = 0;
  for (const k of ["name", "email", "phone", "company"] as const) {
    total += 1;
    if (lead[k]) filled += 1;
  }
  if (lead.tags && lead.tags.length > 0) { filled += 1; total += 1; } else { total += 1; }
  return Math.round((filled / total) * 100);
}

function sourceScore(lead: Lead): number {
  return SOURCE_QUALITY[lead.source] ?? 50;
}

function campaignScore(ctx: ScoreContext): number {
  if (!ctx.campaign) return 40;
  // Mock heuristic: longer campaign id == more mature = better
  return clamp(50 + ctx.campaign.length * 2);
}

function interactionScore(ctx: ScoreContext): number {
  const c = ctx.eventCount ?? 0;
  if (c === 0) return 10;
  return clamp(20 + c * 8);
}

function answersScore(ctx: ScoreContext): number {
  const a = ctx.answersCompleted ?? 0;
  const t = ctx.answersTotal ?? 0;
  if (t === 0) return 50;
  return Math.round((a / t) * 100);
}

function aiScore(ctx: ScoreContext): number {
  if (ctx.aiClassificationConfidence == null) return 50;
  return Math.round(ctx.aiClassificationConfidence * 100);
}

function recencyScore(ctx: ScoreContext, lead: Lead): number {
  const ts = ctx.lastInteractionAt ?? lead.lastActivityAt ?? lead.updatedAt;
  if (!ts) return 30;
  const ageH = (Date.now() - new Date(ts).getTime()) / (1000 * 60 * 60);
  if (ageH < 1) return 100;
  if (ageH < 24) return 80;
  if (ageH < 72) return 60;
  if (ageH < 24 * 14) return 40;
  return 20;
}

function temperatureFor(score: number): LeadTemperature {
  if (score >= 75) return "quente";
  if (score >= 45) return "morno";
  return "frio";
}

export function scoreLead(lead: Lead, ctx: ScoreContext = {}): LeadScore {
  const weights: ScoreWeights = { ...DEFAULT_WEIGHTS, ...(ctx.weights ?? {}) };

  const builders: Array<{
    key: LeadScoreFactorKey;
    label: string;
    value: number;
    reason: string;
  }> = [
    {
      key: "completeness",
      label: "Completude do perfil",
      value: completenessScore(lead),
      reason: "Campos preenchidos (nome, email, telefone, empresa, tags).",
    },
    {
      key: "source",
      label: "Qualidade da origem",
      value: sourceScore(lead),
      reason: `Origem '${lead.source}' tem qualidade histórica conhecida.`,
    },
    {
      key: "campaign",
      label: "Campanha",
      value: campaignScore(ctx),
      reason: ctx.campaign
        ? `Atribuído à campanha '${ctx.campaign}'.`
        : "Sem campanha atribuída.",
    },
    {
      key: "interaction",
      label: "Interação",
      value: interactionScore(ctx),
      reason: `${ctx.eventCount ?? 0} eventos registrados na execução.`,
    },
    {
      key: "answers",
      label: "Respostas no fluxo",
      value: answersScore(ctx),
      reason: ctx.answersTotal
        ? `${ctx.answersCompleted ?? 0}/${ctx.answersTotal} respostas obrigatórias.`
        : "Sem respostas obrigatórias mapeadas.",
    },
    {
      key: "ai_classification",
      label: "Classificação IA",
      value: aiScore(ctx),
      reason: ctx.aiClassificationConfidence != null
        ? `Confiança IA ${(ctx.aiClassificationConfidence * 100).toFixed(0)}%.`
        : "Sem classificação IA aplicada.",
    },
    {
      key: "recency",
      label: "Recência",
      value: recencyScore(ctx, lead),
      reason: "Quanto mais recente a última interação, mais quente o lead.",
    },
  ];

  const factors: LeadScoreFactor[] = builders.map((b) => ({
    key: b.key,
    label: b.label,
    value: b.value,
    weight: weights[b.key],
    reason: b.reason,
  }));

  const score = Math.round(
    clamp(factors.reduce((acc, f) => acc + f.value * f.weight, 0)),
  );

  const result: LeadScore = {
    leadId: lead.id,
    score,
    temperature: temperatureFor(score),
    factors,
    computedAt: new Date().toISOString(),
  };

  emitIntelligenceEvent("lead_scored", {
    leadId: lead.id,
    score,
    temperature: result.temperature,
  });

  return result;
}
