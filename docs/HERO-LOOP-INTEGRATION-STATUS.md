# Hero Loop Integration Status
**FASE 27D.2 — Auditado em 2026-06-08**

---

## STATUS GERAL: PARTIAL

O componente `HeroVideo` está integrado e funcional. Os assets binários (vídeo) precisam ser gerados manualmente pelo usuário.

---

## Arquivos Verificados

| Arquivo | Esperado em | Existe | Observação |
|---------|------------|--------|------------|
| `src/pages/Landing.tsx` | `src/pages/` | ✅ | `HeroVideo` integrado — commit `c1edec6` |
| `hero-loop-recorder.html` | raiz do repo | ✅ | Gerado nesta fase — FASE 27D.2 |
| `docs/HERO-LOOP-MANUAL-EXPORT.md` | `docs/` | ✅ | Gerado nesta fase — FASE 27D.2 |
| `public/hero-loop-poster.jpg` | `public/` | ❌ | Gerar via recorder (Passo 2) |
| `public/hero-loop.webm` | `public/` | ❌ | Gerar via recorder (Passo 3) |
| `public/hero-loop.mp4` | `public/` | ❌ | Converter do WEBM (Passo 4) |

---

## O que foi feito nesta fase

### `HeroVideo` — componente (FASE 27D, commit `c1edec6`)

- Integrado em `src/pages/Landing.tsx` (linhas 255–395)
- `useReducedMotion()` hook detecta `prefers-reduced-motion: reduce`
- Fallback automático: reduzida → mockup estático animado | erro de load → mockup estático
- Play overlay quando autoplay é bloqueado pelo browser
- Analytics: `gtag("event", "hero_video_play/pause/ended")` + `CustomEvent("flux:hero_video")`
- TypeScript build: ✅ sem erros

### Paths configurados no código:

```typescript
const HERO_VIDEO_WEBM   = "/hero-loop.webm";
const HERO_VIDEO_MP4    = "/hero-loop.mp4";
const HERO_VIDEO_POSTER = "/hero-loop-poster.jpg";
```

Esses paths apontam para arquivos em `public/` — correto para Vite.

### `hero-loop-recorder.html` — gerado nesta fase

- Canvas 920×520px que replica a animação do hero (3 painéis + chat + score)
- `MediaRecorder` com `canvas.captureStream(30fps)` → WEBM VP9/VP8
- Botão de exportar poster em JPEG (`toBlob`)
- Animação em loop de 10 segundos com timeline idêntica ao componente React
- Funciona em Chrome 94+ e Edge 94+

---

## O que ainda precisa ser feito (ação manual)

**Estimativa de tempo:** 10–15 minutos

### Passo a passo resumido:

```
1. Abrir hero-loop-recorder.html no Chrome
2. Clicar "📸 Exportar Poster" → salvar como public/hero-loop-poster.jpg
3. Clicar "⏺ Gravar WEBM" → aguardar 10s → salvar como public/hero-loop.webm
4. Converter para MP4:
   ffmpeg -i public/hero-loop.webm -c:v libx264 -crf 22 -movflags +faststart -an public/hero-loop.mp4
5. npm run build && npm run preview → confirmar vídeo aparecendo
6. git add public/hero-loop.* && git commit -m "feat: add hero loop video assets"
```

Guia completo: `docs/HERO-LOOP-MANUAL-EXPORT.md`

---

## Por que não foi gerado automaticamente

O ambiente de execução remota (Claude Code na web) não tem:
- Acesso a browser com MediaRecorder
- FFmpeg disponível no PATH (`which ffmpeg` → not found)
- Playwright com suporte a canvas recording neste sandbox

O `hero-loop-recorder.html` foi criado exatamente para resolver isso — roda no browser do usuário onde essas capacidades existem.

---

## Comportamento atual da LP (enquanto assets não existem)

O componente `HeroVideo` detecta o erro de carregamento via `onError` e cai automaticamente no fallback:

```
Arquivo não existe em public/
         ↓
<video onError={...} />
         ↓
setVideoFailed(true)
         ↓
Exibe mockup estático animado (fallback)
```

**A LP não quebra. Não há erro visível.** O usuário vê o mockup animado exatamente como antes da FASE 27D.

---

## Critério para mudar status para READY

- [ ] `public/hero-loop.webm` existe
- [ ] `public/hero-loop.mp4` existe
- [ ] `public/hero-loop-poster.jpg` existe
- [ ] `npm run build` passa sem erros
- [ ] LP exibe vídeo em Chrome (não o mockup)
- [ ] `prefers-reduced-motion` cai no mockup

---

## Referências

- [HERO-LOOP-MANUAL-EXPORT.md](./HERO-LOOP-MANUAL-EXPORT.md) — guia passo a passo completo
- `src/pages/Landing.tsx` linhas 255–395 — implementação do `HeroVideo`
- `hero-loop-recorder.html` — gerador de assets no browser
