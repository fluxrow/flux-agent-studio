# Contributing to FluxBot

## Regras de ouro

1. **Não acoplar engines.** Runtime, CRM, Tracking, AI, Knowledge e Connectors
   se comunicam exclusivamente via `runtimeEventBus` ou contratos de domínio.
2. **Nunca editar arquivos auto-gerados:**
   - `src/integrations/supabase/client.ts`
   - `src/integrations/supabase/types.ts`
   - `.env`
   - `supabase/config.toml` (apenas blocos de função podem ser adicionados)
3. **Design tokens semânticos** — nunca usar `text-white`, `bg-black` direto.
   Sempre via tokens em `index.css` + `tailwind.config.ts`. Cores em HSL.
4. **Mocks ↔ Supabase** — toda nova entidade deve ter repositório mock e
   adapter Supabase atrás de `domain/persistence/contracts.ts`.
5. **RLS obrigatório** em toda tabela nova no schema `public`, junto com
   `GRANT` explícito (anon/authenticated/service_role conforme as policies).

## Fluxo de trabalho

1. Cada "Fase N" entra como bloco em `fluxbot-features.md` e em `CHANGELOG.md`.
2. Componentes pequenos e focados — máx ~200 linhas por arquivo de UI.
3. Edits cirúrgicos (line-replace) sempre que possível, em vez de reescrever.
4. Testes Vitest para lógica pura (`runtime/`, `intelligence/`, `knowledge/…`).

## Convenções de código

- **TypeScript estrito**, sem `any` salvo em fronteiras externas justificadas.
- **Pasta por domínio**: `types.ts`, `events.ts`, `index.ts` como surface pública.
- **Imports**: usar alias `@/` (configurado em `vite.config.ts` / `tsconfig`).
- **Nomes**: PascalCase para componentes e tipos; camelCase para utilidades;
  kebab-case apenas em rotas/URLs.

## Commits

Padrão (recomendado): [Conventional Commits](https://www.conventionalcommits.org/).

```
feat(knowledge): add PDF parser
fix(runtime): handle empty variable in interpolate
docs(connectors): document webhook auth modes
chore(deps): bump zod to 3.25
refactor(intelligence): split scorer factors
test(runtime): cover condition resolver edge cases
```

## Pull Requests

- Descrição com **o que / porquê / como testar**.
- Screenshots/GIFs para mudanças visuais.
- Checklist:
  - [ ] Sem acoplamento entre engines
  - [ ] RLS + GRANT em novas tabelas
  - [ ] `fluxbot-features.md` e `CHANGELOG.md` atualizados
  - [ ] `npm run lint` e `npm run test` passando
  - [ ] Sem `console.log` esquecido

## Segurança

Ver [`SECURITY.md`](./SECURITY.md). **Nunca** commitar segredos — use
Lovable Cloud Secrets ou variáveis `VITE_*` públicas apenas para chaves
explicitamente publicáveis.
