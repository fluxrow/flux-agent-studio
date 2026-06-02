import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/30 p-10 flex flex-col items-center text-center">
      {Icon && (
        <div className="h-12 w-12 rounded-2xl gradient-primary flex items-center justify-center shadow-glow mb-4">
          <Icon className="h-5 w-5 text-primary-foreground" />
        </div>
      )}
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
