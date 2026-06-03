import { CheckCircle2, AlertTriangle, Play, Rocket, Blocks, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBuilder } from "@/builder/BuilderContext";
import { FlowHealthCheck } from "./FlowHealthCheck";

interface Props {
  onPreview: () => void;
  onPublish: () => void;
}

/**
 * Rendered in the right inspector when no block is selected.
 * Provides a live summary of the flow + the two primary actions.
 */
export function FlowSummaryPanel({ onPreview, onPublish }: Props) {
  const { flow, validation } = useBuilder();
  const blockCount = flow.blocks.length;
  const connCount = flow.connections.length;

  return (
    <div className="space-y-4 py-2">
      <div>
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Resumo do fluxo
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Selecione um bloco no canvas para editá-lo, ou use as ações abaixo.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-border bg-background/60 p-3">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">
            <Blocks className="h-3 w-3" /> Blocos
          </div>
          <div className="text-xl font-display font-semibold mt-1">{blockCount}</div>
        </div>
        <div className="rounded-xl border border-border bg-background/60 p-3">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">
            <Link2 className="h-3 w-3" /> Conexões
          </div>
          <div className="text-xl font-display font-semibold mt-1">{connCount}</div>
        </div>
      </div>

      <div
        className={`rounded-xl border px-3 py-2 text-xs flex items-center gap-2 ${
          validation.valid
            ? "border-success/30 bg-success/5 text-success"
            : "border-destructive/30 bg-destructive/5 text-destructive"
        }`}
      >
        {validation.valid ? (
          <>
            <CheckCircle2 className="h-3.5 w-3.5" />
            Flow válido{validation.warnings.length > 0 && ` (${validation.warnings.length} avisos)`}
          </>
        ) : (
          <>
            <AlertTriangle className="h-3.5 w-3.5" />
            {validation.errors.length} erro(s) impedem a publicação
          </>
        )}
      </div>

      <FlowHealthCheck />

      <div className="space-y-2">
        <Button variant="outline" className="w-full bg-secondary/40" onClick={onPreview}>
          <Play className="h-4 w-4 mr-1.5" /> Preview
        </Button>
        <Button
          className="w-full gradient-primary text-primary-foreground border-0"
          onClick={onPublish}
          disabled={!validation.valid}
        >
          <Rocket className="h-4 w-4 mr-1.5" /> Publicar
        </Button>
      </div>
    </div>
  );
}
