import React, { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Zap, ArrowRight, Play, CheckCircle2, TrendingUp, Database, Brain,
  MessageSquare, Target, BarChart3, Shield, ChevronDown,
  Sparkles, Lock, Users, GitBranch, Clock, DollarSign,
  Building2, Briefcase, Megaphone,
} from "lucide-react";

/* ─── Mockup animation ─── */
interface MockupState {
  node1: boolean; line1: boolean;
  node2: boolean; line2: boolean;
  node3: boolean; line3: boolean;
  node4: boolean;
  chat1: boolean; typing1: boolean;
  chat2: boolean; typing2: boolean;
  chat3: boolean;
}
const MOCK_INIT: MockupState = {
  node1: false, line1: false, node2: false, line2: false,
  node3: false, line3: false, node4: false,
  chat1: false, typing1: false, chat2: false, typing2: false, chat3: false,
};

/* ─── FAQ data ─── */
const FAQ_ITEMS = [
  {
    q: "Já tenho CRM (HubSpot / Pipedrive / RD Station). O Flux vai substituir?",
    a: "Não substitui — complementa. Seu CRM gerencia leads que alguém já criou. O Flux Agent Studio cria, qualifica e preenche esses leads automaticamente a partir das conversas. O Connector Hub integra com seu CRM atual via webhook em minutos.",
  },
  {
    q: "Já tenho chatbot (Typebot / ManyChat). Para que o Flux?",
    a: "Seu chatbot atual captura. O Flux Agent Studio captura + qualifica com IA + prevê a receita de cada lead + atribui cada venda à campanha de origem. É o que vem depois do chatbot.",
  },
  {
    q: "Não tenho equipe técnica. Consigo usar?",
    a: "Sim. O AI Builder gera o bot completo a partir de um parágrafo de descrição — sem código. O Builder visual é drag-and-drop. Se você consegue usar WhatsApp, consegue usar o Flux Agent Studio. Empresas têm o primeiro bot no ar em menos de 30 minutos.",
  },
  {
    q: "Meus dados ficam seguros? E o LGPD?",
    a: "Sim. A plataforma usa Row Level Security (RLS) em todas as tabelas — cada workspace é isolado. LGPD e GDPR nativos: banner de consentimento, registro de aceite, endpoint de data deletion e audit logs. Tokens nunca ficam no localStorage.",
  },
  {
    q: "E se o bot não souber responder algo?",
    a: "O Knowledge Base RAG alimenta o bot com o conteúdo da sua empresa. Para o que está fora do knowledge, o fluxo redireciona para humano — você decide quando. A IA nunca inventa informações fora do que você aprovou.",
  },
  {
    q: "Quanto tempo para ver o primeiro resultado?",
    a: "PMEs com alto volume de inbound percebem valor no 1º dia — o bot responde e leads aparecem no CRM. Gestores comerciais veem o impacto em 30 dias, quando o Lead Score está calibrado e o forecast vs. real pode ser comparado.",
  },
];

/* ─── Jornada steps ─── */
const JOURNEY_STEPS = [
  {
    icon: <MessageSquare size={22} />,
    color: "#14B8A6",
    tag: "Canal",
    title: "Conversa chega",
    text: "WhatsApp, Instagram, site ou Telegram. O lead entra a qualquer hora — 24/7 — sem ninguém do seu time precisar estar presente.",
  },
  {
    icon: <Sparkles size={22} />,
    color: "#14B8A6",
    tag: "IA",
    title: "IA responde e qualifica",
    text: "O agente atende, coleta dados, responde dúvidas com base no seu Knowledge Base e pontua o lead de 0 a 100 em 7 fatores — em segundos.",
  },
  {
    icon: <Brain size={22} />,
    color: "#14B8A6",
    tag: "Intelligence",
    title: "Score + próxima ação",
    text: "Cada lead chega com resumo em linguagem natural, temperatura (frio/morno/quente) e recomendação de ação. Ex: \"Ligar hoje às 14h — probabilidade de fechar 72%.\"",
  },
  {
    icon: <Database size={22} />,
    color: "#D97706",
    tag: "CRM",
    title: "Entra no CRM pronto",
    text: "O lead é criado automaticamente no pipeline com todos os dados coletados na conversa. Sem digitação. Sem cópia do WhatsApp para planilha.",
  },
  {
    icon: <BarChart3 size={22} />,
    color: "#D97706",
    tag: "Receita",
    title: "Atribuição de campanha",
    text: "Revenue Attribution fecha o loop: UTM da campanha → lead qualificado → fechamento → receita. Você sabe de qual anúncio veio cada venda.",
  },
];

/* ─── Differentials ─── */
const DIFFERENTIALS = [
  {
    icon: <Sparkles size={20} />,
    color: "#14B8A6",
    tag: "Único",
    title: "AI Builder",
    text: "Descreva o bot que você quer em um parágrafo. A IA monta o fluxo completo, configura o CRM e adiciona o knowledge — pronto para publicar em minutos.",
    metric: "30 min",
    metricLabel: "para o 1º bot no ar",
  },
  {
    icon: <Target size={20} />,
    color: "#14B8A6",
    tag: "Único",
    title: "Lead Intelligence",
    text: "Score 0–100 com 7 fatores, resumo gerado por IA, forecast de receita individual e próxima ação recomendada. Seu time foca só nos leads quentes.",
    metric: "87",
    metricLabel: "score típico de lead quente",
  },
  {
    icon: <BarChart3 size={20} />,
    color: "#D97706",
    tag: "Único",
    title: "Revenue Attribution",
    text: "Fecha o loop que exige 3 ferramentas nos concorrentes: UTM → lead → receita. Meta CAPI incluso — o algoritmo da Meta otimiza por venda, não por clique.",
    metric: "ROAS real",
    metricLabel: "por canal de origem",
  },
  {
    icon: <TrendingUp size={20} />,
    color: "#D97706",
    tag: "Moat",
    title: "Data Flywheel",
    text: "Cada lead calibra o Score. Score calibrado melhora o Forecast. Forecast preciso afina a Attribution. Attribution melhor traz leads de maior qualidade. O ciclo se fecha.",
    metric: "↑ com tempo",
    metricLabel: "produto fica mais inteligente",
  },
];

