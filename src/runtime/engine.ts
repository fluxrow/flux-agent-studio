/**
 * FluxBot Runtime Engine.
 *
 * Pure TypeScript. No React, no DOM, no network. Executes a `Flow` step by
 * step using only mock/in-memory data and emits events the UI can subscribe
 * to. Designed so the same engine can later run on a server (Node, Edge,
 * Supabase Functions) without changes.
 */
import type { Block, Connection, Flow, ID } from "@/types";
import {
  EngineEvent,
  EngineListener,
  EngineOptions,
  EngineState,
  RuntimeContext,
  TranscriptItem,
  Unsubscribe,
  Variables,
} from "./types";
import { interpolate } from "./interpolate";
import { evaluateCondition } from "./conditions";
import { runtimeEventBus, makeEvent } from "./events";
import type { ExecutionEventType } from "./events";

const uid = () => `s_${Math.random().toString(36).slice(2, 10)}`;
const now = () => new Date().toISOString();

export class RuntimeEngine {
  private flow: Flow;
  private context: RuntimeContext;
  private transcript: TranscriptItem[] = [];
  private awaiting: Block | null = null;
  private listeners = new Set<EngineListener>();

  constructor(flow: Flow, opts: EngineOptions = {}) {
    this.flow = flow;
    this.context = {
      sessionId: opts.sessionId ?? uid(),
      flowId: flow.botId,
      currentBlockId: null,
      variables: { ...(opts.initialVariables ?? {}) },
      visitedBlocks: [],
      startedAt: now(),
      status: "idle",
    };
  }

  /* ---------------- Public API ---------------- */

  getState(): EngineState {
    return {
      context: { ...this.context, variables: { ...this.context.variables }, visitedBlocks: [...this.context.visitedBlocks] },
      transcript: [...this.transcript],
      awaiting: this.awaiting,
    };
  }

