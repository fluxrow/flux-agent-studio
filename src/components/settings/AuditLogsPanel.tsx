import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, ScrollText } from "lucide-react";
import { listAuditLogs, type AuditLogEntry } from "@/compliance";

export function AuditLogsPanel() {
  const [entries, setEntries] = useState<AuditLogEntry[]>(() => listAuditLogs());

  useEffect(() => {
    const id = setInterval(() => setEntries(listAuditLogs()), 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="rounded-2xl border border-border bg-card/60 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold flex items-center gap-2"><ScrollText className="h-4 w-4 text-primary-glow" /> Logs de auditoria</h3>
          <p className="text-xs text-muted-foreground mt-1">Eventos críticos do workspace (últimos 200).</p>
        </div>
        <Button size="sm" variant="outline" className="bg-secondary/40" onClick={() => setEntries(listAuditLogs())}>
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Atualizar
        </Button>
      </div>

      <div className="max-h-[420px] overflow-y-auto space-y-1.5">
        {entries.length === 0 && (
          <div className="text-sm text-muted-foreground text-center py-8 border border-dashed border-border rounded-xl">
            Nenhum evento registrado ainda.
          </div>
        )}
        {entries.map((e) => (
          <div key={e.id} className="flex items-start gap-3 rounded-lg border border-border bg-background/40 p-2.5">
            <span className="text-[10px] uppercase tracking-widest px-1.5 py-0.5 rounded bg-primary/10 text-primary-glow font-mono whitespace-nowrap">
              {e.action}
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-foreground/90 font-mono truncate">
                {e.target ?? "—"}
              </div>
              {e.metadata && (
                <div className="text-[10px] text-muted-foreground font-mono truncate">
                  {JSON.stringify(e.metadata)}
                </div>
              )}
            </div>
            <div className="text-[10px] text-muted-foreground whitespace-nowrap">
              {new Date(e.at).toLocaleTimeString("pt-BR")}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
