# SETTINGS — SMOKE TEST REPORT

Data: 2026-06-08
Escopo: `/settings` (todas as abas) + painéis adjacentes (Contas conectadas, Credenciais, Compliance, Readiness, Audit, Consent, Tracking Destinations, Sistema).

Status global: **PARTIAL** — UI completa e funcional, mas a maioria dos backends ainda é local (localStorage) em vez de Supabase. Não há erros visuais; há mockups disfarçados de "real".

Legenda:
- ✅ REAL — persiste em Supabase / faz chamada real
- ⚠️ LOCAL — funciona, mas só em `localStorage` do navegador
- ❌ MOCK — não faz nada além de toast/visual
- 🟦 OK — é intencionalmente "Em breve"

---

## 1. Perfil
| Item | Status | Observação |
|---|---|---|
| Avatar / nome / e-mail | ✅ REAL | Vem de `useAuth()` (Supabase auth) |
| Botão "Salvar alterações" | ❌ MOCK | `disabled`, sem handler. Rotular como "Em breve" já está OK. |
| Logout | ✅ REAL | `signOut()` real + audit log local |

**Ação sugerida:** implementar update real de `full_name` via `auth.updateUser({ data: { full_name } })`.

---

## 2. Workspace
| Item | Status | Observação |
|---|---|---|
| Cartão "Modo de persistência" | ✅ REAL | Mostra `USE_SUPABASE` e workspace real |
| Nome do workspace / slug | ⚠️ LOCAL | Inputs desabilitados — apenas leitura |
| Botão "Carregar demo" | ✅ REAL | Roda `seedDemoData()` que escreve no Supabase |

**Ação sugerida:** habilitar renomear workspace (update em `workspaces`).

---

## 3. Equipe — 🟦 OK ("Em breve")
Nada implementado. Esperado.

## 4. Plano — 🟦 OK ("Em breve")
## 5. API & Webhooks — 🟦 OK ("Em breve")

---

## 6. Notificações
| Item | Status | Observação |
|---|---|---|
| 5 switches de preferência | ❌ MOCK | `defaultChecked` hardcoded, sem persistência, sem efeito. Nenhum estado é salvo. |

**Ação sugerida:** persistir em `localStorage` no mínimo, ou criar tabela `user_notification_prefs`.

---

## 7. Contas conectadas (Connected Accounts)
| Item | Status | Observação |
|---|---|---|
| Lista de contas (Instagram/Facebook/WhatsApp/Telegram/GBP) | ⚠️ LOCAL | `oauthManager` é totalmente em memória + localStorage |
| Botão "Conectar" | ❌ MOCK | Simula handshake — não abre OAuth real |
| Botão "Reconectar / Desconectar" | ❌ MOCK | Só muda status local |
| Vincular bot ↔ conta | ⚠️ LOCAL | Vínculo só existe em memória |

**⚠️ ATENÇÃO:** O título do painel diz "providers reais virão na próxima fase" — está honesto, mas o usuário vê isso como configuração funcionando. **Não há OAuth real implementado para Instagram/Facebook/Telegram/GBP.** O fluxo Meta real existe separadamente em `/channels` (via `meta-webhook` edge function), mas esse painel **não** está conectado a ele.

**Ação sugerida URGENTE:** ou esconder este painel atrás de feature flag, ou plugar no `meta_connections` real, ou marcar claramente como "Demo / Mockup".

---

## 8. Tracking Destinations
| Item | Status | Observação |
|---|---|---|
| Lista de destinations (Meta/Google) | ⚠️ LOCAL | Persistido em `localStorage`, sem sync server-side |
| Adicionar/remover destination | ⚠️ LOCAL | Funciona client-side; dispatch real depende do tracking engine |
| Teste de evento | ❌ MOCK | Não envia para a API real do Meta/Google sem credenciais reais |

---

