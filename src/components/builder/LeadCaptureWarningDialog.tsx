import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle } from "lucide-react";

interface Props {
  open: boolean;
  missing: Array<"nome" | "email" | "telefone">;
  onOpenChange: (v: boolean) => void;
  onPublishAnyway: () => void;
  onAddCapture: () => void;
}

/**
 * Phase 25A — Warns the user when they try to publish a bot that does not
 * collect any contact information. Does NOT block publication.
 */
export function LeadCaptureWarningDialog({
  open, missing, onOpenChange, onPublishAnyway, onAddCapture,
}: Props) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            Seu agente não está capturando leads.
          </AlertDialogTitle>
          <AlertDialogDescription>
            Este fluxo conversa com usuários, mas não coleta nenhuma informação
            de contato ({missing.join(", ")}). Você pode publicar mesmo assim,
            mas nenhum lead vai aparecer no CRM até você adicionar um bloco de
            pergunta para nome, email ou telefone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onAddCapture}>
            Adicionar captura de lead
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onPublishAnyway}
            className="bg-warning text-warning-foreground hover:bg-warning/90"
          >
            Publicar mesmo assim
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
