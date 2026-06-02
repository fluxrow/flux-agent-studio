import { useEffect, useState } from "react";
import { trackingEngine } from "@/tracking";
import type { TrackedEvent } from "@/tracking/types";
import { Activity, Globe, Radio, User, Link2, Eraser } from "lucide-react";
import { Button } from "@/components/ui/button";
import { resetVisitor } from "@/tracking/visitor";

const eventBadge: Record<string, string> = {
  flow_started: "bg-primary/15 text-primary-glow border-primary/30",
  flow_completed: "bg-success/15 text-success border-success/30",
  flow_abandoned: "bg-destructive/15 text-destructive border-destructive/30",
  lead_created: "bg-accent/15 text-accent border-accent/30",
  session_started: "bg-primary/15 text-primary-glow border-primary/30",
  session_ended: "bg-warning/15 text-warning border-warning/30",
};

const badgeFor = (t: string) =>
  eventBadge[t] ?? "bg-muted/30 text-muted-foreground border-border";

export default function Tracking() {
  const [events, setEvents] = useState<TrackedEvent[]>(trackingEngine.getEvents());
  const [visitor, setVisitor] = useState(trackingEngine.getVisitor());
  const [attribution, setAttribution] = useState(trackingEngine.getAttribution());
  const [session, setSession] = useState(trackingEngine.getCurrentSession());

  useEffect(() => {
    return trackingEngine.on(() => {
      setEvents(trackingEngine.getEvents());
      setVisitor(trackingEngine.getVisitor());
      setAttribution(trackingEngine.getAttribution());
      setSession(trackingEngine.getCurrentSession());
    });
  }, []);

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">Tracking Inspector</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Visitor profile, attribution e eventos capturados em tempo real
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2 rounded-full border border-success/30 bg-success/10 px-3 py-1.5 text-xs text-success">
            <span className="h-2 w-2 rounded-full bg-success animate-pulse" /> Stream ao vivo
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => { resetVisitor(); trackingEngine.clear(); window.location.reload(); }}
          >
            <Eraser className="h-3.5 w-3.5 mr-1.5" /> Reset visitor
          </Button>
        </div>
      </div>

      {/* Visitor + Session + Attribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card title="Visitor Profile" icon={<User className="h-4 w-4" />}>
          <KV label="visitor_id" mono value={visitor.visitorId} />
          <KV label="browser" value={visitor.browser} />
          <KV label="os" value={visitor.os} />
          <KV label="device" value={visitor.deviceType} />
          <KV label="language" value={visitor.language} />
          <KV label="timezone" value={visitor.timezone} />
          <KV label="referrer" value={visitor.referrer ?? "(direto)"} />
          <KV label="first seen" value={visitor.firstSeenAt} />
        </Card>

        <Card title="Sessão atual" icon={<Radio className="h-4 w-4" />}>
          {session ? (
            <>
              <KV label="session_id" mono value={session.sessionId} />
              <KV label="started_at" value={session.startedAt} />
              <KV label="ended_at" value={session.endedAt ?? "—"} />
              <KV label="duration" value={session.durationMs ? `${(session.durationMs / 1000).toFixed(1)}s` : "em curso"} />
              <KV label="bot_id" mono value={session.botId ?? "—"} />
            </>
          ) : (
            <div className="text-xs text-muted-foreground py-2">
              Nenhuma sessão ativa. Abra o Simulator ou o link público do bot para começar a rastrear.
            </div>
          )}
        </Card>

        <Card title="Attribution" icon={<Link2 className="h-4 w-4" />}>
          {attribution ? (
            <>
              <KV label="utm_source" value={attribution.utmSource} />
              <KV label="utm_medium" value={attribution.utmMedium} />
              <KV label="utm_campaign" value={attribution.utmCampaign} />
              <KV label="utm_content" value={attribution.utmContent} />
              <KV label="utm_term" value={attribution.utmTerm} />
              <KV label="fbclid" value={attribution.fbclid} />
              <KV label="gclid" value={attribution.gclid} />
              <KV label="ttclid" value={attribution.ttclid} />
              <KV label="msclkid" value={attribution.msclkid} />
              <KV label="captured_at" value={attribution.capturedAt} />
            </>
          ) : (
            <div className="text-xs text-muted-foreground py-2">
              Sem parâmetros UTM ou click-ids na URL. Adicione ?utm_source=meta&utm_campaign=teste para validar.
            </div>
          )}
        </Card>
      </div>

      {/* Events stream */}
      <div className="rounded-2xl border border-border bg-card/60 p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-lg font-semibold flex items-center gap-2">
            <Activity className="h-4 w-4" /> Eventos capturados
          </h3>
          <span className="text-[10px] text-muted-foreground">{events.length} eventos · ring buffer 200</span>
        </div>
        {events.length === 0 ? (
          <div className="text-xs text-muted-foreground py-8 text-center">
            Nenhum evento ainda. Inicie um fluxo no Simulator para popular o stream.
          </div>
        ) : (
          <div className="space-y-1.5 max-h-[560px] overflow-y-auto pr-1">
            {events.map((e) => (
              <div key={e.id} className="rounded-lg border border-border/60 bg-background/40 p-2.5 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-mono ${badgeFor(e.type)}`}>
                    {e.type}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {new Date(e.at).toLocaleTimeString()}
                  </span>
                </div>
                <div className="mt-1.5 grid grid-cols-2 gap-x-4 gap-y-0.5 font-mono text-[10px] text-muted-foreground">
                  {e.sessionId && <span>session: {e.sessionId.slice(0, 14)}…</span>}
                  {e.blockId && <span>block: {e.blockId.slice(0, 14)}…</span>}
                  {e.durationMs != null && <span>duration: {(e.durationMs / 1000).toFixed(1)}s</span>}
                </div>
                {Object.keys(e.payload || {}).length > 0 && (
                  <pre className="mt-1.5 text-[10px] text-foreground/70 bg-background/40 rounded p-1.5 overflow-x-auto">
                    {JSON.stringify(e.payload, null, 0)}
                  </pre>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-card/60 p-5">
        <h3 className="font-display text-lg font-semibold mb-3 flex items-center gap-2">
          <Globe className="h-4 w-4" /> Eventos suportados
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2 text-[11px] font-mono">
          {[
            "page_view", "bot_loaded", "session_started", "session_ended",
            "flow_started", "flow_completed", "flow_abandoned",
            "block_entered", "block_exited",
            "input_received", "choice_selected", "condition_evaluated",
            "variable_updated", "lead_created", "lead_updated",
          ].map((e) => (
            <div key={e} className="rounded-lg border border-border bg-background/40 px-2 py-1.5 text-center text-muted-foreground">
              {e}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Card({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card/60 p-5">
      <h3 className="font-display text-sm font-semibold mb-3 flex items-center gap-2 text-foreground">
        {icon} {title}
      </h3>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function KV({ label, value, mono }: { label: string; value?: string | null; mono?: boolean }) {
  if (!value) return null;
  return (
    <div className="flex items-start justify-between text-xs gap-3">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className={`text-right break-all ${mono ? "font-mono text-[10px]" : ""}`}>{value}</span>
    </div>
  );
}
