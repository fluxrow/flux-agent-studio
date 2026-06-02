import type { ID, Timestamps } from "./common";

export type LeadStage = "novo" | "qualificado" | "negociacao" | "convertido" | "perdido";
export type LeadTemperature = "frio" | "morno" | "quente";

export interface Lead extends Timestamps {
  id: ID;
  workspaceId: ID;
  name: string;
  email?: string;
  phone?: string;
  source: string;
  stage: LeadStage;
  score: number; // 0..100
  temperature: LeadTemperature;
  botId?: ID;
  botName?: string;
  tags?: string[];
}

export interface PipelineStage {
  id: LeadStage;
  label: string;
  color: string;
}
