import { supabase } from "@/integrations/supabase/client";
import type { ID, Lead, LeadStage, ListParams, PipelineStage } from "@/types";
import type { LeadRepository } from "../contracts";
import { getCurrentWorkspaceId } from "../workspaceContext";

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
  source: r.source,
  stage: r.stage,
  score: r.score,
  temperature: r.temperature,
  botId: r.bot_id ?? undefined,
  tags: r.tags ?? undefined,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

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
    const { data, error } = await supabase
      .from("leads")
      .update({ stage })
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw error;
    return mapRow(data);
  },
};
