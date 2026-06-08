# Hero Loop — Manual Export Guide
**Como gerar hero-loop.webm, hero-loop.mp4 e hero-loop-poster.jpg**

---

## Contexto

O componente `HeroVideo` em `src/pages/Landing.tsx` aponta para 3 arquivos em `public/`:

| Arquivo | Variável no código | Status |
|---------|-------------------|--------|
| `/hero-loop.webm` | `HERO_VIDEO_WEBM` | ❌ Faltando |
| `/hero-loop.mp4` | `HERO_VIDEO_MP4` | ❌ Faltando |
| `/hero-loop-poster.jpg` | `HERO_VIDEO_POSTER` | ❌ Faltando |

Enquanto os 3 arquivos não existirem em `public/`, a LP exibe o mockup animado estático como fallback (comportamento correto — sem erro).

---

## Passo 1 — Abrir o Recorder

Abra o arquivo `hero-loop-recorder.html` diretamente no **Google Chrome** ou **Microsoft Edge**:

```
Opção A — arrastar para o browser:
  Abrir o Finder/Explorer → arrastar hero-loop-recorder.html para a janela do Chrome

Opção B — via terminal:
  open hero-loop-recorder.html          # macOS
  start hero-loop-recorder.html         # Windows
  xdg-open hero-loop-recorder.html      # Linux
```

> **Firefox não funciona** para gravação — use Chrome 94+ ou Edge 94+.

---

## Passo 2 — Gerar o Poster (JPG)

1. Com o recorder aberto no browser, aguarde a animação iniciar (1–2 segundos)
2. Clique em **📸 Exportar Poster (JPG)**
3. O arquivo `hero-loop-poster.jpg` é baixado automaticamente
4. Mova para `public/hero-loop-poster.jpg`

---

## Passo 3 — Gravar o WEBM

1. Clique em **⏺ Gravar WEBM (10s)**
2. A animação reinicia e é gravada por 10 segundos
3. Ao terminar, um link **⬇ Baixar hero-loop.webm** aparece na tela
4. Clique no link — o arquivo é baixado
5. Mova para `public/hero-loop.webm`

> Dica: para uma animação mais suave, feche outras abas antes de gravar.

---

## Passo 4 — Converter para MP4

O componente precisa de ambos os formatos. Escolha uma das opções:

### Opção A — FFmpeg (recomendado, local)

```bash
ffmpeg -i public/hero-loop.webm \
  -c:v libx264 -preset slow -crf 22 \
  -movflags +faststart \
  -an \
  public/hero-loop.mp4
```

Instalar FFmpeg se necessário:
```bash
brew install ffmpeg          # macOS
winget install Gyan.FFmpeg   # Windows
apt install ffmpeg           # Linux/Ubuntu
```

### Opção B — HandBrake (interface gráfica, gratuito)

1. Baixar em [handbrake.fr](https://handbrake.fr)
2. Abrir `hero-loop.webm` no HandBrake
3. Preset: **Fast 1080p30**
4. Destination: `public/hero-loop.mp4`
5. Clicar **Start Encode**

### Opção C — Online (sem instalação)

1. Acessar [cloudconvert.com/webm-to-mp4](https://cloudconvert.com/webm-to-mp4)
2. Upload: `hero-loop.webm`
3. Converter e baixar
4. Renomear para `hero-loop.mp4` e mover para `public/`

---

## Passo 5 — Verificar os arquivos

```bash
ls -lh public/hero-loop*
```

Esperado:
```
public/hero-loop-poster.jpg  ~80–150 KB
public/hero-loop.webm        ~1–3 MB
public/hero-loop.mp4         ~2–5 MB
```

---

## Passo 6 — Rodar o build e validar

```bash
npm run build
npm run preview
```

Abrir `http://localhost:4173` no browser.

**O que verificar:**
- [ ] Hero da LP exibe vídeo (não o mockup estático)
- [ ] Vídeo começa automaticamente sem som
- [ ] Vídeo faz loop contínuo
- [ ] Ativando `prefers-reduced-motion` no DevTools → deve cair no mockup estático

**Como testar prefers-reduced-motion no Chrome DevTools:**
1. F12 → aba Rendering (no menu ⋮ → More tools)
2. "Emulate CSS media feature prefers-reduced-motion" → reduce
3. Recarregar a página — deve mostrar o mockup animado em CSS

---

## Passo 7 — Commit

```bash
git add public/hero-loop.webm public/hero-loop.mp4 public/hero-loop-poster.jpg
git commit -m "feat: add hero loop video assets (WEBM + MP4 + poster)"
git push
```

---

## Troubleshooting

| Problema | Causa provável | Solução |
|----------|---------------|---------|
| Botão de gravar não funciona | Firefox ou browser antigo | Usar Chrome 94+ |
| Vídeo não aparece na LP | Arquivos não estão em `public/` | Verificar caminho exato |
| Vídeo aparece mas sem autoplay | Browser bloqueou autoplay | Normal — botão play aparece automaticamente |
| Arquivo muito grande (>10MB) | Bitrate alto | Reduzir CRF no FFmpeg (ex: -crf 28) |
| `prefers-reduced-motion` não cai no fallback | HeroVideo está ignorando o hook | Verificar `useReducedMotion` em Landing.tsx |
