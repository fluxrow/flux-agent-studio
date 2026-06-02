import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Bot, Sparkles, MessageCircle, ShoppingCart, Headphones, Calendar, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/SectionCard";
import { cn } from "@/lib/utils";
import { useCreateBot } from "@/domain/hooks";
import { toast } from "sonner";
import { recordActivation } from "@/beta/activation";
import { useWorkspace } from "@/auth/WorkspaceProvider";

const presets = [
  { id: "blank",   icon: Sparkles,      title: "Em branco",       desc: "Comece do zero com um canvas vazio." },
  { id: "sdr",     icon: Bot,           title: "Agente SDR",      desc: "Qualifica leads e agenda reuniões." },
  { id: "support", icon: Headphones,    title: "Suporte",         desc: "Atende dúvidas e abre tickets." },
  { id: "ecom",    icon: ShoppingCart,  title: "E-commerce",      desc: "Recupera carrinho e responde produtos." },
  { id: "book",    icon: Calendar,      title: "Agendamento",     desc: "Reserva horários no seu calendário." },
  { id: "lead",    icon: MessageCircle, title: "Captura de Lead", desc: "Formulário conversacional moderno." },
];

const channels = [
  { label: "WhatsApp",   value: "whatsapp" },
  { label: "Instagram",  value: "instagram" },
  { label: "Web Widget", value: "web" },
  { label: "Telegram",   value: "telegram" },
];

export default function BotNew() {
  const navigate = useNavigate();
  const createBot = useCreateBot();
  const { workspace } = useWorkspace();
  const [preset, setPreset] = useState("sdr");
  const [channel, setChannel] = useState("whatsapp");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const submitting = createBot.isPending;

  async function handleCreate() {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Dê um nome ao seu bot antes de continuar.");
      return;
    }
    try {
      const bot = await createBot.mutateAsync({
        name: trimmed,
        description: description.trim(),
        channel,
      });
      toast.success(`Bot "${bot.name}" criado.`);
      recordActivation(workspace?.id ?? "ws_local_demo", "first_bot_created");
      navigate(`/builder/${bot.id}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Falha ao criar bot.";
      toast.error(msg);
    }
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      <Link to="/bots" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Voltar para Bots
      </Link>

      <PageHeader
        eyebrow="Novo bot"
        title="Criar um novo agente"
        description="Escolha um ponto de partida e personalize depois no builder."
      />

      <SectionCard title="1. Escolha um template">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {presets.map((p) => {
            const active = preset === p.id;
            const Icon = p.icon;
            return (
              <button
                key={p.id}
                onClick={() => setPreset(p.id)}
                className={cn(
                  "text-left rounded-xl border p-4 transition",
                  active
                    ? "border-primary/60 bg-primary/5 shadow-elegant"
                    : "border-border bg-background/40 hover:border-primary/30"
                )}
              >
                <div className="h-9 w-9 rounded-lg gradient-primary flex items-center justify-center shadow-glow mb-3">
                  <Icon className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="font-semibold text-sm">{p.title}</div>
                <div className="text-xs text-muted-foreground mt-1">{p.desc}</div>
              </button>
            );
          })}
        </div>
      </SectionCard>

      <SectionCard title="2. Detalhes do bot">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="bot-name">Nome do bot</Label>
            <Input
              id="bot-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: SDR Imobiliária"
              className="bg-background/60"
            />
          </div>
          <div className="space-y-2">
            <Label>Canal principal</Label>
            <div className="flex flex-wrap gap-2">
              {channels.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setChannel(c.value)}
                  className={cn(
                    "text-xs px-3 py-1.5 rounded-full border transition",
                    channel === c.value
                      ? "border-primary bg-primary/15 text-primary-foreground"
                      : "border-border bg-background/40 text-muted-foreground hover:text-foreground"
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
          <div className="sm:col-span-2 space-y-2">
            <Label htmlFor="bot-desc">Descrição (opcional)</Label>
            <Textarea
              id="bot-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Para que serve esse agente?"
              className="bg-background/60 min-h-[90px]"
            />
          </div>
        </div>
      </SectionCard>

      <div className="flex items-center justify-end gap-2">
        <Button variant="ghost" onClick={() => navigate("/bots")} disabled={submitting}>
          Cancelar
        </Button>
        <Button
          className="gradient-primary text-primary-foreground border-0 shadow-elegant"
          onClick={handleCreate}
          disabled={submitting || !name.trim()}
        >
          {submitting ? (
            <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> Criando…</>
          ) : (
            "Criar e abrir builder"
          )}
        </Button>
      </div>
    </div>
  );
}
