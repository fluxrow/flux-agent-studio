/**
 * Phase 23C — Compact activation tasks widget.
 * 5 auto-derived steps. Hides itself when 100% complete.
 */
import { Link } from "react-router-dom";
import { CheckCircle2, Circle, ArrowRight, ListChecks } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useActivationState } from "@/beta/activationSteps";

export function ActivationTasksCard() {
  const { data } = useActivationState();
  if (!data || data.percent === 100) return null;

  return (
    <section className="rounded-2xl border border-border bg-card/60 p-5">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="h-8 w-8 rounded-lg gradient-accent flex items-center justify-center flex-shrink-0">
            <ListChecks className="h-4 w-4 text-primary-foreground" />
          </div>
          <div className="min-w-0">
            <h3 className="font-display text-sm font-semibold">Tarefas de ativação</h3>
            <div className="text-[11px] text-muted-foreground">
              {data.completed} de {data.total} concluídas
            </div>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="font-display text-lg font-bold tabular-nums">{data.percent}%</div>
        </div>
      </div>

      <Progress value={data.percent} className="h-1 mb-3" />

      <ul className="space-y-1.5">
        {data.steps.map((s) => (
          <li key={s.key} className="flex items-center gap-2 text-xs">
            {s.done
              ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
              : <Circle className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />}
            <span className={`flex-1 truncate ${s.done ? "line-through text-muted-foreground" : ""}`}>
              {s.label}
            </span>
            {!s.done && (
              <Link
                to={s.ctaHref}
                className="inline-flex items-center gap-1 text-primary-glow hover:underline flex-shrink-0"
              >
                <ArrowRight className="h-3 w-3" />
              </Link>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
