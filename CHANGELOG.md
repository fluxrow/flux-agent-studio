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

## Sprint 2 — Builder Core + UX Blockers

### Builder
- **BUG-04**: Builder funcional. Drag-and-drop da paleta para o canvas,
  movimentação por arrasto, conexão via handles (clique saída → clique
  entrada), remoção de blocos e de conexões (double-click).
- `BuilderContext` ganhou `addBlock`, `moveBlock`, `removeBlock`,
  `addConnection`, `removeConnection`, `save`, `saveStatus` e viewport
  (`zoom`, `zoomIn`, `zoomOut`, `resetZoom`, `requestCenter`).
- Botão **Salvar rascunho** agora chama `flows.saveBlocks` +
  `flows.saveConnections` e exibe loading / toast.
- **Autosave** com debounce (1,5s) e badge de status: alterado / salvando /
  salvo / erro ao salvar.
- Zoom in/out/reset funcional + botão **Centralizar canvas** (substitui o
  mini-mapa decorativo).

### Publish
- **B1**: botão **Publicar** desabilitado e exibe toast de erro quando o
  validator reporta erros. RPC nunca é chamado para flow inválido.

### Settings cleanup (BUG-05 / BUG-07)
- Removido `TabsContent value="profile"` duplicado.
- Removidos nome/e-mail fictícios ("Cauã Martins") — agora derivados de
  `AuthProvider` (user_metadata.full_name / email).
- Abas Equipe, Plano e API & Webhooks substituídas por placeholder
  **Em breve** (sem botões falsos).
- Botão "Excluir workspace", "Rotacionar", "Fazer upgrade", "Alterar foto"
  removidos da tela. Workspace name/slug agora somente-leitura.

### Dashboard (BUG-06)
- Removido "Bom dia, Cauã" hardcoded. Saudação calculada pelo horário real
  (madrugada/dia/tarde/noite) e nome derivado de `AuthProvider`. Workspace
  vem do `WorkspaceProvider`. Fallback neutro quando não há sessão.

### Connectors (BUG-08)
- `bootstrapConnectors()` migrado para dentro do `useEffect` — não há mais
  registro/listener duplicado a cada render.

### Confirm dialogs (BUG-12)
- `window.confirm` removido em Knowledge (apagar base / documento) e em
  CredentialsPanel (remover credencial). Substituído por `AlertDialog`
  shadcn com toast de sucesso.

### Toast standardization (BUG-15)
- `useToast` (legacy) substituído por `sonner` em `AIBuilder` e em
  `FeedbackWidget`. Padrão único de toasts em todo o app.

### Feature Flag UX
- `AppSidebar` agora oculta itens cuja `FeatureKey` está desabilitada para o
  workspace ativo (Knowledge fica oculto enquanto o flag estiver off no
  beta), evitando que usuários acessem módulos mock.

### QA
- `qa.ts` ganhou os smoke tests do Sprint 2: drag-and-drop, mover bloco,
  conectar blocos, salvar+recarregar, publicar válido, bloquear publicação
  inválida, abrir link público, lead chega ao CRM.



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
