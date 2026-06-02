/**
 * Phase 18.5 — Health Monitor
 * Aggregates a snapshot view of subsystems. Lightweight & decoupled —
 * each subsystem reports its own status without coupling back here.
 */
import type { HealthCheck, HealthStatus, HealthSubsystem } from "./types";

const reports = new Map<HealthSubsystem, HealthCheck>();

const LABELS: Record<HealthSubsystem, string> = {
  runtime:       "Runtime Engine",
  repositories:  "Persistence (Repositories)",
  connectors:    "Connector Hub",
  ai_providers:  "AI Providers",
  tracking:      "Tracking Engine",
  crm:           "CRM / Leads",
  knowledge:     "Knowledge Base",
  channels:      "Channels Bus",
};

const DEFAULT_STATUS: Record<HealthSubsystem, HealthStatus> = {
  runtime: "healthy",
  repositories: "healthy",
  connectors: "healthy",
  ai_providers: "healthy",
  tracking: "healthy",
  crm: "healthy",
  knowledge: "healthy",
  channels: "warning", // most stubs still
};

export function reportHealth(
  subsystem: HealthSubsystem,
  status: HealthStatus,
  detail: string,
): HealthCheck {
  const check: HealthCheck = {
    subsystem,
    label: LABELS[subsystem],
    status,
    detail,
    checkedAt: new Date().toISOString(),
  };
  reports.set(subsystem, check);
  return check;
}

export function getHealthSnapshot(): HealthCheck[] {
  return (Object.keys(LABELS) as HealthSubsystem[]).map((sub) => {
    const existing = reports.get(sub);
    if (existing) return existing;
    return {
      subsystem: sub,
      label: LABELS[sub],
      status: DEFAULT_STATUS[sub],
      detail:
        DEFAULT_STATUS[sub] === "healthy"
          ? "Operacional"
          : DEFAULT_STATUS[sub] === "warning"
            ? "Funcionando com limitações conhecidas"
            : "Falha detectada",
      checkedAt: new Date().toISOString(),
    };
  });
}

export function overallHealth(): HealthStatus {
  const snap = getHealthSnapshot();
  if (snap.some((c) => c.status === "error")) return "error";
  if (snap.some((c) => c.status === "warning")) return "warning";
  return "healthy";
}
