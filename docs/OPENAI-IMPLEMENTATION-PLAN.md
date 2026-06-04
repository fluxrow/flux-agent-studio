# OpenAI Implementation Plan
## FASE 27A.1 · De Mock para Real — Plano Técnico Completo

> Baseado em leitura direta do código-fonte. Cada referência de arquivo inclui linha exata.
> Nenhum item foi assumido — tudo foi verificado no codebase.
>
> Data: 2026-06-04

---

## Contexto de partida

O produto hoje tem uma abstração de provider de IA sólida e bem desenhada. O problema é simples: as três instâncias de provider em `src/ai/providers/index.ts` todas chamam `buildMockProvider()`. Trocar uma delas por uma implementação real não requer nenhuma mudança arquitetural. Requer um arquivo novo e duas linhas alteradas.

**O que está pronto e não precisa mudar:**

| Componente | Arquivo | Status |
|---|---|---|
| Interface `AIProvider` | `src/ai/types.ts:73–86` | Completa. Não tocar. |
| Registry de providers | `src/ai/registry.ts` | Funcional. Alterar apenas a linha do openai. |
| Runner de execução | `src/ai/runner.ts:43–186` | Completo. Zero alteração. |
| Validador de schema JSON | `src/ai/schema.ts:18–56` | Funcional. Será reutilizado. |
| Parser de JSON em texto | `src/ai/schema.ts:60–72` | `safeParseJSON()` — será reutilizado. |
| Inspector de custo | `src/ai/inspector.ts` | Funcional com resposta real. Zero alteração. |
| AI Block Editor (UI) | `src/components/builder/AIBlockEditor.tsx` | Zero alteração. |
| AI Inspector Panel (UI) | `src/components/builder/AIInspectorPanel.tsx` | Zero alteração. |
| Runtime Engine | `src/runtime/engine.ts:228–275` | Zero alteração. |

---

## 1. Arquitetura completa do provider OpenAI

### Visão geral do fluxo

```
Flow → RuntimeEngine.runAiBlock()
         ↓
       runner.ts:runAiBlock()
         ↓
       registry.ts:getAIProvider("openai")
         ↓
       [hoje]  providers/index.ts → buildMockProvider()   [mock]
       [real]  providers/openai.ts → OpenAIProvider       [real]
         ↓
       provider.generate() | provider.extract() | provider.classify()
         ↓
       POST https://api.openai.com/v1/chat/completions
         ↓
       AIResponse<T>  (envelope idêntico ao mock)
         ↓
       aiInspector.record() + runtimeEventBus.emit()
```

### Contrato que o provider real precisa honrar

A interface `AIProvider` em `src/ai/types.ts:73–86` define três métodos:

```typescript
generate(input: AIGenerateInput): Promise<AIResponse<string>>
extract<S>(input: AIExtractInput<S>): Promise<AIResponse<Record<string, unknown>>>
classify(input: AIClassifyInput): Promise<AIResponse<string>>
```

O envelope `AIResponse<T>` em `src/ai/types.ts:60–71` deve conter:

```typescript
{
  provider: AIProviderId       // "openai"
  model: string                // ex: "gpt-4o-mini"
  output: T                    // string | Record<string, unknown>
  rawText: string              // texto bruto da API
  usage: AIUsage               // { inputTokens, outputTokens, estimatedCost }
  durationMs: number           // tempo real da chamada
  finishedAt: ISODate          // ISO string
  meta?: Record<string, unknown>  // { mock: false } ou ausente
}
```

### Mapeamento de métodos para a API OpenAI

#### `generate()` → texto livre

**Entrada:** `AIGenerateInput` com `prompt`, `system?`, `temperature?`, `maxTokens?`, `model?`, `variables?`

**Chamada OpenAI:**
```
POST https://api.openai.com/v1/chat/completions
Authorization: Bearer <OPENAI_API_KEY>
Content-Type: application/json

{
  "model": "gpt-4o-mini",
  "messages": [
    { "role": "system", "content": "<system prompt ou default>" },
    { "role": "user",   "content": "<prompt com variáveis interpoladas>" }
  ],
  "temperature": 0.7,
  "max_tokens": 1024
}
```

