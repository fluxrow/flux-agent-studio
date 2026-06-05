/**
 * Meta channel connection CRUD — frontend layer.
 * Reads/writes meta_channel_connections via the Supabase client (RLS-protected).
 * The access_token is sent to Supabase and stored server-side; it is never
 * returned to the browser after initial save (SELECT * returns it — for
 * production, use a DB function that masks the token).
 */
import { supabase as supabaseTyped } from "@/integrations/supabase/client";
// Cast: meta_channel_connections lives in a migration not yet reflected in generated types.
const supabase = supabaseTyped as any;
import { getCurrentWorkspaceId } from "@/domain/persistence/workspaceContext";
import type { CreateMetaConnectionInput, MetaChannelConnection, MetaPlatform } from "./types";

function mapRow(row: any): MetaChannelConnection {
  return {
    id:              row.id,
    workspaceId:     row.workspace_id,
    platform:        row.platform as MetaPlatform,
    displayName:     row.display_name ?? "",
    phoneNumberId:   row.phone_number_id ?? undefined,
    pageId:          row.page_id ?? undefined,
    igUserId:        row.ig_user_id ?? undefined,
    accessToken:     row.access_token,
    webhookVerified: row.webhook_verified ?? false,
    status:          row.status,
    errorMessage:    row.error_message ?? undefined,
    meta:            row.meta ?? {},
    createdAt:       row.created_at,
    updatedAt:       row.updated_at,
  };
}

export const metaConnectionService = {
  async list(): Promise<MetaChannelConnection[]> {
    const workspaceId = getCurrentWorkspaceId();
    const { data, error } = await supabase
      .from("meta_channel_connections")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return (data ?? []).map(mapRow);
  },

  async create(input: CreateMetaConnectionInput): Promise<MetaChannelConnection> {
    const workspaceId = getCurrentWorkspaceId();
    const { data, error } = await supabase
      .from("meta_channel_connections")
      .insert({
        workspace_id:    workspaceId,
        platform:        input.platform,
        display_name:    input.displayName,
        access_token:    input.accessToken,
        phone_number_id: input.phoneNumberId ?? null,
        page_id:         input.pageId ?? null,
        ig_user_id:      input.igUserId ?? null,
      })
      .select()
      .single();

    if (error) throw error;
    return mapRow(data);
  },

  async markVerified(id: string): Promise<void> {
    const { error } = await supabase
      .from("meta_channel_connections")
      .update({ webhook_verified: true, status: "active" })
      .eq("id", id);
    if (error) throw error;
  },

  async setStatus(id: string, status: "active" | "inactive" | "error", errorMessage?: string): Promise<void> {
    const { error } = await supabase
      .from("meta_channel_connections")
      .update({ status, error_message: errorMessage ?? null })
      .eq("id", id);
    if (error) throw error;
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase
      .from("meta_channel_connections")
      .delete()
      .eq("id", id);
    if (error) throw error;
  },
};

export async function sendMetaMessage(
  connectionId: string,
  recipientId:  string,
  text:         string,
): Promise<void> {
  const { data, error } = await supabase.functions.invoke("meta-send", {
    body: { connection_id: connectionId, recipient_id: recipientId, message_text: text },
  });
  if (error) throw error;
  if (!(data as any)?.ok) throw new Error((data as any)?.error ?? "Send failed");
}
