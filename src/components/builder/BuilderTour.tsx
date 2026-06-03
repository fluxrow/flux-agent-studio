import { useEffect, useState } from "react";
import { X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "fluxbot.builder.tour.v1";

interface Step {
  title: string;
  body: string;
  position: "left" | "center" | "right";
}

const steps: Step[] = [
  { title: "Paleta de blocos", body: "Aqui ficam os blocos disponíveis para montar seu fluxo.", position: "left" },
  { title: "Canvas", body: "Arraste um bloco da paleta para o canvas.", position: "center" },
  { title: "Conexões", body: "Conecte os blocos clicando nos pontos das bordas para criar o fluxo.", position: "center" },
  { title: "Preview", body: "Use Preview para testar antes de publicar.", position: "right" },
];

/**
 * First-visit guided tour for the Builder. Shows once per browser.
 */
export function BuilderTour() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!localStorage.getItem(STORAGE_KEY)) {
      const t = setTimeout(() => setOpen(true), 400);
      return () => clearTimeout(t);
    }
  }, []);

  if (!open) return null;

  const close = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setOpen(false);
  };

  const next = () => {
    if (step < steps.length - 1) setStep(step + 1);
    else close();
  };

  const s = steps[step];
  const posClass =
    s.position === "left"
      ? "left-72 top-32"
      : s.position === "right"
        ? "right-[22rem] top-16"
        : "left-1/2 -translate-x-1/2 top-40";

  return (
    <>
      <div className="fixed inset-0 bg-background/40 backdrop-blur-[1px] z-40" onClick={close} />
      <div
        className={`fixed z-50 w-80 rounded-2xl border border-primary/40 bg-card shadow-glow p-4 ${posClass}`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="text-[10px] uppercase tracking-widest text-primary-glow font-medium">
            Tour · {step + 1} de {steps.length}
          </div>
          <button onClick={close} className="text-muted-foreground hover:text-foreground" aria-label="Fechar tour">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="mt-2 font-semibold text-sm">{s.title}</div>
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{s.body}</p>
        <div className="flex items-center justify-between mt-4">
          <button onClick={close} className="text-[11px] text-muted-foreground hover:text-foreground">
            Pular
          </button>
          <Button size="sm" onClick={next} className="gradient-primary text-primary-foreground border-0">
            {step < steps.length - 1 ? (
              <>Próximo <ArrowRight className="h-3 w-3 ml-1" /></>
            ) : (
              "Entendi"
            )}
          </Button>
        </div>
        <div className="flex gap-1 mt-3 justify-center">
          {steps.map((_, i) => (
            <span
              key={i}
              className={`h-1 w-6 rounded-full ${i === step ? "bg-primary" : "bg-border"}`}
            />
          ))}
        </div>
      </div>
    </>
  );
}
