/**
 * Theme presets — one default theme per renderer.
 *
 * Renderers consume themes via the RendererTheme interface; swapping a
 * theme repaints the surface without touching engine logic.
 */
import type { RendererTheme } from "./types";

export const whatsappTheme: RendererTheme = {
  id: "whatsapp",
  label: "WhatsApp",
  background: "#0b141a",
  surface: "#111b21",
  header: "#202c33",
  botBubble: "#202c33",
  botText: "#e9edef",
  userBubble: "#005c4b",
  userText: "#ffffff",
  accent: "#25d366",
  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
  bubbleRadius: "rounded-lg",
  subtitle: "online",
};

export const instagramTheme: RendererTheme = {
  id: "instagram",
  label: "Instagram DM",
  background: "#000000",
  surface: "#0a0a0a",
  header: "#0a0a0a",
  botBubble: "#262626",
  botText: "#ffffff",
  userBubble: "linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)",
  userText: "#ffffff",
  accent: "#e1306c",
  fontFamily: '"Inter", system-ui, sans-serif',
  bubbleRadius: "rounded-3xl",
  subtitle: "Ativo agora",
};

export const messengerTheme: RendererTheme = {
  id: "messenger",
  label: "Messenger",
  background: "#ffffff",
  surface: "#ffffff",
  header: "#ffffff",
  botBubble: "#f0f0f0",
  botText: "#000000",
  userBubble: "linear-gradient(135deg,#0084ff,#44bec7)",
  userText: "#ffffff",
  accent: "#0084ff",
  fontFamily: '"Inter", system-ui, sans-serif',
  bubbleRadius: "rounded-[20px]",
  subtitle: "Ativo agora no Messenger",
};

export const chatgptTheme: RendererTheme = {
  id: "chatgpt",
  label: "ChatGPT",
  background: "#212121",
  surface: "#212121",
  header: "#171717",
  botBubble: "transparent",
  botText: "#ececec",
  userBubble: "#2f2f2f",
  userText: "#ececec",
  accent: "#10a37f",
  fontFamily: '"Söhne", "Inter", system-ui, sans-serif',
  bubbleRadius: "rounded-3xl",
  subtitle: "Assistente",
};

export const formTheme: RendererTheme = {
  id: "form",
  label: "Formulário",
  background: "hsl(var(--background))",
  surface: "hsl(var(--card))",
  header: "hsl(var(--card))",
  botBubble: "transparent",
  botText: "hsl(var(--foreground))",
  userBubble: "hsl(var(--primary))",
  userText: "hsl(var(--primary-foreground))",
  accent: "hsl(var(--primary))",
  bubbleRadius: "rounded-xl",
  subtitle: "Responda passo a passo",
};
