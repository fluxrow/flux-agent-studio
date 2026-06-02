/**
 * Channel Engine — public entry point.
 * Importing this module registers every known adapter exactly once and
 * emits a `channel_connected` event for each so the inspector reflects state.
 */
import { channelBus, makeChannelEventId } from "./bus";
import { channelRegistry } from "./registry";
import { sessionRouter } from "./sessionRouter";
import { webChannel, webChannelHelpers } from "./web";
import {
  whatsappChannel,
  instagramChannel,
  messengerChannel,
  telegramChannel,
} from "./stubs";

let booted = false;

export function bootChannels(): void {
  if (booted) return;
  booted = true;

  [webChannel, whatsappChannel, instagramChannel, messengerChannel, telegramChannel].forEach((c) => {
    channelRegistry.register(c);
    channelBus.emit({
      id: makeChannelEventId(),
      type: "channel_connected",
      channelId: c.id,
      at: new Date().toISOString(),
      payload: { status: c.status, label: c.label },
    });
  });
}

export {
  channelBus,
  channelRegistry,
  sessionRouter,
  webChannel,
  webChannelHelpers,
  whatsappChannel,
  instagramChannel,
  messengerChannel,
  telegramChannel,
};
export type * from "./types";
