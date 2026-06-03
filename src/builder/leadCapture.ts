import type { Flow } from "@/types";

/**
 * Analyzes a flow to detect whether it captures basic lead contact info.
 * Used by Phase 25A guardrails to prevent the "published bot, empty CRM" surprise.
 */
export interface LeadCaptureAnalysis {
  capturesName: boolean;
  capturesEmail: boolean;
  capturesPhone: boolean;
  capturesAny: boolean;
  missing: Array<"nome" | "email" | "telefone">;
}

const NAME_RE = /(nome|name|fullname|full_name|first_name|primeiro_nome)/i;
const EMAIL_RE = /(email|e[-_]?mail)/i;
const PHONE_RE = /(telefone|phone|celular|whatsapp|\btel\b|mobile)/i;

export function analyzeLeadCapture(flow: Flow): LeadCaptureAnalysis {
  let capturesName = false;
  let capturesEmail = false;
  let capturesPhone = false;

  for (const b of flow.blocks) {
    if (b.type !== "input" && b.type !== "choice") continue;
    const variable = String(b.config?.variable ?? "");
    const label = String(b.label ?? "");
    const text = String(b.config?.text ?? "");
    const haystack = `${variable} ${label} ${text}`;
    if (NAME_RE.test(haystack)) capturesName = true;
    if (EMAIL_RE.test(haystack)) capturesEmail = true;
    if (PHONE_RE.test(haystack)) capturesPhone = true;
  }

  const missing: LeadCaptureAnalysis["missing"] = [];
  if (!capturesName) missing.push("nome");
  if (!capturesEmail) missing.push("email");
  if (!capturesPhone) missing.push("telefone");

  return {
    capturesName,
    capturesEmail,
    capturesPhone,
    capturesAny: capturesName || capturesEmail || capturesPhone,
    missing,
  };
}
