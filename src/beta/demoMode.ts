/**
 * Phase 21 — Demo Workspace mode
 *
 * Lightweight flag stored in localStorage. When active, the UI shows a
 * banner and primes the user that they are exploring sample data. Real
 * persistence is untouched — the mock layer already ships with rich
 * seeded data (bots, leads, conversations, analytics), so toggling this
 * flag while in mock mode immediately surfaces value.
 *
 * In Supabase mode the toggle simply navigates the user through the demo
 * surfaces of the product (no destructive writes).
 */
const KEY = "fluxbot.demoMode";

export function isDemoMode(): boolean {
  try { return localStorage.getItem(KEY) === "1"; } catch { return false; }
}

export function setDemoMode(on: boolean) {
  try {
    if (on) localStorage.setItem(KEY, "1");
    else localStorage.removeItem(KEY);
    window.dispatchEvent(new CustomEvent("fluxbot:demoMode", { detail: on }));
  } catch { /* noop */ }
}

export function toggleDemoMode(): boolean {
  const next = !isDemoMode();
  setDemoMode(next);
  return next;
}
