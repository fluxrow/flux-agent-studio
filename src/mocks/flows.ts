import type { Block, Connection, Flow } from "@/types";
import { fixedIso } from "./_shared";

const ts = { createdAt: fixedIso(20), updatedAt: fixedIso(1) };

/* ---------- SDR Imobiliária — main demo flow ---------- */

const sdrBlocks: Block[] = [
  { id: "blk_start",   botId: "sdr-imob", type: "start",     label: "Início",             position: { x: 80,   y: 80 }, config: {}, ...ts },
  { id: "blk_hello",   botId: "sdr-imob", type: "message",   label: "Saudação",           position: { x: 280,  y: 80 }, config: { text: "Olá! Sou o assistente da FluxBot Imóveis. Vou te ajudar a encontrar o imóvel ideal." }, ...ts },
  { id: "blk_name",    botId: "sdr-imob", type: "input",     label: "Coleta de nome",     position: { x: 480,  y: 80 }, config: { variable: "lead_name", text: "Qual é o seu nome?" }, ...ts },
  { id: "blk_greet",   botId: "sdr-imob", type: "message",   label: "Cumprimento",        position: { x: 680,  y: 80 }, config: { text: "Prazer, {{lead_name}}!" }, ...ts },
  { id: "blk_intent",  botId: "sdr-imob", type: "choice",    label: "Morar ou investir",  position: { x: 880,  y: 80 }, config: { variable: "intent", text: "Você procura um imóvel para morar ou investir?", options: ["Morar", "Investir"] }, ...ts },
  { id: "blk_cond",    botId: "sdr-imob", type: "condition", label: "Intenção = Morar?",  position: { x: 1080, y: 80 }, config: { variable: "intent", operator: "equals", value: "Morar" }, ...ts },
  { id: "blk_region",  botId: "sdr-imob", type: "input",     label: "Região",             position: { x: 1280, y: 0  }, config: { variable: "region", text: "Em qual região, {{lead_name}}?" }, ...ts },
  { id: "blk_budget",  botId: "sdr-imob", type: "input",     label: "Orçamento",          position: { x: 1280, y: 160}, config: { variable: "budget", text: "Qual valor pretende investir?" }, ...ts },
  { id: "blk_phone",   botId: "sdr-imob", type: "input",     label: "Telefone",           position: { x: 1480, y: 80 }, config: { variable: "phone",  text: "Por fim, qual seu WhatsApp?" }, ...ts },
  { id: "blk_end",     botId: "sdr-imob", type: "end",       label: "Fim",                position: { x: 1680, y: 80 }, config: { text: "Obrigado, {{lead_name}}! Em instantes um consultor entrará em contato." }, ...ts },
];

const sdrConnections: Connection[] = [
  { id: "c1",  botId: "sdr-imob", fromBlockId: "blk_start",  toBlockId: "blk_hello",  ...ts },
  { id: "c2",  botId: "sdr-imob", fromBlockId: "blk_hello",  toBlockId: "blk_name",   ...ts },
  { id: "c3",  botId: "sdr-imob", fromBlockId: "blk_name",   toBlockId: "blk_greet",  ...ts },
  { id: "c4",  botId: "sdr-imob", fromBlockId: "blk_greet",  toBlockId: "blk_intent", ...ts },
  { id: "c5",  botId: "sdr-imob", fromBlockId: "blk_intent", toBlockId: "blk_cond",   ...ts },
  { id: "c6",  botId: "sdr-imob", fromBlockId: "blk_cond",   toBlockId: "blk_region", condition: "true",  ...ts },
  { id: "c7",  botId: "sdr-imob", fromBlockId: "blk_cond",   toBlockId: "blk_budget", condition: "false", ...ts },
  { id: "c8",  botId: "sdr-imob", fromBlockId: "blk_region", toBlockId: "blk_phone",  ...ts },
  { id: "c9",  botId: "sdr-imob", fromBlockId: "blk_budget", toBlockId: "blk_phone",  ...ts },
  { id: "c10", botId: "sdr-imob", fromBlockId: "blk_phone",  toBlockId: "blk_end",    ...ts },
];

export const mockFlows: Record<string, Flow> = {
  "sdr-imob": {
    botId: "sdr-imob",
    blocks: sdrBlocks,
    connections: sdrConnections,
    variables: [
      { name: "lead_name", type: "string" },
      { name: "intent", type: "string" },
      { name: "region", type: "string" },
      { name: "budget", type: "string" },
      { name: "phone", type: "string" },
    ],
    metadata: {
      name: "SDR Imobiliária Premium",
      description: "Qualificação de leads para imóveis de alto padrão.",
      version: 3,
      primaryChannel: "whatsapp",
      status: "published",
      lastEditedAt: fixedIso(1),
    },
    publishedVersion: 3,
    versions: [
      { version: 1, status: "archived",  createdAt: fixedIso(20) },
      { version: 2, status: "archived",  createdAt: fixedIso(10) },
      { version: 3, status: "published", createdAt: fixedIso(1)  },
    ],
  },
};
