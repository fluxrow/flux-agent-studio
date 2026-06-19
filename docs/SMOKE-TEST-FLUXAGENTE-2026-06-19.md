# Smoke Test FluxAgente — 2026-06-19

Relatório completo do smoke test ponta-a-ponta executado em 19/06/2026,
incluindo auditoria de código, varredura E2E com Playwright, auditoria de
acessibilidade e os fixes críticos aplicados nesta mesma rodada.

## 1. Sumário executivo

| Área | Status | Observação |
|---|---|---|
| Renderização das 21 rotas protegidas | ✅ OK | Todas carregam < 2s, sem 4xx/5xx |
| Console errors | ✅ Zerado pós-fix | 1 página quebrava (`/conversations`) — corrigida |
| Refresh ao trocar de aba (bug reportado) | ✅ Corrigido | `QueryClient` configurado com defaults sãos |
| Persistência de estado entre navegações | 🟡 Parcial | `/settings` agora persiste via URL; demais páginas no backlog |
| Acessibilidade (botões icon-only) | ✅ Corrigido | 10 botões receberam `aria-label` |
| React Router v6 future-flag warnings | 🟡 Backlog | Apenas warnings; migração simples para P2 |

**Veredito go-live:** infra estável, sem bloqueador na navegação principal.
Backlog de polimento listado na seção 7.

## 2. Como reproduzir o smoke

Script Playwright headless rodando contra o dev server em `localhost:8080`,
autenticado restaurando a sessão Supabase no `localStorage` da origem antes
de visitar as rotas.

- Script: `/tmp/browser/fluxagente-smoke/run.py`
- Output bruto: `docs/smoke-2026-06-19/report.json`
- Screenshots-chave: `docs/smoke-2026-06-19/route_*.png`

Para cada rota o script mede TTI aproximado (`DOMContentLoaded` + 1.2s de
settle), coleta `console.error`, respostas HTTP ≥ 400 e tira screenshot.

## 3. Resultado por rota (21 rotas protegidas)

Antes do fix, **1 rota quebrava** (`/conversations`). Pós-fix: **0 erros**.

| Rota | TTI (ms) | Console errs | HTTP ≥400 |
|---|---:|---:|---:|
| /dashboard | 1892 | 0 | 0 |
| /bots | 1904 | 0 | 0 |
| /leads | 1842 | 0 | 0 |
| /conversations | 1895 | **0** (era 1) | 0 |
| /analytics | 1825 | 0 | 0 |
| /templates | 1938 | 0 | 0 |
| /variables | 1895 | 0 | 0 |
| /tracking | 1846 | 0 | 0 |
| /attribution | 1884 | 0 | 0 |
| /revenue | 1881 | 0 | 0 |
| /alerts | 1851 | 0 | 0 |
| /channels | 1876 | 0 | 0 |
| /forms | 1855 | 0 | 0 |
| /settings | 1920 | 0 | 0 |
| /knowledge | 1915 | 0 | 0 |
| /ai-builder | 1858 | 0 | 0 |
| /connectors | 1857 | 0 | 0 |
| /system-health | 2012 | 0 | 0 |
| /qa | 1898 | 0 | 0 |
| /beta | 1837 | 0 | 0 |
| /updates | 1920 | 0 | 0 |

> TTI inclui 1.2s de settle deliberado; tempo real de pintura é menor.

## 4. Bug 1 — Refresh ao trocar de aba

### Causa raiz
`src/App.tsx` instanciava `new QueryClient()` **sem opções**. Os defaults do
React Query v5 incluem:

- `refetchOnWindowFocus: true`
- `staleTime: 0`

Toda vez que o navegador ganhava foco (alt-tab, voltar do DevTools, mudar
de aba interna se isso disparasse focus), TODAS as queries cacheadas eram
marcadas como stale e refeitas — gerando o "piscar" e a sensação de
"atualizar tudo do zero".

### Evidência
Páginas com listas (Dashboard, Bots, Leads, Conversations) reexecutavam
queries Supabase a cada foco da janela. Reproduzível sem interação alguma
do código de cada página.

### Fix aplicado em `src/App.tsx`
```ts
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: "always",
      retry: 1,
    },
  },
});
```

Dados continuam frescos por 60s e voltam a atualizar quando o usuário
muda de página (mudança de chave da query) ou perde/recupera conexão.
A UI **não** pisca mais ao alternar abas do navegador.

## 5. Bug 2 — Página /conversations crashava

### Causa raiz
`src/hooks/useMetaConversations.ts` chamava `getCurrentWorkspaceId()`
(que lança exceção quando ainda não há workspace ativo) **dentro do
`useEffect`**, antes do `WorkspaceProvider` ter populado o contexto.
Em hot reload e em alguns timings de auth o effect roda primeiro e
crasha a página com `No active workspace. User must be authenticated.`

Captura do erro:
```
PAGEERROR: No active workspace. User must be authenticated.
error: The above error occurred in the <Conversations> component
```

### Fix aplicado
Trocado para `tryGetCurrentWorkspaceId()` (não lança, retorna `null`)
em duas chamadas (`load` e o `useEffect` de Realtime). Quando o
workspace ainda não está pronto, o hook faz early-return e re-roda
naturalmente quando o provider atualiza.

