/**
 * Built-in conversation renderers.
 *
 * Each renderer is a thin wrapper around `ConversationFrame` that supplies
 * its default theme. Visual differentiation lives entirely in the theme;
 * if a channel needs structural differences (e.g. Form mode) it can pass
 * a `variant` to the frame.
 */
import { ConversationFrame } from "./ConversationFrame";
import {
  chatgptTheme,
  formTheme,
  instagramTheme,
  messengerTheme,
  whatsappTheme,
} from "./themes";
import type { ConversationRenderer, RendererProps } from "./types";

const make = (
  id: string,
  label: string,
  description: string,
  theme: ConversationRenderer["defaultTheme"],
  variant: "chat" | "form" = "chat",
): ConversationRenderer => ({
  id,
  label,
  description,
  defaultTheme: theme,
  Component: (props: RendererProps) => <ConversationFrame {...props} variant={variant} />,
});

export const whatsappRenderer = make(
  "whatsapp",
  "WhatsApp",
  "Visual fiel ao WhatsApp — bolhas verdes, header escuro, tipografia neutra.",
  whatsappTheme,
);

export const instagramRenderer = make(
  "instagram",
  "Instagram DM",
  "Estética DM do Instagram — fundo preto e gradiente nas bolhas do usuário.",
  instagramTheme,
);

export const messengerRenderer = make(
  "messenger",
  "Messenger",
  "Clarinho como o Messenger, com bolhas azuis em gradiente.",
  messengerTheme,
);

export const chatgptRenderer = make(
  "chatgpt",
  "ChatGPT",
  "Layout limpo do ChatGPT — assistente sem bolha, usuário em pill cinza.",
  chatgptTheme,
);

export const formRenderer = make(
  "form",
  "Formulário",
  "Modo formulário — pergunta + resposta passo a passo, sem chrome de chat.",
  formTheme,
  "form",
);
