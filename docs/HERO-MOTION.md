# Flux Agent Studio — Hero Motion Design
## FASE 26B.1 · Animações, Timings e Sequencing

> Especificação técnica completa de motion para o Hero da LP V2.
> Filosofia: Emil Kowalski — motion serve à compreensão, amplitude baixa,
> easing natural, prefers-reduced-motion sempre respeitado.
> Distinção: motion pedagógico (ensina o produto) vs. motion premium (eleva percepção).

---

## Princípio de Motion

**O que o motion do hero precisa fazer:**

1. Criar ritmo — direcionar o olhar de cima para baixo na ordem certa
2. Dar vida — sinalizar que o produto existe e funciona (o mockup não é uma imagem morta)
3. Não distrair — nenhuma animação deve competir com a leitura do H1

**O que o motion do hero NÃO deve fazer:**

- Loops contínuos chamativos que poluem a leitura (AI-slop pattern)
- Partículas flutuantes, gradientes pulsando, glow oscillating
- Animações que começam antes do usuário ter lido o H1
- Qualquer coisa que faça o visitante pensar "uau, que animação" em vez de "isso resolve meu problema"

---

## 1. Sequência Completa de Entrada

### Timeline total: 0ms → ~1800ms (após DOMContentLoaded)

```
T+0ms    → página carrega, todos os elementos hero em opacity:0
T+100ms  → [INÍCIO] eyebrow badge faz fade+slide
T+250ms  → H1 linha 1 entra (stagger por palavra ou por linha)
T+400ms  → H1 linha 2 entra
T+550ms  → H1 linha 3 entra (se existir)
T+650ms  → Subheadline entra
T+800ms  → CTAs entram (juntos, sem stagger entre si)
T+900ms  → Trust line entra
T+1000ms → [INÍCIO] Mockup faz fade+scale de entrada
T+1200ms → [INÍCIO] animação interna do mockup começa (blocos se montando)
T+1800ms → [FIM] todas as animações de entrada encerradas
T+2000ms → estado steady: apenas o glow de fundo respira (loop de 4s)
```

---

## 2. Especificações por Elemento

### 2.1 — Eyebrow Badge

```
Propriedades:
  opacity: 0 → 1
  transform: translateY(8px) → translateY(0)

Timing:
  duration: 400ms
  delay: 100ms
  easing: cubic-bezier(0.16, 1, 0.3, 1)  /* ease-out expo */

Tipo: PREMIUM (cria expectativa antes do H1)
```

### 2.2 — H1 (Headline Principal)

**Opção A — Stagger por linha (recomendada — mais limpa)**

```
Cada linha do H1 é um elemento separado.
Cada linha anima independentemente.

Linha 1: delay 250ms
Linha 2: delay 380ms
Linha 3 (se existir): delay 510ms

Por linha:
  opacity: 0 → 1
  transform: translateY(12px) → translateY(0)
  duration: 500ms
  easing: cubic-bezier(0.16, 1, 0.3, 1)
```

**Opção B — Stagger por palavra (mais dramático — risco de distração)**

```
Cada palavra é um span.
Delay: index × 40ms + 250ms base
opacity: 0 → 1
transform: translateY(8px) → translateY(0)
duration: 400ms

⚠️ Usar apenas se H1 tiver no máximo 8 palavras.
Para "Seu próximo cliente está esperando resposta. O Flux já deu." = 12 palavras — muito longo para Opção B.
```

**Decisão: Opção A (stagger por linha)** — mais elegante, menos distrativo, funciona em qualquer comprimento de headline.

```
Tipo: PREMIUM (ritmo, conduz o olhar)
```

### 2.3 — Subheadline

```
Propriedades:
  opacity: 0 → 1
  transform: translateY(10px) → translateY(0)

Timing:
  duration: 450ms
  delay: 650ms
  easing: cubic-bezier(0.16, 1, 0.3, 1)

Tipo: PREMIUM (continuidade do ritmo)
```

