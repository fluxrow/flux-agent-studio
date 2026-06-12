/**
 * Smoke test ponta a ponta: registry → provider Dify → generate/extract/classify.
 *
 * Roda em modo mock (sem instância Dify real) para poder executar em qualquer
 * ambiente. Demonstra o fluxo completo que o runtime usaria em produção.
 */
import { describe, it, expect, vi, beforeAll } from "vitest";

// openai.ts importa supabase no topo (module-level) — mock obrigatório para
// evitar "supabaseUrl is required" ao carregar @/ai/registry → @/ai/providers.
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    functions: { invoke: vi.fn() },
  },
}));

// Garante fallback mock: sem config de Dify real no ambiente de CI/dev
vi.mock("@/ai/providers/dify-config", () => ({
  getDifyConfig: vi.fn().mockReturnValue(null),
}));

import { getAIProvider, listAIProviders } from "@/ai/registry";
import { runAiBlock } from "@/ai/runner";

// ── stubs mínimos para o runner não explodir fora do browser ──────────────
vi.mock("@/runtime/events/bus", () => ({
  runtimeEventBus: { emit: vi.fn() },
}));
vi.mock("@/ai/inspector", () => ({
  aiInspector: { record: vi.fn() },
}));
vi.mock("@/knowledge/retriever", () => ({
  retrieveKnowledge: vi.fn().mockResolvedValue([]),
  formatContext: vi.fn().mockReturnValue(""),
}));
vi.mock("@/knowledge/events", () => ({
  emitKnowledgeEvent: vi.fn(),
}));

// ── helpers de log ────────────────────────────────────────────────────────

function banner(title: string) {
  console.log("\n" + "─".repeat(60));
  console.log(`  ${title}`);
  console.log("─".repeat(60));
}

function logResponse(label: string, res: { provider: string; model: string; output: unknown; usage: { inputTokens: number; outputTokens: number }; durationMs: number; meta?: unknown }) {
  console.log(`\n[${label}]`);
  console.log(`  provider : ${res.provider}`);
  console.log(`  model    : ${res.model}`);
  console.log(`  output   : ${JSON.stringify(res.output)}`);
  console.log(`  tokens   : in=${res.usage.inputTokens} out=${res.usage.outputTokens}`);
  console.log(`  duration : ${res.durationMs}ms`);
  if (res.meta) console.log(`  meta     : ${JSON.stringify(res.meta)}`);
}

// ─────────────────────────────────────────────────────────────────────────

