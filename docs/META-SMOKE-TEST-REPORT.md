# META SMOKE TEST REPORT
**FASE 27A.5 — Executado em 2026-06-04**
*Commit base testado: `ffde1bf` (implementação) + `a14ce0f` (plano de teste)*

> Metodologia: testes de infraestrutura e código executados diretamente no ambiente
> de execução remota. Testes que exigem Meta API real, dispositivo físico ou acesso
> direto ao Supabase Dashboard remoto estão marcados como **BLOQUEADO** — não por
> falha de código, mas por impossibilidade de execução sem credenciais externas.
> Bugs encontrados por análise estática são reportados como **FALHOU**.

---

## Resultados por teste

---

### T01 — Verificação de infraestrutura

**Status: BLOQUEADO / PARCIAL**

| Item | Resultado |
|------|-----------|
| Migração `20260604000001_meta_channels.sql` presente localmente | PASSOU |
| Arquivo de migração com sintaxe SQL válida | PASSOU |
| `is_workspace_member` definida em migração anterior | PASSOU |
| `has_workspace_role` definida em migração anterior | PASSOU |
| `set_updated_at` trigger function existe | PASSOU |
| Edge Function `meta-webhook` presente em `supabase/functions/` | PASSOU |
| Edge Function `meta-send` presente em `supabase/functions/` | PASSOU |
| Migração **aplicada no Supabase remoto** | **BLOQUEADO** — rede do ambiente bloqueia `supabase.co` |
| Edge Functions **deployadas** no projeto remoto | **BLOQUEADO** — não verificável sem Supabase CLI ou acesso ao dashboard |
| Secrets `META_VERIFY_TOKEN` e `META_APP_SECRET` configurados | **BLOQUEADO** — não verificável externamente |

**Ação necessária antes de qualquer outro teste:**
```bash
supabase db push
supabase functions deploy meta-webhook
supabase functions deploy meta-send
# Dashboard → Edge Functions → Secrets → adicionar META_VERIFY_TOKEN e META_APP_SECRET
```

---

### T02 — Hub challenge (GET webhook)

**Status: BLOQUEADO**

Tentativa de curl para `https://bgzczvsmfcnypwqveotx.supabase.co/functions/v1/meta-webhook` retornou `403 Host not in allowlist` — o ambiente de execução remota bloqueia saída para `supabase.co`.

**Análise estática do código:** PASSOU
- Handler GET implementado corretamente (`meta-webhook/index.ts:150-160`)
- Verifica `hub.mode === "subscribe"`, `token === META_VERIFY_TOKEN`, e faz echo do challenge
- Retorna 403 para qualquer outra combinação

**Bloqueio:** requer acesso de rede externo ao endpoint deployado.

---

### T03 — Rejeição de assinatura HMAC inválida

**Status: FALHOU — BUG DE SEGURANÇA**

**Arquivo:** `supabase/functions/meta-webhook/index.ts:168`

**Causa exata:**
```typescript
// linha 23 — default é string vazia:
const META_APP_SECRET = Deno.env.get("META_APP_SECRET") ?? "";

// linha 168 — bloco HMAC é condicional:
if (META_APP_SECRET) {  // ← falsy quando vazio!
  const sig = req.headers.get("x-hub-signature-256");
  const valid = await verifySignature(rawBody, sig);
  if (!valid) return new Response("Invalid signature", { status: 401 });
}
// Se META_APP_SECRET não estiver configurado nos Secrets,
// qualquer POST com JSON válido é processado sem verificação
```

**Impacto:** se o secret `META_APP_SECRET` não for configurado (condição comum em staging/dev), qualquer pessoa que conheça a URL do webhook pode injetar mensagens falsas no banco — criando conversas e mensagens para qualquer workspace ativo.

**Esforço para correção:** 15 minutos. Trocar `if (META_APP_SECRET)` por `if (!META_APP_SECRET) return new Response("Misconfigured", { status: 500 })` — forçar rejeição quando secret não estiver configurado.

---

### T04 — WhatsApp inbound real

**Status: BLOQUEADO**

