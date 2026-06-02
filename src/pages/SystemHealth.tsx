import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, CheckCircle2, AlertTriangle, XCircle, RefreshCw } from "lucide-react";
import { getHealthSnapshot, overallHealth, type HealthCheck, type HealthStatus } from "@/beta";

const STATUS_STYLES: Record<HealthStatus, { icon: typeof CheckCircle2; cls: string; label: string }> = {
  healthy: { icon: CheckCircle2, cls: "text-emerald-500 border-emerald-500/30 bg-emerald-500/10", label: "Healthy" },
  warning: { icon: AlertTriangle, cls: "text-amber-500 border-amber-500/30 bg-amber-500/10", label: "Warning" },
  error:   { icon: XCircle, cls: "text-destructive border-destructive/30 bg-destructive/10", label: "Error" },
};

export default function SystemHealth() {
  const [tick, setTick] = useState(0);
  const [snap, setSnap] = useState<HealthCheck[]>(() => getHealthSnapshot());
  useEffect(() => { setSnap(getHealthSnapshot()); }, [tick]);
  const overall = overallHealth();
  const O = STATUS_STYLES[overall];

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        eyebrow="Beta · Observabilidade"
        title="System Health"
        description="Estado em tempo real dos subsistemas do FluxBot."
        actions={
          <Button variant="outline" size="sm" onClick={() => setTick((t) => t + 1)}>
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Atualizar
          </Button>
        }
      />

      <Card className={`p-5 flex items-center gap-4 border ${O.cls}`}>
        <O.icon className="h-8 w-8" />
        <div>
          <div className="text-xs uppercase tracking-widest opacity-80">Status geral</div>
          <div className="text-2xl font-display font-bold">{O.label}</div>
        </div>
        <Activity className="h-5 w-5 ml-auto opacity-60" />
      </Card>

      <div className="grid gap-3 md:grid-cols-2">
        {snap.map((c) => {
          const S = STATUS_STYLES[c.status];
          return (
            <Card key={c.subsystem} className="p-4 flex items-start gap-3">
              <S.icon className={`h-5 w-5 mt-0.5 ${S.cls.split(" ")[0]}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-medium">{c.label}</div>
                  <Badge variant="outline" className={S.cls}>{S.label}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{c.detail}</p>
                <p className="text-[11px] text-muted-foreground/70 mt-1">
                  Verificado em {new Date(c.checkedAt).toLocaleString()}
                </p>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
