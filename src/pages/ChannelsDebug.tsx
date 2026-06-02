import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { channelBus, channelRegistry, sessionRouter, bootChannels } from "@/channels";
import type { ChannelEvent } from "@/channels/types";
import { Radio, ArrowDown, ArrowUp, Power, PowerOff } from "lucide-react";

export default function ChannelsDebug() {
  const [, force] = useState(0);
  const [events, setEvents] = useState<ChannelEvent[]>(() => channelBus.history());

  useEffect(() => {
    bootChannels();
    setEvents(channelBus.history());
    const off = channelBus.on((e) => {
      setEvents((prev) => [...prev.slice(-199), e]);
      force((n) => n + 1);
    });
    return () => { off(); };
  }, []);

  const adapters = channelRegistry.list();
  const sessions = sessionRouter.list();

  const sent = events.filter((e) => e.type === "message_sent");
  const received = events.filter((e) => e.type === "message_received");

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1400px] mx-auto">
      <PageHeader
        eyebrow="Debug"
        title="Channel Inspector"
        description="Adapters registrados, sessões abertas e tráfego de mensagens em tempo real."
      />

      {/* Adapters */}
      <section className="rounded-2xl border border-border bg-card/60 p-5">
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Radio className="h-4 w-4 text-primary-glow" /> Channel Registry
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {adapters.map((a) => (
            <div key={a.id} className="rounded-xl border border-border bg-background/40 p-3 flex items-center justify-between">
              <div>
                <div className="font-medium text-sm">{a.label}</div>
                <code className="text-[10px] text-muted-foreground">{a.id}</code>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                a.status === "active"
                  ? "bg-success/15 text-success border-success/30"
                  : "bg-muted/30 text-muted-foreground border-border"
              }`}>
                {a.status === "active" ? <span className="inline-flex items-center gap-1"><Power className="h-2.5 w-2.5" /> active</span>
                  : <span className="inline-flex items-center gap-1"><PowerOff className="h-2.5 w-2.5" /> {a.status}</span>}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Sessions */}
      <section className="rounded-2xl border border-border bg-card/60 p-5">
        <h2 className="text-sm font-semibold mb-3">Open sessions ({sessions.filter((s) => s.status === "open").length})</h2>
        {sessions.length === 0 ? (
          <p className="text-xs text-muted-foreground">Nenhuma sessão registrada ainda.</p>
        ) : (
          <div className="space-y-1.5">
            {sessions.map((s) => (
              <div key={s.id} className="text-xs flex items-center justify-between rounded-lg border border-border bg-background/40 px-3 py-1.5 font-mono">
                <span className="truncate">{s.channelId} · {s.user.id} · {s.id}</span>
                <span className={s.status === "open" ? "text-success" : "text-muted-foreground"}>{s.status}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Traffic */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TrafficPanel title="Messages sent" icon={<ArrowUp className="h-3.5 w-3.5 text-success" />} events={sent} />
        <TrafficPanel title="Messages received" icon={<ArrowDown className="h-3.5 w-3.5 text-primary-glow" />} events={received} />
      </section>

      {/* Raw event stream */}
      <section className="rounded-2xl border border-border bg-card/60 p-5">
        <h2 className="text-sm font-semibold mb-3">Event stream ({events.length})</h2>
        <div className="max-h-80 overflow-auto space-y-1 font-mono text-[11px]">
          {events.slice().reverse().map((e) => (
            <div key={e.id} className="flex items-center gap-2 border-b border-border/40 py-1">
              <span className="text-muted-foreground w-20 truncate">{e.channelId}</span>
              <span className="text-primary-glow w-32">{e.type}</span>
              <span className="truncate text-muted-foreground">
                {e.message?.text ?? JSON.stringify(e.payload ?? {})}
              </span>
            </div>
          ))}
          {events.length === 0 && (
            <p className="text-xs text-muted-foreground">Sem eventos. Abra <code>/bot/&lt;slug&gt;</code> em outra aba.</p>
          )}
        </div>
      </section>
    </div>
  );
}

function TrafficPanel({ title, icon, events }: { title: string; icon: React.ReactNode; events: ChannelEvent[] }) {
  return (
    <div className="rounded-2xl border border-border bg-card/60 p-5">
      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">{icon} {title} ({events.length})</h3>
      <div className="max-h-64 overflow-auto space-y-1 text-[11px]">
        {events.slice(-50).reverse().map((e) => (
          <div key={e.id} className="rounded border border-border/60 bg-background/30 px-2 py-1">
            <div className="flex items-center justify-between">
              <span className="font-mono text-muted-foreground">{e.channelId} · {e.message?.kind ?? "—"}</span>
              <span className="font-mono text-[10px] opacity-60">{new Date(e.at).toLocaleTimeString()}</span>
            </div>
            <div className="truncate">{e.message?.text ?? "(no text)"}</div>
          </div>
        ))}
        {events.length === 0 && <p className="text-xs text-muted-foreground">Nenhuma mensagem ainda.</p>}
      </div>
    </div>
  );
}
