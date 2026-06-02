/**
 * Destinations Registry.
 *
 * Holds adapters + per-destination config, subscribes to the Tracking
 * Engine, maps internal events → external events, dispatches them and
 * records every attempt (success/failure/skipped) for the Inspector and
 * Analytics Validation panel.
 *
 *   TrackingEngine → Registry.dispatch(event)
 *                       └─► adapter.map(event) → adapter.send(mapped)
 *                              └─► record in DispatchLog (ring buffer)
 */
import { trackingEngine } from "../engine";
import type { TrackedEvent } from "../types";
import {
  DestinationAdapter,
  DestinationConfig,
  DestinationStatus,
  DispatchRecord,
} from "./types";
import { metaAdapter } from "./meta";
import { googleAdapter } from "./google";
import { linkedinAdapter, n8nAdapter, tiktokAdapter, webhookAdapter } from "./stubs";
import {
  SENSITIVE_KEYS,
  getSecrets,
  mergeSecrets,
} from "@/security/secretVault";

const STORAGE_KEY = "fluxbot.tracking.destinations.v1";
const MAX_RECORDS = 200;

/** Split credentials into (publicMeta, secrets) using the shared vault rules. */
function splitCredentials(creds: Record<string, string> = {}) {
  const publicMeta: Record<string, string> = {};
  const secrets: Record<string, string> = {};
  for (const [key, value] of Object.entries(creds)) {
    if (SENSITIVE_KEYS.has(key)) secrets[key] = String(value);
    else publicMeta[key] = String(value);
  }
  return { publicMeta, secrets };
}

interface RegistryState {
  configs: Record<string, DestinationConfig>;
  records: DispatchRecord[];
  queue: number;
}

const DEFAULT_CONFIG: DestinationConfig = { enabled: true, mock: true, credentials: {} };

class DestinationRegistry {
  private adapters: DestinationAdapter[] = [];
  private state: RegistryState = { configs: {}, records: [], queue: 0 };
  private listeners = new Set<() => void>();
  private started = false;

  register(adapter: DestinationAdapter) {
    this.adapters.push(adapter);
    if (!this.state.configs[adapter.id]) {
      this.state.configs[adapter.id] = { ...DEFAULT_CONFIG, credentials: {} };
    }
  }

  start() {
    if (this.started) return;
    this.started = true;
    this.loadFromStorage();
    trackingEngine.on((ev) => this.dispatch(ev));
  }

  /* ------------ Public surface ------------ */

  list(): DestinationAdapter[] { return [...this.adapters]; }
  /**
   * Returns the full config including secrets pulled live from the vault.
   * Adapters call this through `dispatch`; UI should use `getPublicConfig`.
   */
  getConfig(id: string): DestinationConfig {
    const cfg = this.state.configs[id] ?? { ...DEFAULT_CONFIG };
    const vaulted = getSecrets("tracking", id);
    return { ...cfg, credentials: { ...(cfg.credentials ?? {}), ...vaulted } };
  }
  /** Same as getConfig but never includes secret fields — safe for UI/telemetry. */
  getPublicConfig(id: string): DestinationConfig {
    return this.state.configs[id] ?? { ...DEFAULT_CONFIG };
  }
  getRecords(): DispatchRecord[] { return [...this.state.records].reverse(); }
  getQueueSize(): number { return this.state.queue; }

  statusOf(id: string): DestinationStatus {
    const ad = this.adapters.find((a) => a.id === id);
    if (!ad) return "disconnected";
    return ad.statusFor(this.getConfig(id));
  }

  stats() {
    const out: Record<string, { success: number; failure: number; skipped: number; total: number }> = {};
    for (const r of this.state.records) {
      const bucket = out[r.destination] ??= { success: 0, failure: 0, skipped: 0, total: 0 };
      bucket[r.outcome]++;
      bucket.total++;
    }
    return out;
  }

