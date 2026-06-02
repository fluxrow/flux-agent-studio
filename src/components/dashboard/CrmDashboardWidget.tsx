import { Link } from "react-router-dom";
import { ArrowUpRight, Loader2, Trophy, TrendingDown } from "lucide-react";
import { useCrmStats, usePipelineStages } from "@/domain/hooks";
import { EmptyState } from "@/components/ui/empty-state";

const stageDot: Record<string, string> = {
  novo: "bg-muted-foreground",
  qualificado: "bg-accent",
  negociacao: "bg-warning",
  convertido: "bg-success",
  perdido: "bg-destructive",
};

export function CrmDashboardWidget() {
  const { data: stats, isLoading } = useCrmStats();
  const { data: stages = [] } = usePipelineStages();

  return (
    <div className="rounded-2xl border border-border bg-card/60 p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold flex items-center gap-2">
            <Trophy className="h-4 w-4 text-primary-glow" /> CRM
          </h3>
          <p className="text-xs text-muted-foreground">
            Leads em pipeline e taxa de conversão.
          </p>
        </div>
        <Link to="/leads" className="text-xs text-primary-glow inline-flex items-center gap-1">
          Abrir pipeline <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      {isLoading || !stats ? (
        <div className="flex items-center justify-center py-10 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : stats.total === 0 ? (
        <EmptyState
          title="Nenhum lead capturado ainda"
          description="Conecte um bot ou crie um lead manualmente para começar."
        />
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4">
            <Metric label="Leads totais" value={stats.total} />
            <Metric
              label="Taxa de ganho"
              value={`${Math.round(stats.conversionRate * 100)}%`}
              tone="success"
            />
            <Metric label="Convertidos" value={stats.wonCount} tone="success" />
          </div>

          <div className="space-y-2">
            {stages.map((s) => {
              const count = stats.byStage[s.id] ?? 0;
              const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
              return (
                <div key={s.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${stageDot[s.id]}`} />
                      {s.label}
                    </span>
                    <span className="tabular-nums text-muted-foreground">{count}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full gradient-primary" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          {stats.recent.length > 0 && (
            <div>
              <div className="text-xs text-muted-foreground mb-2">Leads recentes</div>
              <ul className="space-y-1.5">
                {stats.recent.slice(0, 5).map((l) => (
                  <li key={l.id}>
                    <Link
                      to={`/leads/${l.id}`}
                      className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-background/60"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="h-6 w-6 rounded-md gradient-accent flex items-center justify-center text-[10px] font-bold text-background flex-shrink-0">
                          {l.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm truncate">{l.name}</div>
                          <div className="text-[10px] text-muted-foreground truncate">
                            {l.source} · {l.stage}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] text-primary-glow font-mono">{l.score}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Metric({
  label, value, tone,
}: { label: string; value: string | number; tone?: "success" }) {
  return (
    <div className="rounded-xl border border-border bg-background/40 p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`font-display text-2xl font-bold mt-1 ${tone === "success" ? "text-success" : ""}`}>
        {value}
      </div>
    </div>
  );
}
