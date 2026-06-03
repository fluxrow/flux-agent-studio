/**
 * Phase 23C — Auto-derived activation steps.
 *
 * Reads the active persistence layer + local stores and decides — without
 * any manual "mark as done" — which of the 5 activation milestones a
 * workspace has reached. Powers ActivationBanner, ActivationTasksCard
 * and NextStepCTA on the Dashboard.
 */
import { useQuery } from "@tanstack/react-query";
import { persistence } from "@/domain/persistence";
import { connectorStore } from "@/connectors/store";
import { knowledgeStore } from "@/knowledge/store";
import { useWorkspace } from "@/auth/WorkspaceProvider";

export type ActivationStepKey =
  | "create_bot"
  | "publish_bot"
  | "first_lead"
  | "configure_channel"
  | "add_knowledge";

export interface ActivationStep {
  key: ActivationStepKey;
  label: string;
  ctaLabel: string;
  ctaHref: string;
  done: boolean;
}

export interface ActivationState {
  steps: ActivationStep[];
  completed: number;
  total: number;
  percent: number;
  botCount: number;
  leadCount: number;
  publishedBotCount: number;
  isNewWorkspace: boolean;
  nextStep: ActivationStep | null;
}

async function compute(workspaceId: string): Promise<ActivationState> {
  const [bots, leads, channels] = await Promise.all([
    persistence.bots.list({ page: 1, pageSize: 50 }),
    persistence.leads.list({ page: 1, pageSize: 1 }),
    persistence.channels.list().catch(() => [] as Array<{ status?: string }>),
  ]);

  const botCount = bots.total ?? bots.items.length;
  const leadCount = leads.total ?? leads.items.length;
  const publishedBotCount = bots.items.filter(
    (b) => b.status === "ativo" || (b as { publishedAt?: string }).publishedAt,
  ).length;

  const hasChannel =
    (channels ?? []).some((c) => c.status === "connected" || c.status === "conectado" || c.status === "ativo") ||
    connectorStore.list(workspaceId).length > 0;
  const hasKnowledge = knowledgeStore.listBases(workspaceId).length > 0;

  const steps: ActivationStep[] = [
    { key: "create_bot",        label: "Criar primeiro bot",     ctaLabel: "Criar bot",        ctaHref: "/bots/new",   done: botCount > 0 },
    { key: "publish_bot",       label: "Publicar agente",        ctaLabel: "Publicar agente",  ctaHref: "/bots",       done: publishedBotCount > 0 },
    { key: "first_lead",        label: "Capturar primeiro lead", ctaLabel: "Gerar primeiro lead", ctaHref: "/leads",   done: leadCount > 0 },
    { key: "configure_channel", label: "Configurar canal",       ctaLabel: "Configurar canal", ctaHref: "/channels",   done: hasChannel },
    { key: "add_knowledge",     label: "Adicionar conhecimento", ctaLabel: "Adicionar conhecimento", ctaHref: "/knowledge", done: hasKnowledge },
  ];

  const completed = steps.filter((s) => s.done).length;
  const total = steps.length;
  const percent = Math.round((completed / total) * 100);
  const nextStep = steps.find((s) => !s.done) ?? null;
  const isNewWorkspace = botCount === 0 && leadCount === 0 && percent < 100;

  return { steps, completed, total, percent, botCount, leadCount, publishedBotCount, isNewWorkspace, nextStep };
}

export function useActivationState() {
  const { workspace } = useWorkspace();
  const wsId = workspace?.id ?? "ws_local_demo";
  return useQuery({
    queryKey: ["activation", "state", wsId],
    queryFn: () => compute(wsId),
    staleTime: 15_000,
  });
}
