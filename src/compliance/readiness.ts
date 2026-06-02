/**
 * Integration Readiness scoring — evaluates whether the workspace is
 * prepared for Meta / Google review and similar platform audits.
 */
import type { ReadinessCheck } from "./types";
import { getComplianceDocs, listAuditLogs, listConsents, listCredentials } from "./store";

export function evaluateReadiness(): ReadinessCheck[] {
  const docs = getComplianceDocs();
  const audits = listAuditLogs(1);
  const consents = listConsents();
  const creds = listCredentials();

  const docReady = (kind: "privacy" | "terms" | "data_deletion") => {
    const d = docs.find((x) => x.kind === kind);
    return d && d.body.trim().length > 80 ? "ready" : "partial";
  };

  const hasCred = (provider: string) =>
    creds.some((c) => c.provider === provider && c.status !== "invalid");

  const httpsEnabled =
    typeof window !== "undefined"
      ? window.location.protocol === "https:" || window.location.hostname === "localhost"
      : true;

  const checks: ReadinessCheck[] = [
    {
      key: "privacy_policy",
      label: "Política de Privacidade",
      description: "Documento público acessível em /privacy.",
      status: docReady("privacy") as ReadinessCheck["status"],
    },
    {
      key: "terms",
      label: "Termos de Uso",
      description: "Documento público acessível em /terms.",
      status: docReady("terms") as ReadinessCheck["status"],
    },
    {
      key: "data_deletion",
      label: "URL de exclusão de dados",
      description: "Página pública /data-deletion exigida por Meta.",
      status: docReady("data_deletion") as ReadinessCheck["status"],
    },
    {
      key: "audit_logs",
      label: "Logs de auditoria",
      description: "Eventos críticos registrados.",
      status: audits.length > 0 ? "ready" : "missing",
    },
    {
      key: "consent_tracking",
      label: "Rastreamento de consentimento",
      description: "Pelo menos um consentimento LGPD/GDPR registrado.",
      status: consents.length > 0 ? "ready" : "partial",
      hint: consents.length === 0 ? "Capture consentimento no bot público antes do review." : undefined,
    },
    {
      key: "meta_review_ready",
      label: "Meta Review Ready",
      description: "Credencial Meta + Privacy + Data Deletion configurados.",
      status:
        hasCred("meta") && docReady("privacy") === "ready" && docReady("data_deletion") === "ready"
          ? "ready"
          : "missing",
    },
    {
      key: "google_oauth_ready",
      label: "Google OAuth Ready",
      description: "Credencial Google + escopos publicados.",
      status: hasCred("google") ? "ready" : "missing",
    },
    {
      key: "domain_configured",
      label: "Domínio configurado",
      description: "Domínio personalizado para publicação dos bots.",
      status:
        typeof window !== "undefined" && !window.location.hostname.endsWith("lovable.app")
          ? "ready"
          : "partial",
    },
    {
      key: "https_enabled",
      label: "HTTPS ativo",
      description: "Conexão segura exigida por Meta e Google.",
      status: httpsEnabled ? "ready" : "missing",
    },
  ];

  return checks;
}
