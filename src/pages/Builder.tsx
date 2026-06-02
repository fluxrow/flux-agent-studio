import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import {
  MessageSquare, Image as ImageIcon, Video, Mic, FileText, Layers, Type, Mail, Phone, Hash,
  CalendarDays, MousePointerClick, List, ToggleLeft, Star, GitFork, Variable, Timer, Shuffle,
  Webhook, Database, Sparkles, ChevronLeft, Save, Play, ZoomIn, ZoomOut, Search, Map,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { sampleChat } from "@/lib/mock";

const groups = [
  { label: "Comunicação", items: [
    { id: "msg", icon: MessageSquare, name: "Mensagem", color: "primary" },
    { id: "img", icon: ImageIcon, name: "Imagem", color: "accent" },
    { id: "vid", icon: Video, name: "Vídeo", color: "accent" },
    { id: "aud", icon: Mic, name: "Áudio", color: "accent" },
    { id: "file", icon: FileText, name: "Arquivo", color: "accent" },
    { id: "car", icon: Layers, name: "Carrossel", color: "accent" },
  ]},
  { label: "Entrada", items: [
    { id: "txt", icon: Type, name: "Texto", color: "warning" },
    { id: "eml", icon: Mail, name: "Email", color: "warning" },
    { id: "phn", icon: Phone, name: "Telefone", color: "warning" },
    { id: "num", icon: Hash, name: "Número", color: "warning" },
    { id: "dt", icon: CalendarDays, name: "Data", color: "warning" },
  ]},
  { label: "Escolhas", items: [
    { id: "btn", icon: MousePointerClick, name: "Botão", color: "success" },
    { id: "ms", icon: List, name: "Múltipla", color: "success" },
    { id: "yn", icon: ToggleLeft, name: "Sim / Não", color: "success" },
    { id: "rate", icon: Star, name: "Avaliação", color: "success" },
  ]},
  { label: "Lógica", items: [
    { id: "cond", icon: GitFork, name: "Condição", color: "destructive" },
    { id: "var", icon: Variable, name: "Variável", color: "destructive" },
    { id: "delay", icon: Timer, name: "Delay", color: "destructive" },
    { id: "rnd", icon: Shuffle, name: "Randomizador", color: "destructive" },
  ]},
  { label: "Integrações & IA", items: [
    { id: "hook", icon: Webhook, name: "Webhook", color: "primary" },
    { id: "db", icon: Database, name: "Supabase", color: "primary" },
    { id: "ai", icon: Sparkles, name: "Bloco IA", color: "primary" },
  ]},
];

type Node = { id: string; x: number; y: number; type: string; title: string; subtitle: string; icon: any; tone: string };

const initialNodes: Node[] = [
  { id: "n1", x: 80, y: 60, type: "start", title: "Início", subtitle: "Saudação inicial", icon: Play, tone: "primary" },
  { id: "n2", x: 80, y: 200, type: "msg", title: "Mensagem", subtitle: "Olá! Sou o assistente da FluxBot. Como posso ajudar?", icon: MessageSquare, tone: "primary" },
  { id: "n3", x: 80, y: 360, type: "input", title: "Captura nome", subtitle: "{{nome}}", icon: Type, tone: "warning" },
  { id: "n4", x: 80, y: 510, type: "ai", title: "Qualifica com IA", subtitle: "GPT-5 · Lead scoring", icon: Sparkles, tone: "primary" },
  { id: "n5", x: 430, y: 360, type: "cond", title: "Condição", subtitle: "score > 70?", icon: GitFork, tone: "destructive" },
  { id: "n6", x: 780, y: 280, type: "hook", title: "Webhook → CRM", subtitle: "POST /leads", icon: Webhook, tone: "primary" },
  { id: "n7", x: 780, y: 440, type: "msg", title: "Follow-up", subtitle: "Te mando conteúdo por email", icon: Mail, tone: "primary" },
];

const edges = [
  { from: "n1", to: "n2" }, { from: "n2", to: "n3" }, { from: "n3", to: "n4" },
  { from: "n4", to: "n5" }, { from: "n5", to: "n6", label: "sim" }, { from: "n5", to: "n7", label: "não" },
];

const toneClass: Record<string,string> = {
  primary: "border-primary/50 bg-primary/10 text-primary-glow",
  accent: "border-accent/50 bg-accent/10 text-accent",
  warning: "border-warning/50 bg-warning/10 text-warning",
  success: "border-success/50 bg-success/10 text-success",
  destructive: "border-destructive/50 bg-destructive/10 text-destructive",
};

export default function Builder() {
  const { id } = useParams();
  const [selected, setSelected] = useState<Node>(initialNodes[3]);
  const nodes = initialNodes;
  const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]));

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      {/* toolbar */}
      <div className="flex items-center justify-between border-b border-border bg-card/60 px-4 py-2.5">
        <div className="flex items-center gap-3">
          <Link to="/bots"><Button size="sm" variant="ghost"><ChevronLeft className="h-4 w-4" /></Button></Link>
          <div>
            <div className="text-xs text-muted-foreground">Builder</div>
            <div className="text-sm font-semibold">SDR Imobiliária Premium <span className="text-muted-foreground font-normal">/ {id}</span></div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-1 mr-3 text-muted-foreground">
            <Button size="icon" variant="ghost" className="h-8 w-8"><ZoomOut className="h-4 w-4" /></Button>
            <span className="text-xs">100%</span>
            <Button size="icon" variant="ghost" className="h-8 w-8"><ZoomIn className="h-4 w-4" /></Button>
            <Button size="icon" variant="ghost" className="h-8 w-8"><Map className="h-4 w-4" /></Button>
          </div>
          <Button size="sm" variant="outline" className="bg-secondary/40"><Save className="h-4 w-4 mr-1.5" /> Salvar</Button>
          <Button size="sm" className="gradient-primary text-primary-foreground border-0 shadow-elegant"><Play className="h-4 w-4 mr-1.5" /> Publicar</Button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* blocks panel */}
        <aside className="w-64 border-r border-border bg-card/40 overflow-y-auto">
          <div className="p-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input placeholder="Buscar bloco..." className="pl-8 h-8 text-xs bg-background border-border" />
            </div>
          </div>
          <div className="px-3 pb-6 space-y-5">
            {groups.map((g) => (
              <div key={g.label}>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">{g.label}</div>
                <div className="grid grid-cols-2 gap-1.5">
                  {g.items.map((it) => (
                    <div key={it.id} className={`flex flex-col items-center gap-1 rounded-lg border border-border bg-background/60 p-2.5 cursor-grab hover:border-primary/40 hover:bg-card transition text-[10px]`}>
                      <it.icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-center">{it.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* canvas */}
        <div className="flex-1 relative overflow-auto grid-bg">
          <div className="relative" style={{ width: 1400, height: 800 }}>
            <svg className="absolute inset-0 pointer-events-none" width={1400} height={800}>
              {edges.map((e, i) => {
                const a = nodeMap[e.from], b = nodeMap[e.to];
                const x1 = a.x + 130, y1 = a.y + 40, x2 = b.x + 10, y2 = b.y + 40;
                const c = `M ${x1} ${y1} C ${x1+80} ${y1}, ${x2-80} ${y2}, ${x2} ${y2}`;
                return (
                  <g key={i}>
                    <path d={c} stroke="hsl(var(--primary) / 0.5)" strokeWidth={2} fill="none" />
                    {e.label && (
                      <foreignObject x={(x1+x2)/2-18} y={(y1+y2)/2-10} width={36} height={20}>
                        <div className="text-[10px] text-center rounded bg-background border border-border px-1.5 py-0.5">{e.label}</div>
                      </foreignObject>
                    )}
                  </g>
                );
              })}
            </svg>

            {nodes.map((n) => {
              const isSel = selected.id === n.id;
              return (
                <button key={n.id} onClick={() => setSelected(n)}
                  style={{ left: n.x, top: n.y }}
                  className={`absolute w-[260px] text-left rounded-xl border bg-card p-3 shadow-card transition hover:shadow-elegant ${isSel ? "border-primary shadow-glow ring-2 ring-primary/30" : "border-border"}`}>
                  <div className="flex items-center gap-2">
                    <div className={`h-7 w-7 rounded-md flex items-center justify-center border ${toneClass[n.tone]}`}>
                      <n.icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{n.type}</div>
                  </div>
                  <div className="text-sm font-semibold mt-2">{n.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.subtitle}</div>
                  <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 h-3 w-3 rounded-full border-2 border-primary bg-background" />
                  <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 rounded-full border-2 border-primary bg-background" />
                </button>
              );
            })}

            {/* mini map */}
            <div className="sticky bottom-4 ml-4 inline-block">
              <div className="glass rounded-lg p-2 w-40 h-24 relative">
                <div className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1">Mini-mapa</div>
                {nodes.map((n) => (
                  <div key={n.id} className="absolute h-1.5 w-3 rounded-sm bg-primary/60" style={{ left: 8 + n.x/30, top: 18 + n.y/25 }} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* properties */}
        <aside className="w-80 border-l border-border bg-card/60 overflow-y-auto">
          <div className="p-5 border-b border-border">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Propriedades do bloco</div>
            <div className="mt-2 flex items-center gap-2">
              <div className={`h-8 w-8 rounded-md flex items-center justify-center border ${toneClass[selected.tone]}`}><selected.icon className="h-4 w-4" /></div>
              <div>
                <div className="font-semibold">{selected.title}</div>
                <div className="text-xs text-muted-foreground">#{selected.id}</div>
              </div>
            </div>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label className="text-xs text-muted-foreground">Nome do bloco</label>
              <Input defaultValue={selected.title} className="mt-1 bg-background border-border" />
            </div>
            {selected.type === "ai" ? (
              <>
                <div>
                  <label className="text-xs text-muted-foreground">Modelo</label>
                  <div className="mt-1 rounded-lg border border-border bg-background px-3 py-2 text-sm">GPT-5.2 · OpenAI</div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Prompt</label>
                  <Textarea rows={5} defaultValue="Você é um SDR especialista em imóveis de alto padrão. Qualifique o lead com perguntas sobre orçamento, região e prazo. Retorne um score de 0-100." className="mt-1 bg-background border-border text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground">Temperatura</label>
                    <Input defaultValue="0.6" className="mt-1 bg-background border-border" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Máx. tokens</label>
                    <Input defaultValue="500" className="mt-1 bg-background border-border" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Base de conhecimento</label>
                  <div className="mt-1 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-sm flex items-center gap-2">
                    <Database className="h-4 w-4 text-primary-glow" /> Catálogo Imóveis Q1 2026
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="text-xs text-muted-foreground">Conteúdo</label>
                  <Textarea rows={4} defaultValue={selected.subtitle} className="mt-1 bg-background border-border text-sm" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Variável de saída</label>
                  <Input defaultValue="{{resposta}}" className="mt-1 bg-background border-border font-mono text-xs" />
                </div>
              </>
            )}
          </div>

          {/* live preview */}
          <div className="border-t border-border p-5">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3">Preview da conversa</div>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {sampleChat.map((m, i) => (
                <div key={i} className={`text-xs px-3 py-2 rounded-2xl max-w-[85%] ${m.from === "bot" ? "bg-secondary rounded-tl-sm" : "gradient-primary text-primary-foreground ml-auto rounded-tr-sm"}`}>
                  {m.text}
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
