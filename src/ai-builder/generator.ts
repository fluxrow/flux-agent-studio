/**
 * AI Builder generator — turns a natural-language prompt into a full
 * BotBlueprint, then materializes it into a real Bot + Flow using the
 * existing repositories (no Runtime/Builder changes).
 *
 * Provider call is real (against the mock AI provider layer) so token
 * usage, latency, and cost are tracked through the same channels as
 * normal AI Block executions.
 */
import { getAIProvider, DEFAULT_PROVIDER } from "@/ai/registry";
import type { AIProviderId } from "@/ai/types";
import {
  persistence,
  type BotRepository,
  type FlowRepository,
} from "@/domain/persistence";
import type { Block, BlockConfig, Connection, Flow } from "@/types";
import type {
  AIBuilderPromptInput, AIBuilderObjective,
  BotBlueprint, FlowBlueprint, LeadModelBlueprint,
  KnowledgeBlueprint, ConversationBlueprint, FlowBlueprintStep,
} from "./types";
import { emitAIBuilderEvent } from "./events";

/* ---------------- heuristics ---------------- */

function detectObjective(text: string): AIBuilderObjective {
  const t = text.toLowerCase();
  if (/qualific|sdr|lead/.test(t)) return "qualificar_leads";
  if (/agenda|reuni[aã]o|consulta/.test(t)) return "agendar_reuniao";
  if (/suporte|ajuda|atend/.test(t)) return "suporte";
  if (/vend|fechament/.test(t)) return "vendas";
  if (/atend/.test(t)) return "atendimento";
  return "outro";
}

function detectSegment(text: string): string {
  const t = text.toLowerCase();
  const map: Array<[RegExp, string]> = [
    [/cons[oó]rcio/, "Consórcio"],
    [/im[oó]vel|im[oó]bili[aá]ria/, "Imobiliária"],
    [/educa[cç][aã]o|escola|curso/, "Educação"],
    [/sa[uú]de|cl[íi]nica|m[ée]dic/, "Saúde"],
    [/seguro/, "Seguros"],
    [/financ|investimento/, "Financeiro"],
    [/loja|ecommerce|e-commerce/, "E-commerce"],
  ];
  for (const [re, name] of map) if (re.test(t)) return name;
  return "Geral";
}

function botNameFor(segment: string, objective: AIBuilderObjective): string {
  const role = objective === "qualificar_leads" ? "SDR"
    : objective === "agendar_reuniao" ? "Agendador"
    : objective === "suporte" ? "Suporte"
    : objective === "vendas" ? "Vendas"
    : "Assistente";
  return `${role} ${segment}`.trim();
}

function buildFlowBlueprint(input: AIBuilderPromptInput, segment: string, obj: AIBuilderObjective): FlowBlueprint {
  const steps: FlowBlueprintStep[] = [
    { id: "start",  type: "start",   label: "Início" },
    { id: "hello",  type: "message", label: "Saudação",
      text: `Olá! Sou o assistente de ${segment}. Vou te ajudar em poucos minutos.` },
    { id: "name",   type: "input",   label: "Nome",     text: "Como posso te chamar?", variable: "lead_name" },
    { id: "greet",  type: "message", label: "Cumprimento", text: "Prazer, {{lead_name}}!" },
    { id: "phone",  type: "input",   label: "WhatsApp", text: "Qual seu WhatsApp com DDD?", variable: "lead_phone" },
  ];

  if (obj === "qualificar_leads" || obj === "vendas") {
    steps.push(
      { id: "intent", type: "choice", label: "Intenção",
        text: `Sobre ${input.product ?? segment.toLowerCase()}, você está:`,
        variable: "intent", options: ["Pesquisando", "Pronto para comprar", "Apenas curioso"] },
      { id: "budget", type: "input",  label: "Orçamento",
        text: "Qual valor você pretende investir?", variable: "budget" },
      { id: "qual",   type: "condition", label: "Qualificado?",
        // condition handled at flow conversion via config below
        variable: "intent" },
    );
  }

  if (obj === "agendar_reuniao") {
    steps.push(
      { id: "slot", type: "input", label: "Horário preferido",
        text: "Qual o melhor horário para você?", variable: "preferred_slot" },
    );
  }

  // AI block — extrai sumário/score com base no contexto coletado
  steps.push({
    id: "ai_summary",
    type: "ai",
    label: "Análise IA",
    aiPrompt:
      `Você é um analista de ${segment}. Resuma a conversa em até 2 frases ` +
      `usando as variáveis: nome={{lead_name}}, intenção={{intent}}, orçamento={{budget}}. ` +
      `Devolva um resumo objetivo para o consultor humano.`,
    aiOutputVariable: "ai_summary",
  });

  steps.push(
    { id: "thanks", type: "message", label: "Encerramento",
      text: "Obrigado, {{lead_name}}! Um consultor entrará em contato em instantes." },
    { id: "end",    type: "end", label: "Fim" },
  );

  return {
    name: `Fluxo ${botNameFor(segment, obj)}`,
    description: input.description.slice(0, 160),
    steps,
  };
}

