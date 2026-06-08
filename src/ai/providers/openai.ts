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

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const DEFAULT_TIMEOUT_MS = 30_000;
const MAX_RETRIES = 2;

const MODELS: AIModelInfo[] = [
  { id: "gpt-4o",      label: "GPT-4o",      inputCostPer1k: 0.005,   outputCostPer1k: 0.015  },
  { id: "gpt-4o-mini", label: "GPT-4o mini", inputCostPer1k: 0.00015, outputCostPer1k: 0.0006 },
];

function getApiKey(): string {
  const key = import.meta.env.VITE_OPENAI_API_KEY as string | undefined;
  if (!key) throw new Error("VITE_OPENAI_API_KEY não configurada.");
  return key;
}

function interpolate(s: string, vars?: Record<string, unknown>): string {
  if (!vars) return s;
  return s.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, k: string) => {
    const v = vars[k];
    return v === undefined || v === null ? "" : String(v);
  });
}

function pickModel(requested?: string): AIModelInfo {
  return MODELS.find((m) => m.id === requested) ?? MODELS.find((m) => m.id === "gpt-4o-mini")!;
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

interface OpenAIRaw {
  rawText: string;
  usage: { prompt_tokens: number; completion_tokens: number };
}

async function callOpenAI(
  apiKey: string,
  body: Record<string, unknown>,
  attempt = 0
): Promise<OpenAIRaw> {
  let res: Response;
  try {
    res = await fetchWithTimeout(
      OPENAI_API_URL,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
      },
      DEFAULT_TIMEOUT_MS
    );
  } catch (err) {
    const isTimeout = err instanceof Error && err.name === "AbortError";
    if (!isTimeout && attempt < MAX_RETRIES) {
      await new Promise((r) => setTimeout(r, 500 * 2 ** attempt));
      return callOpenAI(apiKey, body, attempt + 1);
    }
    throw new Error(isTimeout ? `OpenAI timeout após ${DEFAULT_TIMEOUT_MS}ms` : String(err));
  }

  // Retry on 429 / 5xx
  if ((res.status === 429 || res.status >= 500) && attempt < MAX_RETRIES) {
    const retryAfter = Number(res.headers.get("retry-after") ?? 1);
    await new Promise((r) => setTimeout(r, Math.max(retryAfter * 1000, 500 * 2 ** attempt)));
    return callOpenAI(apiKey, body, attempt + 1);
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: { message?: string } };
    throw new Error(`OpenAI ${res.status}: ${err?.error?.message ?? res.statusText}`);
  }

  const data = await res.json() as {
    choices?: Array<{ message?: { content?: string } }>;
    usage?: { prompt_tokens?: number; completion_tokens?: number };
  };

  return {
    rawText: data.choices?.[0]?.message?.content ?? "",
    usage: {
      prompt_tokens: data.usage?.prompt_tokens ?? 0,
      completion_tokens: data.usage?.completion_tokens ?? 0,
    },
  };
}

function buildUsage(
  raw: OpenAIRaw["usage"],
  model: AIModelInfo
): AIUsage {
  return {
    inputTokens: raw.prompt_tokens,
    outputTokens: raw.completion_tokens,
    estimatedCost:
      Math.round(
        ((raw.prompt_tokens / 1000) * model.inputCostPer1k +
          (raw.completion_tokens / 1000) * model.outputCostPer1k) *
          1_000_000
      ) / 1_000_000,
  };
}

function envelope<T>(
  output: T,
  rawText: string,
  model: AIModelInfo,
  usage: AIUsage,
  t0: number
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
  label: "OpenAI",
  description: "GPT-4o e GPT-4o-mini via API OpenAI.",
  models: MODELS,
  defaultModel: "gpt-4o-mini",

  async generate(input: AIGenerateInput): Promise<AIResponse<string>> {
    const t0 = performance.now();
    const apiKey = getApiKey();
    const model = pickModel(input.model);
    const userPrompt = interpolate(input.prompt, input.variables);
    const systemPrompt = input.system ?? "Você é um assistente útil e conciso.";

    const raw = await callOpenAI(apiKey, {
      model: model.id,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: input.temperature ?? 0.7,
      max_tokens: input.maxTokens ?? 1024,
    });

    const usage = buildUsage(raw.usage, model);
    console.info(`[openai] generate | model=${model.id} | tokens=${raw.usage.prompt_tokens}+${raw.usage.completion_tokens} | cost=$${usage.estimatedCost}`);
    return envelope(raw.rawText, raw.rawText, model, usage, t0);
  },

  async extract<S extends AIOutputSchema>(
    input: AIExtractInput<S>
  ): Promise<AIResponse<Record<string, unknown>>> {
    const t0 = performance.now();
    const apiKey = getApiKey();
    const model = pickModel(input.model);
    const userPrompt = interpolate(input.prompt, input.variables);
    const fields = schemaToPrompt(input.schema);

    const raw = await callOpenAI(apiKey, {
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
    console.info(`[openai] extract | model=${model.id} | tokens=${raw.usage.prompt_tokens}+${raw.usage.completion_tokens} | cost=$${usage.estimatedCost}`);
    return envelope(value, raw.rawText, model, usage, t0);
  },

  async classify(input: AIClassifyInput): Promise<AIResponse<string>> {
    const t0 = performance.now();
    const apiKey = getApiKey();
    const model = pickModel(input.model);
    const userPrompt = interpolate(input.prompt, input.variables);
    const options = input.labels.join(", ");

    const raw = await callOpenAI(apiKey, {
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
    console.info(`[openai] classify | model=${model.id} | result="${matched}" | tokens=${raw.usage.prompt_tokens}+${raw.usage.completion_tokens}`);
    return envelope(matched, raw.rawText, model, usage, t0);
  },
};
