import type { Block, Connection, Flow } from "@/types";
import { fixedIso } from "./_shared";

const ts = { createdAt: fixedIso(20), updatedAt: fixedIso(1) };

const blocks: Block[] = [
  { id: "blk_start",  botId: "sdr-imob", type: "start",   label: "Início",            position: { x: 80,  y: 80 },  config: {}, ...ts },
  { id: "blk_hello",  botId: "sdr-imob", type: "message", label: "Saudação",          position: { x: 280, y: 80 },  config: { text: "Olá! Sou o assistente da FluxBot Imóveis." }, ...ts },
  { id: "blk_name",   botId: "sdr-imob", type: "input",   label: "Coleta de nome",    position: { x: 480, y: 80 },  config: { variable: "lead_name", text: "Qual é o seu nome?" }, ...ts },
  { id: "blk_intent", botId: "sdr-imob", type: "choice",  label: "Morar ou investir", position: { x: 680, y: 80 },  config: { options: ["Morar", "Investir"], variable: "intent" }, ...ts },
  { id: "blk_ai",     botId: "sdr-imob", type: "ai",      label: "Qualifica com IA",  position: { x: 880, y: 80 },  config: { prompt: "Analisar perfil do lead com base nas respostas." }, ...ts },
  { id: "blk_phone",  botId: "sdr-imob", type: "input",   label: "Coleta de telefone",position: { x: 1080,y: 80 },  config: { variable: "phone", text: "Qual seu WhatsApp?" }, ...ts },
  { id: "blk_end",    botId: "sdr-imob", type: "end",     label: "Fim",               position: { x: 1280,y: 80 },  config: {}, ...ts },
];

const connections: Connection[] = [
  { id: "c1", botId: "sdr-imob", fromBlockId: "blk_start",  toBlockId: "blk_hello",  ...ts },
  { id: "c2", botId: "sdr-imob", fromBlockId: "blk_hello",  toBlockId: "blk_name",   ...ts },
  { id: "c3", botId: "sdr-imob", fromBlockId: "blk_name",   toBlockId: "blk_intent", ...ts },
  { id: "c4", botId: "sdr-imob", fromBlockId: "blk_intent", toBlockId: "blk_ai",     condition: "Morar", ...ts },
  { id: "c5", botId: "sdr-imob", fromBlockId: "blk_ai",     toBlockId: "blk_phone",  ...ts },
  { id: "c6", botId: "sdr-imob", fromBlockId: "blk_phone",  toBlockId: "blk_end",    ...ts },
];

export const mockFlows: Record<string, Flow> = {
  "sdr-imob": { botId: "sdr-imob", blocks, connections },
};
