import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { listQAItems, setQAStatus, qaSummary, type QAStatus, type QAItem } from "@/beta";

const STATUS_STYLE: Record<QAStatus, { icon: typeof CheckCircle2; cls: string; label: string }> = {
  pass:    { icon: CheckCircle2, cls: "text-emerald-500 border-emerald-500/30 bg-emerald-500/10", label: "Pass" },
  fail:    { icon: XCircle, cls: "text-destructive border-destructive/30 bg-destructive/10", label: "Fail" },
  pending: { icon: Clock, cls: "text-muted-foreground border-border", label: "Pending" },
};

export default function QA() {
  const [tick, setTick] = useState(0);
  const items: QAItem[] = listQAItems();
  const summary = qaSummary();

  const update = (key: QAItem["key"], status: QAStatus, note?: string) => {
    setQAStatus(key, status, note);
    setTick((t) => t + 1);
  };

  const groups: Record<string, QAItem[]> = {};
  items.forEach((i) => { (groups[i.group] ??= []).push(i); });

  return (
    <div className="p-6 space-y-6" key={tick}>
      <PageHeader
        eyebrow="Beta · QA"
        title="QA Dashboard"
        description="Checklist interno antes de liberar novos usuários beta."
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4"><div className="text-xs uppercase tracking-widest text-muted-foreground">Total</div><div className="text-2xl font-bold">{summary.total}</div></Card>
        <Card className="p-4"><div className="text-xs uppercase tracking-widest text-emerald-500">Pass</div><div className="text-2xl font-bold">{summary.pass}</div></Card>
        <Card className="p-4"><div className="text-xs uppercase tracking-widest text-destructive">Fail</div><div className="text-2xl font-bold">{summary.fail}</div></Card>
        <Card className="p-4"><div className="text-xs uppercase tracking-widest text-muted-foreground">Pending</div><div className="text-2xl font-bold">{summary.pending}</div></Card>
      </div>

      <div className="space-y-6">
        {Object.entries(groups).map(([group, gItems]) => (
          <div key={group} className="space-y-2">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">{group}</div>
            {gItems.map((i) => {
              const S = STATUS_STYLE[i.status];
              return (
                <Card key={i.key} className="p-4 flex items-center gap-3 flex-wrap">
                  <S.icon className={`h-5 w-5 ${S.cls.split(" ")[0]}`} />
                  <div className="flex-1 min-w-[200px]">
                    <div className="font-medium">{i.label}</div>
                    {i.note && <div className="text-xs text-muted-foreground mt-0.5">{i.note}</div>}
                  </div>
                  <Badge variant="outline" className={S.cls}>{S.label}</Badge>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" onClick={() => update(i.key, "pass")}>Pass</Button>
                    <Button size="sm" variant="outline" onClick={() => update(i.key, "fail")}>Fail</Button>
                    <Button size="sm" variant="ghost" onClick={() => update(i.key, "pending")}>Reset</Button>
                  </div>
                  <Input
                    placeholder="Nota (opcional)"
                    className="w-full md:w-64"
                    defaultValue={i.note ?? ""}
                    onBlur={(e) => update(i.key, i.status, e.target.value || undefined)}
                  />
                </Card>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
