import { Sparkles, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { listAIProviders } from "@/ai";
import type { Block } from "@/types";
import type { AIBlockConfig, AIBlockVariableMapping, AIOutputSchema, AIProviderId } from "@/ai/types";

export function AIBlockEditor({
  block,
  onChange,
}: {
  block: Block;
  onChange: (config: Partial<Block["config"]>) => void;
}) {
  const cfg = block.config as AIBlockConfig;
  const providers = listAIProviders();
  const providerId = (cfg.provider ?? providers[0].id) as AIProviderId;
  const provider = providers.find((p) => p.id === providerId) ?? providers[0];

  const updateSchema = (next: AIOutputSchema) => onChange({ outputSchema: next as any });
  const schema = (cfg.outputSchema ?? {}) as AIOutputSchema;
  const schemaEntries = Object.entries(schema);

  const updateMapping = (next: AIBlockVariableMapping[]) => onChange({ mappings: next as any });
  const mappings = cfg.mappings ?? [];

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-primary/30 bg-primary/5 p-3 flex items-center gap-2 text-xs text-primary-glow">
        <Sparkles className="h-3.5 w-3.5" />
        Bloco IA · executa via Provider Layer (mock).
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-muted-foreground">Provider</label>
          <Select
            value={providerId}
            onValueChange={(v) => onChange({ provider: v as AIProviderId, model: undefined } as any)}
          >
            <SelectTrigger className="mt-1 bg-background border-border text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {providers.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Modelo</label>
          <Select
            value={cfg.model ?? provider.defaultModel}
            onValueChange={(v) => onChange({ model: v } as any)}
          >
            <SelectTrigger className="mt-1 bg-background border-border text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {provider.models.map((m) => (
                <SelectItem key={m.id} value={m.id}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-muted-foreground">Temperature</label>
          <Input
            type="number" min={0} max={2} step={0.1}
            value={cfg.temperature ?? 0.7}
            onChange={(e) => onChange({ temperature: Number(e.target.value) } as any)}
            className="mt-1 bg-background border-border text-xs"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Max tokens</label>
          <Input
            type="number" min={1}
            value={cfg.maxTokens ?? 512}
            onChange={(e) => onChange({ maxTokens: Number(e.target.value) } as any)}
            className="mt-1 bg-background border-border text-xs"
          />
        </div>
      </div>

      <div>
        <label className="text-xs text-muted-foreground">Prompt</label>
        <Textarea
          rows={5}
          value={String(cfg.prompt ?? "")}
          onChange={(e) => onChange({ prompt: e.target.value })}
          placeholder="Use {{variavel}} para interpolar o contexto da conversa."
          className="mt-1 bg-background border-border text-sm font-mono"
        />
      </div>

      <div>
        <label className="text-xs text-muted-foreground">Variável de saída (texto livre)</label>
        <Input
          value={String(cfg.outputVariable ?? "")}
          onChange={(e) => onChange({ outputVariable: e.target.value } as any)}
          placeholder="ex: ai_response"
          className="mt-1 bg-background border-border font-mono text-xs"
        />
        <p className="text-[10px] text-muted-foreground mt-1">
          Quando não houver schema, a resposta é gravada nesta variável.
        </p>
      </div>

      {/* Structured output */}
      <div className="rounded-xl border border-border bg-background/40 p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-[11px] uppercase tracking-widest text-muted-foreground">Structured output</div>
          <Button size="sm" variant="ghost" className="h-7 px-2 text-xs"
            onClick={() => updateSchema({ ...schema, [`campo_${schemaEntries.length + 1}`]: "string" })}>
            <Plus className="h-3 w-3 mr-1" /> Campo
          </Button>
        </div>
        {schemaEntries.length === 0 && (
          <p className="text-[11px] text-muted-foreground">
            Sem schema: o bloco retorna texto livre. Adicione campos para forçar JSON validado.
          </p>
        )}
        {schemaEntries.map(([key, propRaw]) => {
          const prop = typeof propRaw === "string" ? { type: propRaw } : propRaw;
          return (
            <div key={key} className="grid grid-cols-[1fr,auto,auto] gap-1.5 items-center">
              <Input
                value={key}
                onChange={(e) => {
                  const next = { ...schema };
                  delete (next as any)[key];
                  (next as any)[e.target.value || key] = prop;
                  updateSchema(next);
                }}
                className="h-7 text-xs font-mono bg-background border-border"
              />
              <Select
                value={prop.type}
                onValueChange={(v) => updateSchema({ ...schema, [key]: { ...prop, type: v as any } })}
              >
                <SelectTrigger className="h-7 text-xs w-24 bg-background border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="string">string</SelectItem>
                  <SelectItem value="number">number</SelectItem>
                  <SelectItem value="boolean">boolean</SelectItem>
                  <SelectItem value="string[]">string[]</SelectItem>
                </SelectContent>
              </Select>
              <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive"
                onClick={() => { const next = { ...schema }; delete (next as any)[key]; updateSchema(next); }}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          );
        })}
      </div>

      {/* Variable mapping */}
      {schemaEntries.length > 0 && (
        <div className="rounded-xl border border-border bg-background/40 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-[11px] uppercase tracking-widest text-muted-foreground">Variable mapping</div>
            <Button size="sm" variant="ghost" className="h-7 px-2 text-xs"
              onClick={() => updateMapping([...mappings, { from: schemaEntries[0]?.[0] ?? "", to: "" }])}>
              <Plus className="h-3 w-3 mr-1" /> Mapeamento
            </Button>
          </div>
          {mappings.length === 0 && (
            <p className="text-[11px] text-muted-foreground">
              Sem mapeamentos explícitos: cada campo do schema vira uma variável com o mesmo nome.
              Use <code>lead.tags</code>, <code>lead.score</code>, etc. para alimentar o CRM.
            </p>
          )}
          {mappings.map((m, i) => (
            <div key={i} className="grid grid-cols-[1fr,auto,1fr,auto] gap-1.5 items-center">
              <Select value={m.from} onValueChange={(v) => {
                const next = [...mappings]; next[i] = { ...m, from: v }; updateMapping(next);
              }}>
                <SelectTrigger className="h-7 text-xs bg-background border-border"><SelectValue placeholder="campo" /></SelectTrigger>
                <SelectContent>
                  {schemaEntries.map(([k]) => <SelectItem key={k} value={k}>{k}</SelectItem>)}
                </SelectContent>
              </Select>
              <span className="text-xs text-muted-foreground">→</span>
              <Input
                value={m.to}
                onChange={(e) => { const next = [...mappings]; next[i] = { ...m, to: e.target.value }; updateMapping(next); }}
                placeholder="variavel ou lead.tags"
                className="h-7 text-xs font-mono bg-background border-border"
              />
              <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive"
                onClick={() => updateMapping(mappings.filter((_, j) => j !== i))}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
