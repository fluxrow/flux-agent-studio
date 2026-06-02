import type { Channel, ID } from "@/types";
import type { ChannelRepository } from "../repositories";
import { mockChannels } from "@/mocks";
import { nowIso } from "@/mocks/_shared";
import { delay } from "./_helpers";

const store: Channel[] = [...mockChannels];

export const mockChannelRepository: ChannelRepository = {
  async list() {
    return delay(store);
  },
  async connect(id: ID, account: string) {
    const idx = store.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error(`Channel ${id} not found`);
    store[idx] = { ...store[idx], status: "connected", account, updatedAt: nowIso() };
    return delay(store[idx]);
  },
  async disconnect(id: ID) {
    const idx = store.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error(`Channel ${id} not found`);
    store[idx] = { ...store[idx], status: "disconnected", account: undefined, updatedAt: nowIso() };
    return delay(store[idx]);
  },
};
