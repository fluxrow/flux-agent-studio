/**
 * ConversationFrame — shared shell consumed by every renderer.
 *
 * Handles common concerns once:
 *   - typing simulation
 *   - per-block delay (config.delay) auto-applied via useTyping
 *   - composer/choice routing
 *   - personalization
 *   - theme variables → inline CSS
 *
 * Individual renderers just configure styling/copy through their theme.
 */
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Send } from "lucide-react";
import type { RendererProps } from "./types";
import { useTyping } from "./typing";
import { personalize } from "./personalization";

export function ConversationFrame(props: RendererProps & {
  /** Optional override of the bubble layout (e.g. form mode renders Q&A). */
  variant?: "chat" | "form";
}) {
  const { engine, state, theme, typing, delay, title, onSubmitInput, onSubmitChoice, variant = "chat" } = props;
  const { transcript, typing: isTyping } = useTyping(state, typing, delay);

  const status = state?.context.status ?? "idle";
  const awaiting = state?.awaiting;
  const isInput = status === "awaiting_input";
  const isChoice = status === "awaiting_choice";
  const ended = status === "ended" || status === "error";

  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [transcript.length, isTyping]);
  useEffect(() => { if (isInput) inputRef.current?.focus(); }, [isInput, awaiting?.id]);

  const variables = state?.context.variables;
  const personalizedTitle = personalize(title, variables);
  const personalizedSubtitle = personalize(theme.subtitle ?? "", variables);

  const choiceOptions = (isChoice ? ((awaiting?.config.options as string[] | undefined) ?? []) : []);

  const submit = () => {
    if (!engine || !draft.trim() || !isInput) return;
    onSubmitInput(draft.trim());
    setDraft("");
  };

  const surfaceStyle: CSSProperties = {
    background: theme.background,
    color: theme.botText,
    fontFamily: theme.fontFamily,
  };
  const headerStyle: CSSProperties = { background: theme.header };
  const composerStyle: CSSProperties = { background: theme.surface };

  return (
    <div className="flex flex-col h-full w-full" style={surfaceStyle}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5" style={headerStyle}>
        <div
          className="h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
          style={{ background: theme.accent, color: "#fff" }}
        >
          {theme.avatar ?? personalizedTitle.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-semibold truncate" style={{ color: theme.botText }}>{personalizedTitle}</div>
          {personalizedSubtitle && (
            <div className="text-[10px] opacity-70" style={{ color: theme.botText }}>{personalizedSubtitle}</div>
          )}
        </div>
        <div className="text-[9px] uppercase tracking-widest opacity-50" style={{ color: theme.botText }}>{theme.label}</div>
      </div>

      {/* Transcript */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5" style={{ background: theme.background }}>
        {transcript.map((m, i) => {
          if (m.kind === "system") {
            return (
              <div key={i} className="text-center text-[10px] uppercase tracking-widest opacity-60 py-1" style={{ color: theme.botText }}>
                {m.text}
              </div>
            );
          }
          const isUser = m.kind === "user";
          const isAssistantPlain = !isUser && variant === "form";
          return (
            <div key={i} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
              <div
                className={`px-3.5 py-2 max-w-[85%] text-sm whitespace-pre-wrap break-words ${theme.bubbleRadius ?? "rounded-2xl"} ${isAssistantPlain ? "" : "shadow-sm"}`}
                style={{
                  background: isUser ? theme.userBubble : (isAssistantPlain ? "transparent" : theme.botBubble),
                  color: isUser ? theme.userText : theme.botText,
                }}
              >
                {personalize(m.text, variables)}
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex justify-start">
            <div
              className={`px-3.5 py-2.5 text-sm ${theme.bubbleRadius ?? "rounded-2xl"} inline-flex items-center gap-1`}
              style={{ background: theme.botBubble, color: theme.botText }}
            >
              <Dot delay={0} color={theme.botText} />
              <Dot delay={150} color={theme.botText} />
              <Dot delay={300} color={theme.botText} />
            </div>
          </div>
        )}

        {isChoice && choiceOptions.length > 0 && !isTyping && (
          <div className="flex flex-wrap gap-2 pt-1">
            {choiceOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => onSubmitChoice(opt)}
                className="text-xs px-3 py-1.5 rounded-full transition hover:opacity-80"
                style={{
                  background: "transparent",
                  border: `1px solid ${theme.accent}`,
                  color: theme.accent,
                }}
              >
                {personalize(opt, variables)}
              </button>
            ))}
          </div>
        )}

        {ended && (
          <div className="text-center pt-4">
            <div
              className="inline-block px-4 py-2.5 rounded-2xl text-xs"
              style={{ background: `${theme.accent}22`, border: `1px solid ${theme.accent}55`, color: theme.accent }}
            >
              Conversa encerrada · obrigado!
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Composer */}
      <div className="flex items-center gap-2 p-3 border-t border-white/5" style={composerStyle}>
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
          disabled={!isInput}
          className="flex-1 rounded-full px-4 py-2 text-sm outline-none disabled:opacity-50"
          style={{
            background: theme.background === "#ffffff" ? "#f0f0f0" : "rgba(255,255,255,0.08)",
            color: theme.botText,
            border: "1px solid rgba(255,255,255,0.05)",
          }}
          placeholder={
            isInput ? personalize(String(awaiting?.config.placeholder ?? "Digite sua resposta..."), variables)
            : isChoice ? "Escolha uma opção acima"
            : ended ? "Conversa encerrada"
            : "Aguarde…"
          }
        />
        <button
          onClick={submit}
          disabled={!isInput || !draft.trim()}
          className="h-9 w-9 rounded-full flex items-center justify-center disabled:opacity-40 transition hover:opacity-90"
          style={{ background: theme.accent, color: "#fff" }}
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function Dot({ delay, color }: { delay: number; color: string }) {
  return (
    <span
      className="inline-block h-1.5 w-1.5 rounded-full opacity-60 animate-pulse"
      style={{ background: color, animationDelay: `${delay}ms` }}
    />
  );
}
