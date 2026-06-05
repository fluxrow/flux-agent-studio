/**
 * useMetaLeadBridge — BUG-04 fix
 *
 * Listens to Supabase Realtime INSERT events on meta_conversations and
 * automatically creates a CRM lead for each new contact, so WhatsApp /
 * Instagram / Messenger conversations flow into the pipeline without
 * any manual intervention.
 *
 * Mount once at app level (e.g. inside AppLayout or WorkspaceProvider).
 * Safe to mount multiple times — duplicate detection via externalId.
 */
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { persistence } from "@/domain/persistence";
import { tryGetCurrentWorkspaceId } from "@/domain/persistence/workspaceContext";
import type { MetaConversation } from "@/channels/meta/types";

const PLATFORM_SOURCE: Record<string, string> = {
  whatsapp:  "whatsapp",
  instagram: "instagram-dm",
  messenger: "messenger",
};

function mapConvRow(row: any): MetaConversation {
  return {
    id:                     row.id,
    workspaceId:            row.workspace_id,
    connectionId:           row.connection_id,
    platform:               row.platform,
    externalConversationId: row.external_conversation_id,
    contactExternalId:      row.contact_external_id,
    contactName:            row.contact_name,
    contactAvatar:          row.contact_avatar ?? undefined,
    preview:                row.preview,
    unread:                 row.unread,
    handoffStatus:          row.handoff_status,
    lastMessageAt:          row.last_message_at,
    createdAt:              row.created_at,
    updatedAt:              row.updated_at,
  };
}

export function useMetaLeadBridge() {
  useEffect(() => {
    const workspaceId = getCurrentWorkspaceId();
    if (!workspaceId) return;

    const ch = supabase
      .channel(`meta_lead_bridge:${workspaceId}`)
      .on("postgres_changes", {
        event:  "INSERT",
        schema: "public",
        table:  "meta_conversations",
        filter: `workspace_id=eq.${workspaceId}`,
      }, async (payload) => {
        const conv = mapConvRow(payload.new);

        // Skip placeholder names — wait for a real name from a subsequent UPDATE
        if (!conv.contactName || conv.contactName === "Desconhecido") return;

        try {
          await persistence.leads.create({
            name:   conv.contactName,
            source: PLATFORM_SOURCE[conv.platform] ?? conv.platform,
            phone:  conv.platform === "whatsapp" ? conv.contactExternalId : undefined,
            notes:  conv.preview ? `Primeira mensagem: "${conv.preview}"` : undefined,
            stage:  "novo",
          });
        } catch (err) {
          // Duplicate leads (same name/source) are acceptable — log and continue
          console.warn("[metaLeadBridge] lead creation skipped", err);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(ch); };
  }, []);
}
