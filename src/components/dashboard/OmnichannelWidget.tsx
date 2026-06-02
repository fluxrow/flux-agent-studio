import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plug, Bot as BotIcon, Radio, ArrowUpRight } from "lucide-react";
import { oauthManager } from "@/oauth";
import { conversationSources } from "@/inbox/sources";
import { useWorkspace } from "@/auth/WorkspaceProvider";

export function OmnichannelWidget() {
  const { workspace } = useWorkspace();
  const workspaceId = workspace?.id ?? "demo-workspace";
  const [, setTick] = useState(0);

  useEffect(() => oauthManager.subscribe(() => setTick((t) => t + 1)), []);

  const accounts = oauthManager.list().filter((a) => a.workspaceId === workspaceId);
  const connected = accounts.filter((a) => a.status === "connected").length;
  const bindings = oauthManager.bindings().filter((b) => b.workspaceId === workspaceId);
  const activeChannels = new Set(bindings.map((b) => b.provider)).size;
  const readyChannels = conversationSources.length;

  const stats = [
    { label: "Contas conectadas", value: connected, total: accounts.length, icon: Plug },
    { label: "Bots vinculados",   value: bindings.length, total: bindings.length, icon: BotIcon },
    { label: "Canais ativos",     value: activeChannels, total: readyChannels, icon: Radio },
  ];

  return (
    <div className="rounded-2xl border border-border bg-card/60 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold flex items-center gap-2"><Radio className="h-4 w-4 text-primary-glow" /> Omnichannel</h3>
          <p className="text-xs text-muted-foreground">Contas externas, bots e canais prontos para a Inbox unificada.</p>
        </div>
        <Link to="/settings" className="text-xs text-primary-glow flex items-center gap-1">Gerenciar <ArrowUpRight className="h-3 w-3" /></Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-background/40 p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <s.icon className="h-3.5 w-3.5 text-primary-glow" /> {s.label}
            </div>
            <div className="mt-1 font-display text-2xl font-bold">
              {s.value}<span className="text-sm text-muted-foreground font-normal"> / {s.total || "—"}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {conversationSources.map((s) => (
          <div key={s.id}
            className={`text-[11px] uppercase tracking-widest px-2 py-1 rounded-full border ${
              s.status === "ready"
                ? "bg-success/15 text-success border-success/30"
                : "bg-muted/30 text-muted-foreground border-border"
            }`}>
            {s.label}
          </div>
        ))}
      </div>
    </div>
  );
}
