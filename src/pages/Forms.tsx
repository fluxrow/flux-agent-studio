import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FileText, MessageCircle, Instagram, Globe, ExternalLink, Copy, Code2,
  Smartphone, Monitor, Sparkles,
} from "lucide-react";

type Mode = {
  id: string;
  name: string;
  tag: string;
  desc: string;
  icon: any;
  device: "mobile" | "desktop";
  recommended?: boolean;
};

const modes: Mode[] = [
  { id: "form",   name: "Formulário tradicional", tag: "Clássico",       desc: "Página com campos sequenciais, ideal para landing pages.",      icon: FileText,      device: "desktop" },
  { id: "wa",     name: "Conversa estilo WhatsApp", tag: "Mais convertem", desc: "Balões verdes, status de leitura e digitação realista.",       icon: MessageCircle, device: "mobile",  recommended: true },
  { id: "ig",     name: "Conversa estilo Instagram DM", tag: "Social",    desc: "Visual de DM com gradiente, perfeito para anúncios de Reels.",  icon: Instagram,     device: "mobile" },
  { id: "widget", name: "Widget de site",         tag: "Embed",          desc: "Bubble flutuante que abre o bot dentro do seu site.",          icon: Globe,         device: "desktop" },
  { id: "page",   name: "Página pública",         tag: "Fullscreen",     desc: "URL dedicada fluxbot.app/bot/seu-slug pronta para compartilhar.", icon: ExternalLink, device: "desktop" },
];

const deviceIcon = { mobile: Smartphone, desktop: Monitor };

export default function Forms() {
  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-primary-glow font-medium">Conversational Forms</div>
          <h1 className="font-display text-3xl font-bold mt-1.5">Modos de publicação</h1>
          <p className="text-muted-foreground text-sm mt-1">
            O mesmo fluxo, várias experiências. Escolha como cada bot aparece para o seu lead.
          </p>
        </div>
        <Button className="gradient-primary text-primary-foreground border-0 shadow-elegant">
          <Sparkles className="h-4 w-4 mr-1.5" /> Pré-visualizar fluxo ativo
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {modes.map((m) => {
          const Icon = m.icon;
          const DevIcon = deviceIcon[m.device];
          return (
            <div key={m.id} className={`group relative rounded-2xl border bg-card/60 p-5 transition overflow-hidden ${m.recommended ? "border-primary/50 shadow-elegant" : "border-border hover:border-primary/40"}`}>
              {m.recommended && (
                <div className="absolute top-3 right-3 text-[10px] uppercase tracking-widest gradient-primary text-primary-foreground px-2 py-0.5 rounded-full">
                  Recomendado
                </div>
              )}
              <div className="h-12 w-12 rounded-xl border border-border bg-background/70 flex items-center justify-center">
                <Icon className="h-5 w-5 text-primary-glow" />
              </div>

              <div className="mt-4 flex items-center gap-2">
                <h3 className="font-semibold text-lg">{m.name}</h3>
              </div>
              <div className="flex items-center gap-2 mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">
                <span className="px-1.5 py-0.5 rounded bg-secondary border border-border">{m.tag}</span>
                <span className="inline-flex items-center gap-1"><DevIcon className="h-3 w-3" /> {m.device === "mobile" ? "Mobile-first" : "Desktop"}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-3 line-clamp-2">{m.desc}</p>

              {/* mini preview */}
              <div className="mt-4 rounded-xl border border-border bg-background/60 p-3 h-32 overflow-hidden relative">
                {m.id === "form" && (
                  <div className="space-y-2">
                    <div className="h-2 w-20 rounded bg-muted" />
                    <div className="h-7 rounded-md border border-border bg-secondary/60" />
                    <div className="h-2 w-16 rounded bg-muted" />
                    <div className="h-7 rounded-md border border-border bg-secondary/60" />
                  </div>
                )}
                {(m.id === "wa" || m.id === "ig") && (
                  <div className="space-y-1.5">
                    <div className="text-[10px] px-2.5 py-1.5 rounded-2xl rounded-tl-sm bg-secondary max-w-[70%]">Olá! Posso te ajudar?</div>
                    <div className={`text-[10px] px-2.5 py-1.5 rounded-2xl rounded-tr-sm ml-auto max-w-[60%] text-primary-foreground ${m.id === "wa" ? "bg-success" : "gradient-primary"}`}>Quero saber preços</div>
                    <div className="text-[10px] px-2.5 py-1.5 rounded-2xl rounded-tl-sm bg-secondary max-w-[75%]">Claro! Qual o seu nome?</div>
                  </div>
                )}
                {m.id === "widget" && (
                  <div className="relative h-full">
                    <div className="absolute bottom-1 right-1 h-10 w-10 rounded-full gradient-primary shadow-glow flex items-center justify-center">
                      <MessageCircle className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div className="absolute bottom-12 right-1 w-32 rounded-lg border border-border bg-card p-2">
                      <div className="h-1.5 w-16 rounded bg-muted mb-1.5" />
                      <div className="h-1.5 w-20 rounded bg-muted" />
                    </div>
                  </div>
                )}
                {m.id === "page" && (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <div className="text-[10px] font-mono text-primary-glow">fluxbot.app/bot/sdr-imob</div>
                    <div className="mt-2 h-6 w-24 rounded-md gradient-primary" />
                  </div>
                )}
              </div>

              <div className="mt-4 flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 bg-secondary/40">
                  <Code2 className="h-3.5 w-3.5 mr-1.5" /> Embed
                </Button>
                <Button size="sm" className="flex-1 gradient-primary text-primary-foreground border-0">
                  Publicar
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Share block */}
      <div className="rounded-2xl border border-border bg-card/60 p-6">
        <h3 className="font-semibold">Link público do bot ativo</h3>
        <p className="text-xs text-muted-foreground mt-1">Compartilhe em anúncios, bio do Instagram, QR code ou email.</p>
        <div className="mt-4 flex gap-2">
          <Input readOnly value="https://fluxbot.app/bot/sdr-imob" className="font-mono text-sm bg-background border-border" />
          <Button variant="outline" className="bg-secondary/40"><Copy className="h-4 w-4 mr-1.5" /> Copiar</Button>
          <Button className="gradient-primary text-primary-foreground border-0"><ExternalLink className="h-4 w-4 mr-1.5" /> Abrir</Button>
        </div>
      </div>
    </div>
  );
}
