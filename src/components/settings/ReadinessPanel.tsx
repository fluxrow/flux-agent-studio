import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, AlertCircle, XCircle, Shield } from "lucide-react";
import { evaluateReadiness, type ReadinessCheck } from "@/compliance";

const ICON = {
  ready: CheckCircle2,
  partial: AlertCircle,
  missing: XCircle,
};
const CLASS = {
  ready: "text-success border-success/30 bg-success/10",
  partial: "text-warning border-warning/30 bg-warning/10",
  missing: "text-destructive border-destructive/30 bg-destructive/10",
};

export function ReadinessPanel() {
  const [checks, setChecks] = useState<ReadinessCheck[]>(() => evaluateReadiness());

  useEffect(() => {
    const id = setInterval(() => setChecks(evaluateReadiness()), 4000);
    return () => clearInterval(id);
  }, []);

  const score = useMemo(() => {
    const total = checks.length * 2;
    const got = checks.reduce(
      (acc, c) => acc + (c.status === "ready" ? 2 : c.status === "partial" ? 1 : 0),
      0,
    );
    return Math.round((got / total) * 100);
  }, [checks]);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-primary/30 bg-card/60 p-6 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full gradient-primary opacity-20" />
        <div className="relative flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-primary-glow uppercase tracking-widest font-semibold">
              <Shield className="h-3.5 w-3.5" /> Integration Readiness
            </div>
            <div className="font-display text-3xl font-bold mt-1">{score}%</div>
            <div className="text-xs text-muted-foreground mt-1">
              {score >= 80 ? "Pronto para submeter a review." : score >= 50 ? "Quase lá — resolva pendências." : "Configuração inicial necessária."}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Checks aprovados</div>
            <div className="font-display text-xl font-bold">
              {checks.filter((c) => c.status === "ready").length}/{checks.length}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card/60 p-2">
        {checks.map((c) => {
          const Icon = ICON[c.status];
          return (
            <div key={c.key} className="flex items-center gap-3 p-3 rounded-xl hover:bg-background/40 transition">
              <div className={`h-9 w-9 rounded-lg border flex items-center justify-center ${CLASS[c.status]}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">{c.label}</div>
                <div className="text-xs text-muted-foreground">{c.description}{c.hint ? ` · ${c.hint}` : ""}</div>
              </div>
              <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full border ${CLASS[c.status]}`}>
                {c.status}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
