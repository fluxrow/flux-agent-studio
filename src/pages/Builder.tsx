import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import {
  ChevronLeft, Save, Play, ZoomIn, ZoomOut, Search, Map,
  AlertTriangle, CheckCircle2, Sparkles, Database, Settings as SettingsIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useFlow } from "@/domain/hooks";
import { BuilderProvider, useBuilder } from "@/builder/BuilderContext";
import { blockRegistry, toneClass } from "@/builder/blockRegistry";
import { ValidationPanel } from "@/components/builder/ValidationPanel";
import { PreviewPanel } from "@/components/builder/PreviewPanel";
import type { Block, FlowMetadata } from "@/types";

const paletteGroups = [
  { label: "Comunicação", types: ["message"] as const },
  { label: "Entrada",     types: ["input"] as const },
  { label: "Escolhas",    types: ["choice"] as const },
  { label: "Lógica",      types: ["condition", "delay"] as const },
  { label: "Integrações", types: ["webhook", "ai"] as const },
  { label: "Fluxo",       types: ["start", "end"] as const },
];

const statusTone: Record<FlowMetadata["status"], string> = {
  draft:     "bg-warning/15 text-warning border-warning/30",
  published: "bg-success/15 text-success border-success/30",
  archived:  "bg-muted text-muted-foreground border-border",
};

export default function Builder() {
  const { id } = useParams();
  const { data: flow, isLoading } = useFlow(id);

  if (isLoading || !flow) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-3.5rem)] text-muted-foreground text-sm">
        Carregando flow…
      </div>
    );
  }

  return (
    <BuilderProvider flow={flow}>
      <BuilderInner />
    </BuilderProvider>
  );
}

