/**
 * Real, simple analytics aggregations. Replaces hardcoded KPI mocks across
 * Dashboard and Analytics during Phase 19 (First User Experience).
 *
 * Aggregations are intentionally cheap: counts pulled from the active
 * persistence layer (mock or Supabase). They are *not* the production
 * analytics surface — that lives behind /analytics charts. The point is
 * to surface real workspace numbers instead of fake totals.
 */
import { useQuery } from "@tanstack/react-query";
import { persistence } from "@/domain/persistence";

export interface BasicStats {
  bots: number;
  leads: number;
  conversations: number;
  conversions: number;
}

export const basicStatsKey = ["analytics", "basic"] as const;

export function useBasicStats() {
  return useQuery({
    queryKey: basicStatsKey,
    queryFn: async (): Promise<BasicStats> => {
      const [botsPage, leadsPage, convs] = await Promise.all([
        persistence.bots.list({ page: 1, pageSize: 1 }),
        persistence.leads.list({ page: 1, pageSize: 1 }),
        persistence.conversations.list(),
      ]);

      // Conversões = leads em estágios "vendido"/"qualificado" (best-effort).
      let conversions = 0;
      try {
        const byStage = await persistence.leads.byStage();
        for (const stage of Object.keys(byStage)) {
          if (/(vendido|ganho|qualificado|won)/i.test(stage)) {
            conversions += byStage[stage as keyof typeof byStage]?.length ?? 0;
          }
        }
      } catch {
        conversions = 0;
      }

      return {
        bots: botsPage.total ?? botsPage.items.length,
        leads: leadsPage.total ?? leadsPage.items.length,
        conversations: convs.length,
        conversions,
      };
    },
    staleTime: 30_000,
  });
}
