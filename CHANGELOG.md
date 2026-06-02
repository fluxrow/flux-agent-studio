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
