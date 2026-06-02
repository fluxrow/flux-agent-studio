export const kpis = [
  { label: "Leads capturados", value: "2.847", delta: "+12.4%", trend: "up" },
  { label: "Conversas hoje", value: "1.293", delta: "+8.1%", trend: "up" },
  { label: "Taxa de conversão", value: "34.2%", delta: "+3.2%", trend: "up" },
  { label: "Tempo médio", value: "1m 42s", delta: "-12s", trend: "down" },
];

export const conversionsChart = [
  { day: "Seg", leads: 120, conv: 42 },
  { day: "Ter", leads: 180, conv: 64 },
  { day: "Qua", leads: 220, conv: 88 },
  { day: "Qui", leads: 260, conv: 102 },
  { day: "Sex", leads: 320, conv: 140 },
  { day: "Sáb", leads: 240, conv: 96 },
  { day: "Dom", leads: 190, conv: 70 },
];

export const channelChart = [
  { name: "WhatsApp", value: 48 },
  { name: "Site", value: 26 },
  { name: "Instagram", value: 16 },
  { name: "Email", value: 10 },
];

export const recentActivity = [
  { id: 1, who: "Bot SDR Imobiliária", action: "qualificou um lead quente", time: "há 2 min" },
  { id: 2, who: "Bot Suporte", action: "encerrou conversa com resumo", time: "há 8 min" },
  { id: 3, who: "Bot Clínica Dental", action: "agendou reunião", time: "há 14 min" },
  { id: 4, who: "Bot E-commerce", action: "capturou 12 novos leads", time: "há 31 min" },
  { id: 5, who: "Bot Eventos", action: "enviou follow-up automático", time: "há 1h" },
];

export type Bot = {
  id: string;
  name: string;
  description: string;
  status: "ativo" | "rascunho" | "arquivado";
  channel: string;
  created: string;
  conversations: number;
  conversions: number;
};

export const bots: Bot[] = [
  { id: "sdr-imob", name: "SDR Imobiliária Premium", description: "Qualifica leads para imóveis de alto padrão", status: "ativo", channel: "WhatsApp", created: "12 mai 2026", conversations: 1284, conversions: 412 },
  { id: "clinica", name: "Clínica Odontológica", description: "Agendamento e triagem automática", status: "ativo", channel: "Site", created: "03 mai 2026", conversations: 892, conversions: 267 },
  { id: "ecom", name: "E-commerce Atendimento", description: "Suporte pós-venda e recuperação de carrinho", status: "ativo", channel: "Instagram", created: "28 abr 2026", conversations: 2104, conversions: 538 },
  { id: "consorcio", name: "Consórcio Auto SDR", description: "Captação para simulação de consórcios", status: "rascunho", channel: "WhatsApp", created: "22 abr 2026", conversations: 0, conversions: 0 },
  { id: "eventos", name: "Eventos Inscrição", description: "Confirmação e follow-up de presença", status: "ativo", channel: "Email", created: "15 abr 2026", conversations: 643, conversions: 198 },
  { id: "turismo", name: "Turismo Roteiros", description: "Sugere roteiros e captura interesse", status: "arquivado", channel: "Site", created: "02 abr 2026", conversations: 421, conversions: 87 },
];

export type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  stage: "novo" | "qualificado" | "negociacao" | "convertido" | "perdido";
  score: number;
  temperature: "frio" | "morno" | "quente";
  bot: string;
};

export const leads: Lead[] = [
  { id: "1", name: "Mariana Costa", email: "mari@empresa.com", phone: "+55 11 98888-1234", source: "WhatsApp", stage: "qualificado", score: 87, temperature: "quente", bot: "SDR Imobiliária" },
  { id: "2", name: "Rafael Souza", email: "rafa@startup.io", phone: "+55 21 97777-2345", source: "Site", stage: "negociacao", score: 92, temperature: "quente", bot: "Clínica" },
  { id: "3", name: "Juliana Lima", email: "ju@mail.com", phone: "+55 31 96666-3456", source: "Instagram", stage: "novo", score: 54, temperature: "morno", bot: "E-commerce" },
  { id: "4", name: "Carlos Mendes", email: "carlos@corp.br", phone: "+55 11 95555-4567", source: "WhatsApp", stage: "convertido", score: 95, temperature: "quente", bot: "SDR Imobiliária" },
  { id: "5", name: "Ana Pereira", email: "ana@gmail.com", phone: "+55 41 94444-5678", source: "Email", stage: "qualificado", score: 71, temperature: "morno", bot: "Eventos" },
  { id: "6", name: "Pedro Alves", email: "pedro@me.com", phone: "+55 51 93333-6789", source: "Site", stage: "novo", score: 38, temperature: "frio", bot: "Clínica" },
  { id: "7", name: "Luiza Rocha", email: "luiza@x.com", phone: "+55 11 92222-7890", source: "WhatsApp", stage: "perdido", score: 22, temperature: "frio", bot: "Consórcio" },
  { id: "8", name: "Diego Ferreira", email: "diego@y.com", phone: "+55 19 91111-8901", source: "Instagram", stage: "negociacao", score: 79, temperature: "quente", bot: "E-commerce" },
];

