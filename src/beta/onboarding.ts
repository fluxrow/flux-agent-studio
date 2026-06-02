/**
 * Phase 18.5 — Onboarding
 */
import type { OnboardingProgress, OnboardingStep, OnboardingStepKey } from "./types";

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    key: "create_bot",
    title: "Crie seu primeiro bot",
    description: "Comece com um template ou em branco no construtor visual.",
    ctaLabel: "Criar bot",
    ctaHref: "/bots/new",
  },
  {
    key: "publish_bot",
    title: "Publique o bot",
    description: "Gere um link público para começar a receber conversas.",
    ctaLabel: "Abrir bots",
    ctaHref: "/bots",
  },
  {
    key: "test_public_link",
    title: "Teste o link público",
    description: "Abra o link em uma aba anônima e simule um visitante real.",
    ctaLabel: "Ver bots",
    ctaHref: "/bots",
  },
  {
    key: "first_lead",
    title: "Gere o primeiro lead",
    description: "Capture nome, e-mail ou telefone através do fluxo publicado.",
    ctaLabel: "Ir para Leads",
    ctaHref: "/leads",
  },
  {
    key: "view_crm",
    title: "Visualize o CRM",
    description: "Acompanhe o pipeline kanban e os estágios dos seus leads.",
    ctaLabel: "Abrir CRM",
    ctaHref: "/leads",
  },
  {
    key: "view_intelligence",
    title: "Explore a Lead Intelligence",
    description: "Score, summary, insights e recomendação para cada lead.",
    ctaLabel: "Ver Intelligence",
    ctaHref: "/leads",
  },
];

const store = new Map<string, OnboardingProgress>();

export function getOnboardingProgress(workspaceId: string): OnboardingProgress {
  return (
    store.get(workspaceId) ?? {
      workspaceId,
      completed: [],
      updatedAt: new Date().toISOString(),
    }
  );
}

export function completeOnboardingStep(
  workspaceId: string,
  key: OnboardingStepKey,
): OnboardingProgress {
  const current = getOnboardingProgress(workspaceId);
  if (current.completed.includes(key)) return current;
  const next: OnboardingProgress = {
    ...current,
    completed: [...current.completed, key],
    updatedAt: new Date().toISOString(),
  };
  store.set(workspaceId, next);
  return next;
}

export function resetOnboarding(workspaceId: string): OnboardingProgress {
  const reset: OnboardingProgress = {
    workspaceId,
    completed: [],
    updatedAt: new Date().toISOString(),
  };
  store.set(workspaceId, reset);
  return reset;
}

export function onboardingPercent(workspaceId: string): number {
  const { completed } = getOnboardingProgress(workspaceId);
  return Math.round((completed.length / ONBOARDING_STEPS.length) * 100);
}
