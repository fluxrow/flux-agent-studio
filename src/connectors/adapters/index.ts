import { adapterRegistry } from "./registry";
import { webhookAdapter } from "./webhook";
import { googleSheetsAdapter } from "./googleSheets";
import { telegramAdapter } from "./telegram";
import { slackAdapter } from "./slack";

export { adapterRegistry } from "./registry";
export type { ConnectorAdapter, AdapterExecutionContext, AdapterExecutionResult } from "./types";

let booted = false;
export function bootstrapAdapters() {
  if (booted) return;
  booted = true;
  adapterRegistry.register(webhookAdapter);
  adapterRegistry.register(googleSheetsAdapter);
  adapterRegistry.register(telegramAdapter);
  adapterRegistry.register(slackAdapter);
}