Requer:
- Migração aplicada no Supabase remoto
- Edge Function `meta-webhook` deployada
- Secret `META_APP_SECRET` configurado
- Meta App com WhatsApp Business API configurado
- Número de sandbox registrado
- Dispositivo físico para enviar mensagem de teste

**Análise estática:** PASSOU
- `extractWhatsApp()` extrai corretamente `phone_number_id`, `msg.from`, `contact.profile.name`, `msg.text.body`
- `routeAndStore()` chama `find_meta_connection` com `_phone_number_id` correto
- `store_meta_inbound` RPC atualiza `unread` e `preview` corretamente via `ON CONFLICT`

---

### T05 — Instagram DM inbound real

**Status: BLOQUEADO**

Requer todos os itens de T04 mais conta Instagram Business com permissão `instagram_manage_messages` aprovada pela Meta.

**Análise estática:** PASSOU com ressalva
- `extractInstagram()` usa `entry.messaging[]` corretamente
- `msg.sender.name` pode ser `undefined` em muitos casos (Instagram não sempre retorna nome no webhook) — o fallback para `msg.sender.id` está implementado: OK
- `pageId` vem de `entry.id` — correto conforme formato de payload Instagram

---

### T06 — Messenger inbound real

**Status: BLOQUEADO**

Mesmas dependências de T05. `extractMessenger()` usa estrutura idêntica ao Instagram — correto.

---

### T07 — Outbound (envio de mensagem pela UI)

**Status: FALHOU — BUG CRÍTICO**

**Arquivo:** `supabase/functions/meta-send/index.ts:129`

**Causa exata:**
```typescript
// linha 129 — conversation_id inserido como null:
await serviceClient.from("meta_messages").insert({
  workspace_id:        conn.workspace_id,
  conversation_id:     null,  // ← BUG: "best-effort"
  ...
});
```

**Constraint na migração** (`20260604000001_meta_channels.sql:101`):
```sql
conversation_id UUID NOT NULL REFERENCES public.meta_conversations(id)
```

**Resultado:** todo envio de mensagem outbound via UI lança:
```
PostgreSQL error 23502: null value in column "conversation_id" of relation "meta_messages"
violates not-null constraint
```

A mensagem **chega ao destinatário** (a chamada à Graph API ocorre antes do INSERT), mas o registro histórico no banco falha. A conversa da UI não mostra a mensagem enviada. O Realtime não dispara. O histórico fica incompleto.

**Impacto:** outbound funciona no dispositivo do destinatário, mas não persiste no histórico. A UI não confirma visualmente o envio.

**Esforço para correção:** 30–45 minutos. Resolver `conversation_id` via query `meta_conversations WHERE contact_external_id = recipient_id AND connection_id = connection_id` antes do INSERT. Criar a conversa se não existir.

---

### T08 — Criação de lead

**Status: FALHOU — GAP ESTRUTURAL**

**Arquivo:** `src/lib/crm-bridge.ts` — sem referência a `meta_conversations`

**Causa exata:** a FASE 27A.4 implementou `meta_conversations` e `meta_messages` como tabelas independentes do sistema de bot flows. O `CRM Bridge` só é acionado pelo evento `flow_completed` do builder (`src/lib/crm-bridge.ts`) — evento que nunca ocorre em conversas Meta diretas.

**Resultado:** nenhuma conversa Meta cria automaticamente um lead no pipeline de CRM. O contato existe em `meta_conversations.contact_name` e `contact_external_id`, mas não em `leads`.

**Impacto:** operação @vemfarias sem CRM automático. Todos os leads de WhatsApp/Instagram/Messenger precisam ser criados manualmente. Inviável em escala.

**Esforço para correção:** médio (3–6h). Criar listener no `store_meta_inbound` ou trigger PostgreSQL que insere em `leads` na primeira mensagem de um contato. Ou criar hook no `useMetaConversations` que chama `createLead()` ao receber conversa nova.

---

### T09 — Inbox (UI)

**Status: PASSOU / PARCIAL**

