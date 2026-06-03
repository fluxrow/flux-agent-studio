# Demo Runtime — Fase 26B.1C

> Runtime oficial de demonstração do produto. Quando ativado, todas as
> telas funcionais do app renderizam **exclusivamente** a partir do
> dataset determinístico `src/beta/demoDataset.ts`. O workspace real
> (Supabase ou mocks padrão) **não é consultado**.

---

## 1. Como ativar / desativar

### Pela UI
1. Acesse `/dashboard`
2. Clique em **"Explorar workspace demo"** (canto superior direito)
3. Toast confirma a ativação e o React Query é invalidado — todas as telas recarregam já no modo demo
4. Para sair: clicar novamente no mesmo botão

### Pelo console (útil para screenshots em lote)
```js
import { setDemoMode } from "@/beta/demoMode";
setDemoMode(true);   // ativa
setDemoMode(false);  // desativa
```

O estado é persistido em `localStorage` (`fluxbot.demoMode = "1"`).
Nada é enviado a backend.

---

## 2. Arquitetura

```
┌──────────────────────────────────────────────────────────────┐
│                  src/domain/persistence/index.ts             │
│                                                              │
│  persistence = Proxy({                                       │
│    bots, leads, conversations, channels, flows, ...          │
│  })                                                          │
│                                                              │
│    on every call:                                            │
│      if isDemoMode() && demoPersistence[domain][method]:     │
│          → demoPersistence  (src/beta/demoPersistence.ts)    │
│      else:                                                   │
│          → real repo (mock OR supabase, conforme env)        │
└──────────────────────────────────────────────────────────────┘
```

- **Overlay por método**: se a operação não está implementada no overlay
  demo, cai para o repo real (ex.: `events.record`).
- **Determinístico**: mesmos IDs, mesmas datas (`fixedIso`), mesma ordem.
- **Idempotente**: alternar demo on/off não duplica entidades — o
  overlay nunca grava no workspace real.
- **Mutável dentro da sessão**: arrastar lead no kanban, mudar score,
  editar tags etc. funcionam — alteram apenas o store local do overlay
  e são revertidas ao recarregar.
- **Independente do usuário**: não depende de auth, workspace ou seed.

---

## 3. Telas com override demo

| Tela                       | Rota                  | Fonte demo                                  |
|----------------------------|-----------------------|---------------------------------------------|
| Dashboard                  | `/dashboard`          | `bots.list`, `leads.crmStats`, `analytics-basic` |
| Leads (kanban)             | `/leads`              | `leads.byStage`, `leads.stages`             |
| Lead Detail + Intelligence | `/leads/demo-marina`  | `leads.get`, `leads.timeline`, `leads.conversations` |
| Conversations              | `/conversations`      | `conversations.list`                        |
| Analytics                  | `/analytics`          | KPIs via `useBasicStats` (override automático) |
| Revenue Intelligence       | `/revenue`            | `DEMO_REVENUE` (render-time)                |
| Attribution Engine         | `/attribution`        | `DEMO_ATTRIBUTION` (render-time)            |
| Channels                   | `/channels`           | `channels.list`                             |
| AI Builder                 | `/ai-builder`         | `DEMO_AI_BUILDER_PROMPT/CONTEXT` (pre-fill) |
| PublicBot                  | `/bot/lumina-qualify` | `bots.getBySlug` + `bot.publishedSnapshot`  |
| Builder                    | `/builder/lumina-qualify` | `flows.getByBot`                        |

---

## 4. Entidades simuladas

Fonte única: [`src/beta/demoDataset.ts`](../src/beta/demoDataset.ts).

| Entidade            | Quantidade | Hero                                |
|---------------------|------------|-------------------------------------|
| Bots                | 3          | `lumina-qualify` (publicado)        |
| Flow (publicado)    | 1          | 10 blocos, ramificação, condition   |
| Leads               | 12         | Marina Costa · score 92 · negociação |
| Estágios            | 5          | novo · qualificado · negociação · convertido · perdido |
| Conversas           | 5          | Marina + 4 sessões                  |
| Mensagens           | 9          | Histórico real da sessão Marina     |
| Canais              | 7          | WhatsApp / IG / Site conectados     |
| Revenue (canais)    | 4          | Meta / Google / IG / Orgânico       |
| Revenue (campanhas) | 3          | avaliacao-estetica-junho + 2        |
| Atribuição          | 5 linhas   | Meta CPC `avaliacao-estetica-junho` |
| Timeline (Marina)   | 8 eventos  | created → flow → choices → conv done |

Cenário: **Clínica Lumina** running **Meta Ads** com a campanha
`avaliacao-estetica-junho`. Marina Costa é o lead hero — aparece em
todos os widgets, dashboards e timelines.

---

## 5. Garantias

- ✅ Nenhuma chamada ao Supabase real quando demo mode está ativo (apenas
  fall-through para domínios sem override demo: `workspaces`, `users`,
  `versions`, `sessions.write`, `events.write`)
- ✅ Toggle invalida React Query imediatamente — sem reload manual
- ✅ Mesma fixture em todo screenshot/vídeo/apresentação
- ✅ Mutações ficam em memória — recarregar restaura o cenário canônico
- ✅ Landing Page, Home, design system, copy pública e rotas públicas
   não são alteradas

---

## 6. Quando NÃO usar

- Para validar bugs reais do workspace do usuário (desative demo antes)
- Para QA de migrations ou RLS (sem chamadas ao backend)
- Para testar autenticação OAuth de canais reais

---

## 7. Próximas extensões (não nesta fase)

- Demo mode para `templates`, `variables`, `versions`
- Demo de Webhook / Connector executions
- Snapshot de System Health "tudo verde"
- Botões "Resetar cenário demo" / "Próximo cenário"
