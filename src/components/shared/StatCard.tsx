import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  delta?: string;
  trend?: "up" | "down" | "neutral";
  icon?: LucideIcon;
  hint?: string;
}

export function StatCard({ label, value, delta, trend = "neutral", icon: Icon, hint }: StatCardProps) {
  const trendCls =
    trend === "up" ? "text-success" : trend === "down" ? "text-destructive" : "text-muted-foreground";

  return (
    <div className="rounded-2xl border border-border bg-card/60 p-5 hover:border-primary/30 transition">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
          {label}
        </span>
        {Icon && (
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="h-4 w-4 text-primary-glow" />
          </div>
        )}
      </div>
      <div className="mt-3 font-display text-3xl font-bold">{value}</div>
      <div className="mt-1 flex items-center gap-2 text-xs">
        {delta && <span className={cn("font-medium", trendCls)}>{delta}</span>}
        {hint && <span className="text-muted-foreground">{hint}</span>}
      </div>
    </div>
  );
}
