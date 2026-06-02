import type { ConnectorAdapter } from "./types";

class AdapterRegistry {
  private map = new Map<string, ConnectorAdapter>();
  register(a: ConnectorAdapter) { this.map.set(a.manifestId, a); }
  get(manifestId: string): ConnectorAdapter | undefined { return this.map.get(manifestId); }
  has(manifestId: string): boolean { return this.map.has(manifestId); }
  list(): ConnectorAdapter[] { return [...this.map.values()]; }
}

export const adapterRegistry = new AdapterRegistry();
