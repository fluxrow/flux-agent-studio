/**
 * Telegram Connector — real adapter.
 *
 * Calls the Telegram Bot HTTPS API directly with the configured bot token.
 * A webhook *receiver* is prepared via `webhookReceiverPath` so a future
 * edge function can forward inbound updates into the runtime EventBus.
 */
import type { ConnectorAdapter, AdapterExecutionContext, AdapterExecutionResult } from "./types";

function token(ctx: AdapterExecutionContext): string {
  const t = ctx.credentials.bot_token;
  if (!t) throw new Error("telegram: missing 'bot_token'");
  return t;
}

async function tg(method: string, botToken: string, body: Record<string, unknown>): Promise<unknown> {
  const res = await fetch(`https://api.telegram.org/bot${botToken}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok || !data.ok) throw new Error(`Telegram ${method} failed: ${JSON.stringify(data)}`);
  return data.result;
}

export const telegramAdapter: ConnectorAdapter = {
  manifestId: "telegram",
  /** Path that an inbound webhook receiver should be exposed on. */
  // @ts-expect-error — extra metadata, ignored by interface
  webhookReceiverPath: "/connectors/telegram/webhook",

  async execute(action, ctx): Promise<AdapterExecutionResult> {
    const bot = token(ctx);
    const chat_id = ctx.parameters.chat_id;
    if (!chat_id) throw new Error("telegram: missing 'chat_id'");

    switch (action.key) {
      case "send_message": {
        const data = await tg("sendMessage", bot, {
          chat_id, text: String(ctx.parameters.text ?? ""),
          parse_mode: ctx.parameters.parse_mode,
        });
        return { data };
      }
      case "send_photo": {
        const data = await tg("sendPhoto", bot, {
          chat_id, photo: ctx.parameters.photo, caption: ctx.parameters.caption,
        });
        return { data };
      }
      case "send_document": {
        const data = await tg("sendDocument", bot, {
          chat_id, document: ctx.parameters.document, caption: ctx.parameters.caption,
        });
        return { data };
      }
      default:
        throw new Error(`telegram: unsupported action '${action.key}'`);
    }
  },
};
