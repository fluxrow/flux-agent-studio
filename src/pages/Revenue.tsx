// Phase 23A — fabricated revenue removed. Real revenue requires real
// conversions, which only exist once leads reach "won/sold/qualified" stages.
// Phase 26B.1B — Demo mode unlocks the full Revenue Intelligence layout
// using the deterministic "Agência Growth Demo" dataset.
import { Link } from "react-router-dom";
import { DollarSign, TrendingUp, Target, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/EmptyState";
import { isDemoMode } from "@/beta/demoMode";
import { DEMO_REVENUE } from "@/beta/demoDataset";

const fmt = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

export default function Revenue() {
  if (!isDemoMode()) {
    return (
      <div className="p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
        <div>
          <h1 className="font-display text-3xl font-bold">Revenue Intelligence</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Receita atribuída, custo por canal e ROAS — alimentados por dados reais do workspace.
          </p>
        </div>
        <EmptyState
          icon={DollarSign}
          title="Nenhuma receita atribuída ainda."
          description="Quando seus leads forem marcados como convertidos, você verá receita e origem aqui."
          action={
            <Link to="/leads">
              <Button className="gradient-primary text-primary-foreground border-0 shadow-elegant">
                Ver leads
              </Button>
            </Link>
          }
        />
      </div>
    );
  }

  const r = DEMO_REVENUE;
  const maxChannel = Math.max(...r.channels.map((c) => c.revenue));
  const maxTrend = Math.max(...r.trend.map((d) => d.revenue));

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-3xl font-bold">Revenue Intelligence</h1>
            <Badge variant="outline" className="gap-1 text-[10px]">
              <Sparkles className="h-3 w-3 text-primary" /> Demo
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Receita atribuída por canal, campanha e ROAS — cenário Agência Growth Demo.
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Receita atribuída", value: fmt(r.totalAttributed), icon: DollarSign },
          { label: "Conversões",        value: r.conversions.toString(), icon: Target },
          { label: "Ticket médio",      value: fmt(r.avgTicket), icon: TrendingUp },
          { label: "ROAS",              value: `${r.roas.toFixed(2)}x`, icon: Sparkles },
        ].map((k) => (
          <div key={k.label} className="rounded-2xl border border-border bg-card/60 p-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{k.label}</span>
              <k.icon className="h-4 w-4" />
            </div>
            <div className="text-2xl font-bold mt-2">{k.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-6">
        {/* Channels */}
        <div className="rounded-2xl border border-border bg-card/60 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm font-semibold">Receita por canal</div>
              <div className="text-xs text-muted-foreground">Atribuição multi-touch · últimos 30 dias</div>
            </div>
          </div>
          <div className="space-y-3">
            {r.channels.map((c) => (
              <div key={c.channel} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium">{c.channel}</span>
                  <span className="text-muted-foreground">
                    {c.conversions} conv · ROAS {c.roas.toFixed(2)}x ·{" "}
                    <span className="font-semibold text-foreground">{fmt(c.revenue)}</span>
                  </span>
                </div>
                <div className="h-2 bg-muted/40 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-primary/60"
                    style={{ width: `${(c.revenue / maxChannel) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trend + Forecast */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card/60 p-5">
            <div className="text-sm font-semibold mb-1">Forecast 30 dias</div>
            <div className="text-xs text-muted-foreground mb-3">Projeção com base nas últimas 4 semanas</div>
            <div className="text-3xl font-bold">{fmt(r.forecastNext30d)}</div>
            <div className="text-xs text-muted-foreground mt-1">
              +{Math.round(((r.forecastNext30d - r.totalAttributed) / r.totalAttributed) * 100)}% vs. período atual
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card/60 p-5">
            <div className="text-sm font-semibold mb-3">Receita diária (últimos 7 dias)</div>
            <div className="flex items-end gap-2 h-32">
              {r.trend.map((d) => (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-1.5">
                  <div className="w-full flex-1 flex items-end">
                    <div
                      className="w-full rounded-t bg-gradient-to-t from-primary/70 to-primary"
                      style={{ height: `${(d.revenue / maxTrend) * 100}%` }}
                      title={fmt(d.revenue)}
                    />
                  </div>
                  <div className="text-[10px] text-muted-foreground">{d.day}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Campaigns */}
      <div className="rounded-2xl border border-border bg-card/60 p-5">
        <div className="text-sm font-semibold mb-3">Top campanhas</div>
        <div className="divide-y divide-border">
          {r.byCampaign.map((c) => (
            <div key={c.campaign} className="flex items-center justify-between py-2.5 text-sm">
              <div>
                <div className="font-medium">{c.campaign}</div>
                <div className="text-xs text-muted-foreground">{c.conversions} conversões</div>
              </div>
              <div className="font-semibold">{fmt(c.revenue)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
