// Spielt im simulierten iPhone eine Partie gegen den Computer: Menü, Lenken per Ziehen, Sprint, Ergebnis.
// Aufruf: node tests/ui.test.js   (braucht Playwright; App muss laufen: python3 -m http.server 8766)
"use strict";
const path = require("path"), fs = require("fs");
const { chromium, devices } = require("playwright");
const URL = process.env.SD_URL || "http://localhost:8766/";
const shots = path.join(__dirname, "screenshots");
fs.mkdirSync(shots, { recursive: true });

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ ...devices["iPhone 13"] });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  page.on("console", m => m.type() === "error" && errors.push(m.text()));
  let failed = 0;
  const check = (ok, msg) => { console.log(`${ok ? "OK  " : "FAIL"} ${msg}`); if (!ok) failed++; };

  await page.goto(URL);
  await page.waitForTimeout(4500);                       // Demo-Duell im Hintergrund läuft an
  await page.screenshot({ path: path.join(shots, "1-menue.png") });
  check((await page.textContent("#soloBtn")).includes("Stufe 1"), "Menü zeigt Stufe 1");
  await page.click("#helpBtn"); await page.screenshot({ path: path.join(shots, "2-regeln.png") }); await page.click("#helpClose");

  await page.click("#soloBtn");
  await page.waitForFunction(() => SD.app.match.phase === "count");
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(shots, "3-countdown.png") });
  await page.waitForFunction(() => SD.app.match.phase === "play", null, { timeout: 8000 });

  // Lenken: nach rechts ziehen ⇒ Schlange dreht Richtung 0 rad (rechts)
  const box = await page.locator("#cv").boundingBox();
  const cx = box.x + box.width / 2, cy = box.y + box.height * 0.8;
  await page.mouse.move(cx, cy); await page.mouse.down(); await page.mouse.move(cx + 50, cy, { steps: 4 });
  await page.waitForTimeout(700);
  const st = await page.evaluate(() => ({ a: SD.input.a, dir: SD.app.match.sim.snakes[0].dir }));
  check(st.a !== null && Math.abs(st.a) < 0.2, `Ziehen nach rechts setzt die Zielrichtung (${st.a && st.a.toFixed(2)} rad)`);
  check(Math.abs(Math.atan2(Math.sin(st.dir), Math.cos(st.dir))) < 0.3, `Schlange fährt nach rechts (${st.dir.toFixed(2)} rad)`);
  await page.screenshot({ path: path.join(shots, "4-spiel.png") });
  await page.mouse.up();

  // Sprint-Knopf halten ⇒ Schlange sprintet und wird kürzer
  const len0 = await page.evaluate(() => SD.app.match.sim.snakes[0].len);
  const sb = await page.locator("#sprintBtn").boundingBox();
  await page.mouse.move(sb.x + sb.width / 2, sb.y + sb.height / 2); await page.mouse.down();
  await page.waitForTimeout(500);
  const sp = await page.evaluate(() => ({ s: SD.input.s, len: SD.app.match.sim.snakes[0].len, alive: SD.app.match.sim.snakes[0].alive }));
  await page.mouse.up();
  check(sp.s === true && (!sp.alive || sp.len < len0 + 0.2), `Sprint aktiv (Länge ${len0.toFixed(2)} → ${sp.len.toFixed(2)})`);

  // Rest der Partie im Schnelldurchlauf: ein Bot übernimmt den Spieler
  await page.evaluate(() => { const m = SD.app.match; m.bots[0] = new SD.Bot(10, 5); m.bots[1] = new SD.Bot(1, 6); let g = 0; while (!m.over && g++ < 60 * 70 * 9) m.tick(); });
  await page.waitForSelector("#endPanel:not(.hidden)", { timeout: 8000 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(shots, "5-ergebnis.png") });
  const end = await page.evaluate(() => ({ title: document.getElementById("endTitle").textContent, sub: document.getElementById("endSub").textContent, again: document.getElementById("againBtn").textContent, level: SD.state.level, scores: SD.app.match.scores }));
  check(/gewonnen|verloren|Unentschieden/.test(end.title), `Ergebnis: ${end.title} · ${end.sub} · Knopf „${end.again}“`);
  check(end.scores[0] > end.scores[1] ? end.level === 2 : end.level === 1, `Stufe nach dem Duell: ${end.level}`);
  await page.click("#menuBtn");
  check(await page.isVisible("#menuPanel"), "Zurück im Menü");
  check(errors.length === 0, `Keine Konsolenfehler${errors.length ? ": " + errors.join("; ") : ""}`);
  console.log(`Screenshots: ${shots}`);
  await browser.close();
  process.exit(failed ? 1 : 0);
})();
