import type { AIProvider, AIProviderId } from "./types";
import { openaiProvider, anthropicProvider, geminiProvider, difyProvider } from "./providers";

const registry: Record<AIProviderId, AIProvider> = {
  openai: openaiProvider,
  anthropic: anthropicProvider,
  gemini: geminiProvider,
  dify: difyProvider,
};

export function getAIProvider(id: AIProviderId): AIProvider {
  return registry[id] ?? openaiProvider;
}

export function listAIProviders(): AIProvider[] {
  return Object.values(registry);
}

export const DEFAULT_PROVIDER: AIProviderId = "openai";
