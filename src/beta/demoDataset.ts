/**
 * Phase 26B.1C — Deterministic Demo Runtime dataset.
 *
 * Single source of truth for the "Agência Growth Demo" scenario used by
 * the Demo Runtime (Phase 26B.1C). When `isDemoMode()` is true the
 * persistence facade routes reads through `demoPersistence`, which serves
 * data exclusively from this file — the real Supabase workspace is NOT
 * consulted.
 *
 * Story: a digital agency uses Flux Agent Studio to capture, qualify and
 * attribute revenue across its clients. The hero client is **Clínica
 * Lumina** running a **Meta Ads** campaign for aesthetic evaluation.
 */
import type {
  Bot, Lead, PipelineStage, Channel, Conversation, Message,
  Session, Flow, Block, Connection, ExecutionEvent,
} from "@/types";
import { MOCK_WORKSPACE_ID, fixedIso } from "@/mocks/_shared";

/* ---------------- Stages reused ---------------- */

export const DEMO_STAGES: PipelineStage[] = [
  { id: "novo",         label: "Novo",          color: "muted" },
  { id: "qualificado",  label: "Qualificado",   color: "accent" },
  { id: "negociacao",   label: "Em negociação", color: "warning" },
  { id: "convertido",   label: "Convertido",    color: "success" },
  { id: "perdido",      label: "Perdido",       color: "destructive" },
];

/* ---------------- Flow ---------------- */

const flowTs = { createdAt: fixedIso(28), updatedAt: fixedIso(0) };

const luminaBlocks: Block[] = [
  { id: "lq_start",  botId: "lumina-qualify", type: "start",   label: "Início",            position: { x: 80,   y: 120 }, config: {}, ...flowTs },
  { id: "lq_hello",  botId: "lumina-qualify", type: "message", label: "Saudação",          position: { x: 280,  y: 120 }, config: { text: "Olá! 👋 Sou o assistente da Clínica Lumina. Posso te ajudar a agendar sua avaliação estética?" }, ...flowTs },
  { id: "lq_name",   botId: "lumina-qualify", type: "input",   label: "Nome",              position: { x: 480,  y: 120 }, config: { variable: "lead_name", text: "Para começar, qual é o seu nome?" }, ...flowTs },
  { id: "lq_thanks", botId: "lumina-qualify", type: "message", label: "Cumprimento",       position: { x: 680,  y: 120 }, config: { text: "Prazer, {{lead_name}}! 😊" }, ...flowTs },
  { id: "lq_goal",   botId: "lumina-qualify", type: "choice",  label: "Objetivo",          position: { x: 880,  y: 120 }, config: { variable: "goal", text: "Qual área você quer tratar?", options: ["Facial", "Corporal", "Capilar", "Outro"] }, ...flowTs },
  { id: "lq_when",   botId: "lumina-qualify", type: "choice",  label: "Quando",            position: { x: 1080, y: 120 }, config: { variable: "when", text: "Para quando você gostaria de agendar?", options: ["Esta semana", "Próxima semana", "Apenas pesquisando"] }, ...flowTs },
  { id: "lq_cond",   botId: "lumina-qualify", type: "condition", label: "Pronta agora?",   position: { x: 1280, y: 120 }, config: { variable: "when", operator: "equals", value: "Esta semana" }, ...flowTs },
  { id: "lq_phone",  botId: "lumina-qualify", type: "input",   label: "WhatsApp",          position: { x: 1480, y: 40  }, config: { variable: "lead_phone", text: "Perfeito! Qual é o seu WhatsApp para confirmação?" }, ...flowTs },
  { id: "lq_nurture",botId: "lumina-qualify", type: "message", label: "Nutrir",            position: { x: 1480, y: 200 }, config: { text: "Sem problemas! Vou te enviar nosso material exclusivo de avaliação." }, ...flowTs },
  { id: "lq_end",    botId: "lumina-qualify", type: "end",     label: "Fim",               position: { x: 1680, y: 120 }, config: { text: "Pronto, {{lead_name}}! Em instantes nosso time entra em contato. ✨" }, ...flowTs },
];

