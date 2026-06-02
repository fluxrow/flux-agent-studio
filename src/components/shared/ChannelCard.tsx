import { Button } from "@/components/ui/button";
import { Check, Plug, LucideIcon } from "lucide-react";

export type ChannelStatus = "connected" | "disconnected" | "soon";

export interface ChannelCardData {
  id: string;
  name: string;
  desc: string;
  icon: LucideIcon;
  color: string;
  status: ChannelStatus;
  account?: string;
}

const statusMap = {
  connected:    { label: "Conectado",    cls: "bg-success/15 text-success border-success/30" },
  disconnected: { label: "Desconectado", cls: "bg-muted text-muted-foreground border-border" },
  soon:         { label: "Em breve",     cls: "bg-primary/10 text-primary-glow border-primary/30" },
} as const;

export function ChannelCard({ channel }: { channel: ChannelCardData }) {
  const s = statusMap[channel.status];
  const Icon = channel.icon;
  return (
    <div className="group relative rounded-2xl border border-border bg-card/60 p-5 hover:border-primary/40 hover:shadow-elegant transition overflow-hidden">
      <div className={`absolute -top-16 -right-16 h-40 w-40 rounded-full bg-gradient-to-br ${channel.color} opacity-40 group-hover:opacity-70 transition`} />
      <div className="relative">
        <div className="flex items-start justify-between">
          <div className="h-12 w-12 rounded-xl border border-border bg-background/70 flex items-center justify-center">
            <Icon className="h-5 w-5 text-primary-glow" />
          </div>
          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium border ${s.cls}`}>
            {channel.status === "connected" && <Check className="h-3 w-3" />}
            {s.label}
          </span>
        </div>
        <h3 className="font-semibold mt-4 text-lg">{channel.name}</h3>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{channel.desc}</p>

        {channel.account && (
          <div className="mt-3 rounded-lg border border-border bg-background/50 px-3 py-2 text-xs font-mono text-muted-foreground">
            {channel.account}
          </div>
        )}

        <div className="mt-5 flex gap-2">
          {channel.status === "connected" && (
            <>
              <Button size="sm" variant="outline" className="flex-1 bg-secondary/40">Configurar</Button>
              <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive">Desconectar</Button>
            </>
          )}
          {channel.status === "disconnected" && (
            <Button size="sm" className="w-full gradient-primary text-primary-foreground border-0">
              <Plug className="h-3.5 w-3.5 mr-1.5" /> Conectar via OAuth
            </Button>
          )}
          {channel.status === "soon" && (
            <Button size="sm" variant="outline" disabled className="w-full bg-secondary/30 opacity-70">
              Entrar na lista de espera
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
