import type { EngineState } from "@/runtime";
import { Activity, Variable as VarIcon, MapPin, Clock } from "lucide-react";

const statusColor: Record<string, string> = {
  idle:            "bg-muted text-muted-foreground",
  running:         "bg-primary/15 text-primary-glow border-primary/30",
  awaiting_input:  "bg-warning/15 text-warning border-warning/30",
  awaiting_choice: "bg-warning/15 text-warning border-warning/30",
  ended:           "bg-success/15 text-success border-success/30",
  error:           "bg-destructive/15 text-destructive border-destructive/30",
};

interface Props {
  state: EngineState | null;
}

export function RuntimeInspector({ state }: Props) {
  if (!state) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card/40 p-6 text-sm text-muted-foreground">
        Engine não iniciada.
      </div>
    );
  }

  const { context, awaiting } = state;
  const vars = Object.entries(context.variables);

  return (
    <div className="space-y-4">
      <Section icon={Activity} title="Session State">
        <Row label="Status">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${statusColor[context.status]}`}>
            {context.status}
          </span>
        </Row>
        <Row label="Session ID"><code className="text-xs">{context.sessionId}</code></Row>
        <Row label="Flow ID"><code className="text-xs">{context.flowId}</code></Row>
        <Row label="Iniciada"><span className="text-xs">{new Date(context.startedAt).toLocaleTimeString()}</span></Row>
        {context.endedAt && <Row label="Encerrada"><span className="text-xs">{new Date(context.endedAt).toLocaleTimeString()}</span></Row>}
        {context.error && <Row label="Erro"><span className="text-xs text-destructive">{context.error}</span></Row>}
      </Section>

      <Section icon={MapPin} title="Current Block">
        {context.currentBlockId ? (
          <div className="space-y-1">
            <div className="text-sm font-medium">{awaiting?.label ?? context.currentBlockId}</div>
            <code className="text-[11px] text-muted-foreground">{context.currentBlockId}</code>
            {awaiting && (
              <div className="text-[10px] uppercase tracking-wider text-primary-glow">{awaiting.type}</div>
            )}
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </Section>

      <Section icon={VarIcon} title="Variables" count={vars.length}>
        {vars.length === 0 ? (
          <span className="text-xs text-muted-foreground">Nenhuma variável capturada ainda.</span>
        ) : (
          <div className="space-y-1.5">
            {vars.map(([k, v]) => (
              <div key={k} className="flex items-center justify-between text-xs rounded-lg border border-border bg-background/60 px-2.5 py-1.5">
                <span className="font-mono text-primary-glow">{k}</span>
                <span className="font-mono text-muted-foreground truncate ml-3 max-w-[160px]">
                  {v === null ? "null" : String(v)}
                </span>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section icon={Clock} title="Visited Blocks" count={context.visitedBlocks.length}>
        <div className="flex flex-wrap gap-1.5">
          {context.visitedBlocks.map((id, i) => (
            <span key={`${id}-${i}`} className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-secondary/60 border border-border text-muted-foreground">
              {id}
            </span>
          ))}
        </div>
      </Section>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  count,
  children,
}: {
  icon: typeof Activity;
  title: string;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card/60 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="h-3.5 w-3.5 text-primary-glow" />
        <span className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium">
          {title}
        </span>
        {count !== undefined && (
          <span className="ml-auto text-[10px] text-muted-foreground">{count}</span>
        )}
      </div>
      {children}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-1 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <div>{children}</div>
    </div>
  );
}
