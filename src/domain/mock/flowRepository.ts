import type { Block, Connection, Flow, ID } from "@/types";
import type { FlowRepository } from "../repositories";
import { mockFlows } from "@/mocks";

const store: Record<string, Flow> = { ...mockFlows };

export const mockFlowRepository: FlowRepository = {
  async getByBot(botId: ID) {
    return store[botId] ?? null;
  },
  async saveBlocks(botId: ID, blocks: Block[]) {
    const flow = store[botId] ?? { botId, blocks: [], connections: [] };
    store[botId] = { ...flow, blocks };
  },
  async saveConnections(botId: ID, connections: Connection[]) {
    const flow = store[botId] ?? { botId, blocks: [], connections: [] };
    store[botId] = { ...flow, connections };
  },
};
