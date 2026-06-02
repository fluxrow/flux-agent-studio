/**
 * AI Runner — single entry point used by the RuntimeEngine and Playground.
 *
 * Responsibilities:
 *   1. Pick the right provider/model
 *   2. Decide between generate() and extract() based on outputSchema
 *   3. Validate structured output
 *   4. Persist an AIRunRecord for the Inspector + cost tracking
 *   5. Emit a `ai_block_executed` event into the runtime bus so Tracking
 *      Destinations and the existing event inspector pick it up
 */
import { runtimeEventBus } from "@/runtime/events/bus";
import { getAIProvider, DEFAULT_PROVIDER } from "./registry";
import { aiInspector } from "./inspector";
import type {
  AIBlockConfig, AIResponse, AIRunRecord, AIProviderId,
} from "./types";

export interface RunAiBlockInput {
  config: AIBlockConfig;
  variables?: Record<string, unknown>;
  sessionId?: string;
  flowId?: string;
  blockId?: string;
}

export interface RunAiBlockOutput {
  ok: boolean;
  response?: AIResponse<unknown>;
  /** Variables to merge back into the flow context. */
  variableUpdates: Record<string, unknown>;
  error?: string;
}

function makeId() {
  return `ai_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

export async function runAiBlock(input: RunAiBlockInput): Promise<RunAiBlockOutput> {
  const cfg = input.config ?? {};
  const providerId: AIProviderId = cfg.provider ?? DEFAULT_PROVIDER;
  const provider = getAIProvider(providerId);
  const prompt = String(cfg.prompt ?? "");

  if (!prompt) {
    return { ok: false, variableUpdates: {}, error: "AI block sem prompt." };
  }

  const variableUpdates: Record<string, unknown> = {};

  try {
    let response: AIResponse<unknown>;

    if (cfg.outputSchema && Object.keys(cfg.outputSchema).length > 0) {
      response = await provider.extract({
        prompt,
        schema: cfg.outputSchema,
        model: cfg.model,
        temperature: cfg.temperature,
        variables: input.variables,
      });

      const data = response.output as Record<string, unknown>;
      const mappings = cfg.mappings && cfg.mappings.length
        ? cfg.mappings
        : Object.keys(cfg.outputSchema).map((k) => ({ from: k, to: k }));

      for (const m of mappings) {
        const value = (data as Record<string, unknown>)[m.from];
        if (value !== undefined) variableUpdates[m.to] = value;
      }
    } else {
      response = await provider.generate({
        prompt,
        model: cfg.model,
        temperature: cfg.temperature,
        maxTokens: cfg.maxTokens,
        variables: input.variables,
      });
      if (cfg.outputVariable) {
        variableUpdates[cfg.outputVariable] = response.output;
      }
    }

    const record: AIRunRecord = {
      id: makeId(),
      at: response.finishedAt,
      provider: response.provider,
      model: response.model,
      prompt,
      response: response.output,
      rawText: response.rawText,
      usage: response.usage,
      durationMs: response.durationMs,
      sessionId: input.sessionId,
      blockId: input.blockId,
      flowId: input.flowId,
      ok: true,
      schema: cfg.outputSchema,
    };
    aiInspector.record(record);

    runtimeEventBus.emit({
      id: record.id,
      type: "ai_block_executed" as any,
      sessionId: input.sessionId ?? "",
      flowId: input.flowId ?? "",
      blockId: input.blockId,
      at: record.at,
      payload: {
        provider: record.provider,
        model: record.model,
        durationMs: record.durationMs,
        inputTokens: record.usage.inputTokens,
        outputTokens: record.usage.outputTokens,
        estimatedCost: record.usage.estimatedCost,
        structured: !!cfg.outputSchema,
        variableUpdates,
      },
    });

    return { ok: true, response, variableUpdates };
  } catch (err: any) {
    const message = err?.message ?? "Falha ao executar bloco IA.";
    aiInspector.record({
      id: makeId(),
      at: new Date().toISOString(),
      provider: providerId,
      model: cfg.model ?? provider.defaultModel,
      prompt,
      response: null,
      rawText: "",
      usage: { inputTokens: 0, outputTokens: 0, estimatedCost: 0 },
      durationMs: 0,
      sessionId: input.sessionId,
      blockId: input.blockId,
      flowId: input.flowId,
      ok: false,
      error: message,
      schema: cfg.outputSchema,
    });
    return { ok: false, variableUpdates: {}, error: message };
  }
}
