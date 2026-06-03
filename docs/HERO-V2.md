# Flux Agent Studio — Hero V2
## FASE 26B.1 · Headline, Copy e Estrutura do Hero

> Define o copy, hierarquia e storytelling da primeira seção da LP V2.
> Fonte: MESSAGING-ARCHITECTURE.md, POSITIONING.md, ECONOMIC-ENGINE-GTM.md.
> Nenhum código. Decisões de copy e estrutura.

---

## Princípio do Hero

O Hero não é uma página de boas-vindas. É uma **declaração de categoria**.

Em 3 segundos, o visitante precisa entender:
1. Para quem é (eu sou o público?)
2. O que resolve (isso resolve meu problema?)
3. Por que agora (por que não esperar?)

O erro da LP atual: responde só à pergunta 2, com uma resposta genérica ("builder de chatbot com IA"). A V2 responde as três, com especificidade.

---

## 1. Headline Principal (Vencedora)

```
Seu próximo cliente está
esperando resposta.
O Flux já deu.
```

**Justificativa:**
- Começa com "Seu" — imediato, pessoal, não é sobre o produto
- Nomeia a dor exata: lead sem resposta (o custo mais compreensível de todos)
- "O Flux já deu" — comprime o benefício inteiro em 4 palavras: automação + velocidade + personificação do agente
- Quebra de linha intencional cria ritmo para leitura em 3 beats
- Zero jargão técnico. Zero "plataforma", "solução", "revolucionária"

**Variante mobile (linha única):**
```
Seu lead está esperando.
O Flux já respondeu.
```

---

## 2. Alternativas de Headline (Para Teste A/B)

### Alternativa A — Orientada a resultado financeiro
```
Toda conversa é uma
oportunidade de venda.
O Flux garante que nenhuma se perca.
```
*Tom:* CEO/fundador, foco em receita
*Risco:* mais longo, terceiro verso pode perder impacto

### Alternativa B — Orientada a diferencial de categoria
```
Do primeiro "oi" ao
CRM qualificado.
Automático.
```
*Tom:* gestor comercial, foco em eficiência
*Risco:* "CRM qualificado" exige conhecimento do produto

### Alternativa C — Orientada a dor de escala
```
Seu time não pode
responder a todos.
O Flux Agent Studio pode.
```
*Tom:* dono de PME, foco em limitação humana
*Risco:* "não pode" tem energia negativa no início

### Alternativa D — Orientada a transformação
```
Pare de perder leads
para o silêncio.
```
*Tom:* qualquer ICP, muito direto
*Risco:* curta demais — perde a personalização; pode soar agressiva

### Recomendação de prioridade para A/B
Testar **Headline Principal vs. Alternativa A** como primeiro teste. Principal é mais emocional; A é mais racional. O ICP-1 (dono de PME) tende para emocional; o ICP-2 (gestor comercial) tende para racional.

---

## 3. Subheadline

```
Agentes de IA que atendem, qualificam leads e 
entram no seu CRM automaticamente — 24/7, em 
qualquer canal. Sem código.
```

**Regras aplicadas:**
- Três benefícios encadeados: atendem → qualificam → CRM (a jornada em uma frase)
- "24/7" nomeia a dor de horário (o maior motivador de compra imediata)
- "Sem código" remove objeção de complexidade antes que surja
- Máximo 2 linhas — qualquer coisa além dilui o impacto

**Variante para ICP de agência:**
```
A plataforma que fecha o loop entre campanha, 
conversa e receita — para você provar o ROI 
de cada lead que gera.
```

---

## 4. CTAs

### CTA Primário
```
Botão: "Começar grátis"
Cor: Âmbar (#D97706 → hover #F59E0B)
Ícone: ArrowRight (direita do texto)
Tamanho: h-12, px-7, text-base, font-semibold
```

**Por que âmbar:** contraste máximo em dark, energia de ação, sem conflito com teal de identidade. Psicologicamente: âmbar/laranja é a cor de conversão mais estudada em B2B SaaS.

### CTA Secundário
```
Botão: "Ver demonstração"
Estilo: outline, borda lp-border-mid, bg transparente
Ícone: Play icon (12px, antes do texto)
Ao clicar: ancora na Seção 4 (Jornada) ou abre modal de demo
```

**Por que "Ver demonstração" e não "Ver bot ao vivo":** o anterior apontava para `/bot/sdr-imob` hardcoded. O novo ancora em conteúdo controlado dentro da LP — e sinaliza que há algo a ser mostrado, não apenas descrito.

### Posicionamento dos CTAs
```
Layout: flex row, gap-3, justify-center
Ordem: [Começar grátis] [Ver demonstração]
Mobile: flex-col em telas < 400px
```

---

## 5. Trust Signals

Linha abaixo dos CTAs. Texto xs, muted. Ícones check-circle teal (12px).

