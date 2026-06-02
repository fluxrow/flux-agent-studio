import { conversations, sampleChat } from "@/lib/mock";
import { useState } from "react";
import { Search, MoreVertical, Paperclip, Send, UserCog, StickyNote, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const statusDot: Record<string,string> = {
  ativa: "bg-success",
  encerrada: "bg-muted-foreground",
  humano: "bg-warning",
};

export default function Conversations() {
  const [active, setActive] = useState(conversations[0]);
  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* list */}
      <aside className="w-80 border-r border-border bg-card/40 flex flex-col">
        <div className="p-4 border-b border-border">
          <h1 className="font-display text-xl font-bold mb-3">Conversas</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input placeholder="Buscar..." className="pl-9 h-9 bg-background border-border text-sm" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.map((c) => (
            <button key={c.id} onClick={() => setActive(c)}
              className={`w-full text-left p-4 border-b border-border hover:bg-secondary/40 transition ${active.id===c.id ? "bg-primary/10 border-l-2 border-l-primary" : ""}`}>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="h-10 w-10 rounded-full gradient-accent flex items-center justify-center text-xs font-bold text-background">
                    {c.lead.split(" ").map(n=>n[0]).slice(0,2).join("")}
                  </div>
                  <span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background ${statusDot[c.status]}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate">{c.lead}</span>
                    <span className="text-[10px] text-muted-foreground">{c.time}</span>
                  </div>
                  <div className="text-xs text-muted-foreground truncate">{c.preview}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-primary-glow">{c.bot}</span>
                    {c.unread > 0 && <span className="ml-auto text-[10px] bg-primary text-primary-foreground rounded-full h-4 min-w-4 px-1 flex items-center justify-center">{c.unread}</span>}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* chat */}
      <main className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-card/40">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full gradient-accent flex items-center justify-center text-xs font-bold text-background">
              {active.lead.split(" ").map(n=>n[0]).slice(0,2).join("")}
            </div>
            <div>
              <div className="font-semibold text-sm">{active.lead}</div>
              <div className="text-xs text-muted-foreground">via {active.bot} · <span className="text-success">{active.status}</span></div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="bg-secondary/40"><Sparkles className="h-3.5 w-3.5 mr-1.5" /> Resumo IA</Button>
            <Button size="sm" variant="outline" className="bg-secondary/40"><UserCog className="h-3.5 w-3.5 mr-1.5" /> Transferir</Button>
            <Button size="icon" variant="ghost"><MoreVertical className="h-4 w-4" /></Button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-8 space-y-4 bg-background/40">
          {sampleChat.map((m, i) => (
            <div key={i} className={`flex ${m.from==="user" ? "justify-end" : "justify-start"}`}>
              <div className={`px-4 py-2.5 max-w-md text-sm rounded-2xl ${m.from==="bot" ? "bg-secondary rounded-tl-sm" : "gradient-primary text-primary-foreground rounded-tr-sm shadow-glow"}`}>
                {m.text}
              </div>
            </div>
          ))}
          <div className="flex justify-start">
            <div className="px-4 py-2.5 bg-secondary rounded-2xl rounded-tl-sm">
              <div className="flex gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-pulse" />
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-pulse [animation-delay:200ms]" />
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-pulse [animation-delay:400ms]" />
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-border p-4 bg-card/40">
          <div className="flex items-end gap-2">
            <Button size="icon" variant="ghost" className="text-muted-foreground"><Paperclip className="h-4 w-4" /></Button>
            <Input placeholder="Escreva uma mensagem ou /comando..." className="bg-background border-border" />
            <Button size="icon" variant="ghost" className="text-muted-foreground"><StickyNote className="h-4 w-4" /></Button>
            <Button className="gradient-primary text-primary-foreground border-0"><Send className="h-4 w-4" /></Button>
          </div>
        </div>
      </main>

      {/* sidebar */}
      <aside className="hidden lg:flex w-72 border-l border-border bg-card/40 flex-col">
        <div className="p-5 space-y-5 overflow-y-auto">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Lead score</div>
            <div className="mt-2 flex items-center gap-3">
              <div className="font-display text-3xl font-bold text-primary-glow">87</div>
              <div className="flex-1">
                <div className="h-2 rounded-full bg-secondary overflow-hidden"><div className="h-full gradient-primary" style={{width:"87%"}} /></div>
                <div className="text-xs text-destructive mt-1">🔥 Lead quente</div>
              </div>
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Dados coletados</div>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Nome</span><span>{active.lead}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Origem</span><span>WhatsApp</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Orçamento</span><span>R$ 1.2M</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Região</span><span>Zona Sul / SP</span></div>
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Tags</div>
            <div className="flex flex-wrap gap-1.5">
              {["alto-padrão","financiamento","urgência-alta"].map(t => (
                <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-primary-glow border border-primary/30">{t}</span>
              ))}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Notas internas</div>
            <div className="rounded-lg border border-border bg-background p-3 text-xs text-muted-foreground">
              Cliente já visitou 2 imóveis. Aguardando aprovação de crédito.
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
