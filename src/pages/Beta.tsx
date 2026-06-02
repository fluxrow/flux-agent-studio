import { useMemo, useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Plus, Trash2, FlaskConical } from "lucide-react";
import { useWorkspace } from "@/auth/WorkspaceProvider";
import {
  listFeatureFlags, setFeatureFlag,
  listBetaUsers, inviteBetaUser, setBetaUserStatus, removeBetaUser,
  listUsage, usageLabel,
  SMOKE_TEMPLATES,
  listFeedback,
  type BetaUserStatus,
} from "@/beta";

const STATUS_COLOR: Record<BetaUserStatus, string> = {
  invited: "border-amber-500/30 text-amber-500 bg-amber-500/10",
  active:  "border-emerald-500/30 text-emerald-500 bg-emerald-500/10",
  paused:  "border-border text-muted-foreground",
  removed: "border-destructive/30 text-destructive bg-destructive/10",
};

export default function Beta() {
  const { workspace } = useWorkspace();
  const workspaceId = workspace?.id ?? "ws_local_demo";
  const [tick, setTick] = useState(0);

  const flags = useMemo(() => listFeatureFlags(workspaceId), [workspaceId, tick]);
  const users = useMemo(() => listBetaUsers(workspaceId), [workspaceId, tick]);
  const usage = useMemo(() => listUsage(workspaceId), [workspaceId, tick]);
  const feedback = useMemo(() => listFeedback(workspaceId), [workspaceId, tick]);

  const [inviteEmail, setInviteEmail] = useState("");

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        eyebrow="Beta · Program"
        title="Beta Readiness"
        description="Feature flags, beta users, métricas e smoke tests em um só lugar."
      />

      <Tabs defaultValue="flags">
        <TabsList>
          <TabsTrigger value="flags">Feature Flags</TabsTrigger>
          <TabsTrigger value="users">Beta Users</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
          <TabsTrigger value="smoke">Smoke Tests</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
        </TabsList>

        <TabsContent value="flags" className="space-y-3 mt-4">
          {flags.map((f) => (
            <Card key={f.key} className="p-4 flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="font-medium">{f.key.replace(/_/g, " ")}</div>
                <div className="text-xs text-muted-foreground">Rollout: {f.rollout ?? 0}%</div>
              </div>
              <div className="w-48">
                <Slider
                  value={[f.rollout ?? 0]} min={0} max={100} step={5}
                  onValueChange={([v]) => { setFeatureFlag(workspaceId, f.key, { rollout: v }); setTick((t) => t + 1); }}
                />
              </div>
              <Switch
                checked={f.enabled}
                onCheckedChange={(v) => { setFeatureFlag(workspaceId, f.key, { enabled: v }); setTick((t) => t + 1); }}
              />
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="users" className="space-y-3 mt-4">
          <Card className="p-4 flex gap-2">
            <Input
              placeholder="email@empresa.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />
            <Button onClick={() => {
              if (!inviteEmail.trim()) return;
              inviteBetaUser(workspaceId, inviteEmail.trim());
              setInviteEmail("");
              setTick((t) => t + 1);
            }}>
              <Plus className="h-3.5 w-3.5 mr-1.5" /> Convidar
            </Button>
          </Card>
          {users.length === 0 && <Card className="p-6 text-center text-muted-foreground text-sm">Nenhum beta user convidado.</Card>}
          {users.map((u) => (
            <Card key={u.id} className="p-4 flex items-center gap-3 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <div className="font-medium">{u.email}</div>
                <div className="text-xs text-muted-foreground">Convidado em {new Date(u.joinedAt).toLocaleString()}</div>
              </div>
              <Badge variant="outline" className={STATUS_COLOR[u.status]}>{u.status}</Badge>
              <div className="flex gap-1">
                {(["invited", "active", "paused"] as BetaUserStatus[]).map((s) => (
                  <Button key={s} size="sm" variant="outline"
                    onClick={() => { setBetaUserStatus(u.id, s); setTick((t) => t + 1); }}>
                    {s}
                  </Button>
                ))}
                <Button size="sm" variant="ghost" onClick={() => { removeBetaUser(u.id); setTick((t) => t + 1); }}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="usage" className="grid gap-3 md:grid-cols-3 mt-4">
          {usage.map((m) => (
            <Card key={m.key} className="p-4">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">{usageLabel(m.key)}</div>
              <div className="text-3xl font-display font-bold mt-1">{m.value}</div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="smoke" className="grid gap-3 md:grid-cols-2 mt-4">
          {SMOKE_TEMPLATES.map((t) => (
            <Card key={t.key} className="p-4">
              <div className="flex items-center gap-2">
                <FlaskConical className="h-4 w-4 text-primary-glow" />
                <div className="font-medium">{t.name}</div>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{t.description}</p>
              <pre className="text-[11px] bg-secondary/40 p-2 rounded mt-2 overflow-auto max-h-32">
{JSON.stringify(t.snapshot, null, 2)}
              </pre>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="feedback" className="space-y-2 mt-4">
          {feedback.length === 0 && <Card className="p-6 text-center text-muted-foreground text-sm">Nenhum feedback recebido ainda.</Card>}
          {feedback.map((f) => (
            <Card key={f.id} className="p-4">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline">{f.kind}</Badge>
                {f.page && <span className="text-xs text-muted-foreground">{f.page}</span>}
                <span className="ml-auto text-[11px] text-muted-foreground">{new Date(f.createdAt).toLocaleString()}</span>
              </div>
              <p className="text-sm mt-2">{f.message}</p>
              {f.email && <p className="text-xs text-muted-foreground mt-1">{f.email}</p>}
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