```
✓ Sem cartão de crédito   ✓ 14 dias grátis   ✓ LGPD compliant   ✓ Cancele quando quiser
```

**Mobile (quebrado em 2 linhas):**
```
✓ Sem cartão de crédito · ✓ 14 dias grátis
✓ LGPD compliant · ✓ Cancele quando quiser
```

**Por que adicionar LGPD aqui:** o B2B brasileiro tem objeção jurídica latente. Colocar "LGPD compliant" no trust line remove a objeção antes de ela aparecer — especialmente para donos de PME e gestores que já foram advertidos pelo jurídico sobre dados de terceiros.

---

## 6. Eyebrow Badge (Acima do H1)

```
Conteúdo: ⚡ Conversational Revenue OS
Estilo: inline-flex, border teal/30, bg teal/5, text-xs, text-teal-400
Ícone: Zap (10px, teal)
Border-radius: rounded-full
Padding: px-3 py-1
```

**Função do eyebrow:** posiciona a categoria antes da headline. O visitante lê "Conversational Revenue OS" → entende que não é um chatbot → lê a headline com o frame correto.

**Alternativa para lançamento beta:**
```
🔒 Beta fechado · Acesso antecipado disponível
```
Cria escassez percebida sem mentir.

---

## 7. Mockup do Hero

O mockup é o maior ativo visual do Hero — e o maior gap da LP atual (100% estático).

### O que mostrar

Não é um screenshot genérico do Builder. É uma **cena narrativa** de 3 painéis que conta a jornada em uma imagem:

```
┌──────────────────────────────────────────────────────┐
│  chrome bar: fluxagent.studio/builder/sdr-imob       │
├──────────────┬───────────────────────┬───────────────┤
│  PALETA      │   CANVAS              │   PREVIEW     │
│  ─────────   │                       │   ─────────   │
│  Mensagem    │  [Saudação]──────►    │   "Olá! Sou   │
│  Pergunta    │       │               │   o assistente│
│  IA Block ✦  │  [Coleta Nome]        │   do Flux."   │
│  CRM         │       │               │               │
│  Webhook     │  [IA: Qualifica]──►   │   "Oi! Tenho  │
│              │       │    [CRM]      │   interesse." │
│              │  [Fim]                │               │
│              │                       │   "Perfeito!  │
│              │                       │   Qual seu    │
│              │                       │   nome?"      │
└──────────────┴───────────────────────┴───────────────┘
```

### Versão mínima viável (sem GIF/Lottie)

Se não houver tempo para animação completa no MVP da LP:
- Mockup estático com dados realistas e densos (não 3 blocos flutuantes)
- Chrome bar com URL real do produto
- Bloco de IA com glow teal sutil (indica o diferencial central)
- Chat preview com 3–4 mensagens (suficiente para contar a história)
- O node de "CRM" conectado indica que o lead vai para algum lugar (promessa visual)

---

## 8. Storytelling do Hero

O Hero conta uma microhistória em 5 elementos, da primeira à última linha lida:

```
1. EYEBROW: "Conversational Revenue OS"
   → Reframe: isso não é um chatbot, é uma categoria nova

2. H1: "Seu próximo cliente está esperando resposta. O Flux já deu."
   → Dor (lead sem resposta) + Resolução (o sistema já agiu)

3. SUBHEADLINE: "Agentes que atendem, qualificam e entram no CRM..."
   → Como funciona (jornada em uma frase) + Remoção de objeção (sem código)

4. CTAs: "Começar grátis" + "Ver demonstração"
   → Duas intensidades de intenção: pronto para entrar / quero ver antes

5. TRUST: "Sem cartão · 14 dias · LGPD · Cancele quando quiser"
   → Remoção de risco percebido antes de qualquer hesitação

6. MOCKUP ANIMADO: fluxo se montando + chat respondendo
   → Prova visual: o produto existe, funciona, e é isso que faz
```

A narrativa completa dura menos de 10 segundos de leitura. Cada elemento tem função específica — nenhum é decorativo.

---

## 9. Variações de Hero por ICP (Para Futuro)

Quando houver tráfego segmentado (ads por ICP), estas variações do hero podem ser usadas:

### Para Agências
```
Headline: Prove que seus leads se tornam receita.
Sub: Revenue Attribution fecha o loop entre campanha, 
     conversa e fechamento. O relatório que seu cliente 
     sempre pediu.
```

### Para Imobiliárias / Serviços
```
Headline: Nenhum lead perdido no fim de semana.
Sub: Seu agente atende, qualifica e registra cada 
     contato no CRM — enquanto você descansa.
```

### Para Gestores Comerciais
```
Headline: Seu time só fala com lead quente.
Sub: Cada lead chega ao CRM com score, resumo e 
     próxima ação recomendada. Automaticamente.
```

---

*Criado: 2026-06-03 · FASE 26B.1*
*Implementação: `src/pages/Landing.tsx` — aguarda aprovação deste documento*
