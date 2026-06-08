import type {
  AIProvider,
  AIGenerateInput,
  AIExtractInput,
  AIClassifyInput,
  AIResponse,
  AIUsage,
  AIModelInfo,
  AIOutputSchema,
} from "../types";
import { validateSchema, safeParseJSON } from "../schema";
import { supabase } from "@/integrations/supabase/client";

const DEFAULT_TIMEOUT_MS = 30_000;
const MAX_RETRIES = 2;

// Lovable AI Gateway models. Default = google/gemini-3-flash-preview (free during promo).
const MODELS: AIModelInfo[] = [
  { id: "google/gemini-3-flash-preview", label: "Gemini 3 Flash (Lovable AI)", inputCostPer1k: 0, outputCostPer1k: 0 },
  { id: "google/gemini-2.5-flash",       label: "Gemini 2.5 Flash",            inputCostPer1k: 0, outputCostPer1k: 0 },
  { id: "google/gemini-2.5-pro",         label: "Gemini 2.5 Pro",              inputCostPer1k: 0, outputCostPer1k: 0 },
  { id: "openai/gpt-5-mini",             label: "GPT-5 mini",                  inputCostPer1k: 0, outputCostPer1k: 0 },
  { id: "openai/gpt-5",                  label: "GPT-5",                       inputCostPer1k: 0, outputCostPer1k: 0 },
];

function interpolate(s: string, vars?: Record<string, unknown>): string {
  if (!vars) return s;
  return s.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, k: string) => {
    const v = vars[k];
    return v === undefined || v === null ? "" : String(v);
  });
}

function pickModel(requested?: string): AIModelInfo {
  return MODELS.find((m) => m.id === requested) ?? MODELS[0];
}

interface LovableAiRaw {
  rawText: string;
  usage: { prompt_tokens: number; completion_tokens: number };
}

async function callGateway(body: Record<string, unknown>, attempt = 0): Promise<LovableAiRaw> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  let res: Response;
  try {
    const invoke = await supabase.functions.invoke("lovable-ai", {
      body,
    });
    if (invoke.error) {
      // Retry transient errors
      if (attempt < MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, 500 * 2 ** attempt));
        return callGateway(body, attempt + 1);
      }
      throw new Error(`Lovable AI: ${invoke.error.message}`);
    }
    const data = invoke.data as {
      choices?: Array<{ message?: { content?: string } }>;
      usage?: { prompt_tokens?: number; completion_tokens?: number };
      error?: { message?: string };
    };
    if (data?.error) {
      throw new Error(`Lovable AI: ${data.error.message}`);
    }
    return {
      rawText: data.choices?.[0]?.message?.content ?? "",
      usage: {
        prompt_tokens: data.usage?.prompt_tokens ?? 0,
        completion_tokens: data.usage?.completion_tokens ?? 0,
      },
    };
  } finally {
    clearTimeout(timer);
  }
}

function buildUsage(raw: LovableAiRaw["usage"], model: AIModelInfo): AIUsage {
  return {
    inputTokens: raw.prompt_tokens,
    outputTokens: raw.completion_tokens,
    estimatedCost:
      Math.round(
        ((raw.prompt_tokens / 1000) * model.inputCostPer1k +
          (raw.completion_tokens / 1000) * model.outputCostPer1k) *
          1_000_000,
      ) / 1_000_000,
  };
}

function envelope<T>(
  output: T,
  rawText: string,
  model: AIModelInfo,
  usage: AIUsage,
  t0: number,
): AIResponse<T> {
  return {
    provider: "openai",
    model: model.id,
    output,
    rawText,
    usage,
    durationMs: Math.round(performance.now() - t0),
    finishedAt: new Date().toISOString(),
  };
}

function schemaToPrompt(schema: AIOutputSchema): string {
  return Object.entries(schema)
    .map(([k, v]) => {
      const type = typeof v === "string" ? v : (v as { type: string }).type;
      return `"${k}" (${type})`;
    })
    .join(", ");
}

export const openaiProvider: AIProvider = {
  id: "openai",
  label: "Lovable AI",
  description: "Gemini & GPT models via Lovable AI Gateway (no API key required).",
  models: MODELS,
  defaultModel: "google/gemini-3-flash-preview",

  async generate(input: AIGenerateInput): Promise<AIResponse<string>> {
    const t0 = performance.now();
    const model = pickModel(input.model);
    const userPrompt = interpolate(input.prompt, input.variables);
    const systemPrompt = input.system ?? "Você é um assistente útil e conciso.";

    const raw = await callGateway({
      model: model.id,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: input.temperature ?? 0.7,
      max_tokens: input.maxTokens ?? 1024,
    });

    const usage = buildUsage(raw.usage, model);
    return envelope(raw.rawText, raw.rawText, model, usage, t0);
  },

  async extract<S extends AIOutputSchema>(
    input: AIExtractInput<S>,
  ): Promise<AIResponse<Record<string, unknown>>> {
    const t0 = performance.now();
    const model = pickModel(input.model);
    const userPrompt = interpolate(input.prompt, input.variables);
    const fields = schemaToPrompt(input.schema);

    const raw = await callGateway({
      model: model.id,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `Você deve responder APENAS com um JSON válido contendo exatamente os campos: ${fields}. Não inclua texto fora do JSON.`,
        },
        { role: "user", content: userPrompt },
      ],
      temperature: input.temperature ?? 0.2,
      max_tokens: 1024,
    });

    const parsed = safeParseJSON(raw.rawText);
    const { value } = validateSchema(parsed, input.schema);

    const usage = buildUsage(raw.usage, model);
    return envelope(value, raw.rawText, model, usage, t0);
  },

  async classify(input: AIClassifyInput): Promise<AIResponse<string>> {
    const t0 = performance.now();
    const model = pickModel(input.model);
    const userPrompt = interpolate(input.prompt, input.variables);
    const options = input.labels.join(", ");

    const raw = await callGateway({
      model: model.id,
      messages: [
        {
          role: "system",
          content: `Responda com APENAS uma palavra, sem pontuação, sem explicação. A palavra deve ser exatamente uma das seguintes opções: ${options}`,
        },
        { role: "user", content: userPrompt },
      ],
      temperature: 0,
      max_tokens: 20,
    });

    const trimmed = raw.rawText.trim().toLowerCase();
    const matched =
      input.labels.find((l) => l.toLowerCase() === trimmed) ??
      input.labels.find((l) => trimmed.includes(l.toLowerCase())) ??
      input.labels[0];

    const usage = buildUsage(raw.usage, model);
    return envelope(matched, raw.rawText, model, usage, t0);
  },
};
