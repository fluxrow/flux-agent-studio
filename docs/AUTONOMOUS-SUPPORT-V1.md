# Fase 26H.1 — Autonomous Support V1

Especificação técnica do runtime de suporte autônomo do Flux Agent Studio.
Esta fase entrega **apenas arquitetura, fluxo, tabelas, eventos e métricas**.
Nenhuma UI é construída agora — só o contrato que UI, edge functions e
agentes vão consumir nas fases seguintes.

> **Objetivo:** transformar bugs, feedback e feature requests em um fluxo
> único, classificado e tentado autonomamente por IA, escalando para
> humano só quando indispensável.

---

## 1. Arquitetura

```text
┌──────────────────────────────────────────────────────────────────────┐
│                            ENTRY POINTS                              │
│   in-app widget · /api/support  ·  email-to-ticket  ·  webhook       │
└──────────────────────────────┬───────────────────────────────────────┘
                               │ POST /functions/v1/support-intake
                               ▼
                  ┌────────────────────────────┐
                  │  Intake (edge function)    │  valida + grava
                  │  - dedup hash              │  support_tickets(new)
                  │  - rate limit por user     │  + event ticket.created
                  └────────────┬───────────────┘
                               │ enqueue
                               ▼
        ┌──────────────────────────────────────────────────┐
        │            Support Orchestrator (state machine)  │
        │                                                  │
        │  classify → retrieve → resolve → verify → close  │
        │           ↘ diagnose ↗            ↘ escalate ↗   │
        └───────┬───────────┬────────────┬─────────────────┘
                │           │            │
        ┌───────▼──┐ ┌──────▼─────┐ ┌────▼───────────┐
        │ Classifier│ │ Retriever  │ │ Resolver       │
        │ gemini-3- │ │ Lovable AI │ │ gemini-3-flash │
        │ flash     │ │ + KB index │ │ + tool use     │
        └──────────┘ └──────┬─────┘ └────┬───────────┘
                            │            │
                       ┌────▼─── kb_articles (pgvector embeddings)
                       │         kb_chunks
                       │
                ┌──────▼─────────────────┐
                │ Knowledge Sources      │
                │  · docs/* (markdown)   │
                │  · Updates feed        │
                │  · Past resolved cases │
                │  · Bot/Builder schema  │
                └────────────────────────┘

         escalate ──▶ humans queue (Slack channel + /inbox/support)
```

**Camadas:**

| Camada | Onde mora | Responsabilidade |
|---|---|---|
| Intake | `supabase/functions/support-intake` | normaliza payload, gera `dedupe_key`, grava ticket, emite evento |
| Orchestrator | `supabase/functions/support-orchestrator` | máquina de estados, chama subagentes via AI SDK |
| Classifier | tool dentro do orchestrator | classifica em `bug | how_to | feature_request | feedback` |
| Retriever | `src/support/kb/retriever.ts` (compartilhado server) | embeddings + top-K em `kb_chunks` |
| Resolver | tool dentro do orchestrator | gera resposta citando KB; pode chamar tools de diagnóstico read-only |
| Escalation | trigger ao mudar status p/ `escalated` | publica em Slack e cria item em `support_assignments` |
| KB indexer | `supabase/functions/kb-indexer` (cron) | reindexa `docs/`, Updates e tickets `resolved` |

Tudo passa pela **Lovable AI Gateway** (model padrão `google/gemini-3-flash-preview`).
Modelo de classificação leve usa `google/gemini-2.5-flash-lite`; resolver
pode subir para `google/gemini-2.5-pro` em tickets `severity = high`.

---

## 2. Fluxo

Diagrama completo em
[`/mnt/documents/autonomous-support-flow.mmd`](autonomous-support-flow.mmd).

### Estados do ticket

```text
new  →  classified  →  in_progress  →  awaiting_user
                                   ↘  resolved_by_ai
                                   ↘  escalated → resolved_by_human
                                                ↘  wont_fix
```

Transições permitidas (resumo):