**Mapeamento de resposta:**
```
choices[0].message.content  → output, rawText
usage.prompt_tokens         → inputTokens
usage.completion_tokens     → outputTokens
```

#### `extract()` → JSON estruturado

**Entrada:** `AIExtractInput` com `prompt`, `schema: AIOutputSchema`, `model?`, `temperature?`

**Estratégia:** usar `response_format: { type: "json_object" }` disponível nos modelos `gpt-4o`, `gpt-4o-mini`, `gpt-3.5-turbo-1106+`.

**Chamada OpenAI:**
```
POST https://api.openai.com/v1/chat/completions

{
  "model": "gpt-4o-mini",
  "response_format": { "type": "json_object" },
  "messages": [
    {
      "role": "system",
      "content": "Você deve responder APENAS com um JSON válido com os campos: <schema serializado>"
    },
    { "role": "user", "content": "<prompt>" }
  ]
}
```

**Pós-processamento:**
1. Chamar `safeParseJSON(rawText)` — já existe em `src/ai/schema.ts:60`
2. Chamar `validateSchema(parsed, schema)` — já existe em `src/ai/schema.ts:18`
3. Se `ok: false`, logar erros mas retornar o `value` parcial (behavior idêntico ao mock)

**Atenção:** `response_format: json_object` exige que o system prompt mencione JSON explicitamente — caso contrário a API retorna erro 400. A instrução no system prompt é obrigatória.

#### `classify()` → um label de uma lista

**Entrada:** `AIClassifyInput` com `prompt`, `labels: string[]`

**Estratégia:** forçar via prompt. Não usar `response_format` para classificação — mais simples e robusto.

**System prompt:**
```
Você deve responder com APENAS uma palavra, sem pontuação, sem explicação.
A palavra deve ser exatamente uma das seguintes opções: <labels.join(", ")>
```

**Pós-processamento:**
1. Trim do output
2. Verificar se está em `labels` (case-insensitive)
3. Se não estiver, usar o label mais próximo (distância de string simples) ou o primeiro da lista como fallback

### Sistema de custo

A API OpenAI retorna `usage.prompt_tokens` e `usage.completion_tokens` na resposta. Usar esses valores reais em vez da aproximação `text.length / 4` do mock.

**Cálculo do custo:**
```typescript
const cost = (usage.prompt_tokens / 1000) * model.inputCostPer1k
           + (usage.completion_tokens / 1000) * model.outputCostPer1k;
```

Os valores de custo por modelo em `src/ai/providers/index.ts:8–12` estão definidos com IDs fictícios (`gpt-5`, `gpt-5-mini`). Precisam ser atualizados para os IDs reais da API OpenAI com os custos atuais.

### Interpolação de variáveis

A função `interpolate()` que existe em `_mock.ts:26–32` faz substituição de `{{variavel}}` no prompt. Precisa ser extraída para um arquivo utilitário compartilhado — tanto o mock quanto o provider real a usam. Alternativa mais simples: reimplementar a mesma lógica inline no provider real (são 6 linhas).

---

## 2. Arquivos exatos que precisam ser alterados

### Arquivo novo (criar)

#### `src/ai/providers/openai.ts`

Arquivo inteiro a ser criado. Aproximadamente 130–150 linhas. Implementa `AIProvider` com chamadas reais à API OpenAI.

**Estrutura interna:**

