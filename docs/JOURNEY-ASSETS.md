# LP V2 — Journey Assets (Fase 26C.2)

> Curadoria dos assets que compõem a seção **"A Jornada"** da Landing Page V2.
> Não altera código, LP, Home ou design system. Documento de preparação.
> Base: screenshots capturados na Fase 26B.2 (Demo Runtime, cenário Clínica Lumina / Agência Growth Demo), armazenados em `/mnt/documents/lp-screenshots/`.

A "Jornada" é a seção storytelling da LP — leva o visitante do **primeiro contato** (conversa) até a **prova de retorno** (receita atribuída). Cada frame precisa responder uma pergunta de venda.

---

## 1. Assets disponíveis por etapa da jornada

Notas em escala 1–10. *Polish* refere-se ao esforço para deixar publicável.

### Conversa (PublicBot)
| ID  | Arquivo                          | Visual | Conversão | Clareza | Polish     | Comentário |
|-----|----------------------------------|:------:|:---------:|:-------:|------------|-----------|
| S4a | `S4-publicbot-whatsapp.png`      | 8      | 9         | 9       | Baixo      | Header verde "online" + 2 balões. É o canal mais reconhecível — abre a jornada com familiaridade. |
| S4b | `S4-publicbot-instagram.png`     | 8      | 8         | 9       | Baixo      | Mesmo bot, outro canal. Prova omnichannel quando pareado com S4a. |
| S7  | `S7-conversations.png`           | 6      | 6         | 7       | **Alto**   | Inbox lista 5 conversas mas sem thread aberta — atualmente NEEDS POLISH. Útil só como suporte. |

### AI Builder
| ID  | Arquivo                  | Visual | Conversão | Clareza | Polish      | Comentário |
|-----|--------------------------|:------:|:---------:|:-------:|-------------|-----------|
| S3  | `S3-ai-builder.png`      | 8      | 10        | 8       | **Médio**   | Prompt → blueprint de 11 blocos em 336ms. Asset-âncora de "Crie em 30s", mas labels `bot_name_mock` / `summary_mock` precisam virar PT. |
| S2  | `S2-builder.png`         | 7      | 7         | 7       | **Médio**   | Canvas + paleta + propriedades. Hoje canvas cortado — "Fit view" não enquadrou. |

### Lead Intelligence
| ID  | Arquivo                          | Visual | Conversão | Clareza | Polish     | Comentário |
|-----|----------------------------------|:------:|:---------:|:-------:|------------|-----------|
| S6b | `S6b-lead-intelligence.png`      | 10     | 10        | 9       | Baixo      | Score breakdown + Resumo IA + Recomendação + Forecast. Frame mais "wow" do produto. Polish trivial: badge "MOCK" → "IA". |
| S6a | `S6-lead-timeline.png`           | 9      | 8         | 9       | Baixo      | Lead Marina (score 92) + timeline de 8 eventos. Suporte natural ao S6b. |

### CRM
| ID  | Arquivo                | Visual | Conversão | Clareza | Polish | Comentário |
|-----|------------------------|:------:|:---------:|:-------:|--------|-----------|
| S5  | `S5-leads-crm.png`     | 9      | 9         | 10      | Nenhum | Pipeline 5 colunas com 12 leads, scores, temperaturas, UTMs. Kanban familiar = leitura instantânea. |

### Revenue
| ID  | Arquivo              | Visual | Conversão | Clareza | Polish     | Comentário |
|-----|----------------------|:------:|:---------:|:-------:|------------|-----------|
| S9  | `S9-revenue.png`     | 10     | 10        | 9       | Baixo      | R$ 87.400 + ROAS 6.15x + Forecast +51% + Top campanhas. Único frame que entrega "$$$" de forma direta. Polish cosmético: barras 7d muito baixas. |

### Attribution
| ID  | Arquivo                  | Visual | Conversão | Clareza | Polish | Comentário |
|-----|--------------------------|:------:|:---------:|:-------:|--------|-----------|
| S10 | `S10-attribution.png`    | 8      | 9         | 9       | Nenhum | KPIs (7.826 visitantes → 14 conv → R$ 101.400) + tabela multi-touch por campanha. Fecha o loop "de onde veio o dinheiro". |

---

## 2. Sequência narrativa recomendada

A jornada deve responder, em ordem:

1. **"Como o cliente fala com o bot?"** → mostra o canal
2. **"Como esse bot é construído?"** → mostra a velocidade
3. **"Como o lead vira oportunidade qualificada?"** → mostra a IA
4. **"Como a equipe gerencia esses leads?"** → mostra o CRM
5. **"Isso virou dinheiro?"** → mostra a receita
6. **"De onde veio o dinheiro?"** → fecha o ciclo

### Sequência escolhida (6 frames)

```
S4a  PublicBot WhatsApp        → "O cliente conversa no canal dele"
S3   AI Builder                → "Você criou esse bot em 30 segundos"
S6b  Lead Intelligence         → "A IA já te diz qual lead vale mais e o que dizer"
S5   Leads CRM                 → "Seu time trabalha o pipeline"
S9   Revenue Intelligence      → "Vira receita medida em R$"
S10  Attribution                → "E você sabe qual canal trouxe cada real"
```

### Por que **não** abrir com AI Builder?