### 2.4 — CTAs (Botões)

```
Propriedades:
  opacity: 0 → 1
  transform: translateY(8px) → translateY(0)

Timing:
  duration: 400ms
  delay: 800ms  (ambos os CTAs juntos — sem stagger entre si)
  easing: cubic-bezier(0.16, 1, 0.3, 1)

Hover state (âmbar primário):
  scale: 1 → 1.02
  brightness: 1 → 1.08
  duration: 150ms
  easing: cubic-bezier(0.34, 1.56, 0.64, 1)  /* spring leve */

Press state (âmbar primário):
  scale: 1.02 → 0.98
  duration: 100ms
  easing: ease-in

Tipo: PREMIUM (feedback tátil + convite)
```

### 2.5 — Trust Line

```
Propriedades:
  opacity: 0 → 0.7 (não chega a 1 — é texto secundário)

Timing:
  duration: 350ms
  delay: 900ms
  easing: ease-out

Tipo: PREMIUM (termina a sequência de entrada)
```

### 2.6 — Mockup (Container)

```
Propriedades:
  opacity: 0 → 1
  transform: translateY(20px) scale(0.97) → translateY(0) scale(1)

Timing:
  duration: 600ms
  delay: 1000ms
  easing: cubic-bezier(0.16, 1, 0.3, 1)

Nota: scale de 0.97→1 é sutil (3% — quase imperceptível conscientemente,
mas cria sensação de "surgir" que é mais elegante que só fade)

Tipo: PREMIUM (reveal do asset principal)
```

---

## 3. Animação Interna do Mockup (Motion Pedagógico)

Esta é a animação mais importante da LP. Começa após o container do mockup aparecer.

### 3.1 — Sequência de montagem do Canvas

**O que acontece:** os blocos do fluxo aparecem um a um, em ordem, com as conexões se desenhando entre eles.

```
T+1200ms → Bloco "Saudação" aparece (fade + slide de cima, 300ms)
T+1500ms → Linha SVG de "Saudação" → "Coleta Nome" se desenha (stroke-dashoffset, 250ms)
T+1750ms → Bloco "Coleta Nome" aparece (300ms)
T+2000ms → Linha SVG de "Coleta Nome" → "IA: Qualifica" se desenha (300ms)
T+2300ms → Bloco "IA: Qualifica" aparece COM glow teal (400ms — mais devagar, é o diferencial)
T+2700ms → Linha SVG de "IA: Qualifica" → "CRM" se desenha, em cor âmbar (250ms)
T+2950ms → Bloco "CRM" aparece (300ms)
T+3250ms → [FIM da montagem do canvas] — todos os blocos visíveis, steady
```

**Especificação da linha SVG que se desenha:**

```css
.connection-line {
  stroke-dasharray: 200;
  stroke-dashoffset: 200;  /* começa "escondida" */
  animation: drawLine 250ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes drawLine {
  to { stroke-dashoffset: 0; }
}
```

**Por que o bloco IA tem animação mais longa (400ms vs 300ms):** é o diferencial central do produto. Uma pausa visual imperceptível (100ms extra) faz o olho pousar mais ali. É motion como hierarquia.

```
Tipo: PEDAGÓGICO (ensina: blocos se conectam → isso é um fluxo → IA está no meio)
```

### 3.2 — Simulação de Chat (Painel Preview)

**O que acontece:** enquanto o canvas se monta, o painel de preview simula uma conversa ao vivo com efeito de digitação.

```
T+1400ms → Bolha do bot aparece: "Olá! Sou o assistente da [Empresa]."
           (fade-in, sem typing animation — aparece completa)

T+2200ms → Indicador de digitação (3 pontos pulsando, 600ms)

T+2800ms → Bolha do usuário aparece: "Tenho interesse no serviço."
           (alinhada à direita, cor teal-5 bg, 300ms fade)

T+3400ms → Indicador de digitação (500ms)

T+3900ms → Bolha do bot: "Perfeito! Qual o seu nome?"
           (300ms fade)

T+4500ms → [FIM] — chat em estado final, sem mais animação
```

