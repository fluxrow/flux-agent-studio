/**
 * Phase 18.5 — Beta Users
 */
import type { BetaUser, BetaUserStatus } from "./types";

const store = new Map<string, BetaUser>();

const uid = () => `beta_${Math.random().toString(36).slice(2, 10)}`;

export function listBetaUsers(workspaceId: string): BetaUser[] {
  return [...store.values()]
    .filter((u) => u.workspaceId === workspaceId)
    .sort((a, b) => b.joinedAt.localeCompare(a.joinedAt));
}

export function inviteBetaUser(workspaceId: string, email: string, note?: string): BetaUser {
  const user: BetaUser = {
    id: uid(),
    workspaceId,
    email: email.trim().toLowerCase(),
    joinedAt: new Date().toISOString(),
    status: "invited",
    note,
  };
  store.set(user.id, user);
  return user;
}

export function setBetaUserStatus(id: string, status: BetaUserStatus): BetaUser | null {
  const user = store.get(id);
  if (!user) return null;
  const next: BetaUser = { ...user, status };
  store.set(id, next);
  return next;
}

export function removeBetaUser(id: string): void {
  store.delete(id);
}