S3 é o asset de **conversão mais forte**, mas abrir a Jornada com ele inverte a história ("ferramenta antes do problema"). Abrir com **S4a Conversa** ancora o leitor no resultado tangível (a conversa real do cliente) e só *depois* revela a mágica de como aquilo foi construído. Isso aumenta o impacto do S3 quando ele aparece no frame 2.

### Por que fechar com Attribution e não com Revenue?

S9 (Revenue) é mais "uau". Mas S10 (Attribution) é o frame que **resolve a objeção final** do comprador analítico ("mostre-me o canal"). Fechar com Attribution sustenta o pitch técnico e abre a transição natural para o CTA "Conecte seus canais".

### Variação curta (4 frames) — para mobile / above-the-fold

```
S4a → S3 → S6b → S9
```

Mantém a história mínima viável: Conversa → Builder → Inteligência → Receita.

---

## 3. Abertura e fechamento

- **Abre a Jornada:** **S4a — PublicBot WhatsApp.** Familiar, baixa fricção cognitiva, ancora o leitor no canal real.
- **Fecha a Jornada:** **S10 — Attribution.** Resolve a objeção "isso realmente gerou receita rastreável?".

Alternativas avaliadas:
- Abrir com S1 Dashboard → rejeitado: Dashboard é o hero principal da LP, repetir aqui dilui.
- Fechar com S9 Revenue → válido se a LP tiver CTA emocional ("comece a faturar"); manter S10 se o CTA for analítico ("veja seus canais").

---

## 4. Assets faltando / GIFs sugeridos

### Faltando ou precisando polish antes da jornada ir ao ar

| Item              | Status        | Ação necessária                                                                 |
|-------------------|---------------|---------------------------------------------------------------------------------|
| S3 AI Builder     | NEEDS POLISH  | Trocar `bot_name_mock`/`summary_mock` por copy PT; ocultar toast de geração.    |
| S6b Intelligence  | Polish leve   | Trocar badge "MOCK" do Resumo por "IA".                                         |
| S9 Revenue        | Polish leve   | Aumentar altura mínima das barras do chart "Receita diária 7 dias".             |
| S7 Conversations  | NEEDS POLISH  | **Não bloqueante** — fora da Jornada. Pode entrar como suporte se ganhar split-view com thread. |

### GIFs / motion ideais (não bloqueantes para v1 da LP)

1. **`gif-ai-builder-typing.mp4`** — prompt sendo digitado e blueprint aparecendo bloco a bloco (≈4s). Substitui S3 estático no frame 2 e é o motion de maior impacto.
2. **`gif-lead-score-rising.mp4`** — score de Marina subindo de 60 → 92 com Resumo IA emergindo (≈3s). Para o frame 3 (S6b).
3. **`gif-kanban-drag.mp4`** — card de lead sendo arrastado de "Qualificado" → "Em negociação" → "Convertido" (≈3s). Reforça interatividade do S5.
4. **`gif-revenue-counter.mp4`** — contador animando até R$ 87.400 com barras dos canais subindo (≈2s). Para o frame 5 (S9).
5. **`gif-whatsapp-typing.mp4`** — bolha de "digitando..." + nova mensagem aparecendo no S4a (≈2s). Para o frame 1.

Prioridade de produção: **GIF 1 (AI Builder)** > **GIF 4 (Revenue counter)** > **GIF 2 (Score rising)** > resto.

---

## 5. Ranking final dos assets da Jornada

Combinação ponderada de visual (×1) + conversão (×1.5) + clareza (×1) − polish (alto=−2, médio=−1, baixo=0).

| Rank | ID  | Asset                        | Score | Papel na Jornada      |
|:----:|-----|------------------------------|:-----:|-----------------------|
| 1    | S6b | Lead Intelligence            | 34.0  | Núcleo emocional (frame 3) |
| 2    | S9  | Revenue Intelligence         | 34.0  | Prova financeira (frame 5) |
| 3    | S5  | Leads CRM                    | 32.5  | Familiaridade (frame 4)    |
| 4    | S10 | Attribution                  | 30.5  | Fechamento analítico (frame 6) |
| 5    | S3  | AI Builder                   | 30.0  | Mágica do produto (frame 2) — após polish |
| 6    | S4a | PublicBot WhatsApp           | 30.5  | Abertura familiar (frame 1) |
| 7    | S6a | Lead Timeline                | 30.0  | Suporte ao S6b              |
| 8    | S4b | PublicBot Instagram          | 29.0  | Par omnichannel com S4a     |
| 9    | S2  | Builder canvas               | 24.5  | Backup do S3 — após polish  |
| 10   | S7  | Conversations                | 17.5  | Fora da Jornada hoje        |

---

## 6. Resumo executivo

- **Jornada v1 (6 frames):** S4a → S3 → S6b → S5 → S9 → S10.
- **Jornada compacta (4 frames):** S4a → S3 → S6b → S9.
- **Abre:** S4a (Conversa WhatsApp). **Fecha:** S10 (Attribution).
- **Bloqueio para publicar:** apenas polish leve em **S3** (labels mock → PT) e **S6b** (badge "MOCK" → "IA"). Total estimado < 15 min.
- **Motion desejável (opcional):** 5 GIFs mapeados; priorizar AI Builder typing e Revenue counter.
- **Decisão:** Jornada já é viável com os assets atuais. Polish dos dois itens acima destrava produção da LP V2.
