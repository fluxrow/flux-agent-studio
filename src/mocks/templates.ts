import type { Template } from "@/types";
import { fixedIso } from "./_shared";

const ts = { createdAt: fixedIso(60), updatedAt: fixedIso(10) };

export const mockTemplates: Template[] = [
  { id: "sdr-real",  category: "SDR",          name: "SDR B2B",                description: "Qualifica empresas e agenda demos",      gradient: "from-primary to-primary-glow", ...ts },
  { id: "imob",      category: "Imobiliária",  name: "Captador de Imóveis",    description: "Descobre perfil e orçamento",            gradient: "from-accent to-primary", ...ts },
  { id: "turismo",   category: "Turismo",      name: "Agência de Viagens",     description: "Monta roteiros personalizados",          gradient: "from-warning to-primary", ...ts },
  { id: "consorcio", category: "Consórcio",    name: "Simulador de Consórcio", description: "Calcula parcelas e qualifica",           gradient: "from-success to-accent", ...ts },
  { id: "clinicas",  category: "Clínicas",     name: "Agendamento Médico",     description: "Triagem e marcação de consulta",         gradient: "from-primary-glow to-accent", ...ts },
  { id: "eventos",   category: "Eventos",      name: "Inscrição em Eventos",   description: "Confirma presença e check-in",           gradient: "from-accent to-warning", ...ts },
  { id: "ecom",      category: "E-commerce",   name: "Recuperação de Carrinho",description: "Reengaja e fecha venda",                 gradient: "from-primary to-accent", ...ts },
  { id: "support",   category: "Suporte",      name: "Help Desk Inteligente",  description: "Resolve dúvidas com IA",                 gradient: "from-success to-primary", ...ts },
];
