/**
 * Thin wrapper around Dify env vars so tests can vi.mock this module
 * instead of having to stub import.meta.env at the module level.
 */
export interface DifyConfig {
  baseUrl: string;
  apiKey: string;
}

export function getDifyConfig(): DifyConfig | null {
  const baseUrl = (import.meta.env.VITE_DIFY_BASE_URL as string | undefined)?.replace(/\/$/, "");
  const apiKey = import.meta.env.VITE_DIFY_API_KEY as string | undefined;
  if (!baseUrl || !apiKey) return null;
  return { baseUrl, apiKey };
}
