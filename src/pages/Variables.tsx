import { Plus, Trash2, Variable as VarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

const vars = [
  { name: "nome", type: "Texto", default: "—", mask: "—", used: 12 },
  { name: "email", type: "Email", default: "—", mask: "validação RFC", used: 9 },
  { name: "telefone", type: "Telefone", default: "—", mask: "+55 (##) #####-####", used: 11 },
  { name: "empresa", type: "Texto", default: "—", mask: "—", used: 4 },
  { name: "utm_source", type: "Texto", default: "direct", mask: "—", used: 6 },
  { name: "utm_campaign", type: "Texto", default: "—", mask: "—", used: 6 },
  { name: "lead_score", type: "Número", default: "0", mask: "0-100", used: 8 },
];

export default function Variables() {
  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Variáveis</h1>
          <p className="text-muted-foreground text-sm mt-1">Use <code className="text-primary-glow font-mono">{`{{variavel}}`}</code> em qualquer mensagem ou condição</p>
        </div>
        <Button className="gradient-primary text-primary-foreground border-0 shadow-elegant"><Plus className="h-4 w-4 mr-1.5" /> Nova variável</Button>
      </div>

      <div className="rounded-2xl border border-border bg-card/60 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left px-5 py-3">Nome</th>
              <th className="text-left px-5 py-3">Tipo</th>
              <th className="text-left px-5 py-3">Padrão</th>
              <th className="text-left px-5 py-3">Validação / Máscara</th>
              <th className="text-left px-5 py-3">Usada em</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {vars.map((v) => (
              <tr key={v.name} className="border-t border-border hover:bg-secondary/20 transition">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-md bg-primary/15 text-primary-glow flex items-center justify-center"><VarIcon className="h-3.5 w-3.5" /></div>
                    <span className="font-mono text-primary-glow">{`{{${v.name}}}`}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-muted-foreground">{v.type}</td>
                <td className="px-5 py-3 text-muted-foreground">{v.default}</td>
                <td className="px-5 py-3 text-muted-foreground">{v.mask}</td>
                <td className="px-5 py-3"><span className="text-xs px-2 py-0.5 rounded-full bg-secondary">{v.used} blocos</span></td>
                <td className="px-5 py-3 text-right"><Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