/* ─── Social proof chips ─── */
const TRUST_ITEMS = [
  { icon: <Building2 size={13} />, label: "Imobiliárias" },
  { icon: <Briefcase size={13} />, label: "SaaS B2B" },
  { icon: <Users size={13} />, label: "Agências" },
  { icon: <Megaphone size={13} />, label: "Marketing" },
  { icon: <Clock size={13} />, label: "24/7" },
  { icon: <DollarSign size={13} />, label: "Revenue-first" },
];

/* ─── useReveal hook ─── */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

/* ─── Section label component ─── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="inline-flex items-center gap-1.5 rounded-full mb-5"
      style={{
        border: "1px solid rgba(13,148,136,0.28)",
        background: "rgba(13,148,136,0.06)",
        padding: "4px 14px",
        fontSize: 11,
        fontWeight: 600,
        color: "#14B8A6",
        letterSpacing: "0.07em",
        textTransform: "uppercase",
      }}
    >
      {children}
    </div>
  );
}

/* ─── Button components ─── */
function BtnPrimary({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <button
      className={className}
      style={{
        height: 48,
        padding: "0 28px",
        background: "linear-gradient(135deg, #D97706 0%, #F59E0B 100%)",
        color: "#fff",
        fontWeight: 600,
        fontSize: 15,
        borderRadius: 12,
        border: "none",
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        transition: "transform 150ms cubic-bezier(0.34,1.56,0.64,1), filter 150ms ease",
        whiteSpace: "nowrap",
      }}
      onMouseEnter={e => { const b = e.currentTarget; b.style.transform = "scale(1.03)"; b.style.filter = "brightness(1.1)"; }}
      onMouseLeave={e => { const b = e.currentTarget; b.style.transform = "scale(1)"; b.style.filter = "brightness(1)"; }}
      onMouseDown={e => { e.currentTarget.style.transform = "scale(0.97)"; }}
      onMouseUp={e => { e.currentTarget.style.transform = "scale(1.03)"; }}
    >
      {children}
    </button>
  );
}

function BtnOutline({ children, href, className = "" }: { children: React.ReactNode; href?: string; className?: string }) {
  const style: React.CSSProperties = {
    height: 48,
    padding: "0 28px",
    background: "transparent",
    color: "#94A3B8",
    fontWeight: 500,
    fontSize: 15,
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.12)",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    transition: "color 200ms ease, border-color 200ms ease",
    whiteSpace: "nowrap",
  };
  if (href) {
    return (
      <a href={href}>
        <button
          style={style}
          className={className}
          onMouseEnter={e => { const b = e.currentTarget; b.style.color = "#F8FAFC"; b.style.borderColor = "rgba(255,255,255,0.22)"; }}
          onMouseLeave={e => { const b = e.currentTarget; b.style.color = "#94A3B8"; b.style.borderColor = "rgba(255,255,255,0.12)"; }}
        >
          {children}
        </button>
      </a>
    );
  }
  return (
    <button
      style={style}
      className={className}
      onMouseEnter={e => { const b = e.currentTarget; b.style.color = "#F8FAFC"; b.style.borderColor = "rgba(255,255,255,0.22)"; }}
      onMouseLeave={e => { const b = e.currentTarget; b.style.color = "#94A3B8"; b.style.borderColor = "rgba(255,255,255,0.12)"; }}
    >
      {children}
    </button>
  );
}

/* ─── Hero video paths (replace with CDN URLs when available) ─── */
const HERO_VIDEO_WEBM = "/hero-loop.webm";
const HERO_VIDEO_MP4  = "/hero-loop.mp4";
const HERO_VIDEO_POSTER = "/hero-loop-poster.jpg";

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

function trackVideoPlay(action: "play" | "pause" | "ended") {
  try {
    if (typeof window !== "undefined" && (window as Record<string, unknown>).gtag) {
      (window as Record<string, unknown>).gtag("event", "hero_video_" + action, {
        event_category: "engagement",
        event_label: "hero_loop",
        non_interaction: action === "play" ? false : true,
      });
    }
    window.dispatchEvent(new CustomEvent("flux:hero_video", { detail: { action } }));
  } catch {
    // analytics must never break the page
  }
}

interface HeroVideoProps {
  fallback: React.ReactNode;
  mock: MockupState;
  line1Ref: React.RefObject<SVGPathElement>;
  line2Ref: React.RefObject<SVGPathElement>;
  line3Ref: React.RefObject<SVGPathElement>;
}

