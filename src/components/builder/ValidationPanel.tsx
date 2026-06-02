import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import type { ValidationReport } from "@/runtime";
import { cn } from "@/lib/utils";

interface Props {
  report: ValidationReport;
  onSelectBlock?: (blockId: string) => void;
}

export function ValidationPanel({ report, onSelectBlock }: Props) {
  const { errors, warnings, valid } = report;

  return (
    <div className="rounded-2xl border border-border bg-card/60 p-4 space-y-3">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {valid ? (
            <CheckCircle2 className="h-4 w-4 text-success" />
          ) : (
            <XCircle className="h-4 w-4 text-destructive" />
          )}
          <span className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium">
            Validação do Flow
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px]">
          <span className="px-2 py-0.5 rounded-full bg-destructive/15 text-destructive border border-destructive/30">
            {errors.length} erros
          </span>
          <span className="px-2 py-0.5 rounded-full bg-warning/15 text-warning border border-warning/30">
            {warnings.length} avisos
          </span>
        </div>
      </header>

      <div
        className={cn(
          "text-xs px-3 py-2 rounded-lg border",
          valid
            ? "border-success/30 bg-success/5 text-success"
            : "border-destructive/30 bg-destructive/5 text-destructive",
        )}
      >
        {valid
          ? warnings.length === 0
            ? "✓ Flow válido e pronto para publicar."
            : `✓ Flow válido (${warnings.length} avisos).`
          : `${errors.length} erro(s) impedem a publicação.`}
      </div>

      {report.all.length === 0 ? (
        <div className="text-xs text-muted-foreground py-3 text-center">
          Nenhum problema encontrado.
        </div>
      ) : (
        <ul className="space-y-1.5 max-h-[260px] overflow-y-auto pr-1">
          {report.all.map((issue, i) => (
            <li
              key={i}
              onClick={() => issue.blockId && onSelectBlock?.(issue.blockId)}
              className={cn(
                "flex items-start gap-2 text-xs rounded-lg border px-2.5 py-2 transition",
                issue.severity === "error"
                  ? "border-destructive/30 bg-destructive/5"
                  : "border-warning/30 bg-warning/5",
                issue.blockId && "cursor-pointer hover:bg-card",
              )}
            >
              {issue.severity === "error" ? (
                <XCircle className="h-3.5 w-3.5 text-destructive mt-0.5 shrink-0" />
              ) : (
                <AlertTriangle className="h-3.5 w-3.5 text-warning mt-0.5 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="text-foreground">{issue.message}</div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-0.5">
                  {issue.code.replace(/_/g, " ")}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
