# AI Builder Reality Audit

**FASE R1 — Auditoria sem implementação**  
Data: 2026-06-04  
Baseada em leitura direta do código-fonte. Zero suposições.

---

## 1. O que é realmente gerado hoje?

### O pipeline real, passo a passo

Quando o usuário digita um prompt no AI Builder e clica em gerar, o seguinte acontece:

**Passo 1 — Heurísticas locais** (`src/ai-builder/generator.ts` linhas 23–46)

Antes de qualquer chamada de provider, o código roda regex puro no prompt:

```typescript
detectObjective()  // "qualificar_leads" | "agendar_reuniao" | "suporte" | etc.
detectSegment()    // "imobiliária" | "saúde" | "educação" | etc.
botNameFor()       // combina os dois → nome do bot
```

Isso é 100% local. Zero IA.

**Passo 2 — Chamada ao provider** (`generator.ts` linhas 172–182)

Uma única chamada `provider.extract()` com schema mínimo:

```typescript
schema: {
  bot_name: "string",
  summary: "string",
}
```

**Passo 3 — Construção do blueprint** (`generator.ts` linhas 191–208)

Após receber `bot_name` e `summary`, o código constrói o blueprint **usando funções locais determinísticas**:

```typescript
buildFlowBlueprint()    // steps: start, message, input, choice, condition, ai, end
buildLeadModel()        // campos CRM: name, phone, intent, budget, ai_summary
buildKnowledge()        // lista de documentos sugeridos (FAQ, catálogo, política)
buildConversation()     // tom, greeting, fallback
```

Nenhuma dessas funções chama IA. São templates com variáveis preenchidas a partir do heurístico do Passo 1.

**Passo 4 — Materialização** (`generator.ts` linhas 228–314)

```typescript
materializeBlueprint(bp) → repositories.bots.create() → salva Blocks + Connections
```

Cria o bot no repositório (mock ou Supabase, dependendo de `VITE_USE_SUPABASE`). Emite eventos de ciclo de vida.

### O que o usuário vê no canvas

Um flow funcional com blocos reais: `start → message → input → choice → condition → ai → end`. As conexões existem. O flow pode ser executado no PreviewPanel. Os blocos têm configuração real (prompt, variável de saída, schema estruturado).

### O que o blueprint NÃO faz

- Não gera lógica de negócio específica. O "conteúdo" dos blocos é preenchido com strings genéricas do template, não derivado do prompt original.
- O `bot_name` e `summary` retornados pelo provider (mock) são as únicas saídas de IA — e mesmo essas são mock.
- Não há personalização baseada no setor ou objetivo real do usuário além das 6 strings retornadas por `detectSegment()`.

---

## 2. O que vem de `buildMockProvider()`?

**Arquivo:** `src/ai/providers/_mock.ts` — 128 linhas. As três instâncias (openai, anthropic, gemini) em `src/ai/registry.ts` todas chamam `buildMockProvider()`.

### O que o mock faz de real

| Comportamento | Real ou Fake? |
|---|---|
| Latência de rede | **Fake** — `await wait(250 + random * 400)` |
| Contagem de tokens | **Aproximada** — `text.length / 4` |
| Estimativa de custo | **Calculada** — mas sobre tokens falsos |
| Validação de schema JSON | **Real** — `validateSchema()` em `src/ai/schema.ts` |
| Substituição de `{{variável}}` | **Real** — `interpolate()` no mock |
| Envelope de resposta (`meta: { mock: true }`) | **Honesto** — o flag `mock: true` está presente |

### O que o mock responde

**`provider.generate()`** — retorna `mockAnswerFor(prompt)`:

```typescript
// src/ai/providers/_mock.ts linhas 34-41
function mockAnswerFor(prompt: string): string {
  // Keyword matching:
  // "classific" → "interessado"
  // "resumo" | "sumari" → "Cliente demonstrou interesse..."
  // "nome" → "João Silva"
  // Fallback → "Entendido. Como posso ajudar?"
}
```

**`provider.extract()`** — retorna `buildStructuredMock(schema)`:

```typescript
// Gera JSON que satisfaz o schema com valores fixos
// string → "mock_value"
// number → 42
// boolean → true
// string[] → ["item_1", "item_2"]
```

**`provider.classify()`** — retorna o primeiro label passado, sempre.

### Conclusão direta