const luminaConnections: Connection[] = [
  { id: "lc1", botId: "lumina-qualify", fromBlockId: "lq_start",  toBlockId: "lq_hello",  ...flowTs },
  { id: "lc2", botId: "lumina-qualify", fromBlockId: "lq_hello",  toBlockId: "lq_name",   ...flowTs },
  { id: "lc3", botId: "lumina-qualify", fromBlockId: "lq_name",   toBlockId: "lq_thanks", ...flowTs },
  { id: "lc4", botId: "lumina-qualify", fromBlockId: "lq_thanks", toBlockId: "lq_goal",   ...flowTs },
  { id: "lc5", botId: "lumina-qualify", fromBlockId: "lq_goal",   toBlockId: "lq_when",   ...flowTs },
  { id: "lc6", botId: "lumina-qualify", fromBlockId: "lq_when",   toBlockId: "lq_cond",   ...flowTs },
  { id: "lc7", botId: "lumina-qualify", fromBlockId: "lq_cond",   toBlockId: "lq_phone",   condition: "true",  ...flowTs },
  { id: "lc8", botId: "lumina-qualify", fromBlockId: "lq_cond",   toBlockId: "lq_nurture", condition: "false", ...flowTs },
  { id: "lc9", botId: "lumina-qualify", fromBlockId: "lq_phone",  toBlockId: "lq_end",    ...flowTs },
  { id: "lc10", botId: "lumina-qualify", fromBlockId: "lq_nurture", toBlockId: "lq_end",   ...flowTs },
];

export const DEMO_FLOW: Flow = {
  botId: "lumina-qualify",
  blocks: luminaBlocks,
  connections: luminaConnections,
  variables: [
    { name: "lead_name", type: "string" },
    { name: "goal", type: "string" },
    { name: "when", type: "string" },
    { name: "lead_phone", type: "string" },
  ],
  metadata: {
    name: "Agente de Qualificação Lumina",
    description: "Qualifica leads vindos do Meta Ads para avaliação estética.",
    version: 4,
    primaryChannel: "whatsapp",
    status: "published",
    lastEditedAt: fixedIso(0),
  },
  publishedVersion: 4,
  versions: [
    { version: 1, status: "archived",  createdAt: fixedIso(28) },
    { version: 2, status: "archived",  createdAt: fixedIso(18) },
    { version: 3, status: "archived",  createdAt: fixedIso(8)  },
    { version: 4, status: "published", createdAt: fixedIso(2)  },
  ],
};

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
    publishedSnapshot: DEMO_FLOW,
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

/* ---------------- Lead timelines ---------------- */

const evt = (
  id: string,
  type: ExecutionEvent["type"],
  daysAgo: number,
  payload: Record<string, unknown> = {},
): ExecutionEvent => ({
  id, type, sessionId: "", flowId: "lumina-qualify", at: fixedIso(daysAgo), payload,
});

export const DEMO_LEAD_TIMELINE: Record<string, ExecutionEvent[]> = {
  "demo-marina": [
    evt("ev_m1", "lead_created",         3, { source: "Meta Ads", utm_campaign: "avaliacao-estetica-junho" }),
    evt("ev_m2", "flow_started",         3, { bot: "lumina-qualify" }),
    evt("ev_m3", "input_received",       3, { variable: "lead_name", value: "Marina Costa" }),
    evt("ev_m4", "choice_selected",      2, { option: "Facial" }),
    evt("ev_m5", "choice_selected",      2, { option: "Esta semana" }),
    evt("ev_m6", "input_received",       2, { variable: "lead_phone", value: "+55 11 98441-2210" }),
    evt("ev_m7", "conversation_completed",1, { handoff: true }),
    evt("ev_m8", "lead_updated",         1, { change: "stage", from: "qualificado", to: "negociacao" }),
  ],
  "demo-felipe": [
    evt("ev_f1", "lead_created", 5, { source: "Google Ads" }),
    evt("ev_f2", "flow_started", 5, {}),
    evt("ev_f3", "lead_updated", 3, { change: "stage", from: "negociacao", to: "convertido" }),
  ],
};

/* ---------------- Conversations + Sessions + Messages ---------------- */

const msgTs = { createdAt: fixedIso(0), updatedAt: fixedIso(0) };

