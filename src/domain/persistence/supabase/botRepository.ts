import { supabase } from "@/integrations/supabase/client";
import type { Bot, BotCreateInput, Flow, ID, ListParams } from "@/types";
import type { BotRepository } from "../contracts";
import { getCurrentWorkspaceId } from "../workspaceContext";

const mapRow = (r: any): Bot => ({
  id: r.id,
  workspaceId: r.workspace_id,
  name: r.name,
  description: r.description ?? "",
  status: r.status,
  channel: r.channel,
  slug: r.slug ?? null,
  publishedSnapshot: r.published_snapshot ?? null,
  publishedAt: r.published_at ?? null,
  metrics: {
    conversations: r.conversations_count ?? 0,
    conversions: r.conversions_count ?? 0,
  },
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

export const supabaseBotRepository: BotRepository = {
  async list(params: ListParams = {}) {
    const wsId = getCurrentWorkspaceId();
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 50;
    let q = supabase
      .from("bots")
      .select("*", { count: "exact" })
      .eq("workspace_id", wsId)
      .order("updated_at", { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);
    if (params.search) q = q.ilike("name", `%${params.search}%`);
    const { data, error, count } = await q;
    if (error) throw error;
    return {
      items: (data ?? []).map(mapRow),
      total: count ?? data?.length ?? 0,
      page,
      pageSize,
    };
  },
  async get(id: ID) {
    const { data, error } = await supabase.from("bots").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return data ? mapRow(data) : null;
  },
  async create(input: BotCreateInput) {
    const wsId = getCurrentWorkspaceId();
    const { data, error } = await supabase
      .from("bots")
      .insert({
        workspace_id: wsId,
        name: input.name,
        description: input.description ?? "",
        channel: input.channel,
      })
      .select("*")
      .single();
    if (error) throw error;
    return mapRow(data);
  },
  async update(id: ID, patch: Partial<Bot>) {
    const row: Record<string, unknown> = {};
    if (patch.name !== undefined) row.name = patch.name;
    if (patch.description !== undefined) row.description = patch.description;
    if (patch.status !== undefined) row.status = patch.status;
    if (patch.channel !== undefined) row.channel = patch.channel;
    if (patch.metrics) {
      row.conversations_count = patch.metrics.conversations;
      row.conversions_count = patch.metrics.conversions;
    }
    const { data, error } = await supabase
      .from("bots")
      .update(row as any)
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw error;
    return mapRow(data);
  },
  async remove(id: ID) {
    const { error } = await supabase.from("bots").delete().eq("id", id);
    if (error) throw error;
  },
  async publish(id: ID, snapshot: Flow, slug?: string, note?: string) {
    const { data, error } = await supabase.rpc("publish_bot" as any, {
      _bot_id: id,
      _snapshot: snapshot as any,
      _slug: slug ?? null,
      _note: note ?? null,
    });
    if (error) throw error;
    return mapRow(Array.isArray(data) ? data[0] : data);
  },
  async getBySlug(slug: string) {
    const { data, error } = await supabase
      .from("bots")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    return data ? mapRow(data) : null;
  },
};
