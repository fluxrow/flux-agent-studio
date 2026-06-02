# Política de Segurança

## Versões suportadas

A versão atualmente em produção (branch principal) recebe correções de
segurança. Versões anteriores não são suportadas.

## Reportar uma vulnerabilidade

Por favor, **não** abra issues públicas para vulnerabilidades. Envie um
relatório privado para: **security@fluxbot.app** (ajustar conforme o time).

Inclua:

- Descrição do problema e impacto potencial
- Passos de reprodução (PoC se possível)
- Versão / commit afetado
- Sua sugestão de mitigação, se houver

Respondemos em até **72h úteis** com confirmação de recebimento e plano de
correção. Disclosure coordenado preferencial: 90 dias.

## Escopo

Em escopo:

- Aplicação web FluxBot (frontend + backend Lovable Cloud)
- Edge Functions próprias
- Schema Postgres / RLS policies
- Connector Hub (adapters oficiais)

Fora de escopo:

- Engenharia social, phishing contra equipe ou usuários
- DoS volumétrico
- Vulnerabilidades em dependências de terceiros sem PoC explorando o produto
- Bots/integrações desenvolvidos por usuários finais

## Práticas internas

- **RLS obrigatório** em todas as tabelas `public.*` multi-tenant.
- Roles de usuário em tabela dedicada (`user_roles`), nunca no perfil —
  validados por função `security definer` (`has_workspace_role`).
- Credenciais de Connectors armazenadas com `preview` mascarado; valores reais
  apenas no Credentials Manager / Secrets store.
- LGPD/GDPR: rotas `/privacy`, `/terms`, `/data-deletion` + Privacy Center em
  Settings → Compliance (Phase 15).
- Audit Logs para ações sensíveis (consent, credenciais, publish).

## Security memory

Findings ignorados são documentados em memória de segurança via
`update_memory`, para que scanners futuros não os reabram indevidamente.
