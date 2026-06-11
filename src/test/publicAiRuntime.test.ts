import { beforeEach, describe, expect, it, vi } from "vitest";

const invoke = vi.hoisted(() => vi.fn());
const storage = new Map<string, string>();

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    functions: { invoke },
  },
}));

import { openaiProvider } from "@/ai/providers/openai";
import {
  clearPublicAiRuntimeContext,
  setPublicAiRuntimeContext,
} from "@/ai/publicRuntimeContext";

describe("public AI runtime authorization", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
      removeItem: (key: string) => storage.delete(key),
    });
    storage.clear();
    invoke.mockReset();
    clearPublicAiRuntimeContext("public-session");
    localStorage.removeItem("fluxbot.demoMode");
    invoke.mockResolvedValue({
      data: {
        choices: [{ message: { content: "ok" } }],
        usage: { prompt_tokens: 1, completion_tokens: 1 },
      },
      error: null,
    });
  });

  it("forwards the public session proof to the AI gateway", async () => {
    setPublicAiRuntimeContext({
      sessionId: "public-session",
      token: "public-token",
    });

    await openaiProvider.generate({ prompt: "hello" });

    expect(invoke).toHaveBeenCalledWith(
      "lovable-ai",
      expect.objectContaining({
        headers: {
          "x-public-ai-session": "public-session",
          "x-public-ai-token": "public-token",
        },
      }),
    );
  });

  it("does not retry a failed public gateway call", async () => {
    setPublicAiRuntimeContext({
      sessionId: "public-session",
      token: "public-token",
    });
    invoke.mockResolvedValue({
      data: null,
      error: new Error("gateway unavailable"),
    });

    await expect(openaiProvider.generate({ prompt: "hello" })).rejects.toThrow(
      "gateway unavailable",
    );
    expect(invoke).toHaveBeenCalledTimes(1);
  });

  it("uses the local provider in demo mode", async () => {
    localStorage.setItem("fluxbot.demoMode", "1");

    const response = await openaiProvider.generate({ prompt: "hello" });

    expect(response.meta).toEqual({ mock: true });
    expect(invoke).not.toHaveBeenCalled();
  });
});
