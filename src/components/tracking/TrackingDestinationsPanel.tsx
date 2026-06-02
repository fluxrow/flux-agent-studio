import { useEffect, useState } from "react";
import { destinations } from "@/tracking/destinations";
import type { DestinationConfig, DestinationStatus } from "@/tracking/destinations/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Plug, ShieldCheck, ShieldOff, FlaskConical, Send, AlertTriangle, CheckCircle2 } from "lucide-react";

const statusMeta: Record<DestinationStatus, { label: string; cls: string; icon: React.ReactNode }> = {
  connected:    { label: "Connected",    cls: "bg-success/15 text-success border-success/30",       icon: <ShieldCheck className="h-3 w-3" /> },
  mock:         { label: "Mock",         cls: "bg-warning/15 text-warning border-warning/30",       icon: <FlaskConical className="h-3 w-3" /> },
  disconnected: { label: "Disconnected", cls: "bg-muted/40 text-muted-foreground border-border",    icon: <ShieldOff className="h-3 w-3" /> },
};

export function TrackingDestinationsPanel() {
  const [, force] = useState(0);
  useEffect(() => destinations.on(() => force((n) => n + 1)), []);

  const list = destinations.list();
  const stats = destinations.stats();
  const queue = destinations.getQueueSize();

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-border bg-card/60 p-5">
        <div className="flex items-center gap-2 mb-1">
          <Plug className="h-4 w-4 text-primary-glow" />
          <h3 className="font-display text-lg font-semibold">Tracking Destinations</h3>
        </div>
        <p className="text-xs text-muted-foreground">
          Conecte os eventos internos do FluxBot às plataformas externas. A Runtime continua independente —
          apenas a camada de mapeamento decide o que enviar.
        </p>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          <Stat label="Fila" value={queue} />
          <Stat label="Sucessos" value={sum(stats, "success")} tone="success" />
          <Stat label="Mock" value={sum(stats, "skipped")} tone="warning" />
          <Stat label="Falhas" value={sum(stats, "failure")} tone="destructive" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {list.map((ad) => {
          const cfg = destinations.getConfig(ad.id);
          const status = destinations.statusOf(ad.id);
          const s = stats[ad.id] ?? { success: 0, failure: 0, skipped: 0, total: 0 };
          return (
            <DestinationCard
              key={ad.id}
              id={ad.id}
              label={ad.label}
              status={status}
              config={cfg}
              stats={s}
            />
          );
        })}
      </div>
    </div>
  );
}

function DestinationCard({
  id, label, status, config, stats,
}: {
  id: string;
  label: string;
  status: DestinationStatus;
  config: DestinationConfig;
  stats: { success: number; failure: number; skipped: number; total: number };
}) {
  const meta = statusMeta[status];
  const editable = id === "meta" || id === "google";
  return (
    <div className="rounded-2xl border border-border bg-card/60 p-5 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-semibold">{label}</div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-0.5">{id}</div>
        </div>
        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-mono ${meta.cls}`}>
          {meta.icon} {meta.label}
        </span>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-border bg-background/40 px-3 py-2">
        <span className="text-xs">Ativo</span>
        <Switch
          checked={config.enabled}
          onCheckedChange={(v) => destinations.setConfig(id, { enabled: v })}
        />
      </div>
      <div className="flex items-center justify-between rounded-xl border border-border bg-background/40 px-3 py-2">
        <span className="text-xs">Modo mock (não envia upstream)</span>
        <Switch
          checked={config.mock}
          onCheckedChange={(v) => destinations.setConfig(id, { mock: v })}
        />
      </div>

      {editable && (
        <div className="space-y-2 pt-1">
          {id === "meta" && (
            <>
              <Field
                label="Pixel ID"
                value={config.credentials?.pixelId ?? ""}
                onChange={(v) => destinations.setConfig(id, { credentials: { pixelId: v } })}
                placeholder="123456789012345"
              />
              <Field
                label="CAPI Access Token"
                value={config.credentials?.accessToken ?? ""}
                onChange={(v) => destinations.setConfig(id, { credentials: { accessToken: v } })}
                placeholder="EAAB…"
                secret
              />
            </>
          )}
          {id === "google" && (
            <>
              <Field
                label="Measurement ID"
                value={config.credentials?.measurementId ?? ""}
                onChange={(v) => destinations.setConfig(id, { credentials: { measurementId: v } })}
                placeholder="G-XXXXXXX"
              />
              <Field
                label="API Secret"
                value={config.credentials?.apiSecret ?? ""}
                onChange={(v) => destinations.setConfig(id, { credentials: { apiSecret: v } })}
                placeholder="••••"
                secret
              />
            </>
          )}
        </div>
      )}
      {!editable && (
        <div className="text-[11px] text-muted-foreground italic">Adapter preparado — implementação futura.</div>
      )}

      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border text-center">
        <Mini label="Enviados" value={stats.success} icon={<CheckCircle2 className="h-3 w-3 text-success" />} />
        <Mini label="Mock" value={stats.skipped} icon={<FlaskConical className="h-3 w-3 text-warning" />} />
        <Mini label="Falhas" value={stats.failure} icon={<AlertTriangle className="h-3 w-3 text-destructive" />} />
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, secret }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; secret?: boolean }) {
  return (
    <div>
      <label className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</label>
      <Input
        type={secret ? "password" : "text"}
        className="mt-1 bg-background border-border font-mono text-xs"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: "success" | "warning" | "destructive" }) {
  const cls = tone === "success" ? "text-success" : tone === "warning" ? "text-warning" : tone === "destructive" ? "text-destructive" : "text-foreground";
  return (
    <div className="rounded-xl border border-border bg-background/40 p-3">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className={`font-display text-xl font-bold mt-0.5 ${cls}`}>{value}</div>
    </div>
  );
}

function Mini({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">{icon}{label}</div>
      <div className="font-mono text-sm">{value}</div>
    </div>
  );
}

function sum(stats: Record<string, { success: number; failure: number; skipped: number; total: number }>, key: "success" | "failure" | "skipped") {
  return Object.values(stats).reduce((acc, s) => acc + s[key], 0);
}
