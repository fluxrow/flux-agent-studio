/**
 * Phase 21 — Contextual "Isso ajudou?" widget.
 *
 * Drop-in component for docs, onboarding, analytics, builder…
 * One verdict per (surface, topic) per session is persisted; UI then
 * acknowledges with a thank-you state.
 */
import { useEffect, useState } from "react";
import { ThumbsUp, ThumbsDown, Check } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useWorkspace } from "@/auth/WorkspaceProvider";
import { recordContextualFeedback } from "@/beta/contextualFeedback";

interface Props {
  surface: string;
  topic?: string;
  className?: string;
  label?: string;
}

export function ContextualFeedback({ surface, topic, className, label = "Isso ajudou?" }: Props) {
  const { workspace } = useWorkspace();
  const { pathname } = useLocation();
  const wsId = workspace?.id ?? "ws_local_demo";
  const cacheKey = `fluxbot.cf.${surface}.${topic ?? "_"}`;
  const [verdict, setVerdict] = useState<"up" | "down" | null>(null);

  useEffect(() => {
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached === "up" || cached === "down") setVerdict(cached);
    } catch { /* noop */ }
  }, [cacheKey]);

  const submit = (v: "up" | "down") => {
    setVerdict(v);
    try { sessionStorage.setItem(cacheKey, v); } catch { /* noop */ }
    recordContextualFeedback({ surface, topic, verdict: v, workspaceId: wsId, page: pathname });
  };

  if (verdict) {
    return (
      <div className={`inline-flex items-center gap-2 text-xs text-muted-foreground ${className ?? ""}`}>
        <Check className="h-3.5 w-3.5 text-emerald-500" />
        Obrigado pelo feedback!
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 text-xs ${className ?? ""}`}>
      <span className="text-muted-foreground">{label}</span>
      <button
        onClick={() => submit("up")}
        aria-label="Isso ajudou"
        className="inline-flex items-center gap-1 rounded-md border border-border bg-background/40 px-2 py-1 hover:border-emerald-500/40 hover:text-emerald-500 transition"
      >
        <ThumbsUp className="h-3 w-3" /> Sim
      </button>
      <button
        onClick={() => submit("down")}
        aria-label="Não encontrei o que precisava"
        className="inline-flex items-center gap-1 rounded-md border border-border bg-background/40 px-2 py-1 hover:border-destructive/40 hover:text-destructive transition"
      >
        <ThumbsDown className="h-3 w-3" /> Não
      </button>
    </div>
  );
}
