/**
 * Registry mapping runtime BlockType to visual metadata: icon, palette tone,
 * and label. Used by the canvas and palette so both stay in sync.
 */
import {
  Play,
  MessageSquare,
  Type,
  List,
  GitFork,
  Sparkles,
  Webhook,
  Timer,
  Flag,
} from "lucide-react";
import type { BlockType } from "@/types";

export type Tone = "primary" | "accent" | "warning" | "success" | "destructive";

export interface BlockMeta {
  type: BlockType;
  label: string;
  icon: typeof Play;
  tone: Tone;
}

export const blockRegistry: Record<BlockType, BlockMeta> = {
  start:     { type: "start",     label: "Início",    icon: Play,          tone: "primary" },
  message:   { type: "message",   label: "Mensagem",  icon: MessageSquare, tone: "primary" },
  input:     { type: "input",     label: "Input",     icon: Type,          tone: "warning" },
  choice:    { type: "choice",    label: "Escolha",   icon: List,          tone: "success" },
  condition: { type: "condition", label: "Condição",  icon: GitFork,       tone: "destructive" },
  ai:        { type: "ai",        label: "Bloco IA",  icon: Sparkles,      tone: "primary" },
  webhook:   { type: "webhook",   label: "Webhook",   icon: Webhook,       tone: "primary" },
  delay:     { type: "delay",     label: "Delay",     icon: Timer,         tone: "accent" },
  end:       { type: "end",       label: "Fim",       icon: Flag,          tone: "destructive" },
};

export const toneClass: Record<Tone, string> = {
  primary: "border-primary/50 bg-primary/10 text-primary-glow",
  accent: "border-accent/50 bg-accent/10 text-accent",
  warning: "border-warning/50 bg-warning/10 text-warning",
  success: "border-success/50 bg-success/10 text-success",
  destructive: "border-destructive/50 bg-destructive/10 text-destructive",
};
