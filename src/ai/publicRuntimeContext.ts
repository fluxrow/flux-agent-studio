export interface PublicAiRuntimeContext {
  sessionId: string;
  token: string;
}

let activeContext: PublicAiRuntimeContext | null = null;

export function setPublicAiRuntimeContext(context: PublicAiRuntimeContext): void {
  activeContext = context;
}

export function getPublicAiRuntimeContext(): PublicAiRuntimeContext | null {
  return activeContext;
}

export function clearPublicAiRuntimeContext(sessionId: string): void {
  if (activeContext?.sessionId === sessionId) {
    activeContext = null;
  }
}