Toda resposta de IA no produto hoje é uma dessas três:
- Uma string hardcoded baseada em keyword matching
- Um JSON com `"mock_value"` e `42`
- O primeiro item de uma lista de classificação

O usuário que abre o PreviewPanel, envia uma mensagem a um bloco AI e recebe uma resposta está recebendo uma dessas strings. Não há chamada HTTP a nenhuma API externa.

---

## 3. O que falta para OpenAI funcionar?

### Arquivos a criar/modificar

**1. `src/ai/providers/openai.ts`** — novo arquivo (não existe)

Precisa implementar a interface `AIProvider` de `src/ai/types.ts`:

```typescript
export interface AIProvider {
  generate(input: AIGenerateInput): Promise<AIResponse<string>>;
  extract<S>(input: AIExtractInput<S>): Promise<AIResponse<Record<string, unknown>>>;
  classify(input: AIClassifyInput): Promise<AIResponse<string>>;
}
```

Para o `generate()`: chamada para `POST https://api.openai.com/v1/chat/completions` com `model`, `messages`, `temperature`, `max_tokens`. Retornar `choices[0].message.content`.

Para o `extract()`: usar `response_format: { type: "json_object" }` + instrução no system prompt para retornar JSON com os campos do schema. Depois rodar `validateSchema()` (já existe em `src/ai/schema.ts`) sobre o output.

Para o `classify()`: passar as labels no system prompt como opções válidas. Garantir que o output seja um dos labels.

**2. `src/ai/registry.ts`** — trocar uma linha

```typescript
// Atual (linha aproximada 8):
openai: buildMockProvider({ id: "openai", ... }),

// Necessário:
openai: new OpenAIProvider(import.meta.env.VITE_OPENAI_API_KEY),
```

**3. `.env` (ou `.env.local`)** — variável não existe hoje

```
VITE_OPENAI_API_KEY=sk-...
```

**Problema de segurança:** `VITE_` prefix expõe a chave no bundle JavaScript do cliente. Qualquer usuário que inspecionar o bundle vê a chave. Para produção, a chave precisa ir para um backend/edge function. Para desenvolvimento e demo interno, `VITE_OPENAI_API_KEY` é aceitável.

### O que NÃO precisa mudar

- `src/ai/runner.ts` — já chama `provider.generate()` e `provider.extract()` corretamente
- `src/runtime/engine.ts` — já chama `runAiBlock()` de forma assíncrona
- `src/ai/schema.ts` — validador já existe e funciona
- `src/ai-builder/generator.ts` — já chama `provider.extract()` para geração do blueprint
- Todos os componentes de UI (AIBlockEditor, AIInspectorPanel) — já funcionam com a interface real

### Pontos de atenção

- O campo `meta.mock` no envelope de resposta desaparece quando o provider é real. O `AIInspectorPanel` exibe isso — visual vai mudar.
- Contagem de tokens passará a usar os valores reais do `usage` da API OpenAI, não a aproximação `length/4`.
- Custo estimado ficará mais preciso (usando o `usage.prompt_tokens` e `usage.completion_tokens` reais).
- Rate limits da OpenAI não estão tratados. O mock nunca falha. O provider real pode retornar 429.

---

## 4. O que falta para Anthropic funcionar?

### Diferenças em relação à OpenAI

A interface que precisa ser implementada é idêntica (`AIProvider`). A diferença está na API chamada.

**`src/ai/providers/anthropic.ts`** — novo arquivo (não existe)

Para o `generate()`: `POST https://api.anthropic.com/v1/messages` com headers `x-api-key: $KEY` e `anthropic-version: 2023-06-01`. Body: `{ model, messages, max_tokens }`. Retornar `content[0].text`.

Para o `extract()`: Anthropic não tem `response_format: json_object` nativo. Abordagem: instruir o modelo no system prompt a retornar APENAS JSON válido, depois usar `safeParseJSON()` (já existe em `src/ai/schema.ts` linhas 60–73) para extrair o JSON do texto. Rodar `validateSchema()` sobre o resultado.

Para o `classify()`: mesmo padrão — forçar via prompt. Anthropic é geralmente mais obediente a restrições de formato que GPT-3.5, mas menos confiável que function calling do GPT-4.

**`.env`:**

```
VITE_ANTHROPIC_API_KEY=sk-ant-...
```

**Mesma problemática de segurança** da chave no bundle frontend.

### Diferença crítica: CORS

