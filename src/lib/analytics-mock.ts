export const trackingKpis = [
  { label: "Eventos hoje", value: "48.2k", delta: "+18%" },
  { label: "Visitantes únicos", value: "12.847", delta: "+9%" },
  { label: "Sessões ativas", value: "342", delta: "+24%" },
  { label: "Taxa de identificação", value: "78.4%", delta: "+3.1%" },
];

export const liveEvents = [
  { id: 1, name: "lead_qualified", visitor: "fbt_8s92jskk29", bot: "SDR Imobiliária", source: "Meta Ads", time: "agora", color: "success" },
  { id: 2, name: "phone_captured", visitor: "fbt_kd02jx91a", bot: "Clínica", source: "Google Ads", time: "2s", color: "accent" },
  { id: 3, name: "message_sent", visitor: "fbt_pa83mc01x", bot: "E-commerce", source: "Instagram", time: "4s", color: "primary" },
  { id: 4, name: "bot_started", visitor: "fbt_zn41kk20q", bot: "Eventos", source: "WhatsApp", time: "7s", color: "primary" },
  { id: 5, name: "meeting_scheduled", visitor: "fbt_qq39xx48b", bot: "SDR Imobiliária", source: "Meta Ads", time: "9s", color: "success" },
  { id: 6, name: "email_captured", visitor: "fbt_lm77zk03e", bot: "Clínica", source: "Orgânico", time: "12s", color: "accent" },
  { id: 7, name: "sale_completed", visitor: "fbt_oo22aa54v", bot: "E-commerce", source: "TikTok Ads", time: "18s", color: "success" },
  { id: 8, name: "question_answered", visitor: "fbt_yy18bb02c", bot: "Consórcio", source: "Direct", time: "22s", color: "primary" },
  { id: 9, name: "bot_loaded", visitor: "fbt_rr94cc11n", bot: "Turismo", source: "Email", time: "29s", color: "muted" },
];

export const flowHeatmap = [
  { id: "b1", name: "Saudação", visits: 1000, conversions: 980, avg: "3s", rate: 98 },
  { id: "b2", name: "Coleta de nome", visits: 980, conversions: 921, avg: "8s", rate: 94 },
  { id: "b3", name: "Pergunta de interesse", visits: 921, conversions: 812, avg: "12s", rate: 88 },
  { id: "b4", name: "Coleta de email", visits: 812, conversions: 634, avg: "18s", rate: 78 },
  { id: "b5", name: "Coleta de telefone", visits: 634, conversions: 312, avg: "27s", rate: 49 },
  { id: "b6", name: "Faixa de faturamento", visits: 312, conversions: 164, avg: "31s", rate: 53 },
  { id: "b7", name: "Qualificação IA", visits: 164, conversions: 132, avg: "14s", rate: 80 },
  { id: "b8", name: "Agendamento", visits: 132, conversions: 88, avg: "22s", rate: 67 },
];

export const attributionTouches = [
  { id: 1, lead: "Mariana Costa", first: "Meta Ads · Campanha Imóveis Premium", last: "WhatsApp Direct", touches: 4, value: "R$ 12.400" },
  { id: 2, lead: "Carlos Mendes", first: "Google Ads · Brand", last: "Email Nutrição #3", touches: 6, value: "R$ 28.900" },
  { id: 3, lead: "Rafael Souza", first: "Instagram Orgânico", last: "Site · Landing SDR", touches: 3, value: "R$ 4.200" },
  { id: 4, lead: "Ana Pereira", first: "TikTok Ads · Lookalike 1%", last: "Bot E-commerce", touches: 5, value: "R$ 1.890" },
  { id: 5, lead: "Diego Ferreira", first: "Meta Ads · Retargeting", last: "WhatsApp Direct", touches: 7, value: "R$ 18.300" },
];

