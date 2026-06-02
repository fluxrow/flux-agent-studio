import { useParams, Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Send, Sparkles, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";

const flow: { from: "bot" | "user"; text: string; options?: string[] }[] = [
  { from: "bot", text: "Olá! 👋 Sou o assistente da FluxBot Imóveis. Posso te ajudar a encontrar o imóvel ideal." },
  { from: "bot", text: "Você procura um imóvel para:", options: ["Morar", "Investir", "Alugar"] },
  { from: "user", text: "Morar" },
  { from: "bot", text: "Ótimo! Qual é seu nome?" },
  { from: "user", text: "Mariana" },
  { from: "bot", text: "Prazer, Mariana 😊 Em qual região você gostaria?" },
  { from: "user", text: "Zona Sul de São Paulo" },
  { from: "bot", text: "Qual é o seu orçamento aproximado?", options: ["Até R$ 500k", "R$ 500k - 1M", "Acima de R$ 1M"] },
];

export default function PublicBot() {
  const { slug } = useParams();
  const [visible, setVisible] = useState(1);
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (visible >= flow.length) return;
    const delay = flow[visible].from === "bot" ? 1100 : 800;
    setTyping(flow[visible].from === "bot");
    const t = setTimeout(() => { setVisible(v=>v+1); setTyping(false); }, delay);
    return () => clearTimeout(t);
  }, [visible]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [visible, typing]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-20" />
      <div className="absolute inset-0" style={{background: "var(--gradient-glow)"}} />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-4">
          <Link to="/" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
            <div className="h-5 w-5 rounded-md gradient-primary flex items-center justify-center"><Sparkles className="h-3 w-3 text-primary-foreground" /></div>
            powered by FluxBot
          </Link>
        </div>

        <div className="rounded-3xl border border-border bg-card/80 backdrop-blur-xl shadow-elegant overflow-hidden">
          {/* header */}
          <div className="flex items-center gap-3 p-4 border-b border-border bg-gradient-to-r from-primary/20 to-accent/10">
            <div className="relative">
              <div className="h-11 w-11 rounded-full gradient-primary flex items-center justify-center shadow-glow"><Bot className="h-5 w-5 text-primary-foreground" /></div>
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-success border-2 border-card animate-pulse" />
            </div>
            <div>
              <div className="font-semibold">FluxBot Imóveis</div>
              <div className="text-[10px] text-muted-foreground">Online · responde em segundos</div>
            </div>
            <div className="ml-auto text-[10px] font-mono text-muted-foreground">/bot/{slug}</div>
          </div>

          {/* chat */}
          <div className="h-[440px] overflow-y-auto p-4 space-y-3 bg-background/40">
            {flow.slice(0, visible).map((m, i) => (
              <div key={i} className={`animate-fade-in flex flex-col gap-2 ${m.from==="user"?"items-end":"items-start"}`}>
                <div className={`px-4 py-2.5 max-w-[85%] text-sm rounded-2xl ${m.from==="bot" ? "bg-secondary rounded-tl-sm" : "gradient-primary text-primary-foreground rounded-tr-sm shadow-glow"}`}>
                  {m.text}
                </div>
                {m.options && (
                  <div className="flex flex-wrap gap-2 max-w-[85%]">
                    {m.options.map(opt => (
                      <button key={opt} className="text-xs px-3 py-1.5 rounded-full border border-primary/40 bg-primary/5 text-primary-glow hover:bg-primary/15 transition">{opt}</button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {typing && (
              <div className="flex">
                <div className="px-4 py-3 bg-secondary rounded-2xl rounded-tl-sm">
                  <div className="flex gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-pulse" />
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-pulse [animation-delay:200ms]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-pulse [animation-delay:400ms]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* composer */}
          <div className="flex items-center gap-2 p-3 border-t border-border bg-card/80">
            <input className="flex-1 bg-background border border-border rounded-full px-4 py-2 text-sm outline-none focus:border-primary" placeholder="Digite sua resposta..." />
            <Button size="icon" className="rounded-full gradient-primary text-primary-foreground border-0"><Send className="h-4 w-4" /></Button>
          </div>
        </div>
      </div>
    </div>
  );
}
