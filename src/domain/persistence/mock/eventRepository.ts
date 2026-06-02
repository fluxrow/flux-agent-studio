import type { ExecutionEvent } from "@/types";
import type { EventQuery, EventRepository } from "../contracts";
import { delay } from "@/domain/mock/_helpers";

const store: ExecutionEvent[] = [];

export const mockEventRepository: EventRepository = {
  async record(event) {
    store.push(event);
  },
  async query(params: EventQuery = {}) {
    let items = store;
    if (params.sessionId) items = items.filter((e) => e.sessionId === params.sessionId);
    if (params.flowId) items = items.filter((e) => e.flowId === params.flowId);
    if (params.botId) items = items.filter((e) => e.botId === params.botId);
    if (params.type) items = items.filter((e) => e.type === params.type);
    if (params.limit) items = items.slice(-params.limit);
    return delay([...items]);
  },
  async clear() {
    store.length = 0;
  },
};
