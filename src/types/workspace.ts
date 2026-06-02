import type { ID, Timestamps } from "./common";

export type WorkspacePlan = "free" | "starter" | "growth" | "scale";

export interface Workspace extends Timestamps {
  id: ID;
  name: string;
  slug: string;
  plan: WorkspacePlan;
  ownerId: ID;
}

export type UserRole = "owner" | "admin" | "editor" | "viewer";

export interface User extends Timestamps {
  id: ID;
  workspaceId: ID;
  name: string;
  email: string;
  avatarUrl?: string;
  role: UserRole;
}
