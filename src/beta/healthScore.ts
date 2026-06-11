/**
 * Phase 21 — Workspace Health Score
 *
 * Computes a score 0–100 from the active persistence layer + local state.
 * Used by the Dashboard's "Workspace Health" card.
 */
import { useQuery } from "@tanstack/react-query";
import { persistence } from "@/domain/persistence";
import { connectorStore } from "@/connectors/store";
import { knowledgeStore } from "@/knowledge/store";
import { useWorkspace } from "@/auth/WorkspaceProvider";

export type HealthCriterionKey =
  | "has_bot"
  | "has_published_bot"
  | "has_lead"
  | "has_conversation"
  | "has_tracking"
  | "has_ai"
  | "has_knowledge"
  | "has_channel";

export interface HealthCriterion {
  key: HealthCriterionKey;
  label: string;
  ok: boolean;
  recommendation: string;
  ctaHref: string;
  ctaLabel: string;
}

export type HealthTier =
  | { key: "initial";     label: "Configuração Inicial"; min: 0;   max: 24 }
  | { key: "growing";     label: "Em Crescimento";       min: 25;  max: 49 }
  | { key: "operational"; label: "Operacional";          min: 50;  max: 79 }
  | { key: "advanced";    label: "Avançado";             min: 80;  max: 100 };

export const HEALTH_TIERS: HealthTier[] = [
  { key: "initial",     label: "Configuração Inicial", min: 0,  max: 24  },
  { key: "growing",     label: "Em Crescimento",       min: 25, max: 49  },
  { key: "operational", label: "Operacional",          min: 50, max: 79  },
  { key: "advanced",    label: "Avançado",             min: 80, max: 100 },
];

export function tierFor(score: number): HealthTier {
  return HEALTH_TIERS.find((t) => score >= t.min && score <= t.max) ?? HEALTH_TIERS[0];
}

async function compute(workspaceId: string): Promise<{ score: number; criteria: HealthCriterion[]; tier: HealthTier }> {
  const [bots, leads, convs, channels] = await Promise.all([
    persistence.bots.list({ page: 1, pageSize: 50 }),
    persistence.leads.list({ page: 1, pageSize: 1 }),
    persistence.conversations.list({ page: 1, pageSize: 1 }),
    persistence.channels.list().catch(() => [] as Array<{ status?: string }>),
  ]);

  const hasBot = bots.total > 0 || bots.items.length > 0;
  const hasPublishedBot = bots.items.some(
    (b) => b.status === "ativo" || (b as { publishedAt?: string }).publishedAt,
  );
  const hasLead = leads.total > 0;
  const hasConversation = convs.total > 0;
  const hasChannel = (channels ?? []).some(
    (c) => c.status === "conectado" || c.status === "ativo",
  );
  const hasTracking = (() => {
    try {
      return Boolean(localStorage.getItem("fluxbot.tracking.destinations"));
    } catch { return false; }
  })();
  // The server-side Lovable gateway is part of the deployed product runtime.
  const hasAI = true;
  const hasKnowledge = knowledgeStore.listBases(workspaceId).length > 0;
  const hasConnector = connectorStore.list(workspaceId).length > 0;

  const criteria: HealthCriterion[] = [
    { key: "has_bot",            label: "Possui bot",               ok: hasBot,
      recommendation: "Crie seu primeiro agente para começar.",     ctaHref: "/bots/new",   ctaLabel: "Criar bot" },
    { key: "has_published_bot",  label: "Possui bot publicado",     ok: hasPublishedBot,
      recommendation: "Publique um bot para gerar um link público.", ctaHref: "/bots",       ctaLabel: "Publicar" },
    { key: "has_lead",           label: "Possui lead",              ok: hasLead,
      recommendation: "Compartilhe o link público e capture leads.", ctaHref: "/leads",      ctaLabel: "Ver leads" },
    { key: "has_conversation",   label: "Possui conversa",          ok: hasConversation,
      recommendation: "Simule uma conversa para validar o fluxo.",   ctaHref: "/simulator",  ctaLabel: "Abrir simulador" },
    { key: "has_tracking",       label: "Tracking ativo",           ok: hasTracking,
      recommendation: "Conecte Meta/Google para medir conversões.", ctaHref: "/tracking",   ctaLabel: "Configurar" },
    { key: "has_ai",             label: "IA configurada",           ok: hasAI,
      recommendation: "Lovable AI ativo. Você pode adicionar uma chave própria se quiser.", ctaHref: "/settings", ctaLabel: "Gerenciar IA" },
    { key: "has_knowledge",      label: "Knowledge base",           ok: hasKnowledge,
      recommendation: "Suba documentos para alimentar respostas.",  ctaHref: "/knowledge",  ctaLabel: "Abrir Knowledge" },
    { key: "has_channel",        label: "Canal conectado",          ok: hasChannel || hasConnector,
      recommendation: "Conecte um canal (WhatsApp, Web, Telegram).", ctaHref: "/channels",   ctaLabel: "Conectar canal" },
  ];

  const okCount = criteria.filter((c) => c.ok).length;
  const score = Math.round((okCount / criteria.length) * 100);
  return { score, criteria, tier: tierFor(score) };
}


export function useWorkspaceHealth() {
  const { workspace } = useWorkspace();
  const wsId = workspace?.id ?? "ws_local_demo";
  return useQuery({
    queryKey: ["workspace", "health", wsId],
    queryFn: () => compute(wsId),
    staleTime: 30_000,
  });
}
