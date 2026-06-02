/**
 * Mock provider factory. All three Phase-12 stubs share this logic so the
 * UI feels real (per-model latency, token counts, cost estimation) without
 * any real network calls. Swap the body of `runMock` for a Lovable AI Gateway
 * call to ship a real provider — the contract stays identical.
 */
import type {
  AIProvider, AIProviderId, AIGenerateInput, AIExtractInput,
  AIClassifyInput, AIResponse, AIOutputSchema, AIModelInfo, AIUsage,
} from "../types";
import { validateSchema } from "../schema";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

function tokenize(text: string): number {
  // Mock tokenizer ≈ 1 token per ~4 chars.
  return Math.max(1, Math.round(text.length / 4));
}

function estimateCost(model: AIModelInfo, usage: { inputTokens: number; outputTokens: number }): number {
  const cost = (usage.inputTokens / 1000) * model.inputCostPer1k
             + (usage.outputTokens / 1000) * model.outputCostPer1k;
  return Math.round(cost * 1_000_000) / 1_000_000;
}

function interpolate(s: string, vars?: Record<string, unknown>): string {
  if (!vars) return s;
  return s.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, k) => {
    const v = (vars as Record<string, unknown>)[k as string];
    return v === undefined || v === null ? "" : String(v);
  });
}

function mockAnswerFor(prompt: string): string {
  const lower = prompt.toLowerCase();
  if (lower.includes("classific")) return "interessado";
  if (lower.includes("resumo") || lower.includes("summar"))
    return "Resumo: cliente busca apartamento de 2 quartos em SP, orçamento médio.";
  if (lower.includes("nome")) return "Maria Oliveira";
  return "Resposta gerada (mock). Esta é uma simulação até conectarmos o provider real.";
}

function buildStructuredMock(schema: AIOutputSchema, prompt: string): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, propRaw] of Object.entries(schema)) {
    const prop = typeof propRaw === "string" ? { type: propRaw } : propRaw;
    switch (prop.type) {
      case "string":
        out[key] = prop.enum?.[0] ?? `${key}_mock`;
        break;
      case "number":
        out[key] = key.toLowerCase().includes("orcam") ? 350000 : 42;
        break;
      case "boolean":
        out[key] = true;
        break;
      case "string[]":
        out[key] = ["quente", prompt.length > 40 ? "qualificado" : "novo"];
        break;
    }
  }
  return out;
}

function pickModel(provider: AIProvider, requested?: string): AIModelInfo {
  return provider.models.find((m) => m.id === requested) ?? provider.models.find((m) => m.id === provider.defaultModel)!;
}

export function buildMockProvider(meta: Omit<AIProvider, "generate" | "extract" | "classify">): AIProvider {
  const provider = { ...meta } as AIProvider;

  async function envelope<T>(modelId: string | undefined, work: () => { output: T; rawText: string; inputText: string }): Promise<AIResponse<T>> {
    const t0 = performance.now();
    await wait(250 + Math.random() * 400);
    const model = pickModel(provider, modelId);
    const { output, rawText, inputText } = work();
    const usage: AIUsage = {
      inputTokens: tokenize(inputText),
      outputTokens: tokenize(rawText),
      estimatedCost: 0,
    };
    usage.estimatedCost = estimateCost(model, usage);
    return {
      provider: provider.id,
      model: model.id,
      output,
      rawText,
      usage,
      durationMs: Math.round(performance.now() - t0),
      finishedAt: new Date().toISOString(),
      meta: { mock: true },
    };
  }

  provider.generate = async (input: AIGenerateInput) => {
    const filled = interpolate(input.prompt, input.variables);
    return envelope<string>(input.model, () => {
      const rawText = mockAnswerFor(filled);
      return { output: rawText, rawText, inputText: (input.system ?? "") + filled };
    });
  };

  provider.extract = async (input: AIExtractInput) => {
    const filled = interpolate(input.prompt, input.variables);
    return envelope<Record<string, unknown>>(input.model, () => {
      const draft = buildStructuredMock(input.schema, filled);
      const rawText = JSON.stringify(draft, null, 2);
      const validated = validateSchema(draft, input.schema);
      return {
        output: validated.value,
        rawText,
        inputText: JSON.stringify(input.schema) + filled,
      };
    });
  };

  provider.classify = async (input: AIClassifyInput) => {
    const filled = interpolate(input.prompt, input.variables);
    return envelope<string>(input.model, () => {
      // Deterministic-ish pick: hash by length.
      const picked = input.labels[(filled.length) % input.labels.length] ?? input.labels[0];
      return { output: picked, rawText: picked, inputText: filled + input.labels.join(",") };
    });
  };

  return provider;
}

export type { AIProviderId };
