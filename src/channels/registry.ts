/**
 * ChannelRegistry — central index of all available channel adapters.
 * Adapters self-register on import; lookup is by ChannelId.
 */
import type { ChannelAdapter, ChannelId } from "./types";

const adapters = new Map<ChannelId, ChannelAdapter>();

export const channelRegistry = {
  register(adapter: ChannelAdapter): void {
    adapters.set(adapter.id, adapter);
  },
  get(id: ChannelId): ChannelAdapter | undefined {
    return adapters.get(id);
  },
  has(id: ChannelId): boolean {
    return adapters.has(id);
  },
  list(): ChannelAdapter[] {
    return [...adapters.values()];
  },
};
