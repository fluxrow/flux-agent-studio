import { Link } from "react-router-dom";
import {
  TrendingUp, ArrowUpRight, Bot, Sparkles, MessageSquare, Users, Target, Plus, PlayCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CrmDashboardWidget } from "@/components/dashboard/CrmDashboardWidget";
import { OmnichannelWidget } from "@/components/dashboard/OmnichannelWidget";
import { LeadIntelligenceWidget } from "@/components/dashboard/LeadIntelligenceWidget";
import { EmptyState } from "@/components/shared/EmptyState";
import { InfoTooltip } from "@/components/shared/InfoTooltip";
import { OnboardingChecklist } from "@/components/beta/OnboardingChecklist";
import { WorkspaceHealthCard } from "@/components/beta/WorkspaceHealthCard";
import { ContextualFeedback } from "@/components/beta/ContextualFeedback";
import { useAuth } from "@/auth/AuthProvider";
import { useWorkspace } from "@/auth/WorkspaceProvider";
import { useBasicStats } from "@/lib/analytics-basic";
import { useBots } from "@/domain/hooks";
import { setDemoMode, isDemoMode } from "@/beta/demoMode";
import { toast } from "sonner";

function greetingFor(date: Date): string {
  const h = date.getHours();
  if (h < 5) return "Boa madrugada";
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

const KPI_HELP: Record<string, string> = {
  Bots:       "Quantidade de agentes (ativos + rascunhos) neste workspace.",
  Leads:      "Total de leads capturados pelos seus bots.",
  Conversas:  "Sessões de chat já registradas (públicas + canais).",
  Conversões: "Leads que avançaram para estágios finais do pipeline (vendido/ganho/qualificado).",
};

export default function Dashboard() {
  const { user } = useAuth();
  const { workspace } = useWorkspace();
  const { data: stats, isLoading: statsLoading } = useBasicStats();
  const { data: botsPage } = useBots({ page: 1, pageSize: 4 });

  const firstName = ((user?.user_metadata?.full_name as string | undefined) ?? user?.email?.split("@")[0] ?? "").split(" ")[0];
  const greeting = greetingFor(new Date());

  const kpiCards = [
    { label: "Bots",        value: stats?.bots ?? 0,          icon: Bot },
    { label: "Leads",       value: stats?.leads ?? 0,         icon: Users },
    { label: "Conversas",   value: stats?.conversations ?? 0, icon: MessageSquare },
    { label: "Conversões",  value: stats?.conversions ?? 0,   icon: Target },
  ];

  const isEmptyWorkspace =
    !statsLoading &&
    (stats?.bots ?? 0) === 0 &&
    (stats?.leads ?? 0) === 0 &&
    (stats?.conversations ?? 0) === 0;

  const topBots = (botsPage?.items ?? []).slice(0, 4);

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* header */}
      <div className="flex items-end justify-between">
        <div>
          <div className="text-xs uppercase tracking-widest text-primary-glow font-medium">
            {workspace?.name ? `Workspace · ${workspace.name}` : "Workspace"}
          </div>
          <h1 className="font-display text-3xl font-bold mt-1.5">
            {greeting}{firstName ? `, ${firstName}` : ""} 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Veja o desempenho dos seus agentes hoje.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="bg-card/60"
            onClick={() => {
              const on = !isDemoMode();
              setDemoMode(on);
              toast.success(on ? "Modo demonstração ativado" : "Modo demonstração desativado", {
                description: on
                  ? "Explore o produto com dados de exemplo (workspace real não é afetado)."
                  : "Voltando ao seu workspace.",
              });
            }}
          >
            <PlayCircle className="h-4 w-4 mr-1.5" /> Explorar workspace demo
          </Button>
          <Link to="/docs">
            <Button variant="outline" className="bg-card/60">
              <Sparkles className="h-4 w-4 mr-1.5" /> Guia rápido
            </Button>
          </Link>
        </div>
      </div>

      <OnboardingChecklist />

      {/* KPIs — agregações reais com tooltips explicativos */}
      <div data-tour="dashboard-kpis" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((k) => (
          <div key={k.label} className="rounded-2xl border border-border bg-card/60 p-5 hover:border-primary/40 transition">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="text-xs text-muted-foreground">{k.label}</div>
                <InfoTooltip content={KPI_HELP[k.label]} />
              </div>
              <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
                <k.icon className="h-4 w-4 text-primary-foreground" />
              </div>
            </div>
            <div className="font-display text-3xl font-bold mt-3 tabular-nums">
              {statsLoading ? "—" : k.value.toLocaleString()}
            </div>
            <div className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3" /> dados em tempo real
            </div>
          </div>
        ))}
      </div>

      {isEmptyWorkspace ? (
        <EmptyState
          icon={Bot}
          title="Você ainda não criou seu primeiro bot"
          description="Quando seus bots começarem a conversar com leads, esta tela mostrará desempenho, alertas inteligentes e atribuição em tempo real."
          action={
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Link to="/bots/new">
                <Button className="gradient-primary text-primary-foreground border-0 shadow-elegant">
                  <Plus className="h-4 w-4 mr-1.5" /> Criar bot
                </Button>
              </Link>
              <Link to="/docs">
                <Button variant="outline" className="bg-card/60">
                  Ver documentação
                </Button>
              </Link>
            </div>
          }
        />
      ) : (
        <>
          <div className="grid lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-4">
              <CrmDashboardWidget />
              <OmnichannelWidget />
            </div>
            <div className="space-y-4">
              <WorkspaceHealthCard />
            </div>
          </div>

          {/* Top bots (reais) */}
          <div className="rounded-2xl border border-border bg-card/60 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Bot className="h-4 w-4 text-primary-glow" /> Top bots
                <InfoTooltip content="Bots mais recentes do workspace, ordenados por última atividade." />
              </h3>
              <Link to="/bots" className="text-xs text-primary-glow flex items-center gap-1">
                Ver todos <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
            {topBots.length === 0 ? (
              <p className="text-xs text-muted-foreground">Nenhum bot publicado ainda.</p>
            ) : (
              <div className="space-y-3">
                {topBots.map((b) => (
                  <Link key={b.id} to={`/builder/${b.id}`} className="flex items-center gap-3 rounded-xl border border-transparent hover:border-primary/30 hover:bg-background/40 p-2 -mx-2 transition">
                    <div className="h-9 w-9 rounded-lg gradient-accent flex-shrink-0 flex items-center justify-center font-display font-bold text-primary-foreground">
                      {b.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{b.name}</div>
                      <div className="text-xs text-muted-foreground capitalize">{b.status} · {b.channel}</div>
                    </div>
                    <div className="text-xs text-muted-foreground tabular-nums">
                      {b.metrics.conversations.toLocaleString()} conv.
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <LeadIntelligenceWidget />

          <div className="flex justify-end">
            <ContextualFeedback surface="dashboard" />
          </div>
        </>
      )}
    </div>
  );
}
