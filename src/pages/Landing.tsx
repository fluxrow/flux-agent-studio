import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Zap, ArrowRight, Play, CheckCircle2, TrendingUp, Database, Brain } from "lucide-react";

/* ─── Mockup animation state ─── */
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
  node1: false, line1: false,
  node2: false, line2: false,
  node3: false, line3: false,
  node4: false,
  chat1: false, typing1: false,
  chat2: false, typing2: false,
  chat3: false,
};

export default function Landing() {
  const [mock, setMock] = useState<MockupState>(MOCK_INIT);
  const line1Ref = useRef<SVGPathElement>(null);
  const line2Ref = useRef<SVGPathElement>(null);
  const line3Ref = useRef<SVGPathElement>(null);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const q = (ms: number, fn: () => void) => timers.push(setTimeout(fn, ms));

    q(1200, () => setMock(s => ({ ...s, node1: true })));
    q(1500, () => {
      setMock(s => ({ ...s, line1: true }));
      line1Ref.current?.classList.add("lp-line-draw");
    });
    q(1750, () => setMock(s => ({ ...s, node2: true })));
    q(2000, () => {
      setMock(s => ({ ...s, line2: true }));
      line2Ref.current?.classList.add("lp-line-draw");
    });
    q(2300, () => setMock(s => ({ ...s, node3: true })));
    q(2700, () => {
      setMock(s => ({ ...s, line3: true }));
      line3Ref.current?.classList.add("lp-line-draw");
    });
    q(2950, () => setMock(s => ({ ...s, node4: true })));
    q(1400, () => setMock(s => ({ ...s, chat1: true })));
    q(2200, () => setMock(s => ({ ...s, typing1: true })));
    q(2800, () => setMock(s => ({ ...s, typing1: false, chat2: true })));
    q(3400, () => setMock(s => ({ ...s, typing2: true })));
    q(3900, () => setMock(s => ({ ...s, typing2: false, chat3: true })));

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="lp-v2 min-h-screen overflow-hidden" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ─── NAV ─── */}
      <nav
        className="fixed top-0 inset-x-0 z-50"
        style={{
          height: 64,
          borderBottom: "1px solid var(--lp-border)",
          background: "rgba(9,9,12,0.80)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        <div
          className="mx-auto flex items-center justify-between h-full px-6"
          style={{ maxWidth: 1200 }}
        >
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div
              className="flex items-center justify-center rounded-xl"
              style={{
                width: 36, height: 36,
                background: "linear-gradient(135deg, var(--lp-primary) 0%, var(--lp-primary-dark) 100%)",
              }}
            >
              <Zap className="h-4 w-4" style={{ color: "#fff" }} strokeWidth={2.5} />
            </div>
            <span
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
                fontSize: 17,
                color: "var(--lp-fg)",
                letterSpacing: "-0.01em",
              }}
            >
              Flux Agent Studio
            </span>
          </div>

          {/* Links */}
          <div className="hidden md:flex items-center gap-7" style={{ fontSize: 14, color: "var(--lp-fg-muted)" }}>
            <a href="#produto" className="hover:text-white transition-colors duration-150">Produto</a>
            <a href="#jornada" className="hover:text-white transition-colors duration-150">Como funciona</a>
            <a href="#precos" className="hover:text-white transition-colors duration-150">Preços</a>
            <a href="#docs" className="hover:text-white transition-colors duration-150">Docs</a>
          </div>

          {/* CTA */}
          <Link to="/dashboard">
            <button
              style={{
                height: 40,
                padding: "0 20px",
                background: "linear-gradient(135deg, var(--lp-accent) 0%, var(--lp-accent-light) 100%)",
                color: "#fff",
                fontWeight: 600,
                fontSize: 14,
                borderRadius: 10,
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                transition: "transform 150ms cubic-bezier(0.34,1.56,0.64,1), filter 150ms ease",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.03)";
                (e.currentTarget as HTMLButtonElement).style.filter = "brightness(1.1)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
                (e.currentTarget as HTMLButtonElement).style.filter = "brightness(1)";
              }}
              onMouseDown={e => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.97)"; }}
              onMouseUp={e => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.03)"; }}
            >
              Começar grátis <ArrowRight size={14} />
            </button>
          </Link>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section
        className="relative"
        style={{ paddingTop: 160, paddingBottom: 128 }}
        aria-label="Hero"
      >
        {/* Glow radial de fundo — sem grid */}
        <div
          className="lp-hero-glow-bg absolute pointer-events-none"
          style={{
            inset: 0,
            background: "radial-gradient(ellipse 80% 55% at 50% -5%, rgba(13,148,136,0.18) 0%, transparent 70%)",
            zIndex: 0,
          }}
        />

        <div className="relative mx-auto px-6" style={{ maxWidth: 1200, zIndex: 1 }}>

          {/* Copy central — max-w-3xl centrado */}
          <div className="mx-auto text-center" style={{ maxWidth: 760 }}>

            {/* Eyebrow badge */}
            <div
              className="lp-enter-1 inline-flex items-center gap-1.5 rounded-full mb-7"
              style={{
                border: "1px solid rgba(13,148,136,0.30)",
                background: "rgba(13,148,136,0.06)",
                padding: "4px 14px",
                fontSize: 12,
                fontWeight: 600,
                color: "var(--lp-primary-glow)",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              <Zap size={10} style={{ color: "var(--lp-primary-glow)" }} />
              Conversational Revenue OS
            </div>

            {/* H1 — 2 linhas com stagger */}
            <h1
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 800,
                fontSize: "clamp(2.75rem, 6vw, 4.5rem)",
                letterSpacing: "-0.03em",
                lineHeight: 1.02,
                color: "var(--lp-fg)",
                margin: 0,
              }}
            >
              <span className="lp-enter-2 block">
                Seu próximo cliente está
              </span>
              <span className="lp-enter-3 block" style={{ color: "var(--lp-fg)" }}>
                esperando resposta.{" "}
                <span style={{ color: "var(--lp-primary-glow)" }}>O Flux já deu.</span>
              </span>
            </h1>

            {/* Subheadline */}
            <p
              className="lp-enter-4"
              style={{
                marginTop: 24,
                fontSize: 18,
                lineHeight: 1.7,
                color: "var(--lp-fg-muted)",
                maxWidth: 560,
                marginLeft: "auto",
                marginRight: "auto",
              }}
            >
              Agentes de IA que atendem, qualificam leads e entram no seu CRM
              automaticamente — 24/7, em qualquer canal. Sem código.
            </p>

            {/* CTAs */}
            <div
              className="lp-enter-5 flex items-center justify-center flex-wrap"
              style={{ gap: 12, marginTop: 36 }}
            >
              <Link to="/dashboard">
                <button
                  className="cta-primary"
                  style={{
                    height: 48,
                    padding: "0 28px",
                    background: "linear-gradient(135deg, var(--lp-accent) 0%, var(--lp-accent-light) 100%)",
                    color: "#fff",
                    fontWeight: 600,
                    fontSize: 15,
                    borderRadius: 12,
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    transition: "transform 150ms cubic-bezier(0.34,1.56,0.64,1), filter 150ms ease",
                    whiteSpace: "nowrap",
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.03)"; (e.currentTarget as HTMLButtonElement).style.filter = "brightness(1.1)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; (e.currentTarget as HTMLButtonElement).style.filter = "brightness(1)"; }}
                  onMouseDown={e => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.97)"; }}
                  onMouseUp={e => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.03)"; }}
                >
                  Começar grátis <ArrowRight size={15} />
                </button>
              </Link>
              <a href="#jornada">
                <button
                  style={{
                    height: 48,
                    padding: "0 28px",
                    background: "transparent",
                    color: "var(--lp-fg-muted)",
                    fontWeight: 500,
                    fontSize: 15,
                    borderRadius: 12,
                    border: "1px solid var(--lp-border-mid)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    transition: "color 200ms ease, border-color 200ms ease",
                    whiteSpace: "nowrap",
                  }}
                  onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.color = "var(--lp-fg)"; b.style.borderColor = "rgba(255,255,255,0.22)"; }}
                  onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.color = "var(--lp-fg-muted)"; b.style.borderColor = "var(--lp-border-mid)"; }}
                >
                  <Play size={13} fill="currentColor" /> Ver demonstração
                </button>
              </a>
            </div>

            {/* Trust line */}
            <div
              className="lp-fade-6 flex items-center justify-center flex-wrap"
              style={{ gap: "6px 20px", marginTop: 24, fontSize: 12, color: "var(--lp-fg-subtle)" }}
            >
              {["Sem cartão de crédito", "14 dias grátis", "LGPD compliant", "Cancele quando quiser"].map(t => (
                <span key={t} className="flex items-center gap-1.5">
                  <CheckCircle2 size={12} style={{ color: "var(--lp-primary)" }} />
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* ─── MOCKUP ─── */}
          <div
            className="lp-enter-mock relative mx-auto mt-16"
            style={{ maxWidth: 960 }}
          >
            {/* Glow sob o mockup */}
            <div
              className="absolute pointer-events-none"
              style={{
                inset: "-20px -40px",
                background: "radial-gradient(ellipse 70% 40% at 50% 110%, rgba(13,148,136,0.12) 0%, transparent 70%)",
                zIndex: 0,
              }}
            />

            {/* Chrome frame */}
            <div
              className="relative rounded-2xl overflow-hidden"
              style={{
                border: "1px solid var(--lp-border-mid)",
                background: "var(--lp-bg-elevated)",
                boxShadow: "0 24px 64px -16px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04) inset",
                zIndex: 1,
              }}
            >
              {/* Chrome bar */}
              <div
                className="flex items-center gap-1.5 px-4"
                style={{
                  height: 40,
                  borderBottom: "1px solid var(--lp-border)",
                  background: "rgba(255,255,255,0.02)",
                }}
              >
                <div className="h-2.5 w-2.5 rounded-full" style={{ background: "rgba(255,255,255,0.12)" }} />
                <div className="h-2.5 w-2.5 rounded-full" style={{ background: "rgba(255,255,255,0.12)" }} />
                <div className="h-2.5 w-2.5 rounded-full" style={{ background: "rgba(255,255,255,0.12)" }} />
                <div
                  className="ml-4 flex items-center rounded-md px-3"
                  style={{
                    height: 24,
                    fontSize: 11,
                    color: "var(--lp-fg-subtle)",
                    fontFamily: "'JetBrains Mono', monospace",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid var(--lp-border)",
                  }}
                >
                  fluxagent.studio/builder/sdr
                </div>
              </div>

              {/* 3-panel content */}
              <div className="grid" style={{ gridTemplateColumns: "180px 1fr 240px", minHeight: 400 }}>

                {/* Panel 1 — Palette */}
                <div
                  style={{
                    borderRight: "1px solid var(--lp-border)",
                    background: "rgba(255,255,255,0.01)",
                    padding: 16,
                  }}
                >
                  <div style={{ fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--lp-fg-subtle)", marginBottom: 12 }}>
                    Blocos
                  </div>
                  {[
                    { label: "Mensagem",  color: "var(--lp-fg-subtle)" },
                    { label: "Pergunta",  color: "var(--lp-fg-subtle)" },
                    { label: "IA ✦",      color: "var(--lp-primary-glow)", highlight: true },
                    { label: "CRM",       color: "var(--lp-fg-subtle)" },
                    { label: "Webhook",   color: "var(--lp-fg-subtle)" },
                    { label: "Score",     color: "var(--lp-fg-subtle)" },
                  ].map(b => (
                    <div
                      key={b.label}
                      style={{
                        padding: "8px 12px",
                        borderRadius: 8,
                        marginBottom: 6,
                        fontSize: 12,
                        fontWeight: b.highlight ? 600 : 400,
                        color: b.color,
                        border: b.highlight
                          ? "1px solid rgba(13,148,136,0.30)"
                          : "1px solid var(--lp-border)",
                        background: b.highlight
                          ? "rgba(13,148,136,0.07)"
                          : "rgba(255,255,255,0.02)",
                      }}
                    >
                      {b.label}
                    </div>
                  ))}
                </div>

                {/* Panel 2 — Canvas */}
                <div className="relative" style={{ padding: 24, overflow: "hidden" }}>

                  {/* SVG connections */}
                  <svg
                    className="absolute inset-0 pointer-events-none"
                    style={{ width: "100%", height: "100%" }}
                  >
                    {/* Line: node1 → node2 */}
                    <path
                      ref={line1Ref}
                      className="lp-connection-line"
                      d="M 96 88 C 96 114, 96 114, 96 148"
                      stroke="rgba(13,148,136,0.5)"
                      strokeWidth="1.5"
                      fill="none"
                    />
                    {/* Line: node2 → node3 */}
                    <path
                      ref={line2Ref}
                      className="lp-connection-line"
                      d="M 96 198 C 96 224, 96 224, 96 258"
                      stroke="rgba(13,148,136,0.5)"
                      strokeWidth="1.5"
                      fill="none"
                    />
                    {/* Line: node3 → node4 (âmbar — vai para o CRM) */}
                    <path
                      ref={line3Ref}
                      className="lp-connection-line"
                      d="M 176 290 C 240 290, 240 180, 300 180"
                      stroke="rgba(217,119,6,0.55)"
                      strokeWidth="1.5"
                      fill="none"
                      strokeDasharray="4 3"
                    />
                  </svg>

                  {/* Node 1 — Saudação */}
                  <div
                    className={`lp-node absolute ${mock.node1 ? "lp-node-show" : ""}`}
                    style={{ top: 24, left: 24, width: 144 }}
                  >
                    <CanvasNode type="Mensagem" label="Saudação" />
                  </div>

                  {/* Node 2 — Coleta Nome */}
                  <div
                    className={`lp-node absolute ${mock.node2 ? "lp-node-show" : ""}`}
                    style={{ top: 148, left: 24, width: 144 }}
                  >
                    <CanvasNode type="Pergunta" label="Coleta dados" />
                  </div>

                  {/* Node 3 — IA Qualifica */}
                  <div
                    className={`lp-node absolute ${mock.node3 ? "lp-node-show-slow lp-ai-glow" : ""}`}
                    style={{ top: 258, left: 24, width: 144 }}
                  >
                    <CanvasNode type="IA ✦" label="Qualifica lead" highlight />
                  </div>

                  {/* Node 4 — CRM */}
                  <div
                    className={`lp-node absolute ${mock.node4 ? "lp-node-show" : ""}`}
                    style={{ top: 155, left: 300, width: 172 }}
                  >
                    <CanvasNodeCRM />
                  </div>
                </div>

                {/* Panel 3 — Chat preview */}
                <div
                  style={{
                    borderLeft: "1px solid var(--lp-border)",
                    background: "rgba(255,255,255,0.01)",
                    padding: 16,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div style={{ fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--lp-fg-subtle)", marginBottom: 14 }}>
                    Preview ao vivo
                  </div>

                  <div className="flex flex-col gap-2 flex-1">
                    {/* Bot msg 1 */}
                    {mock.chat1 && (
                      <div className="lp-bubble lp-bubble-show" style={{ maxWidth: "85%" }}>
                        <ChatBubble side="bot" text="Olá! Sou a IA da Flux. Como posso ajudar?" />
                      </div>
                    )}

                    {/* Typing 1 */}
                    {mock.typing1 && (
                      <div className={`lp-typing lp-typing-show rounded-2xl rounded-tl-sm`}
                        style={{ background: "var(--lp-bg-subtle)", maxWidth: 72 }}>
                        <span /><span /><span />
                      </div>
                    )}

                    {/* User msg */}
                    {mock.chat2 && (
                      <div className="lp-bubble lp-bubble-show self-end" style={{ maxWidth: "85%" }}>
                        <ChatBubble side="user" text="Tenho interesse no serviço." />
                      </div>
                    )}

                    {/* Typing 2 */}
                    {mock.typing2 && (
                      <div className={`lp-typing lp-typing-show rounded-2xl rounded-tl-sm`}
                        style={{ background: "var(--lp-bg-subtle)", maxWidth: 72 }}>
                        <span /><span /><span />
                      </div>
                    )}

                    {/* Bot msg 2 */}
                    {mock.chat3 && (
                      <div className="lp-bubble lp-bubble-show" style={{ maxWidth: "90%" }}>
                        <ChatBubble side="bot" text="Perfeito! Qual o seu nome e empresa?" />
                      </div>
                    )}
                  </div>

                  {/* Score badge */}
                  {mock.node4 && (
                    <div
                      className="lp-bubble lp-bubble-show mt-auto pt-3"
                      style={{ borderTop: "1px solid var(--lp-border)" }}
                    >
                      <div style={{ fontSize: 10, color: "var(--lp-fg-subtle)", marginBottom: 6 }}>Lead Score</div>
                      <div className="flex items-center gap-2">
                        <div
                          style={{
                            fontSize: 22,
                            fontWeight: 700,
                            fontFamily: "'Space Grotesk', sans-serif",
                            color: "var(--lp-primary-glow)",
                          }}
                        >87</div>
                        <div style={{ fontSize: 11, color: "var(--lp-fg-muted)" }}>/100<br /><span style={{ color: "#4ade80", fontSize: 10 }}>▲ Alto potencial</span></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PLACEHOLDER seções futuras (âncoras para nav) ─── */}
      <div id="produto" />
      <div id="jornada" />
      <div id="precos" />
      <div id="docs" />

      {/* Footer mínimo */}
      <footer
        style={{
          borderTop: "1px solid var(--lp-border)",
          padding: "32px 24px",
        }}
      >
        <div
          className="mx-auto flex items-center justify-between flex-wrap gap-4"
          style={{ maxWidth: 1200 }}
        >
          <div className="flex items-center gap-2" style={{ fontSize: 13, color: "var(--lp-fg-subtle)" }}>
            <Zap size={14} style={{ color: "var(--lp-primary)" }} />
            Flux Agent Studio © 2026
          </div>
          <div className="flex gap-6" style={{ fontSize: 13, color: "var(--lp-fg-subtle)" }}>
            <a href="#" className="hover:text-white transition-colors">Privacidade</a>
            <a href="#" className="hover:text-white transition-colors">Termos</a>
            <a href="#" className="hover:text-white transition-colors">Status</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ─── Sub-components ─── */

function CanvasNode({
  type, label, highlight = false,
}: { type: string; label: string; highlight?: boolean }) {
  return (
    <div
      style={{
        borderRadius: 10,
        border: highlight
          ? "1px solid rgba(13,148,136,0.40)"
          : "1px solid var(--lp-border-mid)",
        background: highlight
          ? "rgba(13,148,136,0.07)"
          : "rgba(255,255,255,0.03)",
        padding: "10px 14px",
      }}
    >
      <div style={{ fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase", color: highlight ? "var(--lp-primary-glow)" : "var(--lp-fg-subtle)", marginBottom: 4 }}>
        {type}
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--lp-fg)" }}>{label}</div>
    </div>
  );
}

function CanvasNodeCRM() {
  return (
    <div
      style={{
        borderRadius: 10,
        border: "1px solid rgba(217,119,6,0.30)",
        background: "rgba(217,119,6,0.05)",
        padding: "12px 14px",
      }}
    >
      <div className="flex items-center gap-1.5 mb-2">
        <Database size={11} style={{ color: "var(--lp-accent)" }} />
        <span style={{ fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--lp-accent)" }}>
          CRM · Pipeline
        </span>
      </div>
      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--lp-fg)", marginBottom: 8 }}>
        Lead criado automaticamente
      </div>
      <div className="flex flex-col gap-1.5">
        <Chip icon={<Brain size={9} />} label="Score: 87/100" />
        <Chip icon={<TrendingUp size={9} />} label="Etapa: Qualificado" color="var(--lp-primary)" />
      </div>
    </div>
  );
}

function Chip({ icon, label, color = "var(--lp-fg-subtle)" }: { icon: React.ReactNode; label: string; color?: string }) {
  return (
    <div className="flex items-center gap-1.5" style={{ fontSize: 10, color }}>
      {icon}{label}
    </div>
  );
}

function ChatBubble({ side, text }: { side: "bot" | "user"; text: string }) {
  const isBot = side === "bot";
  return (
    <div
      style={{
        borderRadius: isBot ? "16px 16px 16px 4px" : "16px 16px 4px 16px",
        background: isBot ? "var(--lp-bg-subtle)" : "rgba(13,148,136,0.15)",
        border: isBot ? "1px solid var(--lp-border)" : "1px solid rgba(13,148,136,0.20)",
        padding: "8px 12px",
        fontSize: 12,
        lineHeight: 1.5,
        color: "var(--lp-fg-muted)",
        marginLeft: isBot ? 0 : "auto",
      }}
    >
      {text}
    </div>
  );
}
