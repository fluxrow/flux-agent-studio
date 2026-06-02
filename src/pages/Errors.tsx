import { useMemo, useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertOctagon, Trash2 } from "lucide-react";
import { useWorkspace } from "@/auth/WorkspaceProvider";
import { listErrors, clearErrors, recordError, type ErrorKind } from "@/beta";

const KINDS: (ErrorKind | "all")[] = ["all", "runtime", "connector", "ai", "knowledge", "tracking"];

export default function Errors() {
  const { workspace } = useWorkspace();
  const workspaceId = workspace?.id ?? "ws_local_demo";
  const [kind, setKind] = useState<ErrorKind | "all">("all");
  const [since, setSince] = useState("");
  const [tick, setTick] = useState(0);

  const items = useMemo(() => {
    return listErrors({
      workspaceId,
      kind: kind === "all" ? undefined : kind,
      since: since ? new Date(since).toISOString() : undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId, kind, since, tick]);

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        eyebrow="Beta · Observabilidade"
        title="Error Center"
        description="Erros agregados de Runtime, Connectors, AI, Knowledge e Tracking."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => {
              recordError({ workspaceId, kind: "runtime", source: "runtime:demo", message: "Erro de exemplo" });
              setTick((t) => t + 1);
            }}>
              Simular erro
            </Button>
            <Button variant="outline" size="sm" onClick={() => { clearErrors(); setTick((t) => t + 1); }}>
              <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Limpar
            </Button>
          </div>
        }
      />

      <Card className="p-4 flex flex-wrap gap-3 items-end">
        <div className="space-y-1">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Tipo</div>
          <Select value={kind} onValueChange={(v) => setKind(v as ErrorKind | "all")}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              {KINDS.map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Desde</div>
          <Input type="date" value={since} onChange={(e) => setSince(e.target.value)} className="w-44" />
        </div>
        <div className="ml-auto text-sm text-muted-foreground">
          {items.length} registro{items.length === 1 ? "" : "s"}
        </div>
      </Card>

      <div className="space-y-2">
        {items.length === 0 && (
          <Card className="p-8 text-center text-muted-foreground">
            <AlertOctagon className="h-8 w-8 mx-auto mb-2 opacity-50" />
            Nenhum erro registrado.
          </Card>
        )}
        {items.map((e) => (
          <Card key={e.id} className="p-4">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="border-destructive/40 text-destructive">{e.kind}</Badge>
              <span className="text-sm font-medium">{e.source}</span>
              <span className="ml-auto text-[11px] text-muted-foreground">
                {new Date(e.occurredAt).toLocaleString()}
              </span>
            </div>
            <p className="mt-2 text-sm">{e.message}</p>
            {e.stack && (
              <pre className="mt-2 text-[11px] bg-secondary/40 p-2 rounded overflow-auto max-h-32">{e.stack}</pre>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
