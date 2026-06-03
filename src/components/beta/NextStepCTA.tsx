/**
 * Phase 23C — Contextual "next logical step" CTA.
 * Surfaces a single primary action based on activation state.
 */
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useActivationState } from "@/beta/activationSteps";

export function NextStepCTA() {
  const { data } = useActivationState();
  if (!data || !data.nextStep) return null;

  return (
    <section className="rounded-2xl border border-primary/30 bg-card/60 p-5 flex items-center gap-4">
      <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
        <Sparkles className="h-4 w-4 text-primary-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[11px] uppercase tracking-widest text-muted-foreground">Próximo passo</div>
        <div className="font-display text-base font-semibold mt-0.5 truncate">
          {data.nextStep.label}
        </div>
      </div>
      <Link to={data.nextStep.ctaHref} className="flex-shrink-0">
        <Button className="gradient-primary text-primary-foreground border-0 shadow-elegant">
          {data.nextStep.ctaLabel} <ArrowRight className="h-4 w-4 ml-1.5" />
        </Button>
      </Link>
    </section>
  );
}
