/**
 * @deprecated Use `@/domain` repositories or `@/mocks` fixtures directly.
 * This file remains only as a compatibility shim for legacy imports while
 * pages are progressively migrated to the repository layer.
 */
import { mockBots, mockLeads, mockStages, mockConversations, mockTemplates } from "@/mocks";
import type { Bot as BotT, Lead as LeadT, Conversation as ConvT } from "@/types";

// Re-shape new domain models into the flat shape legacy pages expect.
export type Bot = {
  id: string; name: string; description: string;
  status: BotT["status"]; channel: string; created: string;
  conversations: number; conversions: number;
};
export const bots: Bot[] = mockBots.map((b) => ({
  id: b.id, name: b.name, description: b.description,
  status: b.status, channel: b.channel,
  created: new Date(b.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }),
  conversations: b.metrics.conversations, conversions: b.metrics.conversions,
}));

export type Lead = {
  id: string; name: string; email: string; phone: string;
  source: string; stage: LeadT["stage"]; score: number;
  temperature: LeadT["temperature"]; bot: string;
};
export const leads: Lead[] = mockLeads.map((l) => ({
  id: l.id, name: l.name, email: l.email ?? "", phone: l.phone ?? "",
  source: l.source, stage: l.stage, score: l.score,
  temperature: l.temperature, bot: l.botName ?? "",
}));

export const stages = mockStages;

export type Conversation = {
  id: string; lead: string; bot: string; preview: string;
  unread: number; time: string; status: ConvT["status"];
};
export const conversations: Conversation[] = mockConversations.map((c) => ({
  id: c.id, lead: c.leadName, bot: c.botName, preview: c.preview,
  unread: c.unread, time: c.time, status: c.status,
}));

export const templates = mockTemplates.map((t) => ({
  id: t.id, category: t.category, name: t.name,
  desc: t.description, color: t.gradient,
}));

// Static UI fixtures (not domain entities).
export const kpis = [
  { label: "Leads capturados", value: "2.847", delta: "+12.4%", trend: "up" },
  { label: "Conversas hoje", value: "1.293", delta: "+8.1%", trend: "up" },
  { label: "Taxa de conversão", value: "34.2%", delta: "+3.2%", trend: "up" },
  { label: "Tempo médio", value: "1m 42s", delta: "-12s", trend: "down" },
];

export const conversionsChart = [
  { day: "Seg", leads: 120, conv: 42 },
  { day: "Ter", leads: 180, conv: 64 },
  { day: "Qua", leads: 220, conv: 88 },
  { day: "Qui", leads: 260, conv: 102 },
  { day: "Sex", leads: 320, conv: 140 },
  { day: "Sáb", leads: 240, conv: 96 },
  { day: "Dom", leads: 190, conv: 70 },
];

export const channelChart = [
  { name: "WhatsApp", value: 48 },
  { name: "Site", value: 26 },
  { name: "Instagram", value: 16 },
  { name: "Email", value: 10 },
];

export const recentActivity = [
  { id: 1, who: "Bot SDR Imobiliária", action: "qualificou um lead quente", time: "há 2 min" },
  { id: 2, who: "Bot Suporte", action: "encerrou conversa com resumo", time: "há 8 min" },
  { id: 3, who: "Bot Clínica Dental", action: "agendou reunião", time: "há 14 min" },
  { id: 4, who: "Bot E-commerce", action: "capturou 12 novos leads", time: "há 31 min" },
  { id: 5, who: "Bot Eventos", action: "enviou follow-up automático", time: "há 1h" },
];

export const sampleChat = [
  { from: "bot", text: "Olá! Sou o assistente da FluxBot Imóveis. Posso te ajudar a encontrar o imóvel ideal. Qual é seu nome?" },
  { from: "user", text: "Mariana" },
  { from: "bot", text: "Prazer, Mariana! Você procura um imóvel para morar ou investir?" },
  { from: "user", text: "Para morar" },
  { from: "bot", text: "Ótimo. Em qual região você gostaria?" },
  { from: "user", text: "Zona Sul de São Paulo" },
  { from: "bot", text: "Perfeito. Qual é o seu orçamento aproximado?" },
];

export const funnelSteps = [
  { step: "Início do fluxo", value: 4820 },
  { step: "Coletou nome", value: 4310 },
  { step: "Coletou contato", value: 3420 },
  { step: "Qualificou interesse", value: 2180 },
  { step: "Agendou conversa", value: 1240 },
  { step: "Convertido", value: 612 },
];
