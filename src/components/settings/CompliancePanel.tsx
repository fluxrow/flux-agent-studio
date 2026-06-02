import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExternalLink, ShieldCheck, FileText, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  getComplianceDocs,
  updateComplianceDoc,
  type ComplianceDocKind,
  type ComplianceDocument,
} from "@/compliance";

const tabs: { kind: ComplianceDocKind; label: string; icon: typeof FileText; path: string }[] = [
  { kind: "privacy", label: "Política de Privacidade", icon: ShieldCheck, path: "/privacy" },
  { kind: "terms", label: "Termos de Uso", icon: FileText, path: "/terms" },
  { kind: "data_deletion", label: "Exclusão de Dados", icon: Trash2, path: "/data-deletion" },
];

export function CompliancePanel() {
  const [docs, setDocs] = useState<ComplianceDocument[]>(() => getComplianceDocs());
  const [active, setActive] = useState<ComplianceDocKind>("privacy");

  useEffect(() => { setDocs(getComplianceDocs()); }, []);

  const current = docs.find((d) => d.kind === active)!;
  const [draft, setDraft] = useState({ title: current.title, body: current.body });

  useEffect(() => {
    setDraft({ title: current.title, body: current.body });
  }, [current.id]);

  const save = () => {
    updateComplianceDoc(active, draft);
    setDocs(getComplianceDocs());
    toast.success("Documento atualizado.");
  };

  return (
    <div className="rounded-2xl border border-border bg-card/60 p-6 space-y-5">
      <div>
        <h3 className="font-semibold">Compliance Center</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Documentos públicos exigidos para aprovação em plataformas (Meta, Google, etc.).
        </p>
      </div>

      <Tabs value={active} onValueChange={(v) => setActive(v as ComplianceDocKind)}>
        <TabsList className="bg-background/40 border border-border">
          {tabs.map((t) => (
            <TabsTrigger key={t.kind} value={t.kind}>
              <t.icon className="h-3.5 w-3.5 mr-1.5" /> {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((t) => (
          <TabsContent key={t.kind} value={t.kind} className="mt-5 space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="text-xs text-muted-foreground">
                Versão atual: <span className="text-foreground font-medium">v{current.version}</span> · atualizado em{" "}
                {new Date(current.updatedAt).toLocaleString("pt-BR")}
              </div>
              <a
                href={t.path}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-primary-glow hover:underline inline-flex items-center gap-1"
              >
                Abrir página pública <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Título</label>
              <Input
                value={draft.title}
                onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                className="mt-1 bg-background border-border"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Conteúdo (Markdown leve)</label>
              <Textarea
                value={draft.body}
                onChange={(e) => setDraft((d) => ({ ...d, body: e.target.value }))}
                className="mt-1 bg-background border-border font-mono text-xs min-h-[280px]"
              />
            </div>
            <div className="flex justify-end">
              <Button onClick={save} className="gradient-primary text-primary-foreground border-0">
                Salvar nova versão
              </Button>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
