/**
 * Testes do Dify AI Provider.
 *
 * Estratégia:
 *  - Quando getDifyConfig() retorna null  → fallback mock (sem rede)
 *  - Quando getDifyConfig() retorna config → vi.stubGlobal("fetch") simula a API
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

// ---- mock do módulo de config (controlamos quando o Dify está configurado)
vi.mock("@/ai/providers/dify-config", () => ({
  getDifyConfig: vi.fn(),
}));

import { getDifyConfig } from "@/ai/providers/dify-config";
import { difyProvider } from "@/ai/providers/dify";

const mockGetConfig = getDifyConfig as ReturnType<typeof vi.fn>;

// ---- resposta padrão do fetch mockado
function makeDifyResponse(answer: string, promptTokens = 10, completionTokens = 5) {
  return {
    id: "msg-test",
    answer,
    created_at: Math.floor(Date.now() / 1000),
    usage: { prompt_tokens: promptTokens, completion_tokens: completionTokens },
  };
}

function mockFetchOk(answer: string) {
  const json = makeDifyResponse(answer);
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => json,
      text: async () => JSON.stringify(json),
    }),
  );
}

describe("difyProvider — sem configuração (fallback mock)", () => {
  beforeEach(() => {
    mockGetConfig.mockReturnValue(null);
  });

  it("generate() retorna meta.mock=true quando não configurado", async () => {
    const res = await difyProvider.generate({ prompt: "olá" });
    expect(res.meta).toEqual({ mock: true });
    expect(res.provider).toBe("dify");
  });

  it("extract() retorna meta.mock=true quando não configurado", async () => {
    const res = await difyProvider.extract({
      prompt: "dados do lead",
      schema: { nome: "string", score: "number" },
    });
    expect(res.meta).toEqual({ mock: true });
    expect(res.provider).toBe("dify");
  });

  it("classify() retorna meta.mock=true quando não configurado", async () => {
    const res = await difyProvider.classify({
      prompt: "classifique este lead",
      labels: ["quente", "morno", "frio"],
    });
    expect(res.meta).toEqual({ mock: true });
    expect(res.provider).toBe("dify");
    expect(["quente", "morno", "frio"]).toContain(res.output);
  });
});

describe("difyProvider — com configuração (fetch mockado)", () => {
  const CFG = { baseUrl: "http://localhost:3001", apiKey: "app-test-key" };

  beforeEach(() => {
    mockGetConfig.mockReturnValue(CFG);
  });

  it("generate() chama /v1/chat-messages com o prompt correto", async () => {
    mockFetchOk("Olá! Como posso ajudar?");

    const res = await difyProvider.generate({ prompt: "oi" });

    expect(res.provider).toBe("dify");
    expect(res.model).toBe("dify-default");
    expect(res.output).toBe("Olá! Como posso ajudar?");
    expect(res.rawText).toBe("Olá! Como posso ajudar?");

    const [url, opts] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [
      string,
      RequestInit,
    ];
    expect(url).toBe("http://localhost:3001/v1/chat-messages");
    expect((opts.headers as Record<string, string>)["Authorization"]).toBe(
      "Bearer app-test-key",
    );
    const body = JSON.parse(opts.body as string);
    expect(body.query).toBe("oi");
    expect(body.response_mode).toBe("blocking");
  });

  it("generate() preenche usage com tokens da resposta", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => makeDifyResponse("resposta", 20, 8),
      }),
    );

    const res = await difyProvider.generate({ prompt: "teste" });

    expect(res.usage.inputTokens).toBe(20);
    expect(res.usage.outputTokens).toBe(8);
    expect(res.usage.estimatedCost).toBe(0);
  });

  it("generate() lança erro quando Dify retorna status 4xx", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        text: async () => '{"message":"Unauthorized"}',
      }),
    );

    await expect(difyProvider.generate({ prompt: "x" })).rejects.toThrow("Dify HTTP 401");
  });

  it("extract() constrói prompt com instrução JSON e valida o schema", async () => {
    const json = JSON.stringify({ nome: "João", score: 90 });
    mockFetchOk(json);

    const res = await difyProvider.extract({
      prompt: "extraia os dados",
      schema: { nome: "string", score: "number" },
    });

    expect(res.output).toMatchObject({ nome: "João", score: 90 });

    const body = JSON.parse(
      ((fetch as ReturnType<typeof vi.fn>).mock.calls[0][1] as RequestInit).body as string,
    );
    expect(body.query).toContain('"nome" (string)');
    expect(body.query).toContain('"score" (number)');
  });

  it("classify() retorna um dos labels fornecidos", async () => {
    mockFetchOk("quente");

    const res = await difyProvider.classify({
      prompt: "qual é a temperatura do lead?",
      labels: ["quente", "morno", "frio"],
    });

    expect(res.output).toBe("quente");
  });

  it("classify() normaliza label que veio com case diferente", async () => {
    mockFetchOk("MORNO");

    const res = await difyProvider.classify({
      prompt: "classifique",
      labels: ["quente", "morno", "frio"],
    });

    expect(res.output).toBe("morno");
  });

  it("classify() faz fallback para o primeiro label quando resposta é inválida", async () => {
    mockFetchOk("nao-sei");

    const res = await difyProvider.classify({
      prompt: "classifique",
      labels: ["quente", "morno", "frio"],
    });

    expect(res.output).toBe("quente");
  });
});
