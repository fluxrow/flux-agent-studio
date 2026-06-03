// Phase 23A — fabricated variables removed. Variables surface as soon as the
// user collects fields (name, email, phone) inside the Builder.
import { Link } from "react-router-dom";
import { Variable as VarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";

export default function Variables() {
  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1400px] mx-auto">
      <div>
        <h1 className="font-display text-3xl font-bold">Variáveis</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Use <code className="text-primary-glow font-mono">{`{{variavel}}`}</code> em qualquer mensagem ou condição.
        </p>
      </div>

      <EmptyState
        icon={VarIcon}
        title="Nenhuma variável criada ainda."
        description="As variáveis surgem quando você coleta dados no Builder, como nome, email ou telefone."
        action={
          <Link to="/bots">
            <Button className="gradient-primary text-primary-foreground border-0 shadow-elegant">
              Abrir bots
            </Button>
          </Link>
        }
      />
    </div>
  );
}
