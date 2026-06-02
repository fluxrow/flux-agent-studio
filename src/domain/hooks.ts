/**
 * React-Query hooks wrapping the persistence facade.
 * Pages must use these hooks instead of touching repositories directly.
 * The facade decides mock vs Supabase based on VITE_USE_SUPABASE.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { persistence } from "@/domain/persistence";
import type {
  BotCreateInput, ID, Lead, LeadCreateInput, LeadStage, ListParams,
} from "@/types";

/* ---------- Bots ---------- */
export const botKeys = {
  all: ["bots"] as const,
  list: (params?: ListParams) => ["bots", "list", params ?? {}] as const,
  detail: (id: ID) => ["bots", "detail", id] as const,
};

export const useBots = (params?: ListParams) =>
  useQuery({
    queryKey: botKeys.list(params),
    queryFn: () => persistence.bots.list(params),
  });

export const useBot = (id: ID | undefined) =>
  useQuery({
    queryKey: botKeys.detail(id ?? ""),
    queryFn: () => persistence.bots.get(id!),
    enabled: !!id,
  });

export const useCreateBot = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: BotCreateInput) => persistence.bots.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: botKeys.all }),
  });
};

/* ---------- Leads ---------- */
export const leadKeys = {
  all: ["leads"] as const,
  byStage: ["leads", "byStage"] as const,
  stages: ["leads", "stages"] as const,
  detail: (id: ID) => ["leads", "detail", id] as const,
  timeline: (id: ID) => ["leads", "timeline", id] as const,
  conversations: (id: ID) => ["leads", "conversations", id] as const,
  stats: ["leads", "stats"] as const,
};

export const useLeadsByStage = () =>
  useQuery({ queryKey: leadKeys.byStage, queryFn: () => persistence.leads.byStage() });

export const usePipelineStages = () =>
  useQuery({ queryKey: leadKeys.stages, queryFn: () => persistence.leads.stages() });

export const useLead = (id: ID | undefined) =>
  useQuery({
    queryKey: leadKeys.detail(id ?? ""),
    queryFn: () => persistence.leads.get(id!),
    enabled: !!id,
  });

export const useLeadTimeline = (id: ID | undefined) =>
  useQuery({
    queryKey: leadKeys.timeline(id ?? ""),
    queryFn: () => persistence.leads.timeline(id!),
    enabled: !!id,
  });

export const useLeadConversations = (id: ID | undefined) =>
  useQuery({
    queryKey: leadKeys.conversations(id ?? ""),
    queryFn: () => persistence.leads.conversations(id!),
    enabled: !!id,
  });

export const useCrmStats = () =>
  useQuery({ queryKey: leadKeys.stats, queryFn: () => persistence.leads.crmStats() });

const invalidateLeads = (qc: ReturnType<typeof useQueryClient>) => {
  qc.invalidateQueries({ queryKey: leadKeys.all });
};

export const useUpdateLeadStage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, stage }: { id: ID; stage: LeadStage }) =>
      persistence.leads.updateStage(id, stage),
    onSuccess: () => invalidateLeads(qc),
  });
};

export const useCreateLead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: LeadCreateInput) => persistence.leads.create(input),
    onSuccess: () => invalidateLeads(qc),
  });
};

export const useUpdateLead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: ID; patch: Partial<Lead> }) =>
      persistence.leads.update(id, patch),
    onSuccess: () => invalidateLeads(qc),
  });
};

export const useDeleteLead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: ID) => persistence.leads.remove(id),
    onSuccess: () => invalidateLeads(qc),
  });
};

export const useAddLeadTag = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, tag }: { id: ID; tag: string }) => persistence.leads.addTag(id, tag),
    onSuccess: () => invalidateLeads(qc),
  });
};

export const useRemoveLeadTag = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, tag }: { id: ID; tag: string }) => persistence.leads.removeTag(id, tag),
    onSuccess: () => invalidateLeads(qc),
  });
};

/* ---------- Templates ---------- */
export const templateKeys = { all: ["templates"] as const };
export const useTemplates = () =>
  useQuery({ queryKey: templateKeys.all, queryFn: () => persistence.templates.list() });

/* ---------- Channels ---------- */
export const channelKeys = { all: ["channels"] as const };
export const useChannels = () =>
  useQuery({ queryKey: channelKeys.all, queryFn: () => persistence.channels.list() });

export const useConnectChannel = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, account }: { id: ID; account: string }) =>
      persistence.channels.connect(id, account),
    onSuccess: () => qc.invalidateQueries({ queryKey: channelKeys.all }),
  });
};

export const useDisconnectChannel = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: ID) => persistence.channels.disconnect(id),
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
  useQuery({ queryKey: conversationKeys.list, queryFn: () => persistence.conversations.list() });

export const useMessages = (sessionId: ID | undefined) =>
  useQuery({
    queryKey: conversationKeys.messages(sessionId ?? ""),
    queryFn: () => persistence.conversations.messagesBySession(sessionId!),
    enabled: !!sessionId,
  });

/* ---------- Flow ---------- */
export const flowKeys = { byBot: (botId: ID) => ["flow", botId] as const };
export const useFlow = (botId: ID | undefined) =>
  useQuery({
    queryKey: flowKeys.byBot(botId ?? ""),
    queryFn: () => persistence.flows.getByBot(botId!),
    enabled: !!botId,
  });
