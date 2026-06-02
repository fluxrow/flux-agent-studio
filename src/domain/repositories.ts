/**
 * Repository contracts for the FluxBot domain.
 *
 * Every page MUST consume data through these interfaces, never importing
 * mock fixtures directly. When we wire Supabase, only the implementations
 * inside `src/domain/mock/*` will be swapped for `src/domain/supabase/*`;
 * page code stays unchanged.
 *
 * All methods return Promises so the contract matches a real backend.
 */

import type {
  Bot, BotCreateInput,
  Flow, Block, Connection,
  Lead, LeadCreateInput, PipelineStage, LeadStage, CrmStats,
  Conversation, Session, Message,
  Template,
  Channel,
  Variable,
  ID, ListParams, Paginated,
  ExecutionEvent,
} from "@/types";

export interface BotRepository {
  list(params?: ListParams): Promise<Paginated<Bot>>;
  get(id: ID): Promise<Bot | null>;
  create(input: BotCreateInput): Promise<Bot>;
  update(id: ID, patch: Partial<Bot>): Promise<Bot>;
  remove(id: ID): Promise<void>;
  publish(id: ID, snapshot: Flow, slug?: string, note?: string): Promise<Bot>;
  getBySlug?(slug: string): Promise<Bot | null>;
}

export interface FlowRepository {
  getByBot(botId: ID): Promise<Flow | null>;
  saveBlocks(botId: ID, blocks: Block[]): Promise<void>;
  saveConnections(botId: ID, connections: Connection[]): Promise<void>;
}

export interface LeadRepository {
  list(params?: ListParams & { stage?: LeadStage }): Promise<Paginated<Lead>>;
  get(id: ID): Promise<Lead | null>;
  byStage(): Promise<Record<LeadStage, Lead[]>>;
  stages(): Promise<PipelineStage[]>;
  updateStage(id: ID, stage: LeadStage): Promise<Lead>;
  create(input: LeadCreateInput): Promise<Lead>;
  update(id: ID, patch: Partial<Lead>): Promise<Lead>;
  remove(id: ID): Promise<void>;
  addTag(id: ID, tag: string): Promise<Lead>;
  removeTag(id: ID, tag: string): Promise<Lead>;
  timeline(leadId: ID): Promise<ExecutionEvent[]>;
  conversations(leadId: ID): Promise<Conversation[]>;
  crmStats(): Promise<CrmStats>;
}

export interface ConversationRepository {
  list(params?: ListParams): Promise<Paginated<Conversation>>;
  get(id: ID): Promise<Conversation | null>;
  messagesBySession(sessionId: ID): Promise<Message[]>;
  sessionById(id: ID): Promise<Session | null>;
}

export interface TemplateRepository {
  list(): Promise<Template[]>;
  get(id: ID): Promise<Template | null>;
}

export interface ChannelRepository {
  list(): Promise<Channel[]>;
  connect(id: ID, account: string): Promise<Channel>;
  disconnect(id: ID): Promise<Channel>;
}

export interface VariableRepository {
  listByBot(botId: ID): Promise<Variable[]>;
  listWorkspace(): Promise<Variable[]>;
}

export interface Repositories {
  bots: BotRepository;
  flows: FlowRepository;
  leads: LeadRepository;
  conversations: ConversationRepository;
  templates: TemplateRepository;
  channels: ChannelRepository;
  variables: VariableRepository;
}