| Item | Resultado |
|------|-----------|
| `Conversations.tsx` usa versão com Meta channels (não versão mock) | PASSOU |
| `useMetaConversations` importado corretamente | PASSOU |
| `useMetaMessages` importado corretamente | PASSOU |
| `ChannelBadge` importado e usado | PASSOU |
| `MetaConnectModal` importado e usado | PASSOU |
| `sendMetaMessage` importado de `src/channels/meta/connection.ts` | PASSOU |
| `EmptyState` component existe em `src/components/shared/EmptyState.tsx` | PASSOU |
| TypeScript build sem erros nos arquivos Meta | PASSOU (tsc --noEmit limpo) |
| Filtros de plataforma implementados (Todos/WA/IG/Messenger) | PASSOU |
| `markRead` chamado ao selecionar conversa | PASSOU |
| Webhook URL exibida no modal usa `VITE_SUPABASE_PROJECT_ID` | PASSOU |
| Teste funcional no browser | **BLOQUEADO** — sem dados reais (T01 bloqueado) |

**Ressalva:** a versão do `Conversations.tsx` no branch `main` foi sobrescrita pelo merge com versão do Lovable (versão simplificada com `useConversations` do domain). A versão completa com Meta channels está apenas na branch `claude/sweet-meitner-bB77L` e no arquivo local atual. Confirmar qual versão está buildando.

---

### T10 — Multi-tenant

**Status: PASSOU (análise estática)**

**Verificado:**
- `store_meta_inbound` obtém `workspace_id` da tabela `meta_channel_connections` usando `connection_id` — logo o workspace é determinado pela conexão, não pelo payload do webhook
- Cada conexão tem `workspace_id NOT NULL` com FK para `workspaces`
- RLS em `meta_conversations` e `meta_messages` usa `is_workspace_member(workspace_id, auth.uid())`
- O roteamento via `find_meta_connection` busca por `phone_number_id` ou `page_id` com `status = 'active'` — se dois workspaces tiverem o mesmo número (improvável mas possível), retorna apenas o primeiro via `LIMIT 1`

**Ressalva:** se dois workspaces cadastrarem o mesmo `phone_number_id`, o segundo ficará invisível. Sem constraint `UNIQUE(phone_number_id)` na migração.

**Teste em dispositivo:** BLOQUEADO (requer dois workspaces com usuários distintos e sessões simultâneas).

---

### T11 — Realtime

**Status: FALHOU — CONFIGURAÇÃO AUSENTE**

**Arquivo:** `supabase/migrations/20260604000001_meta_channels.sql`

