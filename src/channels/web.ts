/**
 * WebChannel — the only fully-functional adapter so far.
 *
 * It wraps the existing publicRuntime helpers so the Public Bot page
 * benefits from the new ChannelAdapter pipeline (events, router, registry)
 * without altering its visible behaviour.
 */
import { recordPublicMessage } from "@/lib/public-runtime";
import { channelBus, makeChannelEventId } from "./bus";
import { sessionRouter } from "./sessionRouter";
import type {
  ChannelAdapter,
  ChannelMessage,
  ChannelOpenInput,
  ChannelSession,
  ChannelUser,
} from "./types";

const now = () => new Date().toISOString();

export const webChannel: ChannelAdapter = {
  id: "web",
  label: "Web",
  status: "active",

  async identify(rawId, hint) {
    return {
      id: rawId,
      channelId: "web",
      name: hint?.name,
      email: hint?.email,
      phone: hint?.phone,
      metadata: hint?.metadata,
    };
  },

  async openSession(input: ChannelOpenInput): Promise<ChannelSession> {
    const existing = sessionRouter.find("web", input.user.id);
    if (existing && existing.status === "open") return existing;

    const session: ChannelSession = {
      id: `web_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
      channelId: "web",
      user: input.user,
      botId: input.botId,
      workspaceId: input.workspaceId,
      status: "open",
      openedAt: now(),
      meta: input.meta,
    };
    sessionRouter.upsert(session);
    channelBus.emit({
      id: makeChannelEventId(),
      type: "session_opened",
      channelId: "web",
      sessionId: session.id,
      user: input.user,
      at: now(),
    });
    return session;
  },

  async closeSession(sessionId) {
    sessionRouter.close(sessionId);
    channelBus.emit({
      id: makeChannelEventId(),
      type: "session_closed",
      channelId: "web",
      sessionId,
      at: now(),
    });
  },

  async send(sessionId, message: ChannelMessage) {
    const session = sessionRouter.getById(sessionId);
    // Persist to backend through the existing public-runtime path.
    // Other message kinds are still emitted in the bus so the inspector sees them.
    if (message.text || message.kind === "text") {
      const runtimeSid = (session?.meta as any)?.runtimeSessionId ?? sessionId;
      try {
        await recordPublicMessage(runtimeSid, "bot", message.text ?? "");
      } catch (e) {
        console.warn("[webChannel] persist message failed", e);
      }
    }
    channelBus.emit({
      id: makeChannelEventId(),
      type: "message_sent",
      channelId: "web",
      sessionId,
      message,
      at: now(),
    });
  },

  async receive(sessionId, message: ChannelMessage) {
    const session = sessionRouter.getById(sessionId);
    if (message.text) {
      const runtimeSid = (session?.meta as any)?.runtimeSessionId ?? sessionId;
      try { await recordPublicMessage(runtimeSid, "user", message.text); } catch { /* noop */ }
    }
    channelBus.emit({
      id: makeChannelEventId(),
      type: "message_received",
      channelId: "web",
      sessionId,
      message,
      at: now(),
    });
  },
};

/** Convenience wrapper so callers don't need to fabricate ChannelMessage objects. */
export const webChannelHelpers = {
  async sendText(sessionId: string, text: string, blockId?: string) {
    await webChannel.send(sessionId, {
      id: `m_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
      kind: "text",
      text,
      meta: { blockId },
    });
  },
  async receiveText(sessionId: string, text: string) {
    await webChannel.receive?.(sessionId, {
      id: `m_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
      kind: "text",
      text,
    });
  },
  async openWebSession(opts: {
    visitorId: string;
    runtimeSessionId: string;
    botId?: string;
    workspaceId?: string;
  }): Promise<ChannelSession> {
    const user: ChannelUser = { id: opts.visitorId, channelId: "web" };
    return webChannel.openSession({
      user,
      botId: opts.botId,
      workspaceId: opts.workspaceId,
      meta: { runtimeSessionId: opts.runtimeSessionId },
    });
  },
};
