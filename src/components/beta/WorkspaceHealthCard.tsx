/**
 * Phase 21 — Workspace Health Score card.
 * Sits in the Dashboard above the omnichannel widget.
 */
import { Link } from "react-router-dom";
import { Activity, ArrowRight, CheckCircle2, Circle } from "lucide-react";
import { useWorkspaceHealth, HEALTH_TIERS } from "@/beta/healthScore";
import { InfoTooltip } from "@/components/shared/InfoTooltip";

export function WorkspaceHealthCard() {
  const { data, isLoading } = useWorkspaceHealth();
  const score = data?.score ?? 0;
  const tier = data?.tier ?? HEALTH_TIERS[0];
  const criteria = data?.criteria ?? [];
  const pending = criteria.filter((c) => !c.ok).slice(0, 3);

  return (
    <section className="rounded-2xl border border-border bg-card/60 p-5 lg:p-6">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-start gap-3 min-w-0">
          <div className="h-10 w-10 rounded-xl gradient-accent shadow-glow flex items-center justify-center flex-shrink-0">
            <Activity className="h-4 w-4 text-primary-foreground" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Workspace Score</div>
              <InfoTooltip content="Soma 8 critérios objetivos (bots, leads, conversas, tracking, IA, knowledge, canais)." />
            </div>
            <h3 className="font-display text-lg font-semibold mt-0.5">{tier.label}</h3>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="font-display text-3xl font-bold tabular-nums">
            {isLoading ? "—" : score}
            <span className="text-base text-muted-foreground font-medium">/100</span>
          </div>
        </div>
      </div>

      {/* tier bar */}
      <div className="grid grid-cols-4 gap-1 mb-5">
        {HEALTH_TIERS.map((t) => {
          const reached = score >= t.min;
          return (
            <div key={t.key} className="space-y-1">
              <div className={`h-1.5 rounded-full ${reached ? "gradient-primary" : "bg-secondary"}`} />
              <div className={`text-[10px] ${tier.key === t.key ? "text-primary-glow font-medium" : "text-muted-foreground"}`}>
                {t.label}
              </div>
            </div>
          );
        })}
      </div>

      <ul className="space-y-2">
        {criteria.map((c) => (
          <li key={c.key} className="flex items-center gap-2 text-xs">
            {c.ok
              ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              : <Circle className="h-3.5 w-3.5 text-muted-foreground" />}
            <span className={c.ok ? "text-muted-foreground line-through" : ""}>{c.label}</span>
          </li>
        ))}
      </ul>

      {pending.length > 0 && (
        <div className="mt-5 pt-5 border-t border-border space-y-2">
          <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
            Recomendações
          </div>
          {pending.map((p) => (
            <div key={p.key} className="flex items-center justify-between gap-2 text-xs">
              <span className="text-foreground/80 truncate">{p.recommendation}</span>
              <Link
                to={p.ctaHref}
                className="inline-flex items-center gap-1 text-primary-glow hover:underline flex-shrink-0"
              >
                {p.ctaLabel} <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
