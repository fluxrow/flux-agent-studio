# META PHYSICAL SMOKE TEST REPORT
**FASE 27A.7 — Executado em 2026-06-05**
*Tenta deploy físico + smoke test com Meta real*

---

## STATUS GERAL: BLOQUEADO — PROJETO SUPABASE INACESSÍVEL

**Bloqueador crítico identificado antes de qualquer deploy:**

| Item | Valor |
|------|-------|
| Projeto no `.env` | `bgzczvsmfcnypwqveotx` |
| Projetos acessíveis via MCP desta sessão | `espwkkaldnisriqhxyzt` (Fluxrow — schema diferente), + outros |
| Resultado ao acessar `bgzczvsmfcnypwqveotx` | `HTTP 403 / MCP error -32600: You do not have permission` |
| Rede externa (curl para supabase.co) | `Host not in allowlist` — ambiente remoto bloqueia saída |

O projeto Supabase configurado no `.env` do repositório (`bgzczvsmfcnypwqveotx`) **não está acessível nem via MCP nem via rede HTTP** a partir deste ambiente de execução remota.

O "Fluxrow" acessível via MCP (`espwkkaldnisriqhxyzt`) tem schema completamente diferente: `AIGeneratedText`, `ContentBrief`, `campaigns` — **não é o projeto do flux-agent-studio**.

---

## Resultados dos 10 testes

| # | Teste | Status | Motivo |
|---|-------|--------|--------|
| 1 | Aplicar migrations Supabase | **BLOQUEADO** | Projeto correto inacessível via MCP |
| 2 | Deploy Edge Functions | **BLOQUEADO** | Idem |
| 3 | Configurar secrets | **BLOQUEADO** | Idem |
| 4a | Hub challenge (GET) | **BLOQUEADO** | Edge Function não deployada + rede bloqueada |
| 4b | HMAC inválido rejeitado | **BLOQUEADO** | Idem |
| 4c | HMAC válido aceito | **BLOQUEADO** | Idem |
| 5 | WhatsApp inbound real | **BLOQUEADO** | Dependência cascata de 1–3 |
| 6 | Instagram DM real | **BLOQUEADO** | Dependência cascata de 1–3 |
| 7 | Messenger real | **BLOQUEADO** | Dependência cascata de 1–3 |
| 8 | Multi-tenant RLS real | **BLOQUEADO** | Dependência cascata de 1 |
| 9 | CRM bridge automático | **BLOQUEADO** | Dependência cascata de 1 |

**0 de 10 testes executados. 10 BLOQUEADOS.**

Critério de sucesso mínimo (`WhatsApp inbound → Inbox → Lead → CRM`): **NÃO ATINGIDO.**

---

## O que precisa acontecer (passos manuais exatos)

### Passo 1 — Identificar o projeto correto

O `.env` aponta para `bgzczvsmfcnypwqveotx`. Abrir o Supabase Dashboard e confirmar que este projeto existe e está acessível com a conta usada.

Se o projeto não existir ou for de outra conta, criar um novo projeto e atualizar o `.env`:
```bash
VITE_SUPABASE_PROJECT_ID="<novo-id>"
VITE_SUPABASE_PUBLISHABLE_KEY="<nova-chave>"
VITE_SUPABASE_URL="https://<novo-id>.supabase.co"
```

### Passo 2 — Aplicar todas as migrations

Com o Supabase CLI instalado e logado:
```bash
cd /caminho/para/flux-agent-studio
supabase link --project-ref <PROJECT_ID>
supabase db push
```

Isso aplica em ordem:
1. `20260602114630_*` — schema base (workspaces, bots, leads, sessions, RLS helpers)
2. `20260602114654_*` — complementos
3. `20260602120256_*` — complementos
4. `20260602121119_*` — complementos
5. `20260602122138_*` — complementos
6. `20260604000001_meta_channels.sql` — tabelas Meta + RPCs
7. `20260604000002_meta_realtime.sql` — Realtime publication

Verificar após push:
```sql
-- No SQL Editor do Supabase Dashboard:
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('meta_channel_connections','meta_conversations','meta_messages')
ORDER BY table_name;
-- Esperado: 3 linhas
```

### Passo 3 — Deploy das Edge Functions

```bash
supabase functions deploy meta-webhook --no-verify-jwt
supabase functions deploy meta-send
```

**Nota:** `meta-webhook` precisa `--no-verify-jwt` porque o Meta não envia JWT Supabase nos requests.