  on(listener: EngineListener): Unsubscribe {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /** Start (or restart) the flow from its `start` block. */
  start(): void {
    const startBlock = this.findStart();
    if (!startBlock) {
      this.fail("Flow não possui um bloco 'start'.");
      return;
    }
    this.context.status = "running";
    this.context.startedAt = now();
    this.context.visitedBlocks = [];
    this.transcript = [];
    this.awaiting = null;
    this.emitExecution("flow_started", { startBlockId: startBlock.id });
    this.emitExecution("conversation_started", {});
    this.process(startBlock.id);
  }

  /** Submit user input for an awaiting `input` block. */
  submitInput(value: string): void {
    if (this.context.status !== "awaiting_input" || !this.awaiting) {
      this.fail("Engine não está aguardando input.");
      return;
    }
    const block = this.awaiting;
    const variable = String(block.config.variable ?? "");
    if (variable) this.context.variables[variable] = value;
    this.transcript.push({ kind: "user", text: value, at: now() });
    this.awaiting = null;
    this.advanceFrom(block.id);
  }

  /** Submit a choice selection for an awaiting `choice` block. */
  submitChoice(option: string): void {
    if (this.context.status !== "awaiting_choice" || !this.awaiting) {
      this.fail("Engine não está aguardando escolha.");
      return;
    }
    const block = this.awaiting;
    const variable = String(block.config.variable ?? "");
    if (variable) this.context.variables[variable] = option;
    this.transcript.push({ kind: "user", text: option, at: now() });
    this.awaiting = null;
    // Follow a connection whose `condition` label matches the option, if any.
    const labeled = this.outgoing(block.id).find(
      (c) => c.condition && c.condition.toLowerCase() === option.toLowerCase(),
    );
    if (labeled) this.process(labeled.toBlockId);
    else this.advanceFrom(block.id);
  }

  /** Force end the session. */
  end(systemNote = "Sessão encerrada"): void {
    this.context.status = "ended";
    this.context.endedAt = now();
    this.transcript.push({ kind: "system", text: systemNote, at: now() });
    this.emit({ type: "ended", context: this.context });
    this.emitState();
  }

  /* ---------------- Internals ---------------- */

  private process(blockId: ID): void {
    const block = this.blockById(blockId);
    if (!block) return this.fail(`Bloco ${blockId} não encontrado.`);

    this.context.currentBlockId = block.id;
    if (!this.context.visitedBlocks.includes(block.id)) {
      this.context.visitedBlocks.push(block.id);
    }

    switch (block.type) {
      case "start":
        this.advanceFrom(block.id);
        return;

      case "message": {
        const text = interpolate(String(block.config.text ?? ""), this.context.variables);
        this.transcript.push({ kind: "bot", blockId: block.id, text, at: now() });
        this.emit({ type: "message", blockId: block.id, text });
        this.advanceFrom(block.id);
        return;
      }

      case "input": {
        const prompt = interpolate(String(block.config.text ?? ""), this.context.variables);
        if (prompt) {
          this.transcript.push({ kind: "bot", blockId: block.id, text: prompt, at: now() });
          this.emit({ type: "message", blockId: block.id, text: prompt });
        }
        this.context.status = "awaiting_input";
        this.awaiting = block;
        this.emit({ type: "await_input", block, prompt });
        this.emitState();
        return;
      }

      case "choice": {
        const prompt = interpolate(String(block.config.text ?? ""), this.context.variables);
        const options = (block.config.options as string[] | undefined) ?? [];
        if (prompt) {
          this.transcript.push({ kind: "bot", blockId: block.id, text: prompt, at: now() });
          this.emit({ type: "message", blockId: block.id, text: prompt });
        }
        this.context.status = "awaiting_choice";
        this.awaiting = block;
        this.emit({ type: "await_choice", block, prompt, options });
        this.emitState();
        return;
      }

      case "condition": {
        const cfg = {
          variable: String(block.config.variable ?? ""),
          operator: (block.config.operator as "equals" | "contains" | "greater_than" | "less_than") ?? "equals",
          value: (block.config.value as string | number) ?? "",
        };
        const result = evaluateCondition(cfg, this.context.variables);
        const label = result ? "true" : "false";
        const next = this.outgoing(block.id).find(
          (c) => (c.condition ?? "").toLowerCase() === label,
        );
        if (next) this.process(next.toBlockId);
        else this.advanceFrom(block.id);
        return;
      }

      case "end": {
        const text = interpolate(String(block.config.text ?? ""), this.context.variables);
        if (text) {
          this.transcript.push({ kind: "bot", blockId: block.id, text, at: now() });
          this.emit({ type: "message", blockId: block.id, text });
        }
        this.context.status = "ended";
        this.context.endedAt = now();
        this.emit({ type: "ended", context: this.context });
        this.emitState();
        return;
      }

      // Unsupported types (ai, webhook, delay) auto-advance for now.
      default:
        this.advanceFrom(block.id);
    }
  }

  private advanceFrom(blockId: ID): void {
    const next = this.outgoing(blockId).find((c) => !c.condition) ?? this.outgoing(blockId)[0];
    if (next) this.process(next.toBlockId);
    else this.end("Fluxo finalizado sem bloco de saída.");
  }

  private findStart(): Block | undefined {
    return this.flow.blocks.find((b) => b.type === "start");
  }

  private blockById(id: ID): Block | undefined {
    return this.flow.blocks.find((b) => b.id === id);
  }

  private outgoing(blockId: ID): Connection[] {
    return this.flow.connections.filter((c) => c.fromBlockId === blockId);
  }

  private fail(message: string): void {
    this.context.status = "error";
    this.context.error = message;
    this.emit({ type: "error", message });
    this.emitState();
  }

  private emit(event: EngineEvent): void {
    this.listeners.forEach((l) => l(event));
  }

  private emitState(): void {
    this.emit({ type: "state", state: this.getState() });
  }
}

/** Convenience factory. */
export function createEngine(flow: Flow, opts: EngineOptions = {}): RuntimeEngine {
  return new RuntimeEngine(flow, opts);
}

export type { Variables };
