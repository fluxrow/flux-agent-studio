import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Sparkles, Wand2, Loader2, ArrowRight, Coins, FileText, Tag, BookOpen, MessageSquare, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/PageHeader";
import { toast } from "sonner";
import {
  generateBlueprint, materializeBlueprint, aiBuilderCost,
  type BotBlueprint, type AIBuilderObjective,
} from "@/ai-builder";

const objectiveOptions: Array<{ value: AIBuilderObjective; label: string }> = [
  { value: "qualificar_leads", label: "Qualificar leads (SDR)" },
  { value: "agendar_reuniao",  label: "Agendar reunião" },
  { value: "vendas",           label: "Vendas / conversão" },
  { value: "atendimento",      label: "Atendimento geral" },
  { value: "suporte",          label: "Suporte" },
  { value: "outro",            label: "Outro" },
];

const examples = [
  "Quero um SDR para consórcio que qualifique clientes e envie para um consultor.",
  "Bot de agendamento para clínica odontológica, coleta nome, telefone e melhor horário.",
  "Atendimento de e-commerce de moda que responde dúvidas e captura o cupom de interesse.",
];

export default function AIBuilder() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [description, setDescription] = useState("");
  const [segment, setSegment] = useState("");
  const [product, setProduct]   = useState("");
  const [process, setProcess]   = useState("");
  const [objective, setObjective] = useState<AIBuilderObjective | "">("");
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [blueprint, setBlueprint] = useState<BotBlueprint | null>(null);
  const [runs, setRuns] = useState(() => aiBuilderCost.list());

  const handleGenerate = async () => {
    if (!description.trim()) {
      toast({ title: "Descreva o objetivo", description: "Conte em uma frase o que o bot precisa fazer." });
      return;
    }
    setLoading(true);
    try {
      const bp = await generateBlueprint({
        description,
        segment: segment || undefined,
        product: product || undefined,
        process: process || undefined,
        objective: (objective || undefined) as AIBuilderObjective | undefined,
      });
      setBlueprint(bp);
      aiBuilderCost.record(aiBuilderCost.fromBlueprint(description, bp));
      setRuns(aiBuilderCost.list());
      toast({ title: "Blueprint gerado", description: `${bp.bot.name} • ${bp.flow.steps.length} blocos` });
    } catch (err: any) {
      toast({ title: "Falha ao gerar", description: err?.message ?? "Erro desconhecido", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleMaterialize = async () => {
    if (!blueprint) return;
    setCreating(true);
    try {
      const { botId } = await materializeBlueprint(blueprint);
      const last = aiBuilderCost.list()[0];
      if (last) aiBuilderCost.attachBotId(last.id, botId);
      toast({ title: "Bot criado", description: "Abrindo no Builder…" });
      navigate(`/builder/${botId}`);
    } catch (err: any) {
      toast({ title: "Erro ao criar bot", description: err?.message ?? "", variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1500px] mx-auto">
      <PageHeader
        title="AI Builder"
        description="Descreva o agente em linguagem natural e gere um bot completo."
        actions={
          <Badge variant="outline" className="gap-1.5">
            <Sparkles className="h-3 w-3 text-primary" /> Fase 14
          </Badge>
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_1.2fr] gap-6">
        {/* ---------- Prompt ---------- */}
        <div className="rounded-2xl border border-border bg-card/60 p-5 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Wand2 className="h-4 w-4 text-primary" /> Descreva seu agente
          </div>

          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            placeholder="Ex.: Quero um SDR para consórcio que qualifique clientes e envie para um consultor."
          />

          <div className="flex flex-wrap gap-1.5">
            {examples.map((ex) => (
              <button
                key={ex}
                onClick={() => setDescription(ex)}
                className="text-[11px] rounded-full border border-border px-2.5 py-1 text-muted-foreground hover:border-primary/40 hover:text-foreground transition"
              >
                {ex.slice(0, 48)}…
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] uppercase tracking-wider text-muted-foreground">Segmento</label>
              <Input value={segment} onChange={(e) => setSegment(e.target.value)} placeholder="Ex.: Consórcio" />
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-wider text-muted-foreground">Produto</label>
              <Input value={product} onChange={(e) => setProduct(e.target.value)} placeholder="Ex.: Cota de imóvel" />
            </div>
            <div className="col-span-2">
              <label className="text-[11px] uppercase tracking-wider text-muted-foreground">Processo comercial</label>
              <Input value={process} onChange={(e) => setProcess(e.target.value)} placeholder="Ex.: Coletar perfil e enviar para consultor humano" />
            </div>
            <div className="col-span-2">
              <label className="text-[11px] uppercase tracking-wider text-muted-foreground">Objetivo</label>
              <select
                value={objective}
                onChange={(e) => setObjective(e.target.value as AIBuilderObjective | "")}
                className="w-full mt-1 h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Deixar IA detectar</option>
                {objectiveOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          <Button onClick={handleGenerate} disabled={loading} className="w-full gradient-primary text-primary-foreground border-0 shadow-elegant">
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
            Gerar blueprint com IA
          </Button>

          {/* Cost tracker */}
          {runs.length > 0 && (
            <div className="rounded-xl border border-border bg-background/50 p-3 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <Coins className="h-3.5 w-3.5" /> Últimas gerações
              </div>
              <div className="space-y-1.5 max-h-40 overflow-auto">
                {runs.slice(0, 5).map((r) => (
                  <div key={r.id} className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="truncate flex-1">{r.botName}</span>
                    <span className="font-mono">{r.inputTokens + r.outputTokens}t</span>
                    <span className="font-mono ml-3">${r.estimatedCost.toFixed(4)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ---------- Preview ---------- */}
        <div className="rounded-2xl border border-border bg-card/60 p-5">
          {!blueprint ? (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center gap-2 text-center text-muted-foreground">
              <Bot className="h-10 w-10 opacity-40" />
              <div className="text-sm font-medium">Nenhum blueprint ainda</div>
              <p className="text-xs max-w-xs">
                Descreva o que o agente precisa fazer e clique em <strong>Gerar</strong>. A IA monta o fluxo, variáveis,
                tags e sugere uma base de conhecimento — tudo compatível com o Builder.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">Blueprint</div>
                  <div className="text-lg font-semibold">{blueprint.bot.name}</div>
                  <div className="text-xs text-muted-foreground">{blueprint.bot.description}</div>
                </div>
                <Button onClick={handleMaterialize} disabled={creating} className="gradient-primary text-primary-foreground border-0">
                  {creating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <ArrowRight className="h-4 w-4 mr-2" />}
                  Abrir no Builder
                </Button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                <Badge variant="outline">{blueprint.bot.objective}</Badge>
                <Badge variant="outline">{blueprint.bot.channel}</Badge>
                <Badge variant="outline" className="gap-1"><Coins className="h-3 w-3" />${blueprint.meta.estimatedCost.toFixed(4)}</Badge>
                <Badge variant="outline">{blueprint.meta.model}</Badge>
                <Badge variant="outline">{blueprint.meta.durationMs}ms</Badge>
              </div>

              <Tabs defaultValue="flow">
                <TabsList>
                  <TabsTrigger value="flow"><FileText className="h-3.5 w-3.5 mr-1.5" />Flow</TabsTrigger>
                  <TabsTrigger value="crm"><Tag className="h-3.5 w-3.5 mr-1.5" />CRM</TabsTrigger>
                  <TabsTrigger value="knowledge"><BookOpen className="h-3.5 w-3.5 mr-1.5" />Knowledge</TabsTrigger>
                  <TabsTrigger value="conv"><MessageSquare className="h-3.5 w-3.5 mr-1.5" />Conversa</TabsTrigger>
                </TabsList>

                <TabsContent value="flow" className="mt-3 space-y-2">
                  {blueprint.flow.steps.map((s, i) => (
                    <div key={s.id} className="flex items-start gap-3 rounded-lg border border-border p-2.5 bg-background/40">
                      <div className="h-6 w-6 shrink-0 rounded-md bg-primary/10 text-primary text-[11px] font-mono flex items-center justify-center">{i + 1}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold">{s.label}</span>
                          <Badge variant="outline" className="text-[10px]">{s.type}</Badge>
                          {s.variable && <span className="text-[10px] font-mono text-muted-foreground">{`{{${s.variable}}}`}</span>}
                        </div>
                        {(s.text || s.aiPrompt) && (
                          <div className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{s.text ?? s.aiPrompt}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="crm" className="mt-3 space-y-3">
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Campos do lead</div>
                    <div className="flex flex-wrap gap-1.5">
                      {blueprint.leadModel.fields.map((f) => (
                        <Badge key={f.key} variant="outline" className="font-mono text-[10px]">{f.key}:{f.type}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Tags</div>
                    <div className="flex flex-wrap gap-1.5">
                      {blueprint.leadModel.tags.map((t) => <Badge key={t} className="text-[10px]">{t}</Badge>)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Pipeline</div>
                    <div className="flex flex-wrap gap-1.5">
                      {blueprint.leadModel.pipeline.map((s) => <Badge key={s.id} variant="outline" className="text-[10px]">{s.label}</Badge>)}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">Score inicial: <span className="font-semibold text-foreground">{blueprint.leadModel.initialScore}</span></div>
                </TabsContent>

                <TabsContent value="knowledge" className="mt-3 space-y-2">
                  {blueprint.knowledge.suggestedDocuments.map((d) => (
                    <div key={d.title} className="rounded-lg border border-border p-2.5 bg-background/40">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] uppercase">{d.kind}</Badge>
                        <span className="text-xs font-semibold">{d.title}</span>
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">{d.reason}</div>
                    </div>
                  ))}
                  <Link to="/knowledge" className="inline-block text-[11px] text-primary hover:underline">
                    Ir para a base de conhecimento →
                  </Link>
                </TabsContent>

                <TabsContent value="conv" className="mt-3 space-y-2 text-xs">
                  <div><span className="text-muted-foreground">Tom:</span> <strong>{blueprint.conversation.tone}</strong></div>
                  <div><span className="text-muted-foreground">Saudação:</span> {blueprint.conversation.greeting}</div>
                  <div><span className="text-muted-foreground">Fallback:</span> {blueprint.conversation.fallback}</div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
