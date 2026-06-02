/**
 * Connector Hub — domain types.
 *
 * The FluxBot core (Runtime, CRM, Tracking, AI, Knowledge) MUST NOT know about
 * specific integrations. Everything external — Google Sheets, Slack, Stripe,
 * HubSpot, Meta, WhatsApp, Telegram, n8n, Salesforce, custom APIs — flows
 * through this single abstraction.
 *
 * Manifests are designed to be marketplace-compatible (1:1 portable to a future
 * registry / store) and credentials are described declaratively so the
 * Credentials Manager (Phase 15 Compliance) can render UI for any connector
 * without bespoke code.
 */
import type { ID, ISODate } from "@/types/common";

export type ConnectorKind =
  | "app"        // Standard SaaS App connector (Slack, GSheets, HubSpot…)
  | "mcp"        // Model Context Protocol server
  | "api"        // Raw REST/HTTP API
  | "webhook"    // Inbound/outbound webhook bridge
  | "internal";  // First-party internal capability exposed as a connector

export type ConnectorCategory =
  | "messaging"
  | "crm"
  | "spreadsheet"
  | "payments"
  | "analytics"
  | "automation"
  | "ai"
  | "calendar"
  | "storage"
  | "custom";

export type ConnectorLifecycle =
  | "installed"
  | "configured"
  | "connected"
  | "disconnected"
  | "error"
  | "disabled";

export type ConnectorPermission =
  | "read"
  | "write"
  | "send_message"
  | "manage_contacts"
  | "manage_payments"
  | "manage_files"
  | "manage_events"
  | "execute_automation";

/* ------------------------------------------------------------------ */
/* Credentials                                                        */
/* ------------------------------------------------------------------ */

export type CredentialFieldType =
  | "text"
  | "password"
  | "url"
  | "select"
  | "oauth"
  | "token";

export interface CredentialField {
  key: string;
  label: string;
  type: CredentialFieldType;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  options?: string[]; // for select
  /** Optional regex used for client-side validation. */
  pattern?: string;
}

export interface ConnectorCredentialSpec {
  /** Logical group, e.g. "production" / "sandbox". */
  environment?: "production" | "sandbox" | "any";
  fields: CredentialField[];
}

export interface ConnectorCredential {
  id: ID;
  connectorId: ID;
  workspaceId: ID;
  environment: "production" | "sandbox" | "any";
  /** Masked preview only — real values live in the credentials manager / secrets store. */
  preview: Record<string, string>;
  createdAt: ISODate;
  updatedAt: ISODate;
}

/* ------------------------------------------------------------------ */
/* Actions & Triggers                                                  */
/* ------------------------------------------------------------------ */

export interface ConnectorParameter {
  key: string;
  label: string;
  type: "string" | "number" | "boolean" | "json" | "select";
  required?: boolean;
  options?: string[];
  defaultValue?: unknown;
  description?: string;
}

export interface ConnectorAction {
  key: string;
  name: string;
  description?: string;
  permissions?: ConnectorPermission[];
  parameters?: ConnectorParameter[];
  /** Optional JSON-schema-ish output hint for the AI/Builder. */
  output?: Record<string, unknown>;
}

export interface ConnectorTrigger {
  key: string;
  name: string;
  description?: string;
  /** Sample payload — used by Builder previews + AI Block grounding. */
  samplePayload?: Record<string, unknown>;
}

/* ------------------------------------------------------------------ */
/* Manifest (marketplace-compatible)                                  */
/* ------------------------------------------------------------------ */

export interface ConnectorManifest {
  id: string;                        // stable slug, e.g. "google-sheets"
  name: string;
  description: string;
  category: ConnectorCategory;
  kind: ConnectorKind;
  version: string;                   // semver
  author: string;
  iconKey?: string;                  // logical icon name (rendered by UI)
  homepage?: string;
  permissions: ConnectorPermission[];
  credentials?: ConnectorCredentialSpec;
  actions: ConnectorAction[];
  triggers: ConnectorTrigger[];
  /** Tags used by the marketplace search. */
  tags?: string[];
  /** Marks first-party manifests. */
  official?: boolean;
}

/* ------------------------------------------------------------------ */
/* Installed connector record                                         */
/* ------------------------------------------------------------------ */

export interface Connector {
  id: ID;                            // installation id
  workspaceId: ID;
  manifestId: string;
  lifecycle: ConnectorLifecycle;
  credentialId?: ID;
  lastError?: string;
  installedAt: ISODate;
  updatedAt: ISODate;
  meta?: Record<string, unknown>;
}

/* ------------------------------------------------------------------ */
/* Events                                                              */
/* ------------------------------------------------------------------ */

export type ConnectorEventType =
  | "connector_installed"
  | "connector_configured"
  | "connector_connected"
  | "connector_disconnected"
  | "connector_disabled"
  | "connector_error"
  | "connector_action_executed"
  | "connector_trigger_received";

export interface ConnectorEvent {
  id: ID;
  type: ConnectorEventType;
  connectorId: ID;
  manifestId: string;
  workspaceId: ID;
  at: ISODate;
  payload?: Record<string, unknown>;
}
