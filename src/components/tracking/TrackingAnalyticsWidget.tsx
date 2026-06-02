import { useEffect, useMemo, useState } from "react";
import { persistence } from "@/domain/persistence";
import type { Lead } from "@/types";
import { BarChart3, Smartphone, Globe2 } from "lucide-react";

/**
 * Analytics widget for Tracking page. Aggregates leads by source/campaign
 * from whichever persistence layer is active (mock or Supabase).
 * UTM-level aggregations are best-effort: if the `source` field carries
 * a structured tag (e.g. `utm:meta`), it surfaces here; otherwise it
 * falls back to the raw source string.
 */
export function TrackingAnalyticsWidget() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    persistence.leads.list({ pageSize: 500 })
      .then((res) => { if (!cancelled) { setLeads(res.items); setLoading(false); } })
      .catch((e) => { if (!cancelled) { setErr(e?.message ?? "Falha ao carregar"); setLoading(false); } });
    return () => { cancelled = true; };
  }, []);

  const bySource = useMemo(() => groupCount(leads, (l) => l.source || "unknown"), [leads]);
  const byBot = useMemo(() => groupCount(leads, (l) => l.botId ?? "—"), [leads]);
  const byTag = useMemo(() => {
    const acc = new Map<string, number>();
    for (const l of leads) for (const t of l.tags ?? []) acc.set(t, (acc.get(t) ?? 0) + 1);
    return [...acc.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
  }, [leads]);

  const total = leads.length;

  if (loading) {
    return <div className="rounded-2xl border border-border bg-card/60 p-5 text-xs text-muted-foreground">Carregando analytics…</div>;
  }
  if (err) {
    return <div className="rounded-2xl border border-destructive/40 bg-destructive/5 p-5 text-xs text-destructive">{err}</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <BarCard title="Leads por origem" icon={<Globe2 className="h-4 w-4" />} data={bySource} total={total} empty="Sem leads ainda." />
      <BarCard title="Leads por bot" icon={<BarChart3 className="h-4 w-4" />} data={byBot} total={total} empty="Sem bots conectados." />
      <BarCard title="Top tags / campanhas" icon={<Smartphone className="h-4 w-4" />} data={byTag} total={total} empty="Nenhuma tag aplicada." />
    </div>
  );
}

function groupCount<T>(items: T[], keyer: (x: T) => string): [string, number][] {
  const acc = new Map<string, number>();
  for (const it of items) {
    const k = keyer(it);
    acc.set(k, (acc.get(k) ?? 0) + 1);
  }
  return [...acc.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
}

function BarCard({ title, icon, data, total, empty }: {
  title: string; icon: React.ReactNode; data: [string, number][]; total: number; empty: string;
}) {
  const max = data[0]?.[1] ?? 0;
  return (
    <div className="rounded-2xl border border-border bg-card/60 p-5">
      <h3 className="font-display text-sm font-semibold mb-3 flex items-center gap-2">{icon} {title}</h3>
      {data.length === 0 ? (
        <div className="text-xs text-muted-foreground py-6 text-center">{empty}</div>
      ) : (
        <div className="space-y-2">
          {data.map(([label, count]) => {
            const pct = total > 0 ? (count / total) * 100 : 0;
            const w = max > 0 ? (count / max) * 100 : 0;
            return (
              <div key={label}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium truncate max-w-[70%]">{label}</span>
                  <span className="text-muted-foreground tabular-nums">{count} · {pct.toFixed(0)}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary/40">
                  <div className="h-full gradient-primary" style={{ width: `${w}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
