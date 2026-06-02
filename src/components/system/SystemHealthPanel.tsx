import { useEffect, useState } from "react";
import { Check, X, AlertTriangle, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/auth/AuthProvider";
import { useWorkspace } from "@/auth/WorkspaceProvider";
import { USE_SUPABASE } from "@/lib/runtime-config";
import { getAllDomainModes, persistence } from "@/domain/persistence";
import {
  persistenceTelemetry,
  type DomainTelemetry,
} from "@/lib/persistence-telemetry";
import { runtimeEventBus } from "@/runtime/events";

type CheckStatus = "ok" | "warn" | "fail" | "pending";

interface HealthCheck {
  label: string;
  status: CheckStatus;
  detail?: string;
}

function StatusDot({ status }: { status: CheckStatus }) {
  const cls =
    status === "ok"
      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
      : status === "warn"
      ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
      : status === "fail"
      ? "bg-destructive/15 text-destructive border-destructive/30"
      : "bg-muted/40 text-muted-foreground border-border";
  const Icon =
    status === "ok" ? Check : status === "fail" ? X : status === "warn" ? AlertTriangle : Loader2;
  return (
    <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full border ${cls}`}>
      <Icon className={`h-3.5 w-3.5 ${status === "pending" ? "animate-spin" : ""}`} />
    </span>
  );
}

export function SystemHealthPanel() {
  const { user, loading: authLoading } = useAuth();
  const { workspace, workspaces, loading: wsLoading } = useWorkspace();
  const [telemetry, setTelemetry] = useState<DomainTelemetry[]>(
    persistenceTelemetry.snapshot(),
  );
  const [rlsCheck, setRlsCheck] = useState<CheckStatus>("pending");
  const [rlsDetail, setRlsDetail] = useState<string>();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    return persistenceTelemetry.subscribe(() =>
      setTelemetry(persistenceTelemetry.snapshot()),
    );
  }, []);

  // Probe RLS by listing bots — should succeed (own ws) or return empty.
  const probe = async () => {
    setRefreshing(true);
    setRlsCheck("pending");
    try {
      await persistence.bots.list();
      setRlsCheck("ok");
      setRlsDetail("Consulta passou pelo filtro de workspace.");
    } catch (err: any) {
      setRlsCheck("fail");
      setRlsDetail(err?.message ?? String(err));
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    probe();
     
  }, [workspace?.id, USE_SUPABASE]);

  const modes = getAllDomainModes();
  const activeRepoCount = Object.values(modes).filter((m) => m !== "stub").length;
  const stubCount = Object.values(modes).filter((m) => m === "stub").length;

  const eventTelemetry = telemetry.find((t) => t.domain === "events");

  const checks: HealthCheck[] = [
    {
      label: "Auth configurado",
      status: !USE_SUPABASE
        ? "warn"
        : authLoading
        ? "pending"
        : user
        ? "ok"
        : "fail",
      detail: !USE_SUPABASE
        ? "Modo Mock — auth não é necessária."
        : user
        ? `Logado como ${user.email}`
        : "Nenhuma sessão ativa.",
    },
    {
      label: "Workspace carregado",
      status: !USE_SUPABASE
        ? "ok"
        : wsLoading
        ? "pending"
        : workspace
        ? "ok"
        : "fail",
      detail: !USE_SUPABASE
        ? "Workspace mock padrão."
        : workspace
        ? `${workspace.name} · ${workspace.role} (${workspaces.length} total)`
        : "Nenhum workspace carregado.",
    },
    {
      label: "Modo de persistência",
      status: USE_SUPABASE ? "ok" : "warn",
      detail: USE_SUPABASE
        ? "Supabase ativo (VITE_USE_SUPABASE=true)"
        : "Mock ativo (VITE_USE_SUPABASE=false)",
    },
    {
      label: "RLS ativo",
      status: !USE_SUPABASE ? "warn" : rlsCheck,
      detail: !USE_SUPABASE
        ? "Não aplicável em Mock."
        : rlsDetail ?? "Sondando…",
    },
    {
      label: "Repositories ativos",
      status: stubCount === 0 ? "ok" : "warn",
      detail: `${activeRepoCount} ativos · ${stubCount} stub`,
    },
    {
      label: "Demo seed disponível",
      status: USE_SUPABASE && user && workspace ? "ok" : "warn",
      detail:
        USE_SUPABASE && user && workspace
          ? "Botão Carregar demo habilitado."
          : "Disponível somente em modo Supabase autenticado.",
    },
    {
      label: "Event adapter ativo",
      status: eventTelemetry && eventTelemetry.calls > 0 ? "ok" : "warn",
      detail: eventTelemetry
        ? `${eventTelemetry.calls} eventos · ${eventTelemetry.errors} erros`
        : `Aguardando primeiro evento (bus tem ${runtimeEventBus.size?.() ?? "?"} assinantes).`,
    },
  ];

  return (
    <div className="rounded-2xl border border-border bg-card/60 p-6 space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold">System Health</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Validação visual da Fase 5. Use antes de promover qualquer
            ambiente para CRM, Tracking ou IA.
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={probe}
          disabled={refreshing}
          className="bg-secondary/40"
        >
          <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${refreshing ? "animate-spin" : ""}`} />
          Re-checar
        </Button>
      </div>

      <ul className="divide-y divide-border/60 rounded-xl border border-border/60 overflow-hidden">
        {checks.map((c) => (
          <li
            key={c.label}
            className="flex items-center gap-3 px-4 py-3 bg-background/40"
          >
            <StatusDot status={c.status} />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium">{c.label}</div>
              {c.detail && (
                <div className="text-xs text-muted-foreground truncate">
                  {c.detail}
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>

      <div className="text-xs text-muted-foreground">
        Para detalhes por repository, abra{" "}
        <a className="text-primary underline" href="/debug/repositories">
          /debug/repositories
        </a>
        .
      </div>
    </div>
  );
}
