import type { ID, Template } from "@/types";
import type { TemplateRepository } from "../repositories";
import { mockTemplates } from "@/mocks";
import { delay } from "./_helpers";

export const mockTemplateRepository: TemplateRepository = {
  async list() {
    return delay(mockTemplates);
  },
  async get(id: ID) {
    return delay(mockTemplates.find((t) => t.id === id) ?? null);
  },
};
