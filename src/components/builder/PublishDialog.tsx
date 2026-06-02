import { useState } from "react";
import { useParams } from "react-router-dom";
import { Loader2, Check, Copy, ExternalLink, Rocket } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { persistence } from "@/domain/persistence";
import { useBuilder } from "@/builder/BuilderContext";
import { useBot } from "@/domain/hooks";
import { toast } from "sonner";
import type { Flow } from "@/types";
import { recordActivation } from "@/beta/activation";
import { useWorkspace } from "@/auth/WorkspaceProvider";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export function PublishDialog({ open, onOpenChange }: Props) {
  const { id: botId } = useParams();
  const { flow, validation } = useBuilder();
  const { data: bot, refetch } = useBot(botId);

  const [slug, setSlug] = useState(bot?.slug ?? slugify(bot?.name ?? flow.metadata?.name ?? "meu-bot"));
  const [note, setNote] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [publishedSlug, setPublishedSlug] = useState<string | null>(bot?.publishedAt ? bot.slug ?? null : null);

  const publicUrl = publishedSlug ? `${window.location.origin}/bot/${publishedSlug}` : null;

  const handlePublish = async () => {
    if (!botId) return;
    if (!validation.valid) {
      toast.error("Flow inválido. Corrija os erros antes de publicar.");
      return;
    }
    setPublishing(true);
    try {
      const result = await persistence.bots.publish(botId, flow as Flow, slug || undefined, note || undefined);
      setPublishedSlug(result.slug ?? slug);
      toast.success("Bot publicado!");
      refetch();
    } catch (err: any) {
      toast.error(err?.message ?? "Falha ao publicar");
    } finally {
      setPublishing(false);
    }
  };

  const copyLink = () => {
    if (!publicUrl) return;
    navigator.clipboard.writeText(publicUrl);
    toast.success("Link copiado");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Rocket className="h-4 w-4 text-primary" /> Publicar bot
          </DialogTitle>
          <DialogDescription>
            Gera uma URL pública para que visitantes conversem com o bot e gerem leads no CRM.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="slug" className="text-xs">Slug público</Label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => setSlug(slugify(e.target.value))}
              placeholder="meu-bot"
              className="bg-background"
            />
            <p className="text-[11px] text-muted-foreground">
              {window.location.origin}/bot/<span className="font-mono">{slug || "..."}</span>
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="note" className="text-xs">Nota da versão (opcional)</Label>
            <Input
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ex: ajuste de qualificação"
              className="bg-background"
            />
          </div>

          {!validation.valid && (
            <div className="text-xs text-destructive bg-destructive/10 border border-destructive/30 rounded-md p-2">
              {validation.errors.length} erro(s) impedem a publicação.
            </div>
          )}

          {publicUrl && (
            <div className="rounded-lg border border-success/30 bg-success/5 p-3 space-y-2">
              <div className="flex items-center gap-2 text-xs font-medium text-success">
                <Check className="h-3.5 w-3.5" /> Publicado com sucesso
              </div>
              <div className="flex items-center gap-2">
                <code className="text-[11px] font-mono bg-background border border-border rounded px-2 py-1 truncate flex-1">
                  {publicUrl}
                </code>
                <Button size="icon" variant="outline" className="h-8 w-8 shrink-0" onClick={copyLink}>
                  <Copy className="h-3.5 w-3.5" />
                </Button>
                <a href={publicUrl} target="_blank" rel="noreferrer">
                  <Button size="icon" variant="outline" className="h-8 w-8 shrink-0">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                </a>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Fechar</Button>
          <Button
            onClick={handlePublish}
            disabled={publishing || !validation.valid || !slug}
            className="gradient-primary text-primary-foreground border-0"
          >
            {publishing ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Rocket className="h-4 w-4 mr-1.5" />}
            {publishedSlug ? "Republicar" : "Publicar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
