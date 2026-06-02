import { alerts } from "@/lib/analytics-mock";
import { AlertTriangle, Bell, Info, TrendingDown } from "lucide-react";

const sev = (s: string) =>
  s === "high" ? { color: "destructive", Icon: TrendingDown, label: "Crítico" } :
  s === "warning" ? { color: "warning", Icon: AlertTriangle, label: "Atenção" } :
  { color: "primary", Icon: Info, label: "Info" };

const rules = [
  { name: "Queda de conversão > 15%", trigger: "Em janela de 6h", channel: "Email + WhatsApp", on: true },
  { name: "Lead com score ≥ 90", trigger: "Notificação imediata", channel: "WhatsApp", on: true },
  { name: "Campanha sem conversão > 4h", trigger: "Durante horário comercial", channel: "Slack", on: true },
  { name: "Custo IA por lead acima do CAC", trigger: "Verificação horária", channel: "Email", on: false },
  { name: "Bot offline ou com erro", trigger: "Imediato", channel: "Email + SMS", on: true },
];

export default function Alerts() {
  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Alertas Inteligentes</h1>
          <p className="text-muted-foreground text-sm mt-1">Eventos críticos detectados pela IA em tempo real</p>
        </div>
        <button className="rounded-xl border border-border bg-card/60 px-4 py-2 text-sm font-medium hover:bg-card transition">
          + Nova regra
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Alertas hoje", value: "12", color: "primary" },
          { label: "Críticos", value: "2", color: "destructive" },
          { label: "Resolvidos", value: "8", color: "success" },
          { label: "Regras ativas", value: "4", color: "accent" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card/60 p-5">
            <div className="text-xs text-muted-foreground">{s.label}</div>
            <div className="font-display text-2xl font-bold mt-2">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card/60 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="h-4 w-4 text-primary-glow" />
            <h3 className="font-display text-lg font-semibold">Feed de alertas</h3>
          </div>
          <div className="space-y-2">
            {alerts.map((a) => {
              const s = sev(a.severity);
              return (
                <div key={a.id} className={`rounded-xl border bg-background/40 p-4 border-${s.color}/30 bg-gradient-to-r from-${s.color}/5 to-transparent`}>
                  <div className="flex items-start gap-3">
                    <div className={`h-9 w-9 rounded-lg bg-${s.color}/15 flex items-center justify-center flex-shrink-0`}>
                      <s.Icon className={`h-4 w-4 text-${s.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-medium text-sm truncate">{a.title}</div>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">{a.time}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">{a.desc}</div>
                      <div className="flex gap-2 mt-2.5">
                        <button className="rounded-lg border border-border bg-secondary/40 px-2.5 py-1 text-[11px] hover:bg-secondary">Investigar</button>
                        <button className="rounded-lg border border-border bg-secondary/40 px-2.5 py-1 text-[11px] hover:bg-secondary">Marcar como resolvido</button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card/60 p-5">
          <h3 className="font-display text-lg font-semibold mb-4">Regras configuradas</h3>
          <div className="space-y-2">
            {rules.map((r) => (
              <div key={r.name} className="rounded-xl border border-border/60 bg-background/40 p-3">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-sm flex-1 min-w-0 pr-2">{r.name}</div>
                  <div className={`h-5 w-9 rounded-full p-0.5 transition ${r.on ? "bg-primary" : "bg-secondary"}`}>
                    <div className={`h-4 w-4 rounded-full bg-background transition ${r.on ? "translate-x-4" : ""}`} />
                  </div>
                </div>
                <div className="text-[11px] text-muted-foreground mt-1">{r.trigger}</div>
                <div className="text-[10px] text-primary-glow mt-1">→ {r.channel}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
