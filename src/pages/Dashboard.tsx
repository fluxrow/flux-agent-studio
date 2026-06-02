import { kpis, conversionsChart, channelChart, recentActivity, bots } from "@/lib/mock";
import { TrendingUp, TrendingDown, ArrowUpRight, Bot, Activity, Zap, Sparkles } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, BarChart, Bar, Cell } from "recharts";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const channelColors = ["hsl(265 89% 66%)", "hsl(190 95% 55%)", "hsl(220 95% 60%)", "hsl(270 95% 75%)"];

export default function Dashboard() {
  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* header */}
      <div className="flex items-end justify-between">
        <div>
          <div className="text-xs uppercase tracking-widest text-primary-glow font-medium">Workspace · FluxBot Premium</div>
          <h1 className="font-display text-3xl font-bold mt-1.5">Bom dia, Lucas 👋</h1>
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
            <Link to="/app/bots" className="text-xs text-primary-glow flex items-center gap-1">Ver todos <ArrowUpRight className="h-3 w-3" /></Link>
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
    </div>
  );
}
