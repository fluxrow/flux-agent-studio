import type { ReactNode } from "react";
import { Inbox, AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BaseProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({
  title,
  description,
  action,
  icon,
}: BaseProps & { icon?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/40 p-10 flex flex-col items-center text-center gap-3">
      <div className="h-12 w-12 rounded-full bg-secondary/40 flex items-center justify-center text-muted-foreground">
        {icon ?? <Inbox className="h-5 w-5" />}
      </div>
      <div>
        <div className="font-semibold">{title}</div>
        {description && (
          <div className="text-sm text-muted-foreground mt-1 max-w-sm">
            {description}
          </div>
        )}
      </div>
      {action}
    </div>
  );
}

export function ErrorState({
  title = "Algo deu errado",
  description,
  onRetry,
  retryLabel = "Tentar novamente",
}: Partial<BaseProps> & { onRetry?: () => void; retryLabel?: string }) {
  return (
    <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 flex flex-col items-center text-center gap-3">
      <div className="h-12 w-12 rounded-full bg-destructive/15 flex items-center justify-center text-destructive">
        <AlertTriangle className="h-5 w-5" />
      </div>
      <div>
        <div className="font-semibold">{title}</div>
        {description && (
          <div className="text-sm text-muted-foreground mt-1 max-w-md break-words">
            {description}
          </div>
        )}
      </div>
      {onRetry && (
        <Button size="sm" variant="outline" onClick={onRetry} className="bg-secondary/40">
          <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
          {retryLabel}
        </Button>
      )}
    </div>
  );
}
