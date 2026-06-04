# Flux Agent Studio — Design System da Landing Page V2
## FASE 26B.1 · Fundação Visual Definitiva

> Este documento define os tokens visuais, tipografia, grid, motion e componentes
> exclusivos da Landing Page V2. Não altera o design system do app interno.
> Aplicado via CSS custom properties scoped à raiz de `Landing.tsx`.

---

## Princípio de Design

**Anti-tese do AI-slop:** roxo + grid + glassmorphism + glow radial = a LP que qualquer ferramenta de IA gerou em 2024. O sistema atual do produto cai exatamente nesse padrão. A LP V2 se afasta em três eixos:

1. **Cor:** teal profundo substitui o roxo genérico. Teal remete a dinheiro, crescimento e confiança — e é raro no nicho de ferramentas de IA.
2. **Tipografia:** display com caráter próprio, não Inter/Geist neutro.
3. **Superfície:** produto como protagonista visual — screenshots reais com dados densos, não maquetes vazias e gradientes decorativos.

**Referências visuais de destino:** Linear (craft de motion), Clay (produto como protagonista), Attio (dark refinado com dados reais), Stripe (hierarquia e espaçamento impecáveis).

**Referências a evitar:** qualquer LP de "AI chatbot" de 2024 com hero de glow roxo + grid isométrico + mockup flutuando.

---

## 1. Paleta de Cores

### Filosofia de cor

A LP usa um sistema de **3 papéis cromáticos** com intenção clara:
- **Primária (Teal):** identidade, confiança, CTA de navegação
- **Accent (Âmbar):** ação, urgência, CTA principal de conversão
- **Neutros:** fundo dark refinado, não preto absoluto

### Tokens da LP (override do sistema do app)

```css
/* LP V2 — scoped na class .lp-v2 ou em Landing.tsx diretamente */

--lp-bg:           #09090C;   /* dark quase-preto com leve azul frio */
--lp-bg-elevated:  #0F0F14;   /* cards, superfícies elevadas */
--lp-bg-subtle:    #141419;   /* seções alternadas */

--lp-primary:      #0D9488;   /* Teal-600 — primária principal */
--lp-primary-dark: #0F766E;   /* Teal-700 — hover, sombras */
--lp-primary-glow: #14B8A6;   /* Teal-500 — glow, gradient light */

--lp-accent:       #D97706;   /* Amber-600 — CTA principal */
--lp-accent-light: #F59E0B;   /* Amber-400 — hover do CTA */
--lp-accent-glow:  rgba(217, 119, 6, 0.20); /* glow suave */

--lp-fg:           #F8FAFC;   /* texto principal */
--lp-fg-muted:     #94A3B8;   /* texto secundário / labels */
--lp-fg-subtle:    #475569;   /* texto terciário / placeholders */

--lp-border:       rgba(255,255,255,0.07); /* borda sutil em dark */
--lp-border-mid:   rgba(255,255,255,0.12); /* borda de foco / hover */

--lp-teal-5:       rgba(13, 148, 136, 0.05);
--lp-teal-10:      rgba(13, 148, 136, 0.10);
--lp-teal-20:      rgba(13, 148, 136, 0.20);

/* Gradientes */
--lp-gradient-hero: radial-gradient(
  ellipse 80% 60% at 50% -10%,
  rgba(13,148,136,0.18) 0%,
  transparent 70%
);
--lp-gradient-cta: linear-gradient(135deg, #0D9488 0%, #0F766E 100%);
--lp-gradient-accent: linear-gradient(135deg, #D97706 0%, #F59E0B 100%);
--lp-gradient-section: linear-gradient(
  180deg, transparent 0%, rgba(13,148,136,0.04) 50%, transparent 100%
);
```

### Regras de uso de cor

- **Gradientes:** apenas no hero background (radial sutil) e no CTA final. **Nunca** em feature cards — é exatamente o padrão AI-slop que queremos evitar.
- **Teal:** primária de identidade e links. Nunca em botões de conversão.
- **Âmbar:** exclusivo para CTA principal "Começar grátis". Cria contraste e urgência. Nunca misturar com teal no mesmo componente.
- **Grid-bg:** **removido** da LP V2. É o maior marcador de AI-slop visual. Substituído por gradiente radial de baixíssima opacidade.

---

## 2. Tipografia

### Sistema tipográfico

O produto usa `Space Grotesk` (display) + `Inter` (body). Mantemos essa combinação pois Space Grotesk tem caráter próprio — mas ajustamos os valores de tamanho, peso e tracking para a LP (maiores e mais ousados que no app).

