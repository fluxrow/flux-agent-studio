import { MousePointer2, Workflow } from "lucide-react";

/**
 * Visual empty state shown over the canvas when the flow has no blocks.
 * Includes an arrow visually pointing toward the palette (left side).
 */
export function CanvasEmptyState() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-6">
      <div className="flex items-center gap-8 max-w-xl">
        {/* Arrow pointing to palette */}
        <div className="hidden md:flex flex-col items-center text-primary-glow shrink-0">
          <svg width="80" height="60" viewBox="0 0 80 60" fill="none" aria-hidden>
            <path
              d="M75 30 C 50 30, 30 30, 10 30"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="6 4"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M16 22 L 6 30 L 16 38"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">
            Paleta
          </span>
        </div>

        <div className="text-center">
          <div className="h-16 w-16 rounded-2xl gradient-primary mx-auto flex items-center justify-center shadow-glow mb-4">
            <Workflow className="h-7 w-7 text-primary-foreground" />
          </div>
          <h2 className="font-display text-xl font-semibold">
            Comece construindo seu agente
          </h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
            Arraste um bloco da paleta à esquerda para iniciar o fluxo.
          </p>
          <div className="mt-4 inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <MousePointer2 className="h-3 w-3" />
            Dica: comece com um bloco de Mensagem.
          </div>
        </div>
      </div>
    </div>
  );
}
