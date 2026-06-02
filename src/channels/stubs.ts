/**
 * Stub channel adapters — placeholders so the registry and inspector can
 * already advertise omnichannel readiness. None of these talk to a real
 * platform yet; they only emit channel events for visibility.
 */
import { channelBus, makeChannelEventId } from "./bus";
import { sessionRouter } from "./sessionRouter";
import type { ChannelAdapter, ChannelId, ChannelMessage, ChannelOpenInput, ChannelSession } from "./types";

const now = () => new Date().toISOString();

function makeStub(id: ChannelId, label: string): ChannelAdapter {
  return {
    id,
    label,
    status: "stub",
    async identify(rawId, hint) {
      return { id: rawId, channelId: id, ...hint };
    },
    async openSession(input: ChannelOpenInput): Promise<ChannelSession> {
      const session: ChannelSession = {
        id: `${id}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
        channelId: id,
        user: input.user,
        botId: input.botId,
        workspaceId: input.workspaceId,
        status: "open",
        openedAt: now(),
        meta: { stub: true, ...(input.meta ?? {}) },
      };
      sessionRouter.upsert(session);
      channelBus.emit({
        id: makeChannelEventId(),
        type: "session_opened",
        channelId: id,
        sessionId: session.id,
        user: input.user,
        at: now(),
      });
      return session;
    },
    async closeSession(sessionId) {
      sessionRouter.close(sessionId);
      channelBus.emit({
        id: makeChannelEventId(), type: "session_closed",
        channelId: id, sessionId, at: now(),
      });
    },
    async send(sessionId, message: ChannelMessage) {
      console.info(`[${id}/stub] would send`, message);
      channelBus.emit({
        id: makeChannelEventId(), type: "message_sent",
        channelId: id, sessionId, message, at: now(),
        payload: { stub: true },
      });
    },
    async receive(sessionId, message: ChannelMessage) {
      channelBus.emit({
        id: makeChannelEventId(), type: "message_received",
        channelId: id, sessionId, message, at: now(),
        payload: { stub: true },
      });
    },
  };
}

export const whatsappChannel  = makeStub("whatsapp",  "WhatsApp");
export const instagramChannel = makeStub("instagram", "Instagram DM");
export const messengerChannel = makeStub("messenger", "Messenger");
export const telegramChannel  = makeStub("telegram",  "Telegram");
