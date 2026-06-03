/**
 * Phase 26B.1B — Deterministic Demo Dataset for Landing Page V2.
 *
 * Single source of truth for the "Agência Growth Demo" scenario used for
 * LP screenshots, mockups and motion graphics. Only activated when
 * `isDemoMode()` is true — never affects real workspaces.
 *
 * Story: a digital agency uses Flux Agent Studio to capture, qualify and
 * attribute revenue across its clients. The hero client is **Clínica
 * Lumina** running a **Meta Ads** campaign for aesthetic evaluation.
 */
import type { Bot, Lead, PipelineStage } from "@/types";
import { MOCK_WORKSPACE_ID, fixedIso } from "@/mocks/_shared";

/* ---------------- Bots ---------------- */

export const DEMO_BOTS: Bot[] = [
  {
    id: "lumina-qualify",
    workspaceId: MOCK_WORKSPACE_ID,
    name: "Agente de Qualificação Lumina",
    description: "Captura e qualifica leads vindos do Meta Ads para avaliação estética.",
    status: "ativo",
    channel: "WhatsApp",
    slug: "lumina-qualify",
    metrics: { conversations: 1842, conversions: 327 },
    createdAt: fixedIso(28),
    updatedAt: fixedIso(0),
    publishedAt: fixedIso(2),
  },
  {
    id: "lumina-followup",
    workspaceId: MOCK_WORKSPACE_ID,
    name: "Follow-up Pós-Avaliação",
    description: "Reengaja leads que agendaram avaliação e não fecharam o tratamento.",
    status: "ativo",
    channel: "WhatsApp",
    metrics: { conversations: 612, conversions: 96 },
    createdAt: fixedIso(18),
    updatedAt: fixedIso(1),
  },
  {
    id: "lumina-ai-draft",
    workspaceId: MOCK_WORKSPACE_ID,
    name: "Agente Lumina (gerado por IA)",
    description: "Versão criada pelo AI Builder a partir de prompt em linguagem natural.",
    status: "rascunho",
    channel: "WhatsApp",
    metrics: { conversations: 0, conversions: 0 },
    createdAt: fixedIso(3),
    updatedAt: fixedIso(0),
  },
];

/* ---------------- Leads ---------------- */

const baseLead = (i: number) => ({
  workspaceId: MOCK_WORKSPACE_ID,
  createdAt: fixedIso(i),
  updatedAt: fixedIso(Math.max(0, i - 1)),
  lastActivityAt: fixedIso(Math.max(0, i - 1)),
});

/**
 * Per-lead conversion `value` (BRL). Lives outside the Lead type so the
 * domain stays untouched; Revenue Intelligence in demo mode reads from
 * this map directly.
 */
export const DEMO_LEAD_VALUES: Record<string, number> = {
  "demo-marina":  8400,
  "demo-bruna":   6200,
  "demo-felipe":  12500,
  "demo-carolina": 0,
  "demo-tiago":    0,
};

