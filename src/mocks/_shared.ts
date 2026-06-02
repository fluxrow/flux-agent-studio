/**
 * Single workspace ID used across all mock fixtures so foreign keys line up.
 * In production this comes from the authenticated session.
 */
export const MOCK_WORKSPACE_ID = "ws_fluxbot_demo";

export const nowIso = () => new Date().toISOString();

/** Deterministic ISO timestamp for stable mocks (avoids re-render churn). */
export const fixedIso = (daysAgo = 0) => {
  const d = new Date("2026-06-01T12:00:00Z");
  d.setUTCDate(d.getUTCDate() - daysAgo);
  return d.toISOString();
};