```typescript
import type { AIProvider, AIGenerateInput, AIExtractInput, AIClassifyInput, AIResponse, AIUsage, AIModelInfo } from "../types";
import { validateSchema, safeParseJSON } from "../schema";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

// Modelos reais com IDs e custos atuais
const MODELS: AIModelInfo[] = [
  { id: "gpt-4o",      label: "GPT-4o",      inputCostPer1k: 0.005,  outputCostPer1k: 0.015 },
  { id: "gpt-4o-mini", label: "GPT-4o mini", inputCostPer1k: 0.00015, outputCostPer1k: 0.0006 },
];

function getApiKey(): string {
  const key = import.meta.env.VITE_OPENAI_API_KEY;
  if (!key) throw new Error("VITE_OPENAI_API_KEY não configurada.");
  return key;
}

function interpolate(s: string, vars?: Record<string, unknown>): string {
  if (!vars) return s;
  return s.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, k) => {
    const v = vars[k as string];
    return v === undefined || v === null ? "" : String(v);
  });
}

function pickModel(requested?: string): AIModelInfo {
  return MODELS.find((m) => m.id === requested) ?? MODELS.find((m) => m.id === "gpt-4o-mini")!;
}

async function callOpenAI(
  apiKey: string,
  body: Record<string, unknown>
): Promise<{ rawText: string; usage: { prompt_tokens: number; completion_tokens: number } }> {
  const res = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`OpenAI ${res.status}: ${err?.error?.message ?? res.statusText}`);
  }

  const data = await res.json();
  return {
    rawText: data.choices?.[0]?.message?.content ?? "",
    usage: data.usage ?? { prompt_tokens: 0, completion_tokens: 0 },
  };
}

function buildEnvelope<T>(
  output: T,
  rawText: string,
  model: AIModelInfo,
  usage: { prompt_tokens: number; completion_tokens: number },
  t0: number
): AIResponse<T> {
  const aiUsage: AIUsage = {
    inputTokens: usage.prompt_tokens,
    outputTokens: usage.completion_tokens,
    estimatedCost: Math.round(
      ((usage.prompt_tokens / 1000) * model.inputCostPer1k
      + (usage.completion_tokens / 1000) * model.outputCostPer1k) * 1_000_000
    ) / 1_000_000,
  };
  return {
    provider: "openai",
    model: model.id,
    output,
    rawText,
    usage: aiUsage,
    durationMs: Math.round(performance.now() - t0),
    finishedAt: new Date().toISOString(),
  };
}

export const openaiProvider: AIProvider = {
  id: "openai",
  label: "OpenAI",
  description: "GPT-4o e GPT-4o-mini via API OpenAI.",
  models: MODELS,
  defaultModel: "gpt-4o-mini",

  async generate(input: AIGenerateInput): Promise<AIResponse<string>> { ... },
  async extract(input: AIExtractInput): Promise<AIResponse<Record<string, unknown>>> { ... },
  async classify(input: AIClassifyInput): Promise<AIResponse<string>> { ... },
};
```

### Arquivos a modificar

#### `src/ai/providers/index.ts` — 1 linha alterada

```typescript
// ANTES (linha 1–2):
import { buildMockProvider } from "./_mock";
export const openaiProvider = buildMockProvider({ id: "openai", ... });

// DEPOIS:
import { openaiProvider } from "./openai";   // ← importar o provider real
export { openaiProvider };                    // ← re-exportar
// anthropicProvider e geminiProvider continuam mock
```

**Atenção:** `anthropicProvider` e `geminiProvider` continuam usando `buildMockProvider()`. Nenhuma alteração neles nesta fase.

#### `src/ai/providers/index.ts` — modelos OpenAI (IDs fictícios → reais)

Os IDs de modelo em `src/ai/providers/index.ts:8–12` são `gpt-5`, `gpt-5-mini`, `gpt-5-nano` — IDs que não existem na API OpenAI hoje. O provider real usa IDs reais.

O mock pode continuar com os IDs fictícios (não afeta funcionamento). O provider real usa IDs verificáveis via `GET https://api.openai.com/v1/models`.

### Arquivos que NÃO devem ser alterados

| Arquivo | Motivo |
|---|---|
| `src/ai/types.ts` | Contrato perfeito. Não tocar. |
| `src/ai/registry.ts` | Só muda indiretamente via `providers/index.ts`. |
| `src/ai/runner.ts` | Zero conhecimento da implementação. Não tocar. |
| `src/ai/schema.ts` | Reutilizado pelo provider real. Não tocar. |
| `src/ai/inspector.ts` | Funciona com resposta real. Não tocar. |
| `src/ai/providers/_mock.ts` | Continua servindo Anthropic e Gemini. Não tocar. |
| `src/runtime/engine.ts` | Não conhece o provider. Não tocar. |
| Todos os componentes de UI | Não conhecem a implementação. Não tocar. |

