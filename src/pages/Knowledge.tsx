import { useEffect, useMemo, useRef, useState } from "react";
import {
  BookOpen, Database, FileText, Globe, Loader2, Plus, Search, Sparkles, Trash2, Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useWorkspace } from "@/auth/WorkspaceProvider";
import {
  knowledgeStore, knowledgeCost, createKnowledgeBase, ingestDocument,
  retrieveKnowledge,
} from "@/knowledge";
import type {
  KnowledgeBase, KnowledgeDocument, KnowledgeSearchResult, KnowledgeSourceKind,
} from "@/knowledge/types";

export default function Knowledge() {
  const { workspace } = useWorkspace();
  const workspaceId = workspace?.id ?? "ws_local_demo";
  const [tick, setTick] = useState(0);
  useEffect(() => { const u = knowledgeStore.subscribe(() => setTick((t) => t + 1)); return () => { u(); }; }, []);
  useEffect(() => { const u = knowledgeCost.subscribe(() => setTick((t) => t + 1)); return () => { u(); }; }, []);

  const bases = useMemo(() => knowledgeStore.listBases(workspaceId), [workspaceId, tick]);
  const [activeBaseId, setActiveBaseId] = useState<string | null>(null);
  useEffect(() => {
    if (!activeBaseId && bases.length) setActiveBaseId(bases[0].id);
  }, [bases, activeBaseId]);
  const activeBase: KnowledgeBase | undefined = bases.find((b) => b.id === activeBaseId);

  const docs: KnowledgeDocument[] = activeBase ? knowledgeStore.listDocuments(activeBase.id) : [];
  const stats = knowledgeCost.stats(workspaceId);

  // ---- create base ----
  const [newBaseName, setNewBaseName] = useState("");
  const onCreateBase = () => {
    if (!newBaseName.trim()) return;
    const base = createKnowledgeBase({ workspaceId, name: newBaseName.trim() });
    setNewBaseName("");
    setActiveBaseId(base.id);
  };

  // ---- ingest ----
  const fileRef = useRef<HTMLInputElement>(null);
  const [source, setSource] = useState<KnowledgeSourceKind>("text");
  const [pasteText, setPasteText] = useState("");
  const [urlRef, setUrlRef] = useState("");
  const [ingesting, setIngesting] = useState(false);

  const onIngest = async () => {
    if (!activeBase) return;
    setIngesting(true);
    try {
      if (source === "text") {
        await ingestDocument({ base: activeBase, source: "text", content: pasteText, title: "Texto colado" });
        setPasteText("");
      } else if (source === "url") {
        await ingestDocument({ base: activeBase, source: "url", ref: urlRef, title: urlRef });
        setUrlRef("");
      } else {
        const file = fileRef.current?.files?.[0];
        if (!file) return;
        await ingestDocument({ base: activeBase, source, file, title: file.name });
        if (fileRef.current) fileRef.current.value = "";
      }
    } finally {
      setIngesting(false);
    }
  };

  // ---- retrieval ----
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<KnowledgeSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const onSearch = async () => {
    if (!activeBase || !query.trim()) return;
    setSearching(true);
    const res = await retrieveKnowledge({ baseId: activeBase.id, query, topK: 5 });
    setResults(res);
    setSearching(false);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1400px] mx-auto">
      <div>
        <div className="text-xs uppercase tracking-widest text-primary-glow font-medium">Intelligence</div>
        <h1 className="font-display text-3xl font-bold mt-1.5 flex items-center gap-2">
          <BookOpen className="h-7 w-7 text-primary-glow" /> Knowledge Base
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Indexe documentos do workspace e conecte-os ao AI Block sem alterar a Runtime.
        </p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Stat label="Bases" value={String(bases.length)} icon={<Database className="h-4 w-4" />} />
        <Stat label="Embeds" value={String(stats.embeds)} icon={<Sparkles className="h-4 w-4" />} />
        <Stat label="Buscas" value={String(stats.searches)} icon={<Search className="h-4 w-4" />} />
        <Stat label="Tokens" value={String(stats.tokens)} icon={<FileText className="h-4 w-4" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,1.6fr] gap-6">
        {/* Bases column */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card/60 p-4 space-y-3">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Bases do workspace</div>
            <div className="flex gap-2">
              <Input
                placeholder="Nova base (ex.: FAQ Vendas)"
                value={newBaseName}
                onChange={(e) => setNewBaseName(e.target.value)}
                className="bg-background border-border"
              />
              <Button onClick={onCreateBase} className="gradient-primary text-primary-foreground border-0">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-1">
              {bases.length === 0 && (
                <div className="text-xs text-muted-foreground py-6 text-center">Nenhuma base ainda.</div>
              )}
              {bases.map((b) => (
                <button
                  key={b.id}
                  onClick={() => setActiveBaseId(b.id)}
                  className={`w-full text-left rounded-lg px-3 py-2 border transition ${
                    activeBaseId === b.id
                      ? "border-primary/50 bg-primary/10"
                      : "border-border hover:border-primary/30"
                  }`}
                >
                  <div className="font-medium text-sm">{b.name}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {b.embeddingProvider} · {b.chunking.strategy} · {b.chunking.chunkSize}c
                  </div>
                </button>
              ))}
            </div>
          </div>

          {activeBase && (
            <div className="rounded-2xl border border-border bg-card/60 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs uppercase tracking-widest text-muted-foreground">Documentos</div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    if (confirm("Apagar esta base e seus chunks?")) {
                      knowledgeStore.deleteBase(activeBase.id);
                      setActiveBaseId(null);
                    }
                  }}
                  className="text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
              {docs.length === 0 && (
                <div className="text-xs text-muted-foreground py-4 text-center">Sem documentos.</div>
              )}
              <div className="space-y-1.5 max-h-[260px] overflow-auto">
                {docs.map((d) => (
                  <div key={d.id} className="rounded-lg border border-border p-2.5 flex items-center justify-between">
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{d.title}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {d.source} · {d.chunkCount} chunks · {d.status}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => knowledgeStore.deleteDocument(d.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {activeBase ? (
            <>
              <div className="rounded-2xl border border-border bg-card/60 p-4 space-y-3">
                <div className="text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Upload className="h-3.5 w-3.5" /> Adicionar conteúdo
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Select value={source} onValueChange={(v) => setSource(v as KnowledgeSourceKind)}>
                    <SelectTrigger className="bg-background border-border"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Texto colado</SelectItem>
                      <SelectItem value="txt">Arquivo .txt</SelectItem>
                      <SelectItem value="pdf">PDF (mock)</SelectItem>
                      <SelectItem value="docx">DOCX (mock)</SelectItem>
                      <SelectItem value="url">URL (mock)</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={onIngest} disabled={ingesting} className="gradient-primary text-primary-foreground border-0">
                    {ingesting ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Plus className="h-4 w-4 mr-1.5" />}
                    Indexar
                  </Button>
                </div>
                {source === "text" && (
                  <Textarea rows={5} placeholder="Cole o texto aqui..." value={pasteText}
                    onChange={(e) => setPasteText(e.target.value)}
                    className="bg-background border-border font-mono text-sm" />
                )}
                {source === "url" && (
                  <Input placeholder="https://..." value={urlRef} onChange={(e) => setUrlRef(e.target.value)}
                    className="bg-background border-border" />
                )}
                {(source === "txt" || source === "pdf" || source === "docx") && (
                  <Input ref={fileRef} type="file" className="bg-background border-border" />
                )}
              </div>

              <div className="rounded-2xl border border-border bg-card/60 p-4 space-y-3">
                <div className="text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Search className="h-3.5 w-3.5" /> Testar retrieval
                </div>
                <div className="flex gap-2">
                  <Input placeholder="Faça uma pergunta..." value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && onSearch()}
                    className="bg-background border-border" />
                  <Button onClick={onSearch} disabled={searching} className="gradient-primary text-primary-foreground border-0">
                    {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  </Button>
                </div>
                <div className="space-y-2 max-h-[360px] overflow-auto">
                  {results.length === 0 && (
                    <div className="text-xs text-muted-foreground text-center py-6">
                      Faça uma busca para ver os chunks mais relevantes.
                    </div>
                  )}
                  {results.map((r, i) => (
                    <div key={r.chunk.id} className="rounded-lg border border-border p-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="text-xs font-medium text-primary-glow">
                          #{i + 1} · {r.document.title}
                        </div>
                        <div className="text-[11px] text-muted-foreground font-mono">
                          score {r.score.toFixed(3)}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground whitespace-pre-wrap font-mono">
                        {r.chunk.text.slice(0, 320)}{r.chunk.text.length > 320 ? "…" : ""}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
              <Globe className="h-8 w-8 mx-auto mb-2 opacity-60" />
              Crie uma base para começar.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card/60 p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
        {icon} {label}
      </div>
      <div className="font-display text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}
