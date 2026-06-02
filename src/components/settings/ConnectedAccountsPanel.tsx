import { useEffect, useMemo, useState } from "react";
import { Instagram, Facebook, MessageCircle, Send, MapPin, Plug, RefreshCw, Trash2, Link2, Loader2, Unplug } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useWorkspace } from "@/auth/WorkspaceProvider";
import { useBots } from "@/domain/hooks";
import { oauthManager, allProviders } from "@/oauth";
import type { ConnectedAccount, OAuthProviderId } from "@/types/connectedAccount";

const PROVIDER_ICON: Record<OAuthProviderId, React.ComponentType<{ className?: string }>> = {
  instagram: Instagram,
  facebook: Facebook,
  whatsapp: MessageCircle,
  telegram: Send,
  gbp: MapPin,
};

const STATUS_TONE: Record<string, string> = {
  connected:    "bg-success/15 text-success border-success/30",
  disconnected: "bg-muted/30 text-muted-foreground border-border",
  expired:      "bg-warning/15 text-warning border-warning/30",
  pending:      "bg-primary/15 text-primary-glow border-primary/30",
};

function formatRelative(iso?: string): string {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.round(diff / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `${min} min atrás`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h}h atrás`;
  const d = Math.round(h / 24);
  return `${d}d atrás`;
}

export function ConnectedAccountsPanel() {
  const { workspace } = useWorkspace();
  const workspaceId = workspace?.id ?? "demo-workspace";
  const { data: botsPage } = useBots();
  const bots = botsPage?.items ?? [];

  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [bindings, setBindings] = useState(oauthManager.bindings());
  const [busyId, setBusyId] = useState<string | null>(null);
  const [providerChoice, setProviderChoice] = useState<OAuthProviderId>("instagram");
  const [accountName, setAccountName] = useState("");
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    const sync = () => {
      setAccounts(oauthManager.list().filter((a) => a.workspaceId === workspaceId));
      setBindings(oauthManager.bindings().filter((b) => b.workspaceId === workspaceId));
    };
    sync();
    return oauthManager.subscribe(sync);
  }, [workspaceId]);

  const bindingByAccount = useMemo(() => {
    const map = new Map<string, { botId: string; bindingId: string }[]>();
    bindings.forEach((b) => {
      if (!map.has(b.accountId)) map.set(b.accountId, []);
      map.get(b.accountId)!.push({ botId: b.botId, bindingId: b.id });
    });
    return map;
  }, [bindings]);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      await oauthManager.connect(workspaceId, providerChoice, accountName.trim() || undefined);
      toast.success("Conta conectada (mock).");
      setAccountName("");
    } catch (err: any) {
      toast.error(err?.message ?? "Falha ao conectar.");
    } finally {
      setConnecting(false);
    }
  };

  const runOnAccount = async (id: string, fn: () => Promise<unknown>, msg: string) => {
    setBusyId(id);
    try { await fn(); toast.success(msg); }
    catch (err: any) { toast.error(err?.message ?? "Operação falhou."); }
    finally { setBusyId(null); }
  };

  const bindToBot = (accountId: string, botId: string) => {
    if (!botId) return;
    oauthManager.bindBot({ workspaceId, botId, accountId });
    toast.success("Bot vinculado.");
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="rounded-2xl border border-border bg-card/60 p-5">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
            <Plug className="h-4 w-4 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">Contas conectadas</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Fundação OAuth — providers reais virão na próxima fase. As ações abaixo simulam o handshake e emitem eventos no Event Bus.
            </p>
          </div>
        </div>
      </div>

      {/* Connect new */}
      <div className="rounded-2xl border border-border bg-card/60 p-5 space-y-4">
        <div className="text-sm font-semibold">Conectar nova conta</div>
        <div className="grid grid-cols-1 md:grid-cols-[1fr,1fr,auto] gap-3 items-end">
          <div>
            <label className="text-xs text-muted-foreground">Provider</label>
            <Select value={providerChoice} onValueChange={(v) => setProviderChoice(v as OAuthProviderId)}>
              <SelectTrigger className="mt-1 bg-background border-border"><SelectValue /></SelectTrigger>
              <SelectContent>
                {allProviders.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Nome da conta (opcional)</label>
            <Input
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="@meuhandle"
              className="mt-1 bg-background border-border"
            />
          </div>
          <Button disabled={connecting} onClick={handleConnect} className="gradient-primary text-primary-foreground border-0">
            {connecting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><Plug className="h-3.5 w-3.5 mr-1.5" />Conectar</>}
          </Button>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {accounts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/30 p-8 text-center text-sm text-muted-foreground">
            Nenhuma conta conectada ainda. Use o formulário acima para simular uma conexão.
          </div>
        ) : accounts.map((acc) => {
          const Icon = PROVIDER_ICON[acc.provider];
          const provider = allProviders.find((p) => p.id === acc.provider);
          const linked = bindingByAccount.get(acc.id) ?? [];
          const busy = busyId === acc.id;
          return (
            <div key={acc.id} className="rounded-2xl border border-border bg-card/60 p-5">
              <div className="flex items-start gap-4 flex-wrap">
                <div className="h-11 w-11 rounded-xl bg-secondary/40 border border-border flex items-center justify-center">
                  <Icon className="h-5 w-5 text-primary-glow" />
                </div>
                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="font-semibold">{acc.accountName}</div>
                    <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full border ${STATUS_TONE[acc.status]}`}>
                      {acc.status}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5 font-mono">{acc.accountIdentifier}</div>
                  <div className="text-[11px] text-muted-foreground mt-1">
                    {provider?.label} · conectado {formatRelative(acc.connectedAt)} · última sincronização {formatRelative(acc.lastSyncAt)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {acc.status === "connected" ? (
                    <Button size="sm" variant="outline" disabled={busy}
                      onClick={() => runOnAccount(acc.id, () => oauthManager.disconnect(acc.id), "Conta desconectada.")}>
                      <Unplug className="h-3.5 w-3.5 mr-1.5" />Desconectar
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" disabled={busy}
                      onClick={() => runOnAccount(acc.id, async () => { await oauthManager.reconnect(acc.id); }, "Conta reconectada.")}>
                      <RefreshCw className="h-3.5 w-3.5 mr-1.5" />Reconectar
                    </Button>
                  )}
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive"
                    onClick={() => { oauthManager.remove(acc.id); toast.success("Conta removida."); }}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Channel binding */}
              <div className="mt-4 pt-4 border-t border-border space-y-2">
                <div className="text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                  <Link2 className="h-3 w-3" /> Bots vinculados
                </div>
                {linked.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {linked.map((l) => {
                      const bot = bots.find((b) => b.id === l.botId);
                      return (
                        <div key={l.bindingId} className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-2.5 py-1">
                          <span className="text-xs">{bot?.name ?? l.botId}</span>
                          <button
                            className="text-[11px] text-muted-foreground hover:text-destructive"
                            onClick={() => { oauthManager.unbindBot(l.botId); toast.success("Vínculo removido."); }}
                          >remover</button>
                        </div>
                      );
                    })}
                  </div>
                )}
                <Select onValueChange={(botId) => bindToBot(acc.id, botId)}>
                  <SelectTrigger className="bg-background border-border h-9 text-xs">
                    <SelectValue placeholder="Vincular um bot…" />
                  </SelectTrigger>
                  <SelectContent>
                    {bots.length === 0 && <SelectItem value="_none" disabled>Sem bots disponíveis</SelectItem>}
                    {bots.map((b) => (
                      <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
