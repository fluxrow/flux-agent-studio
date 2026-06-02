/**
 * Conversation Renderer — types.
 *
 * A ConversationRenderer is a pure presentation surface for a running
 * RuntimeEngine. The engine doesn't know any renderer exists; renderers
 * subscribe to its state and decide how to display transcript items,
 * choices, composer, header, etc.
 *
 *   RuntimeEngine ── state ──► ConversationRenderer ── theme ──► UI
 *
 * Adding a new channel (WhatsApp, Instagram, Form…) means writing a new
 * renderer module — never editing the engine.
 */
import type { ComponentType } from "react";
import type { RuntimeEngine } from "@/runtime";
import type { EngineState } from "@/runtime/types";

export type TypingMode = "instant" | "realistic" | "custom";

export interface TypingConfig {
  mode: TypingMode;
  /** ms per character for "realistic"; ignored otherwise. */
  msPerChar?: number;
  /** Absolute floor / ceiling for any computed delay. */
  minDelayMs?: number;
  maxDelayMs?: number;
}

export type DelayMode = "fixed" | "random" | "per_block";

export interface DelayConfig {
  mode: DelayMode;
  fixedMs?: number;
  randomMinMs?: number;
  randomMaxMs?: number;
}

export interface RendererTheme {
  /** Channel id (whatsapp, instagram, …). */
  id: string;
  label: string;
  /** Surface colors — interpreted as CSS values (HSL/hex/var() ok). */
  background: string;
  surface: string;
  header: string;
  botBubble: string;
  botText: string;
  userBubble: string;
  userText: string;
  accent: string;
  /** Optional font stack. */
  fontFamily?: string;
  /** Avatar url or letter. */
  avatar?: string;
  /** Bubble radius (Tailwind size, e.g. "rounded-2xl"). */
  bubbleRadius?: string;
  /** Header subtitle. */
  subtitle?: string;
}

export interface RendererProps {
  engine: RuntimeEngine | null;
  state: EngineState | null;
  theme: RendererTheme;
  typing: TypingConfig;
  delay: DelayConfig;
  title: string;
  /** Called when user submits free-text input. */
  onSubmitInput: (value: string) => void;
  /** Called when user picks a choice option. */
  onSubmitChoice: (option: string) => void;
}

export interface ConversationRenderer {
  id: string;
  label: string;
  description: string;
  /** Default theme for this renderer. */
  defaultTheme: RendererTheme;
  /** React component implementing the UI. */
  Component: ComponentType<RendererProps>;
}

export type RendererId =
  | "whatsapp"
  | "instagram"
  | "messenger"
  | "chatgpt"
  | "form";

export type Variant = "a" | "b";
