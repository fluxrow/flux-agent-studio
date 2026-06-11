# Fluxrow Growth Hub — Checklists Executáveis por Fase

**Documento companheiro de:** `FLUXROW_GROWTH_HUB_ULTRA_REVIEW.md`
**Data:** 11 de junho de 2026
**Objetivo:** transformar cada fase do plano em uma checklist testável, com critérios de aceite verificáveis (testes, comandos, evidências) e dependências explícitas (RLS, Edge Functions, staging, secrets, observabilidade).

Convenções:

- `[ ]` = pendente · `[x]` = concluído · `[~]` = parcial
- **AC** = Critério de Aceite (Acceptance Criteria) — precisa ser demonstrável
- **DEP** = Dependência bloqueante
- **EV** = Evidência exigida (log, screenshot, teste, query)

---

## Fase 1 — Limpeza Técnica

**Meta:** repositório auditável, sem duplicidade real-vs-stub, com CI bloqueante.

### 1.1 Conflitos real vs. stub
- [x] Remover registros duplicados de canais Meta em `src/channels/index.ts` vs `src/channels/meta/`
  - **AC:** `rg "registerChannel\\('whatsapp'" src/` retorna exatamente 1 ocorrência
  - **EV:** diff + teste unitário de registro de canal
- [ ] Auditar `src/connectors/builtins.ts` — separar manifest demo de adapter real
  - **AC:** cada manifest declara `mode: 'real' | 'demo'`
  - **DEP:** atualizar UI de Connectors para mostrar badge
- [ ] Renomear `src/domain/persistence/supabase/notImplemented.ts` → dividir em repos por agregado
  - **AC:** nenhum import remanescente do arquivo antigo

### 1.2 Bloqueadores de segurança já corrigidos (revalidar)
- [x] Escritas públicas exigem token de sessão + rate limit
  - **EV:** teste em `src/test/` chamando `record_public_message` sem token retorna 401
- [x] Roteamento Meta isolado por workspace (sem ambiguidade entre tenants)
- [x] Credenciais/watches/eventos do Google Calendar isolados por workspace
- [x] Sync de Calendar pagina antes de salvar sync token
- [x] OAuth usa URL real da Edge Function como redirect

### 1.3 Qualidade global
- [ ] Reduzir lint global: 71 erros → 0; 23 warnings → < 10
  - **AC:** `npm run lint` exit 0
- [x] Typecheck limpo (`tsc --noEmit`)
- [x] Build de produção OK
- [ ] Cobertura mínima: 25 testes (atual: 13)
  - **AC:** `npm run test -- --coverage` ≥ 25 testes

### 1.4 Infraestrutura
- [ ] Criar projeto Supabase **staging** separado
  - **DEP:** variáveis `VITE_SUPABASE_URL_STAGING` em CI
  - **EV:** deploy de PR roda contra staging
- [ ] Testes automatizados de RLS para todas as tabelas `public.*`
  - **AC:** suíte `test/rls/*.test.ts` cobre 16 tabelas listadas
  - **DEP:** staging operacional
- [ ] Testes de Edge Functions (`meta-webhook`, `meta-send`, `calendar-*`, `lovable-ai`, `google-oauth-callback`)
  - **AC:** `supabase functions serve` + suíte vitest verde

**Gate de saída Fase 1:** CI bloqueante verde + staging respondendo + 0 stubs registrados como reais.

---

## Fase 2 — Padronização de Nomes e Rotas

**Meta:** novo vocabulário visível sem quebrar tabelas/RLS existentes.

- [ ] Mapa de compatibilidade `docs/NAMING-MAP.md` (FluxBot → Growth Hub, Bot → Agent, Workspace → Account)
  - **AC:** cada termo antigo tem alvo + escopo (UI / código / DB / API)
- [ ] Renomear navegação, breadcrumbs e títulos no `AppSidebar` e `AppLayout`
  - **AC:** zero ocorrência de "FluxBot" em `src/pages/` e `src/components/`
- [ ] Manter tabelas e RPCs com nomes atuais (sem migration ainda)
- [ ] Redirects temporários de rotas antigas (`/bots` → `/agents`)
  - **AC:** request a `/bots` retorna 301/302 para `/agents`
  - **EV:** teste e2e ou snapshot do `react-router`
- [ ] Atualizar SEO (`<title>`, meta description, OG) com novo nome

**Gate de saída Fase 2:** screenshot lado-a-lado antes/depois + checklist de rotas redirecionadas.

---

## Fase 3 — Account / Client / Brand / Project

**Meta:** hierarquia multi-tenant correta sem vazamento entre tenants.

- [ ] Migration: `accounts`, `clients`, `brands`, `projects` com FKs e RLS
  - **DEP:** GRANTs obrigatórios (`authenticated`, `service_role`)
  - **AC:** `supabase--linter` sem warnings de RLS
- [ ] Função `has_account_role(_account_id, _user_id, _roles)` SECURITY DEFINER
- [ ] Todas as tabelas operacionais (`bots`, `flows`, `leads`, `sessions`, `events`, `messages`, `channels`) ganham `brand_id` (nullable durante migração)
  - **AC:** backfill script preenche `brand_id` a partir do `workspace_id` atual
- [ ] Papéis: `agency_owner`, `agency_operator`, `client_viewer`, `client_editor`
- [ ] Testes de isolamento: usuário do Cliente A não lê dados do Cliente B
  - **EV:** suíte `test/rls/multi-tenant.test.ts` verde

**Gate de saída Fase 3:** 2 contas reais cadastradas em staging com isolamento provado por teste automatizado.

---

## Fase 4 — Context Engine por Marca

**Meta:** snapshot versionado da marca alimenta toda IA do produto.

