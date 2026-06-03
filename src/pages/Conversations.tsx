// Phase 23A — fake conversation list removed. Real conversations stream in
// once a published bot receives messages. The full inbox UI returns when
// real session data exists.
import { Link } from "react-router-dom";
import { MessageSquare, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { useConversations } from "@/domain/hooks";

export default function Conversations() {
  const { data, isLoading } = useConversations();
  const items = data?.items ?? [];

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      <div>
        <h1 className="font-display text-3xl font-bold">Conversas</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Inbox unificada de todos os canais conectados.
        </p>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/30 p-10 text-center text-sm text-muted-foreground">
          Carregando conversas…
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="Nenhuma conversa ainda."
          description="Quando alguém interagir com um bot publicado, a conversa aparecerá aqui."
          action={
            <Link to="/bots/new">
              <Button className="gradient-primary text-primary-foreground border-0 shadow-elegant">
                <Plus className="h-4 w-4 mr-1.5" /> Criar bot
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="rounded-2xl border border-border bg-card/60 divide-y divide-border">
          {items.map((c) => (
            <div key={c.id} className="p-4 flex items-center justify-between text-sm">
              <div className="min-w-0">
                <div className="font-medium truncate">{c.leadName ?? c.id}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {c.channel ?? "—"} · {c.status ?? "ativa"}
                </div>
              </div>
              <span className="text-[11px] text-muted-foreground tabular-nums">
                {new Date(c.updatedAt ?? c.createdAt ?? Date.now()).toLocaleString("pt-BR")}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
