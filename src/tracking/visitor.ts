/**
 * Visitor + Attribution capture.
 *
 * Pure browser utilities — no React, no Supabase. They build a stable
 * visitor identity in `localStorage` and snapshot UTM/click-id params
 * from the current URL.
 */
import type { Attribution, VisitorProfile } from "./types";

const VISITOR_KEY = "fluxbot:visitor_id";
const ATTRIBUTION_KEY = "fluxbot:attribution";
const PROFILE_KEY = "fluxbot:visitor_profile";

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;
const CLICK_KEYS = ["fbclid", "gclid", "ttclid", "msclkid"] as const;

const rand = () =>
  `v_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;

export function getOrCreateVisitorId(): string {
  if (typeof window === "undefined") return rand();
  let id = window.localStorage.getItem(VISITOR_KEY);
  if (!id) {
    id = rand();
    window.localStorage.setItem(VISITOR_KEY, id);
  }
  return id;
}

export function resetVisitor(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(VISITOR_KEY);
  window.localStorage.removeItem(ATTRIBUTION_KEY);
  window.localStorage.removeItem(PROFILE_KEY);
}

/* ---------------- Device / browser detection ---------------- */

export function detectBrowser(): VisitorProfile {
  if (typeof window === "undefined") {
    return {
      visitorId: getOrCreateVisitorId(),
      firstSeenAt: new Date().toISOString(),
      lastSeenAt: new Date().toISOString(),
    };
  }
  const ua = window.navigator.userAgent || "";
  const lang = window.navigator.language;
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const browser = matchBrowser(ua);
  const os = matchOS(ua);
  const deviceType = matchDevice(ua);

  return {
    visitorId: getOrCreateVisitorId(),
    firstSeenAt: new Date().toISOString(),
    lastSeenAt: new Date().toISOString(),
    browser,
    os,
    deviceType,
    language: lang,
    timezone: tz,
    referrer: window.document.referrer || undefined,
    landingPage: window.location.href,
    userAgent: ua,
  };
}

function matchBrowser(ua: string): string {
  if (/edg\//i.test(ua)) return "Edge";
  if (/opr\/|opera/i.test(ua)) return "Opera";
  if (/chrome|crios/i.test(ua)) return "Chrome";
  if (/firefox|fxios/i.test(ua)) return "Firefox";
  if (/safari/i.test(ua)) return "Safari";
  return "Other";
}

function matchOS(ua: string): string {
  if (/windows/i.test(ua)) return "Windows";
  if (/android/i.test(ua)) return "Android";
  if (/iphone|ipad|ipod/i.test(ua)) return "iOS";
  if (/mac os x|macintosh/i.test(ua)) return "macOS";
  if (/linux/i.test(ua)) return "Linux";
  return "Other";
}

function matchDevice(ua: string): VisitorProfile["deviceType"] {
  if (/ipad|tablet/i.test(ua)) return "tablet";
  if (/mobile|iphone|android/i.test(ua)) return "mobile";
  if (typeof window !== "undefined" && window.innerWidth < 768) return "mobile";
  return "desktop";
}

/* ---------------- Attribution ---------------- */

export function captureAttributionFromUrl(): Attribution | null {
  if (typeof window === "undefined") return null;
  const url = new URL(window.location.href);
  const params = url.searchParams;
  const hit: Record<string, string> = {};
  let dirty = false;
  for (const k of UTM_KEYS) {
    const v = params.get(k);
    if (v) { hit[k] = v; dirty = true; }
  }
  for (const k of CLICK_KEYS) {
    const v = params.get(k);
    if (v) { hit[k] = v; dirty = true; }
  }
  if (!dirty) return loadStoredAttribution();
  const attribution: Attribution = {
    utmSource: hit.utm_source,
    utmMedium: hit.utm_medium,
    utmCampaign: hit.utm_campaign,
    utmContent: hit.utm_content,
    utmTerm: hit.utm_term,
    fbclid: hit.fbclid,
    gclid: hit.gclid,
    ttclid: hit.ttclid,
    msclkid: hit.msclkid,
    referrer: window.document.referrer || undefined,
    landingPage: window.location.href,
    capturedAt: new Date().toISOString(),
  };
  try {
    window.localStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(attribution));
  } catch {}
  return attribution;
}

export function loadStoredAttribution(): Attribution | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(ATTRIBUTION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Attribution;
  } catch {
    return null;
  }
}

export function persistVisitorProfile(profile: VisitorProfile): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {}
}

export function loadStoredProfile(): VisitorProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as VisitorProfile;
  } catch {
    return null;
  }
}
