/**
 * ConnectorBlockEditor — preview-only editor for the future "Connector" block.
 *
 * The block type is intentionally NOT yet wired into the Runtime BlockType
 * union (Phase 16 explicitly says "Ainda sem execução real"). This component
 * exists so the Builder can render a configurable surface (manifest + action +
 * parameters) once the runtime opcode lands.
 */
import { useMemo, useState } from "react";
import { Plug } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { connectorRegistry, bootstrapConnectors } from "@/connectors";
import type { ConnectorManifest, ConnectorAction } from "@/connectors";

export interface ConnectorBlockValue {
  manifestId?: string;
  actionKey?: string;
  parameters?: Record<string, string>;
}

interface Props {
  value: ConnectorBlockValue;
  onChange: (v: ConnectorBlockValue) => void;
}

export function ConnectorBlockEditor({ value, onChange }: Props) {
  bootstrapConnectors();
  const manifests = useMemo(() => connectorRegistry.list(), []);
  const manifest: ConnectorManifest | undefined = value.manifestId
    ? connectorRegistry.get(value.manifestId)
    : undefined;
  const action: ConnectorAction | undefined = manifest?.actions.find((a) => a.key === value.actionKey);
  const [paramsState, setParamsState] = useState<Record<string, string>>(value.parameters ?? {});

  const update = (next: Partial<ConnectorBlockValue>) => onChange({ ...value, ...next });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-primary-glow">
        <Plug className="h-4 w-4" /> Connector Block (preview)
      </div>

      <div className="space-y-1.5">
        <label className="text-xs uppercase tracking-wider text-muted-foreground">Conector</label>
        <Select value={value.manifestId} onValueChange={(v) => update({ manifestId: v, actionKey: undefined })}>
          <SelectTrigger><SelectValue placeholder="Selecione um conector" /></SelectTrigger>
          <SelectContent>
            {manifests.map((m) => (
              <SelectItem key={m.id} value={m.id}>{m.name} · {m.category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {manifest && (
        <div className="space-y-1.5">
          <label className="text-xs uppercase tracking-wider text-muted-foreground">Ação</label>
          <Select value={value.actionKey} onValueChange={(v) => update({ actionKey: v })}>
            <SelectTrigger><SelectValue placeholder="Selecione uma ação" /></SelectTrigger>
            <SelectContent>
              {manifest.actions.map((a) => (
                <SelectItem key={a.key} value={a.key}>{a.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {action?.parameters?.length ? (
        <div className="space-y-3 rounded-lg border border-border/60 bg-muted/20 p-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Parâmetros</p>
          {action.parameters.map((p) => {
            const v = paramsState[p.key] ?? "";
            const set = (val: string) => {
              const next = { ...paramsState, [p.key]: val };
              setParamsState(next);
              update({ parameters: next });
            };
            if (p.type === "json") {
              return (
                <div key={p.key} className="space-y-1">
                  <label className="text-xs text-muted-foreground">{p.label}</label>
                  <Textarea value={v} onChange={(e) => set(e.target.value)} placeholder='{ "key": "value" }' rows={3} />
                </div>
              );
            }
            return (
              <div key={p.key} className="space-y-1">
                <label className="text-xs text-muted-foreground">{p.label}</label>
                <Input value={v} onChange={(e) => set(e.target.value)} placeholder={p.description ?? p.key} />
              </div>
            );
          })}
        </div>
      ) : null}

      <p className="text-[11px] text-muted-foreground">
        Execução real será habilitada quando os adapters dos conectores forem ativados.
      </p>
    </div>
  );
}
