/**
 * Connector Center — /connectors
 *
 * Browse all manifests, install/configure/connect/disconnect, inspect actions
 * and triggers. Backed entirely by ConnectorRegistry + connectorStore, so any
 * future connector (Google, Slack, Stripe, HubSpot, n8n, custom APIs) appears
 * automatically without page changes.
 */
import { useEffect, useMemo, useState } from "react";
import {
  Plug, Settings2, Trash2, CheckCircle2, Circle, AlertCircle, PauseCircle, KeyRound,
  Zap, RadioTower, ShieldCheck, X,
} from "lucide-react";
import { useWorkspace } from "@/auth/WorkspaceProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  bootstrapConnectors, connectorRegistry, connectorStore,
  installConnector, configureConnector, connectConnector,
  disconnectConnector, disableConnector,
} from "@/connectors";
import type { Connector, ConnectorLifecycle, ConnectorManifest } from "@/connectors";

const lifecycleMeta: Record<ConnectorLifecycle, { label: string; tone: string; icon: typeof Circle }> = {
  installed:    { label: "Instalado",    tone: "bg-muted text-muted-foreground",          icon: Circle },
  configured:   { label: "Configurado",  tone: "bg-warning/15 text-warning",              icon: KeyRound },
  connected:    { label: "Conectado",    tone: "bg-success/15 text-success",              icon: CheckCircle2 },
  disconnected: { label: "Desconectado", tone: "bg-muted text-muted-foreground",          icon: Circle },
  error:        { label: "Erro",         tone: "bg-destructive/15 text-destructive",      icon: AlertCircle },
  disabled:     { label: "Desativado",   tone: "bg-muted text-muted-foreground",          icon: PauseCircle },
};

