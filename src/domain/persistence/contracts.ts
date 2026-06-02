/**
 * Persistence contracts — the COMPLETE data-access surface for FluxBot.
 *
 * Phase 4 unifies every repository (existing + new) behind a single
 * `persistence` facade. When Lovable Cloud is enabled, we swap the
 * mock adapters here for Supabase-backed ones; no page changes needed.
 *
 * The existing repository contracts (Bot/Flow/Lead/Conversation/Channel)
 * live in `src/domain/repositories.ts` and are re-exported here. This file
 * adds the brand-new contracts introduced by Phase 4:
 *
 *   - WorkspaceRepository
 *   - UserRepository
 *   - VersionRepository    (flow versioning)
 *   - SessionRepository    (runtime sessions + execution history)
 *   - EventRepository      (durable execution events sink)
 */
import type {
  Workspace, User,
  Session, Flow, ID, ISODate,
  ExecutionEvent, ExecutionEventType, ExecutionHistory,
} from "@/types";
import type {
  Repositories as CoreRepositories,
  BotRepository, FlowRepository, LeadRepository,
  ConversationRepository, ChannelRepository, VariableRepository,
  TemplateRepository,
} from "../repositories";

export type {
  BotRepository,
  FlowRepository,
  LeadRepository,
  ConversationRepository,
  ChannelRepository,
  VariableRepository,
  TemplateRepository,
};

/* ---------------- New Phase 4 contracts ---------------- */

export interface WorkspaceRepository {
  current(): Promise<Workspace>;
  get(id: ID): Promise<Workspace | null>;
  update(id: ID, patch: Partial<Workspace>): Promise<Workspace>;
}

export interface UserRepository {
  me(): Promise<User>;
  listByWorkspace(workspaceId: ID): Promise<User[]>;
  get(id: ID): Promise<User | null>;
}

export interface FlowVersion {
  id: ID;
  botId: ID;
  version: number;
  status: "draft" | "published" | "archived";
  snapshot: Flow;
  createdAt: ISODate;
  createdBy?: ID;
  note?: string;
}

export interface VersionRepository {
  listByBot(botId: ID): Promise<FlowVersion[]>;
  get(id: ID): Promise<FlowVersion | null>;
  publish(botId: ID, snapshot: Flow, note?: string): Promise<FlowVersion>;
  rollback(botId: ID, versionId: ID): Promise<FlowVersion>;
}

export interface SessionRepository {
  create(session: Omit<Session, "createdAt" | "updatedAt">): Promise<Session>;
  get(id: ID): Promise<Session | null>;
  listByBot(botId: ID): Promise<Session[]>;
  update(id: ID, patch: Partial<Session>): Promise<Session>;
  appendHistory(sessionId: ID, event: ExecutionEvent): Promise<void>;
  history(sessionId: ID): Promise<ExecutionHistory | null>;
}

export interface EventQuery {
  sessionId?: ID;
  flowId?: ID;
  botId?: ID;
  type?: ExecutionEventType;
  limit?: number;
}

export interface EventRepository {
  record(event: ExecutionEvent): Promise<void>;
  query(params?: EventQuery): Promise<ExecutionEvent[]>;
  clear(): Promise<void>;
}

/* ---------------- Aggregate persistence surface ---------------- */

export interface Persistence extends CoreRepositories {
  workspaces: WorkspaceRepository;
  users: UserRepository;
  versions: VersionRepository;
  sessions: SessionRepository;
  events: EventRepository;
}