export const DEMO_SESSIONS: Session[] = [
  { id: "demo-s1", botId: "lumina-qualify", leadId: "demo-marina", visitorId: "demo_vis_marina", channel: "WhatsApp", status: "ativa",     startedAt: fixedIso(1), variables: { lead_name: "Marina", goal: "Facial", when: "Esta semana" }, currentBlockId: "lq_phone", ...msgTs },
  { id: "demo-s2", botId: "lumina-qualify", leadId: "demo-bruna",  visitorId: "demo_vis_bruna",  channel: "WhatsApp", status: "humano",    startedAt: fixedIso(1), variables: { lead_name: "Bruna" }, ...msgTs },
  { id: "demo-s3", botId: "lumina-qualify", leadId: "demo-felipe", visitorId: "demo_vis_felipe", channel: "WhatsApp", status: "encerrada", startedAt: fixedIso(3), variables: {}, ...msgTs },
  { id: "demo-s4", botId: "lumina-followup",leadId: "demo-tiago",  visitorId: "demo_vis_tiago",  channel: "WhatsApp", status: "encerrada", startedAt: fixedIso(2), variables: {}, ...msgTs },
  { id: "demo-s5", botId: "lumina-qualify", leadId: "demo-paula",  visitorId: "demo_vis_paula",  channel: "Instagram",status: "ativa",     startedAt: fixedIso(0), variables: {}, ...msgTs },
];

export const DEMO_MESSAGES: Message[] = [
  { id: "dm1", sessionId: "demo-s1", role: "bot",  text: "Olá! 👋 Sou o assistente da Clínica Lumina. Posso te ajudar a agendar sua avaliação estética?", blockId: "lq_hello", sentAt: fixedIso(1), ...msgTs },
  { id: "dm2", sessionId: "demo-s1", role: "user", text: "Oi! Sim, quero agendar uma avaliação facial.", sentAt: fixedIso(1), ...msgTs },
  { id: "dm3", sessionId: "demo-s1", role: "bot",  text: "Para começar, qual é o seu nome?", blockId: "lq_name", sentAt: fixedIso(1), ...msgTs },
  { id: "dm4", sessionId: "demo-s1", role: "user", text: "Marina Costa", sentAt: fixedIso(1), ...msgTs },
  { id: "dm5", sessionId: "demo-s1", role: "bot",  text: "Prazer, Marina! 😊 Qual área você quer tratar?", blockId: "lq_thanks", sentAt: fixedIso(1), ...msgTs },
  { id: "dm6", sessionId: "demo-s1", role: "user", text: "Facial", sentAt: fixedIso(1), ...msgTs },
  { id: "dm7", sessionId: "demo-s1", role: "bot",  text: "Para quando você gostaria de agendar?", blockId: "lq_when", sentAt: fixedIso(1), ...msgTs },
  { id: "dm8", sessionId: "demo-s1", role: "user", text: "Esta semana se possível", sentAt: fixedIso(1), ...msgTs },
  { id: "dm9", sessionId: "demo-s1", role: "bot",  text: "Perfeito! Qual é o seu WhatsApp para confirmação?", blockId: "lq_phone", sentAt: fixedIso(1), ...msgTs },
];

export const DEMO_CONVERSATIONS: Conversation[] = [
  { id: "dc1", sessionId: "demo-s1", leadName: "Marina Costa",   botName: "Agente de Qualificação Lumina", preview: "Perfeito! Qual é o seu WhatsApp para confirmação?", unread: 2, time: "agora", status: "ativa", ...msgTs },
  { id: "dc2", sessionId: "demo-s2", leadName: "Bruna Almeida",  botName: "Agente de Qualificação Lumina", preview: "Vou te transferir para a nossa consultora 💆", unread: 1, time: "12min", status: "humano", ...msgTs },
  { id: "dc3", sessionId: "demo-s3", leadName: "Felipe Tavares", botName: "Agente de Qualificação Lumina", preview: "Confirmado para terça-feira às 14h. ✨", unread: 0, time: "3d", status: "encerrada", ...msgTs },
  { id: "dc4", sessionId: "demo-s4", leadName: "Tiago Monteiro", botName: "Follow-up Pós-Avaliação",        preview: "Obrigado! Já reservei o protocolo completo.", unread: 0, time: "2d", status: "encerrada", ...msgTs },
  { id: "dc5", sessionId: "demo-s5", leadName: "Paula Nogueira", botName: "Agente de Qualificação Lumina", preview: "Oi, vi no Instagram e queria saber preço…", unread: 3, time: "5min", status: "ativa", ...msgTs },
];