| De            | Para                | Trigger                                              |
|---------------|---------------------|------------------------------------------------------|
| `new`         | `classified`        | classifier conclui com `confidence ≥ 0.6`            |
| `new`         | `escalated`         | classifier `confidence < 0.4` **ou** severidade `critical` |
| `classified`  | `in_progress`       | resolver inicia (KB hit ou diagnóstico)              |
| `in_progress` | `awaiting_user`     | resolver pede repro/log; deadline 24h                |
| `awaiting_user` | `in_progress`     | usuário respondeu                                    |
| `awaiting_user` | `escalated`       | timeout 72h sem resposta + severity ≥ medium         |
| `in_progress` | `resolved_by_ai`    | usuário confirma OR `auto_resolve_after_h = 48` sem rejeição |
| `in_progress` | `escalated`         | `attempts ≥ 3` sem progresso OR usuário rejeita      |
| `escalated`   | `resolved_by_human` | humano marca resolvido                               |
| qualquer      | `wont_fix`          | humano decide                                        |

### Política de escalonamento

Escala para humano quando **qualquer** condição:

1. `severity = critical` (afeta pagamento, dados, auth).
2. `category = bug` **e** `attempts ≥ 3` sem KB hit.
3. Classifier devolveu `pii_detected = true`.
4. Usuário pediu humano explicitamente (`intent = request_human`).
5. Sentiment do usuário virou `negative` em ≥ 2 mensagens consecutivas.

`feature_request` e `feedback` **nunca** escalam — viram itens
de backlog.

---

## 3. Tabelas

Todas em `public`, com `GRANT` apropriado e RLS por workspace
(`is_workspace_member(workspace_id, auth.uid())`).

> Esta fase **não** cria as tabelas — só especifica. Migrations vêm na
> 26H.2.

### 3.1 `support_tickets`

| Coluna | Tipo | Notas |
|---|---|---|
| `id` | `uuid pk default gen_random_uuid()` | |
| `workspace_id` | `uuid not null` | FK workspaces; index |
| `created_by` | `uuid` | `auth.users.id` (null se anon webhook) |
| `surface` | `text` | `in_app`, `email`, `webhook`, `widget` |
| `status` | `support_status` enum | default `new` |
| `category` | `support_category` enum nullable | classifier preenche |
| `severity` | `support_severity` enum | `low | medium | high | critical` |
| `intent` | `text` | `question | bug | request_human | feature | feedback` |
| `subject` | `text not null` | |
| `body` | `text not null` | |
| `dedupe_key` | `text` | sha256(workspace + normalized subject + body) |
| `attempts` | `int default 0` | rondas IA |
| `confidence` | `numeric(4,3)` | última saída do classifier |
| `assigned_to` | `uuid` | `auth.users.id`, humano que pegou |
| `resolved_at` | `timestamptz` | |
| `metadata` | `jsonb default '{}'` | UA, route, app_version, screenshot_url |
| `created_at`, `updated_at` | `timestamptz` | trigger `set_updated_at` |

Índice único parcial: `(workspace_id, dedupe_key) WHERE status IN ('new','classified','in_progress','awaiting_user')`
— deduplica enquanto o ticket está vivo.

### 3.2 `support_messages`

Histórico da conversa entre usuário ↔ IA ↔ humano.

| Coluna | Tipo |
|---|---|
| `id` | `uuid pk` |
| `ticket_id` | `uuid fk support_tickets on delete cascade` |
| `role` | `support_role` enum (`user`, `ai`, `agent`, `system`) |
| `content` | `text not null` |
| `tool_calls` | `jsonb` |
| `model` | `text` (snapshot do modelo usado) |
| `tokens_in`, `tokens_out` | `int` |
| `cost_usd` | `numeric(10,6)` |
| `created_at` | `timestamptz default now()` |

### 3.3 `kb_articles` / `kb_chunks`

Knowledge base com embeddings.

```sql
kb_articles(
  id uuid pk,
  source text,           -- 'docs', 'updates', 'resolved_ticket'
  source_ref text,       -- path ou ticket id
  title text,
  url text,
  body_md text,
  hash text,             -- sha256 do body; reindex skip se igual
  workspace_id uuid null, -- null = global; not null = privado
  updated_at timestamptz
);

kb_chunks(
  id uuid pk,
  article_id uuid fk kb_articles on delete cascade,
  ord int,
  content text,
  embedding vector(768), -- gemini-embedding-001
  tokens int
);
create index on kb_chunks using hnsw (embedding vector_cosine_ops);
```

