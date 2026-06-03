# LP V2 — Polish Report (Fase 26B.2)

> Auditoria visual final dos 13 screenshots capturados em demo mode. Define o que pode ir para LP hoje e o que precisa de polish antes de aparecer publicamente.

Critérios de classificação:
- **READY** — pode publicar como está; densidade visual e clareza suficientes para LP.
- **NEEDS POLISH** — funcional, mas tem ruído (label mock, layout cortado, dado fraco) que prejudica o pitch.
- **BLOCKING** — não deve aparecer na LP no estado atual; corrigir antes ou substituir.

---

## Classificação

### READY (9)
| ID  | Tela                  | Notas                                                                 |
|-----|-----------------------|-----------------------------------------------------------------------|
| S1  | Dashboard             | Visual mais completo do produto, hero óbvio.                          |
| S4a | PublicBot WhatsApp    | Mockup limpo, cor verde reconhecível.                                 |
| S4b | PublicBot Instagram   | Comprova omnichannel ao lado do S4a.                                  |
| S5  | Leads CRM             | Pipeline 5 colunas equilibradas, 12 leads com scores e tags.          |
| S6a | Lead Timeline         | Eventos densos e legíveis.                                            |
| S6b | Lead Intelligence     | Score breakdown + recomendação + forecast — a venda visual da IA.     |
| S9  | Revenue               | KPIs + canais + forecast. (Pequeno polish opcional no chart 7d.)      |
| S10 | Attribution           | Tabela multi-touch limpa, comprova ROAS.                              |
| S11 | Channels              | Grid 7 canais com estados conectado/desconectado.                     |

### NEEDS POLISH (3)
| ID  | Tela        | Polish necessário                                                                              |
|-----|-------------|------------------------------------------------------------------------------------------------|
| S2  | Builder     | Recentralizar canvas (botão "Fit view" não reposicionou); enquadrar 4–6 blocos conectados.     |
| S3  | AI Builder  | Substituir labels `bot_name_mock` / `summary_mock` por nomes em PT; ocultar toast de geração.  |
| S7  | Conversations | UI atual é só lista; adicionar split-view com thread ou crop pequeno na LP.                  |

### BLOCKING (1)
| ID  | Tela      | Bloqueio                                                                                          |
|-----|-----------|---------------------------------------------------------------------------------------------------|
| S8  | Analytics | Apenas 4 KPIs + texto "em breve". Visualmente fraco demais. Implementar gráfico time-series demo ou substituir esta seção da LP pelo S9 Revenue. |

---

## Top 5 — mais fortes visualmente (impacto imediato)

1. **S1 Dashboard** — densidade + variedade de widgets; mostra "produto de verdade".
2. **S6b Lead Intelligence** — score, recomendação, insights, forecast em uma tela só.
3. **S9 Revenue** — números grandes, barras coloridas, forecast — emoção financeira.
4. **S5 Leads CRM** — kanban familiar a qualquer comercial, equilíbrio entre colunas.
5. **S4a + S4b PublicBot** — par WhatsApp/Instagram lado a lado é o frame mais "real".

## Top 5 — mais fortes para conversão (problema → solução)

1. **S3 AI Builder** — "descreva → blueprint pronto" é a promessa-âncora da LP.
2. **S6b Lead Intelligence** — vende a tese "saiba qual lead vale mais e o que falar".
3. **S9 Revenue** — comprova ROI; converte CMO/CFO.
4. **S5 Leads CRM** — conecta bot → pipeline → receita.
5. **S4a + S4b PublicBot** — prova que o produto entrega no canal certo.

---

## Recomendações de uso na LP

| Seção da LP                | Screenshot recomendado                                       |
|----------------------------|--------------------------------------------------------------|
| **Hero**                   | **S1 Dashboard** (mockup principal) + secundário S3 AI Builder em scroll |
| **Jornada / Como funciona**| **S3 AI Builder → S2 Builder → S4 PublicBot → S5 CRM → S6b Lead Intelligence → S9 Revenue** (sequência narrativa) |
| **CRM integrado**          | **S5 Leads CRM** (principal) + S6a Lead Timeline (detalhe)   |
| **Revenue / ROI**          | **S9 Revenue** (principal) + S10 Attribution (suporte)        |
| **Omnichannel**            | S4a + S4b PublicBot lado a lado + S11 Channels grid          |
| **Lead Intelligence**      | S6b Lead Intelligence                                        |

---

## Sequência de polish antes da LP (priorizado)

1. **S8 Analytics (BLOCKING)** — decidir: implementar gráfico demo ou remover seção dedicada.
2. **S3 AI Builder** — trocar labels mock por copy real (5 min).
3. **S2 Builder** — corrigir "Fit view" no canvas demo para enquadrar blocos.
4. **S7 Conversations** — split-view com thread aberta (opcional se LP usar layout pequeno).
5. **S9 Revenue** — aumentar altura mínima das barras do chart 7 dias (cosmético).
