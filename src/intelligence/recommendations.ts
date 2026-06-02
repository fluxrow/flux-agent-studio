/**
 * Phase 18 — Lead Recommendations.
 * Suggests next action, best time/channel and a message draft.
 */
import type { Lead } from "@/types/lead";
import type { LeadRecommendation, LeadScore, RecommendedChannel } from "./types";
import { emitIntelligenceEvent } from "./events";

export interface RecommendationContext {
  score?: LeadScore;
  preferredChannel?: RecommendedChannel;
  agentName?: string;
}

function pickChannel(lead: Lead, ctx: RecommendationContext): RecommendedChannel {
  if (ctx.preferredChannel) return ctx.preferredChannel;
  if (lead.phone) return "whatsapp";
  if (lead.email) return "email";
  return "instagram";
}

function pickTime(lead: Lead): string {
  if (lead.temperature === "quente") return "Nas próximas 2 horas";
  if (lead.temperature === "morno") return "Hoje entre 14h–18h";
  return "Amanhã entre 10h–12h";
}

function nextAction(lead: Lead, score?: LeadScore): string {
  if (lead.stage === "novo") return "Qualificar via mensagem rápida";
  if (lead.stage === "qualificado") return "Agendar reunião de descoberta";
  if (lead.stage === "negociacao") {
    return (score?.score ?? lead.score) > 70
      ? "Enviar proposta personalizada"
      : "Quebrar objeções e reforçar valor";
  }
  if (lead.stage === "convertido") return "Iniciar onboarding";
  return "Reengajar com nova oferta";
}

function draftMessage(lead: Lead, channel: RecommendedChannel, agent: string): string {
  const first = lead.name.split(" ")[0];
  if (channel === "whatsapp") {
    return `Oi ${first}! Aqui é ${agent}. Vi que você demonstrou interesse e quero entender melhor seu objetivo — posso te ligar em 10 min?`;
  }
  if (channel === "email") {
    return `Olá ${first}, sou ${agent}. Tenho ideias específicas para o seu cenário. Pode me responder com o melhor horário para uma call de 15 min?`;
  }
  return `Oi ${first}! Vi seu interesse e quero te ajudar. Quando podemos conversar?`;
}

export function generateRecommendation(
  lead: Lead,
  ctx: RecommendationContext = {},
): LeadRecommendation {
  const channel = pickChannel(lead, ctx);
  const agent = ctx.agentName ?? "FluxBot";
  const rec: LeadRecommendation = {
    id: `rec_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    leadId: lead.id,
    nextAction: nextAction(lead, ctx.score),
    bestTime: pickTime(lead),
    bestChannel: channel,
    suggestedMessage: draftMessage(lead, channel, agent),
    rationale: `Baseado em temperatura ${lead.temperature}, estágio ${lead.stage} e score ${ctx.score?.score ?? lead.score}.`,
    generatedAt: new Date().toISOString(),
  };

  emitIntelligenceEvent("lead_recommendation_generated", {
    leadId: lead.id,
    channel,
    action: rec.nextAction,
  });

  return rec;
}
