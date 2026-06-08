import { buildMockProvider } from "./_mock";
export { openaiProvider } from "./openai";

export const anthropicProvider = buildMockProvider({
  id: "anthropic",
  label: "Anthropic",
  description: "Claude family. Mock mode.",
  defaultModel: "claude-sonnet-4",
  models: [
    { id: "claude-opus-4",   label: "Claude Opus 4",   inputCostPer1k: 0.015,  outputCostPer1k: 0.075 },
    { id: "claude-sonnet-4", label: "Claude Sonnet 4", inputCostPer1k: 0.003,  outputCostPer1k: 0.015 },
    { id: "claude-haiku-4",  label: "Claude Haiku 4",  inputCostPer1k: 0.001,  outputCostPer1k: 0.005 },
  ],
});

export const geminiProvider = buildMockProvider({
  id: "gemini",
  label: "Google Gemini",
  description: "Gemini family. Mock mode.",
  defaultModel: "gemini-3-flash",
  models: [
    { id: "gemini-3-pro",   label: "Gemini 3 Pro",   inputCostPer1k: 0.0025, outputCostPer1k: 0.010 },
    { id: "gemini-3-flash", label: "Gemini 3 Flash", inputCostPer1k: 0.0006, outputCostPer1k: 0.0024 },
    { id: "gemini-3-lite",  label: "Gemini 3 Lite",  inputCostPer1k: 0.0002, outputCostPer1k: 0.0008 },
  ],
});
