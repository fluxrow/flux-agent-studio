/**
 * Public Bot Runtime — façade used by the public chat page (`/bot/:slug`).
 *
 * Mock mode  → reads/writes the in-memory mock stores directly.
 * Supabase   → calls SECURITY DEFINER RPCs that anon role is allowed to
 *              execute (get_public_bot / record_public_session /
 *              record_public_event / record_public_message /
 *              record_public_lead).
 *
 * The page MUST go through this module — never the persistence facade
 * directly — because anon role doesn't have direct table access.
 */
import { supabase } from "@/integrations/supabase/client";
import { USE_SUPABASE } from "@/lib/runtime-config";
import { persistence } from "@/domain/persistence";
import { isDemoMode } from "@/beta/demoMode";
import { DEMO_BOTS, DEMO_FLOW } from "@/beta/demoDataset";
import type { Flow, Bot } from "@/types";

export interface PublicBot {
  id: string;
  slug: string;
  name: string;
  description?: string;
  channel?: string;
  workspaceId: string;
  snapshot: Flow;
  publishedAt?: string | null;
}

const visitorKey = (slug: string) => `fluxbot:visitor:${slug}`;
export function getOrCreateVisitorId(slug: string): string {
  if (typeof window === "undefined") return `anon_${Math.random().toString(36).slice(2, 10)}`;
  const existing = window.localStorage.getItem(visitorKey(slug));
  if (existing) return existing;
  const v = `anon_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
  window.localStorage.setItem(visitorKey(slug), v);
  return v;
}

export async function loadPublicBot(slug: string): Promise<PublicBot | null> {
  // Phase 26B.1C — Demo Runtime: short-circuit before hitting any backend.
  if (isDemoMode()) {
    const bot = DEMO_BOTS.find((b) => b.slug === slug);
    if (!bot) return null;
    return {
      id: bot.id,
      slug: bot.slug ?? slug,
      name: bot.name,
      description: bot.description,
      channel: bot.channel,
      workspaceId: bot.workspaceId,
      snapshot: DEMO_FLOW,
      publishedAt: bot.publishedAt ?? null,
    };
  }
  if (!USE_SUPABASE) {
    const bot: Bot | null = (await persistence.bots.getBySlug?.(slug)) ?? null;
    if (!bot) return null;
    let snapshot = bot.publishedSnapshot as Flow | undefined;
    if (!snapshot) {
      // mock fallback: load latest flow draft
      snapshot = (await persistence.flows.getByBot(bot.id)) ?? undefined;
    }
    if (!snapshot) return null;
    return {
      id: bot.id,
      slug: bot.slug ?? slug,
      name: bot.name,
      description: bot.description,
      channel: bot.channel,
      workspaceId: bot.workspaceId,
      snapshot,
      publishedAt: bot.publishedAt ?? null,
    };
  }
  const { data, error } = await supabase.rpc("get_public_bot" as any, { _slug: slug });
  if (error) throw error;
  if (!data) return null;
  const row = data as any;
  if (!row.snapshot) return null;
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    channel: row.channel,
    workspaceId: row.workspaceId,
    snapshot: row.snapshot as Flow,
    publishedAt: row.publishedAt,
  };
}

export async function startPublicSession(slug: string, botId: string, _workspaceId: string, visitorId: string): Promise<string> {
  if (!USE_SUPABASE) {
    const session = await persistence.sessions.create({
      id: `pub_${Math.random().toString(36).slice(2, 10)}`,
      botId,
      visitorId,
      channel: "web",
      status: "ativa",
      variables: {},
      startedAt: new Date().toISOString(),
    } as any);
    return session.id;
  }
  const { data, error } = await supabase.rpc("record_public_session" as any, {
    _slug: slug,
    _visitor_id: visitorId,
    _variables: {},
  });
  if (error) throw error;
  return data as string;
}

export async function recordPublicEvent(sessionId: string, type: string, payload: Record<string, unknown> = {}, blockKey?: string | null) {
  if (!USE_SUPABASE) {
    // Mock mode: rely on runtimeEventBus + mock event repository (auto-wired by engine)
    return;
  }
  const { error } = await supabase.rpc("record_public_event" as any, {
    _session_id: sessionId,
    _type: type,
    _payload: payload as any,
    _block_key: blockKey ?? null,
  });
  if (error) console.warn("[publicRuntime] event failed:", error.message);
}

export async function recordPublicMessage(sessionId: string, role: "bot" | "user" | "system", text: string, blockKey?: string | null) {
  if (!USE_SUPABASE) return;
  const { error } = await supabase.rpc("record_public_message" as any, {
    _session_id: sessionId,
    _role: role,
    _text: text,
    _block_key: blockKey ?? null,
  });
  if (error) console.warn("[publicRuntime] message failed:", error.message);
}

export interface PublicLeadInput {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  tags?: string[];
  score?: number;
}

export async function recordPublicLead(sessionId: string, botId: string, workspaceId: string, lead: PublicLeadInput): Promise<string | null> {
  if (!USE_SUPABASE) {
    const created = await persistence.leads.create({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      company: lead.company,
      source: "public-bot",
      botId,
      tags: lead.tags,
      score: lead.score,
    });
    try { await persistence.sessions.update(sessionId, { leadId: created.id }); } catch { /* mock */ }
    return created.id;
  }
  const { data, error } = await supabase.rpc("record_public_lead" as any, {
    _session_id: sessionId,
    _name: lead.name,
    _email: lead.email ?? null,
    _phone: lead.phone ?? null,
    _company: lead.company ?? null,
    _tags: lead.tags ?? null,
    _score: lead.score ?? 0,
  });
  if (error) {
    console.error("[publicRuntime] lead failed:", error.message);
    return null;
  }
  return data as string;
}

/* ---------------- Tracking (Phase 7) ---------------- */

export interface PublicVisitorProfileInput {
  browser?: string;
  os?: string;
  deviceType?: string;
  language?: string;
  timezone?: string;
  referrer?: string;
  landingPage?: string;
  userAgent?: string;
}

export async function recordPublicVisitorProfile(slug: string, visitorId: string, profile: PublicVisitorProfileInput) {
  if (!USE_SUPABASE) return;
  const { error } = await supabase.rpc("record_public_visitor_profile" as any, {
    _slug: slug,
    _visitor_id: visitorId,
    _browser: profile.browser ?? null,
    _os: profile.os ?? null,
    _device_type: profile.deviceType ?? null,
    _language: profile.language ?? null,
    _timezone: profile.timezone ?? null,
    _referrer: profile.referrer ?? null,
    _landing_page: profile.landingPage ?? null,
    _user_agent: profile.userAgent ?? null,
  });
  if (error) console.warn("[publicRuntime] visitor failed:", error.message);
}

export interface PublicAttributionInput {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  fbclid?: string;
  gclid?: string;
  ttclid?: string;
  msclkid?: string;
  referrer?: string;
  landingPage?: string;
}

export async function recordPublicAttribution(slug: string, visitorId: string, sessionId: string | null, attr: PublicAttributionInput) {
  if (!USE_SUPABASE) return;
  const hasAny = Object.values(attr).some((v) => v != null && v !== "");
  if (!hasAny) return;
  const { error } = await supabase.rpc("record_public_attribution" as any, {
    _slug: slug,
    _visitor_id: visitorId,
    _session_id: sessionId,
    _utm_source: attr.utmSource ?? null,
    _utm_medium: attr.utmMedium ?? null,
    _utm_campaign: attr.utmCampaign ?? null,
    _utm_content: attr.utmContent ?? null,
    _utm_term: attr.utmTerm ?? null,
    _fbclid: attr.fbclid ?? null,
    _gclid: attr.gclid ?? null,
    _ttclid: attr.ttclid ?? null,
    _msclkid: attr.msclkid ?? null,
    _referrer: attr.referrer ?? null,
    _landing_page: attr.landingPage ?? null,
  });
  if (error) console.warn("[publicRuntime] attribution failed:", error.message);
}

export async function attachAttributionToLead(sessionId: string, leadId: string, visitorId: string) {
  if (!USE_SUPABASE) return;
  const { error } = await supabase.rpc("attach_public_attribution_to_lead" as any, {
    _session_id: sessionId,
    _lead_id: leadId,
    _visitor_id: visitorId,
  });
  if (error) console.warn("[publicRuntime] attach attribution failed:", error.message);
}

