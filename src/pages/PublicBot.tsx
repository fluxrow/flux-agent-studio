import { useParams, Link } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { Send, Sparkles, Bot, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import type { Flow } from "@/types";


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

function PublicChat({ bot }: { bot: PublicBotType }) {
  const flow = bot.snapshot as Flow;
  const { engine, state } = useEngine(flow);
  const sessionIdRef = useRef<string | null>(null);
  const draftLeadRef = useRef<Record<string, string>>({});
  const leadCreatedRef = useRef(false);
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  // Bootstrap session + start engine once
  useEffect(() => {
    if (!engine) return;
    let cancelled = false;
    (async () => {
      try {
        const visitorId = getOrCreateVisitorId(bot.slug);
        const sid = await startPublicSession(bot.slug, bot.id, bot.workspaceId, visitorId);
        if (cancelled) return;
        sessionIdRef.current = sid;
        engine.start();
      } catch (err) {
        console.error("[publicBot] failed to start session", err);
      }
    })();
    return () => { cancelled = true; };
  }, [engine, bot.id, bot.slug, bot.workspaceId]);

  // Mirror engine events to backend (Supabase mode) + accumulate lead.* vars
  useEffect(() => {
    if (!engine) return;
    return engine.on(async (ev) => {
      const sid = sessionIdRef.current;
      if (!sid) return;
      if (ev.type === "message") {
        recordPublicMessage(sid, "bot", ev.text, ev.blockId);
        recordPublicEvent(sid, "block_exited", { text: ev.text }, ev.blockId);
      }
      if (ev.type === "ended") {
        // Persist lead if we collected something
        const d = draftLeadRef.current;
        const candidate = d.name || d["lead.name"];
        if (candidate && !leadCreatedRef.current) {
          leadCreatedRef.current = true;
          await recordPublicLead(sid, bot.id, bot.workspaceId, {
            name: candidate,
            email: d.email || d["lead.email"],
            phone: d.phone || d["lead.phone"],
            company: d.company || d["lead.company"],
          });
        }
        recordPublicEvent(sid, "flow_completed", {});
        recordPublicEvent(sid, "conversation_completed", {});
      }
    });
  }, [engine, bot.id, bot.workspaceId]);

  // Capture lead-flavoured variables as they update
  useEffect(() => {
    if (!state) return;
    const vars = state.context.variables;
    Object.entries(vars).forEach(([k, v]) => {
      if (v == null) return;
      const lower = k.toLowerCase();
      const stripped = lower.startsWith("lead.") ? lower.slice(5) : lower;
      if (LEAD_FIELDS.includes(stripped as any) || lower === "name") {
        draftLeadRef.current[stripped] = String(v);
      }
      draftLeadRef.current[lower] = String(v);
    });
  }, [state?.context.variables]);

  // Scroll to bottom
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state?.transcript.length, state?.awaiting]);

  const status = state?.context.status ?? "idle";
  const awaiting = state?.awaiting;
  const isChoice = status === "awaiting_choice";
  const isInput = status === "awaiting_input";
  const ended = status === "ended" || status === "error";

  const choiceOptions = useMemo<string[]>(() => {
    if (!awaiting || !isChoice) return [];
    return (awaiting.config?.options as string[] | undefined) ?? [];
  }, [awaiting, isChoice]);

  const submit = () => {
    if (!engine || !draft.trim() || !isInput) return;
    const sid = sessionIdRef.current;
    if (sid) recordPublicMessage(sid, "user", draft.trim());
    engine.submitInput(draft.trim());
    setDraft("");
  };

  const pick = (opt: string) => {
    if (!engine || !isChoice) return;
    const sid = sessionIdRef.current;
    if (sid) {
      recordPublicMessage(sid, "user", opt);
      recordPublicEvent(sid, "choice_selected", { option: opt });
    }
    engine.submitChoice(opt);
  };

  return (
    <PublicShell slug={bot.slug} title={bot.name}>
      {/* chat */}
      <div className="h-[440px] overflow-y-auto p-4 space-y-3 bg-background/40">
        {state?.transcript.map((m, i) => {
          if (m.kind === "system") {
            return (
              <div key={i} className="text-center text-[10px] uppercase tracking-widest text-muted-foreground py-1">
                {m.text}
              </div>
            );
          }
          const isUser = m.kind === "user";
          return (
            <div key={i} className={`animate-fade-in flex ${isUser ? "justify-end" : "justify-start"}`}>
              <div className={`px-4 py-2.5 max-w-[85%] text-sm rounded-2xl whitespace-pre-wrap break-words ${
                isUser
                  ? "gradient-primary text-primary-foreground rounded-tr-sm shadow-glow"
                  : "bg-secondary rounded-tl-sm"
              }`}>
                {m.text}
              </div>
            </div>
          );
        })}

        {isChoice && choiceOptions.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1 animate-fade-in">
            {choiceOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => pick(opt)}
                className="text-xs px-3 py-1.5 rounded-full border border-primary/40 bg-primary/5 text-primary-glow hover:bg-primary/15 transition"
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {ended && (
          <div className="text-center pt-4">
            <div className="inline-block px-4 py-3 rounded-2xl bg-success/10 border border-success/30 text-success text-xs">
              Conversa encerrada · obrigado!
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* composer */}
      <div className="flex items-center gap-2 p-3 border-t border-border bg-card/80">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
          disabled={!isInput}
          className="flex-1 rounded-full bg-background border-border text-sm disabled:opacity-50"
          placeholder={
            isInput ? "Digite sua resposta..."
            : isChoice ? "Escolha uma opção acima"
            : ended ? "Conversa encerrada"
            : "Aguarde…"
          }
        />
        <Button
          size="icon"
          onClick={submit}
          disabled={!isInput || !draft.trim()}
          className="rounded-full gradient-primary text-primary-foreground border-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </PublicShell>
  );
}

/* ------------------ Shell ------------------ */

function PublicShell({ slug, title, children }: { slug?: string; title?: string; children: React.ReactNode }) {
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
            powered by FluxBot
          </Link>
        </div>

        <div className="rounded-3xl border border-border bg-card/80 backdrop-blur-xl shadow-elegant overflow-hidden">
          <div className="flex items-center gap-3 p-4 border-b border-border bg-gradient-to-r from-primary/20 to-accent/10">
            <div className="relative">
              <div className="h-11 w-11 rounded-full gradient-primary flex items-center justify-center shadow-glow">
                <Bot className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-success border-2 border-card animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="font-semibold truncate">{title ?? "FluxBot"}</div>
              <div className="text-[10px] text-muted-foreground">Online · responde em segundos</div>
            </div>
            {slug && (
              <div className="ml-auto text-[10px] font-mono text-muted-foreground truncate">/bot/{slug}</div>
            )}
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
