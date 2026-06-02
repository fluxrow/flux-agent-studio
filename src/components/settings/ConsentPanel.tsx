import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Cookie, ShieldCheck } from "lucide-react";
import { listConsents, recordConsent, type ConsentRecord } from "@/compliance";
import { toast } from "sonner";

export function ConsentPanel() {
  const [items, setItems] = useState<ConsentRecord[]>(() => listConsents());

  useEffect(() => {
    const id = setInterval(() => setItems(listConsents()), 3000);
    return () => clearInterval(id);
  }, []);

  const seed = () => {
    recordConsent({
      visitorId: `demo_${Math.random().toString(36).slice(2, 8)}`,
      regime: "lgpd",
      channel: "cookies",
      status: "granted",
      policyVersion: 1,
      origin: typeof window !== "undefined" ? window.location.origin : undefined,
    });
    setItems(listConsents());
    toast.success("Consentimento de teste registrado.");
  };

  return (
    <div className="rounded-2xl border border-border bg-card/60 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary-glow" /> Consent Tracking
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Registros de consentimento LGPD / GDPR por visitante.
          </p>
        </div>
        <Button size="sm" variant="outline" className="bg-secondary/40" onClick={seed}>
          <Cookie className="h-3.5 w-3.5 mr-1.5" /> Registrar teste
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(["lgpd", "gdpr", "cookies", "communication"] as const).map((label) => {
          const count = items.filter((i) => i.regime === label || i.channel === label).length;
          return (
            <div key={label} className="rounded-xl border border-border bg-background/40 p-3">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
              <div className="font-display text-xl font-bold mt-1">{count}</div>
            </div>
          );
        })}
      </div>

      <div className="max-h-[280px] overflow-y-auto space-y-1.5">
        {items.length === 0 && (
          <div className="text-sm text-muted-foreground text-center py-6 border border-dashed border-border rounded-xl">
            Nenhum consentimento registrado.
          </div>
        )}
        {items.slice(0, 30).map((i) => (
          <div key={i.id} className="flex items-center gap-3 rounded-lg border border-border bg-background/40 p-2.5 text-xs">
            <span className={`px-1.5 py-0.5 rounded font-mono uppercase tracking-widest text-[10px] ${
              i.status === "granted"
                ? "bg-success/15 text-success"
                : "bg-destructive/15 text-destructive"
            }`}>
              {i.status}
            </span>
            <span className="font-mono text-foreground/80 truncate flex-1">{i.visitorId}</span>
            <span className="text-muted-foreground">{i.regime} · {i.channel}</span>
            <span className="text-muted-foreground">{new Date(i.recordedAt).toLocaleTimeString("pt-BR")}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
