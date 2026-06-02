import type { ExecutionEvent, ExecutionEventType } from "@/types/event";

export type { ExecutionEvent, ExecutionEventType };

export type ExecutionEventListener = (event: ExecutionEvent) => void;
export type ExecutionUnsubscribe = () => void;
