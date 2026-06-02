/**
 * Runtime → CRM bridge.
 *
 * Listens to the runtime event bus and turns flow executions into real
 * CRM leads. Variables prefixed with `lead.` (e.g. `lead.name`,
 * `lead.email`, `lead.phone`, `lead.company`, `lead.tags`) are accumulated
 * per-session and persisted as a lead when the conversation completes.
 *
 * Designed to be tolerant: if the persistence layer is unavailable or no
 * lead-flavored variables are present, the bridge silently does nothing.
 */
import { runtimeEventBus } from "@/runtime/events";
import { persistence } from "@/domain/persistence";
import { tryGetCurrentWorkspaceId } from "@/domain/persistence/workspaceContext";
import { recordActivation } from "@/beta/activation";
import type { LeadCreateInput } from "@/types";

interface Draft {
  data: Partial<LeadCreateInput>;
  botId?: string;
  started: string;
}

const drafts = new Map<string, Draft>();

const LEAD_KEYS: Record<string, keyof LeadCreateInput> = {
  "lead.name": "name",
  "lead.email": "email",
  "lead.phone": "phone",
  "lead.company": "company",
  "lead.source": "source",
};

let started = false;

export function startCrmBridge() {
  if (started) return;
  started = true;

  runtimeEventBus.on(async (event) => {
    const sid = event.sessionId;
    if (!sid) return;

    switch (event.type) {
      case "flow_started":
      case "conversation_started": {
        if (!drafts.has(sid)) {
          drafts.set(sid, {
            data: { source: "runtime" },
            botId: event.botId,
            started: event.at,
          });
        }
        const wsForConv = tryGetCurrentWorkspaceId();
        if (wsForConv) recordActivation(wsForConv, "first_conversation");
        return;
      }

      case "variable_updated": {
        const draft = drafts.get(sid);
        if (!draft) return;
        const { variable, value } = (event.payload ?? {}) as {
          variable?: string;
          value?: unknown;
        };
        if (!variable) return;
        const mappedKey = LEAD_KEYS[variable];
        if (mappedKey) {
          (draft.data as Record<string, unknown>)[mappedKey] = String(value ?? "");
        } else if (variable === "lead.tags" && Array.isArray(value)) {
          draft.data.tags = value.map(String);
        } else if (variable === "lead.score" && typeof value === "number") {
          draft.data.score = value;
        }
        return;
      }

      case "conversation_completed":
      case "flow_completed": {
        const draft = drafts.get(sid);
        drafts.delete(sid);
        if (!draft?.data.name) return;
        // Only persist when a workspace is actually loaded (Supabase mode).
        // In mock mode tryGetCurrentWorkspaceId returns null but the mock
        // repo accepts the call anyway.
        const wsId = tryGetCurrentWorkspaceId();
        try {
          const lead = await persistence.leads.create({
            name: draft.data.name!,
            email: draft.data.email,
            phone: draft.data.phone,
            company: draft.data.company,
            source: draft.data.source ?? "runtime",
            botId: draft.botId,
            tags: draft.data.tags,
            score: draft.data.score,
          });
          // Best-effort: link the runtime session to the new lead so the
          // detail page can list its conversations.
          if (wsId) {
            try {
              await persistence.sessions.update(sid, { leadId: lead.id });
            } catch {
              /* session might not exist in this mode */
            }
          }
        } catch (err) {
          console.error("[crmBridge] failed to create lead", err);
        }
        return;
      }

      case "flow_abandoned": {
        drafts.delete(sid);
        return;
      }
    }
  });
}
