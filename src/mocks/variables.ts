import type { Variable } from "@/types";
import { MOCK_WORKSPACE_ID, fixedIso } from "./_shared";

const ts = { createdAt: fixedIso(20), updatedAt: fixedIso(1) };

export const mockVariables: Variable[] = [
  { id: "v1", workspaceId: MOCK_WORKSPACE_ID, botId: "sdr-imob", key: "lead_name", type: "string", scope: "session", description: "Nome capturado pelo bot",     ...ts },
  { id: "v2", workspaceId: MOCK_WORKSPACE_ID, botId: "sdr-imob", key: "intent",    type: "string", scope: "session", description: "Intenção do lead",            ...ts },
  { id: "v3", workspaceId: MOCK_WORKSPACE_ID, botId: "sdr-imob", key: "phone",     type: "string", scope: "session", description: "Telefone do lead",            ...ts },
  { id: "v4", workspaceId: MOCK_WORKSPACE_ID,                    key: "currency",  type: "string", scope: "workspace", defaultValue: "BRL", description: "Moeda padrão", ...ts },
];
