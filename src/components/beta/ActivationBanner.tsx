/**
 * Phase 23C — First-access activation banner.
 * Renders only for "new" workspaces (no bots, no leads, onboarding < 100%).
 */
import { Link } from "react-router-dom";
import { Rocket, Plus, Wand2, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useActivationState } from "@/beta/activationSteps";

export function ActivationBanner() {
  const { data } = useActivationState();
  if (!data?.isNewWorkspace) return null;

  return (
    <section className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card/60 to-card/60 p-6 lg:p-7">
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-xl gradient-primary shadow-glow flex items-center justify-center flex-shrink-0">
          <Rocket className="h-5 w-5 text-primary-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs uppercase tracking-widest text-primary-glow">Primeiros passos</div>
          <h2 className="font-display text-xl lg:text-2xl font-bold mt-1">
            Vamos colocar seu primeiro agente no ar.
          </h2>
          <p className="text-sm text-muted-foreground mt-1.5 max-w-2xl">
            Você está a poucos minutos de criar seu primeiro agente, capturar leads e visualizar métricas reais.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link to="/bots/new">
              <Button className="gradient-primary text-primary-foreground border-0 shadow-elegant">
                <Plus className="h-4 w-4 mr-1.5" /> Criar Bot
              </Button>
            </Link>
            <Link to="/ai-builder">
              <Button variant="outline" className="bg-card/60">
                <Wand2 className="h-4 w-4 mr-1.5" /> Criar com IA
              </Button>
            </Link>
            <Link to="/onboarding">
              <Button variant="ghost">
                <ListChecks className="h-4 w-4 mr-1.5" /> Ver Onboarding
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
