import { useEffect, useState } from "react";
import { Radio, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { runtimeEventBus, type ExecutionEvent } from "@/runtime/events";
import { cn } from "@/lib/utils";

const typeColor: Record<string, string> = {
  flow_started:          "bg-primary/15 text-primary-glow border-primary/30",
  flow_completed:        "bg-success/15 text-success border-success/30",
  flow_abandoned:        "bg-warning/15 text-warning border-warning/30",
  block_entered:         "bg-secondary/60 text-foreground border-border",
  block_exited:          "bg-secondary/40 text-muted-foreground border-border",
  input_received:        "bg-accent/15 text-accent-foreground border-accent/30",
  choice_selected:       "bg-accent/15 text-accent-foreground border-accent/30",
  condition_evaluated:   "bg-primary/10 text-primary-glow border-primary/20",
  variable_updated:      "bg-warning/10 text-warning border-warning/20",
  lead_created:          "bg-success/15 text-success border-success/30",
  lead_updated:          "bg-success/10 text-success border-success/20",
  conversation_started:  "bg-primary/10 text-primary-glow border-primary/20",
  conversation_completed:"bg-success/10 text-success border-success/20",
};

interface Props {
  sessionId?: string | null;
  className?: string;
}

export function EventInspector({ sessionId, className }: Props) {
  const [events, setEvents] = useState<ExecutionEvent[]>(() => runtimeEventBus.getHistory());

  useEffect(() => {
    setEvents(runtimeEventBus.getHistory());
    return runtimeEventBus.on((event) => {
      setEvents((prev) => [...prev, event]);
    });
  }, []);

  const filtered = sessionId
    ? events.filter((e) => e.sessionId === sessionId)
    : events;

  return (
    <div className={cn("rounded-2xl border border-border bg-card/60 p-4", className)}>
      <div className="flex items-center gap-2 mb-3">
        <Radio className="h-3.5 w-3.5 text-primary-glow" />
        <span className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium">
          Event Inspector
        </span>
        <span className="ml-auto text-[10px] text-muted-foreground">{filtered.length}</span>
        <Button
          size="sm"
          variant="ghost"
          className="h-6 px-2 text-[10px]"
          onClick={() => {
            runtimeEventBus.clear();
            setEvents([]);
          }}
        >
          <Trash2 className="h-3 w-3 mr-1" />
          Limpar
        </Button>
      </div>

      <div className="space-y-1.5 max-h-[420px] overflow-y-auto pr-1">
        {filtered.length === 0 ? (
          <div className="text-xs text-muted-foreground py-6 text-center">
            Nenhum evento ainda.
          </div>
        ) : (
          filtered
            .slice()
            .reverse()
            .map((ev) => (
              <details
                key={ev.id}
                className="group rounded-lg border border-border bg-background/60 px-2.5 py-1.5"
              >
                <summary className="flex items-center justify-between cursor-pointer list-none gap-2">
                  <span
                    className={cn(
                      "text-[10px] font-mono px-2 py-0.5 rounded-full border whitespace-nowrap",
                      typeColor[ev.type] ?? "bg-secondary text-foreground border-border",
                    )}
                  >
                    {ev.type}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono truncate">
                    {ev.blockId ?? "—"}
                  </span>
                  <span className="text-[10px] text-muted-foreground tabular-nums whitespace-nowrap">
                    {new Date(ev.at).toLocaleTimeString()}
                  </span>
                </summary>
                <pre className="mt-2 text-[10px] font-mono text-muted-foreground bg-secondary/30 rounded p-2 overflow-x-auto">
{JSON.stringify(ev.payload, null, 2)}
                </pre>
              </details>
            ))
        )}
      </div>
    </div>
  );
}
