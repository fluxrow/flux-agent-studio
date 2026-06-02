import { supabase } from "@/integrations/supabase/client";
import type { Channel, ChannelKind, ID } from "@/types";
import type { ChannelRepository } from "../contracts";
import { getCurrentWorkspaceId } from "../workspaceContext";

const statusFromDb = (s: string): Channel["status"] =>
  s === "connected" ? "connected" : s === "em_breve" ? "soon" : "disconnected";

const mapRow = (r: any): Channel => ({
  id: r.id,
  workspaceId: r.workspace_id,
  kind: r.channel_key as ChannelKind,
  name: r.name,
  description: r.description ?? "",
  status: statusFromDb(r.status),
  account: r.account ?? undefined,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

export const supabaseChannelRepository: ChannelRepository = {
  async list() {
    const wsId = getCurrentWorkspaceId();
    const { data, error } = await supabase
      .from("channels")
      .select("*")
      .eq("workspace_id", wsId)
      .order("name");
    if (error) throw error;
    return (data ?? []).map(mapRow);
  },
  async connect(id: ID, account: string) {
    const { data, error } = await supabase
      .from("channels")
      .update({ status: "connected", account })
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw error;
    return mapRow(data);
  },
  async disconnect(id: ID) {
    const { data, error } = await supabase
      .from("channels")
      .update({ status: "disconnected", account: null })
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw error;
    return mapRow(data);
  },
};
