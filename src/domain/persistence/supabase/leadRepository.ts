import { supabase } from "@/integrations/supabase/client";
import type {
  Conversation, CrmStats, ExecutionEvent, ID, Lead, LeadCreateInput,
  LeadStage, ListParams, PipelineStage,
} from "@/types";
import type { LeadRepository } from "../contracts";
import { getCurrentWorkspaceId } from "../workspaceContext";
import { countConverted } from "@/lib/leadStages";

const STAGES: PipelineStage[] = [
  { id: "novo",        label: "Novo",          color: "muted" },
  { id: "qualificado", label: "Qualificado",   color: "accent" },
  { id: "negociacao",  label: "Em negociação", color: "warning" },
  { id: "convertido",  label: "Convertido",    color: "success" },
  { id: "perdido",     label: "Perdido",       color: "destructive" },
];

const mapRow = (r: any): Lead => ({
  id: r.id,
  workspaceId: r.workspace_id,
  name: r.name,
  email: r.email ?? undefined,
  phone: r.phone ?? undefined,
  company: r.company ?? undefined,
  source: r.source,
  stage: r.stage,
  score: r.score,
  temperature: r.temperature,
  botId: r.bot_id ?? undefined,
  ownerId: r.owner_id ?? undefined,
  tags: r.tags ?? undefined,
  notes: r.notes ?? undefined,
  lastActivityAt: r.last_activity_at ?? undefined,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

const mapEvent = (r: any): ExecutionEvent => ({
  id: r.id,
  type: r.type,
  sessionId: r.session_id ?? "",
  flowId: r.flow_id ?? "",
  botId: r.bot_id ?? undefined,
  workspaceId: r.workspace_id,
  blockId: r.block_key ?? undefined,
  at: r.occurred_at,
  payload: r.payload ?? {},
});

const patchRow = (patch: Partial<Lead>): Record<string, unknown> => {
  const row: Record<string, unknown> = {};
  if (patch.name !== undefined) row.name = patch.name;
  if (patch.email !== undefined) row.email = patch.email;
  if (patch.phone !== undefined) row.phone = patch.phone;
  if (patch.company !== undefined) row.company = patch.company;
  if (patch.source !== undefined) row.source = patch.source;
  if (patch.stage !== undefined) row.stage = patch.stage;
  if (patch.score !== undefined) row.score = patch.score;
  if (patch.temperature !== undefined) row.temperature = patch.temperature;
  if (patch.botId !== undefined) row.bot_id = patch.botId;
  if (patch.ownerId !== undefined) row.owner_id = patch.ownerId;
  if (patch.tags !== undefined) row.tags = patch.tags;
  if (patch.notes !== undefined) row.notes = patch.notes;
  return row;
};

async function recordLeadEvent(
  wsId: ID,
  leadId: ID,
  type: ExecutionEvent["type"],
  payload: Record<string, unknown> = {},
) {
  await supabase.from("events").insert({
    workspace_id: wsId,
    lead_id: leadId,
    type,
    payload: payload as any,
    occurred_at: new Date().toISOString(),
  });
}

export const supabaseLeadRepository: LeadRepository = {
  async list(params: (ListParams & { stage?: LeadStage }) = {}) {
    const wsId = getCurrentWorkspaceId();
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 100;
    let q = supabase
      .from("leads")
      .select("*", { count: "exact" })
      .eq("workspace_id", wsId)
      .order("updated_at", { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);
    if (params.stage) q = q.eq("stage", params.stage);
    if (params.search) q = q.ilike("name", `%${params.search}%`);
    const { data, error, count } = await q;
    if (error) throw error;
    return {
      items: (data ?? []).map(mapRow),
      total: count ?? 0,
      page,
      pageSize,
    };
  },
  async get(id: ID) {
    const { data, error } = await supabase.from("leads").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return data ? mapRow(data) : null;
  },
  async byStage() {
    const wsId = getCurrentWorkspaceId();
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .eq("workspace_id", wsId)
      .order("updated_at", { ascending: false });
    if (error) throw error;
    const grouped = STAGES.reduce((acc, s) => {
      acc[s.id] = (data ?? []).filter((r: any) => r.stage === s.id).map(mapRow);
      return acc;
    }, {} as Record<LeadStage, Lead[]>);
    return grouped;
  },
  async stages() {
    return STAGES;
  },
  async updateStage(id: ID, stage: LeadStage) {
    const wsId = getCurrentWorkspaceId();
    const prev = await this.get(id);
    const { data, error } = await supabase
      .from("leads")
      .update({ stage })
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw error;
    await recordLeadEvent(wsId, id, "lead_updated", {
      change: "stage",
      from: prev?.stage,
      to: stage,
    });
    return mapRow(data);
  },
  async create(input: LeadCreateInput) {
    const wsId = getCurrentWorkspaceId();
    const { data, error } = await supabase
      .from("leads")
      .insert({
        workspace_id: wsId,
        name: input.name,
        email: input.email ?? null,
        phone: input.phone ?? null,
        company: input.company ?? null,
        source: input.source ?? "manual",
        stage: input.stage ?? "novo",
        score: input.score ?? 0,
        temperature: input.temperature ?? "frio",
        bot_id: input.botId ?? null,
        owner_id: input.ownerId ?? null,
        tags: input.tags ?? null,
        notes: input.notes ?? null,
      })
      .select("*")
      .single();
    if (error) throw error;
    const lead = mapRow(data);
    await recordLeadEvent(wsId, lead.id, "lead_created", {
      source: lead.source,
      stage: lead.stage,
    });
    return lead;
  },
  async update(id, patch) {
    const wsId = getCurrentWorkspaceId();
    const { data, error } = await supabase
      .from("leads")
      .update(patchRow(patch) as any)
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw error;
    await recordLeadEvent(wsId, id, "lead_updated", { changed: Object.keys(patch) });
    return mapRow(data);
  },
  async remove(id) {
    const { error } = await supabase.from("leads").delete().eq("id", id);
    if (error) throw error;
  },
  async addTag(id, tag) {
    const lead = await this.get(id);
    if (!lead) throw new Error("Lead não encontrado");
    const tags = Array.from(new Set([...(lead.tags ?? []), tag]));
    return this.update(id, { tags });
  },
  async removeTag(id, tag) {
    const lead = await this.get(id);
    if (!lead) throw new Error("Lead não encontrado");
    return this.update(id, { tags: (lead.tags ?? []).filter((t) => t !== tag) });
  },
  async timeline(leadId) {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("lead_id", leadId)
      .order("occurred_at", { ascending: false })
      .limit(200);
    if (error) throw error;
    return (data ?? []).map(mapEvent);
  },
  async conversations(leadId) {
    const wsId = getCurrentWorkspaceId();
    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .eq("workspace_id", wsId)
      .in(
        "session_id",
        (
          await supabase
            .from("sessions")
            .select("id")
            .eq("workspace_id", wsId)
            .eq("lead_id", leadId)
        ).data?.map((s: any) => s.id) ?? [],
      )
      .order("last_message_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((r: any) => ({
      id: r.id,
      sessionId: r.session_id,
      leadName: r.lead_name,
      botName: r.bot_name,
      preview: r.preview,
      unread: r.unread,
      time: r.last_message_at,
      status: r.status,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));
  },
  async crmStats(): Promise<CrmStats> {
    const wsId = getCurrentWorkspaceId();
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .eq("workspace_id", wsId)
      .order("last_activity_at", { ascending: false });
    if (error) throw error;
    const leads = (data ?? []).map(mapRow);
    const byStage = STAGES.reduce((acc, s) => {
      acc[s.id] = leads.filter((l) => l.stage === s.id).length;
      return acc;
    }, {} as Record<LeadStage, number>);
    const won = countConverted(leads, (l) => l.stage);
    const lost = byStage.perdido;
    const decided = won + lost;
    return {
      total: leads.length,
      byStage,
      conversionRate: decided > 0 ? won / decided : 0,
      wonCount: won,
      lostCount: lost,
      recent: leads.slice(0, 8),
    };
  },
};
