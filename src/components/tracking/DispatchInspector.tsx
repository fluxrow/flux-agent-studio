import { useEffect, useState } from "react";
import { destinations } from "@/tracking/destinations";
import type { DispatchRecord } from "@/tracking/destinations/types";
import { ArrowRight, Eraser, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

const outcomeBadge: Record<DispatchRecord["outcome"], string> = {
  success: "bg-success/15 text-success border-success/30",
  skipped: "bg-warning/15 text-warning border-warning/30",
  failure: "bg-destructive/15 text-destructive border-destructive/30",
};

export function DispatchInspector() {
  const [records, setRecords] = useState<DispatchRecord[]>(destinations.getRecords());
  useEffect(() => destinations.on(() => setRecords(destinations.getRecords())), []);

  return (
    <div className="rounded-2xl border border-border bg-card/60 p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display text-lg font-semibold flex items-center gap-2">
          <Send className="h-4 w-4" /> Destination Dispatch
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground">{records.length} despachos</span>
          <Button size="sm" variant="outline" onClick={() => destinations.clearRecords()}>
            <Eraser className="h-3.5 w-3.5 mr-1.5" /> Limpar
          </Button>
        </div>
      </div>

      {records.length === 0 ? (
        <div className="text-xs text-muted-foreground py-8 text-center">
          Sem despachos ainda. Inicie um fluxo ou complete um lead para ver os eventos mapeados.
        </div>
      ) : (
        <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
          {records.map((r) => (
            <div key={r.id} className="rounded-lg border border-border/60 bg-background/40 p-3 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="rounded-full border border-border bg-background/60 px-2 py-0.5 text-[10px] font-mono">
                  {r.internalType}
                </span>
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                <span className="rounded-full border border-primary/30 bg-primary/15 px-2 py-0.5 text-[10px] font-mono text-primary-glow">
                  {r.destination}
                </span>
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                <span className="rounded-full border border-accent/30 bg-accent/15 px-2 py-0.5 text-[10px] font-mono text-accent">
                  {r.externalName}
                </span>
                <span className={`ml-auto rounded-full border px-2 py-0.5 text-[10px] font-mono ${outcomeBadge[r.outcome]}`}>
                  {r.outcome}
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {new Date(r.at).toLocaleTimeString()}
                </span>
              </div>
              {r.error && (
                <div className="mt-1.5 text-[10px] text-destructive font-mono">{r.error}</div>
              )}
              <pre className="mt-1.5 text-[10px] text-foreground/70 bg-background/40 rounded p-1.5 overflow-x-auto max-h-32">
                {JSON.stringify(r.payload, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
