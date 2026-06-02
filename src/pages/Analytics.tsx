import { funnelSteps, conversionsChart } from "@/lib/mock";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, BarChart, Bar, Cell } from "recharts";
import { Bot, MessageSquare, Target, Users } from "lucide-react";
import { useBasicStats } from "@/lib/analytics-basic";

const blockPerf = [
  { name: "Saudação", value: 98 },
  { name: "Coleta nome", value: 91 },
  { name: "Coleta email", value: 78 },
  { name: "Qualificação IA", value: 64 },
  { name: "Agendamento", value: 41 },
];

export default function Analytics() {
  const { data: stats, isLoading } = useBasicStats();
  const kpis = [
    { icon: Bot,           label: "Bots",       value: stats?.bots ?? 0 },
    { icon: Users,         label: "Leads",      value: stats?.leads ?? 0 },
    { icon: MessageSquare, label: "Conversas",  value: stats?.conversations ?? 0 },
    { icon: Target,        label: "Conversões", value: stats?.conversions ?? 0 },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      <div>
        <h1 className="font-display text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground text-sm mt-1">Funil completo, performance e abandono</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-2xl border border-border bg-card/60 p-5">
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">{k.label}</div>
              <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center"><k.icon className="h-4 w-4 text-primary-foreground" /></div>
            </div>
            <div className="font-display text-2xl font-bold mt-3 tabular-nums">
              {isLoading ? "—" : k.value.toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* funnel */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card/60 p-6">
          <h3 className="font-semibold">Funil de conversão</h3>
          <p className="text-xs text-muted-foreground">Etapas e taxa de abandono</p>
          <div className="mt-6 space-y-3">
            {funnelSteps.map((s, i) => {
              const pct = (s.value / funnelSteps[0].value) * 100;
              const drop = i > 0 ? Math.round(((funnelSteps[i-1].value - s.value) / funnelSteps[i-1].value) * 100) : 0;
              return (
                <div key={s.step}>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground font-mono w-6">{i+1}.</span>
                      <span className="font-medium">{s.step}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {drop > 0 && <span className="text-destructive">-{drop}%</span>}
                      <span className="font-mono font-semibold">{s.value.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="h-8 rounded-lg bg-secondary/50 overflow-hidden relative">
                    <div className="h-full gradient-primary flex items-center justify-end pr-3 text-[10px] font-bold text-primary-foreground transition-all"
                      style={{ width: `${pct}%` }}>{Math.round(pct)}%</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* block performance */}
        <div className="rounded-2xl border border-border bg-card/60 p-6">
          <h3 className="font-semibold">Performance dos blocos</h3>
          <p className="text-xs text-muted-foreground mb-4">% de usuários que passam por cada bloco</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={blockPerf} layout="vertical">
              <XAxis type="number" hide domain={[0,100]} />
              <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} width={100} />
              <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
              <Bar dataKey="value" radius={[0,8,8,0]}>
                {blockPerf.map((b, i) => (
                  <Cell key={i} fill={b.value > 75 ? "hsl(var(--success))" : b.value > 50 ? "hsl(var(--warning))" : "hsl(var(--destructive))"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* trend */}
      <div className="rounded-2xl border border-border bg-card/60 p-6">
        <h3 className="font-semibold">Tendência semanal</h3>
        <p className="text-xs text-muted-foreground mb-4">Volume de interações</p>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={conversionsChart}>
            <defs>
              <linearGradient id="ga" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="hsl(265 89% 66%)" stopOpacity={0.6} />
                <stop offset="100%" stopColor="hsl(265 89% 66%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
            <Area type="monotone" dataKey="leads" stroke="hsl(265 89% 66%)" strokeWidth={2.5} fill="url(#ga)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
