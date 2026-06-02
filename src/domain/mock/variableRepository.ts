import type { ID, Variable } from "@/types";
import type { VariableRepository } from "../repositories";
import { mockVariables } from "@/mocks";
import { delay } from "./_helpers";

export const mockVariableRepository: VariableRepository = {
  async listByBot(botId: ID) {
    return delay(mockVariables.filter((v) => v.botId === botId));
  },
  async listWorkspace() {
    return delay(mockVariables.filter((v: Variable) => v.scope === "workspace"));
  },
};
