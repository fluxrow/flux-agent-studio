export * from "./types";
export { EventBus, runtimeEventBus } from "./bus";

import type { ExecutionEvent, ExecutionEventType } from "./types";
import type { ID } from "@/types/common";

const eid = () => `ev_${Math.random().toString(36).slice(2, 10)}`;

export function makeEvent<P extends Record<string, unknown>>(
  type: ExecutionEventType,
  base: { sessionId: ID; flowId: ID; botId?: ID; workspaceId?: ID; blockId?: ID },
  payload: P,
): ExecutionEvent<P> {
  return {
    id: eid(),
    type,
    at: new Date().toISOString(),
    payload,
    ...base,
  };
}
