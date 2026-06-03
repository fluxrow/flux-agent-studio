// Phase 23A — fabricated revenue removed. Real revenue requires real
// conversions, which only exist once leads reach "won/sold/qualified" stages.
import { Link } from "react-router-dom";
import { DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";

export default function Revenue() {
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
