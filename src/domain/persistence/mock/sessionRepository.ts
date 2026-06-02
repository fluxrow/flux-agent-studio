import type { ExecutionEvent, ExecutionHistory, ID, Session } from "@/types";
import type { SessionRepository } from "../contracts";
import { nowIso } from "@/mocks/_shared";
import { delay } from "@/domain/mock/_helpers";

const sessions = new Map<ID, Session>();
const histories = new Map<ID, ExecutionHistory>();

export const mockSessionRepository: SessionRepository = {
  async create(input) {
    const now = nowIso();
    const session: Session = { ...input, createdAt: now, updatedAt: now };
    sessions.set(session.id, session);
    histories.set(session.id, {
      sessionId: session.id,
      flowId: session.botId,
      botId: session.botId,
      startedAt: session.startedAt,
      events: [],
    });
    return delay(session);
  },
  async get(id) {
    return delay(sessions.get(id) ?? null);
  },
  async listByBot(botId) {
    return delay([...sessions.values()].filter((s) => s.botId === botId));
  },
  async update(id, patch) {
    const current = sessions.get(id);
    if (!current) throw new Error(`Session ${id} not found`);
    const next: Session = { ...current, ...patch, updatedAt: nowIso() };
    sessions.set(id, next);
    return delay(next);
  },
  async appendHistory(sessionId, event) {
    const h = histories.get(sessionId);
    if (!h) return;
    h.events.push(event);
    if (event.type === "flow_completed" || event.type === "flow_abandoned") {
      h.endedAt = event.at;
    }
  },
  async history(sessionId) {
    return delay(histories.get(sessionId) ?? null);
  },
};