export default function Connectors() {
  const { workspace } = useWorkspace();
  const workspaceId = workspace?.id ?? "ws_local_demo";
  bootstrapConnectors();

  const [tick, setTick] = useState(0);
  useEffect(() => {
    const a = connectorStore.subscribe(() => setTick((t) => t + 1));
    const b = connectorRegistry.subscribe(() => setTick((t) => t + 1));
    return () => { a(); b(); };
  }, []);

  const manifests = useMemo(() => connectorRegistry.list(), [tick]);
  const installed = connectorStore.list(workspaceId);
  const installedByManifest = new Map(installed.map((c) => [c.manifestId, c]));

  const [query, setQuery] = useState("");
  const filtered = manifests.filter((m) =>
    !query || m.name.toLowerCase().includes(query.toLowerCase()) || m.category.includes(query.toLowerCase())
  );

  const [configureFor, setConfigureFor] = useState<{ manifest: ConnectorManifest; connector: Connector } | null>(null);

  return (
    <div className="space-y-6 p-6">
      <header className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
          <Plug className="h-3.5 w-3.5" /> Connector Hub
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Connector Center</h1>
        <p className="text-sm text-muted-foreground">
          Catálogo unificado de integrações. Toda integração futura — Google, Slack, Stripe,
          HubSpot, Meta, WhatsApp, Telegram, Salesforce, n8n, APIs próprias — passa por aqui.
        </p>
      </header>

      <div className="flex items-center gap-3">
        <Input
          placeholder="Buscar conectores…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-sm"
        />
        <Badge variant="secondary">{installed.length} instalados</Badge>
        <Badge variant="outline">{manifests.length} disponíveis</Badge>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="installed">Instalados</TabsTrigger>
          <TabsTrigger value="available">Disponíveis</TabsTrigger>
          <TabsTrigger value="inspector">Inspector</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <Grid manifests={filtered} installedByManifest={installedByManifest} workspaceId={workspaceId} onConfigure={setConfigureFor} />
        </TabsContent>
        <TabsContent value="installed" className="mt-4">
          <Grid
            manifests={filtered.filter((m) => installedByManifest.has(m.id))}
            installedByManifest={installedByManifest}
            workspaceId={workspaceId}
            onConfigure={setConfigureFor}
          />
        </TabsContent>
        <TabsContent value="available" className="mt-4">
          <Grid
            manifests={filtered.filter((m) => !installedByManifest.has(m.id))}
            installedByManifest={installedByManifest}
            workspaceId={workspaceId}
            onConfigure={setConfigureFor}
          />
        </TabsContent>
        <TabsContent value="inspector" className="mt-4">
          <ConnectorInspector />
        </TabsContent>
      </Tabs>

      <ConfigureDialog
        state={configureFor}
        onClose={() => setConfigureFor(null)}
        workspaceId={workspaceId}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
function Grid({
  manifests, installedByManifest, workspaceId, onConfigure,
}: {
  manifests: ConnectorManifest[];
  installedByManifest: Map<string, Connector>;
  workspaceId: string;
  onConfigure: (s: { manifest: ConnectorManifest; connector: Connector }) => void;
}) {
  if (!manifests.length) {
    return <p className="text-sm text-muted-foreground">Nenhum conector encontrado.</p>;
  }
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {manifests.map((m) => (
        <ConnectorCard
          key={m.id}
          manifest={m}
          connector={installedByManifest.get(m.id)}
          workspaceId={workspaceId}
          onConfigure={(c) => onConfigure({ manifest: m, connector: c })}
        />
      ))}
    </div>
  );
}

function ConnectorCard({
  manifest, connector, workspaceId, onConfigure,
}: {
  manifest: ConnectorManifest;
  connector?: Connector;
  workspaceId: string;
  onConfigure: (c: Connector) => void;
}) {
  const meta = connector ? lifecycleMeta[connector.lifecycle] : null;
  const Icon = meta?.icon;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{manifest.name}</h3>
            {manifest.official && (
              <Badge variant="outline" className="gap-1 text-[10px]"><ShieldCheck className="h-3 w-3" /> Oficial</Badge>
            )}
          </div>
          <p className="mt-0.5 text-xs uppercase tracking-wider text-muted-foreground">
            {manifest.category} · {manifest.kind} · v{manifest.version}
          </p>
        </div>
        {meta && Icon && (
          <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] ${meta.tone}`}>
            <Icon className="h-3 w-3" /> {meta.label}
          </span>
        )}
      </div>

      <p className="text-sm text-muted-foreground">{manifest.description}</p>

      <div className="flex flex-wrap gap-2 text-[11px]">
        <Badge variant="secondary" className="gap-1"><Zap className="h-3 w-3" /> {manifest.actions.length} ações</Badge>
        <Badge variant="secondary" className="gap-1"><RadioTower className="h-3 w-3" /> {manifest.triggers.length} triggers</Badge>
        <Badge variant="outline">{manifest.permissions.length} permissões</Badge>
      </div>

      <div className="mt-auto flex flex-wrap gap-2 pt-2">
        {!connector && (
          <Button size="sm" onClick={() => installConnector(workspaceId, manifest.id)}>Instalar</Button>
        )}
        {connector && (
          <>
            <Button size="sm" variant="outline" onClick={() => onConfigure(connector)}>
              <Settings2 className="mr-1 h-3.5 w-3.5" /> Configurar
            </Button>
            {connector.lifecycle === "configured" && (
              <Button size="sm" onClick={() => connectConnector(workspaceId, connector.id)}>Conectar</Button>
            )}
            {connector.lifecycle === "connected" && (
              <Button size="sm" variant="ghost" onClick={() => disconnectConnector(workspaceId, connector.id)}>
                Desconectar
              </Button>
            )}
            {connector.lifecycle !== "disabled" && (
              <Button size="sm" variant="ghost" onClick={() => disableConnector(workspaceId, connector.id)}>
                <PauseCircle className="mr-1 h-3.5 w-3.5" /> Desativar
              </Button>
            )}
            <Button size="sm" variant="ghost" className="text-destructive" onClick={() => connectorStore.remove(workspaceId, connector.id)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </>
        )}
      </div>

      <details className="mt-1">
        <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">Ver ações & triggers</summary>
        <div className="mt-2 space-y-2 text-xs">
          {manifest.actions.length > 0 && (
            <div>
              <p className="font-semibold uppercase tracking-wider text-muted-foreground">Ações</p>
              <ul className="ml-3 list-disc text-muted-foreground">
                {manifest.actions.map((a) => <li key={a.key}><span className="text-foreground">{a.name}</span> — <code>{a.key}</code></li>)}
              </ul>
            </div>
          )}
          {manifest.triggers.length > 0 && (
            <div>
              <p className="font-semibold uppercase tracking-wider text-muted-foreground">Triggers</p>
              <ul className="ml-3 list-disc text-muted-foreground">
                {manifest.triggers.map((t) => <li key={t.key}><span className="text-foreground">{t.name}</span> — <code>{t.key}</code></li>)}
              </ul>
            </div>
          )}
        </div>
      </details>
    </div>
  );
}

/* ------------------------------------------------------------------ */
function ConfigureDialog({
  state, onClose, workspaceId,
}: {
  state: { manifest: ConnectorManifest; connector: Connector } | null;
  onClose: () => void;
  workspaceId: string;
}) {
  const [values, setValues] = useState<Record<string, string>>({});
  useEffect(() => { setValues({}); }, [state?.connector.id]);

  if (!state) return null;
  const { manifest, connector } = state;
  const spec = manifest.credentials;
  const credentials = connectorStore.listCredentials(workspaceId, connector.id);

  const onSave = () => {
    configureConnector(workspaceId, connector.id, values);
    onClose();
  };

  return (
    <Dialog open={!!state} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="h-4 w-4" /> Configurar {manifest.name}
          </DialogTitle>
        </DialogHeader>

        {credentials.length > 0 && (
          <div className="space-y-2 rounded-lg border border-border/60 bg-muted/30 p-3">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Credenciais salvas</p>
            {credentials.map((c) => (
              <div key={c.id} className="flex items-center justify-between text-xs">
                <span>{c.environment} · {Object.entries(c.preview).map(([k, v]) => `${k}=${v}`).join(", ")}</span>
                <Button size="sm" variant="ghost" onClick={() => connectorStore.removeCredential(workspaceId, c.id)}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {spec?.fields.length ? (
          <div className="space-y-3">
            {spec.fields.map((f) => (
              <div key={f.key} className="space-y-1">
                <label className="text-xs font-medium">
                  {f.label} {f.required && <span className="text-destructive">*</span>}
                </label>
                <Input
                  type={f.type === "password" ? "password" : "text"}
                  placeholder={f.placeholder ?? f.key}
                  value={values[f.key] ?? ""}
                  onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                />
                {f.helpText && <p className="text-[11px] text-muted-foreground">{f.helpText}</p>}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Este conector não exige credenciais.</p>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={onSave}>Salvar credenciais</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
