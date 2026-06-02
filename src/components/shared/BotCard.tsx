import { Link } from "react-router-dom";
import { MoreVertical, Copy, Archive, Send, Edit3, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const statusStyle: Record<string, string> = {
  ativo: "bg-success/15 text-success border-success/30",
  rascunho: "bg-warning/15 text-warning border-warning/30",
  arquivado: "bg-muted text-muted-foreground border-border",
};

export interface BotCardData {
  id: string;
  name: string;
  description: string;
  channel: string;
  status: string;
  conversations: number;
  conversions: number;
}

export function BotCard({ bot }: { bot: BotCardData }) {
  return (
    <div className="group rounded-2xl border border-border bg-card/60 p-5 hover:border-primary/40 hover:shadow-elegant transition relative overflow-hidden">
      <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full gradient-accent opacity-10 group-hover:opacity-20 transition" />
      <div className="relative">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground font-bold font-display shadow-glow">
              {bot.name.charAt(0)}
            </div>
            <div>
              <div
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium border ${statusStyle[bot.status] ?? statusStyle.rascunho}`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current" /> {bot.status}
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wider">
                {bot.channel}
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem><Edit3 className="h-4 w-4 mr-2" /> Editar</DropdownMenuItem>
              <DropdownMenuItem><Copy className="h-4 w-4 mr-2" /> Duplicar</DropdownMenuItem>
              <DropdownMenuItem><Send className="h-4 w-4 mr-2" /> Publicar</DropdownMenuItem>
              <DropdownMenuItem><Download className="h-4 w-4 mr-2" /> Exportar</DropdownMenuItem>
              <DropdownMenuItem><Archive className="h-4 w-4 mr-2" /> Arquivar</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <h3 className="font-semibold mt-4 text-lg">{bot.name}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{bot.description}</p>

        <div className="mt-5 grid grid-cols-2 gap-3 pt-4 border-t border-border">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Conversas</div>
            <div className="font-display text-xl font-bold mt-0.5">{bot.conversations.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Conversões</div>
            <div className="font-display text-xl font-bold mt-0.5 text-success">{bot.conversions.toLocaleString()}</div>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <Link to={`/builder/${bot.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full bg-secondary/40">Abrir builder</Button>
          </Link>
          <Link to={`/bot/${bot.id}`} target="_blank">
            <Button size="sm" className="gradient-primary text-primary-foreground border-0">Preview</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
