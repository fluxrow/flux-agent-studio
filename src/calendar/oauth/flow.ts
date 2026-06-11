import { GCAL_CLIENT_ID, GCAL_REDIRECT_URI, GCAL_SCOPES } from "./config";
import { supabase } from "@/integrations/supabase/client";

/**
 * Initiates the Google OAuth flow. Redirects the user to Google's
 * consent screen. The state is signed by the Edge Function so the callback
 * can trust the user/workspace binding.
 */
export async function initiateAuth(_userId?: string, workspaceId?: string): Promise<void> {
  if (!GCAL_CLIENT_ID) {
    throw new Error("VITE_GCAL_CLIENT_ID não configurado.");
  }

  const { data, error } = await supabase.functions.invoke("google-oauth-callback", {
    body: { action: "create_state", workspaceId },
  });
  if (error || typeof data?.state !== "string") {
    throw new Error("Não foi possível iniciar a conexão com o Google Calendar.");
  }

  const params = new URLSearchParams({
    client_id: GCAL_CLIENT_ID,
    redirect_uri: GCAL_REDIRECT_URI,
    response_type: "code",
    access_type: "offline",
    prompt: "consent",
    scope: GCAL_SCOPES,
    state: data.state,
    include_granted_scopes: "true",
  });

  window.location.href =
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}