function buildLeadModel(obj: AIBuilderObjective, segment: string): LeadModelBlueprint {
  const baseTags = [segment.toLowerCase(), obj.replace(/_/g, "-")];
  return {
    fields: [
      { key: "lead_name",  label: "Nome",      type: "string", source: "input" },
      { key: "lead_phone", label: "WhatsApp",  type: "string", source: "input" },
      { key: "intent",     label: "Intenção",  type: "string", source: "input" },
      { key: "budget",     label: "Orçamento", type: "string", source: "input" },
      { key: "ai_summary", label: "Resumo IA", type: "string", source: "ai" },
    ],
    tags: baseTags,
    initialScore: obj === "qualificar_leads" ? 40 : 25,
    pipeline: [
      { id: "novo",         label: "Novo" },
      { id: "qualificado",  label: "Qualificado" },
      { id: "negociacao",   label: "Negociação" },
      { id: "convertido",   label: "Convertido" },
      { id: "perdido",      label: "Perdido" },
    ],
  };
}

function buildKnowledge(segment: string, product?: string): KnowledgeBlueprint {
  const target = product ?? segment.toLowerCase();
  return {
    suggestedDocuments: [
      { title: `FAQ ${segment}`,          kind: "faq", reason: "Responder dúvidas comuns automaticamente." },
      { title: `Catálogo / Tabela de ${target}`, kind: "pdf", reason: "Permitir respostas factuais sobre preços e condições." },
      { title: "Política de atendimento", kind: "doc", reason: "Definir tom, limites e escalonamento humano." },
      { title: "Site institucional",      kind: "url", reason: "Dar contexto da marca à IA." },
    ],
  };
}

function buildConversation(obj: AIBuilderObjective): ConversationBlueprint {
  return {
    tone: obj === "suporte" ? "amigavel" : "consultivo",
    greeting: "Olá! Estou aqui para te ajudar.",
    fallback: "Desculpe, não entendi. Pode reformular?",
  };
}

/* ---------------- public API ---------------- */

export interface GenerateBlueprintOptions {
  provider?: AIProviderId;
  model?: string;
}

