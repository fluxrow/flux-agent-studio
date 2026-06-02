import type { ID, Timestamps } from "./common";

export type LeadStage = "novo" | "qualificado" | "negociacao" | "convertido" | "perdido";
export type LeadTemperature = "frio" | "morno" | "quente";

export interface Lead extends Timestamps {
  id: ID;
  workspaceId: ID;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  source: string;
  stage: LeadStage;
  score: number; // 0..100
  temperature: LeadTemperature;
  botId?: ID;
  botName?: string;
  ownerId?: ID;
  tags?: string[];
  notes?: string;
  lastActivityAt?: string;
}

export interface PipelineStage {
  id: LeadStage;
  label: string;
  color: string;
}

export interface LeadCreateInput {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  source?: string;
  stage?: LeadStage;
  score?: number;
  temperature?: LeadTemperature;
  botId?: ID;
  ownerId?: ID;
  tags?: string[];
  notes?: string;
}

export interface CrmStats {
  total: number;
  byStage: Record<LeadStage, number>;
  conversionRate: number; // converted / (converted + lost + negociacao + qualificado)
  wonCount: number;
  lostCount: number;
  recent: Lead[];
}
