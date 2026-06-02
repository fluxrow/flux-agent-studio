/**
 * Phase 18.5 — User Feedback
 */
import type { FeedbackItem, FeedbackKind } from "./types";

const items: FeedbackItem[] = [];
const uid = () => `fb_${Math.random().toString(36).slice(2, 10)}`;

export interface SubmitFeedbackInput {
  workspaceId: string;
  kind: FeedbackKind;
  message: string;
  page?: string;
  email?: string;
}

export function submitFeedback(input: SubmitFeedbackInput): FeedbackItem {
  const fb: FeedbackItem = {
    id: uid(),
    workspaceId: input.workspaceId,
    kind: input.kind,
    message: input.message,
    page: input.page,
    email: input.email,
    createdAt: new Date().toISOString(),
  };
  items.unshift(fb);
  return fb;
}

export function listFeedback(workspaceId?: string): FeedbackItem[] {
  if (!workspaceId) return [...items];
  return items.filter((i) => i.workspaceId === workspaceId);
}