/** Per-lead conversations (used by LeadDetail "Conversas" tab). */
export const DEMO_LEAD_CONVERSATIONS: Record<string, Conversation[]> = {
  "demo-marina": [DEMO_CONVERSATIONS[0]],
  "demo-bruna":  [DEMO_CONVERSATIONS[1]],
  "demo-felipe": [DEMO_CONVERSATIONS[2]],
  "demo-tiago":  [DEMO_CONVERSATIONS[3]],
  "demo-paula":  [DEMO_CONVERSATIONS[4]],
};

/* ---------------- Channels ---------------- */

const chTs = { createdAt: fixedIso(50), updatedAt: fixedIso(2) };

export const DEMO_CHANNELS: Channel[] = [
  { id: "wa",   workspaceId: MOCK_WORKSPACE_ID, kind: "whatsapp",  name: "WhatsApp Cloud API",      description: "Canal oficial — Clínica Lumina · +55 11 4007-2210.", status: "connected",    account: "Clínica Lumina · +55 11 4007-2210", ...chTs },
  { id: "ig",   workspaceId: MOCK_WORKSPACE_ID, kind: "instagram", name: "Instagram Direct",        description: "Conta @clinica.lumina · DMs e respostas em stories.",  status: "connected",    account: "@clinica.lumina",  ...chTs },
  { id: "fb",   workspaceId: MOCK_WORKSPACE_ID, kind: "facebook",  name: "Facebook Messenger",      description: "Página Clínica Lumina · pronto para conectar.",       status: "disconnected", ...chTs },
  { id: "site", workspaceId: MOCK_WORKSPACE_ID, kind: "web",       name: "Widget de Site",          description: "clinicalumina.com.br · widget de qualificação ativo.", status: "connected",    account: "clinicalumina.com.br", ...chTs },
  { id: "tg",   workspaceId: MOCK_WORKSPACE_ID, kind: "telegram",  name: "Telegram",                description: "Bots públicos ou privados em grupos e canais.",         status: "disconnected", ...chTs },
  { id: "tt",   workspaceId: MOCK_WORKSPACE_ID, kind: "tiktok",    name: "TikTok",                  description: "Mensagens diretas e respostas em comentários.",         status: "soon", ...chTs },
  { id: "gbp",  workspaceId: MOCK_WORKSPACE_ID, kind: "gbp",       name: "Google Business Profile", description: "Atenda chats do Google Maps e da busca.",               status: "soon", ...chTs },
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

/* ---------------- Attribution ---------------- */

export interface DemoAttributionEntry {
  source: string;
  medium: string;
  campaign: string;
  visitors: number;
  leads: number;
  conversions: number;
  revenue: number;
}

export const DEMO_ATTRIBUTION: DemoAttributionEntry[] = [
  { source: "facebook", medium: "cpc",     campaign: "avaliacao-estetica-junho", visitors: 4_120, leads: 312, conversions: 7, revenue: 56_800 },
  { source: "google",   medium: "cpc",     campaign: "protocolo-facial-q2",      visitors: 1_870, leads: 142, conversions: 3, revenue: 18_900 },
  { source: "facebook", medium: "cpc",     campaign: "remarketing-30d",          visitors: 980,   leads:  88, conversions: 2, revenue: 11_700 },
  { source: "instagram",medium: "organic", campaign: "perfil-clinica",           visitors: 612,   leads:  41, conversions: 1, revenue:  8_400 },
  { source: "(direct)", medium: "(none)",  campaign: "(direct)",                 visitors: 244,   leads:  12, conversions: 1, revenue:  5_600 },
];

/* ---------------- AI Builder demo response ---------------- */

export const DEMO_AI_BUILDER_PROMPT =
  "Crie um agente para qualificar leads de uma clínica estética que recebe campanhas do Meta Ads.";

export const DEMO_AI_BUILDER_CONTEXT = {
  segment: "Saúde",
  product: "Avaliação estética",
  process: "Captar nome e WhatsApp, qualificar interesse e enviar para consultor humano",
  objective: "qualificar_leads" as const,
};

/* ---------------- Hero entities (for direct refs) ---------------- */

export const DEMO_HERO = {
  client: "Clínica Lumina",
  campaign: "Meta Ads · Avaliação Estética",
  bot: DEMO_BOTS[0],
  lead: DEMO_LEADS[0], // Marina Costa
  utmCampaign: "avaliacao-estetica-junho",
};