export const DEMO_LEADS: Lead[] = [
  // 🔥 Hero lead — referenced everywhere
  {
    id: "demo-marina",
    name: "Marina Costa",
    email: "marina.costa@gmail.com",
    phone: "+55 11 98441-2210",
    company: "Particular",
    source: "Meta Ads",
    stage: "negociacao",
    score: 92,
    temperature: "quente",
    botId: "lumina-qualify",
    botName: "Agente de Qualificação Lumina",
    tags: ["avaliacao-estetica-junho", "meta-ads", "quente"],
    notes: "Interessada em protocolo facial completo. Solicitou orçamento detalhado.",
    ...baseLead(1),
  },
  { id: "demo-bruna",    name: "Bruna Almeida",   email: "bruna@hotmail.com",     phone: "+55 11 97712-3344", source: "Meta Ads",  stage: "qualificado", score: 84, temperature: "quente", botId: "lumina-qualify",  botName: "Agente de Qualificação Lumina", tags: ["avaliacao-estetica-junho","meta-ads"], ...baseLead(2) },
  { id: "demo-felipe",   name: "Felipe Tavares",  email: "felipe.t@empresa.com",  phone: "+55 21 98223-7711", source: "Google Ads",stage: "convertido",  score: 96, temperature: "quente", botId: "lumina-qualify",  botName: "Agente de Qualificação Lumina", tags: ["avaliacao-estetica-junho","google-ads","fechou"], ...baseLead(3) },
  { id: "demo-carolina", name: "Carolina Reis",   email: "carolreis@gmail.com",   phone: "+55 11 99884-2210", source: "Instagram", stage: "convertido",  score: 91, temperature: "quente", botId: "lumina-qualify",  botName: "Agente de Qualificação Lumina", tags: ["organico","fechou"], ...baseLead(4) },
  { id: "demo-tiago",    name: "Tiago Monteiro",  email: "tiago@startup.io",      phone: "+55 11 97001-2233", source: "Meta Ads",  stage: "convertido",  score: 89, temperature: "quente", botId: "lumina-followup", botName: "Follow-up Pós-Avaliação",        tags: ["follow-up","fechou"], ...baseLead(5) },
  { id: "demo-paula",    name: "Paula Nogueira",  email: "paula.n@gmail.com",     phone: "+55 31 98114-9921", source: "Meta Ads",  stage: "qualificado", score: 78, temperature: "morno",  botId: "lumina-qualify",  botName: "Agente de Qualificação Lumina", tags: ["avaliacao-estetica-junho","meta-ads"], ...baseLead(6) },
  { id: "demo-rafael",   name: "Rafael Andrade",  email: "rafael@corp.br",        phone: "+55 11 99012-1100", source: "Site",      stage: "novo",        score: 52, temperature: "morno",  botId: "lumina-qualify",  botName: "Agente de Qualificação Lumina", tags: ["organico"], ...baseLead(7) },
  { id: "demo-jessica",  name: "Jéssica Lima",    email: "jessica@me.com",        phone: "+55 41 98221-3344", source: "Meta Ads",  stage: "novo",        score: 45, temperature: "morno",  botId: "lumina-qualify",  botName: "Agente de Qualificação Lumina", tags: ["meta-ads"], ...baseLead(8) },
  { id: "demo-andre",    name: "André Pacheco",   email: "andre.p@mail.com",      phone: "+55 11 99005-7788", source: "Google Ads",stage: "qualificado", score: 71, temperature: "morno",  botId: "lumina-qualify",  botName: "Agente de Qualificação Lumina", tags: ["google-ads"], ...baseLead(9) },
  { id: "demo-luana",    name: "Luana Ferreira",  email: "luana@mail.com",        phone: "+55 11 98774-2200", source: "Instagram", stage: "novo",        score: 38, temperature: "frio",   botId: "lumina-qualify",  botName: "Agente de Qualificação Lumina", tags: ["organico"], ...baseLead(10) },
  { id: "demo-gustavo",  name: "Gustavo Pires",   email: "gustavo@p.com",         phone: "+55 11 98112-4456", source: "Meta Ads",  stage: "perdido",     score: 24, temperature: "frio",   botId: "lumina-qualify",  botName: "Agente de Qualificação Lumina", tags: ["meta-ads","sem-fit"], ...baseLead(11) },
  { id: "demo-renata",   name: "Renata Soares",   email: "renata@gmail.com",      phone: "+55 11 98221-9988", source: "Site",      stage: "novo",        score: 41, temperature: "frio",   botId: "lumina-qualify",  botName: "Agente de Qualificação Lumina", tags: ["organico"], ...baseLead(12) },
];

/* ---------------- Revenue Intelligence ---------------- */

export interface DemoRevenueChannel {
  channel: string;
  conversions: number;
  revenue: number;
  cost: number;
  roas: number;
}

export const DEMO_REVENUE = {
  totalAttributed: 87_400,
  totalCost: 14_200,
  conversions: 12,
  avgTicket: 7_283,
  roas: 6.15,
  forecastNext30d: 132_000,
  channels: [
    { channel: "Meta Ads",   conversions: 7, revenue: 48_900, cost: 8_400,  roas: 5.82 },
    { channel: "Google Ads", conversions: 3, revenue: 24_500, cost: 4_100,  roas: 5.98 },
    { channel: "Instagram",  conversions: 1, revenue: 8_400,  cost: 1_200,  roas: 7.00 },
    { channel: "Orgânico",   conversions: 1, revenue: 5_600,  cost: 500,    roas: 11.20 },
  ] as DemoRevenueChannel[],
  byCampaign: [
    { campaign: "avaliacao-estetica-junho", revenue: 56_800, conversions: 7 },
    { campaign: "protocolo-facial-q2",      revenue: 18_900, conversions: 3 },
    { campaign: "remarketing-30d",          revenue: 11_700, conversions: 2 },
  ],
  trend: [
    { day: "Seg", revenue:  8_200 }, { day: "Ter", revenue: 11_400 },
    { day: "Qua", revenue:  9_800 }, { day: "Qui", revenue: 14_200 },
    { day: "Sex", revenue: 17_800 }, { day: "Sáb", revenue: 12_900 },
    { day: "Dom", revenue: 13_100 },
  ],
};

/* ---------------- AI Builder demo response ---------------- */

export const DEMO_AI_BUILDER_PROMPT =
  "Crie um agente para qualificar leads de uma clínica estética que recebe campanhas do Meta Ads.";

export const DEMO_AI_BUILDER_CONTEXT = {
  segment: "Saúde",
  product: "Avaliação estética",
  process: "Captar nome e WhatsApp, qualificar interesse e enviar para consultor humano",
  objective: "qualificar_leads" as const,
};

/* ---------------- Stages reused ---------------- */

export const DEMO_STAGES: PipelineStage[] = [
  { id: "novo",         label: "Novo",          color: "muted" },
  { id: "qualificado",  label: "Qualificado",   color: "accent" },
  { id: "negociacao",   label: "Em negociação", color: "warning" },
  { id: "convertido",   label: "Convertido",    color: "success" },
  { id: "perdido",      label: "Perdido",       color: "destructive" },
];

/* ---------------- Hero entities (for direct refs) ---------------- */

export const DEMO_HERO = {
  client: "Clínica Lumina",
  campaign: "Meta Ads · Avaliação Estética",
  bot: DEMO_BOTS[0],
  lead: DEMO_LEADS[0], // Marina Costa
  utmCampaign: "avaliacao-estetica-junho",
};
