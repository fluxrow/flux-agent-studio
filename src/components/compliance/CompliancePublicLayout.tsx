import { Link } from "react-router-dom";
import { ArrowLeft, Sparkles } from "lucide-react";
import type { ComplianceDocument } from "@/compliance/types";

interface Props {
  doc: ComplianceDocument;
  children: React.ReactNode;
}

export function CompliancePublicLayout({ doc, children }: Props) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary shadow-glow">
              <Sparkles className="h-4 w-4 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <span className="font-display text-lg font-bold tracking-tight">FluxBot</span>
          </Link>
          <Link
            to="/"
            className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Voltar
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="text-xs uppercase tracking-widest text-primary-glow font-medium">
          Compliance · v{doc.version}
        </div>
        <h1 className="font-display text-3xl font-bold mt-2">{doc.title}</h1>
        <div className="text-xs text-muted-foreground mt-1">
          Atualizado em {new Date(doc.updatedAt).toLocaleDateString("pt-BR")}
        </div>
        <div className="mt-8 prose-compliance">{children}</div>
      </main>

      <footer className="border-t border-border mt-16">
        <div className="max-w-3xl mx-auto px-6 py-6 text-xs text-muted-foreground flex flex-wrap gap-4 justify-between">
          <span>© {new Date().getFullYear()} FluxBot</span>
          <div className="flex gap-4">
            <Link to="/privacy" className="hover:text-foreground">Privacidade</Link>
            <Link to="/terms" className="hover:text-foreground">Termos</Link>
            <Link to="/data-deletion" className="hover:text-foreground">Exclusão de dados</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ---------------- Minimal markdown renderer ---------------- */

export function MarkdownLite({ source }: { source: string }) {
  const lines = source.split("\n");
  const nodes: React.ReactNode[] = [];
  let listBuffer: string[] = [];

  const flushList = () => {
    if (!listBuffer.length) return;
    nodes.push(
      <ul key={`ul-${nodes.length}`} className="list-disc pl-6 space-y-1 my-3 text-sm text-foreground/90">
        {listBuffer.map((item, i) => <li key={i}>{item}</li>)}
      </ul>,
    );
    listBuffer = [];
  };

  lines.forEach((raw, i) => {
    const line = raw.trimEnd();
    if (line.startsWith("# ")) {
      flushList();
      nodes.push(<h2 key={i} className="font-display text-2xl font-bold mt-8 mb-3">{line.slice(2)}</h2>);
    } else if (line.startsWith("## ")) {
      flushList();
      nodes.push(<h3 key={i} className="font-semibold text-lg mt-6 mb-2">{line.slice(3)}</h3>);
    } else if (line.startsWith("- ")) {
      listBuffer.push(line.slice(2));
    } else if (line.trim() === "") {
      flushList();
    } else {
      flushList();
      nodes.push(<p key={i} className="text-sm text-foreground/90 leading-relaxed my-2">{line}</p>);
    }
  });
  flushList();
  return <>{nodes}</>;
}
