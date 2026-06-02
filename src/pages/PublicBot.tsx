import { useParams, Link, useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { Sparkles, Loader2, AlertTriangle } from "lucide-react";
import { useEngine } from "@/hooks/useEngine";
import {
  loadPublicBot,
  startPublicSession,
  recordPublicEvent,
  recordPublicMessage,
  recordPublicLead,
  recordPublicVisitorProfile,
  recordPublicAttribution,
  attachAttributionToLead,
  getOrCreateVisitorId,
  type PublicBot as PublicBotType,
} from "@/lib/public-runtime";
import { detectBrowser, captureAttributionFromUrl, trackingEngine } from "@/tracking";
import { webChannel, webChannelHelpers, sessionRouter } from "@/channels";
import type { Flow } from "@/types";
import { getRenderer, listRenderers, resolveVariant, type RendererId } from "@/renderers";


type LoadState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready"; bot: PublicBotType };

const LEAD_FIELDS = ["name", "email", "phone", "company"] as const;

export default function PublicBot() {
  const { slug } = useParams();
  const [load, setLoad] = useState<LoadState>({ kind: "loading" });

  useEffect(() => {
    let cancelled = false;
    if (!slug) return;
    setLoad({ kind: "loading" });
    loadPublicBot(slug)
      .then((bot) => {
        if (cancelled) return;
        if (!bot) {
          setLoad({ kind: "error", message: "Esse bot não está publicado ou o link expirou." });
        } else {
          setLoad({ kind: "ready", bot });
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setLoad({ kind: "error", message: err?.message ?? "Falha ao carregar bot." });
      });
    return () => { cancelled = true; };
  }, [slug]);

  if (load.kind === "loading") {
    return (
      <PublicShell slug={slug}>
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-xs">Carregando conversa…</span>
        </div>
      </PublicShell>
    );
  }

  if (load.kind === "error") {
    return (
      <PublicShell slug={slug}>
        <div className="flex flex-col items-center justify-center py-20 text-center gap-3 px-6">
          <div className="h-10 w-10 rounded-full bg-destructive/15 text-destructive flex items-center justify-center">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="text-sm font-medium">Bot indisponível</div>
          <p className="text-xs text-muted-foreground max-w-xs">{load.message}</p>
        </div>
      </PublicShell>
    );
  }

  return <PublicChat bot={load.bot} />;
}

/* ------------------ Chat ------------------ */

const VALID_MODES: RendererId[] = ["whatsapp", "instagram", "messenger", "chatgpt", "form"];

function PublicChat({ bot }: { bot: PublicBotType }) {
  const flow = bot.snapshot as Flow;
  const { engine, state } = useEngine(flow);
  const sessionIdRef = useRef<string | null>(null);
  const channelSessionIdRef = useRef<string | null>(null);
  const draftLeadRef = useRef<Record<string, string>>({});
  const leadCreatedRef = useRef(false);

  const [params, setParams] = useSearchParams();
  const requested = (params.get("mode") ?? "whatsapp") as RendererId;
  const mode: RendererId = VALID_MODES.includes(requested) ? requested : "whatsapp";

  // Bootstrap session + start engine once
  useEffect(() => {
    if (!engine) return;
    let cancelled = false;
    (async () => {
      try {
        const visitorId = getOrCreateVisitorId(bot.slug);
        const profile = detectBrowser();
        const attribution = captureAttributionFromUrl();
        recordPublicVisitorProfile(bot.slug, visitorId, {
          browser: profile.browser,
          os: profile.os,
          deviceType: profile.deviceType,
          language: profile.language,
          timezone: profile.timezone,
          referrer: profile.referrer,
          landingPage: profile.landingPage,
          userAgent: profile.userAgent,
        }).catch(() => undefined);

        const sid = await startPublicSession(bot.slug, bot.id, bot.workspaceId, visitorId);
        if (cancelled) return;
        sessionIdRef.current = sid;
        const channelSession = await webChannelHelpers.openWebSession({
          visitorId, runtimeSessionId: sid, botId: bot.id, workspaceId: bot.workspaceId,
        });
        channelSessionIdRef.current = channelSession.id;
        if (attribution) {
          recordPublicAttribution(bot.slug, visitorId, sid, attribution).catch(() => undefined);
        }
        trackingEngine.recordCustom("bot_loaded", { slug: bot.slug, mode }, {
          sessionId: sid, botId: bot.id, workspaceId: bot.workspaceId,
        });
        recordPublicEvent(sid, "bot_loaded", { slug: bot.slug, mode });
        engine.start();
      } catch (err) {
        console.error("[publicBot] failed to start session", err);
      }
    })();
    return () => { cancelled = true; };
  }, [engine, bot.id, bot.slug, bot.workspaceId, mode]);

  // Mirror engine events to backend + accumulate lead.* vars
  useEffect(() => {
    if (!engine) return;
    return engine.on(async (ev) => {
      const sid = sessionIdRef.current;
      if (!sid) return;
      if (ev.type === "message") {
        const csid = channelSessionIdRef.current;
        if (csid) await webChannelHelpers.sendText(csid, ev.text, ev.blockId);
        else recordPublicMessage(sid, "bot", ev.text, ev.blockId);
        recordPublicEvent(sid, "block_exited", { text: ev.text }, ev.blockId);
      }
      if (ev.type === "ended") {
        const csid = channelSessionIdRef.current;
        if (csid) webChannel.closeSession(csid).catch(() => undefined);
        const d = draftLeadRef.current;
        const candidate = d.name || d["lead.name"];
        if (candidate && !leadCreatedRef.current) {
          leadCreatedRef.current = true;
          const leadId = await recordPublicLead(sid, bot.id, bot.workspaceId, {
            name: candidate,
            email: d.email || d["lead.email"],
            phone: d.phone || d["lead.phone"],
            company: d.company || d["lead.company"],
          });
          if (leadId) {
            const visitorId = getOrCreateVisitorId(bot.slug);
            attachAttributionToLead(sid, leadId, visitorId).catch(() => undefined);
          }
        }
        recordPublicEvent(sid, "flow_completed", { mode });
        recordPublicEvent(sid, "conversation_completed", {});
      }
    });
  }, [engine, bot.id, bot.workspaceId, mode]);

  // Capture lead-flavoured variables
  useEffect(() => {
    if (!state) return;
    const vars = state.context.variables;
    Object.entries(vars).forEach(([k, v]) => {
      if (v == null) return;
      const lower = k.toLowerCase();
      const stripped = lower.startsWith("lead.") ? lower.slice(5) : lower;
      draftLeadRef.current[stripped] = String(v);
      draftLeadRef.current[lower] = String(v);
    });
  }, [state?.context.variables]);

  const variant = useMemo(() => resolveVariant(mode, getOrCreateVisitorId(bot.slug)), [mode, bot.slug]);
  const renderer = getRenderer(mode, variant);
  const Renderer = renderer.Component;

  const submitInput = (value: string) => {
    if (!engine) return;
    const sid = sessionIdRef.current;
    const csid = channelSessionIdRef.current;
    if (csid) webChannelHelpers.receiveText(csid, value);
    else if (sid) recordPublicMessage(sid, "user", value);
    engine.submitInput(value);
  };
  const submitChoice = (opt: string) => {
    if (!engine) return;
    const sid = sessionIdRef.current;
    const csid = channelSessionIdRef.current;
    if (csid) webChannelHelpers.receiveText(csid, opt);
    else if (sid) recordPublicMessage(sid, "user", opt);
    if (sid) recordPublicEvent(sid, "choice_selected", { option: opt });
    engine.submitChoice(opt);
  };

  return (
    <PublicShell slug={bot.slug}>
      <ModeSelector
        current={mode}
        onChange={(m) => { params.set("mode", m); setParams(params, { replace: true }); }}
      />
      <div className="rounded-3xl overflow-hidden shadow-elegant border border-border h-[560px]">
        <Renderer
          engine={engine}
          state={state}
          theme={renderer.defaultTheme}
          typing={{ mode: "realistic", msPerChar: 26, minDelayMs: 500, maxDelayMs: 2800 }}
          delay={{ mode: "random", randomMinMs: 200, randomMaxMs: 700 }}
          title={bot.name}
          onSubmitInput={submitInput}
          onSubmitChoice={submitChoice}
        />
      </div>
    </PublicShell>
  );
}

/* ------------------ Mode Selector ------------------ */

function ModeSelector({ current, onChange }: { current: RendererId; onChange: (m: RendererId) => void }) {
  const all = listRenderers();
  return (
    <div className="flex items-center gap-1.5 mb-3 overflow-x-auto pb-1">
      {all.map((r) => {
        const active = r.id === current;
        return (
          <button
            key={r.id}
            onClick={() => onChange(r.id as RendererId)}
            className={`text-[11px] px-2.5 py-1 rounded-full border whitespace-nowrap transition ${
              active
                ? "bg-primary/20 border-primary/40 text-primary-glow"
                : "bg-background/40 border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {r.label}
          </button>
        );
      })}
    </div>
  );
}

/* ------------------ Shell ------------------ */

function PublicShell({ slug, children }: { slug?: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-20" />
      <div className="absolute inset-0" style={{ background: "var(--gradient-glow)" }} />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-4">
          <Link to="/" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
            <div className="h-5 w-5 rounded-md gradient-primary flex items-center justify-center">
              <Sparkles className="h-3 w-3 text-primary-foreground" />
            </div>
            powered by FluxBot {slug && <span className="font-mono opacity-60">· /bot/{slug}</span>}
          </Link>
        </div>

        {children}
      </div>
    </div>
  );
}
