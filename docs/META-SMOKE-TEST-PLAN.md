# META SMOKE TEST PLAN
**FASE 27A.4C — Validação da implementação `ffde1bf`**
*Criado em: 2026-06-04*

> Documento de teste. Não implementar. Não alterar código.
> Base: META-CHANNELS-IMPLEMENTATION-REPORT.md · MASTER-ROADMAP.md · OMNICHANNEL-VALIDATION.md · VEMFARIAS-OPERATION.md

---

## Pré-condições obrigatórias

Nenhum teste abaixo é válido se estas condições não estiverem satisfeitas:

| # | Condição | Como verificar |
|---|---------|---------------|
| P1 | Migração `20260604000001_meta_channels.sql` aplicada no projeto Supabase remoto | Supabase Dashboard → Database → Tables: `meta_channel_connections`, `meta_conversations`, `meta_messages` devem existir |
| P2 | Edge Functions `meta-webhook` e `meta-send` deployadas | Supabase Dashboard → Edge Functions → listar as duas |
| P3 | Secrets `META_VERIFY_TOKEN=flux_meta_verify` e `META_APP_SECRET=<valor>` configurados | Supabase Dashboard → Edge Functions → Secrets |
| P4 | `VITE_SUPABASE_PROJECT_ID` setado na build do frontend | A Webhook URL exibida no MetaConnectModal deve mostrar o project ID correto |
| P5 | Pelo menos um workspace criado e autenticado no app | Login no app → workspace ativo |
| P6 | Meta App criado em [developers.facebook.com](https://developers.facebook.com) com webhook apontando para a URL da Edge Function | Meta App Dashboard → Webhooks |

---

## Credenciais necessárias por plataforma

### WhatsApp Business API (Cloud API)
| Credencial | Onde obter | Observação |
|-----------|-----------|-----------|
| `access_token` | Meta Business Suite → System User → Generate Token | Permissão `whatsapp_business_messaging` obrigatória |
| `phone_number_id` | Meta App Dashboard → WhatsApp → Getting Started → Phone Number ID | Número de sandbox disponível sem aprovação |
| `META_APP_SECRET` | Meta App Dashboard → Settings → Basic → App Secret | Necessário para HMAC-SHA256 |
| `META_VERIFY_TOKEN` | Valor livre — deve ser `flux_meta_verify` (já configurado) | |
| Número de teste | Qualquer número adicionado como "recipient" no sandbox | Sandbox não precisa de aprovação de negócio |

### Instagram Messaging
| Credencial | Onde obter | Observação |
|-----------|-----------|-----------|
| `access_token` | Meta Business Suite → System User → Generate Token | Permissão `instagram_manage_messages` + conta Business/Creator conectada à Page |
| `page_id` | Facebook Page → About → Page ID | A Page deve estar conectada à conta Instagram |
| `ig_user_id` | Graph API: `GET /me?fields=instagram_business_account` com token da Page | Opcional no formulário de conexão |
| Conta de teste | Segunda conta Instagram pessoal que envie DM para a conta Business | |

### Messenger
| Credencial | Onde obter | Observação |
|-----------|-----------|-----------|
| `access_token` | Mesme token da Page usada para Instagram | Permissão `pages_messaging` |
| `page_id` | Facebook Page → About → Page ID | Mesma Page do Instagram |
| Conta de teste | Qualquer conta Facebook que envie mensagem para a Page | |

### Webhook (comum às três plataformas)
| Campo | Valor |
|-------|-------|
| URL | `https://<SUPABASE_PROJECT_ID>.supabase.co/functions/v1/meta-webhook` |
| Verify Token | `flux_meta_verify` |
| Campos assinados (WA) | `messages` |
| Campos assinados (IG) | `messages` |
| Campos assinados (Messenger) | `messages` |

---

## Ordem de execução dos testes

```
T01 → T02 → T03 → T04 → T05 → T06 → T07 → T08 → T09 → T10 → T11 → T12
  ↑                ↑                                   ↑          ↑
Infra/deploy    Conexão                           Multi-tenant  RLS
```

Não pular etapas. Um teste que falha pode invalidar os subsequentes.

---

## T01 — Verificação de infraestrutura

**Objetivo:** confirmar que a migração e as Edge Functions estão disponíveis.

**Passos:**
1. Abrir Supabase Dashboard → Database → Table Editor
2. Verificar existência das tabelas: `meta_channel_connections`, `meta_conversations`, `meta_messages`
3. Verificar índices: `idx_meta_conn_workspace`, `idx_meta_conn_phone`, `idx_meta_conn_page`
4. Verificar RPC: Database → Functions → buscar `store_meta_inbound` e `find_meta_connection`
5. Abrir Edge Functions → verificar `meta-webhook` e `meta-send` com status `Active`
6. Em Edge Functions → Secrets → confirmar `META_VERIFY_TOKEN` e `META_APP_SECRET` existem

**Critério de aprovação:** todas as 3 tabelas existem, 2 RPCs existem, 2 Edge Functions ativas, 2 secrets configurados.

**Critério de reprovação:** qualquer item ausente. Parar e resolver antes de continuar.

**Evidência esperada:** screenshot do Dashboard mostrando os itens listados acima.

---

## T02 — Verificação do hub challenge (GET webhook)

**Objetivo:** confirmar que a Edge Function responde corretamente à verificação do Meta.

**Passos:**
1. Abrir terminal (ou Postman/Insomnia)
2. Executar:
   ```bash
   curl -s "https://<PROJECT_ID>.supabase.co/functions/v1/meta-webhook\
   ?hub.mode=subscribe\
   &hub.verify_token=flux_meta_verify\
   &hub.challenge=TEST_CHALLENGE_12345"
   ```
3. Verificar resposta

**Critério de aprovação:** resposta HTTP 200 com body `TEST_CHALLENGE_12345` (echo do challenge).

**Critério de reprovação:**
- HTTP 403 → `META_VERIFY_TOKEN` não configurado ou incorreto
- HTTP 500 → Edge Function não deployada corretamente
- Timeout → Edge Function offline

**Evidência esperada:** output do curl mostrando `TEST_CHALLENGE_12345`.

---

## T03 — Verificação de assinatura HMAC inválida

**Objetivo:** confirmar que o webhook rejeita payloads sem assinatura válida.

**Passos:**
1. Executar POST com assinatura inválida:
   ```bash
   curl -s -X POST \
     "https://<PROJECT_ID>.supabase.co/functions/v1/meta-webhook" \
     -H "Content-Type: application/json" \
     -H "x-hub-signature-256: sha256=invalido" \
     -d '{"object":"whatsapp_business_account","entry":[]}'
   ```
2. Verificar resposta

**Critério de aprovação:** HTTP 401 com body `Invalid signature`.

**Critério de reprovação:** HTTP 200 (assinatura não verificada — falha de segurança crítica).

**Evidência esperada:** HTTP 401.

---

## T04 — Como testar WhatsApp real (inbound)

**Objetivo:** validar que mensagem enviada de número WhatsApp real chega no banco e na UI.

**Pré-requisito:** conexão WhatsApp criada via MetaConnectModal com `phone_number_id` e `access_token` válidos.

**Passos:**
1. No app: Configurações → Canais (ou Conversas → botão `+`) → MetaConnectModal → aba WhatsApp
2. Preencher: Display Name = "WA Teste", Access Token, Phone Number ID
3. Clicar "Salvar conexão" → verificar registro em `meta_channel_connections` no Supabase
4. No Meta App Dashboard → WhatsApp → Webhook: registrar URL + Verify Token → clicar "Verify and Save"
5. Com o número de sandbox configurado no Meta App, enviar mensagem "Olá teste" para o número cadastrado
6. No Supabase → Table Editor → `meta_conversations`: aguardar linha aparecer (10–30s)
7. No Supabase → Table Editor → `meta_messages`: verificar mensagem com `direction = 'inbound'`
8. Na UI do app → página Conversas: verificar conversa aparece na lista

**Critério de aprovação:**
- Linha em `meta_conversations` com `platform = 'whatsapp'`
- Linha em `meta_messages` com `direction = 'inbound'`, `message_text = 'Olá teste'`
- Conversa visível na UI

**Critério de reprovação:**
- Nenhuma linha criada → webhook não chegou ou HMAC falhou
- Linha em `meta_conversations` mas não em `meta_messages` → `store_meta_inbound` falhou na segunda inserção
- UI não atualiza → Realtime não está habilitado para a tabela

**Evidência esperada:** screenshot do Supabase Table Editor + screenshot da UI com a conversa.

---

## T05 — Como testar Instagram DM real (inbound)

**Objetivo:** validar que DM enviado para conta Instagram Business chega no banco e na UI.

**Pré-requisito:** conta Instagram Business conectada a uma Facebook Page; Page conectada ao Meta App; permissão `instagram_manage_messages` aprovada.

**Passos:**
1. No app → MetaConnectModal → aba Instagram
2. Preencher: Display Name = "IG Teste", Access Token (Page token), Page ID
3. Clicar "Salvar conexão"
4. No Meta App Dashboard → Instagram → Webhooks: habilitar `messages` + verificar URL
5. Com conta pessoal diferente, acessar o perfil Instagram Business e enviar DM: "Oi quero saber sobre mentoria"
6. Aguardar 10–30s → verificar em `meta_conversations` e `meta_messages`
7. Verificar na UI

**Critério de aprovação:**
- `meta_conversations.platform = 'instagram'`
- `meta_messages.direction = 'inbound'`, `message_text = 'Oi quero saber sobre mentoria'`
- `contact_external_id` preenchido com o PSID do remetente

**Critério de reprovação:**
- Nenhuma linha → webhook Instagram não configurado ou permissão negada
- HTTP 403 no webhook → token expirado ou sem permissão `instagram_manage_messages`

**Evidência esperada:** logs da Edge Function (Supabase → Edge Functions → Logs) + screenshot das tabelas.

---

## T06 — Como testar Messenger real (inbound)

**Objetivo:** validar que mensagem enviada para Facebook Page via Messenger chega no banco.

**Pré-requisito:** Facebook Page conectada ao Meta App; permissão `pages_messaging` ativa.

**Passos:**
1. No app → MetaConnectModal → aba Messenger
2. Preencher: Display Name = "Messenger Teste", Access Token (Page token), Page ID
3. Clicar "Salvar conexão"
4. No Meta App Dashboard → Messenger → Webhooks: habilitar `messages` + verificar URL
5. Com conta Facebook pessoal diferente, acessar a Page e clicar "Enviar mensagem" → digitar "Teste Messenger"
6. Aguardar 10–30s → verificar tabelas

**Critério de aprovação:**
- `meta_conversations.platform = 'messenger'`
- `meta_messages.direction = 'inbound'`

**Critério de reprovação:** comportamento idêntico ao T05.

**Evidência esperada:** logs da Edge Function + screenshot das tabelas.

---

## T07 — Como validar outbound (envio de mensagem)

**Objetivo:** confirmar que mensagem enviada pela UI chega no dispositivo do contato.

**Passos:**
1. Na UI → Conversas → selecionar conversa criada em T04/T05/T06
2. Digitar "Mensagem de teste outbound" no campo de texto
3. Pressionar Enter ou clicar Send
4. Verificar em `meta_messages`: nova linha com `direction = 'outbound'`
5. No dispositivo do contato (WhatsApp/Instagram/Messenger): verificar recebimento da mensagem
6. Verificar logs da Edge Function `meta-send` no Supabase

**Critério de aprovação:**
- `meta_messages` com `direction = 'outbound'`, `message_text = 'Mensagem de teste outbound'`
- Mensagem aparece no dispositivo do contato
- `meta-send` retornou HTTP 200 para a UI

**Critério de reprovação:**
- UI exibe erro → `meta-send` falhou (verificar logs)
- Linha criada em `meta_messages` mas mensagem não chega → token inválido ou expirado
- HTTP 400 da Graph API → `recipient_id` incorreto ou conta não é destinatário válido

**Evidência esperada:** screenshot da UI enviando + screenshot no dispositivo destinatário.

---

## T08 — Como validar criação de lead

**Observação crítica:** a implementação FASE 27A.4 cria `meta_conversations` e `meta_messages`, mas **não cria leads automaticamente** na tabela `leads` do CRM. A criação de lead existente é ativada pelo `CRM Bridge` (`src/lib/crm-bridge.ts`) via evento `flow_completed` do bot flow — o que não ocorre em conversas Meta diretas.

**Escopo deste teste:** verificar se o contato Meta é identificável e se a criação manual de lead é possível.

**Passos:**
1. Verificar em `meta_conversations` após T04/T05/T06: `contact_external_id` e `contact_name` preenchidos
2. No Supabase → executar query:
   ```sql
   SELECT contact_name, contact_external_id, platform, unread, preview
   FROM meta_conversations
   ORDER BY last_message_at DESC
   LIMIT 5;
   ```
3. Verificar se o campo `contact_name` está populado (vem do profile WhatsApp ou sender.name IG/Messenger)
4. Verificar se `preview` contém o texto da primeira mensagem (truncado em 120 chars)

**Critério de aprovação:** `contact_name` ≠ `null` e ≠ `'Desconhecido'` para WA (onde o nome do perfil vem na API); `preview` contém texto da mensagem.

**Critério de reprovação:** `contact_name = 'Desconhecido'` para WhatsApp → o campo `contacts[].profile.name` não estava presente no payload.

**Gap documentado:** integração CRM automática (Meta conversation → Lead no pipeline) ainda não implementada. Está em P1 do MASTER-ROADMAP.

**Evidência esperada:** output da query SQL acima.

---

## T09 — Como validar inbox (UI)

**Objetivo:** confirmar que a lista de conversas na UI reflete os dados do banco.

**Passos:**
1. Abrir app → página Conversas
2. Verificar que as conversas criadas em T04/T05/T06 aparecem na lista
3. Verificar que `ChannelBadge` exibe o ícone/cor correto por plataforma:
   - WhatsApp: verde `#25D366`
   - Instagram: rosa `#E1306C`
   - Messenger: azul `#0084FF`
4. Verificar que o contador de `unread` aparece na conversa (deve ser ≥ 1 após T04)
5. Clicar na conversa WhatsApp → verificar que `ChatPanel` abre com as mensagens corretas
6. Testar filtro de plataforma: clicar "WhatsApp" → apenas conversas WA devem aparecer
7. Testar busca: digitar parte do nome do contato → conversa filtrada
8. Clicar em conversa → verificar que `unread` zera (chamada `markRead`)

**Critério de aprovação:** todos os itens 2–8 funcionam conforme descrito.

**Critério de reprovação:**
- Lista vazia com dados no banco → `useMetaConversations` não está lendo do workspace correto
- Badge não aparece → import de `ChannelBadge` com erro
- `unread` não zera → `markRead` não foi chamado ou Realtime não atualizou

**Evidência esperada:** screenshot da página Conversas com pelo menos uma conversa de cada plataforma testada.

---

## T10 — Como validar multi-tenant

**Objetivo:** confirmar que conversas de workspace A não aparecem para workspace B.

**Passos:**
1. Criar segundo workspace (ou usar conta diferente com workspace distinto)
2. Workspace A: criar conexão WhatsApp com `phone_number_id` = A
3. Workspace B: criar conexão WhatsApp com `phone_number_id` = B (ou sem conexão)
4. Enviar mensagem para o número de A (gera conversa em workspace A)
5. Logar como usuário do workspace B → abrir Conversas
6. Verificar que a conversa criada em workspace A **não aparece** no workspace B
7. Verificar via SQL (como superuser):
   ```sql
   SELECT workspace_id, platform, contact_name
   FROM meta_conversations
   ORDER BY created_at DESC LIMIT 10;
   ```
   Confirmar que `workspace_id` está correto para cada conversa.

**Critério de aprovação:** workspace B não vê conversas de workspace A. Query SQL mostra `workspace_id` correto em todas as linhas.

**Critério de reprovação:** conversa de workspace A aparece para usuário de workspace B → RLS com falha ou `workspace_id` não sendo setado corretamente no `store_meta_inbound`.

**Evidência esperada:** screenshot da UI de workspace B (lista vazia ou apenas suas próprias conversas) + resultado da query SQL.

---

## T11 — Como validar Realtime

**Objetivo:** confirmar que novas mensagens aparecem na UI sem reload.

**Passos:**
1. Abrir app → Conversas em duas abas do navegador (mesmo workspace, mesmo usuário)
2. Na Aba 1: selecionar a conversa do contato de teste (criada em T04)
3. Do dispositivo de teste: enviar nova mensagem "Teste realtime agora"
4. Na Aba 1: verificar que a mensagem aparece no `ChatPanel` sem nenhum reload (máx 5s)
5. Na Aba 2: verificar que a conversa sobe para o topo da lista com novo `unread` +1

**Critério de aprovação:**
- Mensagem aparece em ≤ 5 segundos nas duas abas
- Contador `unread` incrementa na Aba 2 sem reload

**Critério de reprovação:**
- Mensagem não aparece sem reload → Realtime não está habilitado para `meta_conversations` / `meta_messages` no Supabase
- Aparece com delay > 30s → verificar se Realtime está ativado no projeto

**Como habilitar Realtime se não estiver ativo:**
```
Supabase Dashboard → Database → Replication → Tables
Habilitar para: meta_conversations, meta_messages
```

**Evidência esperada:** vídeo ou sequência de screenshots com timestamp mostrando a mensagem chegando em tempo real.

---

## T12 — Como validar RLS

**Objetivo:** confirmar que um usuário autenticado não consegue acessar dados de outro workspace via API direta.

**Passos:**
1. Obter o `anon key` do projeto Supabase (publishable, seguro para usar neste teste)
2. Autenticar como usuário do workspace B:
   ```bash
   # Substituir pelo token JWT real do usuário B
   USER_B_JWT="eyJ..."
   ```
3. Tentar ler `meta_conversations` sem filtro (deve retornar apenas do workspace B):
   ```bash
   curl "https://<PROJECT_ID>.supabase.co/rest/v1/meta_conversations?select=*" \
     -H "Authorization: Bearer $USER_B_JWT" \
     -H "apikey: <ANON_KEY>"
   ```
4. Verificar que o resultado contém apenas conversas do workspace B
5. Tentar ler `meta_channel_connections`:
   ```bash
   curl "https://<PROJECT_ID>.supabase.co/rest/v1/meta_channel_connections?select=*" \
     -H "Authorization: Bearer $USER_B_JWT" \
     -H "apikey: <ANON_KEY>"
   ```
6. Verificar que `access_token` **não está retornando** no response (campo sensível) — ou que apenas conexões do workspace B aparecem

**Critério de aprovação:**
- Query retorna apenas registros do workspace do usuário autenticado
- Nenhum registro de outros workspaces visível

**Critério de reprovação:**
- Registros de outros workspaces visíveis → `is_workspace_member()` não está funcionando ou RLS não está habilitado
- `access_token` exposto em queries de usuário não-admin → revisar políticas de SELECT

**Observação de segurança:** a política atual permite SELECT para todos os membros (`is_workspace_member`). Considerar remover `access_token` do SELECT de membros comuns (apenas admins deveriam ver tokens).

**Evidência esperada:** output do curl mostrando apenas registros do workspace correto.

---

## Checklist consolidado

```
PRÉ-CONDIÇÕES
[ ] P1 — Migração SQL aplicada (3 tabelas existem)
[ ] P2 — Edge Functions deployadas (meta-webhook, meta-send)
[ ] P3 — Secrets configurados (META_VERIFY_TOKEN, META_APP_SECRET)
[ ] P4 — VITE_SUPABASE_PROJECT_ID correto no frontend
[ ] P5 — Workspace criado e autenticado
[ ] P6 — Meta App configurado com webhook URL

INFRAESTRUTURA
[ ] T01 — Tabelas, RPCs, Edge Functions e Secrets verificados
[ ] T02 — Hub challenge responde 200 com echo do challenge
[ ] T03 — Payload inválido retorna 401

PLATAFORMAS (inbound)
[ ] T04 — WhatsApp: mensagem inbound chega no banco e na UI
[ ] T05 — Instagram: DM inbound chega no banco e na UI
[ ] T06 — Messenger: mensagem inbound chega no banco e na UI

OUTBOUND
[ ] T07 — Mensagem enviada pela UI chega no dispositivo do contato

DADOS
[ ] T08 — contact_name e preview populados corretamente

UI/UX
[ ] T09 — Inbox: badges, filtros, busca, markRead funcionam

ISOLAMENTO
[ ] T10 — Multi-tenant: workspace B não vê dados do workspace A

TEMPO REAL
[ ] T11 — Realtime: nova mensagem aparece sem reload em ≤ 5s

SEGURANÇA
[ ] T12 — RLS: usuário não acessa dados de outro workspace
```

---

## Critérios globais de aprovação

O smoke test é aprovado quando:
- Todos os 12 testes passam nos critérios individuais
- Nenhum T03 ou T12 falha (são critérios de segurança — falha = bloqueador absoluto)
- T04 passa (WhatsApp é o canal principal do @vemfarias)

## Critérios globais de reprovação

O smoke test é reprovado (e o deploy não deve ir para produção) se:
- T03 falha (HMAC não verificado — vulnerabilidade crítica)
- T12 falha (RLS não isolando workspaces — vulnerabilidade crítica)
- T01 falha (infraestrutura ausente — nada mais pode ser testado)
- T04 falha com mensagens não chegando no banco (pipeline inbound quebrado)

## Gaps conhecidos (não são falhas deste smoke test)

| Gap | Status | Doc de referência |
|-----|--------|------------------|
| Criação automática de lead no CRM após conversa Meta | Não implementado | MASTER-ROADMAP.md Sprint 2 |
| Handoff queue com fila de atendentes | Não implementado | OMNICHANNEL-VALIDATION.md item 8 |
| Identity resolution cross-canal (mesma pessoa em WA + IG) | Não implementado | OMNICHANNEL-VALIDATION.md item 3 |
| Follow-up automático | Não implementado | VEMFARIAS-OPERATION.md Bloqueador 3 |

---

## Referências cruzadas

- [META-CHANNELS-IMPLEMENTATION-REPORT.md](./META-CHANNELS-IMPLEMENTATION-REPORT.md)
- [MASTER-ROADMAP.md](./MASTER-ROADMAP.md)
- [OMNICHANNEL-VALIDATION.md](./OMNICHANNEL-VALIDATION.md)
- [VEMFARIAS-OPERATION.md](./VEMFARIAS-OPERATION.md)
- [30-DAY-EXECUTION-PLAN.md](./30-DAY-EXECUTION-PLAN.md)
