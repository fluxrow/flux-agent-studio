import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Database, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getAllDomainModes,
  persistence,
  USE_SUPABASE,
  type DomainKey,
  type RepoMode,
} from "@/domain/persistence";
import {
  persistenceTelemetry,
  type DomainTelemetry,
} from "@/lib/persistence-telemetry";

const MODE_COLOR: Record<RepoMode, string> = {
  mock: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  supabase: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  stub: "bg-muted/40 text-muted-foreground border-border",
};

function relativeTime(iso?: string) {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s atrás`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m atrás`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h atrás`;
  return new Date(iso).toLocaleString();
}

export default function DebugRepositories() {
  const [telemetry, setTelemetry] = useState<DomainTelemetry[]>(
    persistenceTelemetry.snapshot(),
  );
  const [pinging, setPinging] = useState(false);

  useEffect(
    () =>
      persistenceTelemetry.subscribe(() =>
        setTelemetry(persistenceTelemetry.snapshot()),
      ),
    [],
  );

  const modes = getAllDomainModes();
  const allDomains = Object.keys(modes) as DomainKey[];

  const ping = async () => {
    setPinging(true);
    // Touch a few common repositories to populate telemetry.
    await Promise.allSettled([
      persistence.bots.list(),
      persistence.leads.list(),
      persistence.channels.list(),
      persistence.events.query({ limit: 1 }),
      persistence.workspaces.current().catch(() => null),
    ]);
    setPinging(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-[1100px] mx-auto p-6 lg:p-8 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Link to="/settings" className="inline-flex items-center gap-1 hover:text-foreground">
                <ArrowLeft className="h-3 w-3" /> Settings
              </Link>
              <span>/</span>
              <span>Debug</span>
            </div>
            <h1 className="font-display text-3xl font-bold mt-1.5">
              Repositories
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Estado em tempo real da camada de persistência.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`border ${USE_SUPABASE ? MODE_COLOR.supabase : MODE_COLOR.mock}`}>
              <Database className="h-3 w-3 mr-1" />
              {USE_SUPABASE ? "Supabase" : "Mock"}
            </Badge>
            <Button size="sm" variant="outline" onClick={ping} disabled={pinging} className="bg-secondary/40">
              <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${pinging ? "animate-spin" : ""}`} />
              Pingar repos
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => persistenceTelemetry.reset()}
              className="bg-secondary/40"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              Limpar
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card/60 overflow-hidden">
          <div className="grid grid-cols-12 px-4 py-2 text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
            <div className="col-span-3">Domínio</div>
            <div className="col-span-2">Adapter</div>
            <div className="col-span-1 text-right">Chamadas</div>
            <div className="col-span-1 text-right">Erros</div>
            <div className="col-span-2">Último fetch</div>
            <div className="col-span-3">Último erro</div>
          </div>
          {allDomains.map((domain) => {
            const t = telemetry.find((x) => x.domain === domain);
            const mode = modes[domain];
            return (
              <div
                key={domain}
                className="grid grid-cols-12 items-center px-4 py-3 border-b border-border/40 last:border-0 hover:bg-background/40 text-sm"
              >
                <div className="col-span-3 font-medium">{domain}</div>
                <div className="col-span-2">
                  <Badge className={`border text-[10px] ${MODE_COLOR[mode]}`}>
                    {mode}
                  </Badge>
                </div>
                <div className="col-span-1 text-right tabular-nums">{t?.calls ?? 0}</div>
                <div className="col-span-1 text-right tabular-nums text-destructive">
                  {t?.errors ?? 0}
                </div>
                <div className="col-span-2 text-xs text-muted-foreground">
                  {t?.lastCall ? (
                    <>
                      <div>{t.lastCall.method}()</div>
                      <div>{relativeTime(t.lastCall.at)}</div>
                    </>
                  ) : (
                    "—"
                  )}
                </div>
                <div className="col-span-3 text-xs">
                  {t?.lastError ? (
                    <div className="text-destructive/90 truncate" title={t.lastError.error}>
                      {t.lastError.method}: {t.lastError.error}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">nenhum</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-xs text-muted-foreground">
          Modo escolhido por <code>VITE_USE_SUPABASE</code>. Adapters marcados
          como <code>stub</code> ainda não foram portados para Supabase e
          retornam coleções vazias — esperado nesta fase.
        </div>
      </div>
    </div>
  );
}
