/**
 * Phase 18.5 — Beta Readiness Program
 * Domain types. Pure data, no framework deps.
 */
import type { ID, ISODate } from "@/types/common";

/* ----------------------------- Feature Flags ----------------------------- */

export type FeatureKey =
  | "ai_builder"
  | "knowledge_base"
  | "connectors"
  | "lead_intelligence"
  | "omnichannel"
  | "marketplace";

export interface FeatureFlag {
  workspaceId: ID;
  key: FeatureKey;
  enabled: boolean;
  rollout?: number; // 0..100 for gradual rollout
  updatedAt: ISODate;
}

/* ------------------------------ Beta Users ------------------------------- */

export type BetaUserStatus = "invited" | "active" | "paused" | "removed";

export interface BetaUser {
  id: ID;
  workspaceId: ID;
  email: string;
  joinedAt: ISODate;
  status: BetaUserStatus;
  note?: string;
}

/* ------------------------------ Onboarding ------------------------------- */

export type OnboardingStepKey =
  | "create_bot"
  | "publish_bot"
  | "test_public_link"
  | "first_lead"
  | "view_crm"
  | "view_intelligence";

export interface OnboardingStep {
  key: OnboardingStepKey;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
}

export interface OnboardingProgress {
  workspaceId: ID;
  completed: OnboardingStepKey[];
  updatedAt: ISODate;
}

/* ----------------------------- Health Monitor ---------------------------- */

export type HealthStatus = "healthy" | "warning" | "error";

export type HealthSubsystem =
  | "runtime"
  | "repositories"
  | "connectors"
  | "ai_providers"
  | "tracking"
  | "crm"
  | "knowledge"
  | "channels";

export interface HealthCheck {
  subsystem: HealthSubsystem;
  label: string;
  status: HealthStatus;
  detail: string;
  checkedAt: ISODate;
}

/* ------------------------------ Error Center ----------------------------- */

export type ErrorKind =
  | "runtime"
  | "connector"
  | "ai"
  | "knowledge"
  | "tracking";

export interface ErrorRecord {
  id: ID;
  workspaceId: ID;
  kind: ErrorKind;
  source: string;        // e.g. "connector:slack" or "runtime:engine"
  message: string;
  stack?: string;
  context?: Record<string, unknown>;
  occurredAt: ISODate;
}

export interface ErrorFilters {
  workspaceId?: ID;
  kind?: ErrorKind;
  since?: ISODate;
  until?: ISODate;
}

/* -------------------------------- Feedback ------------------------------- */

export type FeedbackKind = "bug" | "suggestion" | "question" | "feature";

export interface FeedbackItem {
  id: ID;
  workspaceId: ID;
  kind: FeedbackKind;
  message: string;
  page?: string;
  email?: string;
  createdAt: ISODate;
}

/* ----------------------------- Usage Analytics --------------------------- */

export type UsageMetricKey =
  | "bots_created"
  | "bots_published"
  | "leads_generated"
  | "flows_executed"
  | "ai_builder_used"
  | "knowledge_used"
  | "connector_used";

export interface UsageMetric {
  workspaceId: ID;
  key: UsageMetricKey;
  value: number;
  updatedAt: ISODate;
}

/* --------------------------------- QA ------------------------------------ */

export type QAStatus = "pass" | "fail" | "pending";

export type QAItemKey =
  | "signup"
  | "login"
  | "builder"
  | "public_runtime"
  | "crm"
  | "lead_intelligence"
  | "knowledge_base"
  | "connectors"
  | "tracking"
  | "ai_builder"
  | "builder_dnd"
  | "builder_move"
  | "builder_connect"
  | "builder_save_reload"
  | "publish_valid"
  | "publish_invalid_blocked"
  | "public_link"
  | "lead_in_crm";

export interface QAItem {
  key: QAItemKey;
  label: string;
  group: string;
  status: QAStatus;
  note?: string;
  updatedAt: ISODate;
}

/* ---------------------------- Smoke Templates ---------------------------- */

export type SmokeTemplateKey = "sdr" | "atendimento" | "suporte" | "captura";

export interface SmokeTemplate {
  key: SmokeTemplateKey;
  name: string;
  description: string;
  /** Lightweight flow snapshot (compatible with builder import). */
  snapshot: Record<string, unknown>;
}

/* --------------------------------- Events -------------------------------- */

export type BetaEventType =
  | "feature_flag_toggled"
  | "beta_user_invited"
  | "beta_user_status_changed"
  | "onboarding_step_completed"
  | "health_check_failed"
  | "error_recorded"
  | "feedback_submitted"
  | "usage_metric_incremented"
  | "qa_item_updated";
