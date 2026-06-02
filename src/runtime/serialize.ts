/**
 * Builder ↔ Runtime serialization helpers.
 *
 * The Builder edits a `Flow` directly (blocks + connections + metadata).
 * These helpers normalize that state into a Runtime-ready structure and
 * back, so the Builder, Simulator and Runtime always speak the same shape.
 */
import type { Block, Connection, Flow, FlowMetadata, ID } from "@/types";

export interface SerializedFlow {
  botId: ID;
  metadata: FlowMetadata;
  blocks: Block[];
  connections: Connection[];
  variables: NonNullable<Flow["variables"]>;
}

export function serializeFlow(flow: Flow): SerializedFlow {
  return {
    botId: flow.botId,
    metadata:
      flow.metadata ?? {
        name: flow.botId,
        version: 1,
        status: "draft",
        lastEditedAt: new Date().toISOString(),
      },
    blocks: flow.blocks.map((b) => ({ ...b, config: { ...b.config } })),
    connections: flow.connections.map((c) => ({ ...c })),
    variables: flow.variables ?? [],
  };
}

/** Build a Runtime-ready Flow from a SerializedFlow (or partial). */
export function toRuntimeFlow(input: SerializedFlow | Flow): Flow {
  return {
    botId: input.botId,
    blocks: input.blocks,
    connections: input.connections,
    variables: input.variables,
    metadata: (input as Flow).metadata,
  };
}

/** Convenience uid for new blocks/connections in the Builder. */
export const newBlockId = () => `blk_${Math.random().toString(36).slice(2, 9)}`;
export const newConnectionId = () => `c_${Math.random().toString(36).slice(2, 9)}`;
