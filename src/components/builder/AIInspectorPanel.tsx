import { useEffect, useState } from "react";
import { Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { aiInspector } from "@/ai";
import type { AIRunRecord } from "@/ai/types";

export function AIInspectorPanel({ flowId }: { flowId?: string }) {
  const [, setTick] = useState(0);
  useEffect(() => aiInspector.subscribe(() => setTick((t) => t + 1)), []);

  const all = aiInspector.list();
  const records = flowId ? all.filter((r) => !r.flowId || r.flowId === flowId) : all;
  const stats = aiInspector.stats();

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-primary/30 bg-primary/5 p-3">
        <div className="flex items-center gap-2 text-xs text-primary-glow">
          <Sparkles className="h-3.5 w-3.5" />
          <span className="font-semibold">AI Inspector</span>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-2 text-[11px]">
          <Stat label="Runs"   value={stats.runs.toString()} />
          <Stat label="Tokens" value={(stats.inputTokens + stats.outputTokens).toLocaleString()} />
          <Stat label="Custo"  value={`$ ${stats.cost.toFixed(4)}`} />
        </div>
        <div className="flex justify-end mt-2">
          <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-muted-foreground"
            onClick={() => aiInspector.clear()}>
            <Trash2 className="h-3 w-3 mr-1" /> Limpar histórico
          </Button>
        </div>
      </div>

      {records.length === 0 && (
        <div className="rounded-xl border border-dashed border-border bg-background/30 p-6 text-center text-xs text-muted-foreground">
          Nenhuma execução IA registrada ainda. Rode um Preview ou abra o Playground.
        </div>
      )}

      {records.map((r) => <RecordCard key={r.id} record={r} />)}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-background/60 border border-border px-2 py-1.5">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="font-mono text-sm">{value}</div>
    </div>
  );
}

function RecordCard({ record }: { record: AIRunRecord }) {
  return (
    <details className="rounded-xl border border-border bg-card/60 p-3 group">
      <summary className="cursor-pointer list-none flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${record.ok ? "bg-success" : "bg-destructive"}`} />
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold truncate">{record.prompt}</div>
          <div className="text-[10px] text-muted-foreground">
            {record.provider} · {record.model} · {record.durationMs}ms · {record.usage.inputTokens + record.usage.outputTokens} tok · $ {record.usage.estimatedCost.toFixed(5)}
          </div>
        </div>
        <span className="text-[10px] text-muted-foreground">{new Date(record.at).toLocaleTimeString()}</span>
      </summary>
      <div className="mt-2 space-y-2 text-[11px]">
        <Section label="Prompt"><pre className="whitespace-pre-wrap font-mono">{record.prompt}</pre></Section>
        <Section label="Resposta">
          <pre className="whitespace-pre-wrap font-mono">{record.rawText || JSON.stringify(record.response, null, 2)}</pre>
        </Section>
        {record.error && (
          <Section label="Erro"><pre className="text-destructive font-mono">{record.error}</pre></Section>
        )}
      </div>
    </details>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-background/40 p-2">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{label}</div>
      {children}
    </div>
  );
}