  setConfig(id: string, patch: Partial<DestinationConfig>) {
    const current = this.getPublicConfig(id);
    // BUG-01: route secret fields (accessToken, apiKey, …) to the in-memory
    // vault so they never touch localStorage. Public meta (pixelId, accountId)
    // continues to live in the persisted state.
    const incomingCreds = patch.credentials ?? {};
    const { publicMeta, secrets } = splitCredentials(incomingCreds);
    if (Object.keys(secrets).length > 0) mergeSecrets("tracking", id, secrets);
    this.state.configs[id] = {
      ...current,
      ...patch,
      credentials: { ...(current.credentials ?? {}), ...publicMeta },
    };
    this.saveToStorage();
    this.emit();
  }

  on(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  clearRecords() {
    this.state.records = [];
    this.emit();
  }

  /* ------------ Internals ------------ */

  private async dispatch(event: TrackedEvent) {
    for (const adapter of this.adapters) {
      const cfg = this.getConfig(adapter.id);
      if (!cfg.enabled) continue;
      const mappedList = adapter.map(event);
      if (mappedList.length === 0) continue;

      for (const mapped of mappedList) {
        this.state.queue++;
        this.emit();
        const rec: DispatchRecord = {
          id: `d_${Math.random().toString(36).slice(2, 10)}`,
          destination: adapter.id,
          internalType: event.type,
          externalName: mapped.name,
          outcome: "success",
          at: new Date().toISOString(),
          payload: mapped.payload,
        };
        try {
          await adapter.send(mapped, cfg);
          rec.outcome = cfg.mock ? "skipped" : "success";
        } catch (err: any) {
          rec.outcome = "failure";
          rec.error = err?.message ?? String(err);
          console.error(`[tracking:${adapter.id}] dispatch failed`, err);
        } finally {
          this.state.queue = Math.max(0, this.state.queue - 1);
          this.pushRecord(rec);
        }
      }
    }
  }

  private pushRecord(rec: DispatchRecord) {
    this.state.records.push(rec);
    if (this.state.records.length > MAX_RECORDS) {
      this.state.records.splice(0, this.state.records.length - MAX_RECORDS);
    }
    this.emit();
  }

  private emit() {
    this.listeners.forEach((l) => { try { l(); } catch (e) { console.error(e); } });
  }

  private loadFromStorage() {
    if (typeof localStorage === "undefined") return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { configs?: Record<string, DestinationConfig> };
      if (parsed.configs) {
        for (const [id, cfg] of Object.entries(parsed.configs)) {
          // Defensive: even if a previous (pre-18.7) build persisted secrets,
          // strip them on read so we never reload tokens from disk.
          const { publicMeta, secrets } = splitCredentials(cfg.credentials ?? {});
          if (Object.keys(secrets).length > 0) {
            console.warn(`[destinations] purged ${Object.keys(secrets).length} legacy secret(s) for ${id}`);
          }
          this.state.configs[id] = { ...DEFAULT_CONFIG, ...cfg, credentials: publicMeta };
        }
      }
    } catch (e) {
      console.warn("[destinations] failed to load config", e);
    }
  }

  private saveToStorage() {
    if (typeof localStorage === "undefined") return;
    try {
      // Only public metadata is serialized — sensitive keys live in the vault.
      const safeConfigs: Record<string, DestinationConfig> = {};
      for (const [id, cfg] of Object.entries(this.state.configs)) {
        const { publicMeta } = splitCredentials(cfg.credentials ?? {});
        safeConfigs[id] = { ...cfg, credentials: publicMeta };
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ configs: safeConfigs }));
    } catch (e) {
      console.warn("[destinations] failed to persist config", e);
    }
  }
}

export const destinations = new DestinationRegistry();

// Register built-in adapters.
destinations.register(metaAdapter);
destinations.register(googleAdapter);
destinations.register(n8nAdapter);
destinations.register(webhookAdapter);
destinations.register(linkedinAdapter);
destinations.register(tiktokAdapter);
