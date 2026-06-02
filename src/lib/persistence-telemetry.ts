/**
 * Persistence telemetry — tracks runtime activity on each repository
 * domain so the System Health panel and /debug/repositories page can
 * surface "Is it alive? When did it last work? What broke?" answers.
 *
 * Zero-dependency, framework-agnostic. The persistence facade wraps each
 * repository with a Proxy that funnels every method call through here.
 */
export type RepoCallStatus = "ok" | "error";

export interface RepoCallRecord {
  domain: string;
  method: string;
  status: RepoCallStatus;
  at: string;
  durationMs: number;
  error?: string;
}

export interface DomainTelemetry {
  domain: string;
  calls: number;
  errors: number;
  lastCall?: RepoCallRecord;
  lastError?: RepoCallRecord;
}

type Listener = () => void;

class PersistenceTelemetry {
  private byDomain = new Map<string, DomainTelemetry>();
  private listeners = new Set<Listener>();

  record(rec: RepoCallRecord) {
    const cur =
      this.byDomain.get(rec.domain) ??
      { domain: rec.domain, calls: 0, errors: 0 };
    cur.calls += 1;
    cur.lastCall = rec;
    if (rec.status === "error") {
      cur.errors += 1;
      cur.lastError = rec;
    }
    this.byDomain.set(rec.domain, cur);
    this.listeners.forEach((l) => l());
  }

  snapshot(): DomainTelemetry[] {
    return Array.from(this.byDomain.values()).sort((a, b) =>
      a.domain.localeCompare(b.domain),
    );
  }

  get(domain: string): DomainTelemetry | undefined {
    return this.byDomain.get(domain);
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  reset() {
    this.byDomain.clear();
    this.listeners.forEach((l) => l());
  }
}

export const persistenceTelemetry = new PersistenceTelemetry();

/** Wrap any repository so every async method is recorded. */
export function instrumentRepository<T extends object>(
  domain: string,
  repo: T,
): T {
  return new Proxy(repo, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);
      if (typeof value !== "function") return value;
      return (...args: unknown[]) => {
        const started = performance.now();
        const method = String(prop);
        try {
          const result = (value as (...a: unknown[]) => unknown).apply(target, args);
          if (result && typeof (result as Promise<unknown>).then === "function") {
            return (result as Promise<unknown>)
              .then((v) => {
                persistenceTelemetry.record({
                  domain,
                  method,
                  status: "ok",
                  at: new Date().toISOString(),
                  durationMs: performance.now() - started,
                });
                return v;
              })
              .catch((err: unknown) => {
                persistenceTelemetry.record({
                  domain,
                  method,
                  status: "error",
                  at: new Date().toISOString(),
                  durationMs: performance.now() - started,
                  error: err instanceof Error ? err.message : String(err),
                });
                throw err;
              });
          }
          persistenceTelemetry.record({
            domain,
            method,
            status: "ok",
            at: new Date().toISOString(),
            durationMs: performance.now() - started,
          });
          return result;
        } catch (err) {
          persistenceTelemetry.record({
            domain,
            method,
            status: "error",
            at: new Date().toISOString(),
            durationMs: performance.now() - started,
            error: err instanceof Error ? err.message : String(err),
          });
          throw err;
        }
      };
    },
  });
}