### Passo 4 — Configurar Secrets

No Supabase Dashboard → Edge Functions → Secrets, adicionar:

| Secret | Valor |
|--------|-------|
| `META_VERIFY_TOKEN` | `flux_meta_verify` |
| `META_APP_SECRET` | valor do Meta App Dashboard → Settings → Basic → App Secret |

Ou via CLI:
```bash
supabase secrets set META_VERIFY_TOKEN=flux_meta_verify
supabase secrets set META_APP_SECRET=<seu_app_secret>
```

### Passo 5 — Testar Hub Challenge

```bash
curl "https://<PROJECT_ID>.supabase.co/functions/v1/meta-webhook\
?hub.mode=subscribe\
&hub.verify_token=flux_meta_verify\
&hub.challenge=TESTE123"
# Esperado: body = TESTE123, HTTP 200
```

### Passo 6 — Testar HMAC inválido

```bash
curl -X POST "https://<PROJECT_ID>.supabase.co/functions/v1/meta-webhook" \
  -H "Content-Type: application/json" \
  -H "x-hub-signature-256: sha256=invalido" \
  -d '{"object":"test","entry":[]}'
# Esperado: HTTP 401
```

### Passo 7 — Configurar Meta App Dashboard

1. Acessar [developers.facebook.com](https://developers.facebook.com)
2. Criar ou usar App existente com produto "WhatsApp" adicionado
3. WhatsApp → Configuration → Webhook:
   - URL: `https://<PROJECT_ID>.supabase.co/functions/v1/meta-webhook`
   - Verify Token: `flux_meta_verify`
   - Clicar "Verify and Save"
4. Subscrever campo: `messages`
5. Anotar: `Phone Number ID`, `Access Token` (para usar no app)

### Passo 8 — Conectar canal no app

1. Abrir o app → Conversas → botão `+`
2. MetaConnectModal → aba WhatsApp
3. Preencher `Access Token` e `Phone Number ID`
4. Salvar

### Passo 9 — Teste WhatsApp físico

1. No Meta App → WhatsApp → API Setup: adicionar número pessoal como recipient de teste
2. Enviar mensagem "teste smoke" para o número de sandbox
3. Verificar em 30s:
   - Supabase → Table Editor → `meta_conversations` → nova linha
   - Supabase → Table Editor → `meta_messages` → `direction = 'inbound'`
   - App → Conversas → conversa aparece com badge WhatsApp
   - App → Leads → lead criado com source `whatsapp`

### Passo 10 — Verificar Realtime

Com o app aberto em duas abas simultâneas, enviar segunda mensagem pelo celular. A mensagem deve aparecer na Aba 1 sem reload em ≤ 5 segundos.

---

## Diagnóstico do bloqueador raiz

O ambiente de execução remota (Claude Code na web) **não tem acesso de rede de saída** para `supabase.co`. Esta é uma restrição do ambiente de execução, não do código. O código está correto e pronto para deploy.

Para resolver:

**Opção A (recomendada):** executar os comandos `supabase` localmente na máquina do usuário, onde há acesso à rede e às credenciais do projeto correto.

**Opção B:** conceder acesso MCP ao projeto `bgzczvsmfcnypwqveotx` (ou criar novo projeto dentro da conta acessível pelo MCP) e re-executar esta fase.

---

## Estado atual do código (verificado na FASE 27A.6)

Todos os 4 bugs foram corrigidos. O código está pronto para deploy:

| Arquivo | Estado |
|---------|--------|
| `supabase/migrations/20260604000001_meta_channels.sql` | Pronto — 3 tabelas + RLS + 2 RPCs |
| `supabase/migrations/20260604000002_meta_realtime.sql` | Pronto — Realtime publication |
| `supabase/functions/meta-webhook/index.ts` | Pronto — HMAC fail-closed |
| `supabase/functions/meta-send/index.ts` | Pronto — conversation_id resolvido |
| `src/hooks/useMetaLeadBridge.ts` | Pronto — CRM automático |
| TypeScript build | Limpo — sem erros |

---

## Referências cruzadas

- [META-SMOKE-TEST-FIXES.md](./META-SMOKE-TEST-FIXES.md)
- [META-SMOKE-TEST-REPORT.md](./META-SMOKE-TEST-REPORT.md)
- [META-CHANNELS-IMPLEMENTATION-REPORT.md](./META-CHANNELS-IMPLEMENTATION-REPORT.md)
- [MASTER-ROADMAP.md](./MASTER-ROADMAP.md)
