import { supabase } from "@/integrations/supabase/client";
import { isDemoMode } from "@/beta/demoMode";
import { USE_SUPABASE } from "@/lib/runtime-config";
import { startPublicSession } from "@/lib/public-runtime";

export interface PublicRuntimeSession {
  sessionId: string;
  aiToken?: string;
}

interface PublicAiSessionRow {
  session_id: string;
  ai_token: string;
}

export async function startPublicRuntimeSession(
  slug: string,
  botId: string,
  workspaceId: string,
  visitorId: string,
): Promise<PublicRuntimeSession> {
  if (isDemoMode() || !USE_SUPABASE) {
    return {
      sessionId: await startPublicSession(slug, botId, workspaceId, visitorId),
    };
  }

  const { data, error } = await supabase.rpc(
    "record_public_session_with_ai_token" as never,
    {
      _slug: slug,
      _visitor_id: visitorId,
      _variables: {},
    } as never,
  );
  if (error) throw error;

  const result = data as unknown;
  const row = (Array.isArray(result) ? result[0] : result) as PublicAiSessionRow | null;
  if (!row?.session_id || !row.ai_token) {
    throw new Error("Public session token was not issued.");
  }

  return { sessionId: row.session_id, aiToken: row.ai_token };
}
