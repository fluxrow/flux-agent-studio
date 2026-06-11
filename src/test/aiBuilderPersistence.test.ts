import { afterEach, describe, expect, it, vi } from "vitest";

const facadePorts = vi.hoisted(() => ({
  create: vi.fn().mockRejectedValue(new Error("default facade must not be used")),
  saveBlocks: vi.fn().mockRejectedValue(new Error("default facade must not be used")),
  saveConnections: vi.fn().mockRejectedValue(new Error("default facade must not be used")),
}));

vi.mock("@/domain", () => {
  throw new Error("legacy global repositories must not be imported");
});

vi.mock("@/domain/persistence", () => ({
  persistence: {
    bots: { create: facadePorts.create },
    flows: {
      saveBlocks: facadePorts.saveBlocks,
      saveConnections: facadePorts.saveConnections,
    },
  },
}));

vi.mock("@/ai/registry", () => ({
  DEFAULT_PROVIDER: "openai",
  getAIProvider: vi.fn(),
}));

import {
  materializeBlueprint,
  type AIBuilderPersistencePorts,
} from "@/ai-builder/generator";
import type { BotBlueprint } from "@/ai-builder/types";

const blueprint: BotBlueprint = {
  bot: {
    name: "SDR Teste",
    description: "Qualifica leads de teste",
    channel: "web",
    objective: "qualificar_leads",
  },
  flow: {
    name: "Fluxo SDR Teste",
    description: "Fluxo de teste",
    steps: [
      { id: "start", type: "start", label: "Inicio" },
      { id: "end", type: "end", label: "Fim" },
    ],
  },
  leadModel: {
    fields: [],
    tags: [],
    initialScore: 0,
    pipeline: [],
  },
  knowledge: { suggestedDocuments: [] },
  conversation: {
    tone: "consultivo",
    greeting: "Ola",
    fallback: "Tente novamente",
  },
  meta: {
    provider: "test",
    model: "test",
    durationMs: 0,
    inputTokens: 0,
    outputTokens: 0,
    estimatedCost: 0,
    promptHash: "test",
    generatedAt: "2026-06-10T00:00:00.000Z",
  },
};

afterEach(() => {
  vi.clearAllMocks();
});

describe("AI Builder persistence ports", () => {
  it("materializes bot and flow through the injected ports", async () => {
    const create = vi.fn().mockResolvedValue({
      id: "bot_injected",
      workspaceId: "workspace_test",
      name: blueprint.bot.name,
      description: blueprint.bot.description,
      status: "rascunho" as const,
      channel: blueprint.bot.channel,
      metrics: { conversations: 0, conversions: 0 },
      createdAt: "2026-06-10T00:00:00.000Z",
      updatedAt: "2026-06-10T00:00:00.000Z",
    });
    const saveBlocks = vi.fn().mockResolvedValue(undefined);
    const saveConnections = vi.fn().mockResolvedValue(undefined);
    const ports: AIBuilderPersistencePorts = {
      bots: { create },
      flows: { saveBlocks, saveConnections },
    };

    const result = await materializeBlueprint(blueprint, ports);

    expect(create).toHaveBeenCalledWith({
      name: blueprint.bot.name,
      description: blueprint.bot.description,
      channel: blueprint.bot.channel,
    });
    expect(saveBlocks).toHaveBeenCalledWith("bot_injected", result.flow.blocks);
    expect(saveConnections).toHaveBeenCalledWith(
      "bot_injected",
      result.flow.connections,
    );
    expect(result.botId).toBe("bot_injected");
    expect(facadePorts.create).not.toHaveBeenCalled();
    expect(facadePorts.saveBlocks).not.toHaveBeenCalled();
    expect(facadePorts.saveConnections).not.toHaveBeenCalled();
  });
});
