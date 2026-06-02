/**
 * One-shot seed of demo data into the current Supabase workspace.
 * Triggered manually from Settings → Workspace.
 */
import { supabase } from "@/integrations/supabase/client";
import { getCurrentWorkspaceId } from "@/domain/persistence/workspaceContext";
import { mockBots } from "@/mocks/bots";
import { mockLeads } from "@/mocks/leads";
import { mockChannels } from "@/mocks/channels";

export async function seedDemoData() {
  const wsId = getCurrentWorkspaceId();

  // Skip if already seeded (any bot in the workspace).
  const { count } = await supabase
    .from("bots")
    .select("id", { count: "exact", head: true })
    .eq("workspace_id", wsId);
  if ((count ?? 0) > 0) {
    return { skipped: true, reason: "Workspace já contém dados." };
  }

  const botRows = mockBots.slice(0, 6).map((b) => ({
    workspace_id: wsId,
    name: b.name,
    description: b.description,
    channel: b.channel,
    status: b.status,
    conversations_count: b.metrics.conversations,
    conversions_count: b.metrics.conversions,
  }));
  const { data: botsInserted, error: botsErr } = await supabase
    .from("bots")
    .insert(botRows)
    .select("id, name");
  if (botsErr) throw botsErr;

  const firstBotId = botsInserted?.[0]?.id ?? null;

  const leadRows = mockLeads.map((l) => ({
    workspace_id: wsId,
    bot_id: firstBotId,
    name: l.name,
    email: l.email,
    phone: l.phone,
    source: l.source,
    stage: l.stage,
    score: l.score,
    temperature: l.temperature,
  }));
  await supabase.from("leads").insert(leadRows);

  const channelRows = mockChannels.map((c) => ({
    workspace_id: wsId,
    channel_key: c.kind,
    name: c.name,
    description: c.description,
    status: c.status === "soon" ? "em_breve" : c.status,
    account: c.account ?? null,
    coming_soon: c.status === "soon",
  }));
  await supabase.from("channels").insert(channelRows as any);

  return {
    skipped: false,
    bots: botRows.length,
    leads: leadRows.length,
    channels: channelRows.length,
  };
}
