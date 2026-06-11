#!/usr/bin/env node
/**
 * Visual smoke test — paleta escura (preto + turquesa)
 *
 * Percorre rotas-chave e captura screenshots em desktop + mobile.
 * Falha se:
 *  - a página renderizar em branco (sem conteúdo de texto significativo)
 *  - o background computado não estiver na faixa escura esperada
 *  - houver erros não-tratados no console
 *
 * Uso:
 *   BASE_URL=https://preview... node scripts/visual-smoke.mjs
 *   (requer `npx playwright install chromium` previamente)
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:5173";
const OUT_DIR = process.env.OUT_DIR ?? "artifacts/visual-smoke";
const TOKEN = process.env.PREVIEW_TOKEN ?? "";

const ROUTES = [
  { name: "landing",       path: "/",              auth: false },
  { name: "dashboard",     path: "/dashboard",     auth: true  },
  { name: "bots",          path: "/bots",          auth: true  },
  { name: "builder-empty", path: "/builder/none",  auth: true,  allowNotFound: true },
  { name: "leads",         path: "/leads",         auth: true  },
  { name: "inbox",         path: "/conversations", auth: true  },
  { name: "analytics",     path: "/analytics",     auth: true  },
  { name: "templates",     path: "/templates",     auth: true  },
  { name: "public-bot",    path: "/bot/demo",      auth: false, allowNotFound: true },
];

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile",  width: 390,  height: 844 },
];

const failures = [];

async function checkRoute(page, route, viewport) {
  const url = new URL(route.path, BASE_URL).toString() + (TOKEN ? `?__lovable_token=${TOKEN}` : "");
  const consoleErrors = [];
  page.on("pageerror", (e) => consoleErrors.push(String(e)));
  page.on("console", (m) => { if (m.type() === "error") consoleErrors.push(m.text()); });

  await page.setViewportSize(viewport);
  await page.goto(url, { waitUntil: "networkidle", timeout: 30_000 });
  await page.waitForTimeout(800);

  const file = path.join(OUT_DIR, `${route.name}-${viewport.name}.png`);
  await page.screenshot({ path: file, fullPage: false });

  const { bg, textLen } = await page.evaluate(() => {
    const body = document.body;
    return {
      bg: getComputedStyle(body).backgroundColor,
      textLen: (body.innerText || "").trim().length,
    };
  });

  // dark check: every channel below ~60
  const m = bg.match(/\d+(\.\d+)?/g)?.map(Number) ?? [];
  const isDark = m.length >= 3 && m[0] < 60 && m[1] < 60 && m[2] < 60;
  if (!isDark) failures.push(`${route.name}/${viewport.name}: background não é escuro (${bg})`);
  if (textLen < 20 && !route.allowNotFound) failures.push(`${route.name}/${viewport.name}: página parece vazia (${textLen} chars)`);
  if (consoleErrors.length) failures.push(`${route.name}/${viewport.name}: ${consoleErrors.length} erro(s) no console`);

  return { route: route.name, viewport: viewport.name, bg, textLen, errors: consoleErrors.length, file };
}

(async () => {
  await mkdir(OUT_DIR, { recursive: true });
  const browser = await chromium.launch();
  const ctx = await browser.newContext();
  const page = await ctx.newPage();

  const results = [];
  for (const route of ROUTES) {
    for (const vp of VIEWPORTS) {
      try {
        results.push(await checkRoute(page, route, vp));
      } catch (err) {
        failures.push(`${route.name}/${vp.name}: ${err.message}`);
      }
    }
  }

  await browser.close();
  console.table(results);
  if (failures.length) {
    console.error("\n❌ Falhas:");
    failures.forEach((f) => console.error(" -", f));
    process.exit(1);
  }
  console.log("\n✅ Smoke visual OK — todas as rotas escuras renderizaram.");
})();
