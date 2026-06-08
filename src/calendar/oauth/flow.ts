import { GCAL_CLIENT_ID, GCAL_REDIRECT_URI, GCAL_SCOPES } from "./config";

const STORAGE_KEY = "gcal_oauth_nonce";

function randomHex(bytes = 16): string {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Array.from(arr).map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Initiates the Google OAuth flow. Redirects the user to Google's
 * consent screen. `userId` is embedded in the `state` param so the
 * edge callback can associate tokens with the right user.
 */
export function initiateAuth(userId: string): void {
  if (!GCAL_CLIENT_ID) {
    throw new Error("VITE_GCAL_CLIENT_ID não configurado.");
  }
  const nonce = randomHex();
  sessionStorage.setItem(STORAGE_KEY, nonce);

  const state = btoa(JSON.stringify({ userId, nonce, ts: Date.now() }));

  const params = new URLSearchParams({
    client_id: GCAL_CLIENT_ID,
    redirect_uri: GCAL_REDIRECT_URI,
    response_type: "code",
    access_type: "offline",
    prompt: "consent",
    scope: GCAL_SCOPES,
    state,
    include_granted_scopes: "true",
  });

  window.location.href =
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

/**
 * Validates the OAuth `state` returned from Google to prevent CSRF.
 * Returns the embedded `userId` if valid, throws otherwise.
 * Max age: 10 minutes.
 */
export function validateState(state: string): { userId: string } {
  const nonce = sessionStorage.getItem(STORAGE_KEY);
  sessionStorage.removeItem(STORAGE_KEY);

  let parsed: { userId: string; nonce: string; ts: number };
  try {
    parsed = JSON.parse(atob(state));
  } catch {
    throw new Error("OAuth state inválido.");
  }

  if (!nonce || parsed.nonce !== nonce) {
    throw new Error("OAuth state nonce não confere — possível CSRF.");
  }
  if (Date.now() - parsed.ts > 10 * 60 * 1000) {
    throw new Error("OAuth state expirado.");
  }
  return { userId: parsed.userId };
}
