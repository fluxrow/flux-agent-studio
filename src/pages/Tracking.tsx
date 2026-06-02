import { trackingKpis, liveEvents, flowHeatmap } from "@/lib/analytics-mock";
import { Activity, Radio, Zap, Globe } from "lucide-react";

const eventColor = (c: string) =>
  c === "success" ? "bg-success/15 text-success border-success/30" :
  c === "accent" ? "bg-accent/15 text-accent border-accent/30" :
  c === "primary" ? "bg-primary/15 text-primary-glow border-primary/30" :
  "bg-muted/30 text-muted-foreground border-border";

const heatColor = (rate: number) => {
  if (rate >= 80) return "from-success/20 to-success/5 border-success/40";
  if (rate >= 60) return "from-warning/20 to-warning/5 border-warning/40";
  return "from-destructive/20 to-destructive/5 border-destructive/40";
};

export default function Tracking() {
  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Tracking & Eventos</h1>
          <p className="text-muted-foreground text-sm mt-1">Cada interação vira um evento · SDK ativo em 4 bots</p>
        </div>
        <div className="hidden md:flex items-center gap-2 rounded-full border border-success/30 bg-success/10 px-3 py-1.5 text-xs text-success">
          <span className="h-2 w-2 rounded-full bg-success animate-pulse" /> Stream ao vivo
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {trackingKpis.map((k, i) => {
          const Icon = [Activity, Globe, Radio, Zap][i];
          return (
            <div key={k.label} className="rounded-2xl border border-border bg-card/60 p-5">
              <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground">{k.label}</div>
                <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
                  <Icon className="h-4 w-4 text-primary-foreground" />
                </div>
              </div>
              <div className="font-display text-2xl font-bold mt-3">{k.value}</div>
              <div className="text-xs text-success mt-1">{k.delta}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 rounded-2xl border border-border bg-card/60 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-semibold">Heatmap do fluxo · Bot SDR Imobiliária</h3>
            <div className="flex gap-2 text-[10px]">
              <span className="rounded-full border border-success/30 bg-success/10 px-2 py-0.5 text-success">≥80% OK</span>
              <span className="rounded-full border border-warning/30 bg-warning/10 px-2 py-0.5 text-warning">60-79% Atenção</span>
              <span className="rounded-full border border-destructive/30 bg-destructive/10 px-2 py-0.5 text-destructive">&lt;60% Gargalo</span>
            </div>
          </div>
          <div className="space-y-2">
            {flowHeatmap.map((b) => (
              <div key={b.id} className={`rounded-xl border bg-gradient-to-r ${heatColor(b.rate)} p-3`}>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-muted-foreground">{b.id}</span>
                      <span className="font-medium text-sm truncate">{b.name}</span>
                    </div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-background/50">
                      <div className="h-full gradient-primary" style={{ width: `${b.rate}%` }} />
                    </div>
                  </div>
                  <div className="hidden sm:grid grid-cols-3 gap-4 text-right">
                    <div><div className="text-[10px] text-muted-foreground">Visitas</div><div className="text-sm font-semibold">{b.visits}</div></div>
                    <div><div className="text-[10px] text-muted-foreground">Conv.</div><div className="text-sm font-semibold">{b.conversions}</div></div>
                    <div><div className="text-[10px] text-muted-foreground">Tempo</div><div className="text-sm font-semibold">{b.avg}</div></div>
                  </div>
                  <div className="font-display text-xl font-bold tabular-nums w-14 text-right">{b.rate}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card/60 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-semibold">Eventos ao vivo</h3>
            <span className="text-[10px] text-muted-foreground">últimos 30s</span>
          </div>
          <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
            {liveEvents.map((e) => (
              <div key={e.id} className="rounded-xl border border-border/60 bg-background/40 p-3">
                <div className="flex items-center justify-between">
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-mono ${eventColor(e.color)}`}>{e.name}</span>
                  <span className="text-[10px] text-muted-foreground">{e.time}</span>
                </div>
                <div className="mt-2 text-xs text-muted-foreground font-mono truncate">{e.visitor}</div>
                <div className="mt-1 flex items-center justify-between text-[11px]">
                  <span className="text-foreground/80">{e.bot}</span>
                  <span className="text-muted-foreground">{e.source}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card/60 p-5">
        <h3 className="font-display text-lg font-semibold mb-3">Eventos padrão suportados</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 text-[11px] font-mono">
          {["page_view","bot_loaded","bot_started","message_sent","message_received","question_answered","email_captured","phone_captured","lead_created","lead_qualified","meeting_scheduled","sale_completed"].map((e) => (
            <div key={e} className="rounded-lg border border-border bg-background/40 px-2 py-1.5 text-center text-muted-foreground">{e}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
