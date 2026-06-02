# Changelog

Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/).
Versionamento por **fases** entregues — ver `fluxbot-features.md` para detalhes
completos por fase.

## [Unreleased]

### Docs
- README, CONTRIBUTING, SECURITY, CHANGELOG, LICENSE, CODE_OF_CONDUCT
- `docs/ARCHITECTURE.md` com visão de camadas e fluxo de eventos
- `.env.example` documentando variáveis públicas
- `.editorconfig` para consistência entre editores

## Phase 18.6 — Stabilization Sprint

### Security
- **BUG-01**: novo `src/security/secretVault.ts` (vault em memória, não persiste).
  `connectorStore` e `oauthStore` agora extraem `accessToken`, `refreshToken`,
  `client_secret`, `apiKey`, etc. para o vault antes de gravar em
  `localStorage`. Cleanup automático da chave legada
  `fluxbot.connector_credential_values.v1`.
- **BUG-02**: Meta CAPI passa `access_token` no corpo JSON do POST em vez de
  query-string — nenhuma credencial mais aparece em Network URLs.
- **BUG-10**: novo `AdminRoute` protege `/qa`, `/system-health`, `/errors`,
  `/debug/repositories`, `/channels/debug` para `owner`/`admin` do workspace.

### Persistence
- **BUG-03**: `supabaseFlowRepository`, `supabaseConversationRepository`,
  `supabaseVersionRepository` e `supabaseVariableRepository` implementados
  contra o schema real. Apenas `templates` permanece em `stub` até a fase do
  marketplace.

### Beta
- Feature flags default-off para `knowledge_base`, `omnichannel` e
  `marketplace`; somente módulos com persistência real ficam visíveis em
  beta fechado.


## Phase 18.5 — Beta Readiness Program
- `src/beta/` (featureFlags, betaUsers, onboarding, health, errors,
  feedback, analytics, qa, smokeTemplates)
- Páginas `/onboarding`, `/beta`, `/system-health`, `/errors`, `/qa`
- `FeedbackWidget` global no `AppLayout` (bug / sugestão / dúvida / feature)
- Novo grupo **Beta** na sidebar
- Sem mudanças em Runtime, CRM, Tracking, AI, Knowledge, Connectors ou Intelligence

## Phase 18 — Lead Intelligence Engine
- `src/intelligence/` (scorer, summary, insights, recommendations, forecast, attribution)
- `LeadIntelligencePanel` (tab em LeadDetail) e `LeadIntelligenceWidget` (Dashboard)
- Eventos `lead_scored`, `lead_summary_generated`, `lead_forecast_generated`

## Phase 17 — Real Connectors (Wave 1)
- Adapters reais: Webhook, Google Sheets, Telegram, Slack
- Connector Runtime: executor com retry/error policy + variable mapping
- Connector Inspector (testes manuais com logs)

## Phase 16 — Connector Hub Foundation
- `src/connectors/` (types, registry, store, events, builtins)
- Página `/connectors` + `ConnectorBlockEditor` no Builder
- Manifests built-in: Google Sheets, Slack, Webhook, Telegram, Stripe, GA4

## Phase 15 — Integration Readiness Layer
- Páginas públicas `/privacy`, `/terms`, `/data-deletion`
- Privacy Center: Consent, Audit Logs, Credentials, Readiness panels

## Phase 14 — AI Builder Engine
- `src/ai-builder/` (blueprints + generator) e página `/ai-builder`

## Phase 13 — Knowledge Base Engine
- `src/knowledge/` (parsers, chunker, embeddings, retriever, pipeline)
- Página `/knowledge` + integração no AI Block

## Phases 3 → 12
Ver `fluxbot-features.md` para histórico completo de Runtime, Builder,
Persistence, Supabase, AI Block, Tracking, CRM, Omnichannel etc.
