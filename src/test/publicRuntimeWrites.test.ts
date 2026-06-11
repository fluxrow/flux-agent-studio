import { beforeEach, describe, expect, it, vi } from "vitest";

const rpc = vi.hoisted(() => vi.fn());

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { rpc },
}));

vi.mock("@/lib/runtime-config", () => ({
  USE_SUPABASE: true,
}));

vi.mock("@/beta/demoMode", () => ({
  isDemoMode: () => false,
}));

vi.mock("@/domain/persistence", () => ({
  persistence: {},
}));

vi.mock("@/beta/demoDataset", () => ({
  DEMO_BOTS: [],
  DEMO_FLOW: {},
}));

import { setPublicAiRuntimeContext } from "@/ai/publicRuntimeContext";
import {
  recordPublicEvent,
  recordPublicLead,
  recordPublicMessage,
} from "@/lib/public-runtime";

describe("public runtime writes", () => {
  beforeEach(() => {
    rpc.mockReset();
    rpc.mockResolvedValue({ data: "lead-1", error: null });
    setPublicAiRuntimeContext({
      sessionId: "session-1",
      token: "session-token",
    });
  });

  it("sends the session token with every protected write", async () => {
    await recordPublicEvent("session-1", "bot_loaded");
    await recordPublicMessage("session-1", "user", "hello");
    await recordPublicLead("session-1", "bot-1", "workspace-1", {
      name: "Lead",
    });

    expect(rpc).toHaveBeenNthCalledWith(
      1,
      "record_public_event",
      expect.objectContaining({ _session_token: "session-token" }),
    );
    expect(rpc).toHaveBeenNthCalledWith(
      2,
      "record_public_message",
      expect.objectContaining({ _session_token: "session-token" }),
    );
    expect(rpc).toHaveBeenNthCalledWith(
      3,
      "record_public_lead",
      expect.objectContaining({ _session_token: "session-token" }),
    );
  });

  it("rejects a write for a different session before calling Supabase", async () => {
    await expect(
      recordPublicMessage("session-2", "user", "hello"),
    ).rejects.toThrow("Public session token is unavailable");
    expect(rpc).not.toHaveBeenCalled();
  });
});
