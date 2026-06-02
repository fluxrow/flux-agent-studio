/**
 * ConnectorInspector — Builder-side panel for testing connector actions and
 * inspecting executions in real time. Reuses the global `connectorExecutionLog`
 * populated by `executeConnectorAction`.
 */
import { useEffect, useMemo, useState } from "react";
import { Activity, AlertCircle, CheckCircle2, Loader2, Play, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useWorkspace } from "@/auth/WorkspaceProvider";
import {
  bootstrapConnectors, connectorRegistry, connectorStore,
  executeConnectorAction, connectorExecutionLog,
} from "@/connectors";
import type { ErrorPolicy, ExecutionRecord } from "@/connectors";

export function ConnectorInspector() {
  bootstrapConnectors();
  const { workspace } = useWorkspace();
  const workspaceId = workspace?.id ?? "ws_local_demo";

  const [tick, setTick] = useState(0);
  useEffect(() => {
    const a = connectorStore.subscribe(() => setTick((t) => t + 1));
    const b = connectorExecutionLog.subscribe(() => setTick((t) => t + 1));
    return () => { a(); b(); };
  }, []);

  const installed = connectorStore.list(workspaceId);
  const [connectorId, setConnectorId] = useState<string | null>(null);
  useEffect(() => { if (!connectorId && installed[0]) setConnectorId(installed[0].id); }, [installed, connectorId]);

  const installation = connectorId ? connectorStore.get(workspaceId, connectorId) : undefined;
  const manifest = installation ? connectorRegistry.get(installation.manifestId) : undefined;

  const [actionKey, setActionKey] = useState<string>("");
  const action = manifest?.actions.find((a) => a.key === actionKey);
  useEffect(() => { if (manifest && !actionKey) setActionKey(manifest.actions[0]?.key ?? ""); }, [manifest, actionKey]);

  const [paramsText, setParamsText] = useState<string>("{}");
  const [mappingText, setMappingText] = useState<string>('{ "id": "data.id" }');
  const [attempts, setAttempts] = useState(1);
  const [backoff, setBackoff] = useState(500);
  const [policy, setPolicy] = useState<ErrorPolicy>("stop_on_error");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const records = useMemo(() => connectorExecutionLog.list().slice(0, 20), [tick]);

  const onRun = async () => {
    if (!installation || !action) return;
    setBusy(true); setError(null);
    try {
      const parameters = paramsText.trim() ? JSON.parse(paramsText) : {};
      const variableMapping = mappingText.trim() ? JSON.parse(mappingText) : undefined;
      await executeConnectorAction({
        workspaceId, connectorId: installation.id, actionKey: action.key,
        parameters, variableMapping,
        retry: { attempts, backoffMs: backoff },
        errorPolicy: policy,
      });
    } catch (e) {
      setError((e as Error).message);
    } finally { setBusy(false); }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="space-y-4 rounded-2xl border border-border/60 bg-card p-5">
        <h3 className="flex items-center gap-2 font-semibold"><Play className="h-4 w-4" /> Testar ação</h3>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[11px] uppercase tracking-wider text-muted-foreground">Conector</label>
            <Select value={connectorId ?? undefined} onValueChange={setConnectorId}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {installed.map((c) => {
                  const m = connectorRegistry.get(c.manifestId);
                  return <SelectItem key={c.id} value={c.id}>{m?.name ?? c.manifestId}</SelectItem>;
                })}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-[11px] uppercase tracking-wider text-muted-foreground">Ação</label>
            <Select value={actionKey} onValueChange={setActionKey}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {manifest?.actions.map((a) => <SelectItem key={a.key} value={a.key}>{a.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] uppercase tracking-wider text-muted-foreground">Parâmetros (JSON)</label>
          <Textarea value={paramsText} onChange={(e) => setParamsText(e.target.value)} rows={6} className="font-mono text-xs" />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] uppercase tracking-wider text-muted-foreground">Variable mapping (JSON)</label>
          <Textarea value={mappingText} onChange={(e) => setMappingText(e.target.value)} rows={3} className="font-mono text-xs" />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="text-[11px] uppercase tracking-wider text-muted-foreground">Tentativas</label>
            <Input type="number" min={1} max={10} value={attempts} onChange={(e) => setAttempts(Number(e.target.value) || 1)} />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] uppercase tracking-wider text-muted-foreground">Backoff (ms)</label>
            <Input type="number" min={0} value={backoff} onChange={(e) => setBackoff(Number(e.target.value) || 0)} />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] uppercase tracking-wider text-muted-foreground">Política</label>
            <Select value={policy} onValueChange={(v) => setPolicy(v as ErrorPolicy)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="stop_on_error">stop_on_error</SelectItem>
                <SelectItem value="continue_on_error">continue_on_error</SelectItem>
                <SelectItem value="fallback">fallback</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={onRun} disabled={!installation || !action || busy} className="w-full">
          {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
          Executar
        </Button>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>

      <div className="space-y-3 rounded-2xl border border-border/60 bg-card p-5">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-semibold"><Activity className="h-4 w-4" /> Execuções recentes</h3>
          <Button variant="ghost" size="sm" onClick={() => connectorExecutionLog.clear()}>
            <RotateCw className="mr-1 h-3.5 w-3.5" /> Limpar
          </Button>
        </div>
        {records.length === 0 && <p className="text-xs text-muted-foreground">Nenhuma execução ainda.</p>}
        <div className="space-y-2 max-h-[520px] overflow-y-auto">
          {records.map((r) => <ExecutionCard key={r.id} record={r} />)}
        </div>
      </div>
    </div>
  );
}

function ExecutionCard({ record }: { record: ExecutionRecord }) {
  const tone =
    record.status === "success" ? "border-success/40 bg-success/5" :
    record.status === "fallback" ? "border-warning/40 bg-warning/5" :
    "border-destructive/40 bg-destructive/5";
  const Icon = record.status === "success" ? CheckCircle2 : AlertCircle;
  return (
    <details className={`rounded-lg border p-3 text-xs ${tone}`}>
      <summary className="flex cursor-pointer items-center justify-between gap-2">
        <span className="flex items-center gap-2">
          <Icon className="h-3.5 w-3.5" />
          <span className="font-mono">{record.manifestId}.{record.actionKey}</span>
        </span>
        <span className="flex items-center gap-2 text-muted-foreground">
          <Badge variant="outline" className="text-[10px]">{record.durationMs}ms</Badge>
          <Badge variant="outline" className="text-[10px]">x{record.attempts}</Badge>
          {record.httpStatus && <Badge variant="outline" className="text-[10px]">{record.httpStatus}</Badge>}
        </span>
      </summary>
      <div className="mt-2 space-y-2">
        {record.error && (
          <pre className="overflow-x-auto rounded bg-destructive/10 p-2 text-destructive">{record.error}</pre>
        )}
        <div>
          <p className="font-semibold uppercase tracking-wider text-muted-foreground">Payload</p>
          <pre className="overflow-x-auto rounded bg-muted/30 p-2">{JSON.stringify(record.parameters, null, 2)}</pre>
        </div>
        <div>
          <p className="font-semibold uppercase tracking-wider text-muted-foreground">Resposta</p>
          <pre className="overflow-x-auto rounded bg-muted/30 p-2">{JSON.stringify(record.response, null, 2)}</pre>
        </div>
        {record.variables && Object.keys(record.variables).length > 0 && (
          <div>
            <p className="font-semibold uppercase tracking-wider text-muted-foreground">Variáveis mapeadas</p>
            <pre className="overflow-x-auto rounded bg-muted/30 p-2">{JSON.stringify(record.variables, null, 2)}</pre>
          </div>
        )}
      </div>
    </details>
  );
}