### 3.4 `feature_requests`

| Coluna | Tipo |
|---|---|
| `id`, `workspace_id`, `created_by` | padrão |
| `title` | `text not null` |
| `description` | `text` |
| `dedupe_key` | `text` (sha256 do title normalizado) |
| `votes` | `int default 1` |
| `status` | `text` (`triaged`, `planned`, `building`, `shipped`, `declined`) |
| `linked_ticket_ids` | `uuid[]` |
| `created_at`, `updated_at` | padrão |

Trigger: `INSERT ... ON CONFLICT (workspace_id, dedupe_key) DO UPDATE SET votes = votes + 1`.

### 3.5 `feedback_items`

Feedback puro (NPS, comentário positivo, etc.). Não vira ticket.

| Coluna | Tipo |
|---|---|
| `id`, `workspace_id`, `created_by` | padrão |
| `sentiment` | `text` (`positive`, `neutral`, `negative`) |
| `surface` | `text` |
| `body` | `text` |
| `metadata` | `jsonb` |
| `created_at` | `timestamptz` |

### 3.6 `support_events`

Append-only telemetry (ver §4). Tabela separada para não poluir `events`
do runtime de bots.

| Coluna | Tipo |
|---|---|
| `id` | `bigserial pk` |
| `ticket_id` | `uuid` (nullable; events de KB indexer não têm ticket) |
| `workspace_id` | `uuid` |
| `type` | `text not null` |
| `payload` | `jsonb default '{}'` |
| `created_at` | `timestamptz default now()` |

Particionável por mês quando o volume crescer.

### 3.7 Enums

```sql
create type support_status   as enum ('new','classified','in_progress','awaiting_user','resolved_by_ai','escalated','resolved_by_human','wont_fix');
create type support_category as enum ('bug','how_to','feature_request','feedback','spam');
create type support_severity as enum ('low','medium','high','critical');
create type support_role     as enum ('user','ai','agent','system');
```

### 3.8 GRANTs (preview)

```sql
grant select, insert on public.support_tickets        to authenticated;
grant select, insert on public.support_messages       to authenticated;
grant select         on public.kb_articles, public.kb_chunks to authenticated;
grant select, insert, update on public.feature_requests to authenticated;
grant select, insert on public.feedback_items         to authenticated;
grant all on all tables in schema public to service_role;
```

RLS: workspace member para `support_*` e `feature_requests`; `kb_articles`
público (`workspace_id is null`) ou via membership.

---

## 4. Eventos

Append-only em `support_events`. Também publicados no bus interno
(`src/runtime/events/bus.ts`) para os listeners de UI/analytics.

| `type`                     | Quem emite        | Payload chave                                     |
|----------------------------|-------------------|---------------------------------------------------|
| `ticket.created`           | intake            | `surface`, `intent`, `dedupe_hit`                 |
| `ticket.classified`        | orchestrator      | `category`, `severity`, `confidence`              |
| `ticket.kb_searched`       | retriever         | `top_k`, `best_score`, `articles[]`               |
| `ticket.ai_replied`        | resolver          | `message_id`, `cited_article_ids[]`, `cost_usd`   |
| `ticket.user_replied`      | intake/orchestrator | `sentiment`, `attempt_no`                       |
| `ticket.awaiting_user`     | orchestrator      | `reason`                                          |
| `ticket.escalated`         | orchestrator      | `reason`, `policy_matched`                        |
| `ticket.assigned`          | escalation worker | `assigned_to`                                     |
| `ticket.resolved_by_ai`    | orchestrator      | `attempts`, `time_to_resolve_s`, `cost_usd`       |
| `ticket.resolved_by_human` | humano            | `assigned_to`, `time_to_resolve_s`                |
| `ticket.reopened`          | intake            | `previous_status`                                 |
| `ticket.feedback_collected`| widget pós-fechamento | `csat` (1–5), `helpful` (bool), `comment`     |
| `kb.indexed`               | kb-indexer        | `source`, `articles_added`, `articles_updated`    |
| `kb.miss`                  | retriever         | `query`, `best_score` (para alimentar backlog KB) |
| `feature_request.upserted` | orchestrator      | `feature_request_id`, `votes`                     |

