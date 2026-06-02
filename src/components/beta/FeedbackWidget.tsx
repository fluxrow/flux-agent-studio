import { useState } from "react";
import { useLocation } from "react-router-dom";
import { MessageCircle, X, Bug, Lightbulb, HelpCircle, Sparkles, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useWorkspace } from "@/auth/WorkspaceProvider";
import { submitFeedback, type FeedbackKind } from "@/beta";

const KINDS: { key: FeedbackKind; label: string; icon: typeof Bug }[] = [
  { key: "bug",        label: "Bug",        icon: Bug },
  { key: "suggestion", label: "Sugestão",   icon: Lightbulb },
  { key: "question",   label: "Dúvida",     icon: HelpCircle },
  { key: "feature",    label: "Feature",    icon: Sparkles },
];

export function FeedbackWidget() {
  const { workspace } = useWorkspace();
  // toast imported from sonner
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<FeedbackKind>("bug");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");

  const submit = () => {
    if (!message.trim()) return;
    submitFeedback({
      workspaceId: workspace?.id ?? "ws_local_demo",
      kind, message: message.trim(), page: pathname, email: email.trim() || undefined,
    });
    toast.success("Feedback enviado", { description: "Obrigado! Vamos analisar em breve." });
    setMessage(""); setEmail(""); setOpen(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        aria-label="Enviar feedback"
        className="fixed bottom-5 right-5 z-40 h-12 w-12 rounded-full gradient-primary shadow-glow flex items-center justify-center text-primary-foreground hover:scale-105 transition-transform"
      >
        <MessageCircle className="h-5 w-5" />
      </button>
    );
  }

  return (
    <Card className="fixed bottom-5 right-5 z-40 w-80 p-4 shadow-elegant border-primary/20">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-display font-bold">Enviar feedback</div>
        <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-4 gap-1 mb-3">
        {KINDS.map((k) => {
          const active = k.key === kind;
          return (
            <button
              key={k.key}
              onClick={() => setKind(k.key)}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg border text-[11px] transition ${
                active ? "border-primary bg-primary/10 text-primary-glow" : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              <k.icon className="h-3.5 w-3.5" />
              {k.label}
            </button>
          );
        })}
      </div>

      <Textarea
        placeholder="Descreva sua mensagem..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={4}
        className="mb-2"
      />
      <Input
        placeholder="E-mail (opcional)"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="mb-2"
      />
      <Button onClick={submit} className="w-full gradient-primary text-primary-foreground border-0">
        <Send className="h-3.5 w-3.5 mr-1.5" /> Enviar
      </Button>
    </Card>
  );
}
