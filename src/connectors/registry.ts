/**
 * ConnectorRegistry — single source of truth for connector manifests.
 *
 * Manifests are intentionally separate from installations: a manifest is the
 * "blueprint" (marketplace-ready), an installation is a workspace-scoped
 * record persisted via connectorStore.
 */
import type { ConnectorManifest } from "./types";

class ConnectorRegistry {
  private manifests = new Map<string, ConnectorManifest>();
  private listeners = new Set<() => void>();

  register(manifest: ConnectorManifest) {
    if (!manifest.id) throw new Error("Connector manifest is missing id");
    if (!manifest.version) throw new Error(`Connector ${manifest.id} missing version`);
    if (!Array.isArray(manifest.actions)) throw new Error(`Connector ${manifest.id} missing actions[]`);
    if (!Array.isArray(manifest.triggers)) throw new Error(`Connector ${manifest.id} missing triggers[]`);
    this.manifests.set(manifest.id, manifest);
    this.notify();
  }

  unregister(id: string) {
    this.manifests.delete(id);
    this.notify();
  }

  get(id: string): ConnectorManifest | undefined {
    return this.manifests.get(id);
  }

  list(): ConnectorManifest[] {
    return Array.from(this.manifests.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  subscribe(fn: () => void) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private notify() {
    this.listeners.forEach((l) => {
      try { l(); } catch (e) { console.error("[ConnectorRegistry] listener error", e); }
    });
  }
}

export const connectorRegistry = new ConnectorRegistry();
