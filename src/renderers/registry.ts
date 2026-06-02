/**
 * Renderer Registry + A/B Testing Foundation.
 *
 * Renderers are looked up by `RendererId`. Each id may have multiple
 * Variants (A/B) registered; today we ship only Variant A. The registry
 * is ready to resolve experiments later — analytics not implemented yet,
 * only the architecture.
 */
import type { ConversationRenderer, RendererId, Variant } from "./types";
import {
  chatgptRenderer,
  formRenderer,
  instagramRenderer,
  messengerRenderer,
  whatsappRenderer,
} from "./builtins";

type VariantMap = Partial<Record<Variant, ConversationRenderer>>;

const registry = new Map<RendererId, VariantMap>();

function register(id: RendererId, variant: Variant, renderer: ConversationRenderer) {
  const existing = registry.get(id) ?? {};
  existing[variant] = renderer;
  registry.set(id, existing);
}

register("whatsapp",  "a", whatsappRenderer);
register("instagram", "a", instagramRenderer);
register("messenger", "a", messengerRenderer);
register("chatgpt",   "a", chatgptRenderer);
register("form",      "a", formRenderer);

export function getRenderer(id: RendererId, variant: Variant = "a"): ConversationRenderer {
  const variants = registry.get(id);
  if (!variants) return whatsappRenderer;
  return variants[variant] ?? variants.a ?? whatsappRenderer;
}

export function listRenderers(): ConversationRenderer[] {
  return Array.from(registry.values()).map((v) => v.a!).filter(Boolean);
}

export function listVariants(id: RendererId): Variant[] {
  const m = registry.get(id);
  if (!m) return [];
  return Object.keys(m) as Variant[];
}

/** Stub experiment resolver — extend later with workspace-level config. */
export function resolveVariant(_id: RendererId, _visitorId?: string): Variant {
  return "a";
}
