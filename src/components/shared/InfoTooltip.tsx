/**
 * InfoTooltip — global, reusable explanation chip for metrics & widgets.
 *
 * Renders a tiny "info" icon that, on hover/focus, shows a short
 * explanation. Built on the shadcn Tooltip (already wrapped by
 * <TooltipProvider /> in App.tsx) so it works everywhere out of the box.
 *
 * Usage:
 *   <InfoTooltip label="Conversões" content="Leads que avançaram para 'vendido'." />
 *   <InfoTooltip>Texto curto explicando a métrica.</InfoTooltip>
 */
import { Info } from "lucide-react";
import { ReactNode } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface InfoTooltipProps {
  /** Optional aria-label for the trigger (defaults to "Mais informações"). */
  label?: string;
  /** Tooltip body. Pass via prop OR via children. */
  content?: ReactNode;
  children?: ReactNode;
  /** Side of the tooltip. */
  side?: "top" | "right" | "bottom" | "left";
  /** Extra classes on the trigger button. */
  className?: string;
  /** Icon size in px (default 12). */
  iconSize?: number;
}

export function InfoTooltip({
  label = "Mais informações",
  content,
  children,
  side = "top",
  className,
  iconSize = 12,
}: InfoTooltipProps) {
  const body = content ?? children;
  if (!body) return null;
  return (
    <Tooltip delayDuration={150}>
      <TooltipTrigger
        type="button"
        aria-label={label}
        className={cn(
          "inline-flex h-4 w-4 items-center justify-center rounded-full text-muted-foreground/70 hover:text-foreground transition focus:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          className,
        )}
      >
        <Info style={{ width: iconSize, height: iconSize }} />
      </TooltipTrigger>
      <TooltipContent side={side} className="max-w-xs text-xs leading-relaxed">
        {body}
      </TooltipContent>
    </Tooltip>
  );
}
