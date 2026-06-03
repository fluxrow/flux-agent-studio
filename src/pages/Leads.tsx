import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Flame, Snowflake, Thermometer, Mail, Loader2, AlertTriangle, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  useBots,
  useConversations,
  useCreateLead, useLeadsByStage, usePipelineStages, useUpdateLeadStage,
} from "@/domain/hooks";
import { PageHeader } from "@/components/shared/PageHeader";
import { PipelineColumn } from "@/components/leads/PipelineColumn";
import { EmptyState } from "@/components/ui/empty-state";
import type { LeadStage } from "@/types";

const tempIcon = { quente: Flame, morno: Thermometer, frio: Snowflake } as const;
const tempColor = { quente: "text-destructive", morno: "text-warning", frio: "text-accent" } as const;
const stageDot: Record<string, string> = {
  novo: "bg-muted-foreground",
  qualificado: "bg-accent",
  negociacao: "bg-warning",
  convertido: "bg-success",
  perdido: "bg-destructive",
};

export default function Leads() {
  const { data: stages = [] } = usePipelineStages();
  const { data: byStage, isLoading } = useLeadsByStage();
  const { data: conversationsData } = useConversations();
  const { data: bots = [] } = useBots();
  const createLead = useCreateLead();
  const updateStage = useUpdateLeadStage();
  const total = byStage ? Object.values(byStage).reduce((a, l) => a + l.length, 0) : 0;
  const conversationCount = Array.isArray(conversationsData)
    ? conversationsData.length
    : conversationsData?.items?.length ?? 0;
  const showCaptureAlert = total === 0 && conversationCount > 0;
  const firstBotId = bots[0]?.id;

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", company: "", source: "manual",
  });

  const submit = async () => {
    if (!form.name.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }
    await createLead.mutateAsync({
      name: form.name.trim(),
      email: form.email.trim() || undefined,
      phone: form.phone.trim() || undefined,
      company: form.company.trim() || undefined,
      source: form.source || "manual",
    });
    toast.success("Lead criado");
    setOpen(false);
    setForm({ name: "", email: "", phone: "", company: "", source: "manual" });
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1700px] mx-auto">
      <PageHeader
        title="Leads"
        description={`Pipeline CRM · ${total} leads`}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-primary-foreground border-0 shadow-elegant">
                <Plus className="h-4 w-4 mr-1.5" /> Novo lead
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Novo lead</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Input placeholder="Nome *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <Input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                <Input placeholder="Telefone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                <Input placeholder="Empresa" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
                <Input placeholder="Origem (ex: WhatsApp, Meta Ads)" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button onClick={submit} disabled={createLead.isPending} className="gradient-primary text-primary-foreground border-0">
                  {createLead.isPending && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
                  Criar lead
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {isLoading || !byStage ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : total === 0 ? (
        <EmptyState
          title="Nenhum lead no pipeline"
          description="Crie um lead manualmente ou conecte um bot para começar a capturar."
          action={
            <Button onClick={() => setOpen(true)} className="gradient-primary text-primary-foreground border-0">
              <Plus className="h-4 w-4 mr-1.5" /> Novo lead
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-5 gap-3 min-w-0">
          {stages.map((s) => {
            const items = byStage[s.id] ?? [];
            return (
              <PipelineColumn key={s.id} label={s.label} count={items.length} dotColor={stageDot[s.id]}>
                {items.map((l) => {
                  const TempIcon = tempIcon[l.temperature];
                  return (
                    <div key={l.id} className="rounded-xl border border-border bg-background/60 p-3 hover:border-primary/40 hover:shadow-card transition group">
                      <Link to={`/leads/${l.id}`} className="block">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg gradient-accent flex items-center justify-center text-xs font-bold text-background">
                              {l.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                            </div>
                            <div>
                              <div className="text-sm font-medium">{l.name}</div>
                              <div className="text-[10px] text-muted-foreground">{l.company ?? l.botName ?? l.source}</div>
                            </div>
                          </div>
                        </div>
                        <div className="mt-2.5 flex items-center justify-between">
                          <div className={`inline-flex items-center gap-1 text-[10px] ${tempColor[l.temperature]}`}>
                            <TempIcon className="h-3 w-3" /> {l.temperature}
                          </div>
                          <div className="text-xs font-mono font-semibold">
                            <span className="text-primary-glow">{l.score}</span>
                            <span className="text-muted-foreground">/100</span>
                          </div>
                        </div>
                        <div className="mt-2 h-1 rounded-full bg-secondary overflow-hidden">
                          <div className="h-full gradient-primary" style={{ width: `${l.score}%` }} />
                        </div>
                        <div className="mt-2.5 pt-2 border-t border-border flex items-center gap-2 text-[10px] text-muted-foreground">
                          <Mail className="h-3 w-3" /> {l.source}
                          {l.tags?.slice(0, 2).map((t) => (
                            <span key={t} className="ml-auto px-1.5 py-0.5 rounded-full bg-primary/10 text-primary-glow">{t}</span>
                          ))}
                        </div>
                      </Link>
                      <div className="mt-2 opacity-0 group-hover:opacity-100 transition">
                        <Select
                          value={l.stage}
                          onValueChange={(v) => updateStage.mutate({ id: l.id, stage: v as LeadStage })}
                        >
                          <SelectTrigger className="h-7 text-[11px] bg-secondary/40 border-border">
                            <SelectValue placeholder="Mover" />
                          </SelectTrigger>
                          <SelectContent>
                            {stages.map((s2) => (
                              <SelectItem key={s2.id} value={s2.id}>Mover para {s2.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  );
                })}
              </PipelineColumn>
            );
          })}
        </div>
      )}
    </div>
  );
}
