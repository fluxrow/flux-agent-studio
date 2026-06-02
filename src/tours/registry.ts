/**
 * Product Tour Foundation (Phase 20).
 *
 * Static registry of guided tours the platform will eventually offer.
 * No tour runtime is wired up yet — this exists so future tour engines
 * (driver.js, intro.js, or a custom Motion-based walkthrough) can read
 * a single source of truth instead of re-inventing the catalog.
 *
 * Adding a tour:
 *   1. Append a TourDefinition below.
 *   2. Tag the target DOM with `data-tour="<step.target>"`.
 *   3. Wire a runner when the tour engine ships.
 */

export type TourKey = "dashboard" | "builder" | "crm";

export interface TourStep {
  /** Stable selector token. Render targets as `data-tour="..."`. */
  target: string;
  title: string;
  body: string;
  placement?: "top" | "right" | "bottom" | "left";
}

export interface TourDefinition {
  key: TourKey;
  title: string;
  description: string;
  /** Path the tour starts on. */
  entryRoute: string;
  steps: TourStep[];
}

export const tourRegistry: Record<TourKey, TourDefinition> = {
  dashboard: {
    key: "dashboard",
    title: "Tour do Dashboard",
    description: "KPIs, alertas inteligentes e widgets de CRM & Omnichannel.",
    entryRoute: "/dashboard",
    steps: [
      { target: "dashboard-kpis",      title: "Seus números",         body: "Aqui ficam os KPIs reais do workspace." },
      { target: "dashboard-alerts",    title: "Alertas inteligentes", body: "Sinais automatizados que merecem sua atenção." },
      { target: "dashboard-crm",       title: "CRM em foco",          body: "Veja o pipeline de leads sem trocar de tela." },
    ],
  },
  builder: {
    key: "builder",
    title: "Tour do Builder",
    description: "Como montar um fluxo conversacional do zero.",
    entryRoute: "/bots",
    steps: [
      { target: "builder-palette",     title: "Paleta de blocos",     body: "Arraste blocos para o canvas." },
      { target: "builder-canvas",      title: "Canvas",                body: "Conecte saídas em entradas para encadear o fluxo." },
      { target: "builder-inspector",   title: "Inspetor",              body: "Configure cada bloco selecionado." },
      { target: "builder-save",        title: "Salvar e publicar",     body: "Rascunhos salvam automaticamente. Publique quando estiver pronto." },
    ],
  },
  crm: {
    key: "crm",
    title: "Tour do CRM",
    description: "Pipeline de leads, qualificação e timeline.",
    entryRoute: "/leads",
    steps: [
      { target: "crm-pipeline",        title: "Pipeline",              body: "Arraste leads entre os estágios." },
      { target: "crm-detail",          title: "Detalhe do lead",       body: "Veja conversas, atribuição e timeline." },
    ],
  },
};

export function listTours(): TourDefinition[] {
  return Object.values(tourRegistry);
}

export function getTour(key: TourKey): TourDefinition | undefined {
  return tourRegistry[key];
}
