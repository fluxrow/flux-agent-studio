// Phase 23A — fabricated attribution removed. Real attribution requires
// published bots receiving traffic with UTM parameters.
import { Link } from "react-router-dom";
import { Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";

export default function Attribution() {
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
