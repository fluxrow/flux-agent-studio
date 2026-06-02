/**
 * Central de Documentação (Phase 20).
 *
 * Página inicial agrupando guias por tema. Conteúdo curto e inline por
 * enquanto — links para artigos completos virão em fases futuras.
 */
import { Link } from "react-router-dom";
import {
  Rocket, Bot, Users, BarChart3, Activity, Sparkles, BookOpen, Plug, ArrowUpRight,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { ContextualFeedback } from "@/components/beta/ContextualFeedback";

type DocSection = {
  icon: typeof Rocket;
  title: string;
  description: string;
  topics: string[];
  /** Rota relacionada para o usuário "ver no app". */
  appRoute?: string;
  cta?: string;
};

const sections: DocSection[] = [
  {
    icon: Rocket,
    title: "Primeiros Passos",
    description: "Criar seu workspace, convidar o time e configurar o primeiro bot em minutos.",
    topics: ["Criar workspace", "Convidar colegas", "Conectar um canal", "Publicar primeiro bot"],
    appRoute: "/onboarding",
    cta: "Abrir onboarding",
  },
  {
    icon: Bot,
    title: "Builder",
    description: "Como montar fluxos: blocos, conexões, condições, variáveis e versionamento.",
    topics: ["Paleta de blocos", "Conectar saídas", "Variáveis & condições", "Salvar rascunho · Publicar"],
    appRoute: "/bots",
    cta: "Ir para Bots",
  },
  {
    icon: Users,
    title: "CRM",
    description: "Pipeline de leads, estágios, scoring, tags e timeline de atividade.",
    topics: ["Estágios do pipeline", "Score & temperatura", "Tags & owner", "Timeline do lead"],
    appRoute: "/leads",
    cta: "Ver leads",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    description: "Funil de conversão, performance por bloco e tendências semanais.",
    topics: ["KPIs principais", "Funil", "Performance por bloco", "Tendências"],
    appRoute: "/analytics",
    cta: "Abrir analytics",
  },
  {
    icon: Activity,
    title: "Tracking",
    description: "Eventos, destinos (Meta/Google), UTM, fbclid e atribuição.",
    topics: ["Pixels & destinos", "UTMs aceitos", "Atribuição last-click", "Inspecionar disparos"],
    appRoute: "/tracking",
    cta: "Abrir tracking",
  },
  {
    icon: Sparkles,
    title: "IA",
    description: "Blocos de IA, provedores suportados e o AI Builder (geração de fluxo por prompt).",
    topics: ["Bloco IA", "Provedores & modelos", "AI Builder", "Custos por requisição"],
    appRoute: "/ai-builder",
    cta: "AI Builder",
  },
  {
    icon: BookOpen,
    title: "Knowledge Base",
    description: "Ingestão de documentos, chunking, embeddings e recuperação para o bot.",
    topics: ["Subir documentos", "Pipeline de embeddings", "Retriever no fluxo", "Custo de ingestão"],
    appRoute: "/knowledge",
    cta: "Abrir Knowledge",
  },
  {
    icon: Plug,
    title: "Integrações",
    description: "Conectores oficiais (Slack, Sheets, Telegram, Webhook) e contas conectadas.",
    topics: ["Instalar conector", "Salvar credenciais com segurança", "Mapear variáveis", "Logs de execução"],
    appRoute: "/connectors",
    cta: "Ver conectores",
  },
];

export default function Docs() {
  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      <PageHeader
        eyebrow="Documentação"
        title="Central de Documentação"
        description="Guias rápidos para tirar o máximo do FluxBot."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {sections.map((s) => (
          <article
            key={s.title}
            className="group rounded-2xl border border-border bg-card/60 p-5 hover:border-primary/40 hover:shadow-elegant transition flex flex-col"
          >
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow flex-shrink-0">
                <s.icon className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="min-w-0">
                <h3 className="font-display text-base font-semibold">{s.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{s.description}</p>
              </div>
            </div>

            <ul className="mt-4 space-y-1.5 text-xs text-muted-foreground flex-1">
              {s.topics.map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-primary-glow" /> {t}
                </li>
              ))}
            </ul>

            {s.appRoute && (
              <Link
                to={s.appRoute}
                className="mt-5 inline-flex items-center gap-1 text-xs font-medium text-primary-glow hover:underline"
              >
                {s.cta ?? "Abrir"} <ArrowUpRight className="h-3 w-3" />
              </Link>
            )}
          </article>
        ))}
      </div>

      <div className="rounded-2xl border border-dashed border-border bg-card/30 p-6 text-center space-y-3">
        <p className="text-sm text-muted-foreground">
          Não encontrou o que procura? Use o widget de feedback no canto da tela —
          ele chega direto para o time.
        </p>
        <div className="flex justify-center">
          <ContextualFeedback surface="docs" />
        </div>
      </div>
    </div>
  );
}