A API da Anthropic **não permite chamadas diretas do browser** (sem CORS headers). A OpenAI permite com `Authorization: Bearer`. Para Anthropic em produção, a chamada obrigatoriamente precisa passar por um proxy/backend.

Para desenvolvimento: pode usar um proxy local (Vite proxy config) ou uma edge function no Supabase.

Isso significa que conectar Anthropic requer **uma etapa adicional de infraestrutura** que OpenAI não exige.

---

## 5. Quanto esforço para colocar provider real?

### Estimativa por tarefa

| Tarefa | Esforço | Bloqueadores |
|---|---|---|
| Criar `src/ai/providers/openai.ts` | **2–3h** | Nenhum |
| Atualizar `src/ai/registry.ts` | **15min** | Nenhum |
| Adicionar `VITE_OPENAI_API_KEY` ao `.env` | **5min** | Precisa da chave |
| Testar fluxo completo (AI block + blueprint) | **1–2h** | Precisa da chave |
| **Total OpenAI em dev** | **~4–6h** | Só a chave |
| Criar `src/ai/providers/anthropic.ts` | **2–3h** | Mais complexo (sem json_object nativo) |
| Proxy/backend para Anthropic (CORS) | **3–5h** | Infraestrutura nova |
| **Total Anthropic em dev** | **~6–10h** | CORS + chave |

### O que já está pronto (não precisa fazer)

- Interface `AIProvider` e seus tipos: ✅ completo
- Runner assíncrono com variáveis e eventos: ✅ completo  
- Validação de schema JSON: ✅ completo (`safeParseJSON` + `validateSchema`)
- Inspector com custo e histórico: ✅ funciona com resposta real
- Runtime engine com await para AI blocks: ✅ completo
- Knowledge injection no prompt: ✅ completo

### Avaliação honesta

O sistema foi projetado para ser trocado. A abstração de provider é limpa. O runner não conhece a implementação. O custo de troca é **baixo do lado do código** (4–6h para OpenAI) e **médio do lado da infraestrutura** (Anthropic/CORS, chaves seguras em produção).

O único bloqueador real para "funcionar em desenvolvimento hoje" é ter a chave de API e criar o arquivo de provider. Nenhum refactor arquitetural é necessário.

---

## Mapa de arquivos auditados

```
src/ai/
  types.ts          — interface AIProvider, modelos de custo, envelopes de resposta
  registry.ts       — 3 providers, todos buildMockProvider()
  providers/
    _mock.ts        — implementação única usada pelos 3 providers
  runner.ts         — orquestra AI block no flow (knowledge + extract/generate + variáveis)
  schema.ts         — validateSchema() + safeParseJSON()
  inspector.ts      — ring buffer localStorage, stats de custo

src/ai-builder/
  generator.ts      — prompt → heurísticas → provider.extract() → blueprint → materialização
  types.ts          — BotBlueprint, FlowBlueprintStep
  cost.ts           — ring buffer de runs do AI Builder
  events.ts         — tipos de eventos de ciclo de vida

src/components/builder/
  AIBlockEditor.tsx     — editor visual de bloco AI (provider, schema, variáveis)
  AIInspectorPanel.tsx  — histórico de execução em tempo real

src/runtime/
  engine.ts         — executa flow, chama runAiBlock() assíncrono
  validator.ts      — análise estática do flow

src/knowledge/
  retriever.ts      — busca por similaridade + injection no prompt
  embeddings/mock.ts — vetores hash (64 dimensões), sem API externa
```

---

## Resumo executivo

| Pergunta | Resposta |
|---|---|
| O que é gerado hoje? | Blueprint via heurísticas locais + `bot_name`/`summary` do mock |
| O que vem do mock? | Todas as respostas de IA — geração, extração, classificação |
| Falta para OpenAI? | Um arquivo de provider (~100 linhas) + chave de API |
| Falta para Anthropic? | Um arquivo de provider + proxy para CORS + chave de API |
| Esforço para provider real? | OpenAI: ~4–6h. Anthropic: ~6–10h |

---

**Ver também:**
- `docs/MASTER-ROADMAP.md` — estado consolidado do projeto
- `docs/OPENAI-IMPLEMENTATION-PLAN.md` — plano técnico completo para conectar OpenAI
- `docs/REALITY-CHECK-AUDIT.md` — auditoria de todos os 16 módulos do produto
