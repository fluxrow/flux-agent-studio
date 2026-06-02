/**
 * SessionRouter — single map from (channel + platform user id) → sessionId.
 * Guarantees the same conversation is reused across channel restarts so the
 * Runtime keeps its state.
 */
import type { ChannelId, ChannelSession } from "./types";

type Key = string;
const sessions = new Map<Key, ChannelSession>();
const byId = new Map<string, ChannelSession>();

const keyFor = (channelId: ChannelId, userId: string) => `${channelId}:${userId}`;

export const sessionRouter = {
  upsert(session: ChannelSession): ChannelSession {
    sessions.set(keyFor(session.channelId, session.user.id), session);
    byId.set(session.id, session);
    return session;
  },
  find(channelId: ChannelId, userId: string): ChannelSession | undefined {
    return sessions.get(keyFor(channelId, userId));
  },
  getById(sessionId: string): ChannelSession | undefined {
    return byId.get(sessionId);
  },
  close(sessionId: string): void {
    const s = byId.get(sessionId);
    if (!s) return;
    s.status = "closed";
    s.closedAt = new Date().toISOString();
  },
  list(): ChannelSession[] {
    return [...byId.values()];
  },
  clear(): void {
    sessions.clear();
    byId.clear();
  },
};
