import { useMemo } from "react";
import { Flame, Snowflake, Brain, DollarSign, TrendingUp } from "lucide-react";
import { mockLeads } from "@/mocks";
import { computeLeadIntelligence, buildAttributionRow, summarizeAttribution } from "@/intelligence";

export function LeadIntelligenceWidget() {
  const data = useMemo(() => {
    const intels = mockLeads.map((l) => ({ lead: l, intel: computeLeadIntelligence(l) }));
    const hot = intels.filter((x) => x.intel.score.temperature === "quente");
    const cold = intels.filter((x) => x.intel.score.temperature === "frio");
    const avgScore = Math.round(
      intels.reduce((acc, x) => acc + x.intel.score.score, 0) / Math.max(1, intels.length),
    );

    const rows = intels.map(({ lead, intel }) =>
      buildAttributionRow({
        lead,
        campaign: lead.source,
        revenue: intel.forecast?.expectedRevenue ?? 0,
      }),
    );
    const attr = summarizeAttribution(rows);
    return { intels, hot, cold, avgScore, attr };
  }, []);

  return (
    <div className="rounded-2xl border border-border bg-card/60 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-primary" />
          <h3 className="font-display text-base font-semibold">Lead Intelligence</h3>
        </div>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Score médio {data.avgScore}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Stat
          icon={<Flame className="h-3.5 w-3.5 text-destructive" />}
          label="Leads quentes"
          value={data.hot.length.toString()}
        />
        <Stat
          icon={<Snowflake className="h-3.5 w-3.5 text-accent" />}
          label="Leads frios"
          value={data.cold.length.toString()}
        />
        <Stat
          icon={<DollarSign className="h-3.5 w-3.5 text-success" />}
          label="Receita atribuída"
          value={`R$ ${data.attr.totalRevenue.toLocaleString("pt-BR")}`}
        />
        <Stat
          icon={<TrendingUp className="h-3.5 w-3.5 text-primary-glow" />}
          label="Score médio"
          value={`${data.avgScore}/100`}
        />
      </div>

      {data.attr.byCampaign.length > 0 && (
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
            Top campanhas
          </div>
          <ul className="space-y-1.5">
            {data.attr.byCampaign.slice(0, 4).map((c) => (
              <li key={c.campaign} className="flex items-center justify-between text-xs">
                <span className="truncate">{c.campaign}</span>
                <span className="tabular-nums text-muted-foreground">
                  {c.leads} · R$ {c.revenue.toLocaleString("pt-BR")}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg bg-background/40 border border-border p-3">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="mt-1 font-display text-xl font-semibold">{value}</div>
    </div>
  );
}
