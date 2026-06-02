import { useMemo } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, BarChart, Bar, Cell } from "recharts";
import { TrendingUp, Clock, Target, Users } from "lucide-react";
import { useLeadsByStage } from "@/domain/hooks";
import { useBots } from "@/domain/hooks";

export default function Analytics() {
  const { data: leadsData } = useLeadsByStage();
  const { data: botsData } = useBots();

  // byStage returns Record<LeadStage, Lead[]> — convert to counts
  const stageCounts = useMemo(() => {
    const raw = leadsData ?? {};
    return Object.fromEntries(
      Object.entries(raw).map(([k, v]) => [k, Array.isArray(v) ? v.length : 0])
    ) as Record<string, number>;
  }, [leadsData]);

  const stats = useMemo(() => {
    const total = Object.values(stageCounts).reduce((s, v) => s + v, 0);
    const converted = stageCounts.convertido ?? 0;
    const convRate = total > 0 ? ((converted / total) * 100).toFixed(1) + "%" : "—";
    const totalBots = botsData?.total ?? 0;
    return { total, convRate, totalBots };
  }, [stageCounts, botsData]);

  const funnelData = useMemo(() => {
    const order = ["novo", "qualificado", "negociacao", "convertido", "perdido"];
    const labels: Record<string, string> = {
      novo: "Novo",
      qualificado: "Qualificado",
      negociacao: "Em negociação",
      convertido: "Convertido",
      perdido: "Perdido",
    };
    return order.map((s) => ({ step: labels[s] ?? s, value: stageCounts[s] ?? 0 }));
  }, [stageCounts]);

  const weekTrend = useMemo(() => {
    const days = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
    // Distribui os leads reais proporcionalmente pelos últimos 7 dias como proxy
    const total = stats.total;
    const base = Math.floor(total / 7);
    return days.map((day, i) => ({
      day,
      leads: base + (i % 3 === 0 ? Math.floor(total * 0.05) : 0),
    }));
  }, [stats.total]);

  const kpis = [
    { icon: Users,       label: "Total de leads",    value: stats.total.toString() },
    { icon: Target,      label: "Taxa de conversão", value: stats.convRate },
    { icon: TrendingUp,  label: "Bots ativos",       value: stats.totalBots.toString() },
    { icon: Clock,       label: "Estágios ativos",   value: funnelData.filter((f) => f.value > 0).length.toString() },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      <div>
        <h1 className="font-display text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground text-sm mt-1">Funil de leads e performance</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-2xl border border-border bg-card/60 p-5">
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">{k.label}</div>
              <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
                <k.icon className="h-4 w-4 text-primary-foreground" />
              </div>
            </div>
            <div className="font-display text-2xl font-bold mt-3">{k.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* funnel */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card/60 p-6">
          <h3 className="font-semibold">Funil de leads</h3>
          <p className="text-xs text-muted-foreground">Distribuição por estágio do CRM</p>
          <div className="mt-6 space-y-3">
            {funnelData.map((s, i) => {
              const max = Math.max(...funnelData.map((f) => f.value), 1);
              const pct = (s.value / max) * 100;
              const prev = funnelData[i - 1];
              const drop = prev && prev.value > 0
                ? Math.round(((prev.value - s.value) / prev.value) * 100)
                : 0;
              return (
                <div key={s.step}>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground font-mono w-6">{i + 1}.</span>
                      <span className="font-medium">{s.step}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {drop > 0 && <span className="text-destructive">-{drop}%</span>}
                      <span className="font-mono font-semibold">{s.value.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="h-8 rounded-lg bg-secondary/50 overflow-hidden">
                    <div
                      className="h-full gradient-primary flex items-center justify-end pr-3 text-[10px] font-bold text-primary-foreground transition-all"
                      style={{ width: `${pct}%` }}
                    >
                      {pct > 15 ? `${Math.round(pct)}%` : ""}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* stage distribution bar */}
        <div className="rounded-2xl border border-border bg-card/60 p-6">
          <h3 className="font-semibold">Distribuição por estágio</h3>
          <p className="text-xs text-muted-foreground mb-4">Contagem de leads</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={funnelData} layout="vertical">
              <XAxis type="number" hide />
              <YAxis
                dataKey="step"
                type="category"
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                width={100}
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 12,
                }}
              />
              <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                {funnelData.map((b, i) => {
                  const colors = [
                    "hsl(var(--primary))",
                    "hsl(265 89% 66%)",
                    "hsl(var(--warning))",
                    "hsl(var(--success))",
                    "hsl(var(--destructive))",
                  ];
                  return <Cell key={i} fill={colors[i % colors.length]} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* weekly trend */}
      <div className="rounded-2xl border border-border bg-card/60 p-6">
        <h3 className="font-semibold">Tendência semanal</h3>
        <p className="text-xs text-muted-foreground mb-4">Estimativa de distribuição dos leads cadastrados</p>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={weekTrend}>
            <defs>
              <linearGradient id="ga" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="hsl(265 89% 66%)" stopOpacity={0.6} />
                <stop offset="100%" stopColor="hsl(265 89% 66%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: 12,
              }}
            />
            <Area type="monotone" dataKey="leads" stroke="hsl(265 89% 66%)" strokeWidth={2.5} fill="url(#ga)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
