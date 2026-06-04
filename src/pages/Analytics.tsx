/**
 * Phase 26I.1 — Analytics Upgrade
 *
 * Tela de Analytics consome SEMPRE da camada `persistence` — quando o
 * Demo Runtime está ativo, os dados vêm do `demoDataset` (workspace real
 * NÃO é consultado). Nada de mock inline aqui: as agregações são
 * calculadas a partir de leads/bots/stages reais entregues pela
 * persistence.
 *
 * Métricas respondidas:
 *   1. Total de leads
 *   2. Qualificados (qualificado + negociacao + convertido)
 *   3. Convertidos
 *   4. Receita realizada (Σ valor dos leads em estágio convertido)
 *   5. Receita prevista (Σ valor por estágio · probabilidade)
 *   6. Canal vencedor (por receita realizada; tiebreaker = volume)
 *   7. Bot vencedor (por número de conversões)
 */
import { Link } from "react-router-dom";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Bot, MessageSquare, Target, Users, Plus, TrendingUp, Wallet,
  Radio, Sparkles, Trophy,
} from "lucide-react";
import { persistence } from "@/domain/persistence";
import { isConvertedStage } from "@/lib/leadStages";
import { isDemoMode } from "@/beta/demoMode";
import { DEMO_LEAD_VALUES, DEMO_STAGE_PROBABILITY } from "@/beta/demoDataset";
import { InfoTooltip } from "@/components/shared/InfoTooltip";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { ContextualFeedback } from "@/components/beta/ContextualFeedback";
import type { Lead, LeadStage, PipelineStage, Bot as BotType } from "@/types";

/* ---------------- helpers ---------------- */

const KPI_HELP: Record<string, string> = {
  Leads:           "Total de leads capturados pelos seus agentes.",
  Qualificados:    "Leads em estágios qualificado, negociação ou convertido.",
  Convertidos:     "Leads que avançaram para estágios finais do pipeline.",
  "Receita realizada": "Soma do valor dos leads em estágio convertido.",
  "Receita prevista":  "Soma de cada lead em pipeline ponderada pela probabilidade do seu estágio.",
};

const BRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

function getLeadValue(lead: Lead): number {
  if (isDemoMode()) return DEMO_LEAD_VALUES[lead.id] ?? 0;
  // Fora do demo runtime ainda não temos campo de valor por lead. KPIs
  // monetários ficam em 0 (a tela continua renderizando KPIs de volume).
  return 0;
}

function stageProbability(stage: LeadStage): number {
  return DEMO_STAGE_PROBABILITY[stage] ?? 0;
}

interface AnalyticsAgg {
  leads: Lead[];
  bots: BotType[];
  stages: PipelineStage[];
  total: number;
  qualified: number;
  converted: number;
  realizedRevenue: number;
  forecastRevenue: number;
  byStage: Array<{ stage: PipelineStage; count: number; value: number }>;
  channels: Array<{ source: string; leads: number; conversions: number; revenue: number }>;
  bots_ranked: Array<{ bot: BotType; conversations: number; conversions: number; revenue: number }>;
  topChannel: { source: string; leads: number; conversions: number; revenue: number } | null;
  topBot: { bot: BotType; conversations: number; conversions: number; revenue: number } | null;
}

/* ---------------- data hook ---------------- */

