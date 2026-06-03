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
  description: string;
}

export const blockRegistry: Record<BlockType, BlockMeta> = {
  start:     { type: "start",     label: "Início",    icon: Play,          tone: "primary",     description: "Ponto de partida do fluxo." },
  message:   { type: "message",   label: "Mensagem",  icon: MessageSquare, tone: "primary",     description: "Envia uma mensagem ao usuário." },
  input:     { type: "input",     label: "Pergunta",  icon: Type,          tone: "warning",     description: "Coleta uma resposta do usuário." },
  choice:    { type: "choice",    label: "Escolha",   icon: List,          tone: "success",     description: "Apresenta opções e salva a escolha." },
  condition: { type: "condition", label: "Condição",  icon: GitFork,       tone: "destructive", description: "Cria caminhos diferentes conforme regras." },
  ai:        { type: "ai",        label: "Bloco IA",  icon: Sparkles,      tone: "primary",     description: "Gera respostas usando inteligência artificial." },
  webhook:   { type: "webhook",   label: "Webhook",   icon: Webhook,       tone: "primary",     description: "Conecta sistemas externos via HTTP." },
  delay:     { type: "delay",     label: "Delay",     icon: Timer,         tone: "accent",      description: "Aguarda um tempo antes de continuar." },
  end:       { type: "end",       label: "Fim",       icon: Flag,          tone: "destructive", description: "Encerra o fluxo da conversa." },
};

export const toneClass: Record<Tone, string> = {
  primary: "border-primary/50 bg-primary/10 text-primary-glow",
  accent: "border-accent/50 bg-accent/10 text-accent",
  warning: "border-warning/50 bg-warning/10 text-warning",
  success: "border-success/50 bg-success/10 text-success",
  destructive: "border-destructive/50 bg-destructive/10 text-destructive",
};