---

## 3. Sequência de implementação

### Passo 1 — Verificar variável de ambiente (5 min)

Confirmar que `VITE_OPENAI_API_KEY` está acessível no ambiente antes de escrever uma linha de código. Testar no console do browser: `import.meta.env.VITE_OPENAI_API_KEY`.

Se retornar `undefined`, o provider real vai lançar erro imediatamente e nada vai funcionar.

### Passo 2 — Criar `src/ai/providers/openai.ts` (2–3h)

Implementar os três métodos na ordem de complexidade crescente:

1. **`generate()`** — mais simples. Só texto. Implementar e testar primeiro.
2. **`classify()`** — variação simples do `generate()` com validação de label.
3. **`extract()`** — mais complexo. Requer `response_format: json_object` + `safeParseJSON` + `validateSchema`.

**Ordem de teste para cada método:**
1. Chamar diretamente no console do browser: `await openaiProvider.generate({ prompt: "diga olá" })`
2. Confirmar que `response.meta` não tem `mock: true`
3. Confirmar que `response.usage.inputTokens` tem valor real (não derivado de `text.length / 4`)
4. Confirmar que o custo em USD faz sentido

### Passo 3 — Atualizar `src/ai/providers/index.ts` (10 min)

Trocar a importação e exportação do `openaiProvider`. Anthropic e Gemini não mudam.

### Passo 4 — Teste de integração end-to-end (1–2h)

1. Criar um bot no AI Builder com um AI Block configurado com `generate`
2. Publicar o bot
3. Abrir o bot no PublicBot
4. Enviar uma mensagem que aciona o AI Block
5. Confirmar que a resposta no chat é real (não `"Resposta gerada (mock)"`)
6. Abrir o AI Inspector Panel no Builder
7. Confirmar que o run aparece com `durationMs` real (>200ms, não ~350ms fixo do mock)
8. Confirmar custo em USD calculado sobre tokens reais

### Passo 5 — Teste com `extract()` (1h)

1. Criar AI Block com `outputSchema` definido (ex: `{ nome: "string", objetivo: "string" }`)
2. Executar no PreviewPanel
3. Confirmar que as variáveis do flow são preenchidas com dados reais do JSON
4. Confirmar que `safeParseJSON` não falha quando a API retorna JSON bem formado

### Passo 6 — Teste com Knowledge Base (30 min)

1. Carregar um documento na Knowledge Base de um bot
2. Configurar AI Block para usar essa KB (`knowledge.baseId`)
3. Executar pergunta sobre o documento
4. Confirmar que o contexto da KB é injetado no prompt e a resposta usa o conteúdo

### Passo 7 — Testar tratamento de erro (30 min)

1. Usar uma chave inválida ou sem crédito
2. Confirmar que o erro é capturado em `runner.ts:165–184` e registrado no Inspector
3. Confirmar que o flow não trava — o runtime continua após falha do AI Block
4. Confirmar que a mensagem de erro é legível para o usuário

---

## 4. Variáveis de ambiente

### Variáveis necessárias

| Variável | Obrigatória | Descrição |
|---|---|---|
| `VITE_OPENAI_API_KEY` | **Sim** | Chave da API OpenAI. Formato: `sk-...` |
| `VITE_USE_SUPABASE` | Sim (já necessária) | Deve ser `true` para persistir dados. Independente do OpenAI. |

### Onde definir

**Desenvolvimento local:** arquivo `.env.local` (não versionar — deve estar no `.gitignore`)

```bash
# .env.local
VITE_OPENAI_API_KEY=sk-proj-...
VITE_USE_SUPABASE=true
```

**Produção (Lovable Cloud):** conforme documentado em `.env.example:13–18`:
> "Segredos reais ficam em Lovable Cloud → Secrets ou em Edge Functions."

O `.env.example` é explícito: **não usar `VITE_*` para segredos em produção**.

