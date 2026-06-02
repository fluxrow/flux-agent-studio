import { useState } from "react";
import { Sparkles, Play, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { runAiBlock, listAIProviders } from "@/ai";
import type { AIProviderId, AIOutputSchema, AIBlockConfig } from "@/ai/types";
import { AIInspectorPanel } from "@/components/builder/AIInspectorPanel";

export default function AIPlayground() {
  const providers = listAIProviders();
  const [providerId, setProviderId] = useState<AIProviderId>("openai");
  const [modelId, setModelId] = useState<string>(providers[0].defaultModel);
  const [prompt, setPrompt] = useState("Resuma este lead em uma frase.");
  const [schemaText, setSchemaText] = useState<string>("");
  const [temperature, setTemperature] = useState(0.7);
  const [running, setRunning] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const provider = providers.find((p) => p.id === providerId)!;

  const onRun = async () => {
    setRunning(true);
    setLastError(null);
    let outputSchema: AIOutputSchema | undefined;
    if (schemaText.trim()) {
      try {
        outputSchema = JSON.parse(schemaText) as AIOutputSchema;
      } catch (err: any) {
        setLastError("Schema JSON inválido: " + err.message);
        setRunning(false);
        return;
      }
    }
    const cfg: AIBlockConfig = { prompt, provider: providerId, model: modelId, temperature, outputSchema };
    const res = await runAiBlock({ config: cfg });
    if (!res.ok) setLastError(res.error ?? "Falha.");
    setRunning(false);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1400px] mx-auto">
      <div>
        <div className="text-xs uppercase tracking-widest text-primary-glow font-medium">Intelligence</div>
        <h1 className="font-display text-3xl font-bold mt-1.5 flex items-center gap-2">
          <Sparkles className="h-7 w-7 text-primary-glow" /> AI Playground
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Teste prompts e schemas direto contra os providers sem alterar nenhum flow. Cada execução aparece no Inspector.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.3fr,1fr] gap-6">
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Provider</label>
              <Select value={providerId} onValueChange={(v) => {
                const next = v as AIProviderId;
                setProviderId(next);
                setModelId(providers.find((p) => p.id === next)!.defaultModel);
              }}>
                <SelectTrigger className="mt-1 bg-background border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {providers.map((p) => <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Modelo</label>
              <Select value={modelId} onValueChange={setModelId}>
                <SelectTrigger className="mt-1 bg-background border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {provider.models.map((m) => <SelectItem key={m.id} value={m.id}>{m.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Temperature</label>
              <Input type="number" min={0} max={2} step={0.1} value={temperature}
                onChange={(e) => setTemperature(Number(e.target.value))}
                className="mt-1 bg-background border-border" />
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground">Prompt</label>
            <Textarea rows={8} value={prompt} onChange={(e) => setPrompt(e.target.value)}
              className="mt-1 bg-background border-border font-mono text-sm" />
          </div>

          <div>
            <label className="text-xs text-muted-foreground">Output schema (JSON, opcional)</label>
            <Textarea
              rows={6}
              value={schemaText}
              onChange={(e) => setSchemaText(e.target.value)}
              placeholder={`{\n  "cidade": "string",\n  "orcamento": "number",\n  "interesse": { "type": "string", "enum": ["alto","medio","baixo"] }\n}`}
              className="mt-1 bg-background border-border font-mono text-xs"
            />
          </div>

          {lastError && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-xs text-destructive">
              {lastError}
            </div>
          )}

          <div className="flex justify-end">
            <Button disabled={running} onClick={onRun}
              className="gradient-primary text-primary-foreground border-0">
              {running ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Play className="h-4 w-4 mr-1.5" />}
              Rodar
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card/60 p-4">
          <AIInspectorPanel />
        </div>
      </div>
    </div>
  );
}
