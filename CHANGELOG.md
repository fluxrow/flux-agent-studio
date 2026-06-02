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

## Phase 20 — UX, Tooltips e Documentação

### Zero State
- `src/pages/Dashboard.tsx`: removidos `smartAlerts`, `recentActivity`,
  `bots`, `conversionsChart` e `channelChart` mockados. Quando o workspace
  está vazio, exibe `EmptyState` com CTA "Criar bot" + link para `/docs`.
- "Top bots" agora vem de `useBots()` (dados reais) com fallback "Nenhum
  bot publicado ainda."
- `src/pages/Analytics.tsx`: removidos `funnelSteps`, `blockPerf` e
  `conversionsChart` hardcoded. Zero state com CTA quando não há leads
  nem conversas.
- `src/components/AppSidebar.tsx`: removido card "Plano Pro · 64%"
  mockado do footer; substituído por atalho real para `/docs`.

### Tooltips globais
- `src/components/shared/InfoTooltip.tsx` (novo): componente reutilizável
  baseado no shadcn Tooltip (já há `TooltipProvider` em `App.tsx`).
  Aplicado nos KPIs do Dashboard e do Analytics; pronto para uso em
  Leads/CRM/Tracking/Knowledge/Channels/IA.

### Documentação
- `src/pages/Docs.tsx` (novo) + rota `/docs` em `src/App.tsx`.
- Estrutura com 8 seções: Primeiros Passos, Builder, CRM, Analytics,
  Tracking, IA, Knowledge Base, Integrações.
- Item "Documentação" adicionado ao grupo "Principal" da sidebar.

### Product Tour Foundation
- `src/tours/registry.ts` (novo): `tourRegistry` estático com definições
  para os tours futuros do Dashboard, Builder e CRM. Não há runtime de
  tour ainda — apenas a fundação. KPIs do Dashboard expõem
  `data-tour="dashboard-kpis"` para futuro target.


## Phase 19 — First User Experience

### Bot creation
- `src/pages/BotNew.tsx`: substituído o redirecionamento estático para
  `/builder/sdr-imob` por criação real via `useCreateBot()`. O bot é
  persistido (mock ou Supabase, conforme `VITE_USE_SUPABASE`), e o usuário
  é redirecionado para `/builder/{novoBotId}`. Nome, descrição e canal
  principal (`whatsapp`/`instagram`/`web`/`telegram`) são gravados.

### Analytics
- `src/lib/analytics-basic.ts` (novo): hook `useBasicStats()` agrega
  contagens reais de **bots**, **leads**, **conversas** e **conversões**
  através da camada de persistência ativa.
- `src/pages/Dashboard.tsx`: KPIs hardcoded (`kpis` do `@/lib/mock`)
  substituídos pelas agregações reais.
- `src/pages/Analytics.tsx`: KPIs estáticos ("4.820", "12.7%", …)
  substituídos pelos números reais do workspace.

### Tracking persistence (verificação)
- Modo Supabase já persiste eventos (`supabaseEventRepository`),
  sessões (`supabaseSessionRepository`) e mensagens públicas
  (`record_public_message` em `src/lib/public-runtime.ts`). Sem
  alterações necessárias — comportamento confirmado.

### Connectors persistence (verificação)
- `src/connectors/store.ts` mantém instalações e metadados de
  credenciais em `localStorage` (`KEY_CONNECTORS`, `KEY_CREDENTIALS`),
  com valores brutos roteados ao `secretVault`. Sem alterações.


## Phase 18.7 — Critical Truth Sprint

### Security
- **BUG-01 (resíduo)**: `src/tracking/destinations/registry.ts` deixou de
  persistir credenciais sensíveis em `localStorage`. Campos listados em
  `SENSITIVE_KEYS` (`accessToken`, `apiKey`, `token`, …) agora são roteados
  para o `secretVault` (RAM) via `mergeSecrets("tracking", id, …)`. O storage
  guarda apenas metadados públicos (`pixelId`, `accountId`, `enabled`, `mock`).
- `loadFromStorage()` agora **purga** qualquer segredo legado encontrado em
  builds anteriores e emite warning identificando o destino afetado.
- Novo `getPublicConfig(id)` separa o config seguro (UI / telemetria) de
  `getConfig(id)` (usado pelo `dispatch` para injetar segredos do vault).

### Evidência
- Arquivo: `src/tracking/destinations/registry.ts`
- Métodos novos/alterados: `splitCredentials()`, `getPublicConfig()`,
  `setConfig()`, `loadFromStorage()`, `saveToStorage()`.
- Dependência removida do storage: campos sensíveis em
  `fluxbot.tracking.destinations.v1`.
- Validar: abrir DevTools → Application → Local Storage; configurar Meta CAPI
  com `accessToken` em **Settings → Destinations**; recarregar; conferir que
  o JSON salvo não contém `accessToken`, apenas `pixelId`.



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
