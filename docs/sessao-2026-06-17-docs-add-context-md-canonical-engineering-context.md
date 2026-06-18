# Sessão de Engenharia — 2026-06-17

## Resumo
Commit `101f71a` no branch `main` do repositório **flux-agent-studio**.

> ⚠️ Modo offline — gerado sem IA. Adicione ANTHROPIC_API_KEY ao seu ambiente para descrições automáticas.

## Commit
- **Mensagem:** docs: add CONTEXT.md — canonical engineering context file

Arquivo canônico de contexto de engenharia para o Flux Agent Studio.
Cobre stack, arquitetura, 9 engines, status real de features (mock vs real),
blockers críticos, modelo de dados Supabase e roadmap por sprint.
- **Hash:** `101f71a1941e81d30fe5af02ea07bae7fc2a7f59`
- **Autor:** Cauã Farias
- **Data:** 2026-06-17 15:27
- **Branch:** `main`

## Arquivos alterados (1)

```
docs/CONTEXT.md
```

## Diff resumido

```diff
diff --git a/docs/CONTEXT.md b/docs/CONTEXT.md
new file mode 100644
index 0000000..0a1a40e
--- /dev/null
+++ b/docs/CONTEXT.md
@@ -0,0 +1,385 @@
+# Flux Agent Studio — Contexto de Engenharia
+
+> **Conversational Revenue OS para empresas brasileiras.**
+> Arquivo canônico. Qualquer IA ou desenvolvedor deve ler este arquivo antes de qualquer intervenção no código.
+> Última atualização: 2026-06-17 (leitura profunda do repositório)
+> Fonte máxima de verdade do produto: `docs/PRODUCT-CONSTITUTION.md`
+
+---
+
+## O que é este projeto
+
+**Flux Agent Studio** é um Conversational Revenue OS — o sistema operacional que transforma conversas em receita mensurável para empresas brasileiras.
+
+O loop central:
+```
+CONVERSA → QUALIFICAÇÃO → CRM → RECEITA
+(canal)     (IA + score)   (nativo)  (atribuída à origem)
+```
+
+**Posição no mercado:**
+- Não é chatbot (não responde FAQ)
+- Não é builder de formulários
+- Não é CRM (embora tenha CRM nativo)
+- É a camada que faz chatbot, CRM, rastreamento e canais funcionarem juntos
+
+**Problema central resolvido:** lead quente chega via WhatsApp, ninguém responde, esfria. Ou responde mas não registra. Ou registra mas não atribui à campanha. O Flux fecha esse loop automaticamente.
+
+**ICPs primários:**
+1. Agência Digital com clientes de performance — ticket R$1.500–5.000/mês
+2. PME de serviços (imobiliária, clínica, educação, consórcio) — ticket R$300–800/mês
+3. Gestor Comercial de SaaS — ticket R$1.000–4.000/mês
+
+---
+
+## Stack Tecnológica
+
+| Camada | Tecnologia | Observação |
+|---|---|---|
+| Framework | **React 18 + Vite** | SPA puro (NÃO TanStack Start, NÃO Next.js) |
+| Roteamento | **react-router-dom v6** | `BrowserRouter` + `Routes` em `App.tsx` |
+| UI | **Tailwind CSS v3 + shadcn/ui** | 40+ componentes Radix. `tailwind.config.ts` na raiz |
+| Animações | **framer-motion** | Transições de página e micro-animações |
+| Estado servidor | **TanStack Query** | `useQuery` + `useMutation` |
+| Formulários | **React Hook Form + Zod** | |
+| Gráficos | **Recharts** | Dashboard e analytics |
+| BaaS | **Supabase** | PostgreSQL + Auth + RLS + Edge Functions |
+| Auth | **Supabase Auth + @lovable.dev/cloud-auth-js** | Multi-tenant por workspace |
+| Deploy | **Lovable → Cloudflare** | Vite build → Cloudflare Pages |
+| Runtime | **npm** (package-lock.json presente) | NÃO é Bun como no Dr. Flux |
+| Build tool | **Vite 5 + @vitejs/plugin-react-swc** | vite.config.ts na raiz |
+| Testes | **Vitest + @testing-library/react** | `vitest.config.ts` na raiz |
+| Supabase Ref | **bgzczvsmfcnypwqveotx** | Único projeto (sem prod/dev separados) |
+| Fases de AI | **Lovable AI Gateway** | `openai.ts` aponta para gateway Lovable (Gemini 3 Flash / GPT-5) |
+
+---
+
+## Arquitetura
+
+### Estrutura de pastas
+
+```
+src/
+  ai/               # AI Block Engine
+    providers/      # openai.ts (real via Lovable AI Gateway), _mock.ts, dif
```

---
*Gerado automaticamente pelo Fluxrow Post-Commit Hook · 2026-06-17 15:27*