export async function generateBlueprint(
  input: AIBuilderPromptInput,
  opts: GenerateBlueprintOptions = {},
): Promise<BotBlueprint> {
  const provider = getAIProvider(opts.provider ?? DEFAULT_PROVIDER);
  const segment = input.segment ?? detectSegment(input.description);
  const objective = input.objective ?? detectObjective(input.description);

  // Real provider call so token usage / cost / latency flow through the
  // same surfaces as a normal AI Block. The structured output is used as
  // a sanity signal; the heuristic blueprint always wins.
  const response = await provider.extract({
    prompt:
      `Descrição do bot desejado: ${input.description}\n` +
      `Segmento: ${segment}\nObjetivo: ${objective}\n` +
      `Produto: ${input.product ?? "n/a"}\nProcesso: ${input.process ?? "n/a"}`,
    schema: {
      bot_name: "string",
      summary:  "string",
    },
    model: opts.model,
  });

  const bot = {
    name: (response.output?.bot_name as string) || botNameFor(segment, objective),
    description: (response.output?.summary as string) || input.description.slice(0, 200),
    channel: "web",
    objective,
  };

  const flow = buildFlowBlueprint(input, segment, objective);
  const leadModel = buildLeadModel(objective, segment);
  const knowledge = buildKnowledge(segment, input.product);
  const conversation = buildConversation(objective);

  const blueprint: BotBlueprint = {
    bot, flow, leadModel, knowledge, conversation,
    meta: {
      provider: response.provider,
      model: response.model,
      durationMs: response.durationMs,
      inputTokens: response.usage.inputTokens,
      outputTokens: response.usage.outputTokens,
      estimatedCost: response.usage.estimatedCost,
      promptHash: hash(input.description),
      generatedAt: response.finishedAt,
    },
  };

  emitAIBuilderEvent("ai_blueprint_generated", {
    bot: bot.name,
    objective,
    segment,
    steps: flow.steps.length,
    estimatedCost: response.usage.estimatedCost,
  });
  emitAIBuilderEvent("ai_flow_generated",     { steps: flow.steps.length });
  emitAIBuilderEvent("ai_crm_generated",      { fields: leadModel.fields.length, tags: leadModel.tags });
  emitAIBuilderEvent("ai_knowledge_suggested",{ count: knowledge.suggestedDocuments.length });

  return blueprint;
}

/* ---------------- Blueprint → Flow conversion ---------------- */

const now = () => new Date().toISOString();

export function blueprintToFlow(botId: string, bp: BotBlueprint): Flow {
  const blocks: Block[] = [];
  const connections: Connection[] = [];

  const xStart = 80;
  const spacing = 220;
  const yMain = 120;

  bp.flow.steps.forEach((s, i) => {
    const config: Record<string, unknown> = {};
    if (s.text) config.text = s.text;
    if (s.variable) config.variable = s.variable;
    if (s.options) config.options = s.options;
    if (s.type === "ai" && s.aiPrompt) {
      config.prompt = s.aiPrompt;
      if (s.aiOutputVariable) config.outputVariable = s.aiOutputVariable;
    }
    if (s.type === "condition") {
      config.operator = "equals";
      config.value = "Pronto para comprar";
    }

    blocks.push({
      id: `blk_${botId}_${s.id}`,
      botId,
      type: s.type,
      label: s.label,
      position: { x: xStart + i * spacing, y: yMain },
      config: config as BlockConfig,
      createdAt: now(),
      updatedAt: now(),
    });
  });

  for (let i = 0; i < blocks.length - 1; i++) {
    connections.push({
      id: `con_${botId}_${i}`,
      botId,
      fromBlockId: blocks[i].id,
      toBlockId: blocks[i + 1].id,
      createdAt: now(),
      updatedAt: now(),
    });
  }

  return {
    botId,
    blocks,
    connections,
    variables: bp.leadModel.fields.map((f) => ({
      name: f.key, type: f.type, description: f.label,
    })),
    metadata: {
      name: bp.bot.name,
      description: bp.bot.description,
      version: 1,
      status: "draft",
      lastEditedAt: now(),
    },
  };
}

/* ---------------- Materialize: create Bot + Flow via repositories ---------------- */

export interface MaterializeResult {
  botId: string;
  flow: Flow;
}

export interface AIBuilderPersistencePorts {
  bots: Pick<BotRepository, "create">;
  flows: Pick<FlowRepository, "saveBlocks" | "saveConnections">;
}

export async function materializeBlueprint(
  bp: BotBlueprint,
  ports: AIBuilderPersistencePorts = persistence,
): Promise<MaterializeResult> {
  const bot = await ports.bots.create({
    name: bp.bot.name,
    description: bp.bot.description,
    channel: bp.bot.channel,
  });
  const flow = blueprintToFlow(bot.id, bp);
  await ports.flows.saveBlocks(bot.id, flow.blocks);
  await ports.flows.saveConnections(bot.id, flow.connections);

  emitAIBuilderEvent("ai_bot_materialized", {
    botId: bot.id,
    botName: bot.name,
    steps: flow.blocks.length,
  });

  return { botId: bot.id, flow };
}

/* ---------------- utils ---------------- */

function hash(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h).toString(36);
}
