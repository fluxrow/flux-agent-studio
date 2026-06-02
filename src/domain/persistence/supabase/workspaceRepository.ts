import { supabase } from "@/integrations/supabase/client";
import type { Workspace } from "@/types";
import type { WorkspaceRepository } from "../contracts";
import { getCurrentWorkspaceId } from "../workspaceContext";

const mapRow = (r: any): Workspace => ({
  id: r.id,
  name: r.name,
  slug: r.slug,
  plan: r.plan,
  ownerId: r.owner_id,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

export const supabaseWorkspaceRepository: WorkspaceRepository = {
  async current() {
    const id = getCurrentWorkspaceId();
    const { data, error } = await supabase.from("workspaces").select("*").eq("id", id).single();
    if (error) throw error;
    return mapRow(data);
  },
  async get(id) {
    const { data, error } = await supabase.from("workspaces").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return data ? mapRow(data) : null;
  },
  async update(id, patch) {
    const row: Record<string, unknown> = {};
    if (patch.name) row.name = patch.name;
    if (patch.slug) row.slug = patch.slug;
    if (patch.plan) row.plan = patch.plan;
    const { data, error } = await supabase
      .from("workspaces")
      .update(row)
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw error;
    return mapRow(data);
  },
};
