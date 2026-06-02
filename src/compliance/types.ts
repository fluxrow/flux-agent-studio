/**
 * Phase 15 — Integration Readiness Layer
 *
 * Type definitions for compliance, consent, audit logs, and credentials.
 * All storage is workspace-scoped localStorage (mock), ready to be replaced
 * with Supabase tables + Edge Functions when real integrations land.
 */
import type { ID, ISODate } from "@/types/common";

/* ---------------- Compliance documents ---------------- */

export type ComplianceDocKind = "privacy" | "terms" | "data_deletion";

export interface ComplianceDocument {
  id: ID;
  workspaceId: ID;
  kind: ComplianceDocKind;
  title: string;
  body: string;          // markdown / plain text
  version: number;
  updatedAt: ISODate;
  updatedBy?: string;
}

/* ---------------- Consent ---------------- */

export type ConsentRegime = "lgpd" | "gdpr" | "ccpa" | "generic";
export type ConsentChannel = "cookies" | "communication" | "storage" | "marketing";
export type ConsentStatus = "granted" | "revoked";

export interface ConsentRecord {
  id: ID;
  workspaceId: ID;
  visitorId: string;
  regime: ConsentRegime;
  channel: ConsentChannel;
  status: ConsentStatus;
  policyVersion?: number;
  recordedAt: ISODate;
  userAgent?: string;
  origin?: string;
}

/* ---------------- Audit log ---------------- */

export type AuditAction =
  | "login"
  | "logout"
  | "oauth_connect"
  | "oauth_disconnect"
  | "publish_bot"
  | "delete_bot"
  | "change_workspace"
  | "knowledge_upload"
  | "credential_added"
  | "credential_removed"
  | "credential_rotated"
  | "privacy_updated"
  | "terms_updated"
  | "consent_granted"
  | "consent_revoked";

export interface AuditLogEntry {
  id: ID;
  workspaceId: ID;
  actor?: string;       // user id / email / "system"
  action: AuditAction;
  target?: string;      // resource id
  metadata?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
  at: ISODate;
}

/* ---------------- Credentials ---------------- */

export type CredentialProvider =
  | "openai"
  | "anthropic"
  | "gemini"
  | "meta"
  | "google"
  | "webhook";

export type CredentialStatus = "unconfigured" | "pending" | "valid" | "invalid" | "expired";

export interface CredentialRecord {
  id: ID;
  workspaceId: ID;
  provider: CredentialProvider;
  label: string;
  /** Masked preview only — full value lives in Supabase Secrets. */
  maskedValue: string;
  status: CredentialStatus;
  /** Last successful validation timestamp. */
  lastValidatedAt?: ISODate;
  rotatedAt?: ISODate;
  createdAt: ISODate;
}

/* ---------------- Readiness checklist ---------------- */

export type ReadinessKey =
  | "meta_review_ready"
  | "google_oauth_ready"
  | "privacy_policy"
  | "terms"
  | "data_deletion"
  | "audit_logs"
  | "consent_tracking"
  | "domain_configured"
  | "https_enabled";

export interface ReadinessCheck {
  key: ReadinessKey;
  label: string;
  description: string;
  status: "ready" | "partial" | "missing";
  hint?: string;
}
