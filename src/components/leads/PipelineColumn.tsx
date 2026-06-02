import { ReactNode } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PipelineColumnProps {
  label: string;
  count: number;
  dotColor: string;
  children: ReactNode;
  onAdd?: () => void;
}

export function PipelineColumn({ label, count, dotColor, children, onAdd }: PipelineColumnProps) {
  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card/40 min-h-[600px]">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${dotColor}`} />
          <span className="font-semibold text-sm">{label}</span>
          <span className="text-xs text-muted-foreground">{count}</span>
        </div>
        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onAdd}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="p-2 space-y-2 flex-1">{children}</div>
    </div>
  );
}
