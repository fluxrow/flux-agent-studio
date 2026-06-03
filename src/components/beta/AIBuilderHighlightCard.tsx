/**
 * Phase 23C — Dashboard highlight card for the AI Builder.
 */
import { Link } from "react-router-dom";
import { Wand2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AIBuilderHighlightCard() {
  return (
    <section className="rounded-2xl border border-border bg-gradient-to-br from-accent/10 via-card/60 to-card/60 p-5 lg:p-6">
      <div className="flex items-start gap-4">
        <div className="h-10 w-10 rounded-xl gradient-accent shadow-glow flex items-center justify-center flex-shrink-0">
          <Wand2 className="h-4 w-4 text-primary-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs uppercase tracking-widest text-primary-glow">AI Builder</div>
          <h3 className="font-display text-lg font-semibold mt-0.5">
            Crie um agente em menos de 30 segundos
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Descreva seu negócio e deixe a IA montar o fluxo inicial.
          </p>
          <Link to="/ai-builder" className="inline-block mt-3">
            <Button className="gradient-primary text-primary-foreground border-0 shadow-elegant">
              Criar com IA <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
