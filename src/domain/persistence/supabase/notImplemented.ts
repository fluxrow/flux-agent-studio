/**
 * Phase 18.6 / BUG-03 — Real Supabase adapters for flows, conversations,
 * versions, variables, templates. Replaces the empty-stub module shipped in
 * Phase 6 so saving a draft, editing blocks and publishing a snapshot round
 * trip through the database instead of disappearing on reload.
 *
 * Mapping notes:
 *   - `Block.id` is stored as `flow_blocks.block_key` so we don't depend on
 *     server-generated UUIDs (the client mints stable ids).
 *   - `Connection.fromBlockId/toBlockId` map to `from_block_key/to_block_key`.
 *   - `flows.variables` is a JSONB column we use both for the variable
 *     declarations and as the source for `variables.listByBot`.
 *
 * Templates and workspace-scoped variables have no schema yet — they return
 * empty data and are marked `stub` by the persistence facade so the debug
 * panel is honest about it.
 */
import { supabase } from "@/integrations/supabase/client";
import type {
  Block,
  Connection,
  Flow,
  FlowMetadata,
  FlowVariableDecl,
  ID,
  Message,
  Session,
  Variable,
} from "@/types";
import type {
  ConversationRepository,
  FlowRepository,
  FlowVersion,
  TemplateRepository,
  VariableRepository,
  VersionRepository,
} from "../contracts";
import { getCurrentWorkspaceId } from "../workspaceContext";

/* ─────────────── Flow helpers ─────────────── */

async function ensureFlowRow(botId: ID): Promise<{ id: string; workspaceId: string; name: string; variables: FlowVariableDecl[] }> {
  const wsId = getCurrentWorkspaceId();
  const existing = await supabase
    .from("flows")
    .select("id, workspace_id, name, variables")
    .eq("bot_id", botId)
    .eq("workspace_id", wsId)
    .maybeSingle();
  if (existing.error) throw existing.error;
  if (existing.data) {
    return {
      id: existing.data.id,
      workspaceId: existing.data.workspace_id,
      name: existing.data.name,
      variables: (existing.data.variables as unknown as FlowVariableDecl[]) ?? [],
    };
  }
  const inserted = await supabase
    .from("flows")
    .insert({ bot_id: botId, workspace_id: wsId, name: "Main flow", variables: [] })
    .select("id, workspace_id, name, variables")
    .single();
  if (inserted.error) throw inserted.error;
  return {
    id: inserted.data.id,
    workspaceId: inserted.data.workspace_id,
    name: inserted.data.name,
    variables: (inserted.data.variables as unknown as FlowVariableDecl[]) ?? [],
  };
}

const nowIso = () => new Date().toISOString();

