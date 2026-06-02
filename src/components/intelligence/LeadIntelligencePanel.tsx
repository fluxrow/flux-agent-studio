import { useMemo } from "react";
import {
  Brain, Flame, Sparkles, Target, TrendingUp, AlertTriangle,
  MessageSquare, Clock, Lightbulb,
} from "lucide-react";
import type { Lead } from "@/types/lead";
import { computeLeadIntelligence } from "@/intelligence";

interface Props {
  lead: Lead;
  eventCount?: number;
}

const tempCls: Record<string, string> = {
  quente: "text-destructive border-destructive/40 bg-destructive/5",
  morno: "text-warning border-warning/40 bg-warning/5",
  frio: "text-accent border-accent/40 bg-accent/5",
};

const channelLabel: Record<string, string> = {
  whatsapp: "WhatsApp",
  email: "Email",
  call: "Ligação",
  instagram: "Instagram",
  sms: "SMS",
};

export function LeadIntelligencePanel({ lead, eventCount = 0 }: Props) {
  const intel = useMemo(
    () =>
      computeLeadIntelligence(lead, {
        score: { eventCount },
        insights: { eventCount },
      }),
    [lead, eventCount],
  );

  const { score, summary, insights, recommendation, forecast } = intel;

  return (
    <div className="space-y-4">
      {/* Score */}
      <div className="rounded-2xl border border-border bg-card/60 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" />
            <h3 className="font-display text-base font-semibold">Lead Score</h3>
          </div>
          <span className={`text-xs px-2 py-1 rounded-md border ${tempCls[score.temperature]}`}>
            {score.temperature}
          </span>
        </div>

        <div className="mt-4 flex items-end gap-3">
          <div className="font-display text-5xl font-bold">{score.score}</div>
          <div className="text-xs text-muted-foreground mb-2">/ 100</div>
        </div>

        <div className="mt-4 space-y-2">
          {score.factors.map((f) => (
            <div key={f.key} className="text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{f.label}</span>
                <span className="tabular-nums">
                  {f.value} · peso {(f.weight * 100).toFixed(0)}%
                </span>
              </div>
              <div className="mt-1 h-1.5 rounded-full bg-background overflow-hidden">
                <div
                  className="h-full bg-primary"
                  style={{ width: `${f.value}%`, opacity: 0.4 + f.weight }}
                />
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{f.reason}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <div className="rounded-2xl border border-border bg-card/60 p-5">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary-glow" />
            <h3 className="font-display text-base font-semibold">Resumo</h3>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground ml-auto">
              {summary.provider}
            </span>
          </div>
          <p className="mt-3 text-sm leading-relaxed">{summary.narrative}</p>
          <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
            <Field label="Interesse" value={summary.mainInterest} />
            <Field label="Objetivo" value={summary.goal} />
            <Field label="Orçamento" value={summary.budget} />
            <Field label="Prazo" value={summary.timeframe} />
            <Field label="Urgência" value={summary.urgency} />
            <Field label="Objeções" value={summary.objections.join(", ") || "—"} />
          </div>
        </div>
      )}

      {/* Recommendation */}
      {recommendation && (
        <div className="rounded-2xl border border-border bg-card/60 p-5">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-warning" />
            <h3 className="font-display text-base font-semibold">Recomendação</h3>
          </div>
          <div className="mt-3 grid sm:grid-cols-3 gap-3 text-xs">
            <div className="rounded-lg bg-background/40 border border-border p-3">
              <div className="text-muted-foreground flex items-center gap-1">
                <Target className="h-3 w-3" /> Próxima ação
              </div>
              <div className="mt-1 font-medium">{recommendation.nextAction}</div>
            </div>
            <div className="rounded-lg bg-background/40 border border-border p-3">
              <div className="text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" /> Melhor horário
              </div>
              <div className="mt-1 font-medium">{recommendation.bestTime}</div>
            </div>
            <div className="rounded-lg bg-background/40 border border-border p-3">
              <div className="text-muted-foreground flex items-center gap-1">
                <MessageSquare className="h-3 w-3" /> Melhor canal
              </div>
              <div className="mt-1 font-medium">
                {channelLabel[recommendation.bestChannel] ?? recommendation.bestChannel}
              </div>
            </div>
          </div>
          <div className="mt-3 rounded-lg bg-background/40 border border-border p-3">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Mensagem sugerida
            </div>
            <p className="mt-1 text-sm">{recommendation.suggestedMessage}</p>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">{recommendation.rationale}</p>
        </div>
      )}

      {/* Insights */}
      <div className="rounded-2xl border border-border bg-card/60 p-5">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-success" />
          <h3 className="font-display text-base font-semibold">Insights</h3>
        </div>
        {insights.length === 0 ? (
          <p className="text-xs text-muted-foreground mt-3">Sem insights suficientes ainda.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {insights.map((i) => (
              <li key={i.id} className="flex gap-3 rounded-lg bg-background/40 border border-border p-3">
                {i.kind === "abandon_risk" ? (
                  <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                ) : (
                  <Flame className="h-4 w-4 text-primary-glow shrink-0 mt-0.5" />
                )}
                <div className="text-xs flex-1">
                  <div className="text-sm font-medium">{i.title}</div>
                  <div className="text-muted-foreground mt-0.5">{i.detail}</div>
                  <div className="text-[10px] text-muted-foreground mt-1">
                    Confiança {(i.confidence * 100).toFixed(0)}%
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Forecast */}
      {forecast && (
        <div className="rounded-2xl border border-border bg-card/60 p-5">
          <h3 className="font-display text-base font-semibold">Forecast</h3>
          <div className="mt-3 grid grid-cols-3 gap-3 text-xs">
            <Stat
              label="Probabilidade"
              value={`${(forecast.conversionProbability * 100).toFixed(0)}%`}
            />
            <Stat
              label="Receita esperada"
              value={`R$ ${forecast.expectedRevenue.toLocaleString("pt-BR")}`}
            />
            <Stat
              label="Fechamento previsto"
              value={
                forecast.expectedCloseAt
                  ? new Date(forecast.expectedCloseAt).toLocaleDateString("pt-BR")
                  : "—"
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-sm">{value ?? "—"}</div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-background/40 border border-border p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-lg font-semibold">{value}</div>
    </div>
  );
}
