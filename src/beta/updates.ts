/**
 * Phase 21 — Central de Novidades
 *
 * Curated list of release notes shown on /updates. Manually maintained
 * alongside CHANGELOG.md so we control the user-facing copy.
 */
export type UpdateKind = "feature" | "improvement" | "fix" | "release";

export interface UpdateEntry {
  id: string;
  date: string;
  version: string;
  title: string;
  kind: UpdateKind;
  summary: string;
  bullets?: string[];
}

export const UPDATES: UpdateEntry[] = [
  {
    id: "p21",
    date: "2026-06-02",
    version: "Phase 21",
    title: "Beta Experience",
    kind: "release",
    summary: "Onboarding guiado, score do workspace, demo, novidades e feedback contextual.",
    bullets: [
      "Checklist de primeiros passos no Dashboard",
      "Workspace Health Score com recomendações",
      "Modo Demonstração para explorar o produto",
      "Central de Novidades em /updates",
      "Feedback contextual (👍 / 👎) nas telas-chave",
      "Banner Beta com canais de feedback e bugs",
      "Métricas de ativação dos primeiros usuários",
    ],
  },
  {
    id: "p20",
    date: "2026-06-01",
    version: "Phase 20",
    title: "UX, Tooltips e Documentação",
    kind: "improvement",
    summary: "Zero state em todo o app, tooltips explicativos e Central de Documentação.",
    bullets: [
      "Remoção de KPIs hardcoded restantes",
      "Componente InfoTooltip reutilizável",
      "Página /docs com 8 áreas do produto",
      "Fundação para Product Tour",
    ],
  },
  {
    id: "p19",
    date: "2026-05-30",
    version: "Phase 19",
    title: "First User Experience",
    kind: "feature",
    summary: "Criação real de bots, agregações reais e persistência de tracking.",
    bullets: [
      "BotNew agora persiste e redireciona para o builder do novo bot",
      "Dashboard e Analytics agregam números reais do workspace",
      "Tracking persistindo eventos, mensagens e sessões",
    ],
  },
  {
    id: "p18-7",
    date: "2026-05-28",
    version: "Phase 18.7",
    title: "Critical Truth Sprint",
    kind: "fix",
    summary: "Repositórios reais, secret vault e correções no Meta CAPI.",
  },
  {
    id: "p18-6",
    date: "2026-05-27",
    version: "Phase 18.6",
    title: "Stabilization Sprint",
    kind: "fix",
    summary: "Segurança, persistência e estabilidade do Builder antes do beta.",
  },
];