const mapBlock = (botId: ID, r: any): Block => ({
  id: r.block_key,
  botId,
  type: r.type,
  label: r.label ?? "",
  position: r.position ?? { x: 0, y: 0 },
  config: r.config ?? {},
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

const mapConnection = (botId: ID, r: any): Connection => ({
  id: r.connection_key,
  botId,
  fromBlockId: r.from_block_key,
  toBlockId: r.to_block_key,
  condition: r.condition ?? undefined,
  createdAt: r.created_at,
  updatedAt: r.created_at,
});

export const supabaseFlowRepository: FlowRepository = {
  async getByBot(botId) {
    const wsId = getCurrentWorkspaceId();
    const flowRes = await supabase
      .from("flows")
      .select("id, name, variables, updated_at")
      .eq("bot_id", botId)
      .eq("workspace_id", wsId)
      .maybeSingle();
    if (flowRes.error) throw flowRes.error;
    if (!flowRes.data) return null;
    const flowId = flowRes.data.id;

    const [blocksRes, connsRes, botRes] = await Promise.all([
      supabase.from("flow_blocks").select("*").eq("flow_id", flowId).eq("workspace_id", wsId),
      supabase.from("flow_connections").select("*").eq("flow_id", flowId).eq("workspace_id", wsId),
      supabase
        .from("bots")
        .select("status, channel, published_at, name")
        .eq("id", botId)
        .maybeSingle(),
    ]);
    if (blocksRes.error) throw blocksRes.error;
    if (connsRes.error) throw connsRes.error;

    const status: FlowMetadata["status"] = botRes.data?.published_at ? "published" : "draft";
    const flow: Flow = {
      botId,
      blocks: (blocksRes.data ?? []).map((r) => mapBlock(botId, r)),
      connections: (connsRes.data ?? []).map((r) => mapConnection(botId, r)),
      variables: (flowRes.data.variables as unknown as FlowVariableDecl[]) ?? [],
      metadata: {
        name: botRes.data?.name ?? flowRes.data.name,
        version: 1,
        status,
        primaryChannel: botRes.data?.channel,
        lastEditedAt: flowRes.data.updated_at ?? nowIso(),
      },
    };
    return flow;
  },

  async saveBlocks(botId, blocks) {
    const flow = await ensureFlowRow(botId);
    // Replace strategy: delete blocks that are no longer present, upsert the rest.
    const keepKeys = blocks.map((b) => b.id);
    const del = await supabase
      .from("flow_blocks")
      .delete()
      .eq("flow_id", flow.id)
      .not("block_key", "in", `(${keepKeys.map((k) => `"${k}"`).join(",") || '""'})`);
    if (del.error) throw del.error;
    if (blocks.length === 0) return;
    const rows = blocks.map((b) => ({
      flow_id: flow.id,
      workspace_id: flow.workspaceId,
      block_key: b.id,
      type: b.type,
      label: b.label,
      position: b.position,
      config: b.config,
    }));
    const upsert = await supabase
      .from("flow_blocks")
      .upsert(rows, { onConflict: "flow_id,block_key" });
    if (upsert.error) throw upsert.error;
  },

  async saveConnections(botId, connections) {
    const flow = await ensureFlowRow(botId);
    const del = await supabase
      .from("flow_connections")
      .delete()
      .eq("flow_id", flow.id)
      .eq("workspace_id", flow.workspaceId);
    if (del.error) throw del.error;
    if (connections.length === 0) return;
    const rows = connections.map((c) => ({
      flow_id: flow.id,
      workspace_id: flow.workspaceId,
      connection_key: c.id,
      from_block_key: c.fromBlockId,
      to_block_key: c.toBlockId,
      condition: c.condition ?? null,
    }));
    const ins = await supabase.from("flow_connections").insert(rows);
    if (ins.error) throw ins.error;
  },
};

/* ─────────────── Versions ─────────────── */

const mapVersion = (r: any): FlowVersion => ({
  id: r.id,
  botId: r.bot_id,
  version: r.version,
  status: r.status,
  snapshot: r.snapshot as Flow,
  createdAt: r.created_at,
  createdBy: r.created_by ?? undefined,
  note: r.note ?? undefined,
});

export const supabaseVersionRepository: VersionRepository = {
  async listByBot(botId) {
    const wsId = getCurrentWorkspaceId();
    const { data, error } = await supabase
      .from("bot_versions")
      .select("*")
      .eq("bot_id", botId)
      .eq("workspace_id", wsId)
      .order("version", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapVersion);
  },
  async get(id) {
    const { data, error } = await supabase
      .from("bot_versions")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data ? mapVersion(data) : null;
  },
  async publish(botId, snapshot, note) {
    const { data, error } = await supabase.rpc("publish_bot" as any, {
      _bot_id: botId,
      _snapshot: snapshot as any,
      _slug: null,
      _note: note ?? null,
    });
    if (error) throw error;
    const versions = await supabase
      .from("bot_versions")
      .select("*")
      .eq("bot_id", botId)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (versions.error) throw versions.error;
    return versions.data
      ? mapVersion(versions.data)
      : {
          id: data?.id ?? "ver_unknown",
          botId,
          version: 1,
          status: "published",
          snapshot,
          createdAt: nowIso(),
          note,
        };
  },
  async rollback(botId, versionId) {
    const version = await this.get(versionId);
    if (!version) throw new Error("Version not found");
    return this.publish(botId, version.snapshot, `Rollback to v${version.version}`);
  },
};

/* ─────────────── Conversations ─────────────── */

const mapConversation = (r: any) => ({
  id: r.id,
  sessionId: r.session_id,
  leadName: r.lead_name,
  botName: r.bot_name,
  preview: r.preview,
  unread: r.unread ?? 0,
  time: r.last_message_at ?? r.updated_at,
  status: r.status,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

const mapSession = (r: any): Session => ({
  id: r.id,
  botId: r.bot_id,
  leadId: r.lead_id ?? undefined,
  visitorId: r.visitor_id,
  channel: r.channel,
  status: r.status,
  startedAt: r.started_at,
  endedAt: r.ended_at ?? undefined,
  variables: r.variables ?? {},
  currentBlockId: r.current_block_key ?? undefined,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

const mapMessage = (r: any): Message => ({
  id: r.id,
  sessionId: r.session_id,
  role: r.role,
  text: r.text,
  blockId: r.block_key ?? undefined,
  sentAt: r.sent_at,
  createdAt: r.created_at,
  updatedAt: r.created_at,
});

export const supabaseConversationRepository: ConversationRepository = {
  async list(params = {}) {
    const wsId = getCurrentWorkspaceId();
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 50;
    let q = supabase
      .from("conversations")
      .select("*", { count: "exact" })
      .eq("workspace_id", wsId)
      .order("last_message_at", { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);
    if (params.search) q = q.ilike("lead_name", `%${params.search}%`);
    const { data, error, count } = await q;
    if (error) throw error;
    return {
      items: (data ?? []).map(mapConversation),
      total: count ?? data?.length ?? 0,
      page,
      pageSize,
    };
  },
  async get(id) {
    const { data, error } = await supabase.from("conversations").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return data ? mapConversation(data) : null;
  },
  async messagesBySession(sessionId) {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("session_id", sessionId)
      .order("sent_at", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(mapMessage);
  },
  async sessionById(id) {
    const { data, error } = await supabase.from("sessions").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return data ? mapSession(data) : null;
  },
};

/* ─────────────── Variables ─────────────── */

export const supabaseVariableRepository: VariableRepository = {
  async listByBot(botId) {
    const wsId = getCurrentWorkspaceId();
    const { data, error } = await supabase
      .from("flows")
      .select("variables")
      .eq("bot_id", botId)
      .eq("workspace_id", wsId)
      .maybeSingle();
    if (error) throw error;
    const decls = ((data?.variables as unknown as FlowVariableDecl[]) ?? []);
    const now = nowIso();
    return decls.map<Variable>((d, idx) => ({
      id: `${botId}:${d.name}:${idx}`,
      botId,
      workspaceId: wsId,
      key: d.name,
      type: (d.type ?? "string") as Variable["type"],
      scope: "bot",
      defaultValue: d.defaultValue ?? null,
      description: d.description,
      createdAt: now,
      updatedAt: now,
    }));
  },
  async listWorkspace() {
    // Workspace-scoped variables have no dedicated table yet (Phase 19).
    return [];
  },
};

/* ─────────────── Templates ─────────────── */

export const supabaseTemplateRepository: TemplateRepository = {
  async list() {
    // No `templates` table yet. The marketplace catalog (Phase 19) will own
    // these; for now the UI falls back to the curated client list.
    return [];
  },
  async get() {
    return null;
  },
};
