/**
 * Inline preview that runs the Runtime Engine on the Builder's current Flow.
 * Replaces mocked transcripts — there is no intermediate fixture.
 */
import { useEffect, useRef, useState } from "react";
import { Play, RotateCcw, Send, Bot as BotIcon, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEngine } from "@/hooks/useEngine";
import { RuntimeInspector } from "@/components/runtime/RuntimeInspector";
import { useBuilder } from "@/builder/BuilderContext";
import { toRuntimeFlow } from "@/runtime";
import { cn } from "@/lib/utils";

export function PreviewPanel({ onClose }: { onClose: () => void }) {
  const { serialized, validation } = useBuilder();
  const runtimeFlow = toRuntimeFlow(serialized);
  const { engine, state } = useEngine(runtimeFlow);

  const [draft, setDraft] = useState("");
  const transcriptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    transcriptRef.current?.scrollTo({ top: transcriptRef.current.scrollHeight });
  }, [state?.transcript.length]);

  const status = state?.context.status ?? "idle";
  const awaiting = state?.awaiting;

  const submit = () => {
    if (!engine || !draft.trim()) return;
    engine.submitInput(draft.trim());
    setDraft("");
  };

  const blocked = !validation.valid;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur flex items-center justify-center p-4">
      <div className="w-full max-w-6xl h-[min(90vh,800px)] rounded-2xl border border-border bg-card shadow-elegant flex flex-col overflow-hidden">
        <header className="flex items-center justify-between px-5 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center shadow-glow">
              <BotIcon className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <div className="text-sm font-semibold">Builder Preview · Runtime ao vivo</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                {runtimeFlow.blocks.length} blocos · {runtimeFlow.connections.length} conexões
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
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
          <section className="flex flex-col min-h-0 border-r border-border">
            <div ref={transcriptRef} className="flex-1 overflow-y-auto p-6 space-y-3 bg-background/40">
              {blocked && (
                <div className="text-center text-xs text-destructive py-2">
                  Corrija os erros de validação antes de executar o preview.
                </div>
              )}
              {!blocked && status === "idle" && (
                <div className="text-center text-sm text-muted-foreground py-10">
                  Clique em <strong className="text-foreground">Iniciar</strong> para executar este fluxo.
                </div>
              )}
              {state?.transcript.map((item, i) => {
                if (item.kind === "system") {
                  return (
                    <div key={i} className="text-center text-[10px] uppercase tracking-widest text-muted-foreground py-1">
                      {item.text}
                    </div>
                  );
                }
                const isUser = item.kind === "user";
                return (
                  <div key={i} className={cn("flex", isUser ? "justify-end" : "justify-start")}>
                    <div
                      className={cn(
                        "px-4 py-2.5 max-w-md text-sm rounded-2xl",
                        isUser
                          ? "gradient-primary text-primary-foreground rounded-tr-sm shadow-glow"
                          : "bg-secondary rounded-tl-sm",
                      )}
                    >
                      {item.text}
                    </div>
                  </div>
                );
              })}
            </div>

            <footer className="border-t border-border p-4">
              {status === "awaiting_choice" && awaiting ? (
                <div className="flex flex-wrap gap-2">
                  {((awaiting.config.options as string[] | undefined) ?? []).map((opt) => (
                    <Button
                      key={opt}
                      size="sm"
                      variant="outline"
                      className="bg-secondary/40"
                      onClick={() => engine?.submitChoice(opt)}
                    >
                      {opt}
                    </Button>
                  ))}
                </div>
              ) : status === "awaiting_input" ? (
                <div className="flex items-center gap-2">
                  <Input
                    autoFocus
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && submit()}
                    placeholder="Digite uma resposta..."
                    className="bg-background border-border"
                  />
                  <Button onClick={submit} className="gradient-primary text-primary-foreground border-0">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              ) : status === "ended" ? (
                <div className="text-xs text-success">Fluxo concluído.</div>
              ) : status === "error" ? (
                <div className="text-xs text-destructive">{state?.context.error}</div>
              ) : (
                <div className="text-xs text-muted-foreground">Aguardando início…</div>
              )}
            </footer>
          </section>

          <aside className="overflow-y-auto p-4 bg-background/30">
            <RuntimeInspector state={state} />
          </aside>
        </div>
      </div>
    </div>
  );
}
