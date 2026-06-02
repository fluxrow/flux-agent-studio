import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User, Building2, CreditCard, KeyRound, Bell, Users2, Sparkles,
  Database, LogOut, Loader2, Wand2, Plug, Link2, ShieldCheck, ScrollText, Shield, Cookie,
} from "lucide-react";
import { ConnectedAccountsPanel } from "@/components/settings/ConnectedAccountsPanel";
import { CompliancePanel } from "@/components/settings/CompliancePanel";
import { CredentialsPanel } from "@/components/settings/CredentialsPanel";
import { ReadinessPanel } from "@/components/settings/ReadinessPanel";
import { AuditLogsPanel } from "@/components/settings/AuditLogsPanel";
import { ConsentPanel } from "@/components/settings/ConsentPanel";
import { toast } from "sonner";
import { useAuth } from "@/auth/AuthProvider";
import { useWorkspace } from "@/auth/WorkspaceProvider";
import { USE_SUPABASE } from "@/lib/runtime-config";
import { seedDemoData } from "@/lib/seed";
import { SystemHealthPanel } from "@/components/system/SystemHealthPanel";
import { TrackingDestinationsPanel } from "@/components/tracking/TrackingDestinationsPanel";

function ComingSoon({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/40 p-10 text-center space-y-2">
      <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">Em breve</Badge>
      <div className="font-semibold mt-3">{title}</div>
      <p className="text-xs text-muted-foreground max-w-md mx-auto">{description}</p>
    </div>
  );
}

