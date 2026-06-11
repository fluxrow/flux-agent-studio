/**
 * Built-in connector manifests.
 *
 * Manifests describe catalog capabilities. Runtime support varies by adapter,
 * so installation status must come from the adapter registry rather than this
 * static catalog.
 */
import type { ConnectorManifest } from "./types";

export const builtInConnectors: ConnectorManifest[] = [
  {
    id: "google-sheets",
    name: "Google Sheets",
    description: "Leia e escreva linhas em planilhas do Google a partir de qualquer Flow.",
    category: "spreadsheet",
    kind: "app",
    version: "0.1.0",
    author: "FluxBot",
    iconKey: "sheets",
    official: true,
    permissions: ["read", "write"],
    credentials: {
      environment: "production",
      fields: [
        { key: "spreadsheet_id", label: "Spreadsheet ID", type: "text", required: true },
        { key: "service_account", label: "Service Account JSON", type: "password", required: true },
      ],
    },
    actions: [
      { key: "append_row", name: "Append linha", parameters: [
        { key: "spreadsheet_id", label: "Spreadsheet ID", type: "string", required: true },
        { key: "sheet", label: "Aba", type: "string", required: true, defaultValue: "Sheet1" },
        { key: "values", label: "Valores (JSON array)", type: "json", required: true },
      ]},
      { key: "create_row", name: "Criar linha", parameters: [
        { key: "spreadsheet_id", label: "Spreadsheet ID", type: "string", required: true },
        { key: "sheet", label: "Aba", type: "string", required: true },
        { key: "values", label: "Valores (JSON)", type: "json", required: true },
      ]},
      { key: "update_row", name: "Atualizar linha", parameters: [
        { key: "spreadsheet_id", label: "Spreadsheet ID", type: "string", required: true },
        { key: "sheet", label: "Aba", type: "string", required: true },
        { key: "row", label: "Linha", type: "number", required: true },
        { key: "values", label: "Valores (JSON)", type: "json", required: true },
      ]},
      { key: "list_rows", name: "Listar linhas", parameters: [
        { key: "spreadsheet_id", label: "Spreadsheet ID", type: "string", required: true },
        { key: "range", label: "Range A1", type: "string", required: true },
      ]},
      { key: "lookup_row", name: "Buscar linha", parameters: [
        { key: "spreadsheet_id", label: "Spreadsheet ID", type: "string", required: true },
        { key: "range", label: "Range A1", type: "string", required: true },
        { key: "query", label: "Busca", type: "string", required: true },
      ]},
    ],
    triggers: [],
    tags: ["data", "spreadsheet", "google"],
  },
  {
    id: "slack",
    name: "Slack",
    description: "Envie mensagens e receba eventos de canais Slack.",
    category: "messaging",
    kind: "app",
    version: "0.1.0",
    author: "FluxBot",
    iconKey: "slack",
    official: true,
    permissions: ["send_message", "read"],
    credentials: {
      fields: [
        { key: "bot_token", label: "Bot Token", type: "password", required: true, placeholder: "xoxb-..." },
      ],
    },
    actions: [
      { key: "send_message", name: "Enviar mensagem", parameters: [
        { key: "channel", label: "Canal", type: "string", required: true },
        { key: "text", label: "Texto", type: "string", required: true },
      ]},
      { key: "lookup_channel", name: "Buscar canal", parameters: [
        { key: "name", label: "Nome do canal", type: "string", required: true },
      ]},
      { key: "lookup_user", name: "Buscar usuário por email", parameters: [
        { key: "email", label: "Email", type: "string", required: true },
      ]},
    ],
    triggers: [
      { key: "message_received", name: "Mensagem recebida", samplePayload: { channel: "general", user: "U123", text: "hi" } },
    ],
    tags: ["messaging", "team"],
  },
  {
    id: "webhook",
    name: "Webhook",
    description: "Conector universal para enviar e receber webhooks HTTP.",
    category: "automation",
    kind: "webhook",
    version: "0.1.0",
    author: "FluxBot",
    iconKey: "webhook",
    official: true,
    permissions: ["read", "write"],
    credentials: { fields: [
      { key: "secret", label: "Secret (HMAC)", type: "password", required: false },
    ]},
    actions: [
      { key: "send_request", name: "Enviar requisição HTTP", parameters: [
        { key: "url", label: "URL", type: "string", required: true },
        { key: "method", label: "Método", type: "select", options: ["GET","POST","PUT","PATCH","DELETE"], defaultValue: "POST" },
        { key: "headers", label: "Headers (JSON)", type: "json" },
        { key: "query_params", label: "Query params (JSON)", type: "json" },
        { key: "body", label: "Body (JSON)", type: "json" },
        { key: "timeout_ms", label: "Timeout (ms)", type: "number", defaultValue: 15000 },
        { key: "auth_mode", label: "Autenticação", type: "select", options: ["none","bearer","basic","api_key"], defaultValue: "none" },
        { key: "bearer_token", label: "Bearer token", type: "string" },
        { key: "basic_user", label: "Basic user", type: "string" },
        { key: "basic_pass", label: "Basic pass", type: "string" },
        { key: "api_key", label: "API key", type: "string" },
        { key: "api_key_header", label: "API key header", type: "string", defaultValue: "X-API-Key" },
      ]},
    ],
    triggers: [
      { key: "received", name: "Webhook recebido", samplePayload: { headers: {}, body: {} } },
    ],
    tags: ["http", "automation"],
  },
  {
    id: "telegram",
    name: "Telegram",
    description: "Bot Telegram — envie mensagens e reaja a eventos.",
    category: "messaging",
    kind: "app",
    version: "0.1.0",
    author: "FluxBot",
    iconKey: "telegram",
    official: true,
    permissions: ["send_message"],
    credentials: { fields: [
      { key: "bot_token", label: "Bot Token", type: "password", required: true },
    ]},
    actions: [
      { key: "send_message", name: "Enviar mensagem", parameters: [
        { key: "chat_id", label: "Chat ID", type: "string", required: true },
        { key: "text", label: "Texto", type: "string", required: true },
      ]},
    ],
    triggers: [
      { key: "message_received", name: "Mensagem recebida" },
    ],
    tags: ["messaging", "bot"],
  },
  {
    id: "stripe",
    name: "Stripe",
    description: "Pagamentos, assinaturas e eventos financeiros.",
    category: "payments",
    kind: "app",
    version: "0.1.0",
    author: "FluxBot",
    iconKey: "stripe",
    official: true,
    permissions: ["manage_payments", "read"],
    credentials: { fields: [
      { key: "secret_key", label: "Secret Key", type: "password", required: true, placeholder: "sk_..." },
    ]},
    actions: [
      { key: "create_checkout", name: "Criar checkout", parameters: [
        { key: "price_id", label: "Price ID", type: "string", required: true },
      ]},
    ],
    triggers: [
      { key: "payment_succeeded", name: "Pagamento aprovado" },
      { key: "subscription_canceled", name: "Assinatura cancelada" },
    ],
    tags: ["payments", "billing"],
  },
  {
    id: "google-analytics",
    name: "Google Analytics 4",
    description: "Envie eventos de conversão e leia métricas do GA4.",
    category: "analytics",
    kind: "app",
    version: "0.1.0",
    author: "FluxBot",
    iconKey: "ga",
    official: true,
    permissions: ["read", "write"],
    credentials: { fields: [
      { key: "measurement_id", label: "Measurement ID", type: "text", required: true },
      { key: "api_secret", label: "API Secret", type: "password", required: true },
    ]},
    actions: [
      { key: "track_event", name: "Enviar evento", parameters: [
        { key: "name", label: "Nome do evento", type: "string", required: true },
        { key: "params", label: "Parâmetros (JSON)", type: "json" },
      ]},
    ],
    triggers: [],
    tags: ["analytics", "tracking"],
  },
];
