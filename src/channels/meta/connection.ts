/**
 * Meta channel connection CRUD — frontend layer.
 * Reads sanitized connection metadata through security-definer RPCs. Tokens
 * are accepted on creation but never returned to the browser.
 */
import { supabase as supabaseTyped } from "@/integrations/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";
// Cast: meta_channel_connections lives in a migration not yet reflected in generated types.
const supabase = supabaseTyped as unknown as SupabaseClient;
import { getCurrentWorkspaceId } from "@/domain/persistence/workspaceContext";
import type { CreateMetaConnectionInput, MetaChannelConnection, MetaPlatform } from "./types";

interface MetaConnectionRow {
  id: string;
  workspace_id: string;
  platform: MetaPlatform;
  display_name: string | null;
  phone_number_id: string | null;
  page_id: string | null;
  ig_user_id: string | null;
  webhook_verified: boolean | null;
  status: MetaChannelConnection["status"];
  error_message: string | null;
  meta: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

function mapRow(row: MetaConnectionRow): MetaChannelConnection {
  return {
    id:              row.id,
    workspaceId:     row.workspace_id,
    platform:        row.platform as MetaPlatform,
    displayName:     row.display_name ?? "",
    phoneNumberId:   row.phone_number_id ?? undefined,
    pageId:          row.page_id ?? undefined,
    igUserId:        row.ig_user_id ?? undefined,
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
    const { data, error } = await supabase.rpc("list_meta_channel_connections", {
      target_workspace_id: workspaceId,
    });

    if (error) throw error;
    return (data ?? []).map(mapRow);
  },

  async create(input: CreateMetaConnectionInput): Promise<MetaChannelConnection> {
    const workspaceId = getCurrentWorkspaceId();
    const { data, error } = await supabase.rpc("create_meta_channel_connection", {
      target_workspace_id: workspaceId,
      target_platform: input.platform,
      target_display_name: input.displayName,
      target_access_token: input.accessToken,
      target_phone_number_id: input.phoneNumberId ?? null,
      target_page_id: input.pageId ?? null,
      target_ig_user_id: input.igUserId ?? null,
    });

    if (error) throw error;
    const row = Array.isArray(data) ? data[0] : data;
    if (!row) throw new Error("Connection was created but could not be loaded");

    const created = mapRow(row);
    const { data: verification, error: verificationError } = await supabase.functions.invoke(
      "meta-verify-connection",
      { body: { connection_id: created.id } },
    );
    if (verificationError) throw verificationError;

    const result = verification as {
      ok?: boolean;
      status?: MetaChannelConnection["status"];
      detail?: string;
    } | null;
    if (!result?.ok) {
      throw new Error(result?.detail ?? "A Meta não validou o token e os identificadores informados.");
    }

    return {
      ...created,
      status: result.status ?? "active",
      updatedAt: new Date().toISOString(),
    };
  },

  async setStatus(id: string, status: "active" | "inactive" | "error", errorMessage?: string): Promise<void> {
    if (status === "active") {
      throw new Error("Meta connections can only be activated after server-side verification.");
    }
    const { error } = await supabase.rpc("set_meta_connection_status", {
      target_connection_id: id,
      target_status: status,
      target_error_message: errorMessage ?? null,
    });
    if (error) throw error;
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.rpc("delete_meta_connection", {
      target_connection_id: id,
    });
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
  const response = data as { ok?: boolean; error?: string } | null;
  if (!response?.ok) throw new Error(response?.error ?? "Send failed");
}
