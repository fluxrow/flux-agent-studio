# OpenAI Provider — Test Report
**FASE 28A · 2026-06-08**

---

## Status geral

| Item | Status |
|------|--------|
| Build TypeScript | ✅ Zero erros |
| Contrato `AIProvider` implementado | ✅ Completo |
| `generate()` | ✅ Implementado |
| `extract()` | ✅ Implementado |
| `classify()` | ✅ Implementado |
| Teste com chave real | ⚠️ SKIPPED — `OPENAI_API_KEY` não disponível no ambiente de execução CI |

---

## Ambiente de execução

O ambiente de execução remoto não possui `OPENAI_API_KEY` disponível como variável de ambiente de sistema nem como `VITE_OPENAI_API_KEY` no `.env`.

O provider foi validado via:
- **Build completo** (`npm run build` — 2855 módulos transformados, sem erros)
- **TypeScript strict** (`tsc --noEmit` — zero erros)
- **Revisão de contrato** — todos os tipos de `src/ai/types.ts` satisfeitos

---

## Teste de formato de requisição (sem chave)

O script de teste `/tmp/test_openai.mjs` foi executado e confirmou que:
- A lógica de montagem do body está correta
- O header `Authorization: Bearer <key>` está na posição certa (não na URL)
- O `response_format: { type: "json_object" }` está presente no `extract()`
- O sistema de retry com backoff exponencial está implementado

```
Saída: "OPENAI_API_KEY não definida — executando teste de formato de requisição apenas."
Status: SKIPPED
```

---

## Teste esperado com chave real

Para executar o teste completo, adicionar a chave no `.env.local`:

```bash
VITE_OPENAI_API_KEY=sk-proj-...
```

Ou executar diretamente:

```bash
OPENAI_API_KEY=sk-proj-... node /tmp/test_openai.mjs
```

### Saída esperada — generate()

**Entrada:**
```json
{
  "model": "gpt-4o-mini",
  "prompt": "Em uma frase curta, o que é inteligência artificial?",
  "system": "Você é um assistente útil e conciso."
}
```

**Saída esperada (formato):**
```json
{
  "provider": "openai",
  "model": "gpt-4o-mini",
  "output": "<texto real da OpenAI>",
  "rawText": "<texto real da OpenAI>",
  "usage": {
    "inputTokens": 35,
    "outputTokens": 25,
    "estimatedCost": 0.0000203
  },
  "durationMs": 800,
  "finishedAt": "2026-06-08T..."
}
```

**Tempo esperado:** 400–1200ms (variável — rede real)  
**Custo esperado:** < $0.0001 para prompt de ~35 tokens com `gpt-4o-mini`

---

### Saída esperada — extract()

**Entrada:**
```json
{
  "model": "gpt-4o-mini",
  "prompt": "Meu nome é Carlos e quero expandir minha agência de marketing.",
  "schema": { "nome": "string", "objetivo": "string" }
}
```

**Saída esperada:**
```json
{
  "output": {
    "nome": "Carlos",
    "objetivo": "expandir agência de marketing"
  },
  "rawText": "{\"nome\": \"Carlos\", \"objetivo\": \"expandir minha agência de marketing\"}"
}
```

---

### Saída esperada — classify()

**Entrada:**
```json
{
  "model": "gpt-4o-mini",
  "prompt": "O cliente pediu proposta, tem urgência, orçamento aprovado e quer fechar essa semana.",
  "labels": ["quente", "morno", "frio"]
}
```

**Saída esperada:**
```json
{
  "output": "quente",
  "rawText": "quente"
}
```

---

## Custo estimado por operação (gpt-4o-mini)

| Operação | Tokens input | Tokens output | Custo USD |
|---------|-------------|--------------|-----------|
| `generate` (qualificação lead) | ~200 | ~150 | ~$0.00013 |
| `extract` (captura nome/objetivo) | ~120 | ~50 | ~$0.000048 |
| `classify` (temperatura lead) | ~80 | ~5 | ~$0.000015 |
| **Conversa completa (5 turnos)** | ~1.750 | ~750 | ~$0.00071 |

---

## Arquivos criados/modificados

| Ação | Arquivo |
|------|---------|
| **CRIADO** | `src/ai/providers/openai.ts` (~165 linhas) |
| **MODIFICADO** | `src/ai/providers/index.ts` (importa `openaiProvider` real) |

---

## Como ativar em produção

1. Adicionar `VITE_OPENAI_API_KEY` nas secrets do Lovable Cloud
2. Confirmar que `VITE_USE_SUPABASE=true` também está setado
3. O provider já está wired em `src/ai/registry.ts` via `providers/index.ts`

> **Nota de segurança:** Para produção com usuários externos, migrar para Supabase Edge Function `ai-proxy` para que a chave não fique exposta no bundle JS.
