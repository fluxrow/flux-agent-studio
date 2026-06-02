/**
 * Inline preview that runs the Runtime Engine on the Builder's current Flow.
 *
 * Phase 9: presentation goes through the renderer registry — the Builder
 * can swap between WhatsApp / Instagram / Messenger / ChatGPT / Form
 * without touching the engine.
 */
import { useState } from "react";
import { Play, RotateCcw, Bot as BotIcon, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEngine } from "@/hooks/useEngine";
import { RuntimeInspector } from "@/components/runtime/RuntimeInspector";
import { useBuilder } from "@/builder/BuilderContext";
import { toRuntimeFlow } from "@/runtime";
import { getRenderer, listRenderers, type RendererId } from "@/renderers";

export function PreviewPanel({ onClose }: { onClose: () => void }) {
  const { serialized, validation } = useBuilder();
  const runtimeFlow = toRuntimeFlow(serialized);
  const { engine, state } = useEngine(runtimeFlow);

  const [mode, setMode] = useState<RendererId>("whatsapp");
  const renderer = getRenderer(mode);
  const Renderer = renderer.Component;

  const status = state?.context.status ?? "idle";
  const blocked = !validation.valid;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur flex items-center justify-center p-4">
      <div className="w-full max-w-6xl h-[min(90vh,800px)] rounded-2xl border border-border bg-card shadow-elegant flex flex-col overflow-hidden">
        <header className="flex items-center justify-between px-5 py-3 border-b border-border gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center shadow-glow">
              <BotIcon className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <div className="text-sm font-semibold">Builder Preview · Runtime ao vivo</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                {runtimeFlow.blocks.length} blocos · {runtimeFlow.connections.length} conexões · render {renderer.label}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {listRenderers().map((r) => (
              <button
                key={r.id}
                onClick={() => setMode(r.id as RendererId)}
                className={`text-[11px] px-2.5 py-1 rounded-full border transition ${
                  r.id === mode
                    ? "bg-primary/20 border-primary/40 text-primary-glow"
                    : "bg-background/40 border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {r.label}
              </button>
            ))}
            <Button size="sm" variant="outline" onClick={() => engine?.start()} disabled={blocked}>
              {status === "idle" ? <Play className="h-4 w-4 mr-1.5" /> : <RotateCcw className="h-4 w-4 mr-1.5" />}
              {status === "idle" ? "Iniciar" : "Reiniciar"}
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={onClose}>
              <XCircle className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] flex-1 min-h-0">
          <section className="flex flex-col min-h-0 border-r border-border bg-background/40">
            {blocked && (
              <div className="text-center text-xs text-destructive py-2 border-b border-border">
                Corrija os erros de validação antes de executar o preview.
              </div>
            )}
            <div className="flex-1 min-h-0 p-4">
              <div className="h-full rounded-2xl overflow-hidden border border-border">
                <Renderer
                  engine={engine}
                  state={state}
                  theme={renderer.defaultTheme}
                  typing={{ mode: "realistic", msPerChar: 24, minDelayMs: 400, maxDelayMs: 2200 }}
                  delay={{ mode: "random", randomMinMs: 150, randomMaxMs: 500 }}
                  title="Builder Preview"
                  onSubmitInput={(v) => engine?.submitInput(v)}
                  onSubmitChoice={(o) => engine?.submitChoice(o)}
                />
              </div>
            </div>
          </section>

          <aside className="overflow-y-auto p-4 bg-background/30">
            <RuntimeInspector state={state} />
          </aside>
        </div>
      </div>
    </div>
  );
}
