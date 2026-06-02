import type { ID, Timestamps } from "./common";

export interface Template extends Timestamps {
  id: ID;
  category: string;
  name: string;
  description: string;
  /** Tailwind gradient classes — visual only. */
  gradient: string;
  /** Optional default blocks the template will instantiate. */
  starterBlockIds?: ID[];
}
