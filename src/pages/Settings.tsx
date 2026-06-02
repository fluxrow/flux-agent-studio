import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User, Building2, CreditCard, KeyRound, Bell, Users2, Sparkles, Copy,
  Database, LogOut, Loader2, Wand2,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/auth/AuthProvider";
import { useWorkspace } from "@/auth/WorkspaceProvider";
import { USE_SUPABASE } from "@/lib/runtime-config";
import { seedDemoData } from "@/lib/seed";

export default function Settings() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { workspace } = useWorkspace();
  const [seeding, setSeeding] = useState(false);

  const displayName = (user?.user_metadata?.full_name as string | undefined)
    ?? user?.email?.split("@")[0]
    ?? "Cauã Martins";
  const displayEmail = user?.email ?? "caua@fluxbot.app";

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
          <TabsTrigger value="system"><Database className="h-3.5 w-3.5 mr-1.5" />Sistema</TabsTrigger>
        </TabsList>

        {/* Perfil */}
        <TabsContent value="profile" className="mt-6">
          <div className="rounded-2xl border border-border bg-card/60 p-6 space-y-5">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl gradient-accent shadow-glow" />
              <div>
                <div className="font-semibold text-lg">Cauã Martins</div>
                <div className="text-xs text-muted-foreground">caua@fluxbot.app</div>
              </div>
              <Button size="sm" variant="outline" className="ml-auto bg-secondary/40">Alterar foto</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground">Nome</label>
                <Input defaultValue="Cauã Martins" className="mt-1 bg-background border-border" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Email</label>
                <Input defaultValue="caua@fluxbot.app" className="mt-1 bg-background border-border" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Fuso horário</label>
                <Input defaultValue="America/Sao_Paulo (GMT-3)" className="mt-1 bg-background border-border" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Idioma</label>
                <Input defaultValue="Português (Brasil)" className="mt-1 bg-background border-border" />
              </div>
            </div>
            <div className="flex justify-end">
              <Button className="gradient-primary text-primary-foreground border-0">Salvar alterações</Button>
            </div>
          </div>
        </TabsContent>

        {/* Perfil */}
        <TabsContent value="profile" className="mt-6">
          <div className="rounded-2xl border border-border bg-card/60 p-6 space-y-5">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl gradient-accent shadow-glow flex items-center justify-center text-xl font-bold text-background">
                {displayName.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase()}
              </div>
              <div>
                <div className="font-semibold text-lg">{displayName}</div>
                <div className="text-xs text-muted-foreground">{displayEmail}</div>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <Button size="sm" variant="outline" className="bg-secondary/40">Alterar foto</Button>
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
                <Input defaultValue={displayEmail} className="mt-1 bg-background border-border" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Fuso horário</label>
                <Input defaultValue="America/Sao_Paulo (GMT-3)" className="mt-1 bg-background border-border" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Idioma</label>
                <Input defaultValue="Português (Brasil)" className="mt-1 bg-background border-border" />
              </div>
            </div>
            <div className="flex justify-end">
              <Button className="gradient-primary text-primary-foreground border-0">Salvar alterações</Button>
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
                <Input defaultValue={workspace?.name ?? "FluxBot Premium"} className="mt-1 bg-background border-border" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Slug</label>
                <Input defaultValue={workspace?.slug ?? "fluxbot-premium"} className="mt-1 bg-background border-border font-mono text-sm" />
              </div>
            </div>
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
              <div className="text-sm font-semibold text-destructive">Zona de risco</div>
              <div className="text-xs text-muted-foreground mt-1">Excluir o workspace remove todos os bots, leads e dados associados.</div>
              <Button size="sm" variant="outline" className="mt-3 border-destructive/40 text-destructive hover:bg-destructive/10">Excluir workspace</Button>
            </div>
          </div>
        </TabsContent>


        {/* Equipe */}
        <TabsContent value="team" className="mt-6">
          <div className="rounded-2xl border border-border bg-card/60 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Membros da equipe</h3>
              <Button size="sm" className="gradient-primary text-primary-foreground border-0">Convidar</Button>
            </div>
            <div className="space-y-2">
              {[
                { n: "Cauã Martins", e: "caua@fluxbot.app", r: "Owner" },
                { n: "Bianca Lopes",  e: "bianca@fluxbot.app", r: "Admin" },
                { n: "André Silva",   e: "andre@fluxbot.app",  r: "Editor" },
                { n: "Paula Reis",    e: "paula@fluxbot.app",  r: "Viewer" },
              ].map(m => (
                <div key={m.e} className="flex items-center gap-3 rounded-xl border border-border bg-background/40 p-3">
                  <div className="h-9 w-9 rounded-lg gradient-accent flex items-center justify-center text-xs font-bold text-background">
                    {m.n.split(" ").map(s=>s[0]).slice(0,2).join("")}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{m.n}</div>
                    <div className="text-xs text-muted-foreground">{m.e}</div>
                  </div>
                  <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-primary/15 text-primary-glow border border-primary/30">{m.r}</span>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Plano */}
        <TabsContent value="billing" className="mt-6">
          <div className="rounded-2xl border border-primary/40 bg-card/60 p-6 relative overflow-hidden">
            <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full gradient-primary opacity-20" />
            <div className="relative flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs text-primary-glow uppercase tracking-widest font-semibold">
                  <Sparkles className="h-3.5 w-3.5" /> Plano atual
                </div>
                <div className="font-display text-2xl font-bold mt-1">FluxBot Pro · R$ 297/mês</div>
                <div className="text-xs text-muted-foreground mt-1">Renova em 28 jun 2026 · 12 bots ativos · 50k mensagens IA</div>
              </div>
              <Button className="gradient-primary text-primary-foreground border-0 shadow-elegant">Fazer upgrade</Button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {[
              { l: "Mensagens IA", v: "32.4k / 50k", p: 64 },
              { l: "Bots ativos",  v: "12 / 50",     p: 24 },
              { l: "Membros",      v: "4 / 10",      p: 40 },
            ].map(u => (
              <div key={u.l} className="rounded-2xl border border-border bg-card/60 p-5">
                <div className="text-xs text-muted-foreground">{u.l}</div>
                <div className="font-display text-xl font-bold mt-1">{u.v}</div>
                <div className="mt-3 h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full gradient-primary" style={{ width: `${u.p}%` }} />
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* API */}
        <TabsContent value="api" className="mt-6">
          <div className="rounded-2xl border border-border bg-card/60 p-6 space-y-4">
            <h3 className="font-semibold">Chaves de API</h3>
            <div className="space-y-2">
              {[
                { n: "Produção",    k: "fxb_live_••••••••••••••••a7e2" },
                { n: "Desenvolvimento", k: "fxb_test_••••••••••••••••3f01" },
              ].map(k => (
                <div key={k.n} className="flex items-center gap-3 rounded-xl border border-border bg-background/40 p-3">
                  <div className="text-xs uppercase tracking-widest text-muted-foreground w-32">{k.n}</div>
                  <code className="flex-1 text-xs font-mono text-primary-glow">{k.k}</code>
                  <Button size="icon" variant="ghost" className="h-8 w-8"><Copy className="h-4 w-4" /></Button>
                  <Button size="sm" variant="outline" className="bg-secondary/40">Rotacionar</Button>
                </div>
              ))}
            </div>
            <div className="pt-3 border-t border-border">
              <label className="text-xs text-muted-foreground">Webhook global de eventos</label>
              <Input defaultValue="https://api.meuapp.com/fluxbot/webhook" className="mt-1 bg-background border-border font-mono text-sm" />
            </div>
          </div>
        </TabsContent>

        {/* Notify */}
        <TabsContent value="notify" className="mt-6">
          <div className="rounded-2xl border border-border bg-card/60 p-6 space-y-3">
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
      </Tabs>
    </div>
  );
}