function useAnalyticsAgg() {
  return useQuery({
    queryKey: ["analytics", "upgrade", isDemoMode() ? "demo" : "real"],
    queryFn: async (): Promise<AnalyticsAgg> => {
      const [leadsPage, botsPage, stages] = await Promise.all([
        persistence.leads.list({ page: 1, pageSize: 500 }),
        persistence.bots.list({ page: 1, pageSize: 200 }),
        persistence.leads.stages(),
      ]);
      const leads = leadsPage.items;
      const bots = botsPage.items;

      const total = leads.length;
      const converted = leads.filter((l) => isConvertedStage(l.stage)).length;
      const qualified = leads.filter(
        (l) => l.stage === "qualificado" || l.stage === "negociacao" || isConvertedStage(l.stage),
      ).length;

      const realizedRevenue = leads
        .filter((l) => isConvertedStage(l.stage))
        .reduce((acc, l) => acc + getLeadValue(l), 0);

      const forecastRevenue = leads
        .filter((l) => l.stage !== "perdido")
        .reduce((acc, l) => acc + getLeadValue(l) * stageProbability(l.stage), 0);

      const byStage = stages.map((s) => {
        const items = leads.filter((l) => l.stage === s.id);
        return {
          stage: s,
          count: items.length,
          value: items.reduce((acc, l) => acc + getLeadValue(l), 0),
        };
      });

      // Channels (por `source`)
      const channelMap = new Map<string, { source: string; leads: number; conversions: number; revenue: number }>();
      for (const l of leads) {
        const key = l.source || "Desconhecido";
        const cur = channelMap.get(key) ?? { source: key, leads: 0, conversions: 0, revenue: 0 };
        cur.leads += 1;
        if (isConvertedStage(l.stage)) {
          cur.conversions += 1;
          cur.revenue += getLeadValue(l);
        }
        channelMap.set(key, cur);
      }
      const channels = [...channelMap.values()].sort(
        (a, b) => b.revenue - a.revenue || b.conversions - a.conversions || b.leads - a.leads,
      );

      // Bots
      const botMap = new Map<string, { bot: BotType; conversations: number; conversions: number; revenue: number }>();
      for (const b of bots) {
        botMap.set(b.id, {
          bot: b,
          conversations: b.metrics?.conversations ?? 0,
          conversions: 0,
          revenue: 0,
        });
      }
      for (const l of leads) {
        if (!l.botId) continue;
        const cur = botMap.get(l.botId);
        if (!cur) continue;
        if (isConvertedStage(l.stage)) {
          cur.conversions += 1;
          cur.revenue += getLeadValue(l);
        }
      }
      const bots_ranked = [...botMap.values()].sort(
        (a, b) => b.conversions - a.conversions || b.revenue - a.revenue || b.conversations - a.conversations,
      );

      return {
        leads, bots, stages,
        total, qualified, converted,
        realizedRevenue, forecastRevenue,
        byStage, channels, bots_ranked,
        topChannel: channels[0] ?? null,
        topBot: bots_ranked[0] ?? null,
      };
    },
    staleTime: 30_000,
  });
}

/* ---------------- page ---------------- */

