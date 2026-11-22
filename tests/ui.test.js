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
  // Vibration mitschreiben (echte Geräte vibrieren, im Test zählen wir die Aufrufe)
  await ctx.addInitScript(() => { window.__vib = []; try { Object.defineProperty(navigator, "vibrate", { value: p => { window.__vib.push(p); return true; }, configurable: true }); } catch {} });
  const page = await ctx.newPage();
  page.on("dialog", d => d.accept());
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  page.on("console", m => m.type() === "error" && errors.push(m.text()));
  let failed = 0;
  const check = (ok, msg) => { console.log(`${ok ? "OK  " : "FAIL"} ${msg}`); if (!ok) failed++; };

  await page.goto(URL + "?tag=2026-03-10");            // festes Datum für die Tagesaufgaben
  // Tägliches Geschenk beim ersten Öffnen am Tag
  await page.waitForSelector("#giftPanel:not(.hidden)", { timeout: 5000 });
  await page.screenshot({ path: path.join(shots, "0-geschenk.png") });
  await page.click("#giftTake");
  const gf = await page.evaluate(() => ({ stars: SD.goals.stars(), gift: SD.gift, menu: !document.getElementById("menuPanel").classList.contains("hidden") }));
  check(gf.stars === 1 && gf.gift.n === 1 && gf.gift.last === "2026-03-10" && gf.menu, `Tägliches Geschenk: +1 ⭐ an Tag ${gf.gift.n}, danach das Menü`);
  await page.reload();
  check(await page.isVisible("#menuPanel") && !(await page.isVisible("#giftPanel")), "Am selben Tag kein zweites Geschenk");
  await page.waitForTimeout(4500);                       // Demo-Duell im Hintergrund läuft an
  await page.screenshot({ path: path.join(shots, "1-menue.png") });
  check((await page.textContent("#soloBtn")).includes("Stufe 1"), "Menü zeigt Stufe 1");
  await page.click("#helpBtn"); await page.screenshot({ path: path.join(shots, "2-regeln.png") }); await page.click("#helpClose");

  // Lenkart umschalten: wird gespeichert und übersteht das Neuladen
  // Lenkart umschalten (im Regeln-Panel)
  await page.click("#helpBtn"); await page.click("#steerBtn");
  check((await page.textContent("#steerBtn")).includes("Zum Finger"), "Umschalter zeigt „Zum Finger“");
  await page.reload();
  check((await page.textContent("#steerBtn")).includes("Zum Finger") && (await page.evaluate(() => SD.state.steer)) === "finger", "Lenkart bleibt nach dem Neuladen erhalten");
  await page.click("#helpBtn"); await page.click("#steerBtn");
  check((await page.textContent("#steerBtn")).includes("Kreis"), "Zurück auf „Kreis“");
  await page.screenshot({ path: path.join(shots, "1b-regeln-lenkung.png") });
  await page.click("#helpClose");
  // Startbildschirm: Profilzeile, Online-Bereich
  const prof = await page.textContent("#profile");
  check(prof.includes("Stufe 1") && prof.includes("⭐"), `Profilzeile im Menü: ${prof}`);
  await page.click("#onlineBtn");
  check(await page.isVisible("#hostBtn") && await page.isVisible("#codeInput"), "„Online“ öffnet Einladen und Beitreten");
  await page.fill("#codeInput", "12"); await page.click("#joinBtn");
  check((await page.textContent("#onlineStatus")).includes("4-stelligen"), "Falsche Code-Länge: Hinweis im Online-Bereich");
  // Eigener Name und Liste „Meine Gegner“
  await page.fill("#nameInput", "  Kalle<b>  "); await page.press("#nameInput", "Enter"); await page.click("#onlineStatus");
  check((await page.evaluate(() => JSON.parse(localStorage.getItem("sd_name")))) === "Kalleb", "Eigener Name wird bereinigt und gespeichert");
  await page.evaluate(() => { const r = SD.rivalsList(); r.abcdef1234 = { w: 3, l: 1, d: 0, s: 2, n: "Mia", t: Date.now() }; r.zzzzzz9999 = { w: 0, l: 2, d: 1, s: -2, n: "Tom", t: Date.now() - 86400000 }; });
  await page.click("#rivalBtn");
  const rows = await page.evaluate(() => [...document.querySelectorAll("#rivalList .goal")].map(e => e.querySelector("input").value + " " + e.querySelector(".gr span").textContent));
  check(rows.join(" | ") === "Mia 3 : 1 | Tom 0 : 2", `Meine Gegner, zuletzt gespielte zuerst: ${rows.join(" | ")}`);
  await page.fill('#rivalList input[data-id="zzzzzz9999"]', "Tommy"); await page.press('#rivalList input[data-id="zzzzzz9999"]', "Enter"); await page.click("#rivalList .note, #rivalPanel .title");
  check((await page.evaluate(() => { const r = JSON.parse(localStorage.getItem("sd_rivals")); return r.zzzzzz9999.nick + "/" + r.zzzzzz9999.n; })) === "Tommy/Tom", "Gegner umbenennen speichert einen eigenen Spitznamen");
  await page.screenshot({ path: path.join(shots, "1e-meine-gegner.png") });
  await page.click("#rivalDone");
  await page.click("#onlineBack");

  // Wurm-Auswahl: Übersicht mit allen Designs, Wahl wird gespeichert, gesperrte Designs sind nur Vorschau
  await page.waitForFunction(() => SD.skinsReady, null, { timeout: 10000 });
  await page.click("#skinBtn");
  const tiles = await page.evaluate(() => ({ n: document.querySelectorAll(".skintile").length, total: SD.SKINS.length, img: SD.SKINS.filter(k => k.img).length, locked: document.querySelectorAll(".skintile.locked").length }));
  check(tiles.n === 22 && tiles.total === 22 && tiles.img === 10, `Übersicht zeigt ${tiles.n} Designs, davon ${tiles.img} mit Bildern, ${tiles.locked} gesperrt`);
  await page.click('.skintile[data-id="bonbon"]');
  await page.click("#skinDone");
  check((await page.textContent("#skinBtn")).includes("Bonbon"), "Gewähltes Design steht auf dem Knopf (Bonbon)");
  await page.reload();
  await page.waitForFunction(() => SD.skinsReady, null, { timeout: 10000 });
  check((await page.evaluate(() => SD.state.skin)) === "bonbon", "Design bleibt nach dem Neuladen erhalten");
  await page.click("#skinBtn");
  await page.click('.skintile[data-id="einhorn"]');      // gesperrt bis Stufe 9
  const locked = await page.evaluate(() => ({ skin: SD.state.skin, demo: SD.app.skins[0], status: document.getElementById("skinStatus").textContent }));
  check(locked.skin === "bonbon" && locked.demo === "einhorn" && locked.status.includes("ab Stufe 9"), `Gesperrtes Design nur als Vorschau: ${locked.status}`);
  await page.locator('.skintile[data-id="raupe"]').scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(shots, "1c-wurm-auswahl.png") });
  await page.click('.skintile[data-id="raupe"]');
  const pic = await page.evaluate(() => ({ skin: SD.state.skin, sel: document.querySelector(".skintile.sel").dataset.id, demo: SD.app.skins[0] }));
  check(pic.skin === "raupe" && pic.sel === "raupe" && pic.demo === "raupe", "Bild-Design „Raupe“ gewählt und markiert");
  const dr = await page.evaluate(() => { const k = SD.SKINS.find(x => x.id === "drache"), v = SD.SKINS.find(x => x.id === "beispiel"); return { img: !!(k && k.img), side: k && k.side, vside: v && v.side }; });
  check(dr.img && dr.side === true && dr.vside === false, "Smaragddrache geladen, als Seitenansicht markiert (wird beim Linksfahren gespiegelt)");
  await page.click("#skinDone");
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(shots, "1d-menue-bilddesign.png") });

  // Erstes Mal „Spielen“: Übungsrunde (lenken, 3 Futter, Joker), danach direkt das erste Duell gegen den Anfänger
  await page.click("#soloBtn");
  const tu0 = await page.evaluate(() => ({ kind: SD.app.kind, n: SD.app.match.sim.snakes.length, text: document.getElementById("tutText").textContent }));
  check(tu0.kind === "uebung" && tu0.n === 1 && tu0.text.includes("ziehen"), `Erster Start: Übungsrunde mit nur dem eigenen Wurm („${tu0.text.slice(0, 40)}…“)`);
  {
    const b0 = await page.locator("#cv").boundingBox(), x0 = b0.x + b0.width / 2, y0 = b0.y + b0.height * 0.8;
    await page.mouse.move(x0, y0); await page.mouse.down();
    for (let k = 0; k < 40 && (await page.evaluate(() => SD.app.tut && SD.app.tut.step)) === 0; k++) { await page.mouse.move(x0 + Math.cos(k * 0.4) * 50, y0 + Math.sin(k * 0.4) * 50); await page.waitForTimeout(40); }
    await page.mouse.up();
  }
  check((await page.evaluate(() => SD.app.tut.step)) === 1, "Lenken erkannt ⇒ Schritt 2 (Futter)");
  await page.screenshot({ path: path.join(shots, "2b-uebung.png") });
  for (let k = 0; k < 6 && (await page.evaluate(() => SD.app.tut.step)) === 1; k++) { await page.evaluate(() => { const s = SD.app.match.sim, n = s.snakes[0]; s.foods[0].x = n.x + Math.cos(n.dir) * 0.02; s.foods[0].y = n.y + Math.sin(n.dir) * 0.02; }); await page.waitForTimeout(150); }
  const tu2 = await page.evaluate(() => ({ step: SD.app.tut.step, power: !!SD.app.match.sim.power, food: SD.goals.stats.food }));
  check(tu2.step === 2 && tu2.power && tu2.food === 0, "3 Futter ⇒ Schritt 3, ein Joker liegt bereit (Übung zählt nicht für Aufgaben)");
  await page.evaluate(() => { const s = SD.app.match.sim, n = s.snakes[0]; s.power.x = n.x; s.power.y = n.y; });
  await page.waitForFunction(() => SD.app.kind === "duell", null, { timeout: 8000 });
  const fd = await page.evaluate(() => ({ opp: SD.app.oppName, lv: SD.app.match.bots[1].level, tut: JSON.parse(localStorage.getItem("sd_tut")) }));
  check(fd.lv === 0 && fd.opp.includes("Anfänger") && fd.tut === true, `Übung geschafft ⇒ erstes Duell gegen ${fd.opp}`);
  await page.waitForFunction(() => SD.app.match.phase === "count");
  const sk = await page.evaluate(() => SD.app.skins);
  check(sk[0] === "raupe" && sk[1] !== "raupe", `Im Spiel: eigenes Design ${sk[0]}, Gegner ${sk[1]}`);
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(shots, "3-countdown.png") });
  await page.waitForFunction(() => SD.app.match.phase === "play", null, { timeout: 8000 });

  // Pause: Spiel steht, Ton-Schalter werden gespeichert, „Weiter“ setzt fort; App verlassen pausiert automatisch
  await page.click("#pauseBtn");
  const pz0 = await page.evaluate(() => SD.app.match.ticks); await page.waitForTimeout(500);
  const pz = await page.evaluate(() => ({ ticks: SD.app.match.ticks, panel: !document.getElementById("pausePanel").classList.contains("hidden") }));
  check(pz.ticks === pz0 && pz.panel, "Pause: Spiel steht still, Pause-Menü sichtbar");
  await page.click("#pausePanel .fxBtn"); await page.click("#pausePanel .musicBtn");
  const sd = await page.evaluate(() => JSON.parse(localStorage.getItem("sd_sound")));
  check(sd.fx === false && sd.music === false && (await page.textContent("#pausePanel .fxBtn")).includes("aus"), "Töne und Musik abschaltbar, wird gespeichert");
  await page.click("#pausePanel .fxBtn"); await page.click("#pausePanel .musicBtn");
  await page.click("#resumeBtn"); await page.waitForTimeout(300);
  check((await page.evaluate(() => SD.app.match.ticks)) > pz0 && !(await page.evaluate(() => SD.app.paused)), "Weiter: Spiel läuft wieder");
  await page.evaluate(() => { Object.defineProperty(document, "hidden", { value: true, configurable: true }); document.dispatchEvent(new Event("visibilitychange")); });
  const ap = await page.evaluate(() => SD.app.paused);
  await page.evaluate(() => { Object.defineProperty(document, "hidden", { value: false, configurable: true }); document.dispatchEvent(new Event("visibilitychange")); });
  check(ap, "App verlassen ⇒ automatisch Pause");
  await page.click("#resumeBtn");

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

  // Doppeltipp und halten ⇒ Sprint, Loslassen beendet ihn; zu langsame oder zu weit entfernte Tipps zählen nicht
  const dt = await page.evaluate(async ([x, y]) => {
    const cv = document.getElementById("cv"), wait = ms => new Promise(r => setTimeout(r, ms));
    const ev = (type, id, px, py) => cv.dispatchEvent(new PointerEvent(type, { pointerId: id, clientX: px, clientY: py, bubbles: true, cancelable: true, pointerType: "touch" }));
    const out = {};
    ev("pointerdown", 31, x, y); ev("pointerup", 31, x, y); await wait(15);
    ev("pointerdown", 32, x + 10, y + 5); out.on = SD.input.s; out.btn = document.getElementById("sprintBtn").classList.contains("on");
    const len0 = SD.app.match.sim.snakes[0].len; await wait(450);
    // kürzer wird der Wurm nur, solange die Runde läuft und er lebt (die Runde kann im Test zufällig gerade enden)
    // (frisst er dabei zufällig Futter, wird er trotzdem nicht kürzer – dann zählt, dass die Simulation ihn sprinten lässt)
    out.shorter = SD.app.match.sim.snakes[0].len < len0 || SD.app.match.sim.snakes[0].sprinting || !SD.app.match.sim.snakes[0].alive || SD.app.match.phase !== "play";
    ev("pointerup", 32, x + 10, y + 5); out.off = SD.input.s === false;
    await wait(500);                                           // zu langsam
    ev("pointerdown", 33, x, y); out.slow = SD.input.s; ev("pointerup", 33, x, y); await wait(60);
    ev("pointerdown", 34, x + 120, y); out.far = SD.input.s; ev("pointerup", 34, x + 120, y);   // zu weit weg
    await wait(400);
    ev("pointerdown", 35, x, y); ev("pointerup", 35, x, y); await wait(15);
    ev("pointerdown", 36, x, y); out.on2 = SD.input.s;         // Sprint läuft, Loslassen geht „verloren“
    ev("pointerdown", 37, x - 100, y - 100); out.stuck = SD.input.s; ev("pointerup", 37, x - 100, y - 100);
    return out;
  }, [box.x + box.width * 0.5, box.y + box.height * 0.85]);
  check(dt.on && dt.btn && dt.shorter && dt.off, `Doppeltipp und halten sprintet, Loslassen beendet den Sprint${dt.on && dt.btn && dt.shorter && dt.off ? "" : " – " + JSON.stringify(dt)}`);
  check(dt.slow === false && dt.far === false, "Zu langsame oder zu weit entfernte Tipps lösen keinen Sprint aus");
  check(dt.on2 && dt.stuck === false, "Sprint bleibt nicht hängen, wenn ein neuer Finger aufsetzt");

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

  // ---------- Tagesaufgaben, Erfolge, Sterne ----------
  const g0 = await page.evaluate(() => ({ ids: SD.goals.daily().ids, food: SD.goals.stats.food, duel: SD.goals.stats.duel, stars: SD.goals.stars(), sieg1: !!SD.goals.achDone.sieg1 }));
  check(g0.food > 0, `Futter aus der Partie wurde gezählt (${g0.food})`);
  check(g0.duel === (end.scores[0] > end.scores[1] ? 1 : 0) && g0.sieg1 === (g0.duel === 1), `Duell-Sieg gezählt (${g0.duel}), Erfolg „Erster Duell-Sieg“: ${g0.sieg1}, Sterne: ${g0.stars}`);
  await page.click("#goalBtn");
  const gp = await page.evaluate(() => ({ rows: document.querySelectorAll("#goalList .goal").length, title: document.getElementById("goalTitle").textContent }));
  check(gp.rows === 19, `Aufgaben-Panel zeigt 3 Tagesaufgaben und 16 Erfolge (${gp.title})`);
  await page.screenshot({ path: path.join(shots, "7-aufgaben.png") });
  await page.click("#tabRecords");
  const rl = await page.evaluate(() => ({ n: document.querySelectorAll("#goalList [data-rec]").length, set: document.querySelectorAll("#goalList [data-rec].done").length }));
  check(rl.n === 10 && rl.set >= 2, `Reiter „Rekorde“ zeigt 10 Rekorde, davon ${rl.set} schon gesetzt`);
  await page.screenshot({ path: path.join(shots, "7b-rekorde.png") });
  await page.click("#tabGoals");
  await page.click("#goalDone");
  await page.reload();
  await page.waitForFunction(() => SD.skinsReady, null, { timeout: 10000 });
  const g1 = await page.evaluate(() => ({ ids: SD.goals.daily().ids, food: SD.goals.stats.food }));
  check(JSON.stringify(g1.ids) === JSON.stringify(g0.ids) && g1.food === g0.food, `Am selben Tag bleiben Aufgaben und Zähler nach dem Neuladen gleich (${g1.ids.join(", ")})`);
  await page.waitForTimeout(3500);                         // Demo-Duell im Menü läuft
  check((await page.evaluate(() => SD.goals.stats.food)) === g0.food, "Das Demo-Duell im Menü zählt nicht");
  // Aufgabe erfüllen ⇒ Stern
  const t1 = await page.evaluate(() => { const d = SD.goals.daily(), id = d.ids.find(x => !d.done[x]), t = SD.goals.TASKS.find(x => x.id === id), before = SD.goals.stars();
    SD.goals.bump(id, t.n, !!t.max); SD.goals.check(); const d2 = SD.goals.daily();
    return { id, before, after: SD.goals.stars(), done: !!d2.done[id], all: d2.ids.every(x => d2.done[x]), btn: document.getElementById("goalBtn").textContent }; });
  // 1 Stern pro Aufgabe; sind damit alle drei geschafft, kommen 2 Bonus-Sterne dazu
  check(t1.done && t1.after === t1.before + 1 + (t1.all ? 2 : 0), `Geschaffte Aufgabe „${t1.id}“ gibt einen Stern${t1.all ? " plus 2 Bonus für alle drei" : ""} (${t1.before} → ${t1.after}), Knopf: ${t1.btn}`);
  // Sterne-Design: erst mit genug Sternen, zweimal tippen, Sterne werden abgezogen
  await page.evaluate(() => SD.goals.setStars(3));
  await page.click("#skinBtn");
  await page.locator('.skintile[data-id="zebra"]').scrollIntoViewIfNeeded();
  await page.click('.skintile[data-id="zebra"]');
  const z0 = await page.evaluate(() => ({ skin: SD.state.skin, owned: !!SD.goals.owned.zebra, status: document.getElementById("skinStatus").textContent, sub: document.querySelector('.skintile[data-id="zebra"] small').textContent }));
  check(!z0.owned && z0.skin !== "zebra" && z0.sub.includes("5"), `Zu wenig Sterne: Zebra bleibt gesperrt („${z0.status}“)`);
  await page.click("#skinDone");
  await page.evaluate(() => SD.goals.setStars(6));
  await page.click("#skinBtn");
  await page.locator('.skintile[data-id="zebra"]').scrollIntoViewIfNeeded();
  await page.click('.skintile[data-id="zebra"]');
  const z1 = await page.evaluate(() => ({ owned: !!SD.goals.owned.zebra, status: document.getElementById("skinStatus").textContent }));
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(shots, "8-sterne-design.png") });
  await page.click('.skintile[data-id="zebra"]');
  const z2 = await page.evaluate(() => ({ skin: SD.state.skin, owned: !!SD.goals.owned.zebra, stars: SD.goals.stars() }));
  check(!z1.owned && z1.status.includes("Nochmal tippen") && z2.owned && z2.skin === "zebra" && z2.stars === 1, `Zebra für 5 ⭐ freigeschaltet nach zweitem Tippen, Rest ${z2.stars} ⭐`);
  await page.click("#skinDone");

  // ---------- Effekte: Zeitlupe, Vibration, Rundensieg zählt ----------
  await page.click("#soloBtn");
  await page.waitForFunction(() => SD.app.match.phase === "play", null, { timeout: 8000 });
  const r0 = await page.evaluate(() => { window.__vib.length = 0; const m = SD.app.match; m.bots = [new SD.Bot(10, 3), null]; const o = m.sim.snakes[1]; o.x = 0.99; o.y = 0; return SD.goals.stats.rounds; });
  await page.waitForFunction(() => SD.app.match.phase === "end", null, { timeout: 5000 });
  await page.waitForTimeout(150);
  const fxs = await page.evaluate(() => ({ slow: SD.app.slow.until > SD.app.lastTs, vib: window.__vib.length, rounds: SD.goals.stats.rounds, winner: SD.app.match.sim.winner }));
  await page.screenshot({ path: path.join(shots, "9-crash-zeitlupe.png") });
  check(fxs.winner === 0 && fxs.slow && fxs.vib > 0, `Crash: Zeitlupe aktiv, Vibration ausgelöst (${fxs.vib} Aufruf)`);
  check(fxs.rounds === r0 + 1, `Rundensieg gezählt (${r0} → ${fxs.rounds})`);
  await page.waitForTimeout(1500);
  check(await page.evaluate(() => SD.app.slow.until < SD.app.lastTs), "Zeitlupe endet wieder");
  await page.waitForFunction(() => SD.app.match.round === 2 && SD.app.match.phase === "play", null, { timeout: 12000 });
  await page.evaluate(() => { SD.state.vib = false; window.__vib.length = 0; const o = SD.app.match.sim.snakes[1]; o.x = 0.99; o.y = 0; });
  await page.waitForFunction(() => SD.app.match.phase === "end", null, { timeout: 5000 });
  await page.waitForTimeout(150);
  check((await page.evaluate(() => window.__vib.length)) === 0, "Mit „Vibration: aus“ vibriert nichts");
  // Duell zu Ende spielen lassen ⇒ Konfetti beim Sieg
  await page.evaluate(() => { SD.state.vib = true; const m = SD.app.match; m.scores = [2, 0]; });
  await page.waitForFunction(() => SD.app.match.round === 3 && SD.app.match.phase === "play", null, { timeout: 12000 });
  await page.evaluate(() => { const o = SD.app.match.sim.snakes[1]; o.x = 0.99; o.y = 0; });
  await page.waitForSelector("#endPanel:not(.hidden)", { timeout: 8000 });
  await page.waitForTimeout(900);
  const conf = await page.evaluate(() => SD.app.particles.filter(p => p.conf).length);
  await page.screenshot({ path: path.join(shots, "10-sieg-konfetti.png") });
  check(conf > 20, `Konfetti beim Duell-Sieg (${conf} Teilchen)`);
  // Rekorde: schnellster Duell-Sieg, Länge, Futter
  const rec = await page.evaluate(() => ({ duel: SD.records.duel && SD.records.duel.v, len: SD.records.len && SD.records.len.v, alive: SD.records.alive && SD.records.alive.v }));
  check(rec.duel > 0 && rec.len > 0.5 && rec.alive > 0, `Rekorde gespeichert: Duell-Sieg in ${rec.duel} s, Länge ${rec.len}, überlebt ${rec.alive} s`);
  const better = await page.evaluate(() => { const old = SD.records.duel.v; return { worse: SD.setRecord("duel", old + 5), better: SD.setRecord("duel", old / 2) }; });
  // Meldungen kommen nacheinander, die Rekord-Meldung kann also kurz warten
  const rt = await page.waitForFunction(() => /Neuer Rekord: Schnellster Duell-Sieg/.test(document.getElementById("toast").textContent) && document.getElementById("toast").textContent, null, { timeout: 9000 }).then(h => h.jsonValue(), () => "");
  check(!better.worse && better.better && !!rt, `Nur bessere Werte zählen, mit Meldung („${rt}“)`);
  // Clip der letzten Sekunden: nach dem Duell bereit zum Speichern
  await page.waitForFunction(() => SD.clip.blob, null, { timeout: 6000 }).catch(() => {});
  const cl = await page.evaluate(() => ({ size: SD.clip.blob ? SD.clip.blob.size : 0, type: SD.clip.blob ? SD.clip.blob.type : "", btn: !document.getElementById("clipBtn").classList.contains("hidden") && !document.getElementById("clipBtn").disabled }));
  check(cl.size > 1000 && cl.btn, `Clip aufgenommen (${Math.round(cl.size / 1024)} KB, ${cl.type}), Knopf „Clip speichern“ bereit`);
  const dl = page.waitForEvent("download", { timeout: 5000 }).catch(() => null);
  await page.click("#clipBtn");
  const file = await dl;
  check(!!file && /^worm-attack-clip\.(mp4|webm)$/.test(file.suggestedFilename()), `Clip wird als Datei gespeichert (${file && file.suggestedFilename()})`);
  await page.click("#menuBtn");

  // ---------- Arenen ----------
  await page.click("#arenaBtn");
  check((await page.textContent("#arenaBtn")).includes("Säulen") && (await page.evaluate(() => SD.app.match.sim.arena)) === "saeulen", "Arena umschalten: Säulen, das Demo-Duell zeigt sie sofort");
  await page.reload(); await page.waitForFunction(() => SD.skinsReady, null, { timeout: 10000 });
  check((await page.evaluate(() => SD.state.arena)) === "saeulen", "Gewählte Arena bleibt nach dem Neuladen erhalten");
  await page.click("#arenaBtn"); await page.click("#arenaBtn");
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(shots, "11-menue-portale.png") });
  check((await page.textContent("#arenaBtn")).includes("Portale"), "Arena „Portale“ gewählt");

  // ---------- Spielarten ----------
  await page.click("#modeBtn");
  await page.screenshot({ path: path.join(shots, "12-spielarten.png") });
  await page.click('[data-mode="ueberleben"]');
  await page.waitForFunction(() => SD.app.match.phase === "play", null, { timeout: 8000 });
  const ue = await page.evaluate(() => ({ n: SD.app.match.sim.snakes.length, skins: SD.app.skins, arena: SD.app.match.sim.arena, mode: SD.app.match.sim.mode }));
  check(ue.n === 4 && new Set(ue.skins).size === 4 && ue.arena === "portale" && ue.mode === "ueberleben", `Überleben: 4 Würmer mit 4 Designs (${ue.skins.join(", ")}) in der Arena ${ue.arena}`);
  // Emote: Leiste öffnen, eins schicken ⇒ schwebt über dem eigenen Kopf
  await page.click("#emoBtn"); await page.click('#emoBar button[data-e="2"]');
  const em = await page.evaluate(() => SD.app.emotes.map(e => e.i + e.e));
  check(em.includes("0😎") && await page.isHidden("#emoBar"), `Emote gesendet und angezeigt (${em.join(" ")})`);
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(shots, "13-ueberleben.png") });
  await page.evaluate(() => { SD.app.match.sim.snakes[0].x = 0.99; SD.app.match.sim.snakes[0].y = 0; });
  await page.waitForFunction(() => SD.app.match.phase === "end", null, { timeout: 5000 });
  const ue2 = await page.evaluate(() => ({ reason: SD.app.match.sim.reason, why: SD.app.why[0] }));
  check(ue2.reason === "out" && ue2.why === "wall", "Überleben: Wer selbst rausfliegt, beendet die Runde sofort");
  await page.click("#quitBtn"); await page.waitForTimeout(200);

  await page.click("#modeBtn"); await page.click("#bossBtn");
  const bl = await page.evaluate(() => [...document.querySelectorAll("#bossList [data-boss]")].map(b => b.dataset.boss + (b.classList.contains("locked") ? ":zu" : ":offen")).join(" "));
  check(bl === "riese:offen blitz:zu zwillinge:zu bomber:zu", `Boss-Auswahl: nur der Riese ist offen (${bl})`);
  await page.click('[data-boss="blitz"]');
  check(await page.isVisible("#bossPanel"), "Gesperrter Boss startet nicht");
  await page.click('[data-boss="riese"]');
  await page.waitForFunction(() => SD.app.match.phase === "play", null, { timeout: 8000 });
  await page.evaluate(() => { const b = SD.app.match.sim.snakes[1]; b.x = 0.99; b.y = 0; b.ghostUntil = -1; });
  await page.waitForTimeout(250);
  const bo = await page.evaluate(() => ({ lives: SD.app.match.sim.snakes[1].lives, alive: SD.app.match.sim.snakes[1].alive, sc: SD.app.match.sim.snakes[1].sc, toast: document.getElementById("toast").textContent }));
  check(bo.alive && bo.lives === 2 && bo.sc > 1 && bo.toast.includes("Boss getroffen"), `Bosswurm: Crash kostet ein Leben (${bo.lives} übrig, „${bo.toast}“)`);
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(shots, "14-boss.png") });
  // Riese besiegen ⇒ Blitz wird freigeschaltet, „Weiter“ startet ihn
  await page.evaluate(() => { const m = SD.app.match; m.bots[0] = new SD.Bot(10, 4); m.scores = [2, 0]; const b = m.sim.snakes[1]; b.lives = 1; b.x = 0.99; b.y = 0; b.ghostUntil = -1; });
  await page.waitForSelector("#endPanel:not(.hidden)", { timeout: 12000 });
  const be = await page.evaluate(() => ({ title: document.getElementById("endTitle").textContent, sub: document.getElementById("endSub").textContent, again: document.getElementById("againBtn").textContent, beaten: !!SD.bossesBeaten.riese }));
  check(be.beaten && be.title.includes("Riese besiegt") && be.sub.includes("Blitz") && be.again.includes("Blitz"), `Riese besiegt ⇒ ${be.sub.split("·").pop().trim()}, Knopf „${be.again}“`);
  await page.click("#againBtn");
  await page.waitForFunction(() => SD.app.match.phase === "play", null, { timeout: 8000 });
  const bz = await page.evaluate(() => ({ boss: SD.app.match.sim.boss, name: SD.app.oppName }));
  check(bz.boss === "blitz" && bz.name === "BLITZ", "Weiter: Jetzt kommt Blitz");
  await page.click("#quitBtn"); await page.waitForTimeout(200);
  await page.evaluate(() => { SD.app.boss = "zwillinge"; SD.startSolo("boss"); });
  await page.waitForFunction(() => SD.app.match.phase === "play", null, { timeout: 8000 });
  const zw = await page.evaluate(() => ({ n: SD.app.match.sim.snakes.length, skins: SD.app.skins }));
  check(zw.n === 3 && zw.skins[1] === zw.skins[2] && zw.skins[0] !== zw.skins[1], `Zwillinge: drei Würmer, beide Bosse im gleichen Design (${zw.skins.join(", ")})`);
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(shots, "14b-zwillinge.png") });
  await page.click("#quitBtn"); await page.waitForTimeout(200);

  await page.click("#modeBtn"); await page.click('[data-mode="futter"]');
  await page.waitForFunction(() => SD.app.match.phase === "play", null, { timeout: 8000 });
  await page.evaluate(() => { const me = SD.app.match.sim.snakes[0]; me.x = 0.99; me.y = 0; me.ghostUntil = -1; });
  await page.waitForTimeout(250);
  const fu = await page.evaluate(() => ({ alive: SD.app.match.sim.snakes[0].alive, phase: SD.app.match.phase, dur: SD.app.match.sim.dur }));
  check(fu.alive && fu.phase === "play" && fu.dur === 45, "Futterjagd: Wand kostet Länge, aber man bleibt im Spiel");
  await page.click("#quitBtn"); await page.waitForTimeout(200);

  // ---------- Zwei Spieler an einem Handy ----------
  await page.click("#modeBtn"); await page.click('[data-mode="duo"]');
  await page.waitForFunction(() => SD.app.match.phase === "play", null, { timeout: 8000 });
  const duo = await page.evaluate(async () => {
    const cv = document.getElementById("cv"), r = cv.getBoundingClientRect(), wait = ms => new Promise(f => setTimeout(f, ms));
    const ev = (type, id, x, y) => cv.dispatchEvent(new PointerEvent(type, { pointerId: id, clientX: x, clientY: y, bubbles: true, cancelable: true, pointerType: "touch" }));
    const tx = r.left + r.width * 0.5, ty = r.top + r.height * 0.2, bx = r.left + r.width * 0.5, by = r.top + r.height * 0.85;
    ev("pointerdown", 41, tx, ty); ev("pointermove", 41, tx + 40, ty);          // oben nach rechts
    ev("pointerdown", 42, bx, by); ev("pointermove", 42, bx, by - 40);          // unten nach oben (gleichzeitig)
    await wait(120);
    const out = { a1: SD.input.a, a2: SD.input2.a, m0: SD.app.match.inputs[0].a, m1: SD.app.match.inputs[1].a, btn2: !document.getElementById("sprintBtn2").classList.contains("hidden") };
    ev("pointerup", 41, tx + 40, ty); ev("pointerup", 42, bx, by - 40);
    ev("pointerdown", 43, tx, ty); ev("pointerup", 43, tx, ty); await wait(15); ev("pointerdown", 44, tx, ty);   // Doppeltipp oben
    out.s2 = SD.input2.s; out.s1 = SD.input.s; ev("pointerup", 44, tx, ty); out.s2off = !SD.input2.s;
    return out;
  });
  check(Math.abs(duo.a2) < 0.05 && Math.abs(duo.a1 + Math.PI / 2) < 0.05 && duo.m0 === duo.a1 && duo.m1 === duo.a2, `Zwei Spieler: obere Hälfte lenkt Wurm 2 (${duo.a2.toFixed(2)}), untere Wurm 1 (${duo.a1.toFixed(2)}), gleichzeitig`);
  check(duo.s2 && !duo.s1 && duo.s2off && duo.btn2, "Zwei Spieler: Doppeltipp oben lässt nur Spieler 2 sprinten, eigener Sprint-Knopf sichtbar");
  await page.screenshot({ path: path.join(shots, "15-zwei-spieler.png") });
  const st0 = await page.evaluate(() => ({ ...SD.goals.stats }));
  await page.evaluate(() => { const m = SD.app.match; m.bots = [new SD.Bot(9, 1), new SD.Bot(2, 2)]; let g = 0; while (!m.over && g++ < 60 * 70 * 9) m.tick(); });
  await page.waitForSelector("#endPanel:not(.hidden)", { timeout: 8000 });
  const de = await page.evaluate(() => ({ title: document.getElementById("endTitle").textContent, duel: SD.goals.stats.duel, again: document.getElementById("againBtn").textContent }));
  check(/Spieler [12] gewinnt|Unentschieden/.test(de.title) && de.duel === st0.duel, `Zwei Spieler: „${de.title}“, zählt nicht für Aufgaben`);
  await page.click("#menuBtn");
  // ---------- Turnier zu zweit: drei Arenen, je zwei Runden zum Sieg ----------
  await page.click("#modeBtn"); await page.click("#tourBtn");
  await page.waitForFunction(() => SD.app.match && SD.app.mode === "duo", null, { timeout: 5000 });
  const t0 = await page.evaluate(() => ({ arena: SD.app.match.sim.arena, win: SD.app.match.winRounds }));
  check(t0.arena === "saeulen" && t0.win === 2, "Turnier startet in den Säulen, zwei Runden zum Sieg");
  const steps = [];
  for (let k = 0; k < 3; k++) {
    await page.evaluate(() => { const m = SD.app.match; m.bots = [new SD.Bot(10, 1), new SD.Bot(1, 2)]; let g = 0; while (!m.over && g++ < 60 * 70 * 9) m.tick(); });
    await page.waitForSelector("#endPanel:not(.hidden)", { timeout: 8000 });
    const e = await page.evaluate(() => ({ title: document.getElementById("endTitle").textContent, sub: document.getElementById("endSub").textContent, again: document.getElementById("againBtn").textContent }));
    steps.push(e.title);
    if (e.again === "Neues Turnier") break;
    await page.click("#againBtn");
    await page.waitForFunction(() => SD.app.match && !SD.app.match.over && SD.app.match.round === 1, null, { timeout: 5000 });
  }
  await page.screenshot({ path: path.join(shots, "16-turnier.png") });
  const tf = await page.evaluate(() => ({ again: document.getElementById("againBtn").textContent, tour: SD.app.tour }));
  check(tf.again === "Neues Turnier" && tf.tour.done && steps.length >= 2 && /Turnier/.test(steps[steps.length - 1]), `Turnier läuft durch: ${steps.join(" → ")}`);
  await page.click("#menuBtn");
  await page.evaluate(() => { SD.state.arena = "klassisch"; });
  check(errors.length === 0, `Keine Konsolenfehler${errors.length ? ": " + errors.join("; ") : ""}`);

  // Fehlt ein Bild, fällt das Design auf die eingebaute Darstellung zurück und das Spiel läuft trotzdem
  // (eigener Browser-Kontext ohne Service-Worker, damit das Bild wirklich fehlt)
  const ctx2 = await browser.newContext({ ...devices["iPhone 13"], serviceWorkers: "block" });
  const page2 = await ctx2.newPage();
  const crashes = [];
  page2.on("pageerror", e => crashes.push(e.message));
  await page2.route("**/skins/beispiel/glied.png", r => r.abort());
  await page2.goto(URL);
  await page2.click("#giftTake");
  // anderer Tag ⇒ andere Tagesaufgaben
  const page3 = await ctx2.newPage();
  await page3.goto(URL + "?tag=2026-03-11");
  const other = await page3.evaluate(() => SD.goals.daily().ids);
  const same = await page.evaluate(() => SD.goals.daily().ids);
  check(JSON.stringify(other) !== JSON.stringify(same), `Anderer Tag, andere Aufgaben (${other.join(", ")} statt ${same.join(", ")})`);
  await page3.close();
  await page2.waitForFunction(() => SD.skinsReady, null, { timeout: 10000 });
  const fb = await page2.evaluate(() => { const k = SD.SKINS.find(x => x.id === "beispiel"); return { there: !!k, img: k && k.img }; });
  await page2.evaluate(() => { SD.state.skin = "beispiel"; });
  await page2.click("#soloBtn");
  check((await page2.evaluate(() => SD.app.kind)) === "uebung", "Neuer Spieler: Übungsrunde, überspringbar");
  await page2.click("#tutSkip");
  await page2.waitForFunction(() => SD.app.kind === "duell" && SD.app.match.phase === "play", null, { timeout: 8000 });
  await page2.waitForTimeout(500);
  await page2.screenshot({ path: path.join(shots, "6-bild-fehlt.png") });
  check(fb.there && fb.img === null && crashes.length === 0, `Fehlendes Bild: Design bleibt mit eingebauter Darstellung spielbar${crashes.length ? " – " + crashes.join("; ") : ""}`);
  console.log(`Screenshots: ${shots}`);
  await browser.close();
  process.exit(failed ? 1 : 0);
})();
