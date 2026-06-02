import { supabase } from "@/integrations/supabase/client";
import type { ExecutionEvent, ExecutionHistory, ID, Session } from "@/types";
import type { SessionRepository } from "../contracts";
import { getCurrentWorkspaceId, tryGetCurrentWorkspaceId } from "../workspaceContext";

const mapRow = (r: any): Session => ({
  id: r.id,
  botId: r.bot_id,
  leadId: r.lead_id ?? undefined,
  visitorId: r.visitor_id,
  channel: r.channel,
  status: r.status,
  startedAt: r.started_at,
  endedAt: r.ended_at ?? undefined,
  variables: r.variables ?? {},
  currentBlockId: r.current_block_key ?? undefined,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

export const supabaseSessionRepository: SessionRepository = {
  async create(input) {
    const wsId = getCurrentWorkspaceId();
    const { data, error } = await supabase
      .from("sessions")
      .insert({
        id: input.id,
        workspace_id: wsId,
        bot_id: input.botId,
        lead_id: input.leadId ?? null,
        visitor_id: input.visitorId,
        channel: input.channel,
        status: input.status,
        started_at: input.startedAt,
        ended_at: input.endedAt ?? null,
        variables: input.variables ?? {},
        current_block_key: input.currentBlockId ?? null,
      })
      .select("*")
      .single();
    if (error) throw error;
    return mapRow(data);
  },
  async get(id: ID) {
    const { data, error } = await supabase.from("sessions").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return data ? mapRow(data) : null;
  },
  async listByBot(botId: ID) {
    const { data, error } = await supabase
      .from("sessions")
      .select("*")
      .eq("bot_id", botId)
      .order("started_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapRow);
  },
  async update(id: ID, patch: Partial<Session>) {
    const row: Record<string, unknown> = {};
    if (patch.status !== undefined) row.status = patch.status;
    if (patch.endedAt !== undefined) row.ended_at = patch.endedAt;
    if (patch.variables !== undefined) row.variables = patch.variables;
    if (patch.currentBlockId !== undefined) row.current_block_key = patch.currentBlockId;
    if (patch.leadId !== undefined) row.lead_id = patch.leadId;
    const { data, error } = await supabase
      .from("sessions")
      .update(row)
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw error;
    return mapRow(data);
  },
  async appendHistory(sessionId: ID, event: ExecutionEvent) {
    const wsId = tryGetCurrentWorkspaceId();
    if (!wsId) return;
    const { error } = await supabase.from("events").insert({
      workspace_id: wsId,
      session_id: sessionId,
      bot_id: event.botId ?? null,
      block_key: event.blockId ?? null,
      type: event.type,
      payload: event.payload ?? {},
      occurred_at: event.at,
    });
    if (error) console.error("[appendHistory]", error);
  },
  async history(sessionId: ID): Promise<ExecutionHistory | null> {
    const session = await this.get(sessionId);
    if (!session) return null;
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("session_id", sessionId)
      .order("occurred_at", { ascending: true });
    if (error) throw error;
    return {
      sessionId,
      flowId: session.botId,
      botId: session.botId,
      startedAt: session.startedAt,
      endedAt: session.endedAt,
      events: (data ?? []).map((r: any) => ({
        id: r.id,
        type: r.type,
        sessionId: r.session_id ?? "",
        flowId: r.flow_id ?? "",
        botId: r.bot_id ?? undefined,
        blockId: r.block_key ?? undefined,
        at: r.occurred_at,
        payload: r.payload ?? {},
      })),
    };
  },
};
