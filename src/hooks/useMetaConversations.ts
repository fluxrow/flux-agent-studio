/**
 * useMetaConversations — queries meta_conversations from Supabase and
 * subscribes to Realtime updates so the inbox refreshes when the
 * meta-webhook Edge Function inserts new messages.
 */
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentWorkspaceId } from "@/domain/persistence/workspaceContext";
import type { MetaConversation, MetaMessage, MetaPlatform, MetaHandoffStatus } from "@/channels/meta/types";

function mapConvRow(row: any): MetaConversation {
  return {
    id:                    row.id,
    workspaceId:           row.workspace_id,
    connectionId:          row.connection_id,
    platform:              row.platform as MetaPlatform,
    externalConversationId: row.external_conversation_id,
    contactExternalId:     row.contact_external_id,
    contactName:           row.contact_name,
    contactAvatar:         row.contact_avatar ?? undefined,
    preview:               row.preview,
    unread:                row.unread,
    handoffStatus:         row.handoff_status as MetaHandoffStatus,
    lastMessageAt:         row.last_message_at,
    createdAt:             row.created_at,
    updatedAt:             row.updated_at,
  };
}

function mapMsgRow(row: any): MetaMessage {
  return {
    id:                row.id,
    workspaceId:       row.workspace_id,
    conversationId:    row.conversation_id,
    externalMessageId: row.external_message_id,
    direction:         row.direction,
    messageType:       row.message_type,
    messageText:       row.message_text ?? undefined,
    contactExternalId: row.contact_external_id,
    sentAt:            row.sent_at,
    rawPayload:        row.raw_payload ?? undefined,
    createdAt:         row.created_at,
  };
}

export function useMetaConversations(platformFilter?: MetaPlatform) {
  const [conversations, setConversations] = useState<MetaConversation[]>([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState<string | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const workspaceId = getCurrentWorkspaceId();
      let q = supabase
        .from("meta_conversations")
        .select("*")
        .eq("workspace_id", workspaceId)
        .order("last_message_at", { ascending: false })
        .limit(100);

      if (platformFilter) q = q.eq("platform", platformFilter);

      const { data, error: e } = await q;
      if (e) throw e;
      setConversations((data ?? []).map(mapConvRow));
    } catch (e: any) {
      setError(e.message ?? "Erro ao carregar conversas");
    } finally {
      setLoading(false);
    }
  }, [platformFilter]);

  // Subscribe to Realtime inserts/updates on meta_conversations
  useEffect(() => {
    load();

    const workspaceId = getCurrentWorkspaceId();
    const ch = supabase
      .channel(`meta_conversations:${workspaceId}`)
      .on("postgres_changes", {
        event:  "*",
        schema: "public",
        table:  "meta_conversations",
        filter: `workspace_id=eq.${workspaceId}`,
      }, payload => {
        if (payload.eventType === "INSERT") {
          const newConv = mapConvRow(payload.new);
          if (!platformFilter || newConv.platform === platformFilter) {
            setConversations(prev => [newConv, ...prev]);
          }
        } else if (payload.eventType === "UPDATE") {
          const updated = mapConvRow(payload.new);
          setConversations(prev =>
            prev.map(c => c.id === updated.id ? updated : c)
                .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime())
          );
        }
      })
      .subscribe();

    channelRef.current = ch;
    return () => { supabase.removeChannel(ch); };
  }, [load, platformFilter]);

  const markRead = useCallback(async (conversationId: string) => {
    await supabase
      .from("meta_conversations")
      .update({ unread: 0 })
      .eq("id", conversationId);
    setConversations(prev =>
      prev.map(c => c.id === conversationId ? { ...c, unread: 0 } : c)
    );
  }, []);

  const setHandoffStatus = useCallback(async (
    conversationId: string,
    status: MetaHandoffStatus,
  ) => {
    await supabase
      .from("meta_conversations")
      .update({ handoff_status: status })
      .eq("id", conversationId);
    setConversations(prev =>
      prev.map(c => c.id === conversationId ? { ...c, handoffStatus: status } : c)
    );
  }, []);

  return { conversations, loading, error, refresh: load, markRead, setHandoffStatus };
}

export function useMetaMessages(conversationId: string | null) {
  const [messages, setMessages] = useState<MetaMessage[]>([]);
  const [loading, setLoading]   = useState(false);

  const load = useCallback(async () => {
    if (!conversationId) { setMessages([]); return; }
    setLoading(true);
    const { data } = await supabase
      .from("meta_messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("sent_at", { ascending: true })
      .limit(200);
    setMessages((data ?? []).map(mapMsgRow));
    setLoading(false);
  }, [conversationId]);

  useEffect(() => {
    load();
    if (!conversationId) return;

    const ch = supabase
      .channel(`meta_messages:${conversationId}`)
      .on("postgres_changes", {
        event:  "INSERT",
        schema: "public",
        table:  "meta_messages",
        filter: `conversation_id=eq.${conversationId}`,
      }, payload => {
        setMessages(prev => [...prev, mapMsgRow(payload.new)]);
      })
      .subscribe();

    return () => { supabase.removeChannel(ch); };
  }, [load, conversationId]);

  return { messages, loading };
}
