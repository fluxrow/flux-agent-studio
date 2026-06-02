import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, BarChart, Bar, Cell } from "recharts";
import { Link } from "react-router-dom";
import { Bot, MessageSquare, Target, Users, Plus } from "lucide-react";
import { useBasicStats } from "@/lib/analytics-basic";
import { InfoTooltip } from "@/components/shared/InfoTooltip";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";

const KPI_HELP: Record<string, string> = {
  Bots:       "Quantidade de agentes (ativos + rascunhos) neste workspace.",
  Leads:      "Total de leads capturados pelos seus bots.",
  Conversas:  "Sessões de chat já registradas.",
  Conversões: "Leads que avançaram para estágios finais do pipeline.",
};

export default function Analytics() {
  const { data: stats, isLoading } = useBasicStats();
  const kpis = [
    { icon: Bot,           label: "Bots",       value: stats?.bots ?? 0 },
    { icon: Users,         label: "Leads",      value: stats?.leads ?? 0 },
    { icon: MessageSquare, label: "Conversas",  value: stats?.conversations ?? 0 },
    { icon: Target,        label: "Conversões", value: stats?.conversions ?? 0 },
  ];

  const hasData = !isLoading && ((stats?.leads ?? 0) > 0 || (stats?.conversations ?? 0) > 0);

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      <div>
        <h1 className="font-display text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground text-sm mt-1">Funil, performance e tendências do workspace</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-2xl border border-border bg-card/60 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="text-xs text-muted-foreground">{k.label}</div>
                <InfoTooltip content={KPI_HELP[k.label]} />
              </div>
              <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center"><k.icon className="h-4 w-4 text-primary-foreground" /></div>
            </div>
            <div className="font-display text-2xl font-bold mt-3 tabular-nums">
              {isLoading ? "—" : k.value.toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      {!hasData ? (
        <EmptyState
          icon={Target}
          title="Sem dados de analytics ainda"
          description="Publique um bot e capture os primeiros leads. Funil de conversão, performance por bloco e tendências aparecerão aqui automaticamente."
          action={
            <Link to="/bots/new">
              <Button className="gradient-primary text-primary-foreground border-0 shadow-elegant">
                <Plus className="h-4 w-4 mr-1.5" /> Criar bot
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-card/30 p-6 text-center text-sm text-muted-foreground">
          Funil detalhado, performance por bloco e séries temporais estarão
          disponíveis em breve — agregações reais já alimentam os KPIs acima.
        </div>
      )}
    </div>
  );
}
  );
}
