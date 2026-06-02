import { useState } from "react";
import { Sparkles, Plus, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTemplates } from "@/domain/hooks";
import { PageHeader } from "@/components/shared/PageHeader";

const cats = ["Todos", "SDR", "Imobiliária", "Turismo", "Consórcio", "Clínicas", "Eventos", "E-commerce", "Suporte"];

export default function Templates() {
  const [cat, setCat] = useState("Todos");
  const [q, setQ] = useState("");
  const { data: templates = [], isLoading } = useTemplates();
  const list = templates.filter(
    (t) => (cat === "Todos" || t.category === cat) && t.name.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      <PageHeader
        title="Templates"
        description="Biblioteca de bots prontos. Instale em 1 clique."
      />

      <div className="flex gap-3 flex-wrap items-center">
        <div className="relative flex-1 min-w-64 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar templates..." className="pl-9 bg-card/60 border-border" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {cats.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`px-3 py-1.5 text-xs rounded-full border transition ${
                cat === c
                  ? "gradient-primary text-primary-foreground border-transparent shadow-elegant"
                  : "border-border bg-card/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {list.map((t) => (
            <div key={t.id} className="group rounded-2xl border border-border bg-card/60 overflow-hidden hover:border-primary/40 hover:shadow-elegant transition">
              <div className={`h-32 bg-gradient-to-br ${t.gradient} relative grid-bg`}>
                <div className="absolute inset-0 bg-background/20" />
                <div className="absolute bottom-3 left-3 text-[10px] uppercase tracking-widest bg-background/70 backdrop-blur px-2 py-0.5 rounded-full">
                  {t.category}
                </div>
                <div className="absolute top-3 right-3 h-8 w-8 rounded-lg bg-background/80 backdrop-blur flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-primary-glow" />
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-semibold">{t.name}</h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{t.description}</p>
                <Button size="sm" className="w-full mt-4 gradient-primary text-primary-foreground border-0">
                  <Plus className="h-3.5 w-3.5 mr-1.5" /> Instalar template
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