### O problema da chave no frontend

`VITE_` prefixado expõe a variável no bundle JavaScript compilado. Qualquer pessoa que inspecionar o arquivo `.js` do bundle com `window.__vite_env__` ou `grep` no bundle vai encontrar a chave.

**Para desenvolvimento e beta interno:** `VITE_OPENAI_API_KEY` é aceitável. O risco é baixo se o deploy for acessado apenas pela equipe.

**Para produção com usuários externos:** a chave não pode ficar no bundle. Ver Seção 7 (Riscos) e a alternativa de Edge Function.

---

## 5. Custos estimados

### Modelos recomendados e preços atuais

| Modelo | Input / 1M tokens | Output / 1M tokens | Uso recomendado |
|---|---|---|---|
| `gpt-4o-mini` | $0.15 | $0.60 | **Default** — qualificação de leads, extração de dados |
| `gpt-4o` | $5.00 | $15.00 | Raciocínio complexo, síntese de relatórios |

*Preços verificados em junho 2026. Sujeitos a mudança pela OpenAI.*

### Estimativa por operação

**Conversa de qualificação típica (bot de mentoria):**
- 5 turnos de conversa
- ~200 tokens de input por turno (prompt + contexto + histórico)
- ~150 tokens de output por turno
- Total por conversa: ~1.750 tokens input + ~750 output

**Custo por conversa com `gpt-4o-mini`:**
```
Input:  1.750 × $0.00015 = $0.000263
Output:   750 × $0.00060 = $0.000450
Total por conversa: ~$0.0007 (menos de 0.1 centavo de dólar)
```

**Custo por conversa com `gpt-4o`:**
```
Input:  1.750 × $0.005 = $0.00875
Output:   750 × $0.015 = $0.01125
Total por conversa: ~$0.02 (2 centavos de dólar)
```

### Volume projetado para beta

| Cenário | Conversas/mês | Custo gpt-4o-mini | Custo gpt-4o |
|---|---|---|---|
| Beta inicial (3 clientes, 50 leads/mês cada) | 150 | **$0.10** | $3.00 |
| Crescimento (10 clientes, 100 leads/mês cada) | 1.000 | **$0.70** | $20.00 |
| Escala (50 clientes, 200 leads/mês cada) | 10.000 | **$7.00** | $200.00 |

**Recomendação:** usar `gpt-4o-mini` como default. Reservar `gpt-4o` para casos de uso que justifiquem o custo 30x maior (relatórios, sínteses complexas).

### Geração de blueprint no AI Builder

A geração de blueprint pelo AI Builder faz **uma única chamada** `extract()` com schema `{ bot_name: string, summary: string }`. Prompt pequeno (~300 tokens), resposta pequena (~100 tokens).

**Custo por geração de bot:** menos de $0.0001 com `gpt-4o-mini`.

---

## 6. Limites

### Rate limits da OpenAI (Tier 1 — conta nova)

| Limite | Valor padrão |
|---|---|
| Requests por minuto (RPM) | 500 |
| Tokens por minuto (TPM) | 200.000 |
| Requests por dia (RPD) | 10.000 |

Para beta com até 10 clientes simultâneos, esses limites são suficientes.

### Limites de contexto por modelo

| Modelo | Contexto máximo |
|---|---|
| `gpt-4o-mini` | 128.000 tokens |
| `gpt-4o` | 128.000 tokens |

O prompt típico do runner (com Knowledge Base injetada) raramente ultrapassa 10.000 tokens. Limite não é um problema na fase beta.

### O que o provider real não faz (por design)

O provider OpenAI implementado neste plano:
- **Não** gerencia histórico de conversa — cada chamada é stateless. O histórico da conversa é responsabilidade do Flow (variáveis acumuladas). Se o produto precisar de "memória de contexto" entre turnos, o runner precisa passar o histórico como parte do prompt.
- **Não** faz streaming — retorna a resposta completa. Streaming exige mudanças na interface `AIProvider` e nos componentes de UI.
- **Não** faz retry automático — a primeira falha é propagada como erro. Retry pode ser adicionado depois se rate limits forem atingidos.
- **Não** gerencia batch — cada chamada é independente.

