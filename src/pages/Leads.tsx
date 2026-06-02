import { leads, stages } from "@/lib/mock";
import { Plus, Flame, Snowflake, Thermometer, MoreHorizontal, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

const tempIcon = { quente: Flame, morno: Thermometer, frio: Snowflake } as const;
const tempColor = { quente: "text-destructive", morno: "text-warning", frio: "text-accent" } as const;

export default function Leads() {
  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1700px] mx-auto">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Leads</h1>
          <p className="text-muted-foreground text-sm mt-1">Pipeline CRM · {leads.length} leads</p>
        </div>
        <Button className="gradient-primary text-primary-foreground border-0 shadow-elegant"><Plus className="h-4 w-4 mr-1.5" /> Novo lead</Button>
      </div>

      <div className="grid grid-cols-5 gap-3 min-w-0">
        {stages.map((s) => {
          const items = leads.filter(l => l.stage === s.id);
          return (
            <div key={s.id} className="flex flex-col rounded-2xl border border-border bg-card/40 min-h-[600px]">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full bg-${s.color}`} />
                  <span className="font-semibold text-sm">{s.label}</span>
                  <span className="text-xs text-muted-foreground">{items.length}</span>
                </div>
                <Button size="icon" variant="ghost" className="h-7 w-7"><Plus className="h-4 w-4" /></Button>
              </div>
              <div className="p-2 space-y-2 flex-1">
                {items.map((l) => {
                  const TempIcon = tempIcon[l.temperature];
                  return (
                    <div key={l.id} className="rounded-xl border border-border bg-background/60 p-3 hover:border-primary/40 hover:shadow-card transition cursor-pointer">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-lg gradient-accent flex items-center justify-center text-xs font-bold text-background">
                            {l.name.split(" ").map(n=>n[0]).slice(0,2).join("")}
                          </div>
                          <div>
                            <div className="text-sm font-medium">{l.name}</div>
                            <div className="text-[10px] text-muted-foreground">{l.bot}</div>
                          </div>
                        </div>
                        <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      <div className="mt-2.5 flex items-center justify-between">
                        <div className={`inline-flex items-center gap-1 text-[10px] ${tempColor[l.temperature]}`}>
                          <TempIcon className="h-3 w-3" /> {l.temperature}
                        </div>
                        <div className="text-xs font-mono font-semibold">
                          <span className="text-primary-glow">{l.score}</span><span className="text-muted-foreground">/100</span>
                        </div>
                      </div>
                      <div className="mt-2 h-1 rounded-full bg-secondary overflow-hidden">
                        <div className="h-full gradient-primary" style={{ width: `${l.score}%` }} />
                      </div>
                      <div className="mt-2.5 pt-2 border-t border-border flex gap-2 text-[10px] text-muted-foreground">
                        <span className="inline-flex items-center gap-1"><Mail className="h-3 w-3" /> {l.source}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