**Por que não usar typing animation letra-a-letra:** é lento e distrativo. O visitante lê mais rápido do que a animação digita. Bolha aparece completa = mais limpo, mais rápido, mais real.

```
Tipo: PEDAGÓGICO (mostra que o produto conversa de verdade)
```

### 3.3 — Glow Sutil no Bloco IA

Após a montagem completa do canvas (T+3250ms), o bloco "IA: Qualifica" tem um glow teal que **pulsa lentamente em loop** — indica que esse bloco está ativo/processando.

```css
@keyframes aiGlow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(13, 148, 136, 0); }
  50%       { box-shadow: 0 0 20px 4px rgba(13, 148, 136, 0.25); }
}

.ai-block-active {
  animation: aiGlow 3000ms cubic-bezier(0.4, 0, 0.6, 1) infinite;
  animation-delay: 3250ms;  /* começa após montagem */
}
```

```
Tipo: PREMIUM + PEDAGÓGICO (sinaliza "IA está aqui e está ativa")
```

---

## 4. Estado Steady (Pós-Entrada)

Após todas as animações de entrada (T+4500ms), o Hero tem dois elementos em movimento contínuo:

### 4.1 — Glow de Fundo (Radial Teal)

```css
@keyframes heroGlow {
  0%, 100% { opacity: 0.15; transform: scale(1); }
  50%       { opacity: 0.22; transform: scale(1.04); }
}

.hero-glow-bg {
  animation: heroGlow 5000ms cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

**Amplitude:** de 0.15 a 0.22 de opacidade (diferença de 0.07 — imperceptível conscientemente, mas cria "vida" na página).

```
Tipo: PREMIUM (a página não parece morta — respira)
```

### 4.2 — Bloco IA pulsando (conforme 3.3)

Continua em loop infinito de 3s. É o único loop visível.

### 4.3 — Tudo mais: estático

Sem parallax, sem partículas, sem elementos flutuando. O visitante que para de scrollar vê uma página que respira sutilmente — não um festival de animações.

---

## 5. Interações de Hover

### Hover nos Cards de Feature (Seções abaixo do hero)

```css
.feature-card {
  transition: transform 200ms cubic-bezier(0.16, 1, 0.3, 1),
              border-color 200ms ease,
              box-shadow 200ms ease;
}

.feature-card:hover {
  transform: translateY(-4px);
  border-color: rgba(13, 148, 136, 0.25);
  box-shadow: 0 12px 32px -8px rgba(13, 148, 136, 0.12);
}
```

**Amplitude -4px:** sutil, não exagerado. Qualquer coisa acima de -6px parece brinquedo.

### Hover no CTA Âmbar

```css
.cta-primary {
  transition: transform 150ms cubic-bezier(0.34, 1.56, 0.64, 1),
              filter 150ms ease;
}

.cta-primary:hover {
  transform: scale(1.03);
  filter: brightness(1.1);
}

