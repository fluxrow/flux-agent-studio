import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, ArrowRight } from "lucide-react";
import { useWorkspace } from "@/auth/WorkspaceProvider";
import {
  ONBOARDING_STEPS, getOnboardingProgress, completeOnboardingStep,
  resetOnboarding, onboardingPercent,
} from "@/beta";

export default function Onboarding() {
  const navigate = useNavigate();
  const { workspace } = useWorkspace();
  const workspaceId = workspace?.id ?? "ws_local_demo";
  const [, force] = useState(0);
  const progress = getOnboardingProgress(workspaceId);
  const pct = onboardingPercent(workspaceId);

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <PageHeader
        eyebrow="Beta · Onboarding"
        title="Primeiros passos"
        description="Conclua os passos para liberar todo o potencial do FluxBot."
        actions={
          <Button variant="outline" size="sm" onClick={() => { resetOnboarding(workspaceId); force((n) => n + 1); }}>
            Reiniciar
          </Button>
        }
      />

      <Card className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Progresso</div>
            <div className="text-2xl font-bold font-display">{pct}%</div>
          </div>
          <div className="text-sm text-muted-foreground">{progress.completed.length}/{ONBOARDING_STEPS.length} concluídos</div>
        </div>
        <Progress value={pct} />
      </Card>

      <div className="space-y-3">
        {ONBOARDING_STEPS.map((step, idx) => {
          const done = progress.completed.includes(step.key);
          return (
            <Card key={step.key} className={`p-5 flex items-start gap-4 ${done ? "opacity-70" : ""}`}>
              {done
                ? <CheckCircle2 className="h-6 w-6 text-emerald-500 mt-0.5" />
                : <Circle className="h-6 w-6 text-muted-foreground mt-0.5" />}
              <div className="flex-1">
                <div className="text-xs uppercase tracking-widest text-muted-foreground">Passo {idx + 1}</div>
                <div className="font-medium">{step.title}</div>
                <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  size="sm"
                  className="gradient-primary text-primary-foreground border-0"
                  onClick={() => navigate(step.ctaHref)}
                >
                  {step.ctaLabel} <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
                {!done && (
                  <Button size="sm" variant="ghost" onClick={() => {
                    completeOnboardingStep(workspaceId, step.key);
                    force((n) => n + 1);
                  }}>
                    Marcar concluído
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