## 9. Compliance
| Item | Status | Observação |
|---|---|---|
| Edição de Privacy / Terms / Data Deletion | ⚠️ LOCAL | Persistido em `localStorage` por workspace |
| Páginas públicas (`/privacy`, `/terms`, `/data-deletion`) | ✅ REAL | Renderizam o conteúdo editado |
| Versionamento | ⚠️ LOCAL | Versão incrementa, mas só no navegador |

**⚠️ CRÍTICO:** Se o usuário trocar de navegador, os documentos publicados somem. Isso **vai falhar revisão de app Meta/Google**. Precisa migrar para tabela `compliance_documents` no Supabase.

---

## 10. Credenciais
| Item | Status | Observação |
|---|---|---|
| Lista de credenciais (mascaradas) | ⚠️ LOCAL | Metadados em localStorage, valor real em Secret Vault em memória |
| Adicionar credencial | ⚠️ LOCAL | Toast diz "valor será movido para Supabase Secrets na próxima integração" — ou seja, **não está no Supabase Secrets ainda** |
| Validar credencial | ❌ MOCK | Apenas flipa status para "valid" |
| Rotacionar | ⚠️ LOCAL | Só atualiza valor no vault em memória |

**⚠️ ATENÇÃO:** Como agora usamos **Lovable AI Gateway** (server-side via edge function `lovable-ai`), credenciais OpenAI/Anthropic/Gemini não são mais necessárias para uso básico. A aba pode confundir o usuário. Recomendado: banner "Lovable AI está ativo — credenciais externas só são necessárias para uso avançado/BYOK".

---

## 11. Consent (Cookies)
| Item | Status | Observação |
|---|---|---|
| Preferências de cookies | ⚠️ LOCAL | localStorage por workspace |
| Banner no `index.html` | ❓ A verificar | Confirmar se o banner LGPD lê este estado |

---

## 12. Auditoria
| Item | Status | Observação |
|---|---|---|
| Log de ações (`recordAudit`) | ⚠️ LOCAL | Tudo em localStorage |
| Filtros / export | ⚠️ LOCAL | Funciona com dados locais |

**Ação sugerida:** mover para tabela `audit_logs` no Supabase (com RLS por workspace).

---

## 13. Readiness
| Item | Status | Observação |
|---|---|---|
| Checklist de readiness | ✅ REAL | Calcula a partir do estado real (bots, leads, channels, etc.) |
| Recomendação de IA | ✅ CORRIGIDO | Antes dizia "Adicione provedor"; agora reconhece Lovable AI |

---

## 14. Sistema (System Health)
| Item | Status | Observação |
|---|---|---|
| Persistence info, USE_SUPABASE, workspace ativo | ✅ REAL | |
| Probes de Supabase | ✅ REAL | Faz `select` real em tabelas |
| Repositórios (bots, leads, channels…) | ✅ REAL | |

---

## Resumo executivo

| Categoria | Tabs | Status |
|---|---|---|
| ✅ Real | Perfil (parcial), Workspace, Readiness, Sistema | 4 |
| ⚠️ Local-only (localStorage) | Contas conectadas, Tracking Destinations, Compliance, Credenciais, Consent, Auditoria | 6 |
| ❌ Mock puro | Notificações | 1 |
| 🟦 Em breve (intencional) | Equipe, Plano, API | 3 |

### Top 5 ações prioritárias

1. **Compliance documents → Supabase** (bloqueia review Meta/Google).
2. **Audit logs → Supabase** (requisito LGPD/SOC2).
3. **Connected Accounts → ou esconder, ou plugar no `meta_connections` real** (hoje engana o usuário).
4. **Credenciais → mover para Supabase Vault / banner Lovable AI** (reduz confusão).
5. **Notificações → ao menos persistir local** (hoje os switches "esquecem" ao recarregar).

### Correções já aplicadas neste passo
- ✅ `has_ai` na health score / readiness agora reconhece Lovable AI Gateway como ativo.
- ✅ Recomendação no Dashboard não pede mais "Adicionar provedor de IA".
