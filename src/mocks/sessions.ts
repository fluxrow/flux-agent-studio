import type { Conversation, Message, Session } from "@/types";
import { fixedIso } from "./_shared";

const ts = { createdAt: fixedIso(0), updatedAt: fixedIso(0) };

export const mockSessions: Session[] = [
  { id: "s1", botId: "sdr-imob", leadId: "1", visitorId: "fbt_8s92jskk29", channel: "WhatsApp",  status: "ativa",     startedAt: fixedIso(0), variables: { intent: "Morar" }, currentBlockId: "blk_phone", ...ts },
  { id: "s2", botId: "clinica",  leadId: "2", visitorId: "fbt_kd02jx91a", channel: "Site",      status: "encerrada", startedAt: fixedIso(0), variables: {}, ...ts },
  { id: "s3", botId: "ecom",     leadId: "3", visitorId: "fbt_pa83mc01x", channel: "Instagram", status: "humano",    startedAt: fixedIso(0), variables: {}, ...ts },
];

export const mockMessages: Message[] = [
  { id: "m1", sessionId: "s1", role: "bot",  text: "Olá! Sou o assistente da FluxBot Imóveis. Posso te ajudar a encontrar o imóvel ideal. Qual é seu nome?", blockId: "blk_hello", sentAt: fixedIso(0), ...ts },
  { id: "m2", sessionId: "s1", role: "user", text: "Mariana", sentAt: fixedIso(0), ...ts },
  { id: "m3", sessionId: "s1", role: "bot",  text: "Prazer, Mariana! Você procura um imóvel para morar ou investir?", blockId: "blk_intent", sentAt: fixedIso(0), ...ts },
  { id: "m4", sessionId: "s1", role: "user", text: "Para morar", sentAt: fixedIso(0), ...ts },
  { id: "m5", sessionId: "s1", role: "bot",  text: "Ótimo. Em qual região você gostaria?", sentAt: fixedIso(0), ...ts },
  { id: "m6", sessionId: "s1", role: "user", text: "Zona Sul de São Paulo", sentAt: fixedIso(0), ...ts },
  { id: "m7", sessionId: "s1", role: "bot",  text: "Perfeito. Qual é o seu orçamento aproximado?", sentAt: fixedIso(0), ...ts },
];

export const mockConversations: Conversation[] = [
  { id: "c1", sessionId: "s1", leadName: "Mariana Costa",  botName: "SDR Imobiliária", preview: "Quero ver opções de apartamento na zona sul...", unread: 2, time: "agora", status: "ativa",     ...ts },
  { id: "c2", sessionId: "s2", leadName: "Rafael Souza",   botName: "Clínica",          preview: "Confirmado para terça-feira às 14h.",            unread: 0, time: "5min", status: "encerrada", ...ts },
  { id: "c3", sessionId: "s3", leadName: "Juliana Lima",   botName: "E-commerce",       preview: "O produto chega em quantos dias?",                unread: 1, time: "12min",status: "humano",    ...ts },
  { id: "c4", sessionId: "s1", leadName: "Carlos Mendes",  botName: "SDR Imobiliária", preview: "Perfeito, vou assinar o contrato amanhã!",        unread: 0, time: "1h",   status: "encerrada", ...ts },
  { id: "c5", sessionId: "s1", leadName: "Ana Pereira",    botName: "Eventos",          preview: "Já estou inscrita, posso levar acompanhante?",   unread: 3, time: "2h",   status: "ativa",     ...ts },
];