Convenção: `type` sempre `domain.verb_past`. Payload é flat sempre que
possível (facilita query analítica).

---

## 5. Métricas

KPIs viram views materializadas em `public.support_metrics_*` e são
expostos em `/admin/support` (fase 26H.4).

### 5.1 Volume & deflection

- **`tickets_created`** — count por dia/semana/mês.
- **`auto_resolution_rate`** = `resolved_by_ai / (resolved_by_ai + resolved_by_human)` — **meta inicial: ≥ 55%**.
- **`escalation_rate`** = `escalated / created` — meta ≤ 35%.
- **`reopen_rate`** = `reopened / resolved` (em 7d) — meta ≤ 8%.
- **`dedupe_rate`** = tickets com `dedupe_hit = true` / criados — sinal de problema recorrente.

### 5.2 Tempo

- **`first_response_p50` / `_p95`** — `ticket.ai_replied.first - ticket.created` — meta p50 ≤ 30s.
- **`time_to_resolve_p50/p95`** — separado por `resolved_by_ai` vs `resolved_by_human`.
- **`awaiting_user_avg`** — tempo médio em `awaiting_user` (saúde do diálogo).

### 5.3 Qualidade

- **`csat`** — média da resposta pós-fechamento (1–5).
- **`thumbs_up_rate`** — `helpful=true / feedback_collected`.
- **`citation_coverage`** — % de respostas `ai_replied` com `cited_article_ids != []` — meta ≥ 80%.
- **`kb_miss_rate`** — `kb.miss / ticket.kb_searched`.
- **`hallucination_flag_rate`** — auditoria semanal: amostra 5% de
  `ai_replied`, humano marca correto/incorreto. Meta ≤ 3%.

### 5.4 Custo

- **`cost_per_ticket`** = soma `support_messages.cost_usd` por ticket.
- **`cost_per_resolved`** = `cost_usd / resolved_*`.
- **`tokens_per_ticket_p95`** — sentinela de prompt obeso.

### 5.5 Catálogo de Knowledge

- **`kb_coverage`** = `% de classified tickets com KB hit ≥ threshold`.
- **`top_kb_misses`** — top 20 queries com melhor score < threshold em 30d.
- **`top_articles`** — artigos mais citados em respostas resolvidas.

### 5.6 Backlog de produto

- **`feature_requests_open`**, **`feature_requests_top_by_votes`**.
- **`feedback_sentiment_split`** — positivo/neutro/negativo por surface.

### 5.7 SLO sugerido (V1)

```text
auto_resolution_rate  ≥ 55%   (semanal)
first_response_p50    ≤ 30s
time_to_resolve_ai_p50 ≤ 2min
csat                  ≥ 4.2
hallucination_rate    ≤ 3%
cost_per_ticket_p95   ≤ US$ 0.05
```

Se qualquer SLO romper por 2 semanas, abre auto-ticket
(`severity=high`, `category=bug`, `assigned_to = ops`) — o sistema
auto-monitora.

---

## 6. Próximas fases

| Fase    | Escopo                                                                |
|---------|-----------------------------------------------------------------------|
| 26H.2   | Migrations: tabelas, enums, RLS, GRANTs, `kb_articles` seed.         |
| 26H.3   | Edge functions: `support-intake`, `support-orchestrator`, `kb-indexer`. |
| 26H.4   | UI: widget in-app + página `/admin/support` + analytics.             |
| 26H.5   | Slack escalation + email-to-ticket inbound.                          |
| 26H.6   | Auditoria de qualidade (sampler) + dashboards SLO.                   |

---

## 7. Diagrama

<lov-artifact url="/__l5e/documents/autonomous-support-flow.mmd" mime_type="text/vnd.mermaid"></lov-artifact>
