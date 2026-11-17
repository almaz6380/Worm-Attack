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

  // Lenkart umschalten: wird gespeichert und übersteht das Neuladen
  await page.click("#steerBtn");
  check((await page.textContent("#steerBtn")).includes("Zum Finger"), "Umschalter zeigt „Zum Finger“");
  await page.reload();
  check((await page.textContent("#steerBtn")).includes("Zum Finger") && (await page.evaluate(() => SD.state.steer)) === "finger", "Lenkart bleibt nach dem Neuladen erhalten");
  await page.click("#steerBtn");
  check((await page.textContent("#steerBtn")).includes("Kreis"), "Zurück auf „Kreis“");
  await page.screenshot({ path: path.join(shots, "1b-menue-lenkung.png") });

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

  // Verlorenes Loslassen nachstellen: alter Finger wird nie losgelassen, neuer Finger setzt woanders auf
  const res = await page.evaluate(([x1, y1, x2, y2]) => {
    const cv = document.getElementById("cv");
    const ev = (type, id, x, y) => cv.dispatchEvent(new PointerEvent(type, { pointerId: id, clientX: x, clientY: y, bubbles: true, cancelable: true, pointerType: "touch" }));
    ev("pointerdown", 11, x1, y1);                       // kein pointerup für Finger 11
    ev("pointerdown", 12, x2, y2);
    const origin = { ox: joy.ox, oy: joy.oy, id: joy.id };
    ev("pointermove", 12, x2, y2 - 30);                  // nach oben ziehen
    const a = SD.input.a;
    ev("pointerup", 12, x2, y2 - 30);
    return { origin, a, released: joy === null };
  }, [box.x + 60, box.y + box.height * 0.9, box.x + box.width - 80, box.y + box.height * 0.6]);
  check(res.origin.id === 12 && Math.abs(res.origin.ox - (box.x + box.width - 80)) < 1, `Neuer Finger versetzt den Kreis an die neue Stelle (x ${res.origin.ox.toFixed(0)})`);
  check(Math.abs(res.a + Math.PI / 2) < 0.05 && res.released, `Der neue Finger lenkt (${res.a.toFixed(2)} rad = nach oben)`);

  // Lenkart „Zum Finger“: Zielrichtung zeigt vom Kopf zur berührten Stelle
  const aim = await page.evaluate(([x, y]) => {
    SD.state.steer = "finger";
    const cv = document.getElementById("cv"), r = cv.getBoundingClientRect(), k = 720 / r.width;
    cv.dispatchEvent(new PointerEvent("pointerdown", { pointerId: 21, clientX: x, clientY: y, bubbles: true, cancelable: true, pointerType: "touch" }));
    const sn = SD.app.view.snakes[SD.app.me];
    const want = Math.atan2(((y - r.top) * k - CY) / SC - sn.hy, ((x - r.left) * k - CX) / SC - sn.hx);
    const got = SD.input.a;
    cv.dispatchEvent(new PointerEvent("pointerup", { pointerId: 21, clientX: x, clientY: y, bubbles: true, pointerType: "touch" }));
    SD.state.steer = "kreis";
    return { want, got };
  }, [box.x + box.width * 0.5, box.y + box.height * 0.25]);
  check(Math.abs(Math.atan2(Math.sin(aim.got - aim.want), Math.cos(aim.got - aim.want))) < 0.02, `„Zum Finger“ zielt auf die berührte Stelle (${aim.got.toFixed(2)} rad)`);

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
