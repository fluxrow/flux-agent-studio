/**
 * Phase 18.5 — Smoke Test Templates
 * Lightweight, internal blueprints for fast manual QA.
 */
import type { SmokeTemplate } from "./types";

export const SMOKE_TEMPLATES: SmokeTemplate[] = [
  {
    key: "sdr",
    name: "Fluxo SDR",
    description: "Qualificação rápida: nome, e-mail, segmento, dor e orçamento.",
    snapshot: {
      blocks: [
        { type: "text", text: "Olá! Em que posso te ajudar?" },
        { type: "input", variable: "name", label: "Seu nome" },
        { type: "input", variable: "email", label: "Seu e-mail" },
        { type: "choice", variable: "segment", options: ["B2B", "B2C", "Outro"] },
        { type: "input", variable: "pain", label: "Maior desafio hoje" },
        { type: "input", variable: "budget", label: "Orçamento estimado" },
        { type: "end" },
      ],
    },
  },
  {
    key: "atendimento",
    name: "Fluxo Atendimento",
    description: "Triagem inicial com encaminhamento para humano.",
    snapshot: {
      blocks: [
        { type: "text", text: "Bem-vindo! Como podemos ajudar?" },
        { type: "choice", variable: "topic", options: ["Comercial", "Financeiro", "Outro"] },
        { type: "text", text: "Um atendente entrará em contato em instantes." },
        { type: "end" },
      ],
    },
  },
  {
    key: "suporte",
    name: "Fluxo Suporte",
    description: "Coleta de chamado técnico com prioridade.",
    snapshot: {
      blocks: [
        { type: "input", variable: "name", label: "Seu nome" },
        { type: "input", variable: "email", label: "E-mail de contato" },
        { type: "choice", variable: "priority", options: ["Baixa", "Média", "Alta", "Crítica"] },
        { type: "input", variable: "description", label: "Descreva o problema" },
        { type: "end" },
      ],
    },
  },
  {
    key: "captura",
    name: "Fluxo Captura",
    description: "Lead magnet simples — nome + e-mail + WhatsApp.",
    snapshot: {
      blocks: [
        { type: "text", text: "Receba nosso material gratuito!" },
        { type: "input", variable: "name", label: "Nome" },
        { type: "input", variable: "email", label: "E-mail" },
        { type: "input", variable: "phone", label: "WhatsApp" },
        { type: "text", text: "Pronto! Enviamos para o seu e-mail." },
        { type: "end" },
      ],
    },
  },
];
