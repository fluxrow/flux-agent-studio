/**
 * Runtime configuration flags.
 *
 * Phase 5 introduces a single DI switch to flip the whole persistence
 * layer between mock (in-memory) and Supabase-backed adapters without
 * touching any page or component code.
 *
 * Supabase is the default. Set `VITE_USE_SUPABASE=false` only for the explicit
 * local mock runtime. Demo data is a separate read overlay controlled by
 * `isDemoMode()` and does not change this persistence selection.
 */
export const USE_SUPABASE: boolean =
  String(import.meta.env.VITE_USE_SUPABASE ?? "true").toLowerCase() === "true";

export const PERSISTENCE_MODE: "mock" | "supabase" = USE_SUPABASE
  ? "supabase"
  : "mock";
