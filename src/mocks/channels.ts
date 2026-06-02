import type { Channel } from "@/types";
import { MOCK_WORKSPACE_ID, fixedIso } from "./_shared";

const ts = { createdAt: fixedIso(50), updatedAt: fixedIso(2) };

export const mockChannels: Channel[] = [
  { id: "wa",   workspaceId: MOCK_WORKSPACE_ID, kind: "whatsapp",  name: "WhatsApp",                description: "Atendimento e SDR via WhatsApp Cloud API oficial.",    status: "connected",    account: "+55 11 98888-1234", ...ts },
  { id: "ig",   workspaceId: MOCK_WORKSPACE_ID, kind: "instagram", name: "Instagram",               description: "Responda DMs, stories e comentários automaticamente.",  status: "connected",    account: "@fluxbot.oficial",  ...ts },
  { id: "fb",   workspaceId: MOCK_WORKSPACE_ID, kind: "facebook",  name: "Facebook Messenger",      description: "Capture leads direto da sua página no Facebook.",       status: "disconnected", ...ts },
  { id: "tg",   workspaceId: MOCK_WORKSPACE_ID, kind: "telegram",  name: "Telegram",                description: "Bots públicos ou privados em grupos e canais.",         status: "disconnected", ...ts },
  { id: "site", workspaceId: MOCK_WORKSPACE_ID, kind: "web",       name: "Widget de Site",          description: "Bubble flutuante e fullscreen para o seu domínio.",     status: "connected",    account: "fluxbot.app · 4 domínios", ...ts },
  { id: "tt",   workspaceId: MOCK_WORKSPACE_ID, kind: "tiktok",    name: "TikTok",                  description: "Mensagens diretas e respostas em comentários.",         status: "soon", ...ts },
  { id: "gbp",  workspaceId: MOCK_WORKSPACE_ID, kind: "gbp",       name: "Google Business Profile", description: "Atenda chats do Google Maps e da busca.",               status: "soon", ...ts },
];
