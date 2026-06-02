/**
 * Connector installation store.
 *
 * Workspace-scoped, persists to localStorage today. Designed to migrate 1:1 to
 * a `connectors` table in Lovable Cloud once integrations go live.
 */
import type {
  Connector,
  ConnectorCredential,
  ConnectorLifecycle,
} from "./types";

const KEY_CONNECTORS = "fluxbot.connectors.v1";
const KEY_CREDENTIALS = "fluxbot.connector_credentials.v1";
const KEY_CREDENTIAL_VALUES = "fluxbot.connector_credential_values.v1"; // dev-only raw values (will move to Secrets in prod)

type ConnectorsBlob = Record<string, Connector[]>;     // workspaceId -> []
type CredentialsBlob = Record<string, ConnectorCredential[]>; // workspaceId -> []

function read<T>(key: string): T {
  try {
    const raw = typeof localStorage !== "undefined" ? localStorage.getItem(key) : null;
    return raw ? (JSON.parse(raw) as T) : ({} as T);
  } catch { return {} as T; }
}
function write<T>(key: string, value: T) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* noop */ }
}

class ConnectorStore {
  private listeners = new Set<() => void>();

  /* -------- installations -------- */
  list(workspaceId: string): Connector[] {
    const blob = read<ConnectorsBlob>(KEY_CONNECTORS);
    return blob[workspaceId] ?? [];
  }
  get(workspaceId: string, id: string): Connector | undefined {
    return this.list(workspaceId).find((c) => c.id === id);
  }
  getByManifest(workspaceId: string, manifestId: string): Connector | undefined {
    return this.list(workspaceId).find((c) => c.manifestId === manifestId);
  }

  install(workspaceId: string, manifestId: string): Connector {
    const existing = this.getByManifest(workspaceId, manifestId);
    if (existing) return existing;
    const now = new Date().toISOString();
    const connector: Connector = {
      id: `cn_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
      workspaceId,
      manifestId,
      lifecycle: "installed",
      installedAt: now,
      updatedAt: now,
    };
    this.upsert(workspaceId, connector);
    return connector;
  }

  setLifecycle(workspaceId: string, id: string, lifecycle: ConnectorLifecycle, extras?: Partial<Connector>) {
    const c = this.get(workspaceId, id);
    if (!c) return;
    this.upsert(workspaceId, { ...c, ...extras, lifecycle, updatedAt: new Date().toISOString() });
  }

  remove(workspaceId: string, id: string) {
    const blob = read<ConnectorsBlob>(KEY_CONNECTORS);
    blob[workspaceId] = (blob[workspaceId] ?? []).filter((c) => c.id !== id);
    write(KEY_CONNECTORS, blob);
    this.notify();
  }

  private upsert(workspaceId: string, connector: Connector) {
    const blob = read<ConnectorsBlob>(KEY_CONNECTORS);
    const arr = blob[workspaceId] ?? [];
    const idx = arr.findIndex((c) => c.id === connector.id);
    if (idx >= 0) arr[idx] = connector; else arr.push(connector);
    blob[workspaceId] = arr;
    write(KEY_CONNECTORS, blob);
    this.notify();
  }

  /* -------- credentials -------- */
  listCredentials(workspaceId: string, connectorId?: string): ConnectorCredential[] {
    const blob = read<CredentialsBlob>(KEY_CREDENTIALS);
    const all = blob[workspaceId] ?? [];
    return connectorId ? all.filter((c) => c.connectorId === connectorId) : all;
  }

  saveCredential(input: {
    workspaceId: string;
    connectorId: string;
    values: Record<string, string>;
    environment?: "production" | "sandbox" | "any";
  }): ConnectorCredential {
    const now = new Date().toISOString();
    const preview: Record<string, string> = {};
    for (const [k, v] of Object.entries(input.values)) {
      preview[k] = v.length <= 4 ? "•".repeat(v.length) : `${v.slice(0, 2)}••••${v.slice(-2)}`;
    }
    const cred: ConnectorCredential = {
      id: `cc_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
      connectorId: input.connectorId,
      workspaceId: input.workspaceId,
      environment: input.environment ?? "production",
      preview,
      createdAt: now,
      updatedAt: now,
    };
    const blob = read<CredentialsBlob>(KEY_CREDENTIALS);
    blob[input.workspaceId] = [...(blob[input.workspaceId] ?? []), cred];
    write(KEY_CREDENTIALS, blob);
    // Dev-only: persist raw values locally so adapters can execute.
    // Production deployment will swap this for the Lovable Cloud secrets vault.
    const rawBlob = read<Record<string, Record<string, Record<string, string>>>>(KEY_CREDENTIAL_VALUES);
    rawBlob[input.workspaceId] = { ...(rawBlob[input.workspaceId] ?? {}), [cred.id]: input.values };
    write(KEY_CREDENTIAL_VALUES, rawBlob);
    this.notify();
    return cred;
  }

  /** Dev-only resolver for raw credential values used by adapters. */
  resolveCredentialValues(workspaceId: string, credentialId: string): Record<string, string> {
    const rawBlob = read<Record<string, Record<string, Record<string, string>>>>(KEY_CREDENTIAL_VALUES);
    return rawBlob[workspaceId]?.[credentialId] ?? {};
  }

  removeCredential(workspaceId: string, credentialId: string) {
    const blob = read<CredentialsBlob>(KEY_CREDENTIALS);
    blob[workspaceId] = (blob[workspaceId] ?? []).filter((c) => c.id !== credentialId);
    write(KEY_CREDENTIALS, blob);
    const rawBlob = read<Record<string, Record<string, Record<string, string>>>>(KEY_CREDENTIAL_VALUES);
    if (rawBlob[workspaceId]) { delete rawBlob[workspaceId][credentialId]; write(KEY_CREDENTIAL_VALUES, rawBlob); }
    this.notify();
  }

  /* -------- pub/sub -------- */
  subscribe(fn: () => void) { this.listeners.add(fn); return () => this.listeners.delete(fn); }
  private notify() { this.listeners.forEach((l) => { try { l(); } catch (e) { console.error(e); } }); }
}

export const connectorStore = new ConnectorStore();
