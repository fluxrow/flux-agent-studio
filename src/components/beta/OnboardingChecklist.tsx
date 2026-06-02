/**
 * Phase 21 — Inline onboarding checklist for the Dashboard.
 * Derives completion from real workspace state via useWorkspaceHealth +
 * activation metrics, so it reflects what the user actually did.
 */
import { Link } from "react-router-dom";
import { CheckCircle2, Circle, ArrowRight, Rocket } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useWorkspaceHealth } from "@/beta/healthScore";
import { useWorkspace } from "@/auth/WorkspaceProvider";
import { getActivation } from "@/beta/activation";

interface Step {
  key: string;
  label: string;
  cta: string;
  href: string;
  done: boolean;
}

export function OnboardingChecklist() {
  const { data } = useWorkspaceHealth();
  const { workspace } = useWorkspace();
  const wsId = workspace?.id ?? "ws_local_demo";
  const activation = getActivation(wsId);
  const c = data?.criteria ?? [];
  const find = (k: string) => c.find((x) => x.key === k)?.ok ?? false;

  const steps: Step[] = [
    { key: "create_bot",   label: "Criar primeiro bot",      cta: "Criar bot",       href: "/bots/new",  done: find("has_bot") || !!activation.first_bot_created },
    { key: "publish",      label: "Publicar primeiro bot",   cta: "Publicar",        href: "/bots",      done: find("has_published_bot") || !!activation.first_bot_published },
    { key: "test_chat",    label: "Testar conversa",         cta: "Abrir simulador", href: "/simulator", done: find("has_conversation") || !!activation.first_conversation },
    { key: "first_lead",   label: "Capturar primeiro lead",  cta: "Ver leads",       href: "/leads",     done: find("has_lead") || !!activation.first_lead_captured },
    { key: "open_crm",     label: "Abrir CRM",               cta: "Abrir CRM",       href: "/leads",     done: find("has_lead") },
    { key: "view_analytics", label: "Ver Analytics",         cta: "Abrir Analytics", href: "/analytics", done: find("has_conversation") || find("has_lead") },
  ];

  const completed = steps.filter((s) => s.done).length;
  const pct = Math.round((completed / steps.length) * 100);

  if (pct === 100) return null;

  return (
    <section
      data-tour="dashboard-onboarding"
      className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/5 via-card/60 to-card/60 p-5 lg:p-6"
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-start gap-3 min-w-0">
          <div className="h-10 w-10 rounded-xl gradient-primary shadow-glow flex items-center justify-center flex-shrink-0">
            <Rocket className="h-4 w-4 text-primary-foreground" />
          </div>
          <div className="min-w-0">
            <div className="text-xs uppercase tracking-widest text-primary-glow">Primeiros passos</div>
            <h3 className="font-display text-lg font-semibold mt-0.5">
              Configure seu workspace
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Conclua os passos abaixo para alcançar o primeiro resultado.
            </p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="font-display text-2xl font-bold tabular-nums">{pct}%</div>
          <div className="text-[11px] text-muted-foreground">{completed}/{steps.length} concluído</div>
        </div>
      </div>

      <Progress value={pct} className="h-1.5 mb-4" />

      <ul className="grid sm:grid-cols-2 gap-2">
        {steps.map((s) => (
          <li
            key={s.key}
            className={`flex items-center gap-3 rounded-xl border p-3 ${
              s.done ? "border-emerald-500/30 bg-emerald-500/5 opacity-80" : "border-border bg-background/40"
            }`}
          >
            {s.done
              ? <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
              : <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
            <span className={`text-sm flex-1 ${s.done ? "line-through text-muted-foreground" : ""}`}>
              {s.label}
            </span>
            {!s.done && (
              <Link
                to={s.href}
                className="inline-flex items-center gap-1 text-xs font-medium text-primary-glow hover:underline"
              >
                {s.cta} <ArrowRight className="h-3 w-3" />
              </Link>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
