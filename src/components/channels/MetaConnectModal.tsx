import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle2, Copy } from "lucide-react";
import { ChannelBadge } from "./ChannelBadge";
import { useMetaConnections } from "@/hooks/useMetaConnections";
import { getWhatsAppSetupSteps } from "@/channels/meta/whatsapp";
import { getInstagramSetupSteps } from "@/channels/meta/instagram";
import { getMessengerSetupSteps } from "@/channels/meta/messenger";
import type { MetaPlatform } from "@/channels/meta/types";

const SUPABASE_PROJECT_ID = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "";
const WEBHOOK_URL = `https://${SUPABASE_PROJECT_ID}.supabase.co/functions/v1/meta-webhook`;

interface MetaConnectModalProps {
  open: boolean;
  onClose: () => void;
}

interface FormState {
  displayName:    string;
  accessToken:    string;
  phoneNumberId:  string;
  pageId:         string;
  igUserId:       string;
}

const EMPTY: FormState = { displayName: "", accessToken: "", phoneNumberId: "", pageId: "", igUserId: "" };

export function MetaConnectModal({ open, onClose }: MetaConnectModalProps) {
  const [platform, setPlatform] = useState<MetaPlatform>("whatsapp");
  const [form, setForm]         = useState<FormState>(EMPTY);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [err, setErr]           = useState<string | null>(null);

  const { create } = useMetaConnections();

  const steps = platform === "whatsapp"
    ? getWhatsAppSetupSteps(WEBHOOK_URL)
    : platform === "instagram"
    ? getInstagramSetupSteps(WEBHOOK_URL)
    : getMessengerSetupSteps(WEBHOOK_URL);

  function setField(k: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(prev => ({ ...prev, [k]: e.target.value }));
  }

  async function handleSave() {
    setErr(null);
    if (!form.accessToken.trim()) { setErr("Access Token é obrigatório."); return; }
    if (platform === "whatsapp" && !form.phoneNumberId.trim()) { setErr("Phone Number ID é obrigatório para WhatsApp."); return; }
    if ((platform === "instagram" || platform === "messenger") && !form.pageId.trim()) { setErr("Page ID é obrigatório."); return; }

    setSaving(true);
    try {
      await create({
        platform,
        displayName:   form.displayName || platform,
        accessToken:   form.accessToken.trim(),
        phoneNumberId: form.phoneNumberId.trim() || undefined,
        pageId:        form.pageId.trim() || undefined,
        igUserId:      form.igUserId.trim() || undefined,
      });
      setSaved(true);
      setTimeout(() => { setSaved(false); setForm(EMPTY); onClose(); }, 1500);
    } catch (error: unknown) {
      setErr(error instanceof Error ? error.message : "Erro ao salvar conexão.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Conectar canal Meta</DialogTitle>
          <DialogDescription>
            Configure manualmente usando token e IDs da plataforma.
            OAuth automático está planejado para a próxima fase.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={platform} onValueChange={v => { setPlatform(v as MetaPlatform); setErr(null); }}>
          <TabsList className="grid grid-cols-3 mb-4">
            {(["whatsapp","instagram","messenger"] as MetaPlatform[]).map(p => (
              <TabsTrigger key={p} value={p} className="flex items-center gap-1.5">
                <ChannelBadge platform={p} showLabel size="sm" />
              </TabsTrigger>
            ))}
          </TabsList>

          {(["whatsapp","instagram","messenger"] as MetaPlatform[]).map(p => (
            <TabsContent key={p} value={p} className="space-y-4">
              {/* Webhook URL */}
              <div className="rounded-lg border border-border bg-secondary/30 p-3 space-y-2">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
                  URL do Webhook (copie para o Meta)
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs bg-background rounded px-2 py-1.5 border border-border truncate">
                    {WEBHOOK_URL}
                  </code>
                  <Button size="icon" variant="ghost" className="h-7 w-7"
                    onClick={() => navigator.clipboard.writeText(WEBHOOK_URL)}>
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="text-[10px] text-muted-foreground">
                  O verify token é configurado e compartilhado pelo operador no ambiente seguro.
                </div>
              </div>

              {/* Setup steps */}
              <details className="text-xs text-muted-foreground">
                <summary className="cursor-pointer font-medium text-foreground mb-2">
                  Como configurar ({steps.length} passos)
                </summary>
                <ol className="space-y-1 ml-2 list-none">
                  {steps.map((s, i) => <li key={i}>{s}</li>)}
                </ol>
              </details>

              {/* Form */}
              <div className="space-y-3">
                <div>
                  <Label htmlFor="displayName">Nome de exibição</Label>
                  <Input id="displayName" placeholder="Ex: WhatsApp Vendas" value={form.displayName} onChange={setField("displayName")} />
                </div>
                <div>
                  <Label htmlFor="accessToken">Access Token *</Label>
                  <Input id="accessToken" type="password" placeholder="EAAxxxx..." value={form.accessToken} onChange={setField("accessToken")} />
                </div>
                {p === "whatsapp" && (
                  <div>
                    <Label htmlFor="phoneNumberId">Phone Number ID *</Label>
                    <Input id="phoneNumberId" placeholder="1234567890" value={form.phoneNumberId} onChange={setField("phoneNumberId")} />
                  </div>
                )}
                {(p === "instagram" || p === "messenger") && (
                  <>
                    <div>
                      <Label htmlFor="pageId">Page ID *</Label>
                      <Input id="pageId" placeholder="ID da Página do Facebook" value={form.pageId} onChange={setField("pageId")} />
                    </div>
                    {p === "instagram" && (
                      <div>
                        <Label htmlFor="igUserId">Instagram User ID (opcional)</Label>
                        <Input id="igUserId" placeholder="ID do perfil Instagram Business" value={form.igUserId} onChange={setField("igUserId")} />
                      </div>
                    )}
                  </>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {err && (
          <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {err}
          </div>
        )}

        {saved && (
          <div className="flex items-center gap-2 text-sm text-success bg-success/10 rounded-lg px-3 py-2">
            <CheckCircle2 className="h-4 w-4" />
            Conexão verificada e ativada. Configure o webhook na Meta para receber mensagens.
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving || saved}>
            {saving ? "Salvando…" : "Salvar conexão"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