.cta-primary:active {
  transform: scale(0.97);
  transition-duration: 80ms;
}
```

---

## 6. Scroll Reveals (Seções Abaixo do Hero)

Todas as seções abaixo do hero usam IntersectionObserver para revelar ao entrar no viewport:

```javascript
/* Comportamento padrão por elemento revelado */
{
  initial: {
    opacity: 0,
    transform: 'translateY(16px)'
  },
  animate: {
    opacity: 1,
    transform: 'translateY(0)'
  },
  duration: 500ms,
  easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
  threshold: 0.15  /* dispara quando 15% do elemento está visível */
}
```

**Stagger em grids de cards:**

```javascript
/* Cada card tem delay adicional proporcional ao index */
delay: baseDelay + (index * 70ms)
/* Ex: card[0] = 0ms, card[1] = 70ms, card[2] = 140ms, card[3] = 210ms */
```

**Máximo de stagger:** 280ms (4 itens). Para grids maiores, reiniciar o contador por linha.

---

## 7. Prefers-Reduced-Motion

```css
@media (prefers-reduced-motion: reduce) {
  /* Remove todas as animações de entrada */
  .lp-animate-enter {
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
    animation: none !important;
  }

  /* Remove loops */
  .hero-glow-bg,
  .ai-block-active {
    animation: none !important;
  }

  /* Mantém hover com transição mínima (200ms opacity only) */
  .feature-card:hover {
    transform: none;
    border-color: rgba(13, 148, 136, 0.25);
    transition: border-color 200ms ease;
  }
}
```

**Regra:** com reduced-motion, todos os elementos aparecem em seu estado final imediatamente. Nenhum conteúdo fica escondido ou bloqueado. Hover mantém feedback mínimo.

---

## 8. Implementação Técnica (Diretrizes para Código)

```
Biblioteca preferida: CSS nativo (@keyframes + transition)
  Motivo: zero dependência, máxima performance, menor bundle.

Alternativa para sequências complexas: Framer Motion
  Motivo: stagger e sequence com código limpo.
  Usar apenas se CSS nativo ficar complexo demais para manter.

IntersectionObserver: hook próprio (useScrollReveal)
  Não usar biblioteca de scroll animation (GSAP, AOS) — overhead desnecessário.

Performance:
  Animar apenas: opacity, transform (translate, scale)
  NUNCA animar: width, height, top, left, margin, padding, border-radius
  (causam layout recalculation — jank visível em mobile)

GPU acceleration:
  Adicionar will-change: transform em elementos com animação de entrada
  Remover após animação completar (evita memory leak em mobile)
```

---

## Resumo Visual da Sequência Completa

```
ms      Elemento              Tipo
────────────────────────────────────────────────
0       (DOM carrega)
100     Eyebrow badge         ↑ fade+slide       PREMIUM
250     H1 linha 1            ↑ fade+slide       PREMIUM
380     H1 linha 2            ↑ fade+slide       PREMIUM
510     H1 linha 3 (se houver)↑ fade+slide       PREMIUM
650     Subheadline           ↑ fade+slide       PREMIUM
800     CTAs                  ↑ fade+slide       PREMIUM
900     Trust line            → fade             PREMIUM
1000    Mockup container      ↑ fade+scale       PREMIUM
1200    Canvas: Bloco Saudação↓ aparecer         PEDAGÓGICO
1500    Canvas: Linha 1→2     → draw SVG path    PEDAGÓGICO
1750    Canvas: Bloco Nome    ↓ aparecer         PEDAGÓGICO
2000    Canvas: Linha 2→IA    → draw SVG path    PEDAGÓGICO
2300    Canvas: Bloco IA ✦    ↓ aparecer + glow  PEDAGÓGICO+
2700    Canvas: Linha IA→CRM  → draw (âmbar)     PEDAGÓGICO
2950    Canvas: Bloco CRM     ↓ aparecer         PEDAGÓGICO
1400    Chat: Msg bot 1       → fade bolha       PEDAGÓGICO
2200    Chat: Typing indicator ··· pulso          PEDAGÓGICO
2800    Chat: Msg usuário     → fade bolha       PEDAGÓGICO
3400    Chat: Typing indicator ··· pulso          PEDAGÓGICO
3900    Chat: Msg bot 2       → fade bolha       PEDAGÓGICO
3250+∞  IA glow               ◉ loop 3s          PREMIUM
0+∞     Hero bg glow          ◉ loop 5s          PREMIUM
────────────────────────────────────────────────
4500    ESTADO FINAL — página em repouso         
```

---

*Criado: 2026-06-03 · FASE 26B.1*
*Aplicado em: `src/pages/Landing.tsx` — aguarda aprovação para implementação*
*Referência de filosofia: Emil Kowalski (animations.dev), gstack design-review*
