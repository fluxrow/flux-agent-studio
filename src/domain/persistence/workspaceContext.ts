/**
 * Tiny ambient context for the *current* workspace id.
 *
 * Supabase repository adapters need the current workspace id but cannot
 * use React hooks (they're pure TS, consumed by React Query). The
 * WorkspaceProvider writes here on every change; adapters read.
 */
let currentWorkspaceId: string | null = null;

export function setCurrentWorkspaceId(id: string | null) {
  currentWorkspaceId = id;
}

export function getCurrentWorkspaceId(): string {
  if (!currentWorkspaceId) {
    throw new Error("No active workspace. User must be authenticated.");
  }
  return currentWorkspaceId;
}

export function tryGetCurrentWorkspaceId(): string | null {
  return currentWorkspaceId;
}