```css
/* Escala tipográfica da LP */
--lp-font-display: "Space Grotesk", "Inter", system-ui, sans-serif;
--lp-font-body:    "Inter", system-ui, sans-serif;
--lp-font-mono:    "JetBrains Mono", ui-monospace, monospace;

/* Tamanhos — LP usa escala maior que o app */
--lp-text-xs:   0.75rem;   /* 12px — labels, badges */
--lp-text-sm:   0.875rem;  /* 14px — body secundário */
--lp-text-base: 1rem;      /* 16px — body principal */
--lp-text-lg:   1.125rem;  /* 18px — sub-headlines de seção */
--lp-text-xl:   1.25rem;   /* 20px — cards de feature */
--lp-text-2xl:  1.5rem;    /* 24px — headlines de seção mobile */
--lp-text-3xl:  1.875rem;  /* 30px — sub-hero */
--lp-text-4xl:  2.25rem;   /* 36px — headlines de seção desktop */
--lp-text-5xl:  3rem;      /* 48px — hero mobile */
--lp-text-6xl:  3.75rem;   /* 60px — hero tablet */
--lp-text-7xl:  4.5rem;    /* 72px — hero desktop */

/* Tracking e peso por elemento */
/* Hero H1: font-weight 800, letter-spacing -0.03em, line-height 1.02 */
/* Seção H2: font-weight 700, letter-spacing -0.02em, line-height 1.1  */
/* Body LP: font-weight 400, letter-spacing 0, line-height 1.7         */
/* Label/eyebrow: font-weight 600, letter-spacing 0.08em, uppercase    */
```

### Regras tipográficas

- **H1 do hero:** sempre display, 800, tracking -0.03em — máximo impacto em leitura rápida
- **Eyebrows/labels:** uppercase, tracking 0.08em, font-weight 600, cor teal — sinalizam seção sem competir com o H2
- **Body:** Inter regular, line-height 1.7 — legível em parágrafos longos
- **Números/métricas (count-up):** font-mono, tabular-nums — precisão e confiabilidade
- **Sem texto em gradiente no H1** — é o segundo maior marcador de AI-slop. Apenas um accent word pode ter cor teal sólida, não gradiente.

---

## 3. Spacing System

### Grid base

A LP usa `8px` como unidade base. Todo espaçamento é múltiplo de 8.

```
4px  — micro (gap interno de badge, ícone + label)
8px  — xs (padding de tag, espaço entre label e valor)
16px — sm (gap entre itens de lista, padding de card pequeno)
24px — md (gap padrão de grid, padding interno de card)
32px — lg (margem entre sub-seções)
48px — xl (padding de seção mobile)
64px — 2xl (padding de seção desktop)
96px — 3xl (espaço entre seções maiores)
128px — 4xl (espaço hero → próxima seção)
```

### Grid de layout

```
Container max-width: 1200px (mais apertado que o app — mais legível)
Colunas: 12
Gutter desktop: 24px
Gutter mobile: 16px
Margin lateral mobile: 20px
Margin lateral desktop: 48px
```

### Padding de seção (vertical)

```
mobile:  py-16 (64px)
tablet:  py-20 (80px)
desktop: py-24 (96px)
hero:    pt-40 pb-32 (160px/128px)
```

---

## 4. Motion Tokens

> Baseado na filosofia Emil Kowalski: motion serve à compreensão, não à decoração. Easing natural, amplitude baixa, `prefers-reduced-motion` sempre respeitado.

```css
/* Durações */
--lp-dur-instant:  100ms;   /* feedback tátil (botão press) */
--lp-dur-fast:     200ms;   /* hover states, tooltips */
--lp-dur-base:     300ms;   /* transições de UI (dropdown, accordion) */
--lp-dur-enter:    500ms;   /* entrada de elemento no viewport */
--lp-dur-section:  600ms;   /* reveal de seção completa */
--lp-dur-hero:     800ms;   /* animação principal do hero */
--lp-dur-sequence: 1200ms;  /* sequências multi-step (mockup se montando) */
--lp-dur-loop:     3000ms;  /* animações em loop (glow respira) */

/* Easings — todos naturais, nenhum linear */
--lp-ease-out:      cubic-bezier(0.16, 1, 0.3, 1);    /* saída expo — padrão de entrada */
--lp-ease-in-out:   cubic-bezier(0.45, 0, 0.55, 1);   /* transições simétricas */
--lp-ease-spring:   cubic-bezier(0.34, 1.56, 0.64, 1); /* spring leve — botão, card hover */
--lp-ease-glow:     cubic-bezier(0.4, 0, 0.6, 1);     /* loops de respiração */

/* Delays para stagger */
--lp-stagger-1: 0ms;
--lp-stagger-2: 70ms;
--lp-stagger-3: 140ms;
--lp-stagger-4: 210ms;
--lp-stagger-5: 280ms;

/* Amplitudes de translate (baixas — nunca exageradas) */
--lp-translate-enter: 16px;   /* elementos entrando de baixo */
--lp-translate-subtle: 8px;   /* hover de card (sobe levemente) */
--lp-translate-micro: 2px;    /* press de botão */
```

