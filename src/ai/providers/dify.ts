/**
 * Dify AI Provider — integração com instância Dify self-hosted.
 *
 * O FluxBot atua como runtime/CRM/canais; o Dify é o motor de IA
 * (RAG, agentes, orquestração de modelos). Esta camada adapta o contrato
 * AIProvider do FluxBot para a REST API do Dify.
 *
 * Configuração (variáveis de ambiente Vite):
 *   VITE_DIFY_BASE_URL  — URL base da instância Dify (ex.: http://localhost)
 *   VITE_DIFY_API_KEY   — API key da aplicação Dify (ex.: app-xxxxxxxx)
 *
 * Quando as variáveis não estão presentes, cai automaticamente no provider
 * mock local para não quebrar o dev/demo mode.
 */
import type {
  AIProvider,
  AIGenerateInput,
  AIExtractInput,
  AIClassifyInput,
  AIResponse,
  AIModelInfo,
  AIUsage,
  AIOutputSchema,
} from "../types";
import { buildMockProvider } from "./_mock";
import { validateSchema, safeParseJSON } from "../schema";
import { getDifyConfig } from "./dify-config";

const TIMEOUT_MS = 30_000;

export const DIFY_MODELS: AIModelInfo[] = [
  { id: "dify-default", label: "Dify (app padrão)", inputCostPer1k: 0, outputCostPer1k: 0 },
];

const fallback = buildMockProvider({
  id: "dify",
  label: "Dify (mock)",
  description: "Fallback local — configure VITE_DIFY_BASE_URL e VITE_DIFY_API_KEY para usar Dify real.",
  models: DIFY_MODELS,
  defaultModel: "dify-default",
});

// ------------------------------------------------------------------ types

interface DifyRawResponse {
  id: string;
  answer: string;
  created_at: number;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
  };
}

// ------------------------------------------------------------------ http

async function callDify(
  baseUrl: string,
  apiKey: string,
  query: string,
  user: string,
  inputs?: Record<string, unknown>,
): Promise<DifyRawResponse> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${baseUrl}/v1/chat-messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        inputs: inputs ?? {},
        query,
        response_mode: "blocking",
        conversation_id: "",
        user,
      }),
      signal: controller.signal,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Dify HTTP ${res.status}: ${text}`);
    }
    return (await res.json()) as DifyRawResponse;
  } finally {
    clearTimeout(timer);
  }
}

// ------------------------------------------------------------------ helpers

function buildUsage(raw: DifyRawResponse["usage"]): AIUsage {
  return {
    inputTokens: raw?.prompt_tokens ?? 0,
    outputTokens: raw?.completion_tokens ?? 0,
    estimatedCost: 0,
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

function sessionUser(): string {
  return `fluxbot-${Date.now().toString(36)}`;
}

// ------------------------------------------------------------------ provider

export const difyProvider: AIProvider = {
  id: "dify",
  label: "Dify",
  description: "Motor de IA via Dify self-hosted: RAG, agentes e orquestração de modelos.",
  models: DIFY_MODELS,
  defaultModel: "dify-default",

  async generate(input: AIGenerateInput): Promise<AIResponse<string>> {
    const cfg = getDifyConfig();
    if (!cfg) return fallback.generate(input);

    const t0 = performance.now();
    const raw = await callDify(
      cfg.baseUrl,
      cfg.apiKey,
      input.prompt,
      sessionUser(),
      input.variables as Record<string, unknown> | undefined,
    );
    const usage = buildUsage(raw.usage);
    return {
      provider: "dify",
      model: "dify-default",
      output: raw.answer,
      rawText: raw.answer,
      usage,
      durationMs: Math.round(performance.now() - t0),
      finishedAt: new Date().toISOString(),
    };
  },

  async extract<S extends AIOutputSchema>(
    input: AIExtractInput<S>,
  ): Promise<AIResponse<Record<string, unknown>>> {
    const cfg = getDifyConfig();
    if (!cfg) return fallback.extract(input);

    const t0 = performance.now();
    const fields = schemaToPrompt(input.schema);
    const query =
      `Responda APENAS com um JSON válido contendo exatamente os campos: ${fields}. Não inclua texto fora do JSON.\n\n${input.prompt}`;

    const raw = await callDify(cfg.baseUrl, cfg.apiKey, query, sessionUser());
    const parsed = safeParseJSON(raw.answer);
    const { value } = validateSchema(parsed, input.schema);
    const usage = buildUsage(raw.usage);
    return {
      provider: "dify",
      model: "dify-default",
      output: value,
      rawText: raw.answer,
      usage,
      durationMs: Math.round(performance.now() - t0),
      finishedAt: new Date().toISOString(),
    };
  },

  async classify(input: AIClassifyInput): Promise<AIResponse<string>> {
    const cfg = getDifyConfig();
    if (!cfg) return fallback.classify(input);

    const t0 = performance.now();
    const options = input.labels.join(", ");
    const query =
      `Responda com APENAS uma palavra, sem pontuação, sem explicação. Deve ser exatamente uma de: ${options}.\n\n${input.prompt}`;

    const raw = await callDify(cfg.baseUrl, cfg.apiKey, query, sessionUser());
    const trimmed = raw.answer.trim().toLowerCase();
    const matched =
      input.labels.find((l) => l.toLowerCase() === trimmed) ??
      input.labels.find((l) => trimmed.includes(l.toLowerCase())) ??
      input.labels[0];
    const usage = buildUsage(raw.usage);
    return {
      provider: "dify",
      model: "dify-default",
      output: matched,
      rawText: raw.answer,
      usage,
      durationMs: Math.round(performance.now() - t0),
      finishedAt: new Date().toISOString(),
    };
  },
};
