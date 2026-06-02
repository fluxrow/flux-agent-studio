import { Plus, Flame, Snowflake, Thermometer, MoreHorizontal, Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLeadsByStage, usePipelineStages } from "@/domain/hooks";
import { PageHeader } from "@/components/shared/PageHeader";
import { PipelineColumn } from "@/components/leads/PipelineColumn";

const tempIcon = { quente: Flame, morno: Thermometer, frio: Snowflake } as const;
const tempColor = { quente: "text-destructive", morno: "text-warning", frio: "text-accent" } as const;
const stageDot: Record<string, string> = {
  novo: "bg-muted-foreground",
  qualificado: "bg-accent",
  negociacao: "bg-warning",
  convertido: "bg-success",
  perdido: "bg-destructive",
};

export default function Leads() {
  const { data: stages = [] } = usePipelineStages();
  const { data: byStage, isLoading } = useLeadsByStage();
  const total = byStage ? Object.values(byStage).reduce((a, l) => a + l.length, 0) : 0;

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1700px] mx-auto">
      <PageHeader
        title="Leads"
        description={`Pipeline CRM · ${total} leads`}
        actions={
          <Button className="gradient-primary text-primary-foreground border-0 shadow-elegant">
            <Plus className="h-4 w-4 mr-1.5" /> Novo lead
          </Button>
        }
      />

      {isLoading || !byStage ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-5 gap-3 min-w-0">
          {stages.map((s) => {
            const items = byStage[s.id] ?? [];
            return (
              <PipelineColumn key={s.id} label={s.label} count={items.length} dotColor={stageDot[s.id]}>
                {items.map((l) => {
                  const TempIcon = tempIcon[l.temperature];
                  return (
                    <div key={l.id} className="rounded-xl border border-border bg-background/60 p-3 hover:border-primary/40 hover:shadow-card transition cursor-pointer">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-lg gradient-accent flex items-center justify-center text-xs font-bold text-background">
                            {l.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                          </div>
                          <div>
                            <div className="text-sm font-medium">{l.name}</div>
                            <div className="text-[10px] text-muted-foreground">{l.botName}</div>
                          </div>
                        </div>
                        <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      <div className="mt-2.5 flex items-center justify-between">
                        <div className={`inline-flex items-center gap-1 text-[10px] ${tempColor[l.temperature]}`}>
                          <TempIcon className="h-3 w-3" /> {l.temperature}
                        </div>
                        <div className="text-xs font-mono font-semibold">
                          <span className="text-primary-glow">{l.score}</span>
                          <span className="text-muted-foreground">/100</span>
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
              </PipelineColumn>
            );
          })}
        </div>
      )}
    </div>
  );
}