export const campaignPerf = [
  { name: "Meta · Imóveis Premium", spend: "R$ 4.200", leads: 218, cpl: "R$ 19", roas: "4.8x", trend: "up" },
  { name: "Google · Brand SDR", spend: "R$ 2.800", leads: 142, cpl: "R$ 19", roas: "6.2x", trend: "up" },
  { name: "TikTok · Lookalike 1%", spend: "R$ 1.900", leads: 89, cpl: "R$ 21", roas: "2.1x", trend: "down" },
  { name: "Meta · Retargeting", spend: "R$ 1.200", leads: 73, cpl: "R$ 16", roas: "5.4x", trend: "up" },
  { name: "Instagram Orgânico", spend: "R$ 0", leads: 64, cpl: "R$ 0", roas: "∞", trend: "up" },
];

export const revenueSeries = [
  { day: "01", revenue: 4200, ads: 980 },
  { day: "05", revenue: 6800, ads: 1240 },
  { day: "10", revenue: 8900, ads: 1480 },
  { day: "15", revenue: 11200, ads: 1920 },
  { day: "20", revenue: 14800, ads: 2140 },
  { day: "25", revenue: 19200, ads: 2380 },
  { day: "30", revenue: 24800, ads: 2640 },
];

export const aiCosts = [
  { agent: "SDR Imobiliária", model: "gpt-4o", convs: 1284, tokens: "4.2M", cost: 42.18, perLead: 0.34 },
  { agent: "Clínica", model: "gpt-4o-mini", convs: 892, tokens: "1.8M", cost: 8.94, perLead: 0.11 },
  { agent: "E-commerce", model: "claude-3.5", convs: 2104, tokens: "6.1M", cost: 61.04, perLead: 0.28 },
  { agent: "Eventos", model: "gpt-4o-mini", convs: 643, tokens: "920k", cost: 4.12, perLead: 0.09 },
];

export const aiInsights = [
  { type: "gargalo", title: "47% dos usuários abandonam na pergunta de faturamento", action: "Sugerir faixa de faturamento ao invés de campo aberto", impact: "+22% conversão estimada" },
  { type: "otimização", title: "Bot SDR Imobiliária responde 4s acima da média", action: "Trocar modelo para gpt-4o-mini em saudações", impact: "-38% custo / lead" },
  { type: "campanha", title: "TikTok Lookalike 1% caiu 31% em ROAS na última semana", action: "Pausar e testar Lookalike 3% com criativo novo", impact: "Evita R$ 1.200 em waste" },
  { type: "oportunidade", title: "Leads de Meta Retargeting convertem 2.4x mais", action: "Aumentar budget em 40%", impact: "+R$ 8.900 receita projetada" },
];

export const alerts = [
  { id: 1, severity: "high", title: "Conversão caiu 18% no Bot SDR Imobiliária", desc: "Nas últimas 6h vs média 7d", time: "há 12 min" },
  { id: 2, severity: "info", title: "Lead quente entrou: Carlos Mendes", desc: "Score 95 · WhatsApp · Pronto para fechar", time: "há 34 min" },
  { id: 3, severity: "warning", title: "Campanha Meta · Imóveis Premium parou de converter", desc: "0 conversões nas últimas 4h", time: "há 1h" },
  { id: 4, severity: "warning", title: "Custo por lead acima do CAC alvo", desc: "Bot E-commerce: R$ 0.28 vs alvo R$ 0.18", time: "há 2h" },
  { id: 5, severity: "info", title: "Meta novo: 500 leads/dia ultrapassada", desc: "Você bateu 612 leads hoje", time: "há 3h" },
];

export const sources = [
  { name: "Meta Ads", leads: 1284, conv: 412, revenue: 184200, color: "hsl(217 91% 60%)" },
  { name: "Google Ads", leads: 892, conv: 318, revenue: 142800, color: "hsl(142 76% 56%)" },
  { name: "Instagram", leads: 542, conv: 142, revenue: 48900, color: "hsl(316 73% 62%)" },
  { name: "WhatsApp Direct", leads: 421, conv: 184, revenue: 92400, color: "hsl(150 70% 50%)" },
  { name: "TikTok Ads", leads: 318, conv: 64, revenue: 28400, color: "hsl(0 0% 95%)" },
  { name: "Email", leads: 184, conv: 72, revenue: 18900, color: "hsl(38 92% 60%)" },
];
