## Objetivo
Smoke test ponta-a-ponta do FluxAgente, gerar relatório markdown completo em `docs/` e aplicar os fixes classificados como críticos — em especial o refresh ao trocar de aba e abas sem persistência.

## Fase 1 — Auditoria de código (read-only)

Mapeio rapidamente:
- `src/App.tsx` — `QueryClient` é instanciado **sem opções** → defaults do React Query incluem `refetchOnWindowFocus: true` e `staleTime: 0`. **Esta é a causa principal do "refresh toda vez que muda de aba"**: ao voltar o foco para a aba do navegador (ou ao trocar entre abas internas que disparam refoco), todas as queries refazem fetch.
- `src/auth/AuthProvider.tsx`, `WorkspaceProvider.tsx`, `src/components/AppLayout.tsx` — confirmar se providers remontam ao navegar (causaria perda de estado local de cada página).
- Páginas suspeitas de não persistir: `Builder`, `Conversations`, `Leads`, `AIPlayground`, `Channels`, `Settings`, `Knowledge`. Para cada uma, verifico se estado vive em `useState` local (perdido ao desmontar) vs. React Query / Zustand / URL params (persistido).
- Listas de filtros, abas internas (Tabs do shadcn) sem `value` controlado em URL/searchParams — também causam reset.

## Fase 2 — Smoke E2E com Playwright

Script em `/tmp/browser/fluxagente-smoke/`:
1. Restaura sessão Supabase via `LOVABLE_BROWSER_SUPABASE_*` e navega para `http://localhost:8080`.
2. Para cada rota protegida (`/dashboard`, `/bots`, `/builder/:id`, `/leads`, `/conversations`, `/analytics`, `/templates`, `/variables`, `/tracking`, `/attribution`, `/revenue`, `/alerts`, `/channels`, `/forms`, `/settings`, `/knowledge`, `/ai-builder`, `/connectors`, `/system-health`, `/qa`, `/beta`, `/updates`):
   - screenshot inicial
   - coleta console errors + network 4xx/5xx
   - mede tempo de TTI aproximado (DOMContentLoaded + primeira pintura útil)
3. **Teste de refresh entre abas**: navega A → B → A, compara screenshots e checa se network refez chamadas (evidência do bug).
4. **Teste de persistência**: em cada página com filtros/tabs/inputs, preenche algo, navega para outra rota, volta, verifica se o estado sobreviveu. Marca cada página como `persists` | `loses-state`.
5. Captura saída em `/tmp/browser/fluxagente-smoke/report.json`.

## Fase 3 — Auditoria de acessibilidade (skill /accessibility)

Leitura de páginas e componentes principais buscando:
- Critical: `<img>` sem alt, botões icon-only sem `aria-label`, inputs sem label, `onClick` em `div`/`span` sem keyboard, `aria-hidden` em containers focáveis.
- Warning: heading skips, múltiplos/missing `<main>`, `h-screen` em layouts mobile, contraste com cores arbitrárias (`text-gray-*`) em vez de tokens, tap targets < 44px.
- Info: `alt=""` em decorativos, ARIA redundante, falta de `lang` no `<html>`.

## Fase 4 — Fixes críticos (apenas P0 nesta rodada)

1. **QueryClient defaults** em `src/App.tsx`: configurar `staleTime: 60_000`, `refetchOnWindowFocus: false`, `refetchOnReconnect: 'always'`. Elimina o re-fetch ao trocar de aba.
2. **Persistência de filtros/tabs**: para as 2-3 páginas piores identificadas no smoke, migrar estado local crítico (aba ativa, filtros) para `useSearchParams` — sobrevive a navegação e a refresh.
3. **A11y P0** identificados (esperado: alguns botões icon-only do sidebar/topbar sem `aria-label`, ícones de close em modais). Adiciono labels.
4. Demais bugs (warnings, persistência em páginas secundárias, a11y warning/info) entram no relatório como backlog priorizado, **não aplico nesta rodada** — você aprova depois.

## Fase 5 — Documentação e repositório

Crio `docs/SMOKE-TEST-FLUXAGENTE-2026-06-19.md` com:
- Sumário executivo (status go/no-go por área)
- Setup do teste (como reproduzir)
- Tabela de rotas testadas: status, console errors, network errors, persistência, TTI
- Bug do refresh entre abas: causa raiz, evidência, fix aplicado
- Tabela de persistência por aba
- Findings de a11y (Critical / Warning / Info) com arquivo:linha
- Fixes aplicados nesta rodada (com diff resumido)
- Backlog priorizado (P1/P2/P3) — o que ainda precisa rodar antes do go-live
- Anexo: screenshots-chave salvos em `docs/smoke-2026-06-19/`

O sync com GitHub é automático (integração nativa do Lovable) — assim que os arquivos forem escritos, o commit vai para o repo conectado.

## Detalhes técnicos

```text
src/App.tsx
- const queryClient = new QueryClient();
+ const queryClient = new QueryClient({
+   defaultOptions: {
+     queries: {
+       staleTime: 60_000,
+       gcTime: 5 * 60_000,
+       refetchOnWindowFocus: false,
+       refetchOnReconnect: 'always',
+       retry: 1,
+     },
+   },
+ });
```

Persistência via URL (padrão para tabs do shadcn):
```tsx
const [params, setParams] = useSearchParams();
const tab = params.get('tab') ?? 'overview';
<Tabs value={tab} onValueChange={(v) => setParams({ tab: v })}>
```

## Fora do escopo desta rodada
- Performance profiling profundo (Lighthouse / bundle analysis)
- Testes de carga
- Pen-test / segurança avançada (já coberto separadamente)
- Fixes a11y warning/info — vão para backlog

Used the accessibility skill.