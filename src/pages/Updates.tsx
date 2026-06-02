/**
 * Phase 21 — Central de Novidades (/updates).
 * Lê a lista curada em src/beta/updates.ts (alinhada com o CHANGELOG).
 */
import { Sparkles, Wrench, Bug, Rocket } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { UPDATES, type UpdateKind } from "@/beta/updates";

const KIND_META: Record<UpdateKind, { label: string; icon: typeof Sparkles; tone: string }> = {
  release:     { label: "Release",       icon: Rocket,   tone: "text-primary-glow bg-primary/15" },
  feature:     { label: "Funcionalidade", icon: Sparkles, tone: "text-emerald-500 bg-emerald-500/10" },
  improvement: { label: "Melhoria",      icon: Wrench,   tone: "text-amber-500 bg-amber-500/10" },
  fix:         { label: "Correção",      icon: Bug,      tone: "text-sky-400 bg-sky-400/10" },
};

export default function Updates() {
  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-3xl mx-auto">
      <PageHeader
        eyebrow="Beta · Novidades"
        title="O que há de novo"
        description="Acompanhe as últimas versões, melhorias, correções e recursos lançados."
      />

      <ol className="relative border-l border-border pl-6 space-y-6">
        {UPDATES.map((u) => {
          const meta = KIND_META[u.kind];
          const Icon = meta.icon;
          return (
            <li key={u.id} className="relative">
              <span className="absolute -left-[34px] top-1 h-7 w-7 rounded-full bg-card border border-border flex items-center justify-center">
                <Icon className="h-3.5 w-3.5 text-primary-glow" />
              </span>
              <article className="rounded-2xl border border-border bg-card/60 p-5">
                <header className="flex flex-wrap items-center gap-2 mb-2">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest ${meta.tone}`}>
                    {meta.label}
                  </span>
                  <span className="text-[11px] text-muted-foreground">{u.version}</span>
                  <span className="text-[11px] text-muted-foreground">· {new Date(u.date).toLocaleDateString("pt-BR")}</span>
                </header>
                <h3 className="font-display text-lg font-semibold">{u.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{u.summary}</p>
                {u.bullets && u.bullets.length > 0 && (
                  <ul className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                    {u.bullets.map((b) => (
                      <li key={b} className="flex gap-2">
                        <span className="mt-1 h-1 w-1 rounded-full bg-primary-glow flex-shrink-0" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
