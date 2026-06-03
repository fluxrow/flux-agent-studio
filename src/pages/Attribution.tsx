// Phase 23A — fabricated attribution removed. Real attribution requires
// published bots receiving traffic with UTM parameters.
// Phase 26B.1C — Demo Runtime unlocks the full Attribution dashboard
// using the deterministic "Agência Growth Demo" dataset.
import { Link } from "react-router-dom";
import { Target, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/EmptyState";
import { isDemoMode } from "@/beta/demoMode";
import { DEMO_ATTRIBUTION, DEMO_REVENUE } from "@/beta/demoDataset";

const fmt = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

export default function Attribution() {
  if (!isDemoMode()) {
    return (
      <div className="p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
        <div>
          <h1 className="font-display text-3xl font-bold">Attribution Engine</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Da impressão do anúncio até a venda — multi-touch sobre dados reais.
          </p>
        </div>
        <EmptyState
          icon={Target}
          title="Nenhuma atribuição registrada ainda."
          description="Compartilhe um bot publicado com UTMs para começar a rastrear origem e campanha."
          action={
            <Link to="/bots">
              <Button className="gradient-primary text-primary-foreground border-0 shadow-elegant">
                Ver bots
              </Button>
            </Link>
          }
        />
      </div>
    );
  }

  const rows = DEMO_ATTRIBUTION;
  const totals = rows.reduce(
    (a, r) => ({
      visitors: a.visitors + r.visitors,
      leads: a.leads + r.leads,
      conversions: a.conversions + r.conversions,
      revenue: a.revenue + r.revenue,
    }),
    { visitors: 0, leads: 0, conversions: 0, revenue: 0 },
  );
  const maxRevenue = Math.max(...rows.map((r) => r.revenue));

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-3xl font-bold">Attribution Engine</h1>
            <Badge variant="outline" className="gap-1 text-[10px]">
              <Sparkles className="h-3 w-3 text-primary" /> Demo
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Da impressão do anúncio até a venda — multi-touch · cenário Agência Growth Demo.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Visitantes",  value: totals.visitors.toLocaleString("pt-BR") },
          { label: "Leads",       value: totals.leads.toLocaleString("pt-BR") },
          { label: "Conversões",  value: totals.conversions.toString() },
          { label: "Receita atribuída", value: fmt(totals.revenue) },
        ].map((k) => (
          <div key={k.label} className="rounded-2xl border border-border bg-card/60 p-4">
            <div className="text-xs text-muted-foreground">{k.label}</div>
            <div className="text-2xl font-bold mt-2 tabular-nums">{k.value}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card/60 overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <div className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary-glow" /> Performance por fonte / campanha
            </div>
            <div className="text-xs text-muted-foreground">Multi-touch · janela 30 dias</div>
          </div>
          <Badge variant="outline" className="text-[10px]">ROAS médio {DEMO_REVENUE.roas.toFixed(2)}x</Badge>
        </div>
        <div className="divide-y divide-border">
          <div className="grid grid-cols-12 gap-2 px-5 py-2 text-[10px] uppercase tracking-wider text-muted-foreground bg-background/40">
            <div className="col-span-3">Fonte / Mídia</div>
            <div className="col-span-3">Campanha</div>
            <div className="col-span-1 text-right">Visitantes</div>
            <div className="col-span-1 text-right">Leads</div>
            <div className="col-span-1 text-right">Conv.</div>
            <div className="col-span-3 text-right">Receita</div>
          </div>
          {rows.map((r, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 px-5 py-3 text-sm items-center">
              <div className="col-span-3">
                <div className="font-medium">{r.source}</div>
                <div className="text-[11px] text-muted-foreground">{r.medium}</div>
              </div>
              <div className="col-span-3 font-mono text-[12px] text-muted-foreground truncate">{r.campaign}</div>
              <div className="col-span-1 text-right tabular-nums">{r.visitors.toLocaleString("pt-BR")}</div>
              <div className="col-span-1 text-right tabular-nums">{r.leads}</div>
              <div className="col-span-1 text-right tabular-nums font-semibold">{r.conversions}</div>
              <div className="col-span-3">
                <div className="flex items-center gap-2 justify-end">
                  <div className="h-1.5 flex-1 max-w-[140px] rounded-full bg-muted/40 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-primary/60"
                      style={{ width: `${(r.revenue / maxRevenue) * 100}%` }}
                    />
                  </div>
                  <span className="font-semibold tabular-nums w-24 text-right">{fmt(r.revenue)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
