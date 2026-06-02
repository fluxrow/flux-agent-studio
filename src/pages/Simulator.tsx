import { useEffect, useRef, useState } from "react";
import { Play, RotateCcw, Send, Loader2, Bot as BotIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/shared/PageHeader";
import { useBots, useFlow } from "@/domain/hooks";
import { useEngine } from "@/hooks/useEngine";
import { RuntimeInspector } from "@/components/runtime/RuntimeInspector";
import { EventInspector } from "@/components/runtime/EventInspector";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export default function Simulator() {
  const { data: botsData } = useBots();
  const bots = botsData?.items ?? [];
  const [botId, setBotId] = useState<string>("");

  // Default to first bot once loaded.
  useEffect(() => {
    if (!botId && bots.length > 0) setBotId(bots[0].id);
  }, [bots, botId]);

  const { data: flow, isLoading: loadingFlow } = useFlow(botId);
  const { engine, state } = useEngine(flow ?? null);

  const [draft, setDraft] = useState("");
  const transcriptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    transcriptRef.current?.scrollTo({ top: transcriptRef.current.scrollHeight });
  }, [state?.transcript.length]);

  const status = state?.context.status ?? "idle";
  const awaiting = state?.awaiting;

  const handleStart = () => engine?.start();
  const handleReset = () => engine?.start();

  const submit = () => {
    if (!engine || !draft.trim()) return;
    engine.submitInput(draft.trim());
    setDraft("");
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      <PageHeader
        eyebrow="Runtime"
        title="Session Simulator"
        description="Execute qualquer fluxo mockado sem precisar abrir o builder."
        actions={
          <div className="flex items-center gap-2">
            <Select value={botId} onValueChange={setBotId}>
              <SelectTrigger className="w-[240px] bg-card/60">
                <SelectValue placeholder="Escolha um bot" />
              </SelectTrigger>
              <SelectContent>
                {bots.map((b) => (
                  <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleStart} disabled={!flow} className="gradient-primary text-primary-foreground border-0">
              {status === "idle" ? <Play className="h-4 w-4 mr-1.5" /> : <RotateCcw className="h-4 w-4 mr-1.5" />}
              {status === "idle" ? "Iniciar" : "Reiniciar"}
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        {/* Transcript + input */}
        <section className="rounded-2xl border border-border bg-card/60 flex flex-col min-h-[560px]">
          <header className="flex items-center justify-between px-5 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center shadow-glow">
                <BotIcon className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <div className="text-sm font-semibold">
                  {bots.find((b) => b.id === botId)?.name ?? "Selecione um bot"}
                </div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  {flow ? `${flow.blocks.length} blocos · ${flow.connections.length} conexões` : "—"}
                </div>
              </div>
            </div>
          </header>

          <div ref={transcriptRef} className="flex-1 overflow-y-auto p-6 space-y-3 bg-background/40">
            {loadingFlow && (
              <div className="flex items-center justify-center py-10 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            )}
            {!loadingFlow && status === "idle" && (
              <div className="text-center text-sm text-muted-foreground py-10">
                Clique em <strong className="text-foreground">Iniciar</strong> para executar o fluxo.
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

        {/* Inspector + Events */}
        <aside>
          <Tabs defaultValue="state">
            <TabsList className="w-full grid grid-cols-2 bg-secondary/40">
              <TabsTrigger value="state">State</TabsTrigger>
              <TabsTrigger value="events">Events</TabsTrigger>
            </TabsList>
            <TabsContent value="state" className="mt-3">
              <RuntimeInspector state={state} />
            </TabsContent>
            <TabsContent value="events" className="mt-3">
              <EventInspector sessionId={state?.context.sessionId ?? null} />
            </TabsContent>
          </Tabs>
        </aside>
      </div>
    </div>
  );
}
