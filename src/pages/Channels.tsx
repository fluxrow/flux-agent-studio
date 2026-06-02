import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, MessageCircle, Instagram, Facebook, Send, Globe, Music2, Building2, LucideIcon } from "lucide-react";
import { useChannels } from "@/domain/hooks";
import { PageHeader } from "@/components/shared/PageHeader";
import { ChannelCard, type ChannelCardData } from "@/components/shared/ChannelCard";
import type { Channel, ChannelKind } from "@/types";

const kindIcon: Record<ChannelKind, LucideIcon> = {
  whatsapp: MessageCircle,
  instagram: Instagram,
  facebook: Facebook,
  telegram: Send,
  tiktok: Music2,
  gbp: Building2,
  web: Globe,
};

const kindColor: Record<ChannelKind, string> = {
  whatsapp:  "from-success/30 to-success/5",
  instagram: "from-accent/30 to-primary/10",
  facebook:  "from-primary/30 to-primary-glow/10",
  telegram:  "from-accent/30 to-accent/5",
  web:       "from-primary/30 to-accent/10",
  tiktok:    "from-destructive/30 to-primary/5",
  gbp:       "from-warning/30 to-warning/5",
};

const toCardData = (c: Channel): ChannelCardData => ({
  id: c.id,
  name: c.name,
  desc: c.description,
  icon: kindIcon[c.kind],
  color: kindColor[c.kind],
  status: c.status,
  account: c.account,
});

export default function Channels() {
  const { data: channels = [], isLoading } = useChannels();
  const connected = channels.filter((c) => c.status === "connected").length;

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      <PageHeader
        eyebrow="Integrações"
        title="Canais"
        description={`${connected} de ${channels.length} canais ativos · conecte onde seus leads conversam.`}
        actions={
          <Button className="gradient-primary text-primary-foreground border-0 shadow-elegant">
            <Sparkles className="h-4 w-4 mr-1.5" /> Sugerir canal
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {channels.map((c) => (
            <ChannelCard key={c.id} channel={toCardData(c)} />
          ))}
        </div>
      )}

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
