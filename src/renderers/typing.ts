/**
 * Typing + Delay simulation hook.
 *
 * Watches engine transcript length and reveals bot messages with a
 * computed delay (instant / realistic / custom). Returns a virtual
 * transcript truncated to what should be visible right now, plus a
 * `typing` flag for the typing indicator.
 *
 * The engine is never blocked — we just hide already-emitted bot bubbles
 * until their reveal time elapses. User messages always appear instantly.
 */
import { useEffect, useRef, useState } from "react";
import type { EngineState } from "@/runtime/types";
import type { DelayConfig, TypingConfig } from "./types";

interface UseTypingResult {
  transcript: EngineState["transcript"];
  typing: boolean;
}

function computeDelay(text: string, typing: TypingConfig, delay: DelayConfig, blockMs?: number): number {
  if (typing.mode === "instant") return 0;

  let base: number;
  if (typing.mode === "realistic") {
    const perChar = typing.msPerChar ?? 28;
    base = Math.max(typing.minDelayMs ?? 500, Math.min(typing.maxDelayMs ?? 3500, perChar * text.length));
  } else {
    // custom
    base = typing.msPerChar ? typing.msPerChar * text.length : 800;
  }

  if (delay.mode === "fixed") base += delay.fixedMs ?? 0;
  if (delay.mode === "random") {
    const lo = delay.randomMinMs ?? 200;
    const hi = delay.randomMaxMs ?? 1200;
    base += Math.floor(lo + Math.random() * (hi - lo));
  }
  if (delay.mode === "per_block" && blockMs != null) base += blockMs;

  return base;
}

export function useTyping(state: EngineState | null, typing: TypingConfig, delay: DelayConfig): UseTypingResult {
  const [visibleCount, setVisibleCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const timerRef = useRef<number | null>(null);
  const lastSeenRef = useRef(0);

  const transcript = state?.transcript ?? [];

  useEffect(() => {
    // Reset on full transcript wipe (engine.start())
    if (transcript.length < lastSeenRef.current) {
      lastSeenRef.current = 0;
      setVisibleCount(0);
    }
    lastSeenRef.current = transcript.length;

    if (visibleCount >= transcript.length) {
      setIsTyping(false);
      return;
    }

    const next = transcript[visibleCount];
    if (!next) return;

    // User + system messages reveal immediately.
    if (next.kind !== "bot") {
      setVisibleCount((c) => c + 1);
      return;
    }

    setIsTyping(true);
    const ms = computeDelay(next.text, typing, delay);
    timerRef.current = window.setTimeout(() => {
      setVisibleCount((c) => c + 1);
    }, ms);

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [transcript.length, visibleCount, typing, delay]);

  return {
    transcript: transcript.slice(0, visibleCount),
    typing: isTyping && visibleCount < transcript.length,
  };
}
