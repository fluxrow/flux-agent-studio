# Asset Polish Report — Phase 26C.2A

Polish pass executado em cima dos 3 screenshots marcados como **NEEDS POLISH**
no `LP-POLISH-REPORT.md`, preparando-os para a LP V2.

Nenhuma alteração foi feita na Landing Page, na Home ou no design system.

---

## 1. S3 — AI Builder

**Arquivo:** `src/pages/AIBuilder.tsx` (função `handleGenerate`)

### Antes
O blueprint exibia placeholders vindos do provider mock:
- `bot.name` = `"bot_name_mock"`
- `bot.description` = `"summary_mock"`

Esses valores existiam porque `buildStructuredMock()` em
`src/ai/providers/_mock.ts` devolve `${key}_mock` para qualquer campo
`string` sem `enum`. O screenshot ficava obviamente "de mentira".

### Depois
Quando `isDemoMode()` é true, o handler sobrescreve `bp.bot.name` e
`bp.bot.description` com copy realista do cenário "Clínica Lumina":

- `bot.name` → **"Agente Lumina · Avaliação Estética"**
- `bot.description` → **"SDR para Clínica Lumina que qualifica leads vindos de Meta Ads, coleta nome e WhatsApp, identifica a área de interesse e encaminha para um consultor humano."**

Demais campos (segmento "Saúde", objetivo "qualificar_leads", flow de 9
passos, tags, knowledge sugerido) já vinham coerentes do dataset demo.

### Recapturar
`/ai-builder` → clique **Gerar blueprint com IA** → screenshot do painel
direito com a aba **Flow** ativa.

---

## 2. S6b — Lead Intelligence

**Arquivo:** `src/components/intelligence/LeadIntelligencePanel.tsx`
(linhas 86–88)

### Antes
O card "Resumo" exibia no canto superior direito uma badge cinza
discreta com o texto literal `mock` (vindo de `summary.provider`).
Visualmente parecia um aviso de debug.

```tsx
<span className="text-[10px] uppercase tracking-wider text-muted-foreground ml-auto">
  {summary.provider}
</span>
```

### Depois
Substituído por uma badge azul com ícone `Brain` e o rótulo
**"IA · Inteligência"** — comunica que o resumo foi gerado por IA, em
linha com a linguagem do produto.

```tsx
<span className="text-[10px] uppercase tracking-wider text-primary/80 ml-auto inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/5 px-2 py-0.5">
  <Brain className="h-3 w-3" /> IA · Inteligência
</span>
```

### Recapturar
`/leads/demo-marina` → aba **Inteligência** → screenshot do card
"Resumo" (full panel para a versão S6b).

---

## 3. S7 — Conversations

**Arquivo:** `src/beta/demoDataset.ts` (`DEMO_MESSAGES`)

### Antes
A thread só existia para `demo-s1` (Marina) com 9 mensagens curtas. As
outras 4 conversas listadas no inbox (`dc2`–`dc5`) não tinham nenhuma
mensagem associada, então clicar em qualquer uma delas mostrava painel
vazio. Difícil produzir um screenshot rico de "Conversations".

### Depois
`DEMO_MESSAGES` foi expandido de **9 → 33 mensagens**, cobrindo todas as 5
sessões demo:

| Sessão | Lead | Canal | Status | Mensagens |
|--------|------|-------|--------|-----------|
| `demo-s1` | Marina Costa | WhatsApp | ativa | 11 (expandido com nuances) |
| `demo-s2` | Bruna Almeida | WhatsApp | **handoff humano** | 6 (inclui takeover por "Camila", role `agent`) |
| `demo-s3` | Felipe Tavares | WhatsApp | encerrada (convertido) | 5 (fechamento de agendamento) |
| `demo-s4` | Tiago Monteiro | WhatsApp | encerrada (follow-up) | 4 |
| `demo-s5` | Paula Nogueira | Instagram | ativa | 4 (lead vindo do IG) |

Destaques narrativos:
- **s2** introduz a primeira mensagem de agente humano real (`role: "agent"`)
  — perfeito para mostrar "human-in-the-loop" na LP.
- **s3** mostra ciclo completo de qualificação → agendamento confirmado.
- **s5** demonstra canal omnichannel (Instagram), reforçando o widget de
  Channels.

### Recapturar
`/conversations` → screenshot do inbox com qualquer thread aberta.
Sugestão para S7 final: abrir **Bruna Almeida** (s2) — mostra bot + user
+ agente humano no mesmo thread.

---

## Arquivos alterados

```
src/components/intelligence/LeadIntelligencePanel.tsx   (badge IA)
src/pages/AIBuilder.tsx                                 (override demo blueprint)
src/beta/demoDataset.ts                                 (DEMO_MESSAGES expandido)
docs/ASSET-POLISH-REPORT.md                             (este arquivo)
```

Nenhum arquivo novo de imagem foi adicionado — os screenshots de
`/mnt/documents/lp-screenshots/` devem ser **recapturados** nas 3 rotas
acima para refletir o polish.

---

## Status atualizado dos assets

| ID  | Asset | Status anterior | Status após polish |
|-----|-------|-----------------|-------------------|
| S3  | AI Builder | NEEDS POLISH | **READY** |
| S6b | Lead Intelligence (panel) | NEEDS POLISH | **READY** |
| S7  | Conversations | NEEDS POLISH | **READY** |
| S8  | Analytics | BLOCKING | BLOCKING (fora do escopo desta fase) |

Com isso passamos de **9 READY → 12 READY** sobre 13 assets totais. Único
bloqueio remanescente é S8 (Analytics vazio), tratado em fase separada.

---

## Próximo passo sugerido

Recapturar S3, S6b e S7 em `/mnt/documents/lp-screenshots/` (sufixo `_v2`)
e atualizar `LP-ASSETS-FINAL.md` com os novos paths.
