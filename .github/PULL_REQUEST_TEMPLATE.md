## O quê

<!-- Descreva a mudança em 1–3 frases -->

## Por quê

<!-- Motivação / link para issue ou fase do fluxbot-features.md -->

## Como testar

<!-- Passos para validar manualmente -->

## Checklist

- [ ] Sem acoplamento entre engines (Runtime / CRM / Tracking / AI / Knowledge / Connectors)
- [ ] RLS + `GRANT` em novas tabelas `public.*`
- [ ] `fluxbot-features.md` e `CHANGELOG.md` atualizados (se aplicável)
- [ ] `npm run lint` passa
- [ ] `npm run test` passa
- [ ] Sem `console.log` esquecido
- [ ] Design tokens semânticos (sem cores hardcoded)
- [ ] Screenshots/GIFs anexados (mudanças visuais)
