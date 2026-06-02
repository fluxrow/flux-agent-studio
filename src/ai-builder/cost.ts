/**
 * AI Builder — ring-buffer cost tracker.
 * Keeps the last N generations so the UI can show per-run cost/tokens.
 */
import type { BotBlueprint } from "./types";

const KEY = "fluxbot:ai-builder:runs";
const MAX = 50;

export interface AIBuilderRun {
  id: string;
  at: string;
  prompt: string;
  botName: string;
  provider: string;
  model: string;
  durationMs: number;
  inputTokens: number;
  outputTokens: number;
  estimatedCost: number;
  materializedBotId?: string;
}

function read(): AIBuilderRun[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

function write(runs: AIBuilderRun[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(runs.slice(-MAX)));
}

export const aiBuilderCost = {
  list(): AIBuilderRun[] {
    return read().slice().reverse();
  },
  record(run: AIBuilderRun) {
    const all = read();
    all.push(run);
    write(all);
  },
  attachBotId(runId: string, botId: string) {
    const all = read();
    const idx = all.findIndex((r) => r.id === runId);
    if (idx >= 0) {
      all[idx] = { ...all[idx], materializedBotId: botId };
      write(all);
    }
  },
  clear() {
    write([]);
  },
  fromBlueprint(prompt: string, bp: BotBlueprint): AIBuilderRun {
    return {
      id: `aibr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
      at: bp.meta.generatedAt,
      prompt,
      botName: bp.bot.name,
      provider: bp.meta.provider,
      model: bp.meta.model,
      durationMs: bp.meta.durationMs,
      inputTokens: bp.meta.inputTokens,
      outputTokens: bp.meta.outputTokens,
      estimatedCost: bp.meta.estimatedCost,
    };
  },
};