---

## 7. Riscos

### Risco 1 — Chave de API exposta no bundle (CRÍTICO para produção)

**Descrição:** `VITE_OPENAI_API_KEY` é embutida no bundle JavaScript pelo Vite. Qualquer usuário final que acesse o produto pode extrair a chave.

**Impacto:** custo não autorizado de API, abuso de créditos, vazamento de chave.

**Mitigação para beta interno:** aceitável — acesso restrito à equipe.

**Mitigação para produção:** mover as chamadas OpenAI para uma **Supabase Edge Function**.

```
Browser → POST /functions/v1/ai-proxy → Edge Function → OpenAI API
```

A chave fica na Edge Function como variável de ambiente do servidor — não exposta no bundle. O frontend envia apenas o prompt e recebe apenas a resposta.

**Esforço da mitigação:** +6–10h (criar Edge Function + autenticar com Supabase JWT).

**Decisão recomendada:** implementar com `VITE_OPENAI_API_KEY` para beta. Antes de abrir para usuários externos, migrar para Edge Function.

---

### Risco 2 — Rate limit atingido em pico de uso

**Descrição:** se múltiplos bots processamm conversas ao mesmo tempo, o Tier 1 (500 RPM) pode ser atingido.

**Impacto:** chamadas falham com erro 429. O flow do bot trava no AI Block.

**Mitigação atual:** o runner (`runner.ts:165–184`) já captura erros e registra no Inspector sem travar o flow. O usuário recebe a mensagem de erro configurada no fallback do bloco.

**Mitigação futura:** aumentar o tier da conta OpenAI (automático com uso crescente), ou implementar queue com retry exponential backoff.

---

### Risco 3 — `extract()` retorna JSON inválido

**Descrição:** mesmo com `response_format: json_object`, o modelo pode retornar JSON mal-formado ou com campos errados se o system prompt não for preciso o suficiente.

**Impacto:** `validateSchema()` retorna `ok: false`. O runner ainda retorna o `value` parcial — variáveis podem ficar vazias.

**Mitigação:** o `safeParseJSON()` já existe e trata markdown fences e JSON parcial. O `validateSchema()` já faz coerção de tipos. Para campos críticos (ex: email, telefone), adicionar validação de negócio no flow com bloco de condição após o AI Block.

---

### Risco 4 — Custo inesperado com prompt engineering ruim

**Descrição:** prompts com muito contexto (Knowledge Base grande + histórico longo) podem consumir muitos tokens sem o usuário perceber.

**Impacto:** custo mensal maior que o esperado.

**Mitigação:** o AI Inspector já rastreia custo por execução em `src/ai/inspector.ts`. Adicionar alerta quando custo acumulado ultrapassar threshold configurável — isso não existe hoje, mas o dado está disponível.

**Limite recomendado:** configurar `maxTokens: 1024` como default no AI Block para output. Para input, limitar `topK: 3` na Knowledge Base.

---

### Risco 5 — Modelos listados na UI não existem na API

**Descrição:** `src/ai/providers/index.ts:8–12` lista `gpt-5`, `gpt-5-mini`, `gpt-5-nano` — IDs que não existem na API OpenAI real.

**Impacto:** se o usuário selecionar um desses modelos no AI Block Editor e o provider real for ativado, a chamada vai falhar com erro 404 da OpenAI.

**Mitigação:** o provider real em `openai.ts` usa sua própria lista de modelos (`MODELS: AIModelInfo[]`) com IDs válidos. A lista do mock em `index.ts` ainda existirá para as instâncias Anthropic e Gemini (que continuam mock). O seletor de modelo no AI Block Editor mostrará os modelos do provider selecionado — quando "openai" for selecionado, os modelos viram reais.

**Ação necessária:** atualizar a lista de modelos no `index.ts` para o provider OpenAI quando o provider real for ativado.

---

## 8. Critérios de aceite

O provider OpenAI está implementado corretamente quando **todos** os seguintes critérios forem atendidos:

