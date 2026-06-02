import { supabase } from "@/integrations/supabase/client";
import type { User } from "@/types";
import type { UserRepository } from "../contracts";
import { getCurrentWorkspaceId } from "../workspaceContext";

const mapMember = (r: any, ws: string): User => ({
  id: r.user_id,
  workspaceId: ws,
  name: r.profile?.full_name ?? r.profile?.email ?? "Member",
  email: r.profile?.email ?? "",
  avatarUrl: r.profile?.avatar_url ?? undefined,
  role: r.role,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

export const supabaseUserRepository: UserRepository = {
  async me() {
    const wsId = getCurrentWorkspaceId();
    const { data: authData } = await supabase.auth.getUser();
    const uid = authData.user?.id;
    if (!uid) throw new Error("Not authenticated");
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", uid).maybeSingle();
    const { data: membership } = await supabase
      .from("workspace_members")
      .select("*")
      .eq("workspace_id", wsId)
      .eq("user_id", uid)
      .maybeSingle();
    return {
      id: uid,
      workspaceId: wsId,
      name: profile?.full_name ?? profile?.email ?? "You",
      email: profile?.email ?? authData.user?.email ?? "",
      avatarUrl: profile?.avatar_url ?? undefined,
      role: membership?.role ?? "viewer",
      createdAt: profile?.created_at ?? new Date().toISOString(),
      updatedAt: profile?.updated_at ?? new Date().toISOString(),
    };
  },
  async listByWorkspace(workspaceId) {
    const { data: members, error } = await supabase
      .from("workspace_members")
      .select("*")
      .eq("workspace_id", workspaceId);
    if (error) throw error;
    if (!members?.length) return [];
    const userIds = members.map((m: any) => m.user_id);
    const { data: profiles } = await supabase.from("profiles").select("*").in("id", userIds);
    const byId = new Map((profiles ?? []).map((p: any) => [p.id, p]));
    return members.map((m: any) => mapMember({ ...m, profile: byId.get(m.user_id) }, workspaceId));
  },
  async get(id) {
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
    if (!profile) return null;
    return {
      id: profile.id,
      workspaceId: getCurrentWorkspaceId(),
      name: profile.full_name ?? profile.email ?? "User",
      email: profile.email ?? "",
      avatarUrl: profile.avatar_url ?? undefined,
      role: "viewer",
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
    };
  },
};