export default function Analytics() {
  const { data, isLoading } = useAnalyticsAgg();
  const demo = isDemoMode();

  const hasData = !isLoading && (data?.total ?? 0) > 0;

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Volume, qualificação, receita e atribuição do workspace.
          </p>
        </div>
        {demo && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary">
            <Sparkles className="h-3 w-3" /> Demo Runtime · Agência Growth
          </span>
        )}
      </header>

      {!hasData && !isLoading ? (
        <EmptyState
          icon={Target}
          title="Sem dados de analytics ainda"
          description="Publique um bot e capture os primeiros leads. Funil, receita prevista e atribuição aparecem aqui automaticamente."
          action={
            <Link to="/bots/new">
              <Button className="gradient-primary text-primary-foreground border-0 shadow-elegant">
                <Plus className="h-4 w-4 mr-1.5" /> Criar bot
              </Button>
            </Link>
          }
        />
      ) : (
        <>
          {/* ---- Top KPIs ---- */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <Kpi icon={Users}        label="Leads"            value={fmt(data?.total)} help={KPI_HELP.Leads} loading={isLoading} />
            <Kpi icon={Target}       label="Qualificados"     value={fmt(data?.qualified)} help={KPI_HELP.Qualificados} loading={isLoading} />
            <Kpi icon={Trophy}       label="Convertidos"      value={fmt(data?.converted)} help={KPI_HELP.Convertidos} loading={isLoading} accent />
            <Kpi icon={Wallet}       label="Receita realizada" value={BRL.format(data?.realizedRevenue ?? 0)} help={KPI_HELP["Receita realizada"]} loading={isLoading} />
            <Kpi icon={TrendingUp}   label="Receita prevista"  value={BRL.format(Math.round(data?.forecastRevenue ?? 0))} help={KPI_HELP["Receita prevista"]} loading={isLoading} />
          </div>

          {/* ---- Funil / pipeline ---- */}
          <section className="rounded-2xl border border-border bg-card/60 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-base font-semibold flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" /> Funil de conversão
              </h2>
              <span className="text-xs text-muted-foreground">
                Taxa convertido/decidido:{" "}
                <strong className="text-foreground tabular-nums">
                  {pctConv(data)}
                </strong>
              </span>
            </div>
            <div className="space-y-2.5">
              {(data?.byStage ?? []).map(({ stage, count, value }) => {
                const max = Math.max(1, ...(data?.byStage ?? []).map((s) => s.count));
                const w = (count / max) * 100;
                return (
                  <div key={stage.id}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium">{stage.label}</span>
                      <span className="text-muted-foreground tabular-nums">
                        {count} {count === 1 ? "lead" : "leads"}
                        {value > 0 && <> · <span className="text-foreground">{BRL.format(value)}</span></>}
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-secondary/40">
                      <div
                        className={`h-full ${isConvertedStage(stage.id) ? "bg-emerald-500" : stage.id === "perdido" ? "bg-destructive/60" : "gradient-primary"}`}
                        style={{ width: `${w}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ---- Winners + ranking ---- */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Canal vencedor */}
            <section className="rounded-2xl border border-border bg-card/60 p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-display text-base font-semibold flex items-center gap-2">
                  <Radio className="h-4 w-4 text-primary" /> Canal vencedor
                </h2>
                {data?.topChannel && (
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-emerald-500">
                    {data.topChannel.source}
                  </span>
                )}
              </div>
              <ChannelTable rows={data?.channels ?? []} />
            </section>

            {/* Bot vencedor */}
            <section className="rounded-2xl border border-border bg-card/60 p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-display text-base font-semibold flex items-center gap-2">
                  <Bot className="h-4 w-4 text-primary" /> Bot vencedor
                </h2>
                {data?.topBot && (
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-emerald-500 truncate max-w-[55%]">
                    {data.topBot.bot.name}
                  </span>
                )}
              </div>
              <BotTable rows={data?.bots_ranked ?? []} />
            </section>
          </div>
        </>
      )}

      <div className="flex justify-end">
        <ContextualFeedback surface="analytics" />
      </div>
    </div>
  );
}

/* ---------------- subcomponents ---------------- */

function Kpi({
  icon: Icon, label, value, help, loading, accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string; value: string; help: string; loading?: boolean; accent?: boolean;
}) {
  return (
    <div className={`rounded-2xl border ${accent ? "border-primary/40 bg-primary/5" : "border-border bg-card/60"} p-5`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="text-xs text-muted-foreground">{label}</div>
          <InfoTooltip content={help} />
        </div>
        <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
          <Icon className="h-4 w-4 text-primary-foreground" />
        </div>
      </div>
      <div className="font-display text-2xl font-bold mt-3 tabular-nums">
        {loading ? "—" : value}
      </div>
    </div>
  );
}

function ChannelTable({ rows }: { rows: AnalyticsAgg["channels"] }) {
  if (!rows.length) return <p className="text-xs text-muted-foreground py-4">Sem canais ainda.</p>;
  const max = Math.max(1, ...rows.map((r) => r.revenue || r.leads));
  return (
    <div className="space-y-2.5">
      {rows.map((r, idx) => {
        const w = ((r.revenue || r.leads) / max) * 100;
        return (
          <div key={r.source}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-medium flex items-center gap-1.5">
                {idx === 0 && <Trophy className="h-3 w-3 text-amber-400" />}
                {r.source}
              </span>
              <span className="text-muted-foreground tabular-nums">
                {r.leads} leads · {r.conversions} conv. ·{" "}
                <span className="text-foreground">{BRL.format(r.revenue)}</span>
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary/40">
              <div className={`h-full ${idx === 0 ? "bg-emerald-500" : "gradient-primary"}`} style={{ width: `${w}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function BotTable({ rows }: { rows: AnalyticsAgg["bots_ranked"] }) {
  if (!rows.length) return <p className="text-xs text-muted-foreground py-4">Nenhum bot publicado ainda.</p>;
  const max = Math.max(1, ...rows.map((r) => r.conversions || r.conversations));
  return (
    <div className="space-y-2.5">
      {rows.map((r, idx) => {
        const w = ((r.conversions || r.conversations) / max) * 100;
        return (
          <div key={r.bot.id}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-medium flex items-center gap-1.5 truncate max-w-[60%]">
                {idx === 0 && <Trophy className="h-3 w-3 text-amber-400" />}
                <span className="truncate">{r.bot.name}</span>
              </span>
              <span className="text-muted-foreground tabular-nums whitespace-nowrap">
                {r.conversations} conversas · {r.conversions} conv.
                {r.revenue > 0 && <> · <span className="text-foreground">{BRL.format(r.revenue)}</span></>}
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary/40">
              <div className={`h-full ${idx === 0 ? "bg-emerald-500" : "gradient-primary"}`} style={{ width: `${w}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------------- utils ---------------- */

function fmt(n: number | undefined): string {
  return (n ?? 0).toLocaleString("pt-BR");
}

function pctConv(data: AnalyticsAgg | undefined): string {
  if (!data) return "—";
  const lost = data.byStage.find((s) => s.stage.id === "perdido")?.count ?? 0;
  const decided = data.converted + lost;
  if (decided === 0) return "—";
  return `${Math.round((data.converted / decided) * 100)}%`;
}
