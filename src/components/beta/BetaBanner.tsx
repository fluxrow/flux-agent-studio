/**
 * Phase 21 — Discrete Beta banner with feedback / bug / feature channels.
 * Rendered above the app header from AppLayout.
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import { FlaskConical, X, Bug, MessageSquarePlus, Lightbulb } from "lucide-react";

const DISMISS_KEY = "fluxbot.betaBanner.dismissed";

export function BetaBanner() {
  const [dismissed, setDismissed] = useState<boolean>(() => {
    try { return localStorage.getItem(DISMISS_KEY) === "1"; } catch { return false; }
  });

  if (dismissed) return null;

  const dismiss = () => {
    try { localStorage.setItem(DISMISS_KEY, "1"); } catch { /* noop */ }
    setDismissed(true);
  };

  return (
    <div className="relative z-30 border-b border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
      <div className="flex flex-wrap items-center gap-3 px-4 py-2 text-xs">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 text-primary-glow font-semibold px-2 py-0.5">
          <FlaskConical className="h-3 w-3" /> FluxBot Beta
        </span>
        <span className="text-muted-foreground hidden sm:inline">
          Estamos em beta — sua opinião molda o produto.
        </span>
        <div className="ml-auto flex items-center gap-1">
          <Link
            to="/beta"
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-muted-foreground hover:text-foreground hover:bg-background/60"
          >
            <MessageSquarePlus className="h-3 w-3" /> Feedback
          </Link>
          <Link
            to="/beta"
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-muted-foreground hover:text-foreground hover:bg-background/60"
          >
            <Bug className="h-3 w-3" /> Reportar bug
          </Link>
          <Link
            to="/beta"
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-muted-foreground hover:text-foreground hover:bg-background/60"
          >
            <Lightbulb className="h-3 w-3" /> Pedir recurso
          </Link>
          <button
            onClick={dismiss}
            aria-label="Fechar"
            className="ml-1 rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-background/60"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
