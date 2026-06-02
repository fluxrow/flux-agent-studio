import { supabase } from "@/integrations/supabase/client";
import type { ExecutionEvent } from "@/types";
import type { EventQuery, EventRepository } from "../contracts";
import { getCurrentWorkspaceId, tryGetCurrentWorkspaceId } from "../workspaceContext";

const mapRow = (r: any): ExecutionEvent => ({
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

export const supabaseEventRepository: EventRepository = {
  async record(event: ExecutionEvent) {
    const wsId = tryGetCurrentWorkspaceId();
    if (!wsId) return; // event firing before workspace is ready — drop silently
    const { error } = await supabase.from("events").insert({
      workspace_id: wsId,
      session_id: event.sessionId || null,
      flow_id: null, // flow id from runtime is the bot id slug — not a uuid yet
      bot_id: event.botId ?? null,
      block_key: event.blockId ?? null,
      type: event.type,
      payload: (event.payload ?? {}) as any,
      occurred_at: event.at,
    });
    if (error) console.error("[supabaseEventRepository.record]", error);
  },
  async query(params: EventQuery = {}) {
    const wsId = getCurrentWorkspaceId();
    let q = supabase
      .from("events")
      .select("*")
      .eq("workspace_id", wsId)
      .order("occurred_at", { ascending: false });
    if (params.sessionId) q = q.eq("session_id", params.sessionId);
    if (params.botId) q = q.eq("bot_id", params.botId);
    if (params.type) q = q.eq("type", params.type);
    if (params.limit) q = q.limit(params.limit);
    const { data, error } = await q;
    if (error) throw error;
    return (data ?? []).map(mapRow);
  },
  async clear() {
    const wsId = getCurrentWorkspaceId();
    const { error } = await supabase.from("events").delete().eq("workspace_id", wsId);
    if (error) throw error;
  },
};
