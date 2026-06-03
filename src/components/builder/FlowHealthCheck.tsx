import { CheckCircle2, AlertTriangle, Circle } from "lucide-react";
import { useBuilder } from "@/builder/BuilderContext";
import { analyzeLeadCapture } from "@/builder/leadCapture";
import { useMemo } from "react";

interface HealthItem {
  ok: boolean;
  warn?: boolean;
  label: string;
}

/**
 * Phase 25A — Builder health check card.
 * Friendly, plain-language summary of whether the flow is ready to publish
 * and whether it will actually capture leads.
 */
export function FlowHealthCheck() {
  const { flow, validation } = useBuilder();

  const items = useMemo<HealthItem[]>(() => {
    const hasStart = flow.blocks.some((b) => b.type === "start");
    const hasMessage = flow.blocks.some((b) => b.type === "message");
    const capture = analyzeLeadCapture(flow);
    return [
      { ok: hasStart, label: "Fluxo possui início" },
      { ok: hasMessage, label: "Fluxo possui mensagens" },
      {
        ok: capture.capturesAny,
        warn: !capture.capturesAny,
        label: capture.capturesAny
          ? "Coleta dados de contato"
          : "Não coleta dados de contato",
      },
      {
        ok: validation.valid,
        label: validation.valid
          ? "Fluxo pronto para publicação"
          : `${validation.errors.length} erro(s) impedem a publicação`,
      },
    ];
  }, [flow, validation]);

  return (
    <div className="rounded-xl border border-border bg-background/60 p-3 space-y-2">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
        Health check
      </div>
      <ul className="space-y-1.5">
        {items.map((it, i) => (
          <li key={i} className="flex items-start gap-2 text-xs">
            {it.ok ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
            ) : it.warn ? (
              <AlertTriangle className="h-3.5 w-3.5 text-warning shrink-0 mt-0.5" />
            ) : (
              <Circle className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
            )}
            <span className={it.ok ? "" : it.warn ? "text-warning" : "text-muted-foreground"}>
              {it.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
