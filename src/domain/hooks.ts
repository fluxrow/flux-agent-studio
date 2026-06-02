/**
 * React-Query hooks wrapping the domain repositories.
 * Pages should use these hooks instead of importing mocks directly.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { repositories } from "@/domain";
import type { BotCreateInput, ID, LeadStage, ListParams } from "@/types";

/* ---------- Bots ---------- */
export const botKeys = {
  all: ["bots"] as const,
  list: (params?: ListParams) => ["bots", "list", params ?? {}] as const,
  detail: (id: ID) => ["bots", "detail", id] as const,
};

export const useBots = (params?: ListParams) =>
  useQuery({
    queryKey: botKeys.list(params),
    queryFn: () => repositories.bots.list(params),
  });

export const useBot = (id: ID | undefined) =>
  useQuery({
    queryKey: botKeys.detail(id ?? ""),
    queryFn: () => repositories.bots.get(id!),
    enabled: !!id,
  });

export const useCreateBot = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: BotCreateInput) => repositories.bots.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: botKeys.all }),
  });
};

/* ---------- Leads ---------- */
export const leadKeys = {
  all: ["leads"] as const,
  byStage: ["leads", "byStage"] as const,
  stages: ["leads", "stages"] as const,
};

export const useLeadsByStage = () =>
  useQuery({ queryKey: leadKeys.byStage, queryFn: () => repositories.leads.byStage() });

export const usePipelineStages = () =>
  useQuery({ queryKey: leadKeys.stages, queryFn: () => repositories.leads.stages() });

export const useUpdateLeadStage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, stage }: { id: ID; stage: LeadStage }) =>
      repositories.leads.updateStage(id, stage),
    onSuccess: () => qc.invalidateQueries({ queryKey: leadKeys.all }),
  });
};

/* ---------- Templates ---------- */
export const templateKeys = { all: ["templates"] as const };
export const useTemplates = () =>
  useQuery({ queryKey: templateKeys.all, queryFn: () => repositories.templates.list() });

/* ---------- Channels ---------- */
export const channelKeys = { all: ["channels"] as const };
export const useChannels = () =>
  useQuery({ queryKey: channelKeys.all, queryFn: () => repositories.channels.list() });

export const useConnectChannel = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, account }: { id: ID; account: string }) =>
      repositories.channels.connect(id, account),
    onSuccess: () => qc.invalidateQueries({ queryKey: channelKeys.all }),
  });
};

export const useDisconnectChannel = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: ID) => repositories.channels.disconnect(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: channelKeys.all }),
  });
};

/* ---------- Conversations ---------- */
export const conversationKeys = {
  all: ["conversations"] as const,
  list: ["conversations", "list"] as const,
  messages: (sessionId: ID) => ["conversations", "messages", sessionId] as const,
};

export const useConversations = () =>
  useQuery({ queryKey: conversationKeys.list, queryFn: () => repositories.conversations.list() });

export const useMessages = (sessionId: ID | undefined) =>
  useQuery({
    queryKey: conversationKeys.messages(sessionId ?? ""),
    queryFn: () => repositories.conversations.messagesBySession(sessionId!),
    enabled: !!sessionId,
  });

/* ---------- Flow ---------- */
export const flowKeys = { byBot: (botId: ID) => ["flow", botId] as const };
export const useFlow = (botId: ID | undefined) =>
  useQuery({
    queryKey: flowKeys.byBot(botId ?? ""),
    queryFn: () => repositories.flows.getByBot(botId!),
    enabled: !!botId,
  });