function HeroVideo({ fallback }: HeroVideoProps) {
  const reduced = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoFailed, setVideoFailed] = useState(false);
  const [playing, setPlaying] = useState(false);

  const showVideo = !reduced && !videoFailed;

  return (
    <div className="lp-enter-mock relative mx-auto mt-16" style={{ maxWidth: 920 }}>
      <div className="absolute pointer-events-none" style={{ inset: "-20px -40px", background: "radial-gradient(ellipse 70% 40% at 50% 110%, rgba(13,148,136,0.12) 0%, transparent 70%)", zIndex: 0 }} />
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{ border: "1px solid var(--lp-border-mid)", background: "var(--lp-bg-elevated)", boxShadow: "0 24px 64px -16px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04) inset", zIndex: 1 }}
      >
        {/* Chrome bar */}
        <div className="flex items-center gap-1.5 px-4" style={{ height: 40, borderBottom: "1px solid var(--lp-border)", background: "rgba(255,255,255,0.02)" }}>
          {[0, 1, 2].map(i => <div key={i} className="h-2.5 w-2.5 rounded-full" style={{ background: "rgba(255,255,255,0.12)" }} />)}
          <div className="ml-4 flex items-center rounded-md px-3" style={{ height: 24, fontSize: 11, color: "var(--lp-fg-subtle)", fontFamily: "'JetBrains Mono', monospace", background: "rgba(255,255,255,0.04)", border: "1px solid var(--lp-border)" }}>
            fluxagent.studio/builder/sdr
          </div>
        </div>

        {showVideo ? (
          /* ── Video loop ── */
          <div className="relative" style={{ aspectRatio: "16/9", background: "#09090C" }}>
            <video
              ref={videoRef}
              autoPlay
              muted
              loop
              playsInline
              poster={HERO_VIDEO_POSTER}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              onPlay={() => { setPlaying(true); trackVideoPlay("play"); }}
              onPause={() => { setPlaying(false); trackVideoPlay("pause"); }}
              onEnded={() => trackVideoPlay("ended")}
              onError={() => setVideoFailed(true)}
            >
              <source src={HERO_VIDEO_WEBM} type="video/webm" />
              <source src={HERO_VIDEO_MP4}  type="video/mp4" />
            </video>
            {/* Play overlay — only visible when paused (autoplay was blocked) */}
            {!playing && (
              <button
                aria-label="Reproduzir vídeo"
                onClick={() => videoRef.current?.play()}
                style={{
                  position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
                  background: "rgba(0,0,0,0.45)", border: "none", cursor: "pointer",
                }}
              >
                <span style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(13,148,136,0.85)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Play size={22} fill="white" color="white" />
                </span>
              </button>
            )}
          </div>
        ) : (
          /* ── Static mockup fallback (reduced motion or video unavailable) ── */
          fallback
        )}
      </div>
    </div>
  );

}