export const stages = [
  { id: "novo", label: "Novo", color: "muted" },
  { id: "qualificado", label: "Qualificado", color: "accent" },
  { id: "negociacao", label: "Em negociação", color: "warning" },
  { id: "convertido", label: "Convertido", color: "success" },
  { id: "perdido", label: "Perdido", color: "destructive" },
] as const;

export type Conversation = {
  id: string;
  lead: string;
  bot: string;
  preview: string;
  unread: number;
  time: string;
  status: "ativa" | "encerrada" | "humano";
};

export const conversations: Conversation[] = [
  { id: "c1", lead: "Mariana Costa", bot: "SDR Imobiliária", preview: "Quero ver opções de apartamento na zona sul...", unread: 2, time: "agora", status: "ativa" },
  { id: "c2", lead: "Rafael Souza", bot: "Clínica", preview: "Confirmado para terça-feira às 14h.", unread: 0, time: "5min", status: "encerrada" },
  { id: "c3", lead: "Juliana Lima", bot: "E-commerce", preview: "O produto chega em quantos dias?", unread: 1, time: "12min", status: "humano" },
  { id: "c4", lead: "Carlos Mendes", bot: "SDR Imobiliária", preview: "Perfeito, vou assinar o contrato amanhã!", unread: 0, time: "1h", status: "encerrada" },
  { id: "c5", lead: "Ana Pereira", bot: "Eventos", preview: "Já estou inscrita, posso levar acompanhante?", unread: 3, time: "2h", status: "ativa" },
];

export const sampleChat = [
  { from: "bot", text: "Olá! Sou o assistente da FluxBot Imóveis. Posso te ajudar a encontrar o imóvel ideal. Qual é seu nome?" },
  { from: "user", text: "Mariana" },
  { from: "bot", text: "Prazer, Mariana! Você procura um imóvel para morar ou investir?" },
  { from: "user", text: "Para morar" },
  { from: "bot", text: "Ótimo. Em qual região você gostaria?" },
  { from: "user", text: "Zona Sul de São Paulo" },
  { from: "bot", text: "Perfeito. Qual é o seu orçamento aproximado?" },
];

export const funnelSteps = [
  { step: "Início do fluxo", value: 4820 },
  { step: "Coletou nome", value: 4310 },
  { step: "Coletou contato", value: 3420 },
  { step: "Qualificou interesse", value: 2180 },
  { step: "Agendou conversa", value: 1240 },
  { step: "Convertido", value: 612 },
];

export const templates = [
  { id: "sdr-real", category: "SDR", name: "SDR B2B", desc: "Qualifica empresas e agenda demos", color: "from-primary to-primary-glow" },
  { id: "imob", category: "Imobiliária", name: "Captador de Imóveis", desc: "Descobre perfil e orçamento", color: "from-accent to-primary" },
  { id: "turismo", category: "Turismo", name: "Agência de Viagens", desc: "Monta roteiros personalizados", color: "from-warning to-primary" },
  { id: "consorcio", category: "Consórcio", name: "Simulador de Consórcio", desc: "Calcula parcelas e qualifica", color: "from-success to-accent" },
  { id: "clinicas", category: "Clínicas", name: "Agendamento Médico", desc: "Triagem e marcação de consulta", color: "from-primary-glow to-accent" },
  { id: "eventos", category: "Eventos", name: "Inscrição em Eventos", desc: "Confirma presença e check-in", color: "from-accent to-warning" },
  { id: "ecom", category: "E-commerce", name: "Recuperação de Carrinho", desc: "Reengaja e fecha venda", color: "from-primary to-accent" },
  { id: "support", category: "Suporte", name: "Help Desk Inteligente", desc: "Resolve dúvidas com IA", color: "from-success to-primary" },
];
