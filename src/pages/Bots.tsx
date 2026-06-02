import { useState } from "react";
import { bots } from "@/lib/mock";
import { Plus, MoreVertical, Copy, Archive, Send, Edit3, Download, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const statusStyle: Record<string, string> = {
  ativo: "bg-success/15 text-success border-success/30",
  rascunho: "bg-warning/15 text-warning border-warning/30",
  arquivado: "bg-muted text-muted-foreground border-border",
};

export default function Bots() {
  const [q, setQ] = useState("");
  const filtered = bots.filter(b => b.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Bots</h1>
          <p className="text-muted-foreground text-sm mt-1">{bots.length} agentes no workspace</p>
        </div>
        <Button className="gradient-primary text-primary-foreground border-0 shadow-elegant">
          <Plus className="h-4 w-4 mr-1.5" /> Criar bot
        </Button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar bots..." className="pl-9 bg-card/60 border-border" />
        </div>
        <Button variant="outline" className="bg-card/60"><Filter className="h-4 w-4 mr-1.5" /> Filtros</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((b) => (
          <div key={b.id} className="group rounded-2xl border border-border bg-card/60 p-5 hover:border-primary/40 hover:shadow-elegant transition relative overflow-hidden">
            <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full gradient-accent opacity-10 group-hover:opacity-20 transition" />
            <div className="relative">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground font-bold font-display shadow-glow">
                    {b.name.charAt(0)}
                  </div>
                  <div>
                    <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium border ${statusStyle[b.status]}`}>
                      <span className="h-1.5 w-1.5 rounded-full bg-current" /> {b.status}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wider">{b.channel}</div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild><Button size="icon" variant="ghost" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem><Edit3 className="h-4 w-4 mr-2" /> Editar</DropdownMenuItem>
                    <DropdownMenuItem><Copy className="h-4 w-4 mr-2" /> Duplicar</DropdownMenuItem>
                    <DropdownMenuItem><Send className="h-4 w-4 mr-2" /> Publicar</DropdownMenuItem>
                    <DropdownMenuItem><Download className="h-4 w-4 mr-2" /> Exportar</DropdownMenuItem>
                    <DropdownMenuItem><Archive className="h-4 w-4 mr-2" /> Arquivar</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <h3 className="font-semibold mt-4 text-lg">{b.name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{b.description}</p>

              <div className="mt-5 grid grid-cols-2 gap-3 pt-4 border-t border-border">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Conversas</div>
                  <div className="font-display text-xl font-bold mt-0.5">{b.conversations.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Conversões</div>
                  <div className="font-display text-xl font-bold mt-0.5 text-success">{b.conversions.toLocaleString()}</div>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <Link to={`/app/builder/${b.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full bg-secondary/40">Abrir builder</Button>
                </Link>
                <Link to={`/bot/${b.id}`} target="_blank">
                  <Button size="sm" className="gradient-primary text-primary-foreground border-0">Preview</Button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