function BuilderInner() {
  const { id } = useParams();
  const {
    flow, selectedBlock, validation,
    selectBlock, updateBlock, updateConfig, updateMetadata,
    publish, state,
  } = useBuilder();

  const [showPreview, setShowPreview] = useState(false);
  const metadata = flow.metadata as FlowMetadata;
  const nodeMap = Object.fromEntries(flow.blocks.map((n) => [n.id, n]));

  const handlePublish = () => {
    if (!validation.valid) return;
    publish();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      {/* toolbar */}
      <div className="flex items-center justify-between border-b border-border bg-card/60 px-4 py-2.5 gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Link to="/bots"><Button size="sm" variant="ghost"><ChevronLeft className="h-4 w-4" /></Button></Link>
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Builder · {id}</div>
            <div className="flex items-center gap-2">
              <input
                value={metadata.name}
                onChange={(e) => updateMetadata({ name: e.target.value })}
                className="text-sm font-semibold bg-transparent border-0 outline-none focus:bg-background rounded px-1 -ml-1 min-w-0"
              />
              <Badge variant="outline" className={statusTone[metadata.status]}>
                {metadata.status}
              </Badge>
              <span className="text-[10px] text-muted-foreground">v{metadata.version}</span>
              {state.dirty && <span className="text-[10px] text-warning">• alterado</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden lg:flex items-center gap-1.5 text-[11px] mr-3">
            {validation.valid ? (
              <span className="flex items-center gap-1 text-success">
                <CheckCircle2 className="h-3.5 w-3.5" /> Flow válido
              </span>
            ) : (
              <span className="flex items-center gap-1 text-destructive">
                <AlertTriangle className="h-3.5 w-3.5" />
                {validation.errors.length} erro(s)
              </span>
            )}
            {validation.warnings.length > 0 && (
              <span className="flex items-center gap-1 text-warning">
                <AlertTriangle className="h-3.5 w-3.5" />
                {validation.warnings.length} aviso(s)
              </span>
            )}
          </div>
          <div className="hidden md:flex items-center gap-1 mr-3 text-muted-foreground">
            <Button size="icon" variant="ghost" className="h-8 w-8"><ZoomOut className="h-4 w-4" /></Button>
            <span className="text-xs">100%</span>
            <Button size="icon" variant="ghost" className="h-8 w-8"><ZoomIn className="h-4 w-4" /></Button>
            <Button size="icon" variant="ghost" className="h-8 w-8"><Map className="h-4 w-4" /></Button>
          </div>
          <Button size="sm" variant="outline" className="bg-secondary/40" onClick={() => setShowPreview(true)}>
            <Play className="h-4 w-4 mr-1.5" /> Preview
          </Button>
          <Button size="sm" variant="outline" className="bg-secondary/40">
            <Save className="h-4 w-4 mr-1.5" /> Salvar rascunho
          </Button>
          <Button
            size="sm"
            disabled={!validation.valid}
            onClick={handlePublish}
            className="gradient-primary text-primary-foreground border-0 shadow-elegant disabled:opacity-50"
          >
            Publicar
          </Button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* blocks palette */}
        <aside className="w-64 border-r border-border bg-card/40 overflow-y-auto">
          <div className="p-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input placeholder="Buscar bloco..." className="pl-8 h-8 text-xs bg-background border-border" />
            </div>
          </div>
          <div className="px-3 pb-6 space-y-5">
            {paletteGroups.map((g) => (
              <div key={g.label}>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">{g.label}</div>
                <div className="grid grid-cols-2 gap-1.5">
                  {g.types.map((t) => {
                    const meta = blockRegistry[t];
                    return (
                      <div
                        key={t}
                        className="flex flex-col items-center gap-1 rounded-lg border border-border bg-background/60 p-2.5 cursor-grab hover:border-primary/40 hover:bg-card transition text-[10px]"
                      >
                        <meta.icon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-center">{meta.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* canvas */}
        <div className="flex-1 relative overflow-auto grid-bg">
          <div className="relative" style={{ width: 2000, height: 800 }}>
            <svg className="absolute inset-0 pointer-events-none" width={2000} height={800}>
              {flow.connections.map((e) => {
                const a = nodeMap[e.fromBlockId], b = nodeMap[e.toBlockId];
                if (!a || !b) return null;
                const x1 = a.position.x + 260, y1 = a.position.y + 40;
                const x2 = b.position.x, y2 = b.position.y + 40;
                const c = `M ${x1} ${y1} C ${x1+80} ${y1}, ${x2-80} ${y2}, ${x2} ${y2}`;
                return (
                  <g key={e.id}>
                    <path d={c} stroke="hsl(var(--primary) / 0.5)" strokeWidth={2} fill="none" />
                    {e.condition && (
                      <foreignObject x={(x1+x2)/2-22} y={(y1+y2)/2-10} width={44} height={20}>
                        <div className="text-[10px] text-center rounded bg-background border border-border px-1.5 py-0.5">
                          {e.condition}
                        </div>
                      </foreignObject>
                    )}
                  </g>
                );
              })}
            </svg>

            {flow.blocks.map((n) => {
              const meta = blockRegistry[n.type];
              const isSel = selectedBlock?.id === n.id;
              const hasError = validation.errors.some((i) => i.blockId === n.id);
              return (
                <button
                  key={n.id}
                  onClick={() => selectBlock(n.id)}
                  style={{ left: n.position.x, top: n.position.y }}
                  className={`absolute w-[260px] text-left rounded-xl border bg-card p-3 shadow-card transition hover:shadow-elegant ${
                    isSel ? "border-primary shadow-glow ring-2 ring-primary/30" : hasError ? "border-destructive/60" : "border-border"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`h-7 w-7 rounded-md flex items-center justify-center border ${toneClass[meta.tone]}`}>
                      <meta.icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{n.type}</div>
                    {hasError && <AlertTriangle className="h-3 w-3 text-destructive ml-auto" />}
                  </div>
                  <div className="text-sm font-semibold mt-2">{n.label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                    {String(n.config.text ?? n.config.variable ?? "—")}
                  </div>
                  <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 h-3 w-3 rounded-full border-2 border-primary bg-background" />
                  <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 rounded-full border-2 border-primary bg-background" />
                </button>
              );
            })}
          </div>
        </div>

        {/* right sidebar — tabs: properties / validation / metadata */}
        <aside className="w-80 border-l border-border bg-card/60 overflow-hidden flex flex-col">
          <Tabs defaultValue="props" className="flex flex-col flex-1 min-h-0">
            <TabsList className="m-3 grid grid-cols-3 bg-background/60">
              <TabsTrigger value="props" className="text-xs">Propriedades</TabsTrigger>
              <TabsTrigger value="validation" className="text-xs gap-1">
                Validação
                {!validation.valid && <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-destructive" />}
              </TabsTrigger>
              <TabsTrigger value="meta" className="text-xs">Flow</TabsTrigger>
            </TabsList>

            <TabsContent value="props" className="flex-1 overflow-y-auto m-0 px-5 pb-5">
              {selectedBlock ? <PropertiesEditor block={selectedBlock} onChange={(p) => updateConfig(selectedBlock.id, p)} onLabel={(l) => updateBlock(selectedBlock.id, { label: l })} /> : null}
            </TabsContent>

            <TabsContent value="validation" className="flex-1 overflow-y-auto m-0 px-3 pb-5">
              <ValidationPanel report={validation} onSelectBlock={selectBlock} />
            </TabsContent>

            <TabsContent value="meta" className="flex-1 overflow-y-auto m-0 px-5 pb-5 space-y-4">
              <FlowMetadataEditor />
            </TabsContent>
          </Tabs>
        </aside>
      </div>

      {showPreview && <PreviewPanel onClose={() => setShowPreview(false)} />}
    </div>
  );
}

/* ---------- Properties editor ---------- */

function PropertiesEditor({
  block,
  onChange,
  onLabel,
}: {
  block: Block;
  onChange: (config: Partial<Block["config"]>) => void;
  onLabel: (label: string) => void;
}) {
  const meta = blockRegistry[block.type];
  return (
    <div className="space-y-4">
      <div className="border-b border-border pb-4 -mx-5 px-5">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Bloco selecionado</div>
        <div className="mt-2 flex items-center gap-2">
          <div className={`h-8 w-8 rounded-md flex items-center justify-center border ${toneClass[meta.tone]}`}>
            <meta.icon className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="font-semibold truncate">{block.label}</div>
            <div className="text-xs text-muted-foreground font-mono truncate">#{block.id}</div>
          </div>
        </div>
      </div>

      <div>
        <label className="text-xs text-muted-foreground">Nome do bloco</label>
        <Input value={block.label} onChange={(e) => onLabel(e.target.value)} className="mt-1 bg-background border-border" />
      </div>

      {(block.type === "message" || block.type === "input" || block.type === "end") && (
        <div>
          <label className="text-xs text-muted-foreground">
            {block.type === "input" ? "Pergunta" : "Conteúdo"}
          </label>
          <Textarea
            rows={4}
            value={String(block.config.text ?? "")}
            onChange={(e) => onChange({ text: e.target.value })}
            className="mt-1 bg-background border-border text-sm"
            placeholder="Use {{variavel}} para interpolar."
          />
        </div>
      )}

      {(block.type === "input" || block.type === "choice") && (
        <div>
          <label className="text-xs text-muted-foreground">Variável de saída</label>
          <Input
            value={String(block.config.variable ?? "")}
            onChange={(e) => onChange({ variable: e.target.value })}
            className="mt-1 bg-background border-border font-mono text-xs"
            placeholder="ex: lead_name"
          />
        </div>
      )}

      {block.type === "choice" && (
        <div>
          <label className="text-xs text-muted-foreground">Opções (uma por linha)</label>
          <Textarea
            rows={4}
            value={((block.config.options as string[] | undefined) ?? []).join("\n")}
            onChange={(e) => onChange({ options: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) })}
            className="mt-1 bg-background border-border text-sm font-mono"
          />
        </div>
      )}

      {block.type === "condition" && (
        <>
          <div>
            <label className="text-xs text-muted-foreground">Variável</label>
            <Input
              value={String(block.config.variable ?? "")}
              onChange={(e) => onChange({ variable: e.target.value })}
              className="mt-1 bg-background border-border font-mono text-xs"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-muted-foreground">Operador</label>
              <Select
                value={String(block.config.operator ?? "equals")}
                onValueChange={(v) => onChange({ operator: v as Block["config"]["operator"] })}
              >
                <SelectTrigger className="mt-1 bg-background border-border text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="equals">equals</SelectItem>
                  <SelectItem value="contains">contains</SelectItem>
                  <SelectItem value="greater_than">greater_than</SelectItem>
                  <SelectItem value="less_than">less_than</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Valor</label>
              <Input
                value={String(block.config.value ?? "")}
                onChange={(e) => onChange({ value: e.target.value })}
                className="mt-1 bg-background border-border text-xs"
              />
            </div>
          </div>
        </>
      )}

      {block.type === "ai" && (
        <>
          <div>
            <label className="text-xs text-muted-foreground">Modelo</label>
            <div className="mt-1 rounded-lg border border-border bg-background px-3 py-2 text-sm flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary-glow" /> GPT-5.2 · OpenAI
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Prompt</label>
            <Textarea
              rows={5}
              value={String(block.config.prompt ?? "")}
              onChange={(e) => onChange({ prompt: e.target.value })}
              className="mt-1 bg-background border-border text-sm"
            />
          </div>
        </>
      )}

      {block.type === "webhook" && (
        <div>
          <label className="text-xs text-muted-foreground">URL</label>
          <Input
            value={String(block.config.url ?? "")}
            onChange={(e) => onChange({ url: e.target.value })}
            className="mt-1 bg-background border-border font-mono text-xs"
            placeholder="https://api.exemplo.com/hook"
          />
        </div>
      )}
    </div>
  );
}

/* ---------- Flow metadata editor ---------- */

function FlowMetadataEditor() {
  const { flow, updateMetadata, setStatus } = useBuilder();
  const md = flow.metadata as FlowMetadata;

  return (
    <>
      <div className="border-b border-border pb-4 -mx-5 px-5">
        <div className="flex items-center gap-2">
          <SettingsIcon className="h-3.5 w-3.5 text-primary-glow" />
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
            Metadata do flow
          </div>
        </div>
      </div>

      <div>
        <label className="text-xs text-muted-foreground">Nome</label>
        <Input value={md.name} onChange={(e) => updateMetadata({ name: e.target.value })} className="mt-1 bg-background border-border" />
      </div>
      <div>
        <label className="text-xs text-muted-foreground">Descrição</label>
        <Textarea
          rows={3}
          value={md.description ?? ""}
          onChange={(e) => updateMetadata({ description: e.target.value })}
          className="mt-1 bg-background border-border text-sm"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground">Canal principal</label>
          <Select value={md.primaryChannel ?? ""} onValueChange={(v) => updateMetadata({ primaryChannel: v })}>
            <SelectTrigger className="mt-1 bg-background border-border text-xs">
              <SelectValue placeholder="Escolha…" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="whatsapp">WhatsApp</SelectItem>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="telegram">Telegram</SelectItem>
              <SelectItem value="webchat">Webchat</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Status</label>
          <Select value={md.status} onValueChange={(v) => setStatus(v as FlowMetadata["status"])}>
            <SelectTrigger className="mt-1 bg-background border-border text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="text-xs text-muted-foreground flex items-center justify-between border-t border-border pt-3">
        <span>Versão atual</span>
        <span className="font-mono">v{md.version}</span>
      </div>
      <div className="text-xs text-muted-foreground flex items-center justify-between">
        <span>Última edição</span>
        <span>{new Date(md.lastEditedAt).toLocaleString()}</span>
      </div>

      {flow.versions && flow.versions.length > 0 && (
        <div className="rounded-2xl border border-border bg-card/60 p-3 space-y-2 mt-2">
          <div className="flex items-center gap-2">
            <Database className="h-3.5 w-3.5 text-primary-glow" />
            <span className="text-[11px] uppercase tracking-widest text-muted-foreground">Histórico de versões</span>
          </div>
          <ul className="space-y-1.5">
            {[...flow.versions].reverse().map((v) => (
              <li key={v.version} className="flex items-center justify-between text-xs rounded-lg border border-border bg-background/60 px-2.5 py-1.5">
                <span className="font-mono">v{v.version}</span>
                <Badge variant="outline" className={statusTone[v.status]}>{v.status}</Badge>
                <span className="text-muted-foreground text-[10px]">{new Date(v.createdAt).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
