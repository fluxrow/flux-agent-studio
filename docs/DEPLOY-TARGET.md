# DEPLOY TARGET — Projeto oficial

**Fonte de verdade para qualquer deploy de banco, edge function ou secret.**

Última auditoria: 2026-06-05 (ver [SUPABASE-REALITY.md](./SUPABASE-REALITY.md)).

---

## Projeto oficial

| Campo | Valor |
|------|------|
| **Nome** | Flux Agent Studio (Lovable Cloud) |
| **Project Ref** | `bgzczvsmfcnypwqveotx` |
| **URL** | `https://bgzczvsmfcnypwqveotx.supabase.co` |
| **Anon / publishable key** | `sb_publishable_PmE7AwBoVZIk0pXDs5eWbA_zH2tgQUq` |
| **Config local** | `supabase/config.toml` → `project_id = "bgzczvsmfcnypwqveotx"` |
| **Env local** | `.env` → `VITE_SUPABASE_PROJECT_ID="bgzczvsmfcnypwqveotx"` |

---

## Comando canônico

Sempre que linkar o CLI do Supabase a este repositório:

```bash
supabase link --project-ref bgzczvsmfcnypwqveotx
```

Verificação obrigatória após o link:

```bash
supabase status        # deve mostrar API URL = https://bgzczvsmfcnypwqveotx.supabase.co
grep project_id supabase/config.toml   # deve imprimir "bgzczvsmfcnypwqveotx"
```

---

## Operações que DEVEM apontar para este ref

| Operação | Comando |
|----------|---------|
| Migrations | `supabase db push` |
| Deploy edge function (webhook Meta) | `supabase functions deploy meta-webhook --no-verify-jwt` |
| Deploy edge function (envio Meta) | `supabase functions deploy meta-send` |
| Secrets | `supabase secrets set NAME=VALUE` |
| Logs edge | `supabase functions logs meta-webhook` |

---

## Proibições

- ❌ **Não** rodar `supabase link --project-ref <outro>` sem atualizar `supabase/config.toml` no mesmo commit.
- ❌ **Não** criar `.env.local` ou `.env.production` apontando para outro ref.
- ❌ **Não** confundir com `espwkkaldnisriqhxyzt` (projeto "Fluxrow" de outra conta — sem relação com Flux Agent Studio).

---

## Em caso de dúvida

1. Ler [SUPABASE-REALITY.md](./SUPABASE-REALITY.md).
2. Conferir `supabase/config.toml` (fonte de verdade do CLI).
3. Conferir `.env` (fonte de verdade do frontend).

Se algum dos dois divergir de `bgzczvsmfcnypwqveotx`, **parar e investigar** antes de qualquer deploy.
