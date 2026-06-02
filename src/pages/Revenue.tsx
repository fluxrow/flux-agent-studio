import { revenueSeries, aiCosts, aiInsights } from "@/lib/analytics-mock";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { DollarSign, TrendingUp, Wallet, Brain, Sparkles, Lightbulb } from "lucide-react";

const revKpis = [
  { icon: DollarSign, label: "Receita 30d", value: "R$ 184.2k", delta: "+34%" },
  { icon: TrendingUp, label: "ROAS médio", value: "4.8x", delta: "+0.6x" },
  { icon: Wallet, label: "CAC", value: "R$ 42", delta: "-R$ 8" },
  { icon: Brain, label: "LTV / CAC", value: "8.2x", delta: "+1.4x" },
];

export default function Revenue() {
  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      <div>
        <h1 className="font-display text-3xl font-bold">Revenue Intelligence</h1>
        <p className="text-muted-foreground text-sm mt-1">Receita, custos de IA e otimização autônoma</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {revKpis.map((k) => (
          <div key={k.label} className="rounded-2xl border border-border bg-card/60 p-5">
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">{k.label}</div>
              <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
                <k.icon className="h-4 w-4 text-primary-foreground" />
              </div>
            </div>
            <div className="font-display text-2xl font-bold mt-3">{k.value}</div>
            <div className="text-xs text-success mt-1">{k.delta}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card/60 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-semibold">Receita vs Gasto com Ads · 30 dias</h3>
          <div className="flex gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-primary" /> Receita</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-warning" /> Ads</span>
          </div>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueSeries}>
              <defs>
                <linearGradient id="r1" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="r2" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--warning))" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="hsl(var(--warning))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
              <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="url(#r1)" strokeWidth={2} />
              <Area type="monotone" dataKey="ads" stroke="hsl(var(--warning))" fill="url(#r2)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-border bg-card/60 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="h-4 w-4 text-primary-glow" />
            <h3 className="font-display text-lg font-semibold">Custo de IA por agente</h3>
          </div>
          <div className="space-y-3">
            {aiCosts.map((a) => (
              <div key={a.agent} className="rounded-xl border border-border/60 bg-background/40 p-3">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="font-medium text-sm">{a.agent}</div>
                    <div className="text-[10px] font-mono text-muted-foreground">{a.model} · {a.tokens} tokens</div>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-lg font-bold tabular-nums">${a.cost.toFixed(2)}</div>
                    <div className="text-[10px] text-muted-foreground">${a.perLead.toFixed(2)} / lead</div>
                  </div>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary/40">
                  <div className="h-full gradient-primary" style={{ width: `${Math.min(a.cost, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card/60 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-4 w-4 text-primary-glow" />
            <h3 className="font-display text-lg font-semibold">Optimization Layer · IA</h3>
          </div>
          <div className="space-y-3">
            {aiInsights.map((i, idx) => (
              <div key={idx} className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 to-transparent p-3">
                <div className="flex items-start gap-2">
                  <Lightbulb className="h-4 w-4 mt-0.5 text-primary-glow flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] uppercase tracking-wider text-primary-glow">{i.type}</span>
                    </div>
                    <div className="text-sm font-medium">{i.title}</div>
                    <div className="text-xs text-muted-foreground mt-1">→ {i.action}</div>
                    <div className="text-xs text-success mt-1.5 font-medium">{i.impact}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
