import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, Loader2, Mail, Phone, Building2, Tag as TagIcon, Plus,
  Trash2, Flame, Snowflake, Thermometer, MessageSquare, Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  useLead, useLeadTimeline, useLeadConversations, useUpdateLead,
  useUpdateLeadStage, useAddLeadTag, useRemoveLeadTag, useDeleteLead,
  usePipelineStages,
} from "@/domain/hooks";
import { EmptyState, ErrorState } from "@/components/ui/empty-state";

const tempMeta = {
  quente: { icon: Flame, cls: "text-destructive" },
  morno:  { icon: Thermometer, cls: "text-warning" },
  frio:   { icon: Snowflake, cls: "text-accent" },
} as const;

function fmt(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("pt-BR");
}

export default function LeadDetail() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { data: lead, isLoading, error, refetch } = useLead(id);
  const { data: stages = [] } = usePipelineStages();
  const { data: timeline = [] } = useLeadTimeline(id);
  const { data: conversations = [] } = useLeadConversations(id);
  const updateLead = useUpdateLead();
  const updateStage = useUpdateLeadStage();
  const addTag = useAddLeadTag();
  const removeTag = useRemoveLeadTag();
  const deleteLead = useDeleteLead();
  const [newTag, setNewTag] = useState("");
  const [scoreDraft, setScoreDraft] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="p-8 max-w-xl mx-auto">
        <ErrorState
          title="Não foi possível carregar o lead"
          description={(error as Error).message}
          onRetry={() => refetch()}
        />
      </div>
    );
  }
  if (!lead) {
    return (
      <div className="p-8 max-w-xl mx-auto">
        <EmptyState
          title="Lead não encontrado"
          description="Pode ter sido removido ou pertencer a outro workspace."
          action={
            <Button asChild variant="outline" size="sm">
              <Link to="/leads"><ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Voltar</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const TempIcon = tempMeta[lead.temperature].icon;

  const handleAddTag = async () => {
    const tag = newTag.trim();
    if (!tag) return;
    await addTag.mutateAsync({ id: lead.id, tag });
    setNewTag("");
  };

  const handleScoreCommit = async () => {
    if (scoreDraft === null || scoreDraft === lead.score) return;
    await updateLead.mutateAsync({ id: lead.id, patch: { score: scoreDraft } });
    setScoreDraft(null);
    toast.success("Score atualizado");
  };

  return (
    <div className="p-6 lg:p-8 max-w-[1500px] mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <Link to="/leads" className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
            <ArrowLeft className="h-3 w-3" /> Pipeline
          </Link>
          <div className="flex items-center gap-3 mt-1.5">
            <div className="h-12 w-12 rounded-2xl gradient-accent flex items-center justify-center text-sm font-bold text-background">
              {lead.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold">{lead.name}</h1>
              <p className="text-xs text-muted-foreground">
                Criado em {fmt(lead.createdAt)} · Última atividade {fmt(lead.lastActivityAt ?? lead.updatedAt)}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={lead.stage}
            onValueChange={(v) => updateStage.mutate({ id: lead.id, stage: v as any })}
          >
            <SelectTrigger className="w-48 bg-secondary/40 border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {stages.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            className="border-destructive/40 text-destructive hover:bg-destructive/10"
            onClick={async () => {
              if (!confirm("Remover este lead?")) return;
              await deleteLead.mutateAsync(lead.id);
              toast.success("Lead removido");
              navigate("/leads");
            }}
          >
            <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Remover
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar info */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card/60 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">Dados</h3>
              <div className={`inline-flex items-center gap-1 text-xs ${tempMeta[lead.temperature].cls}`}>
                <TempIcon className="h-3 w-3" /> {lead.temperature}
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <Field icon={Mail} label="Email" value={lead.email} />
              <Field icon={Phone} label="Telefone" value={lead.phone} />
              <Field icon={Building2} label="Empresa" value={lead.company} />
              <Field icon={TagIcon} label="Origem" value={lead.source} />
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card/60 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">Score</h3>
              <span className="text-xs font-mono">
                <span className="text-primary-glow">{scoreDraft ?? lead.score}</span>
                <span className="text-muted-foreground">/100</span>
              </span>
            </div>
            <input
              type="range" min={0} max={100}
              value={scoreDraft ?? lead.score}
              onChange={(e) => setScoreDraft(Number(e.target.value))}
              onMouseUp={handleScoreCommit}
              onTouchEnd={handleScoreCommit}
              className="w-full accent-primary"
            />
            <div className="h-1 rounded-full bg-secondary overflow-hidden">
              <div className="h-full gradient-primary" style={{ width: `${scoreDraft ?? lead.score}%` }} />
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card/60 p-5 space-y-3">
            <h3 className="font-semibold text-sm">Tags</h3>
            <div className="flex flex-wrap gap-1.5">
              {(lead.tags ?? []).map((t) => (
                <Badge
                  key={t}
                  variant="secondary"
                  className="cursor-pointer hover:bg-destructive/20"
                  onClick={() => removeTag.mutate({ id: lead.id, tag: t })}
                >
                  {t} ×
                </Badge>
              ))}
              {(lead.tags ?? []).length === 0 && (
                <span className="text-xs text-muted-foreground">Sem tags</span>
              )}
            </div>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                placeholder="Adicionar tag…"
                className="h-8 text-xs bg-background border-border"
              />
              <Button size="sm" variant="outline" className="bg-secondary/40" onClick={handleAddTag}>
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>

        {/* Main panel */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="timeline">
            <TabsList className="bg-card/60 border border-border h-auto p-1">
              <TabsTrigger value="timeline"><Clock className="h-3.5 w-3.5 mr-1.5" />Timeline</TabsTrigger>
              <TabsTrigger value="conversations"><MessageSquare className="h-3.5 w-3.5 mr-1.5" />Conversas</TabsTrigger>
              <TabsTrigger value="notes">Notas</TabsTrigger>
            </TabsList>

            <TabsContent value="timeline" className="mt-4">
              <div className="rounded-2xl border border-border bg-card/60 p-5">
                {timeline.length === 0 ? (
                  <EmptyState title="Sem eventos ainda" description="Eventos da Runtime e mudanças no lead aparecem aqui." />
                ) : (
                  <ol className="relative border-l border-border ml-2 space-y-4">
                    {timeline.map((e) => (
                      <li key={e.id} className="ml-4">
                        <div className="absolute -left-1.5 h-3 w-3 rounded-full bg-primary border-2 border-background" />
                        <div className="text-xs text-muted-foreground">{fmt(e.at)}</div>
                        <div className="text-sm font-medium">{e.type.replace(/_/g, " ")}</div>
                        {Object.keys(e.payload ?? {}).length > 0 && (
                          <pre className="mt-1 text-[11px] bg-background/40 border border-border rounded-md p-2 overflow-x-auto">
{JSON.stringify(e.payload, null, 2)}
                          </pre>
                        )}
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </TabsContent>

            <TabsContent value="conversations" className="mt-4">
              <div className="rounded-2xl border border-border bg-card/60 p-5">
                {conversations.length === 0 ? (
                  <EmptyState title="Nenhuma conversa vinculada" description="Quando o lead interage com um bot, as conversas aparecem aqui." />
                ) : (
                  <ul className="divide-y divide-border">
                    {conversations.map((c) => (
                      <li key={c.id} className="py-3">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium">{c.botName}</div>
                          <div className="text-xs text-muted-foreground">{fmt(c.time)}</div>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 truncate">{c.preview}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </TabsContent>

            <TabsContent value="notes" className="mt-4">
              <div className="rounded-2xl border border-border bg-card/60 p-5 space-y-3">
                <textarea
                  defaultValue={lead.notes ?? ""}
                  rows={8}
                  placeholder="Anotações internas sobre este lead…"
                  className="w-full bg-background border border-border rounded-md p-3 text-sm"
                  onBlur={(e) => {
                    if (e.target.value !== (lead.notes ?? "")) {
                      updateLead.mutate({ id: lead.id, patch: { notes: e.target.value } });
                      toast.success("Notas salvas");
                    }
                  }}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function Field({
  icon: Icon, label, value,
}: { icon: typeof Mail; label: string; value?: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      <span className="text-xs text-muted-foreground w-20">{label}</span>
      <span className="flex-1 truncate">{value ?? "—"}</span>
    </div>
  );
}