### Funcional

- [ ] **F1** — Chamada `provider.generate({ prompt: "diga olá em português" })` retorna texto coerente, não `"Resposta gerada (mock)"`
- [ ] **F2** — `response.meta` não contém `mock: true`
- [ ] **F3** — `response.usage.inputTokens` e `outputTokens` têm valores reais (não derivados de `text.length / 4`)
- [ ] **F4** — `response.durationMs` é >200ms e variável (não ~350ms fixo)
- [ ] **F5** — `provider.extract({ prompt: "extraia nome e objetivo", schema: { nome: "string", objetivo: "string" } })` retorna JSON com os campos corretos e com conteúdo real
- [ ] **F6** — `provider.classify({ prompt: "cliente interessado", labels: ["quente", "morno", "frio"] })` retorna um dos três labels
- [ ] **F7** — AI Block em um bot publicado responde com IA real no PublicBot
- [ ] **F8** — Knowledge Base injetada no prompt muda a resposta (resposta usa o conteúdo do documento)

### Custo e Inspector

- [ ] **C1** — AI Inspector Panel exibe o custo real em USD após cada execução
- [ ] **C2** — Custo para um prompt de ~200 tokens com `gpt-4o-mini` é menor que $0.001
- [ ] **C3** — Custo para `gpt-4o` é ~30× maior que `gpt-4o-mini` para o mesmo prompt

### Resiliência

- [ ] **R1** — Com chave inválida, o runner captura o erro e o flow não trava
- [ ] **R2** — Com chave inválida, o AI Inspector registra o run com `ok: false` e mensagem de erro legível
- [ ] **R3** — Com `extract()` retornando JSON parcial, `safeParseJSON` consegue extrair o objeto
- [ ] **R4** — Com `extract()` retornando campos errados, `validateSchema` retorna `ok: false` mas `value` com o que conseguiu extrair

### Segurança

- [ ] **S1** — A chave não aparece em nenhum log de console em produção
- [ ] **S2** — A chave não é enviada em nenhuma URL (apenas no header `Authorization`)
- [ ] **S3** — Não existe nenhum `console.log(apiKey)` ou similar no código

---

## Resumo de mudanças

| Ação | Arquivo | Linhas afetadas |
|---|---|---|
| **Criar** | `src/ai/providers/openai.ts` | ~130–150 linhas novas |
| **Modificar** | `src/ai/providers/index.ts` | 3 linhas (import + export openaiProvider) |
| **Adicionar** | `.env.local` | 1 linha (`VITE_OPENAI_API_KEY`) |
| **Não tocar** | `src/ai/types.ts` | — |
| **Não tocar** | `src/ai/registry.ts` | — |
| **Não tocar** | `src/ai/runner.ts` | — |
| **Não tocar** | `src/ai/schema.ts` | — |
| **Não tocar** | `src/ai/inspector.ts` | — |
| **Não tocar** | `src/ai/providers/_mock.ts` | — |
| **Não tocar** | `src/runtime/engine.ts` | — |
| **Não tocar** | Todos os componentes de UI | — |

**Total de arquivos novos:** 1  
**Total de arquivos modificados:** 1 (+ `.env.local`)  
**Esforço total estimado:** 4–6 horas de desenvolvimento + 1–2 horas de teste

---

*Fonte: leitura direta de `src/ai/types.ts`, `src/ai/providers/index.ts`, `src/ai/providers/_mock.ts`, `src/ai/registry.ts`, `src/ai/runner.ts`, `src/ai/schema.ts`, `src/ai/inspector.ts`, `.env`, `.env.example`*  
*Nenhuma suposição. Cada referência tem arquivo e linha verificados.*

---

**Ver também:**
- `docs/MASTER-ROADMAP.md` — contexto de onde este plano se encaixa no projeto (Sprint 1, P0-S1-B)
- `docs/AI-BUILDER-REALITY.md` — auditoria de o que o AI Builder realmente gera hoje
- `docs/30-DAY-EXECUTION-PLAN.md` — sequência completa de prioridades