export default function Settings() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { workspace } = useWorkspace();
  const [seeding, setSeeding] = useState(false);

  const displayName =
    (user?.user_metadata?.full_name as string | undefined) ??
    user?.email?.split("@")[0] ??
    "Usuário FluxBot";
  const displayEmail = user?.email ?? "—";
  const initials = displayName
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const r = await seedDemoData();
      if (r.skipped) toast.info(r.reason ?? "Nada a fazer.");
      else toast.success(`Seed concluído · ${r.bots} bots, ${r.leads} leads, ${r.channels} canais.`);
    } catch (err: any) {
      toast.error(err?.message ?? "Falha ao popular dados.");
    } finally {
      setSeeding(false);
    }
  };

  const handleLogout = async () => {
    const { recordAudit } = await import("@/compliance");
    recordAudit({ action: "logout", actor: user?.email ?? "anonymous" });
    await signOut();
    navigate("/auth", { replace: true });
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1200px] mx-auto">
      <div>
        <div className="text-xs uppercase tracking-widest text-primary-glow font-medium">Workspace</div>
        <h1 className="font-display text-3xl font-bold mt-1.5">Configurações</h1>
        <p className="text-muted-foreground text-sm mt-1">Gerencie sua conta, equipe, plano e segurança.</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="bg-card/60 border border-border h-auto p-1 flex-wrap">
          <TabsTrigger value="profile"><User className="h-3.5 w-3.5 mr-1.5" />Perfil</TabsTrigger>
          <TabsTrigger value="workspace"><Building2 className="h-3.5 w-3.5 mr-1.5" />Workspace</TabsTrigger>
          <TabsTrigger value="team"><Users2 className="h-3.5 w-3.5 mr-1.5" />Equipe</TabsTrigger>
          <TabsTrigger value="billing"><CreditCard className="h-3.5 w-3.5 mr-1.5" />Plano</TabsTrigger>
          <TabsTrigger value="api"><KeyRound className="h-3.5 w-3.5 mr-1.5" />API & Webhooks</TabsTrigger>
          <TabsTrigger value="notify"><Bell className="h-3.5 w-3.5 mr-1.5" />Notificações</TabsTrigger>
          <TabsTrigger value="accounts"><Link2 className="h-3.5 w-3.5 mr-1.5" />Contas conectadas</TabsTrigger>
          <TabsTrigger value="destinations"><Plug className="h-3.5 w-3.5 mr-1.5" />Destinations</TabsTrigger>
          <TabsTrigger value="compliance"><ShieldCheck className="h-3.5 w-3.5 mr-1.5" />Compliance</TabsTrigger>
          <TabsTrigger value="credentials"><KeyRound className="h-3.5 w-3.5 mr-1.5" />Credenciais</TabsTrigger>
          <TabsTrigger value="consent"><Cookie className="h-3.5 w-3.5 mr-1.5" />Consent</TabsTrigger>
          <TabsTrigger value="audit"><ScrollText className="h-3.5 w-3.5 mr-1.5" />Auditoria</TabsTrigger>
          <TabsTrigger value="readiness"><Shield className="h-3.5 w-3.5 mr-1.5" />Readiness</TabsTrigger>
          <TabsTrigger value="system"><Database className="h-3.5 w-3.5 mr-1.5" />Sistema</TabsTrigger>
        </TabsList>

        {/* Perfil */}
        <TabsContent value="profile" className="mt-6">
          <div className="rounded-2xl border border-border bg-card/60 p-6 space-y-5">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl gradient-accent shadow-glow flex items-center justify-center text-xl font-bold text-background">
                {initials}
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-lg truncate">{displayName}</div>
                <div className="text-xs text-muted-foreground truncate">{displayEmail}</div>
              </div>
              <div className="ml-auto flex items-center gap-2">
                {USE_SUPABASE && user && (
                  <Button size="sm" variant="outline" onClick={handleLogout} className="border-destructive/40 text-destructive hover:bg-destructive/10">
                    <LogOut className="h-3.5 w-3.5 mr-1.5" /> Sair
                  </Button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground">Nome</label>
                <Input defaultValue={displayName} className="mt-1 bg-background border-border" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Email</label>
                <Input defaultValue={displayEmail} disabled className="mt-1 bg-background border-border" />
              </div>
            </div>
            <div className="flex justify-end">
              <Button disabled className="gradient-primary text-primary-foreground border-0 opacity-70">
                Salvar alterações <Badge variant="outline" className="ml-2 bg-warning/10 text-warning border-warning/30 text-[10px]">Em breve</Badge>
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Workspace */}
        <TabsContent value="workspace" className="mt-6 space-y-4">
          {/* Persistence mode card */}
          <div className="rounded-2xl border border-primary/30 bg-card/60 p-5">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
                <Database className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold">Modo de persistência</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {USE_SUPABASE
                    ? <>Conectado ao Lovable Cloud. Workspace ativo: <strong className="text-foreground">{workspace?.name ?? "—"}</strong> · papel: <strong className="text-foreground">{workspace?.role ?? "—"}</strong></>
                    : <>Rodando em <strong className="text-foreground">modo demo</strong> (dados em memória). Para usar persistência real, defina <code className="text-primary-glow">VITE_USE_SUPABASE=true</code> e recarregue.</>}
                </div>
              </div>
              <span className={`text-[10px] uppercase tracking-widest px-2 py-1 rounded-full border ${USE_SUPABASE ? "bg-success/15 text-success border-success/30" : "bg-warning/15 text-warning border-warning/30"}`}>
                {USE_SUPABASE ? "Cloud" : "Mock"}
              </span>
            </div>
            {USE_SUPABASE && (
              <div className="mt-4 pt-4 border-t border-border flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <div className="text-sm font-medium flex items-center gap-1.5">
                    <Wand2 className="h-3.5 w-3.5 text-primary-glow" /> Popular dados de demo
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Cria bots, leads e canais de exemplo neste workspace.
                  </div>
                </div>
                <Button size="sm" disabled={seeding} onClick={handleSeed} className="gradient-primary text-primary-foreground border-0">
                  {seeding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Carregar demo"}
                </Button>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-card/60 p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground">Nome do workspace</label>
                <Input defaultValue={workspace?.name ?? ""} disabled className="mt-1 bg-background border-border" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Slug</label>
                <Input defaultValue={workspace?.slug ?? ""} disabled className="mt-1 bg-background border-border font-mono text-sm" />
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground">Renomear workspace estará disponível em breve.</p>
          </div>
        </TabsContent>

        {/* Equipe */}
        <TabsContent value="team" className="mt-6">
          <ComingSoon
            title="Gestão de equipe"
            description="Convidar membros, atribuir papéis e gerenciar permissões. Será liberado após o beta fechado."
          />
        </TabsContent>

        {/* Plano */}
        <TabsContent value="billing" className="mt-6">
          <ComingSoon
            title="Planos e billing"
            description="Upgrades, métricas de uso e cobrança serão habilitados no lançamento público."
          />
        </TabsContent>

        {/* API */}
        <TabsContent value="api" className="mt-6">
          <ComingSoon
            title="Chaves de API & Webhooks"
            description="Emissão e rotação de chaves serão liberadas quando a API pública entrar em beta."
          />
        </TabsContent>

        {/* Notify */}
        <TabsContent value="notify" className="mt-6">
          <div className="rounded-2xl border border-border bg-card/60 p-6 space-y-3">
            <p className="text-[11px] text-muted-foreground">
              Preferências locais — sincronização entre dispositivos virá em breve.
            </p>
            {[
              { l: "Lead quente capturado (score > 80)",   on: true },
              { l: "Queda de conversão acima de 20%",      on: true },
              { l: "Bot publicou nova versão",             on: false },
              { l: "Limite de mensagens IA próximo (>80%)", on: true },
              { l: "Resumo diário por email",              on: false },
            ].map(n => (
              <div key={n.l} className="flex items-center justify-between rounded-xl border border-border bg-background/40 p-3">
                <div className="text-sm">{n.l}</div>
                <Switch defaultChecked={n.on} />
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Connected accounts */}
        <TabsContent value="accounts" className="mt-6">
          <ConnectedAccountsPanel />
        </TabsContent>

        {/* Tracking destinations */}
        <TabsContent value="destinations" className="mt-6">
          <TrackingDestinationsPanel />
        </TabsContent>

        {/* Compliance */}
        <TabsContent value="compliance" className="mt-6">
          <CompliancePanel />
        </TabsContent>

        {/* Credentials */}
        <TabsContent value="credentials" className="mt-6">
          <CredentialsPanel />
        </TabsContent>

        {/* Consent */}
        <TabsContent value="consent" className="mt-6">
          <ConsentPanel />
        </TabsContent>

        {/* Audit logs */}
        <TabsContent value="audit" className="mt-6">
          <AuditLogsPanel />
        </TabsContent>

        {/* Readiness */}
        <TabsContent value="readiness" className="mt-6">
          <ReadinessPanel />
        </TabsContent>

        {/* System Health */}
        <TabsContent value="system" className="mt-6">
          <SystemHealthPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
