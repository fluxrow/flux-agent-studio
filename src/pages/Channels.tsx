import { Button } from "@/components/ui/button";
import {
  MessageCircle, Instagram, Facebook, Send, Globe, Music2, Building2,
  Check, Plug, Sparkles,
} from "lucide-react";

type Channel = {
  id: string;
  name: string;
  desc: string;
  icon: any;
  color: string;
  status: "connected" | "disconnected" | "soon";
  account?: string;
};

const channels: Channel[] = [
  { id: "wa",  name: "WhatsApp",        desc: "Atendimento e SDR via WhatsApp Cloud API oficial.", icon: MessageCircle, color: "from-success/30 to-success/5",     status: "connected",    account: "+55 11 98888-1234" },
  { id: "ig",  name: "Instagram",       desc: "Responda DMs, stories e comentários automaticamente.", icon: Instagram,    color: "from-accent/30 to-primary/10",     status: "connected",    account: "@fluxbot.oficial" },
  { id: "fb",  name: "Facebook Messenger", desc: "Capture leads direto da sua página no Facebook.",  icon: Facebook,     color: "from-primary/30 to-primary-glow/10", status: "disconnected" },
  { id: "tg",  name: "Telegram",        desc: "Bots públicos ou privados em grupos e canais.",     icon: Send,         color: "from-accent/30 to-accent/5",       status: "disconnected" },
  { id: "site",name: "Widget de Site",  desc: "Bubble flutuante e fullscreen para o seu domínio.", icon: Globe,        color: "from-primary/30 to-accent/10",     status: "connected",    account: "fluxbot.app · 4 domínios" },
  { id: "tt",  name: "TikTok",          desc: "Mensagens diretas e respostas em comentários.",     icon: Music2,       color: "from-destructive/30 to-primary/5", status: "soon" },
  { id: "gbp", name: "Google Business Profile", desc: "Atenda chats do Google Maps e da busca.",   icon: Building2,    color: "from-warning/30 to-warning/5",     status: "soon" },
];

const statusMap = {
  connected:    { label: "Conectado",    cls: "bg-success/15 text-success border-success/30" },
  disconnected: { label: "Desconectado", cls: "bg-muted text-muted-foreground border-border" },
  soon:         { label: "Em breve",     cls: "bg-primary/10 text-primary-glow border-primary/30" },
} as const;

export default function Channels() {
  const connected = channels.filter(c => c.status === "connected").length;

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      <div className="flex items-end justify-between">
        <div>
          <div className="text-xs uppercase tracking-widest text-primary-glow font-medium">Integrações</div>
          <h1 className="font-display text-3xl font-bold mt-1.5">Canais</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {connected} de {channels.length} canais ativos · conecte onde seus leads conversam.
          </p>
        </div>
        <Button className="gradient-primary text-primary-foreground border-0 shadow-elegant">
          <Sparkles className="h-4 w-4 mr-1.5" /> Sugerir canal
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {channels.map((c) => {
          const s = statusMap[c.status];
          const Icon = c.icon;
          return (
            <div key={c.id} className="group relative rounded-2xl border border-border bg-card/60 p-5 hover:border-primary/40 hover:shadow-elegant transition overflow-hidden">
              <div className={`absolute -top-16 -right-16 h-40 w-40 rounded-full bg-gradient-to-br ${c.color} opacity-40 group-hover:opacity-70 transition`} />
              <div className="relative">
                <div className="flex items-start justify-between">
                  <div className={`h-12 w-12 rounded-xl border border-border bg-background/70 flex items-center justify-center`}>
                    <Icon className="h-5 w-5 text-primary-glow" />
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium border ${s.cls}`}>
                    {c.status === "connected" && <Check className="h-3 w-3" />}
                    {s.label}
                  </span>
                </div>
                <h3 className="font-semibold mt-4 text-lg">{c.name}</h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{c.desc}</p>

                {c.account && (
                  <div className="mt-3 rounded-lg border border-border bg-background/50 px-3 py-2 text-xs font-mono text-muted-foreground">
                    {c.account}
                  </div>
                )}

                <div className="mt-5 flex gap-2">
                  {c.status === "connected" && (
                    <>
                      <Button size="sm" variant="outline" className="flex-1 bg-secondary/40">Configurar</Button>
                      <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive">Desconectar</Button>
                    </>
                  )}
                  {c.status === "disconnected" && (
                    <Button size="sm" className="w-full gradient-primary text-primary-foreground border-0">
                      <Plug className="h-3.5 w-3.5 mr-1.5" /> Conectar via OAuth
                    </Button>
                  )}
                  {c.status === "soon" && (
                    <Button size="sm" variant="outline" disabled className="w-full bg-secondary/30 opacity-70">
                      Entrar na lista de espera
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Webhook fallback */}
      <div className="rounded-2xl border border-border bg-card/60 p-6 flex items-center justify-between gap-6 flex-wrap">
        <div>
          <h3 className="font-semibold">Canal customizado via API</h3>
          <p className="text-xs text-muted-foreground mt-1">Receba e envie mensagens de qualquer plataforma via webhook autenticado.</p>
        </div>
        <code className="px-3 py-2 rounded-lg bg-background border border-border text-xs font-mono text-primary-glow">
          POST https://api.fluxbot.app/v1/channels/custom
        </code>
        <Button size="sm" variant="outline" className="bg-secondary/40">Ver docs</Button>
      </div>
    </div>
  );
}