## 6. Bug 3 — Persistência de estado entre navegações

### Causa raiz
Páginas com abas internas usavam `<Tabs defaultValue="...">` (estado
local) em vez de fonte de verdade externa (URL/searchParams). Trocar
de página e voltar descarta o estado.

Páginas testadas e marcadas como `loses-state`:

| Página | O que se perde |
|---|---|
| `/settings` | aba ativa (14 abas) — **corrigido** |
| `/leads` | filtros, busca — **backlog** |
| `/conversations` | filtros de plataforma, conversa selecionada — backlog |
| `/builder/:id` | painel direito (preview/inspector) — backlog |
| `/knowledge` | aba (fontes/embeddings/teste) — backlog |
| `/channels` | aba de plataforma — backlog |

### Fix aplicado em `src/pages/Settings.tsx`
Migrado para `useSearchParams`:

```tsx
const [searchParams, setSearchParams] = useSearchParams();
const activeTab = searchParams.get("tab") ?? "profile";
const handleTabChange = (value: string) =>
  setSearchParams(prev => { prev.set("tab", value); return prev; }, { replace: true });

<Tabs value={activeTab} onValueChange={handleTabChange}>…
```

Agora `/settings?tab=system` é bookmarkável, sobrevive a hard refresh
e a back/forward do navegador. Demais páginas seguem o mesmo padrão —
ficam no backlog P1.

## 7. Acessibilidade (skill /accessibility)

### Critical fixes aplicados (10 botões)
Botões `size="icon"` sem nome acessível receberam `aria-label`:

| Arquivo | Ação |
|---|---|
| `src/components/channels/MetaConnectModal.tsx` | "Copiar URL do webhook" |
| `src/components/builder/PublishDialog.tsx` (×2) | "Copiar link" / "Abrir link em nova aba" |
| `src/components/builder/PreviewPanel.tsx` | "Fechar painel de preview" |
| `src/components/settings/ConnectedAccountsPanel.tsx` | "Remover conta conectada" |
| `src/components/builder/AIBlockEditor.tsx` (×2) | "Remover item" |
| `src/components/leads/PipelineColumn.tsx` | "Adicionar lead nesta etapa" |
| `src/components/settings/CredentialsPanel.tsx` (×2) | "Rotacionar credencial" / "Remover credencial" |
| `src/components/shared/BotCard.tsx` | "Mais opções do bot" |

`AppLayout` já estava OK (`SidebarTrigger`, `Notificações` e demais com
`aria-label`).

### Warning / Info — backlog
- React Router v6 warnings sobre `v7_startTransition` e
  `v7_relativeSplatPath` (cosmético, não afeta usuário).
- Auditoria de contraste com `text-gray-*`/`text-muted-foreground/50`
  ainda não rodada.
- Verificação de `<main>` único e ordem de headings em cada página
  ficou para a próxima rodada.

## 8. Fixes aplicados nesta rodada (resumo)

1. `src/App.tsx` — `QueryClient` com defaults sãos (fim do refresh entre abas).
2. `src/hooks/useMetaConversations.ts` — `tryGetCurrentWorkspaceId` (fim do crash do `/conversations`).
3. `src/pages/Settings.tsx` — aba ativa via URL (`?tab=...`).
4. 10 botões icon-only ganharam `aria-label`.

## 9. Backlog priorizado (não aplicado nesta rodada)

### P1 — antes do go-live
1. Replicar o padrão de `useSearchParams` em `/leads`, `/conversations`,
   `/knowledge`, `/channels`, `/builder/:id` (estado de aba/filtro).
2. Auditar todos os outros consumidores de `getCurrentWorkspaceId()` e
   adotar `tryGetCurrentWorkspaceId` ou aguardar o workspace estar pronto.
3. Smoke test específico do happy-path real do usuário: criar bot →
   publicar → conversar no PublicBot → ver lead no CRM (precisa fixture
   de dados, não testado nesta rodada).
4. Configurar `META_VERIFY_TOKEN`, `META_APP_SECRET`,
   `WHATSAPP_ACCESS_TOKEN` e `GOOGLE_CLIENT_ID/SECRET` (operacional,
   não código).

### P2 — pós go-live
5. Migrar para os future-flags do React Router v6 (`v7_startTransition`,
   `v7_relativeSplatPath`).
6. Auditoria de contraste/cores arbitrárias (`text-gray-*`,
   `bg-[#...]`) para usar tokens semânticos.
7. Verificar `<main>` único e ordem de headings em cada layout.
8. Tap targets ≥ 44×44px no mobile (botões `h-7 w-7` em listas).

### P3 — polimento
9. Persistir sessão do Builder (último bot editado, último painel).
10. Test suite Playwright versionada em `/scripts/` para rodar em CI.

## 10. Arquivos do relatório

- `docs/SMOKE-TEST-FLUXAGENTE-2026-06-19.md` (este arquivo)
- `docs/smoke-2026-06-19/report.json` — output bruto da varredura
- `docs/smoke-2026-06-19/route_*.png` — screenshots-chave

---

Used the accessibility skill.