**Causa exata:** a migração não contém:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.meta_conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.meta_messages;
```

Sem isso, o Supabase Realtime não publica mudanças nessas tabelas. As subscrições `postgres_changes` em `useMetaConversations.ts` e `useMetaMessages` se registram com sucesso no client, mas **nunca recebem eventos** — o canal fica silencioso.

**Resultado:** novos inbounds chegam no banco (via webhook), mas a UI não atualiza sem reload manual.

**Impacto:** a feature de "inbox em tempo real" não funciona. Usuário precisa dar F5 para ver novas mensagens. Crítico para operação de atendimento.

**Esforço para correção:** 5 minutos. Adicionar as duas linhas `ALTER PUBLICATION` à migração (ou criar nova migration).

---

### T12 — RLS

**Status: PASSOU (análise estática)**

| Verificação | Resultado |
|------------|-----------|
| `meta_channel_connections`: RLS habilitado | PASSOU |
| `meta_conversations`: RLS habilitado | PASSOU |
| `meta_messages`: RLS habilitado | PASSOU |
| `is_workspace_member` definida em migração anterior | PASSOU |
| `has_workspace_role` definida em migração anterior | PASSOU |
| SELECT policy usa `is_workspace_member` nas 3 tabelas | PASSOU |
| INSERT policy em `meta_messages` usa `WITH CHECK` | PASSOU |
| `store_meta_inbound` é `SECURITY DEFINER` (bypassa RLS para webhook) | PASSOU |
| `find_meta_connection` é `SECURITY DEFINER STABLE` | PASSOU |
| `GRANT EXECUTE` para `service_role` nas duas RPCs | PASSOU |

**Ressalva de segurança:** `meta_channel_connections` expõe `access_token` no SELECT para todos os membros do workspace (política `Members view connections`). Apenas admins deveriam conseguir ler esse campo. Não é bloqueador para beta, mas é risco em produção.

**Teste com curl/JWT real:** BLOQUEADO — rede bloqueia saída para Supabase.

---

## Resumo dos 12 testes

| Teste | Status | Tipo |
|-------|--------|------|
| T01 — Infraestrutura | BLOQUEADO | Requer deploy externo |
| T02 — Hub challenge | BLOQUEADO | Requer deploy + rede |
| T03 — HMAC inválido | **FALHOU** | Bug de segurança |
| T04 — WhatsApp inbound | BLOQUEADO | Requer Meta App + dispositivo |
| T05 — Instagram inbound | BLOQUEADO | Requer Meta App + dispositivo |
| T06 — Messenger inbound | BLOQUEADO | Requer Meta App + dispositivo |
| T07 — Outbound | **FALHOU** | Bug crítico (NOT NULL) |
| T08 — Criação de lead | **FALHOU** | Gap estrutural |
| T09 — Inbox UI | PASSOU / PARCIAL | UI ok, funcional bloqueado |
| T10 — Multi-tenant | PASSOU | Análise estática |
| T11 — Realtime | **FALHOU** | Configuração ausente |
| T12 — RLS | PASSOU | Análise estática |

**Distribuição:** 3 PASSOU · 4 FALHOU · 5 BLOQUEADO

---

## Bugs encontrados

### BUG-01 — HMAC bypass quando secret não configurado
- **Arquivo:** `supabase/functions/meta-webhook/index.ts:168`
- **Severidade:** CRÍTICO (segurança)
- **Causa:** `if (META_APP_SECRET)` — bloco skippado quando env var ausente
- **Impacto:** webhook aceita payloads não autenticados; qualquer pessoa com a URL pode injetar mensagens
- **Esforço:** 15 min

### BUG-02 — `conversation_id: null` viola NOT NULL
- **Arquivo:** `supabase/functions/meta-send/index.ts:129`
- **Severidade:** CRÍTICO (funcional)
- **Causa:** INSERT em `meta_messages` com `conversation_id: null`; constraint `NOT NULL` na migração
- **Impacto:** todo envio outbound falha no INSERT; histórico incompleto; Realtime não dispara
- **Esforço:** 45 min

### BUG-03 — Realtime não funciona (publicação ausente)
- **Arquivo:** `supabase/migrations/20260604000001_meta_channels.sql`
- **Severidade:** ALTO (funcional)
- **Causa:** faltam `ALTER PUBLICATION supabase_realtime ADD TABLE` para as 3 tabelas
- **Impacto:** inbox não atualiza em tempo real; requer reload manual
- **Esforço:** 5 min

### BUG-04 — CRM sem integração com Meta conversations
- **Arquivo:** `src/lib/crm-bridge.ts` (ausência de referência)
- **Severidade:** ALTO (produto)
- **Causa:** gap arquitetural — `meta_conversations` não aciona criação de lead
- **Impacto:** nenhum lead criado automaticamente via WhatsApp/Instagram/Messenger
- **Esforço:** 4–6h

### BUG-05 — `access_token` exposto no SELECT para membros
- **Arquivo:** `supabase/migrations/20260604000001_meta_channels.sql:41-43`
- **Severidade:** MÉDIO (segurança)
- **Causa:** política `Members view connections` expõe todos os campos incluindo `access_token`
- **Impacto:** qualquer membro do workspace pode ler o token via API REST
- **Esforço:** 15 min (criar view sem o campo ou restringir com política de coluna)

---

## Tabela final de prontidão

| Componente | Prontidão | Status | Bloqueadores |
|-----------|-----------|--------|-------------|
| **WhatsApp** | 55% | Código ok, não testado end-to-end | Deploy pendente, HMAC bug, sem dispositivo |
| **Instagram** | 45% | Código ok, não testado end-to-end | Deploy pendente, permissão Meta, sem dispositivo |
| **Messenger** | 45% | Código ok, não testado end-to-end | Deploy pendente, permissão Meta, sem dispositivo |
| **Inbox UI** | 70% | Componentes ok, TypeScript limpo | Dados reais bloqueados; Conversations.tsx sobrescrito no merge |
| **Realtime** | 10% | Código de subscriber ok | Publication ausente na migração — nunca vai funcionar sem correção |
| **Lead Creation** | 0% | Não implementado | Gap estrutural CRM Bridge ↔ meta_conversations |
| **CRM Sync** | 0% | Não implementado | Idem Lead Creation |
| **Multi Tenant** | 75% | RLS e workspace_id corretos | Sem UNIQUE em phone_number_id; teste funcional bloqueado |
| **RLS** | 80% | Políticas corretas | access_token exposto para membros; teste com JWT bloqueado |
| **Webhooks** | 40% | Lógica correta + HMAC bug | Deploy pendente + BUG-01 |

---

## Percentual real de prontidão

**38%**

Cálculo:
- 3 testes PASSOU de 12 = 25% base
- Análise estática positiva em T04, T05, T06, T10, T12 (lógica correta mas não testável) = +13%
- 4 bugs conhecidos descontam do total

A implementação tem a estrutura correta mas não pode ser considerada funcional até os 4 bugs serem corrigidos e o deploy ser executado com testes end-to-end reais.

---

## Bloqueadores absolutos para beta

Para usar em ambiente de testes controlado (não produção):

| # | Bloqueador | Arquivo | Esforço |
|---|-----------|---------|---------|
| B1 | Migração não aplicada no Supabase remoto | `supabase/migrations/20260604000001_meta_channels.sql` | `supabase db push` — 5 min |
| B2 | Edge Functions não deployadas | `supabase/functions/meta-webhook/`, `meta-send/` | `supabase functions deploy` — 10 min |
| B3 | BUG-02: `conversation_id: null` — outbound quebrado | `supabase/functions/meta-send/index.ts:129` | 45 min |
| B4 | BUG-03: Realtime publication ausente — inbox morto | `supabase/migrations/20260604000001_meta_channels.sql` | 5 min (nova migration) |
| B5 | Secrets `META_VERIFY_TOKEN` e `META_APP_SECRET` não configurados | Supabase Dashboard → Secrets | 5 min |
| B6 | Meta App não configurado (sem webhook, sem credenciais) | developers.facebook.com | 2–4h (processo Meta) |

---

## Bloqueadores absolutos para produção

Tudo de beta, mais:

| # | Bloqueador | Arquivo | Esforço |
|---|-----------|---------|---------|
| P1 | BUG-01: HMAC bypass — aceita payloads não autenticados | `supabase/functions/meta-webhook/index.ts:168` | 15 min |
| P2 | BUG-04: Sem criação automática de lead via Meta | `src/lib/crm-bridge.ts` + nova lógica | 4–6h |
| P3 | BUG-05: `access_token` exposto a todos os membros | `supabase/migrations/` (nova migration) | 15 min |
| P4 | Sem `UNIQUE(phone_number_id)` — roteamento ambíguo multi-tenant | `supabase/migrations/20260604000001_meta_channels.sql` | 15 min |
| P5 | Permissão `instagram_manage_messages` aprovada pela Meta | Processo externo Meta App Review | 1–4 semanas |
| P6 | Testes end-to-end reais com dispositivos físicos (T04–T07) | — | 1–2 dias |
| P7 | `Conversations.tsx` verificado no branch `main` (merge sobrescreveu) | `src/pages/Conversations.tsx` | 30 min |

---

## Referências cruzadas

- [META-SMOKE-TEST-PLAN.md](./META-SMOKE-TEST-PLAN.md)
- [META-CHANNELS-IMPLEMENTATION-REPORT.md](./META-CHANNELS-IMPLEMENTATION-REPORT.md)
- [MASTER-ROADMAP.md](./MASTER-ROADMAP.md)
- [OMNICHANNEL-VALIDATION.md](./OMNICHANNEL-VALIDATION.md)
- [VEMFARIAS-OPERATION.md](./VEMFARIAS-OPERATION.md)