describe("Dify Smoke Test — fluxo ponta a ponta", () => {

  beforeAll(() => {
    banner("DIFY SMOKE TEST  (modo mock — sem instância Dify real)");
  });

  // 1. Registry ─────────────────────────────────────────────────────────────

  it("1. Registry resolve corretamente o provider dify", () => {
    banner("1. Registry → getAIProvider('dify')");

    const provider = getAIProvider("dify");

    console.log(`  id          : ${provider.id}`);
    console.log(`  label       : ${provider.label}`);
    console.log(`  description : ${provider.description}`);
    console.log(`  models      : ${provider.models.map((m) => m.id).join(", ")}`);
    console.log(`  defaultModel: ${provider.defaultModel}`);

    expect(provider.id).toBe("dify");
    expect(provider.label).toBe("Dify");
    expect(provider.models.length).toBeGreaterThan(0);
  });

  it("2. listAIProviders() inclui dify junto aos outros providers", () => {
    banner("2. listAIProviders() — catálogo completo");

    const providers = listAIProviders();
    const ids = providers.map((p) => p.id);

    console.log(`  providers registrados: ${ids.join(", ")}`);

    expect(ids).toContain("openai");
    expect(ids).toContain("anthropic");
    expect(ids).toContain("gemini");
    expect(ids).toContain("dify");
    expect(ids).toHaveLength(4);
  });

  // 2. generate() ──────────────────────────────────────────────────────────

  it("3. generate() — geração de texto livre", async () => {
    banner("3. difyProvider.generate()");

    const provider = getAIProvider("dify");
    const res = await provider.generate({
      prompt: "Resuma em uma frase o que é um CRM conversacional.",
    });

    logResponse("generate", res);

    expect(res.provider).toBe("dify");
    expect(typeof res.output).toBe("string");
    expect((res.output as string).length).toBeGreaterThan(0);
    expect(res.rawText).toBe(res.output);
    expect(res.durationMs).toBeGreaterThan(0);
    expect(res.finishedAt).toBeTruthy();
  });

  it("4. generate() — interpola variáveis no prompt", async () => {
    banner("4. difyProvider.generate() com variáveis");

    const provider = getAIProvider("dify");
    const res = await provider.generate({
      prompt: "O lead {{nome}} está interessado em {{produto}}. Como abordar?",
      variables: { nome: "João Silva", produto: "plano enterprise" },
    });

    logResponse("generate+vars", res);

    expect(res.provider).toBe("dify");
    expect(typeof res.output).toBe("string");
  });

  // 3. extract() ──────────────────────────────────────────────────────────

  it("5. extract() — extração estruturada com schema", async () => {
    banner("5. difyProvider.extract()");

    const provider = getAIProvider("dify");
    const res = await provider.extract({
      prompt: "Extraia os dados do lead: João Silva, orçamento R$50k, cidade São Paulo.",
      schema: {
        nome: "string",
        orcamento: "number",
        cidade: "string",
        qualificado: "boolean",
      },
    });

    logResponse("extract", res);
    console.log("  output detalhado:", JSON.stringify(res.output, null, 4));

    expect(res.provider).toBe("dify");
    expect(typeof res.output).toBe("object");
    const out = res.output as Record<string, unknown>;
    expect(out).toHaveProperty("nome");
    expect(out).toHaveProperty("orcamento");
    expect(out).toHaveProperty("cidade");
    expect(out).toHaveProperty("qualificado");
  });

  // 4. classify() ──────────────────────────────────────────────────────────

  it("6. classify() — classificação de lead por temperatura", async () => {
    banner("6. difyProvider.classify()");

    const provider = getAIProvider("dify");
    const res = await provider.classify({
      prompt: "Lead perguntou sobre preços, pediu proposta e marcou reunião.",
      labels: ["quente", "morno", "frio"],
    });

    logResponse("classify", res);

    expect(res.provider).toBe("dify");
    expect(["quente", "morno", "frio"]).toContain(res.output as string);
  });

  // 5. runAiBlock() — fluxo completo via runner ────────────────────────────

  it("7. runAiBlock() — gera texto e grava na variável de output", async () => {
    banner("7. runAiBlock() geração → variableUpdates");

    const result = await runAiBlock({
      config: {
        provider: "dify",
        prompt: "Crie uma mensagem de boas-vindas para o lead {{nome}}.",
        outputVariable: "mensagem_boas_vindas",
      },
      variables: { nome: "Maria" },
      sessionId: "smoke-session-001",
      flowId: "smoke-flow-001",
      blockId: "smoke-block-001",
    });

    console.log(`\n[runAiBlock - generate]`);
    console.log(`  ok               : ${result.ok}`);
    console.log(`  variableUpdates  : ${JSON.stringify(result.variableUpdates)}`);
    if (result.response) {
      console.log(`  provider         : ${result.response.provider}`);
      console.log(`  durationMs       : ${result.response.durationMs}ms`);
    }

    expect(result.ok).toBe(true);
    expect(result.variableUpdates).toHaveProperty("mensagem_boas_vindas");
    expect(typeof result.variableUpdates["mensagem_boas_vindas"]).toBe("string");
  });

  it("8. runAiBlock() — extração estruturada e mapeamento de variáveis", async () => {
    banner("8. runAiBlock() extract → mappings");

    const result = await runAiBlock({
      config: {
        provider: "dify",
        prompt: "Extraia os dados do contato abaixo.",
        outputSchema: { nome: "string", email: "string", interesse: "string" },
        mappings: [
          { from: "nome",      to: "lead.name" },
          { from: "email",     to: "lead.email" },
          { from: "interesse", to: "lead.tag" },
        ],
      },
      sessionId: "smoke-session-002",
    });

    console.log(`\n[runAiBlock - extract+mappings]`);
    console.log(`  ok               : ${result.ok}`);
    console.log(`  variableUpdates  : ${JSON.stringify(result.variableUpdates, null, 4)}`);

    expect(result.ok).toBe(true);
    expect(result.variableUpdates).toHaveProperty("lead.name");
    expect(result.variableUpdates).toHaveProperty("lead.email");
    expect(result.variableUpdates).toHaveProperty("lead.tag");
  });
});
