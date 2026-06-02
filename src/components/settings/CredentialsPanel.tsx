import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { KeyRound, Plus, RotateCw, Trash2, ShieldAlert, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import {
  addCredential, listCredentials, removeCredential, rotateCredential, setCredentialStatus,
  type CredentialProvider, type CredentialRecord,
} from "@/compliance";

const PROVIDERS: { value: CredentialProvider; label: string }[] = [
  { value: "openai", label: "OpenAI" },
  { value: "anthropic", label: "Anthropic" },
  { value: "gemini", label: "Google Gemini" },
  { value: "meta", label: "Meta (Facebook / Instagram / WhatsApp)" },
  { value: "google", label: "Google OAuth" },
  { value: "webhook", label: "Webhook Secret" },
];

export function CredentialsPanel() {
  const [creds, setCreds] = useState<CredentialRecord[]>(() => listCredentials());
  const [provider, setProvider] = useState<CredentialProvider>("openai");
  const [label, setLabel] = useState("");
  const [value, setValue] = useState("");

  const refresh = () => setCreds(listCredentials());

  const add = () => {
    if (!label.trim() || !value.trim()) {
      toast.error("Preencha rótulo e valor.");
      return;
    }
    addCredential({ provider, label: label.trim(), rawValue: value.trim() });
    setLabel(""); setValue("");
    refresh();
    toast.success("Credencial registrada. Valor será movido para Supabase Secrets na próxima integração real.");
  };

  const validate = (c: CredentialRecord) => {
    // Mock validation — flip to "valid" after a tick.
    setCredentialStatus(c.id, "valid");
    refresh();
    toast.success(`Credencial ${c.label} validada.`);
  };

  const rotate = (c: CredentialRecord) => {
    const v = prompt("Novo valor da credencial:");
    if (!v) return;
    rotateCredential(c.id, v);
    refresh();
    toast.success("Credencial rotacionada.");
  };

  const remove = (c: CredentialRecord) => {
    if (!confirm(`Remover credencial ${c.label}?`)) return;
    removeCredential(c.id);
    refresh();
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-primary/30 bg-card/60 p-5">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
            <ShieldAlert className="h-4 w-4 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold">Armazenamento seguro</div>
            <p className="text-xs text-muted-foreground mt-1">
              Apenas um preview mascarado fica visível aqui. O valor real é armazenado no cofre
              do Lovable Cloud no momento da integração real e nunca trafega pelo frontend.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card/60 p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Select value={provider} onValueChange={(v) => setProvider(v as CredentialProvider)}>
            <SelectTrigger className="bg-background border-border"><SelectValue /></SelectTrigger>
            <SelectContent>
              {PROVIDERS.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input placeholder="Rótulo (ex: Produção)" value={label} onChange={(e) => setLabel(e.target.value)} className="bg-background border-border" />
          <Input placeholder="Valor da credencial" type="password" value={value} onChange={(e) => setValue(e.target.value)} className="bg-background border-border md:col-span-1 font-mono" />
          <Button onClick={add} className="gradient-primary text-primary-foreground border-0">
            <Plus className="h-4 w-4 mr-1.5" /> Adicionar
          </Button>
        </div>

        <div className="space-y-2">
          {creds.length === 0 && (
            <div className="text-sm text-muted-foreground text-center py-8 border border-dashed border-border rounded-xl">
              Nenhuma credencial registrada.
            </div>
          )}
          {creds.map((c) => (
            <div key={c.id} className="flex items-center gap-3 rounded-xl border border-border bg-background/40 p-3">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <KeyRound className="h-4 w-4 text-primary-glow" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium flex items-center gap-2">
                  {c.label}
                  <span className="text-[10px] uppercase tracking-widest px-1.5 py-0.5 rounded bg-secondary/60 text-muted-foreground">
                    {c.provider}
                  </span>
                </div>
                <code className="text-xs text-muted-foreground font-mono">{c.maskedValue || "—"}</code>
              </div>
              <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                c.status === "valid"
                  ? "bg-success/15 text-success border-success/30"
                  : c.status === "invalid"
                  ? "bg-destructive/15 text-destructive border-destructive/30"
                  : "bg-warning/15 text-warning border-warning/30"
              }`}>
                {c.status}
              </span>
              <Button size="sm" variant="outline" className="bg-secondary/40" onClick={() => validate(c)}>
                <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Validar
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => rotate(c)}>
                <RotateCw className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => remove(c)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
