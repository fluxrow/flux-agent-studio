import { useEffect, useMemo, useState } from "react";
import { RuntimeEngine, createEngine } from "@/runtime";
import type { EngineState } from "@/runtime";
import type { Flow } from "@/types";

/**
 * Thin React adapter for the runtime engine. The engine itself is pure TS;
 * this hook just subscribes to its events and re-renders.
 */
export function useEngine(flow: Flow | null | undefined) {
  const engine = useMemo<RuntimeEngine | null>(
    () => (flow ? createEngine(flow) : null),
    [flow],
  );

  const [state, setState] = useState<EngineState | null>(
    () => engine?.getState() ?? null,
  );

  useEffect(() => {
    if (!engine) return;
    setState(engine.getState());
    return engine.on((event) => {
      if (event.type === "state") setState(event.state);
      else setState(engine.getState());
    });
  }, [engine]);

  return { engine, state };
}