/* ═══════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════ */
export default function Landing() {
  const [mock, setMock] = useState<MockupState>(MOCK_INIT);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const line1Ref = useRef<SVGPathElement>(null);
  const line2Ref = useRef<SVGPathElement>(null);
  const line3Ref = useRef<SVGPathElement>(null);

  const journeyReveal = useReveal();
  const diffsReveal = useReveal();
  const faqReveal = useReveal();
  const lgpdReveal = useReveal();
  const ctaReveal = useReveal();

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const q = (ms: number, fn: () => void) => timers.push(setTimeout(fn, ms));
    q(1200, () => setMock(s => ({ ...s, node1: true })));
    q(1500, () => { setMock(s => ({ ...s, line1: true })); line1Ref.current?.classList.add("lp-line-draw"); });
    q(1750, () => setMock(s => ({ ...s, node2: true })));
    q(2000, () => { setMock(s => ({ ...s, line2: true })); line2Ref.current?.classList.add("lp-line-draw"); });
    q(2300, () => setMock(s => ({ ...s, node3: true })));
    q(2700, () => { setMock(s => ({ ...s, line3: true })); line3Ref.current?.classList.add("lp-line-draw"); });
    q(2950, () => setMock(s => ({ ...s, node4: true })));
    q(1400, () => setMock(s => ({ ...s, chat1: true })));
    q(2200, () => setMock(s => ({ ...s, typing1: true })));
    q(2800, () => setMock(s => ({ ...s, typing1: false, chat2: true })));
    q(3400, () => setMock(s => ({ ...s, typing2: true })));
    q(3900, () => setMock(s => ({ ...s, typing2: false, chat3: true })));
    return () => timers.forEach(clearTimeout);
  }, []);

  const toggleFaq = useCallback((i: number) => {
    setOpenFaq(prev => (prev === i ? null : i));
  }, []);

  return (
    <div className="lp-v2 min-h-screen overflow-x-hidden" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ───────── NAV ───────── */}
      <nav
        className="fixed top-0 inset-x-0 z-50"
        style={{
          height: 64,
          borderBottom: "1px solid var(--lp-border)",
          background: "rgba(9,9,12,0.82)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        <div className="mx-auto flex items-center justify-between h-full px-5 md:px-8" style={{ maxWidth: 1200 }}>
          <div className="flex items-center gap-2.5">
            <div
              className="flex items-center justify-center rounded-xl flex-shrink-0"
              style={{ width: 36, height: 36, background: "linear-gradient(135deg, #0D9488 0%, #0F766E 100%)" }}
            >
              <Zap className="h-4 w-4 text-white" strokeWidth={2.5} />
            </div>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 16, color: "var(--lp-fg)", letterSpacing: "-0.01em" }}>
              Flux Agent Studio
            </span>
          </div>

          <div className="hidden md:flex items-center gap-7" style={{ fontSize: 14, color: "var(--lp-fg-muted)" }}>
            <a href="#produto" className="hover:text-white transition-colors duration-150">Produto</a>
            <a href="#jornada" className="hover:text-white transition-colors duration-150">Como funciona</a>
            <a href="#faq" className="hover:text-white transition-colors duration-150">FAQ</a>
          </div>

          <Link to="/dashboard">
            <BtnPrimary>
              Começar grátis <ArrowRight size={14} />
            </BtnPrimary>
          </Link>
        </div>
      </nav>

      {/* ───────── HERO ───────── */}
      <section className="relative" style={{ paddingTop: 160, paddingBottom: 120 }} aria-label="Hero">
        <div
          className="lp-hero-glow-bg absolute pointer-events-none"
          style={{ inset: 0, background: "radial-gradient(ellipse 80% 55% at 50% -5%, rgba(13,148,136,0.18) 0%, transparent 70%)", zIndex: 0 }}
        />
        <div className="relative mx-auto px-5 md:px-8" style={{ maxWidth: 1200, zIndex: 1 }}>

          {/* Copy */}
          <div className="mx-auto text-center" style={{ maxWidth: 760 }}>
            <div
              className="lp-enter-1 inline-flex items-center gap-1.5 rounded-full mb-7"
              style={{ border: "1px solid rgba(13,148,136,0.30)", background: "rgba(13,148,136,0.06)", padding: "4px 14px", fontSize: 11, fontWeight: 600, color: "#14B8A6", letterSpacing: "0.07em", textTransform: "uppercase" }}
            >
              <Zap size={10} style={{ color: "#14B8A6" }} />
              Conversational Revenue OS
            </div>

            <h1
              style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: "clamp(2.6rem, 6vw, 4.25rem)", letterSpacing: "-0.03em", lineHeight: 1.04, color: "var(--lp-fg)", margin: 0 }}
            >
              <span className="lp-enter-2 block">Seu próximo cliente está</span>
              <span className="lp-enter-3 block">
                esperando resposta.{" "}
                <span style={{ color: "#14B8A6" }}>O Flux já deu.</span>
              </span>
            </h1>

            <p
              className="lp-enter-4"
              style={{ marginTop: 24, fontSize: 18, lineHeight: 1.72, color: "var(--lp-fg-muted)", maxWidth: 540, marginLeft: "auto", marginRight: "auto" }}
            >
              Agentes de IA que atendem, qualificam e entram no seu CRM automaticamente — da primeira mensagem à receita atribuída. 24/7. Sem código.
            </p>

            <div className="lp-enter-5 flex items-center justify-center flex-wrap" style={{ gap: 12, marginTop: 36 }}>
              <Link to="/dashboard">
                <BtnPrimary>Começar grátis <ArrowRight size={15} /></BtnPrimary>
              </Link>
              <BtnOutline href="#jornada">
                <Play size={13} fill="currentColor" /> Ver como funciona
              </BtnOutline>
            </div>

            <div className="lp-fade-6 flex items-center justify-center flex-wrap" style={{ gap: "6px 20px", marginTop: 24, fontSize: 12, color: "var(--lp-fg-subtle)" }}>
              {["Sem cartão de crédito", "14 dias grátis", "LGPD compliant", "Cancele quando quiser"].map(t => (
                <span key={t} className="flex items-center gap-1.5">
                  <CheckCircle2 size={12} style={{ color: "#0D9488" }} /> {t}
                </span>
              ))}
            </div>
          </div>

          {/* Mockup / Hero Video */}
          <HeroVideo
            mock={mock}
            line1Ref={line1Ref}
            line2Ref={line2Ref}
            line3Ref={line3Ref}
            fallback={
              /* 3-panel grid — collapses to single col on mobile via CSS */
              <div className="lp-mockup-grid">
                {/* Panel 1 — Palette */}
                <div style={{ borderRight: "1px solid var(--lp-border)", background: "rgba(255,255,255,0.01)", padding: 16 }}>
                  <div style={{ fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--lp-fg-subtle)", marginBottom: 12 }}>Blocos</div>
                  {[
                    { label: "Mensagem", highlight: false },
                    { label: "Pergunta", highlight: false },
                    { label: "IA ✦", highlight: true },
                    { label: "CRM", highlight: false },
                    { label: "Score", highlight: false },
                    { label: "Webhook", highlight: false },
                  ].map(b => (
                    <div key={b.label} style={{ padding: "8px 12px", borderRadius: 8, marginBottom: 6, fontSize: 12, fontWeight: b.highlight ? 600 : 400, color: b.highlight ? "#14B8A6" : "var(--lp-fg-subtle)", border: b.highlight ? "1px solid rgba(13,148,136,0.30)" : "1px solid var(--lp-border)", background: b.highlight ? "rgba(13,148,136,0.07)" : "rgba(255,255,255,0.02)" }}>
                      {b.label}
                    </div>
                  ))}
                </div>

                {/* Panel 2 — Canvas */}
                <div className="relative" style={{ padding: 24, overflow: "hidden", minHeight: 380 }}>
                  <svg className="absolute inset-0 pointer-events-none" style={{ width: "100%", height: "100%" }}>
                    <path ref={line1Ref} className="lp-connection-line" d="M 96 78 C 96 104, 96 104, 96 138" stroke="rgba(13,148,136,0.5)" strokeWidth="1.5" fill="none" />
                    <path ref={line2Ref} className="lp-connection-line" d="M 96 188 C 96 214, 96 214, 96 248" stroke="rgba(13,148,136,0.5)" strokeWidth="1.5" fill="none" />
                    <path ref={line3Ref} className="lp-connection-line" d="M 176 280 C 240 280, 240 170, 296 170" stroke="rgba(217,119,6,0.55)" strokeWidth="1.5" fill="none" strokeDasharray="4 3" />
                  </svg>
                  <div className={`lp-node absolute ${mock.node1 ? "lp-node-show" : ""}`} style={{ top: 16, left: 16, width: 144 }}>
                    <CanvasNode type="Mensagem" label="Saudação" />
                  </div>
                  <div className={`lp-node absolute ${mock.node2 ? "lp-node-show" : ""}`} style={{ top: 138, left: 16, width: 144 }}>
                    <CanvasNode type="Pergunta" label="Coleta dados" />
                  </div>
                  <div className={`lp-node absolute ${mock.node3 ? "lp-node-show-slow lp-ai-glow" : ""}`} style={{ top: 248, left: 16, width: 144 }}>
                    <CanvasNode type="IA ✦" label="Qualifica lead" highlight />
                  </div>
                  <div className={`lp-node absolute ${mock.node4 ? "lp-node-show" : ""}`} style={{ top: 145, left: 296, width: 160 }}>
                    <CanvasNodeCRM />
                  </div>
                </div>

                {/* Panel 3 — Chat + Score */}
                <div style={{ borderLeft: "1px solid var(--lp-border)", background: "rgba(255,255,255,0.01)", padding: 16, display: "flex", flexDirection: "column" }}>
                  <div style={{ fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--lp-fg-subtle)", marginBottom: 14 }}>Preview ao vivo</div>
                  <div className="flex flex-col gap-2 flex-1">
                    {mock.chat1 && <div className="lp-bubble lp-bubble-show" style={{ maxWidth: "85%" }}><ChatBubble side="bot" text="Olá! Sou a IA da Flux. Como posso ajudar?" /></div>}
                    {mock.typing1 && <div className="lp-typing lp-typing-show rounded-2xl rounded-tl-sm" style={{ background: "var(--lp-bg-subtle)", maxWidth: 72 }}><span /><span /><span /></div>}
                    {mock.chat2 && <div className="lp-bubble lp-bubble-show self-end" style={{ maxWidth: "85%" }}><ChatBubble side="user" text="Tenho interesse no serviço." /></div>}
                    {mock.typing2 && <div className="lp-typing lp-typing-show rounded-2xl rounded-tl-sm" style={{ background: "var(--lp-bg-subtle)", maxWidth: 72 }}><span /><span /><span /></div>}
                    {mock.chat3 && <div className="lp-bubble lp-bubble-show" style={{ maxWidth: "90%" }}><ChatBubble side="bot" text="Perfeito! Qual o seu nome e empresa?" /></div>}
                  </div>
                  {mock.node4 && (
                    <div className="lp-bubble lp-bubble-show mt-auto pt-3" style={{ borderTop: "1px solid var(--lp-border)" }}>
                      <div style={{ fontSize: 10, color: "var(--lp-fg-subtle)", marginBottom: 6 }}>Lead Score</div>
                      <div className="flex items-center gap-2">
                        <span style={{ fontSize: 22, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", color: "#14B8A6" }}>87</span>
                        <div style={{ fontSize: 11, color: "var(--lp-fg-muted)" }}>
                          /100<br />
                          <span style={{ color: "#4ade80", fontSize: 10 }}>▲ Alto potencial</span>
                        </div>
                      </div>
                      <div style={{ marginTop: 8, fontSize: 11, color: "var(--lp-fg-subtle)", borderTop: "1px solid var(--lp-border)", paddingTop: 8 }}>
                        📅 Fechar em ~18 dias<br />
                        <span style={{ color: "#D97706" }}>💰 R$ 4.200 estimados</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            }
          />

          {/* Trust strip */}
          <div className="mt-10 flex items-center justify-center flex-wrap" style={{ gap: "8px 16px" }}>
            {TRUST_ITEMS.map(t => (
              <div key={t.label} className="flex items-center gap-1.5" style={{ fontSize: 12, color: "var(--lp-fg-subtle)", border: "1px solid var(--lp-border)", borderRadius: 20, padding: "4px 12px" }}>
                {t.icon}{t.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── JORNADA ───────── */}
      <section id="jornada" style={{ padding: "100px 0", borderTop: "1px solid var(--lp-border)" }}>
        <div
          ref={journeyReveal.ref}
          className={`mx-auto px-5 md:px-8 lp-reveal ${journeyReveal.visible ? "lp-reveal-show" : ""}`}
          style={{ maxWidth: 1200 }}
        >
          <div className="text-center mb-16">
            <SectionLabel><GitBranch size={10} style={{ marginRight: 4 }} />Como funciona</SectionLabel>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "clamp(1.9rem, 4vw, 2.8rem)", letterSpacing: "-0.025em", color: "var(--lp-fg)", margin: 0 }}>
              Da primeira mensagem à receita atribuída
            </h2>
            <p style={{ marginTop: 16, fontSize: 17, color: "var(--lp-fg-muted)", maxWidth: 500, marginLeft: "auto", marginRight: "auto", lineHeight: 1.6 }}>
              Cinco etapas. Automáticas. Sem humano no meio.
            </p>
          </div>

          {/* Steps */}
          <div className="lp-journey-grid">
            {JOURNEY_STEPS.map((step, i) => (
              <React.Fragment key={i}>
                <div
                  className="lp-journey-step"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  {/* Number */}
                  <div className="flex items-start gap-4 mb-4">
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: `${step.color}15`, border: `1px solid ${step.color}30`, display: "flex", alignItems: "center", justifyContent: "center", color: step.color, flexShrink: 0 }}>
                      {step.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: step.color, marginBottom: 4 }}>{step.tag}</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: "var(--lp-fg)", lineHeight: 1.3, fontFamily: "'Space Grotesk', sans-serif" }}>{step.title}</div>
                    </div>
                  </div>
                  <p style={{ fontSize: 14, lineHeight: 1.68, color: "var(--lp-fg-muted)", margin: 0 }}>{step.text}</p>
                </div>

                {/* Arrow connector (desktop) */}
                {i < JOURNEY_STEPS.length - 1 && (
                  <div className="lp-journey-arrow" style={{ color: "var(--lp-fg-subtle)" }}>
                    <ArrowRight size={16} />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Bottom highlight */}
          <div
            className="mt-12 rounded-2xl p-6 text-center"
            style={{ background: "rgba(13,148,136,0.05)", border: "1px solid rgba(13,148,136,0.15)" }}
          >
            <p style={{ fontSize: 15, color: "var(--lp-fg-muted)", margin: 0 }}>
              <span style={{ color: "#14B8A6", fontWeight: 600 }}>Resultado:</span>{" "}
              lead respondido em segundos, qualificado com score, no CRM com contexto, receita atribuída à campanha de origem.{" "}
              <span style={{ color: "var(--lp-fg)" }}>Automático. 24/7.</span>
            </p>
          </div>
        </div>
      </section>

      {/* ───────── DIFERENCIAIS ───────── */}
      <section id="produto" style={{ padding: "100px 0", borderTop: "1px solid var(--lp-border)" }}>
        <div
          ref={diffsReveal.ref}
          className={`mx-auto px-5 md:px-8 lp-reveal ${diffsReveal.visible ? "lp-reveal-show" : ""}`}
          style={{ maxWidth: 1200 }}
        >
          <div className="text-center mb-16">
            <SectionLabel><Sparkles size={10} style={{ marginRight: 4 }} />Diferenciais</SectionLabel>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "clamp(1.9rem, 4vw, 2.8rem)", letterSpacing: "-0.025em", color: "var(--lp-fg)", margin: 0 }}>
              O que nenhum concorrente faz junto
            </h2>
            <p style={{ marginTop: 16, fontSize: 17, color: "var(--lp-fg-muted)", maxWidth: 520, marginLeft: "auto", marginRight: "auto", lineHeight: 1.6 }}>
              Typebot captura. HubSpot gerencia. O Flux faz as quatro colunas — em um produto só.
            </p>
          </div>

          <div className="lp-diffs-grid">
            {DIFFERENTIALS.map((d, i) => (
              <div
                key={i}
                className="lp-diff-card"
                style={{ animationDelay: `${i * 70}ms` }}
              >
                <div className="flex items-start justify-between mb-5">
                  <div style={{ width: 44, height: 44, borderRadius: 11, background: `${d.color}12`, border: `1px solid ${d.color}28`, display: "flex", alignItems: "center", justifyContent: "center", color: d.color }}>
                    {d.icon}
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: d.color, border: `1px solid ${d.color}28`, borderRadius: 20, padding: "3px 10px" }}>
                    {d.tag}
                  </span>
                </div>
                <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 18, color: "var(--lp-fg)", margin: "0 0 10px 0", letterSpacing: "-0.01em" }}>
                  {d.title}
                </h3>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: "var(--lp-fg-muted)", margin: "0 0 20px 0" }}>
                  {d.text}
                </p>
                <div style={{ borderTop: "1px solid var(--lp-border)", paddingTop: 16 }}>
                  <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 22, color: d.color }}>{d.metric}</span>
                  <div style={{ fontSize: 12, color: "var(--lp-fg-subtle)", marginTop: 2 }}>{d.metricLabel}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Comparison table */}
          <div className="mt-16 rounded-2xl overflow-hidden" style={{ border: "1px solid var(--lp-border)" }}>
            <div className="lp-compare-header">
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--lp-fg-muted)" }}>Recurso</div>
              <div className="text-center" style={{ fontSize: 13, color: "var(--lp-fg-subtle)" }}>Typebot</div>
              <div className="text-center" style={{ fontSize: 13, color: "var(--lp-fg-subtle)" }}>ManyChat</div>
              <div className="text-center" style={{ fontSize: 13, color: "var(--lp-fg-subtle)" }}>HubSpot</div>
              <div className="text-center" style={{ fontSize: 13, fontWeight: 700, color: "#14B8A6" }}>Flux</div>
            </div>
            {[
              ["Builder visual", "✓", "✓", "—", "✓"],
              ["AI Builder (1 prompt → bot)", "—", "—", "—", "✓"],
              ["CRM nativo", "—", "básico", "✓", "✓"],
              ["Lead Score + Forecast", "—", "—", "parcial", "✓"],
              ["Revenue Attribution", "—", "—", "parcial", "✓"],
              ["LGPD nativa", "—", "—", "parcial", "✓"],
              ["Colunas do funil cobertas", "1/4", "1–2/4", "3–4/4", "4/4"],
            ].map(([feat, ...vals], i) => (
              <div key={i} className="lp-compare-row">
                <div style={{ fontSize: 13, color: "var(--lp-fg-muted)" }}>{feat}</div>
                {vals.map((v, j) => (
                  <div key={j} className="text-center" style={{ fontSize: 13, color: j === 3 ? "#14B8A6" : v === "—" ? "var(--lp-fg-subtle)" : "var(--lp-fg-muted)", fontWeight: j === 3 ? 600 : 400 }}>
                    {v}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── FAQ ───────── */}
      <section id="faq" style={{ padding: "100px 0", borderTop: "1px solid var(--lp-border)" }}>
        <div
          ref={faqReveal.ref}
          className={`mx-auto px-5 md:px-8 lp-reveal ${faqReveal.visible ? "lp-reveal-show" : ""}`}
          style={{ maxWidth: 800 }}
        >
          <div className="text-center mb-12">
            <SectionLabel>Perguntas frequentes</SectionLabel>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "clamp(1.8rem, 4vw, 2.6rem)", letterSpacing: "-0.025em", color: "var(--lp-fg)", margin: 0 }}>
              Respostas diretas
            </h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {FAQ_ITEMS.map((item, i) => (
              <div
                key={i}
                style={{ borderBottom: "1px solid var(--lp-border)", overflow: "hidden" }}
              >
                <button
                  onClick={() => toggleFaq(i)}
                  className="w-full text-left flex items-center justify-between"
                  style={{ padding: "20px 0", background: "none", border: "none", cursor: "pointer", gap: 16 }}
                >
                  <span style={{ fontSize: 15, fontWeight: 600, color: "var(--lp-fg)", lineHeight: 1.5 }}>{item.q}</span>
                  <div style={{ flexShrink: 0, color: "var(--lp-fg-subtle)", transition: "transform 200ms ease", transform: openFaq === i ? "rotate(180deg)" : "rotate(0deg)" }}>
                    <ChevronDown size={18} />
                  </div>
                </button>
                <div
                  style={{
                    maxHeight: openFaq === i ? 320 : 0,
                    overflow: "hidden",
                    transition: "max-height 280ms cubic-bezier(0.16,1,0.3,1)",
                  }}
                >
                  <p style={{ paddingBottom: 20, margin: 0, fontSize: 14, lineHeight: 1.75, color: "var(--lp-fg-muted)" }}>
                    {item.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── LGPD ───────── */}
      <section style={{ padding: "80px 0", borderTop: "1px solid var(--lp-border)" }}>
        <div
          ref={lgpdReveal.ref}
          className={`mx-auto px-5 md:px-8 lp-reveal ${lgpdReveal.visible ? "lp-reveal-show" : ""}`}
          style={{ maxWidth: 1200 }}
        >
          <div className="text-center mb-10">
            <SectionLabel><Shield size={10} style={{ marginRight: 4 }} />Conformidade</SectionLabel>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "clamp(1.6rem, 3vw, 2.2rem)", letterSpacing: "-0.02em", color: "var(--lp-fg)", margin: 0 }}>
              Compliance nativo. Não adicionado depois.
            </h2>
            <p style={{ marginTop: 12, fontSize: 16, color: "var(--lp-fg-muted)", maxWidth: 500, marginLeft: "auto", marginRight: "auto", lineHeight: 1.6 }}>
              LGPD e GDPR foram construídos dentro da arquitetura — não integrados como plugin.
            </p>
          </div>

          <div className="lp-lgpd-grid">
            {[
              { icon: <Lock size={18} />, title: "RLS em todas as tabelas", text: "Cada workspace é completamente isolado. Dados de um cliente nunca cruzam com outro." },
              { icon: <CheckCircle2 size={18} />, title: "Consentimento nativo", text: "Banner de aceite, registro de consentimento com timestamp e histórico auditável por lead." },
              { icon: <Shield size={18} />, title: "Audit Logs completos", text: "Cada ação no sistema é registrada com data, hora e responsável. Prova para qualquer auditoria." },
              { icon: <Database size={18} />, title: "Data Deletion URL", text: "Endpoint de exclusão de dados conforme exigência da Meta, Google e regulatórios." },
              { icon: <Zap size={18} />, title: "Secret Vault em memória", text: "Tokens e credenciais nunca vão para localStorage. Ficam em memória volátil e são limpos ao encerrar." },
              { icon: <Users size={18} />, title: "Multi-tenant enterprise", text: "Arquitetura preparada para agências revenderem com segurança e isolamento por cliente." },
            ].map((item, i) => (
              <div
                key={i}
                className="lp-lgpd-card"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div style={{ color: "#14B8A6" }}>{item.icon}</div>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "var(--lp-fg)" }}>{item.title}</span>
                </div>
                <p style={{ fontSize: 13, lineHeight: 1.65, color: "var(--lp-fg-subtle)", margin: 0 }}>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── CTA FINAL ───────── */}
      <section style={{ padding: "100px 0", borderTop: "1px solid var(--lp-border)" }}>
        <div
          ref={ctaReveal.ref}
          className={`mx-auto px-5 md:px-8 lp-reveal ${ctaReveal.visible ? "lp-reveal-show" : ""}`}
          style={{ maxWidth: 720 }}
        >
          <div
            className="rounded-3xl text-center p-10 md:p-16 relative overflow-hidden"
            style={{ background: "var(--lp-bg-elevated)", border: "1px solid rgba(13,148,136,0.20)", boxShadow: "0 0 80px -20px rgba(13,148,136,0.12)" }}
          >
            {/* Glow */}
            <div className="absolute pointer-events-none" style={{ inset: 0, background: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(13,148,136,0.12) 0%, transparent 70%)", zIndex: 0 }} />
            <div className="relative" style={{ zIndex: 1 }}>
              <div
                className="inline-flex items-center gap-1.5 rounded-full mb-6"
                style={{ border: "1px solid rgba(13,148,136,0.30)", background: "rgba(13,148,136,0.06)", padding: "4px 14px", fontSize: 11, fontWeight: 600, color: "#14B8A6", letterSpacing: "0.07em", textTransform: "uppercase" }}
              >
                <Zap size={10} style={{ color: "#14B8A6" }} />
                14 dias grátis
              </div>

              <h2
                style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: "clamp(2rem, 5vw, 3rem)", letterSpacing: "-0.03em", lineHeight: 1.1, color: "var(--lp-fg)", margin: "0 0 20px 0" }}
              >
                O lead que você gerou já está qualificado no CRM. Você só abriu o computador.
              </h2>

              <p style={{ fontSize: 17, lineHeight: 1.65, color: "var(--lp-fg-muted)", marginBottom: 36 }}>
                Sem cartão de crédito. Primeiro bot no ar em 30 minutos. Cancele quando quiser.
              </p>

              <div className="flex items-center justify-center flex-wrap" style={{ gap: 12 }}>
                <Link to="/dashboard">
                  <BtnPrimary>
                    Criar minha conta grátis <ArrowRight size={15} />
                  </BtnPrimary>
                </Link>
                <BtnOutline href="#jornada">
                  Ver como funciona
                </BtnOutline>
              </div>

              <div className="flex items-center justify-center flex-wrap mt-6" style={{ gap: "6px 20px", fontSize: 12, color: "var(--lp-fg-subtle)" }}>
                {["Sem cartão de crédito", "14 dias grátis", "LGPD compliant"].map(t => (
                  <span key={t} className="flex items-center gap-1.5">
                    <CheckCircle2 size={11} style={{ color: "#0D9488" }} /> {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── FOOTER ───────── */}
      <footer style={{ borderTop: "1px solid var(--lp-border)", padding: "48px 0" }}>
        <div className="mx-auto px-5 md:px-8" style={{ maxWidth: 1200 }}>
          <div className="lp-footer-grid mb-10">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div style={{ width: 32, height: 32, borderRadius: 9, background: "linear-gradient(135deg, #0D9488 0%, #0F766E 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Zap size={14} className="text-white" strokeWidth={2.5} />
                </div>
                <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 15, color: "var(--lp-fg)" }}>Flux Agent Studio</span>
              </div>
              <p style={{ fontSize: 13, lineHeight: 1.65, color: "var(--lp-fg-subtle)", maxWidth: 240 }}>
                Conversational Revenue OS para empresas que geram leads.
              </p>
            </div>

            {/* Links */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--lp-fg-subtle)", marginBottom: 16 }}>Produto</div>
              {["AI Builder", "Lead Intelligence", "Revenue Attribution", "Connector Hub", "LGPD Compliance"].map(l => (
                <div key={l} style={{ marginBottom: 10 }}>
                  <a href="#produto" style={{ fontSize: 13, color: "var(--lp-fg-muted)", textDecoration: "none" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = "#F8FAFC"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--lp-fg-muted)"; }}
                  >{l}</a>
                </div>
              ))}
            </div>

            <div>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--lp-fg-subtle)", marginBottom: 16 }}>Para quem</div>
              {["Agências digitais", "Imobiliárias", "Clínicas", "SaaS B2B", "Gestores comerciais"].map(l => (
                <div key={l} style={{ marginBottom: 10 }}>
                  <span style={{ fontSize: 13, color: "var(--lp-fg-muted)" }}>{l}</span>
                </div>
              ))}
            </div>

            <div>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--lp-fg-subtle)", marginBottom: 16 }}>Legal</div>
              {["Política de Privacidade", "Termos de Uso", "LGPD", "Status"].map(l => (
                <div key={l} style={{ marginBottom: 10 }}>
                  <a href="#" style={{ fontSize: 13, color: "var(--lp-fg-muted)", textDecoration: "none" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = "#F8FAFC"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--lp-fg-muted)"; }}
                  >{l}</a>
                </div>
              ))}
            </div>
          </div>

          <div style={{ borderTop: "1px solid var(--lp-border)", paddingTop: 24, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <p style={{ fontSize: 12, color: "var(--lp-fg-subtle)", margin: 0 }}>
              © 2026 Fluxrow Tecnologia. Todos os direitos reservados.
            </p>
            <p style={{ fontSize: 12, color: "var(--lp-fg-subtle)", margin: 0 }}>
              Feito no Brasil · LGPD · GDPR
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ─────────── Sub-components ─────────── */

function CanvasNode({ type, label, highlight = false }: { type: string; label: string; highlight?: boolean }) {
  return (
    <div style={{ borderRadius: 10, border: highlight ? "1px solid rgba(13,148,136,0.40)" : "1px solid var(--lp-border-mid)", background: highlight ? "rgba(13,148,136,0.07)" : "rgba(255,255,255,0.03)", padding: "10px 14px" }}>
      <div style={{ fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase", color: highlight ? "#14B8A6" : "var(--lp-fg-subtle)", marginBottom: 4 }}>{type}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--lp-fg)" }}>{label}</div>
    </div>
  );
}

function CanvasNodeCRM() {
  return (
    <div style={{ borderRadius: 10, border: "1px solid rgba(217,119,6,0.30)", background: "rgba(217,119,6,0.05)", padding: "12px 14px" }}>
      <div className="flex items-center gap-1.5 mb-2">
        <Database size={11} style={{ color: "#D97706" }} />
        <span style={{ fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase", color: "#D97706" }}>CRM · Pipeline</span>
      </div>
      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--lp-fg)", marginBottom: 8 }}>Lead criado automaticamente</div>
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5" style={{ fontSize: 10, color: "var(--lp-fg-subtle)" }}><Brain size={9} />Score: 87/100</div>
        <div className="flex items-center gap-1.5" style={{ fontSize: 10, color: "#14B8A6" }}><TrendingUp size={9} />Qualificado</div>
      </div>
    </div>
  );
}

function ChatBubble({ side, text }: { side: "bot" | "user"; text: string }) {
  const isBot = side === "bot";
  return (
    <div style={{ borderRadius: isBot ? "16px 16px 16px 4px" : "16px 16px 4px 16px", background: isBot ? "var(--lp-bg-subtle)" : "rgba(13,148,136,0.15)", border: isBot ? "1px solid var(--lp-border)" : "1px solid rgba(13,148,136,0.20)", padding: "8px 12px", fontSize: 12, lineHeight: 1.5, color: "var(--lp-fg-muted)", marginLeft: isBot ? 0 : "auto" }}>
      {text}
    </div>
  );
}
