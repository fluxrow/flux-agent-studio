import type { Lead, PipelineStage } from "@/types";
import { MOCK_WORKSPACE_ID, fixedIso } from "./_shared";

const base = (i: number) => ({
  workspaceId: MOCK_WORKSPACE_ID,
  createdAt: fixedIso(i),
  updatedAt: fixedIso(Math.max(0, i - 1)),
});

export const mockLeads: Lead[] = [
  { id: "1", name: "Mariana Costa",  email: "mari@empresa.com",  phone: "+55 11 98888-1234", source: "WhatsApp",  stage: "qualificado", score: 87, temperature: "quente", botId: "sdr-imob", botName: "SDR Imobiliária", ...base(1) },
  { id: "2", name: "Rafael Souza",   email: "rafa@startup.io",   phone: "+55 21 97777-2345", source: "Site",      stage: "negociacao",  score: 92, temperature: "quente", botId: "clinica",  botName: "Clínica",          ...base(2) },
  { id: "3", name: "Juliana Lima",   email: "ju@mail.com",       phone: "+55 31 96666-3456", source: "Instagram", stage: "novo",        score: 54, temperature: "morno",  botId: "ecom",     botName: "E-commerce",       ...base(3) },
  { id: "4", name: "Carlos Mendes",  email: "carlos@corp.br",    phone: "+55 11 95555-4567", source: "WhatsApp",  stage: "convertido",  score: 95, temperature: "quente", botId: "sdr-imob", botName: "SDR Imobiliária", ...base(4) },
  { id: "5", name: "Ana Pereira",    email: "ana@gmail.com",     phone: "+55 41 94444-5678", source: "Email",     stage: "qualificado", score: 71, temperature: "morno",  botId: "eventos",  botName: "Eventos",          ...base(5) },
  { id: "6", name: "Pedro Alves",    email: "pedro@me.com",      phone: "+55 51 93333-6789", source: "Site",      stage: "novo",        score: 38, temperature: "frio",   botId: "clinica",  botName: "Clínica",          ...base(6) },
  { id: "7", name: "Luiza Rocha",    email: "luiza@x.com",       phone: "+55 11 92222-7890", source: "WhatsApp",  stage: "perdido",     score: 22, temperature: "frio",   botId: "consorcio",botName: "Consórcio",        ...base(7) },
  { id: "8", name: "Diego Ferreira", email: "diego@y.com",       phone: "+55 19 91111-8901", source: "Instagram", stage: "negociacao",  score: 79, temperature: "quente", botId: "ecom",     botName: "E-commerce",       ...base(8) },
];

export const mockStages: PipelineStage[] = [
  { id: "novo",        label: "Novo",          color: "muted" },
  { id: "qualificado", label: "Qualificado",   color: "accent" },
  { id: "negociacao",  label: "Em negociação", color: "warning" },
  { id: "convertido",  label: "Convertido",    color: "success" },
  { id: "perdido",     label: "Perdido",       color: "destructive" },
];
