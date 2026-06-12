# Integração Dify — FluxBot como Runtime, Dify como Motor de IA

## O que é o Dify

[Dify](https://github.com/langgenius/dify) é uma plataforma open-source de desenvolvimento de aplicações LLM. Ele oferece:

- **RAG (Retrieval-Augmented Generation)**: ingestão e retrieval de documentos com múltiplos modelos de embedding.
- **Agentes**: orquestração de ferramentas, ReAct, e function-calling sobre qualquer LLM.
- **Orquestração de modelos**: troca entre OpenAI, Anthropic, Gemini, Ollama e outros sem mudar código.
- **Observabilidade**: logs, traces, métricas de uso e custo por aplicação.
- **API REST estável**: interface única independente do modelo/estratégia escolhidos na UI do Dify.

---

## Por que integrar ao FluxBot

O FluxBot (Flux Agent Studio) é uma plataforma de bots conversacionais white-label. Seu ponto forte é o **runtime de fluxos**, o **CRM de leads**, a gestão de **canais** (WhatsApp, Instagram, Web) e o **builder low-code**. Ele não é uma plataforma de ML.

Ao delegar o "cérebro" de IA para o Dify, cada camada faz o que faz de melhor:

| Responsabilidade | FluxBot | Dify |
|---|---|---|
| Fluxos conversacionais e lógica de negócio | ✅ | — |
| CRM de leads e estágios | ✅ | — |
| Integração com canais (Meta, WhatsApp, Web) | ✅ | — |
| Builder low-code / no-code | ✅ | — |
| Geração de texto, extração estruturada, classificação | → delega | ✅ |
| RAG / Knowledge Base com controle granular | → delega (opcional) | ✅ |
| Agentes com ferramentas / function-calling | → delega | ✅ |
| Orquestração multi-LLM e fallbacks | → delega | ✅ |
| Observabilidade de tokens e custo por LLM | — | ✅ |

---

## Arquitetura da integração

```
┌──────────────────────────────────────────────────────┐
│                   Flux Agent Studio                   │
│                                                        │
│  Canal (WhatsApp / Web / Instagram)                   │
│      │                                                 │
│      ▼                                                 │
│  RuntimeEngine  ──▶  AI Block (runner.ts)              │
│      │                    │                            │
│      ▼                    │  getAIProvider("dify")     │
│  CRM / Leads              ▼                            │
│                   ┌──────────────┐                     │
│                   │ difyProvider │                     │
│                   └──────┬───────┘                     │
└──────────────────────────┼─────────────────────────────┘
                           │  POST /v1/chat-messages
                           │  Authorization: Bearer <api-key>
                           ▼
               ┌───────────────────────┐
               │     Dify (self-hosted) │
               │  ┌─────────────────┐  │
               │  │  LLM (qualquer) │  │
               │  │  RAG / Datasets │  │
               │  │  Agentes/Tools  │  │
               │  └─────────────────┘  │
               └───────────────────────┘
```

O `difyProvider` implementa a interface `AIProvider` do FluxBot (`src/ai/types.ts`) e é registrado na registry junto com os providers `openai`, `anthropic` e `gemini`. A troca de provider não exige mudança de código — basta configurar `provider: "dify"` no AI Block.

---

## Como configurar

### 1. Variáveis de ambiente

Adicione ao `.env` (ou ao painel de Secrets do Lovable Cloud):

```env
VITE_DIFY_BASE_URL=http://localhost        # URL base da instância Dify (sem barra final)
VITE_DIFY_API_KEY=app-xxxxxxxxxxxxxxxxxxxx # API key da aplicação Dify
```

> **Segurança:** `VITE_*` é exposto no bundle do cliente. Em produção, prefira rotear as chamadas por uma Edge Function que injete a API key do lado do servidor.

### 2. Subir o Dify localmente com Docker Compose

> **Pré-requisito:** Docker Desktop rodando na máquina.

```bash
# Clone o Dify
git clone https://github.com/langgenius/dify.git dify-local
cd dify-local/docker

# Copie e ajuste as variáveis
cp .env.example .env

# Suba todos os serviços (API, worker, web, nginx, postgres, redis, weaviate)
docker compose up -d

# Aguarde ~60s e acesse
open http://localhost
```

Na primeira vez, crie a conta admin em `http://localhost`. Depois:

1. Vá em **Studio → Create App → Chatbot** (ou Agent).
2. Escolha o LLM e configure o system prompt / RAG.
3. Vá em **API Access** e copie a **API Key** (`app-xxx`).
4. Cole em `VITE_DIFY_API_KEY` e em `VITE_DIFY_BASE_URL=http://localhost`.

### 3. Trocar o provider em um AI Block

No builder, ao configurar um **AI Block**, altere o campo `provider` para `"dify"`:

```json
{
  "type": "ai",
  "config": {
    "provider": "dify",
    "prompt": "Classifique o lead: {{mensagem_usuario}}",
    "outputVariable": "classificacao"
  }
}
```

Ou via código:

```typescript
import { runAiBlock } from "@/ai/runner";

await runAiBlock({
  config: {
    provider: "dify",
    prompt: "Resuma a conversa: {{historico}}",
    outputVariable: "resumo",
  },
  variables: { historico: "..." },
  sessionId: "session-abc",
});
```

---

## Comportamento sem configuração (fallback)

Se `VITE_DIFY_BASE_URL` ou `VITE_DIFY_API_KEY` não estiverem definidos, o `difyProvider` cai automaticamente no **mock provider local** (mesmo comportamento usado pelo demo mode). Isso garante que:

- O ambiente de dev funciona sem precisar de Docker.
- Os testes automatizados rodam sem rede.
- O build do CI não quebra.

O mock retorna `meta: { mock: true }` na resposta — o AI Inspector exibe esse flag na UI.

---

## Estrutura dos arquivos da integração

```
src/ai/
├── types.ts                    # AIProviderId agora inclui "dify"
├── registry.ts                 # Registra difyProvider
├── providers/
│   ├── dify-config.ts          # Lê VITE_DIFY_BASE_URL / VITE_DIFY_API_KEY
│   ├── dify.ts                 # Implementação do AIProvider para Dify
│   └── index.ts                # Barrel — exporta difyProvider
src/test/
└── difyProvider.test.ts        # Testes unitários (fetch mockado)
docs/
└── dify-integration.md         # Este arquivo
.env.example                    # Variáveis de exemplo documentadas
```

---

## Endpoints Dify utilizados

| Método | Endpoint | Uso |
|---|---|---|
| `POST` | `/v1/chat-messages` | `generate()`, `extract()`, `classify()` — modo `blocking` |

Todos os três métodos do `AIProvider` (generate, extract, classify) usam o mesmo endpoint de chat. A diferença está no prompt enviado:

- **generate**: prompt direto do AI Block.
- **extract**: prompt prefixado com instrução de responder em JSON com os campos do schema.
- **classify**: prompt prefixado com instrução de responder com exatamente um dos labels.

O modelo usado é o configurado **dentro da aplicação Dify** — o FluxBot não precisa saber qual é.

---

## RAG via Dify vs. Knowledge Base nativa

O FluxBot tem uma Knowledge Base própria (`src/knowledge/`). Ela usa embeddings locais/Supabase e é gerenciada pelo próprio FluxBot.

Ao usar o provider Dify, você tem **duas opções de RAG**:

| Abordagem | Como funciona | Quando usar |
|---|---|---|
| **KB nativa do FluxBot** | `AIBlockConfig.knowledge.baseId` pré-processa o retrieval e injeta como contexto no prompt antes de chamar qualquer provider (inclusive Dify). | RAG gerenciado pelo FluxBot, modelo respondendo via Dify. |
| **KB do Dify** | Configure um Dataset no painel Dify e vincule à aplicação lá dentro. O Dify faz o retrieval transparentemente antes de responder. | RAG e geração totalmente no Dify, FluxBot só envia o query. |

As duas abordagens são compatíveis — você pode combinar RAG nativo + provider Dify, ou delegar tudo para o Dify.

---

## Notas para futuras IAs / desenvolvedores

- **Por que não trocar o Supabase pelo Dify?** São camadas ortogonais. Supabase é o banco/auth/realtime. Dify é o motor de IA. Eles não competem.
- **A API key fica no cliente?** Sim, em desenvolvimento. Em produção, crie uma Supabase Edge Function `dify-proxy` que injeta a key do lado do servidor e aponte `VITE_DIFY_BASE_URL` para `/api/dify`.
- **Como adicionar novos modelos Dify?** Os modelos são gerenciados no painel Dify. Do lado do FluxBot, `dify-default` sempre aponta para o modelo configurado na aplicação. Se quiser expor múltiplas "aplicações Dify" como modelos distintos, crie múltiplas entradas em `DIFY_MODELS` e aceite um `VITE_DIFY_API_KEY_<modelo>` por entrada.
- **Streaming?** O provider atual usa `response_mode: "blocking"`. O Dify suporta streaming via SSE. Adicionar streaming exige mudança na interface `AIProvider` (retornar `AsyncIterable` em vez de `Promise`) — planejado para uma fase futura.
- **Testes de integração reais?** Rode `docker compose up -d` no repo Dify e configure um `.env.test.local` com os valores reais. Os testes em `difyProvider.test.ts` têm fetch mockado; crie um arquivo `*.integration.test.ts` separado para os testes com rede real.
