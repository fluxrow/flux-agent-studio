# Visual Smoke Test — Paleta Escura (Preto + Turquesa)

Data: 11 jun 2026
Executor: agente Lovable + Playwright manual
Paleta-base: `background: hsl(0 0% 4%)` · `primary: hsl(156 73% 54%)` (#34E0A1)
Script: [`scripts/visual-smoke.mjs`](../scripts/visual-smoke.mjs)

## Como rodar

```bash
npx playwright install chromium
BASE_URL=https://<preview>.lovable.app \
PREVIEW_TOKEN=<token>                  \
node scripts/visual-smoke.mjs
```

Critérios de falha automática:
- Background computado do `<body>` fora da faixa escura (qualquer canal RGB ≥ 60).
- Página renderizada com `< 20` caracteres de texto visível (rota em branco).
- Qualquer `pageerror` ou `console.error` durante o carregamento.

Artefatos: `artifacts/visual-smoke/<rota>-<viewport>.png`.

## Resultado da execução manual (11 jun 2026)

| Rota                | Desktop | Mobile | Observações                                                              |
|---------------------|---------|--------|--------------------------------------------------------------------------|
| `/` (Landing)       | ✅      | —      | Hero em preto puro, CTA turquesa, badge verde, contraste OK.            |
| `/dashboard`        | ✅      | —      | Sidebar preta, cards `bg-card` em verde-petróleo escuro, CTAs turquesa. |
| `/bots`             | ✅      | —      | Empty state OK; ícone turquesa em fundo preto.                          |
| `/leads`            | ✅      | —      | Pipeline vazio com empty state turquesa.                                |
| `/conversations`    | ⚠️      | —      | Renderiza um radial verde-escuro vazio em workspace sem conexões Meta. Layout não quebra a paleta, mas falta `EmptyState` informando que não há canais conectados. |
| `/analytics`        | ✅      | —      | Cards de funil, KPIs e barras turquesa preservando contraste.           |
| `/templates`        | ✅      | —      | Filtros de categoria com chip primário turquesa, lista vazia OK.        |
| `/bot/:slug` (404)  | ✅      | —      | "Bot indisponível" com badge vermelho — único acento não-turquesa, intencional para erro. |
| `/builder/:id`      | ⏭️      | —      | Requer bot existente — coberto pelo script com `allowNotFound`.         |

## Achados

1. **`/conversations` (Inbox)** — quando o workspace não tem nenhuma conexão Meta, a página fica praticamente em branco (apenas o glow de fundo). Não é um bug de paleta, mas o smoke acusa "página vazia" pelo critério de `textLen < 20`. Próximo passo: adicionar `EmptyState` com CTA "Conectar canal" para satisfazer tanto UX quanto o gate do smoke.
2. **Demais rotas** — paleta turquesa/preta consistente, sem regressões de contraste. Nenhum vestígio das cores antigas (teal #14B8A6 / orange #D97706).

## Próximos passos

- Implementar `EmptyState` em `/conversations` (resolve o ⚠️ acima).
- Adicionar job opcional `visual-smoke` no `deploy.yml` após `smoke-staging`, rodando este script contra a URL de staging.
- Expandir a matriz com `/settings`, `/channels` e `/tracking` quando estabilizadas na nova paleta.