- [ ] Tabela `brand_context_snapshots` (brand_id, version, payload jsonb, created_at)
  - **DEP:** Fase 3 (brand_id existe)
- [ ] Implementar `resolveBrandContext(brandId, purpose, channel, campaignId?)`
  - **AC:** retorna snapshot imutável; testes cobrem 4 propósitos
- [ ] Migrar Knowledge Base + configs de IA como fontes do contexto
- [ ] Cada execução de IA grava `context_version` em `events.payload`
  - **AC:** query `SELECT DISTINCT payload->>'context_version' FROM events` mostra versões
- [ ] UI de Settings → "Contexto da Marca" mostra versão ativa e histórico

**Gate de saída Fase 4:** rollback de versão de contexto altera comportamento da IA sem deploy.

---

## Fase 5 — CRM, Leads e Lead Magnets

**Meta:** identidade omnichannel, deduplicação e timeline única.

- [ ] Tabela `lead_identities` (lead_id, channel, external_id, verified_at)
  - **AC:** índice único `(channel, external_id)`
- [ ] Algoritmo de deduplicação: email > phone > channel_id
  - **EV:** teste `dedup.test.ts` com 6 cenários
- [ ] Campos: `consent_source`, `consent_text`, `lead_magnet_id`, `brand_id`, `campaign_id`
- [ ] Timeline unificada `lead_timeline` (eventos + mensagens + conversões)
- [ ] Pipeline e scoring **por marca** (não global)
  - **DEP:** Fase 4 (contexto da marca)
- [ ] Lead magnets cadastráveis em Settings → Marca

**Gate de saída Fase 5:** mesmo lead em WhatsApp + Web aparece como 1 contato com 2 identidades.

---

## Fase 6 — Connector Hub (Meta, WhatsApp, ManyChat, n8n)

**Meta:** integrações externas só passam pelo Connector Hub.

- [ ] Adapter ManyChat (webhook in + API out)
  - **DEP:** secret `MANYCHAT_API_KEY` via Settings
- [ ] Meta E2E real com observabilidade
  - **AC:** envio + recebimento em conta sandbox documentados em `META-SMOKE-TEST-REPORT.md`
- [ ] WhatsApp Cloud API com template messages aprovados
- [ ] n8n como adapter outbound (webhook genérico)
- [ ] Remover todos os imports de `src/channels/stubs.ts` para canais que tem adapter real
  - **AC:** `rg "from.*channels/stubs" src/` = 0 para meta/whatsapp/instagram
- [ ] Dashboard de saúde de conectores (latência, taxa de erro 24h)

**Gate de saída Fase 6:** 1 mensagem real enviada e recebida em cada canal, com evento gravado em `events`.

---

## Fase 7 — Dashboard de Growth

**Meta:** métricas só aparecem se tiverem linhagem de dados verificável.

- [ ] Projeções materializadas: `mv_acquisition_daily`, `mv_conversations_daily`, `mv_leads_daily`, `mv_opportunities_daily`, `mv_sales_daily`
  - **DEP:** `events` populado + refresh job (pg_cron ou Edge Function agendada)
- [ ] Filtros: Account, Client, Brand, Campaign, Channel, período
- [ ] Cada card mostra "fonte" (clicável → linhagem) ou estado vazio honesto
  - **AC:** zero card com número fake/mock em produção
- [ ] Export CSV das projeções
- [ ] Teste de regressão: mesmo período, mesmo filtro → mesmo número

**Gate de saída Fase 7:** dashboard de uma marca real bate com soma dos eventos no banco (tolerância 0%).

---

## Fase 8 — MVP Real

**Meta:** onboarding de marca nova sem tocar no repositório.

Clientes-piloto:
- [ ] **Promotrip** — marca configurada, canais conectados, contexto preenchido, 1 campanha ativa
- [ ] **Cauã Farias** — idem
- [ ] **Terceiro cliente** (a definir) — idem, **sem nenhuma linha de código customizada**

Critérios transversais por piloto:
- [ ] Onboarding < 30 min do zero até primeiro lead capturado
- [ ] Contexto da marca versionado e usado por IA
- [ ] CRM mostra leads com identidade omnichannel
- [ ] Dashboard reflete eventos reais nas primeiras 24h
- [ ] Operador do cliente consegue editar conteúdo sem ajuda do time técnico

**Gate de saída Fase 8 (MVP aprovado):** 3 pilotos rodando ≥ 14 dias, NPS coletado, lista de bugs P0/P1 zerada.

---

## Dependências transversais (válidas para todas as fases)

| Dependência | Onde aplica | Como validar |
|---|---|---|
| RLS + GRANTs em toda tabela `public.*` | Fases 1, 3, 4, 5, 7 | `supabase--linter` sem warnings |
| Edge Functions com testes | Fases 1, 4, 6 | suíte vitest + `supabase functions serve` |
| Staging separado de produção | Fases 1+ | URL distinta, secrets distintos |
| Secrets gerenciados (sem hardcode) | Fases 4, 6 | `rg "sk-|api_key.*=" src/` vazio |
| Observabilidade (logs estruturados) | Fases 6, 7 | `edge_function_logs` por correlação |
| Documentação atualizada em PR | Todas | template de PR exige checkbox |

---

## Como usar este documento

1. Cada PR referencia o(s) item(ns) que fecha (ex.: "Closes §1.1 — duplicidade de canais Meta").
2. Marcar `[x]` apenas com link de evidência (commit, teste, screenshot ou query).
3. Gate de saída de cada fase é **revisado por 2 pessoas** antes de avançar.
4. Atualizar `FLUXROW_GROWTH_HUB_ULTRA_REVIEW.md` quando um gate fecha.
