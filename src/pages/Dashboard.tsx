import { kpis, conversionsChart, channelChart, recentActivity, bots } from "@/lib/mock";
import { TrendingUp, TrendingDown, ArrowUpRight, Bot, Activity, Zap, Sparkles, AlertTriangle, Flame, DollarSign } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, BarChart, Bar, Cell } from "recharts";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CrmDashboardWidget } from "@/components/dashboard/CrmDashboardWidget";
import { OmnichannelWidget } from "@/components/dashboard/OmnichannelWidget";
import { LeadIntelligenceWidget } from "@/components/dashboard/LeadIntelligenceWidget";
import { useAuth } from "@/auth/AuthProvider";
import { useWorkspace } from "@/auth/WorkspaceProvider";

function greetingFor(date: Date): string {
  const h = date.getHours();
  if (h < 5) return "Boa madrugada";
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

const smartAlerts = [
  { id: 1, icon: Flame,         tone: "destructive", title: "3 leads quentes sem resposta",       desc: "Score >85 aguardando há mais de 8min no bot SDR Imobiliária.",   cta: "Ver leads",   to: "/leads" },
  { id: 2, icon: AlertTriangle, tone: "warning",     title: "Queda de 22% na qualificação IA",   desc: "Bloco 'Qualifica com IA' perdeu performance nas últimas 24h.",   cta: "Investigar",  to: "/analytics" },
  { id: 3, icon: DollarSign,    tone: "success",     title: "ROAS Instagram subiu 1.4x",          desc: "Campanha Reels VSL gerou R$ 14.8k em pipeline hoje.",            cta: "Ver receita", to: "/revenue" },
];

const alertTone: Record<string,string> = {
  destructive: "border-destructive/40 bg-destructive/5 text-destructive",
  warning:     "border-warning/40 bg-warning/5 text-warning",
  success:     "border-success/40 bg-success/5 text-success",
};


const channelColors = ["hsl(265 89% 66%)", "hsl(190 95% 55%)", "hsl(220 95% 60%)", "hsl(270 95% 75%)"];

export default function Dashboard() {
  const { user } = useAuth();
  const { workspace } = useWorkspace();
  const firstName = ((user?.user_metadata?.full_name as string | undefined) ?? user?.email?.split("@")[0] ?? "").split(" ")[0];
  const greeting = greetingFor(new Date());

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* header */}
      <div className="flex items-end justify-between">
        <div>
          <div className="text-xs uppercase tracking-widest text-primary-glow font-medium">
            {workspace?.name ? `Workspace · ${workspace.name}` : "Workspace"}
          </div>
          <h1 className="font-display text-3xl font-bold mt-1.5">
            {greeting}{firstName ? `, ${firstName}` : ""} 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Veja o desempenho dos seus agentes hoje.</p>
        </div>
        <Button className="gradient-primary text-primary-foreground border-0 shadow-elegant">
          <Sparkles className="h-4 w-4 mr-1.5" /> Insights da IA
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-2xl border border-border bg-card/60 p-5 hover:border-primary/40 transition">
            <div className="text-xs text-muted-foreground">{k.label}</div>
            <div className="font-display text-3xl font-bold mt-2">{k.value}</div>
            <div className={`mt-2 inline-flex items-center gap-1 text-xs ${k.trend === "up" ? "text-success" : "text-accent"}`}>
              {k.trend === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {k.delta} <span className="text-muted-foreground">vs semana passada</span>
            </div>
          </div>
        ))}
      </div>

      {/* Smart alerts */}
      <div className="rounded-2xl border border-border bg-card/60 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary-glow" /> Alertas inteligentes</h3>
            <p className="text-xs text-muted-foreground">A IA monitorou 2.847 eventos nas últimas 24h</p>
          </div>
          <Link to="/alerts" className="text-xs text-primary-glow flex items-center gap-1">Ver todos <ArrowUpRight className="h-3 w-3" /></Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {smartAlerts.map((a) => (
            <div key={a.id} className={`rounded-xl border p-4 ${alertTone[a.tone]}`}>
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-background/50 border border-current/20 flex items-center justify-center flex-shrink-0">
                  <a.icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-foreground">{a.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">{a.desc}</div>
                  <Link to={a.to} className="text-[11px] mt-2 inline-flex items-center gap-1 hover:underline">{a.cta} <ArrowUpRight className="h-3 w-3" /></Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <CrmDashboardWidget />

      <OmnichannelWidget />



      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* chart */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card/60 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Conversas & Conversões</h3>
              <p className="text-xs text-muted-foreground">Últimos 7 dias</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-primary" />Leads</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-accent" />Conversões</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={conversionsChart}>
              <defs>
                <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="hsl(265 89% 66%)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="hsl(265 89% 66%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="g2" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="hsl(190 95% 55%)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="hsl(190 95% 55%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
              <Area type="monotone" dataKey="leads" stroke="hsl(265 89% 66%)" strokeWidth={2} fill="url(#g1)" />
              <Area type="monotone" dataKey="conv" stroke="hsl(190 95% 55%)" strokeWidth={2} fill="url(#g2)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* channels */}
        <div className="rounded-2xl border border-border bg-card/60 p-6">
          <h3 className="font-semibold">Conversões por canal</h3>
          <p className="text-xs text-muted-foreground mb-4">Distribuição esta semana</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={channelChart} layout="vertical">
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} width={70} />
              <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                {channelChart.map((_, i) => <Cell key={i} fill={channelColors[i]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* recent activity */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card/60 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold flex items-center gap-2"><Activity className="h-4 w-4 text-primary-glow" /> Atividade recente</h3>
              <p className="text-xs text-muted-foreground">Eventos em tempo real do workspace</p>
            </div>
          </div>
          <div className="space-y-3">
            {recentActivity.map((a) => (
              <div key={a.id} className="flex items-center gap-3 rounded-xl border border-border bg-background/40 p-3 hover:border-primary/30 transition">
                <div className="h-9 w-9 rounded-lg gradient-primary flex items-center justify-center shadow-glow">
                  <Zap className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <div className="text-sm"><span className="font-medium">{a.who}</span> <span className="text-muted-foreground">{a.action}</span></div>
                  <div className="text-xs text-muted-foreground">{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* top bots */}
        <div className="rounded-2xl border border-border bg-card/60 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2"><Bot className="h-4 w-4 text-primary-glow" /> Top bots</h3>
            <Link to="/bots" className="text-xs text-primary-glow flex items-center gap-1">Ver todos <ArrowUpRight className="h-3 w-3" /></Link>
          </div>
          <div className="space-y-3">
            {bots.filter(b=>b.status==="ativo").slice(0,4).map((b) => (
              <div key={b.id} className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg gradient-accent flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{b.name}</div>
                  <div className="text-xs text-muted-foreground">{b.conversations.toLocaleString()} conversas</div>
                </div>
                <div className="text-sm font-semibold text-success">{Math.round((b.conversions/b.conversations)*100)}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <LeadIntelligenceWidget />
    </div>
  );
}