### Regra de motion reduzido

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 5. Componentes Principais da LP

### Nav

```
Position: fixed top
Height: 64px
Background: blur(20px) + lp-bg/80
Border-bottom: 1px solid lp-border
Transition: background 300ms ease, border 300ms ease (opacidade aumenta ao scroll)

Conteúdo:
  Logo: Sparkles icon (teal) + "Flux Agent Studio" (Space Grotesk 600)
  Links: text-sm, text-muted, hover:text-fg, gap-7
  CTA: botão âmbar "Começar grátis" + ArrowRight icon
```

### Hero Section

```
Layout: coluna centralizada, max-w-3xl
Background: lp-gradient-hero (radial teal suave no topo)
Sem grid-bg.

Elementos (de cima para baixo):
  1. Eyebrow badge: border teal/30, bg teal/5, texto "Conversational Revenue OS"
  2. H1: Space Grotesk 800, 72px desktop / 48px mobile, tracking -0.03em
  3. Subheadline: Inter 400, 18px, muted, max-w-xl
  4. CTAs: âmbar primário + outline secundário
  5. Trust line: texto xs muted, sem cartão · 14 dias · LGPD
  6. Mockup animado: card com chrome bar + canvas do produto
```

### Feature Cards (Seção de produto)

```
Border: 1px solid lp-border
Background: lp-bg-elevated
Border-radius: 16px
Padding: 24px
Hover: border-color → lp-border-mid, translateY -4px
Transition: 200ms ease-out

Estrutura:
  Ícone (teal/10 bg, teal fg, 44px square, radius 12px)
  H3 (Space Grotesk 600, 18px)
  Body (Inter 400, 14px, muted, leading-relaxed)
```

### Journey Steps (Seção Jornada)

```
Layout: vertical scrollytelling (alternado: texto esquerda/screenshot direita)
Step indicator: número grande (80px, teal/10), label da etapa
Screenshot: border lp-border, rounded-2xl, shadow-card
Linha conectora: SVG vertical, stroke teal, stroke-dasharray animado
```

### CTA Block (Seção final)

```
Background: lp-bg-subtle com borda teal/20
Border-radius: 24px
Overflow: hidden
Glow: radial-gradient âmbar/10 no centro
Padding: 64px desktop / 40px mobile
```

### Badges de Trust

```
Layout: flex row, gap 24px, texto xs
Ícone: check circle teal
Texto: muted-foreground
Exemplos: "Sem cartão de crédito", "14 dias grátis", "LGPD compliant", "Cancele quando quiser"
```

---

## 6. Dark Mode / Light Mode

### Decisão

**A LP V2 é dark-only.** Motivo:

1. O produto já é dark-first. Consistência com o app.
2. Dark faz screenshots do produto se integrarem naturalmente (sem borda visível).
3. Dark premium é o padrão das LPs de referência (Linear, Vercel, Attio).
4. Implementar light-mode dual aumenta complexidade sem benefício claro neste estágio.

Se no futuro houver demanda de light-mode (SEO, acessibilidade de nicho), é uma adição — não um refactor.

---

## 7. Responsividade

### Breakpoints

```
mobile:  < 640px  (default)
tablet:  640px–1024px (sm/md)
desktop: ≥ 1024px (lg+)
```

### Comportamento por breakpoint

| Componente | Mobile | Tablet | Desktop |
|---|---|---|---|
| Hero H1 | 48px (5xl) | 60px (6xl) | 72px (7xl) |
| Hero layout | coluna | coluna | coluna |
| Mockup | 100% width | max-w-2xl | max-w-4xl |
| Feature grid | 1 col | 2 col | 4 col |
| Journey steps | coluna | coluna | alternado L/R |
| Nav links | ocultos | ocultos | visíveis |
| Nav CTA | visível | visível | visível |

---

## 8. Decisões Estratégicas Finais

| Elemento | Decisão | Motivo |
|---|---|---|
| Cor primária | Teal `#0D9488` | Foge do roxo-slop, remete a crescimento/dinheiro |
| Cor de CTA | Âmbar `#D97706` | Máxima conversão, contraste alto em dark, sem conflito com teal |
| Grid visual | Removido | Marcador #1 de AI-slop |
| Gradiente no H1 | Removido | Marcador #2 de AI-slop — apenas accent word em teal sólido |
| Glassmorphism | Mínimo | Só no nav — glassmorphism em cards é padrão desgastado |
| Screenshots | Produto real | Nunca maquete vazia — theater-of-data é o pior sinal de produto |
| Tipografia | Space Grotesk 800 | Já presente no app, tem caráter — apenas uso mais ousado na LP |
| Modo de cor | Dark only | Consistência, qualidade de integração dos screenshots |

---

*Criado: 2026-06-03 · FASE 26B.1*
*Aplicado em: `src/pages/Landing.tsx` (scoped, não altera design system do app)*
