import { attributionTouches, campaignPerf, sources } from "@/lib/analytics-mock";
import { ArrowDown, ArrowUp, Target } from "lucide-react";

export default function Attribution() {
  const totalRev = sources.reduce((s, x) => s + x.revenue, 0);
  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      <div>
        <h1 className="font-display text-3xl font-bold">Attribution Engine</h1>
        <p className="text-muted-foreground text-sm mt-1">Da impressão do anúncio até a venda · multi-touch</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card/60 p-5">
          <h3 className="font-display text-lg font-semibold mb-4">Performance por canal</h3>
          <div className="space-y-3">
            {sources.map((s) => {
              const pct = (s.revenue / totalRev) * 100;
              return (
                <div key={s.name}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
                      <span className="font-medium">{s.name}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{s.leads} leads</span>
                      <span>{s.conv} conv.</span>
                      <span className="font-semibold text-foreground tabular-nums">R$ {(s.revenue/1000).toFixed(1)}k</span>
                    </div>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-secondary/40">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: s.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card/60 p-5">
          <h3 className="font-display text-lg font-semibold mb-4">Modelos de atribuição</h3>
          <div className="space-y-3">
            {[
              { name: "First Touch", desc: "Primeiro contato que originou", main: "Meta Ads", pct: "42%" },
              { name: "Last Touch", desc: "Último contato antes da venda", main: "WhatsApp", pct: "58%" },
              { name: "Linear", desc: "Distribuído entre todos", main: "Multi-canal", pct: "100%" },
              { name: "Time Decay", desc: "Peso maior nos recentes", main: "Google Ads", pct: "37%" },
            ].map((m) => (
              <div key={m.name} className="rounded-xl border border-border/60 bg-background/40 p-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{m.name}</span>
                  <span className="text-xs gradient-text font-semibold">{m.pct}</span>
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{m.desc}</div>
                <div className="text-xs mt-1.5">→ {m.main}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card/60 p-5">
        <h3 className="font-display text-lg font-semibold mb-4">Performance de campanhas</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr className="border-b border-border">
                <th className="text-left py-2 font-medium">Campanha</th>
                <th className="text-right py-2 font-medium">Gasto</th>
                <th className="text-right py-2 font-medium">Leads</th>
                <th className="text-right py-2 font-medium">CPL</th>
                <th className="text-right py-2 font-medium">ROAS</th>
                <th className="text-right py-2 font-medium">Trend</th>
              </tr>
            </thead>
            <tbody>
              {campaignPerf.map((c) => (
                <tr key={c.name} className="border-b border-border/40 hover:bg-secondary/20">
                  <td className="py-3 font-medium">{c.name}</td>
                  <td className="py-3 text-right tabular-nums">{c.spend}</td>
                  <td className="py-3 text-right tabular-nums">{c.leads}</td>
                  <td className="py-3 text-right tabular-nums">{c.cpl}</td>
                  <td className="py-3 text-right tabular-nums font-semibold gradient-text">{c.roas}</td>
                  <td className="py-3 text-right">
                    {c.trend === "up"
                      ? <ArrowUp className="inline h-4 w-4 text-success" />
                      : <ArrowDown className="inline h-4 w-4 text-destructive" />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card/60 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Target className="h-4 w-4 text-primary-glow" />
          <h3 className="font-display text-lg font-semibold">Jornadas multi-touch</h3>
        </div>
        <div className="space-y-3">
          {attributionTouches.map((t) => (
            <div key={t.id} className="rounded-xl border border-border/60 bg-background/40 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="font-medium">{t.lead}</div>
                <div className="text-sm font-semibold gradient-text tabular-nums">{t.value}</div>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 text-accent">First · {t.first}</span>
                <span className="text-muted-foreground">→</span>
                <span className="rounded-full border border-border bg-secondary/40 px-2.5 py-1 text-muted-foreground">{t.touches - 2} pontos intermediários</span>
                <span className="text-muted-foreground">→</span>
                <span className="rounded-full border border-success/30 bg-success/10 px-2.5 py-1 text-success">Last · {t.last}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { name: "Meta Pixel + CAPI", status: "Conectado", events: "12.4k eventos / dia", color: "success" },
          { name: "Google Ads + GA4", status: "Conectado", events: "8.9k eventos / dia", color: "success" },
          { name: "TikTok Pixel", status: "Pendente", events: "Configure para ativar", color: "warning" },
        ].map((i) => (
          <div key={i.name} className="rounded-2xl border border-border bg-card/60 p-4">
            <div className="flex items-center justify-between">
              <div className="font-medium text-sm">{i.name}</div>
              <span className={`rounded-full px-2 py-0.5 text-[10px] border ${i.color==="success"?"bg-success/15 text-success border-success/30":"bg-warning/15 text-warning border-warning/30"}`}>{i.status}</span>
            </div>
            <div className="text-xs text-muted-foreground mt-2">{i.events}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
