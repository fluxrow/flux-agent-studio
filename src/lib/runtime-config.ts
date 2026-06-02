/**
 * Runtime configuration flags.
 *
 * Phase 5 introduces a single DI switch to flip the whole persistence
 * layer between mock (in-memory) and Supabase-backed adapters without
 * touching any page or component code.
 *
 * Defaults to MOCK so the app keeps working exactly as before. Flip to
 * Supabase by setting `VITE_USE_SUPABASE=true` in `.env` (or runtime).
 */
// Phase 22A — default flipped to Supabase mode. The `.env` file is managed
// by Lovable Cloud and does not expose VITE_USE_SUPABASE, so we treat the
// real persistence layer as the default and only fall back to mock when
// the flag is explicitly set to "false".
export const USE_SUPABASE: boolean =
  String(import.meta.env.VITE_USE_SUPABASE ?? "true").toLowerCase() === "true";

export const PERSISTENCE_MODE: "mock" | "supabase" = USE_SUPABASE
  ? "supabase"
  : "mock";
