import { useEffect, useState } from "react";
import { Play, X } from "lucide-react";

const STORAGE_KEY = "fluxbot.builder.previewHint.v1";

interface Props {
  show: boolean;
  onDismiss: () => void;
}

/**
 * One-time tooltip pointing toward the Preview button after the user
 * creates their first block.
 */
export function PreviewHint({ show, onDismiss }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!show) return;
    if (typeof window === "undefined") return;
    if (localStorage.getItem(STORAGE_KEY)) return;
    const t = setTimeout(() => setVisible(true), 600);
    return () => clearTimeout(t);
  }, [show]);

  if (!visible) return null;

  const close = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
    onDismiss();
  };

  return (
    <div className="fixed top-16 right-[19rem] z-40 w-72 rounded-2xl border border-primary/40 bg-card shadow-glow p-3 animate-in fade-in slide-in-from-top-2">
      <div className="flex items-start gap-2">
        <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center shrink-0">
          <Play className="h-3.5 w-3.5 text-primary-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold">Primeiro bloco criado</div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Quer ver como seu agente ficará para o usuário? Clique em Preview.
          </p>
        </div>
        <button onClick={close} className="text-muted-foreground hover:text-foreground" aria-label="Fechar dica">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
