// Phase 23A — fabricated alerts removed. Intelligent alerts will return once
// real data thresholds (conversion drop, lead score, bot errors) are in place.
import { Link } from "react-router-dom";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";

export default function Alerts() {
  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      <div>
        <h1 className="font-display text-3xl font-bold">Alertas Inteligentes</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Eventos críticos detectados em tempo real a partir do seu workspace.
        </p>
      </div>

      <EmptyState
        icon={Bell}
        title="Nenhum alerta configurado."
        description="Alertas inteligentes aparecerão quando houver dados reais suficientes para detectar anomalias."
        action={
          <Link to="/analytics">
            <Button className="gradient-primary text-primary-foreground border-0 shadow-elegant">
              Ver analytics
            </Button>
          </Link>
        }
      />
    </div>
  );
}
