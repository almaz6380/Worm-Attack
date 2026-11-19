// Online-Duell mit zwei Browser-Fenstern: Spiel erstellen, per Link beitreten, spielen, Revanche, Verlassen.
// Aufruf: node tests/online.test.js [local|peer]
//   local = Test-Verbindung zwischen zwei Tabs (ohne Internet)
//   peer  = echte Verbindung über den öffentlichen PeerJS-Dienst (braucht Internet und WebRTC)
// App muss laufen: python3 -m http.server 8766
"use strict";
const path = require("path"), fs = require("fs");
const { chromium, devices } = require("playwright");
const MODE = process.argv[2] || "local";
const BASE = (process.env.SD_URL || "http://localhost:8766/") + (MODE === "local" ? "?net=local" : "");
const shots = path.join(__dirname, "screenshots");
fs.mkdirSync(shots, { recursive: true });

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ ...devices["iPhone 13"] });
  const host = await ctx.newPage(), guest = await ctx.newPage();
  const errors = [];
  for (const [n, p] of [["Gastgeber", host], ["Gast", guest]]) {
    p.on("pageerror", e => errors.push(`${n}: ${e.message}`));
    p.on("console", m => m.type() === "error" && errors.push(`${n}: ${m.text()}`));
  }
  let failed = 0;
  const check = (ok, msg) => { console.log(`${ok ? "OK  " : "FAIL"} ${msg}`); if (!ok) failed++; };
  const wait = MODE === "peer" ? 30000 : 10000;

  // Gastgeber erstellt das Spiel
  await host.goto(BASE);
  await host.evaluate(() => { SD.state.arena = "portale"; });   // nur im Fenster des Gastgebers, wird nicht gespeichert
  await host.click("#onlineBtn"); await host.click("#hostBtn");
  await host.waitForFunction(() => document.getElementById("lobbyStatus").textContent.includes("Warte") || document.getElementById("lobbyStatus").classList.contains("err"), null, { timeout: wait });
  const lobby = await host.evaluate(() => ({ code: SD.app.code, status: document.getElementById("lobbyStatus").textContent }));
  check(/^\d{4}$/.test(lobby.code) && lobby.status.includes("Warte"), `Spiel erstellt, Code ${lobby.code} (${lobby.status})`);
  await host.screenshot({ path: path.join(shots, `online-${MODE}-1-lobby.png`) });
  if (!lobby.status.includes("Warte")) { await browser.close(); process.exit(1); }

  // Gast tritt über den Einladungslink bei
  await guest.goto(BASE + (BASE.includes("?") ? "&" : "?") + "join=" + lobby.code);
  await Promise.all([
    host.waitForFunction(() => SD.app.mode === "host", null, { timeout: wait }),
    guest.waitForFunction(() => SD.app.mode === "guest" && SD.app.gv && SD.app.gv.round === 1, null, { timeout: wait }),
  ]).then(() => check(true, "Beide verbunden, Runde 1 startet"), e => check(false, "Verbindung: " + e.message.split("\n")[0]));
  if (failed) { console.log("Fehler:", errors); await browser.close(); process.exit(1); }

  // Beide Fenster müssen sichtbar „laufen“ – im Test wechseln wir sie ab
  const pump = async ms => { const end = Date.now() + ms; while (Date.now() < end) { await host.bringToFront(); await host.waitForTimeout(120); await guest.bringToFront(); await guest.waitForTimeout(120); } };
  await host.bringToFront();
  await host.waitForFunction(() => SD.app.match.phase === "play", null, { timeout: 10000 });

  // Designs: beide Fenster teilen sich im Test den Speicher und wählen daher dasselbe Design.
  // Der Gastgeber muss dem Gast dann ein anderes geben, und beide müssen dasselbe Paar sehen.
  await pump(700);
  const hsk = await host.evaluate(() => ({ skins: SD.app.skins, mine: SD.state.skin }));
  const gsk = await guest.evaluate(() => ({ skins: SD.app.skins, mine: SD.state.skin }));
  check(hsk.skins[0] === hsk.mine && hsk.skins[1] !== hsk.skins[0], `Gleiches Design gewählt (${gsk.mine}) ⇒ Gegner bekommt ein anderes (${hsk.skins.join(" / ")})`);
  check(JSON.stringify(hsk.skins) === JSON.stringify(gsk.skins), "Gast sieht dieselben Designs wie der Gastgeber");

  // Arena des Gastgebers kommt beim Gast an
  check((await guest.evaluate(() => SD.app.gv.arena)) === "portale" && (await host.evaluate(() => SD.app.match.sim.arena)) === "portale", "Gast spielt in der Arena des Gastgebers (Portale)");
  // Gast lenkt nach links ⇒ beim Gastgeber dreht Schlange 2 nach links (π)
  await guest.bringToFront();
  const box = await guest.locator("#cv").boundingBox();
  const cx = box.x + box.width / 2, cy = box.y + box.height * 0.8;
  await guest.mouse.move(cx, cy); await guest.mouse.down(); await guest.mouse.move(cx - 50, cy, { steps: 4 });
  await pump(1500);
  const steer = await host.evaluate(() => ({ a: SD.app.match.inputs[1].a, dir: SD.app.match.sim.snakes[1].dir, alive: SD.app.match.sim.snakes[1].alive }));
  check(steer.a !== null && Math.abs(Math.abs(steer.a) - Math.PI) < 0.2, `Lenkung des Gastes kommt beim Gastgeber an (${steer.a && steer.a.toFixed(2)} rad)`);
  check(Math.abs(Math.cos(steer.dir) + 1) < 0.1 || !steer.alive, `Schlange des Gastes fährt nach links (cos ${Math.cos(steer.dir).toFixed(2)})`);
  await guest.mouse.up();

  // Spielstand beim Gast stimmt mit dem Gastgeber überein
  await pump(600);
  await host.bringToFront();
  const hs = await host.evaluate(() => { const s = SD.app.match.sim; return { t: s.t, x: s.snakes[0].x, y: s.snakes[0].y, len: s.snakes[1].len, foods: s.foods.length }; });
  await guest.bringToFront(); await guest.waitForTimeout(200);
  const gs = await guest.evaluate(() => { const v = SD.app.gv; return { t: v.t, x: v.snakes[0].x, y: v.snakes[0].y, len: v.snakes[1].len, foods: v.foods.length, trail: v.snakes[0].trail.length / 2, phase: v.phase }; });
  check(gs.phase !== "wait" && gs.trail > 10, `Gast empfängt Spielstand (Phase ${gs.phase}, ${gs.trail} Spurpunkte, ${gs.foods} Futter)`);
  check(Math.abs(gs.len - hs.len) < 0.15, `Länge stimmt überein (Gastgeber ${hs.len.toFixed(2)}, Gast ${gs.len.toFixed(2)})`);
  await guest.screenshot({ path: path.join(shots, `online-${MODE}-2-gast.png`) });
  // Emotes in beide Richtungen
  await guest.bringToFront(); await guest.click("#emoBtn"); await guest.click('#emoBar button[data-e="1"]');
  await pump(400);
  await host.click("#emoBtn"); await host.click('#emoBar button[data-e="5"]');
  await pump(400);
  const he = await host.evaluate(() => SD.app.emotes.map(e => e.i + e.e).join(" ")), ge = await guest.evaluate(() => SD.app.emotes.map(e => e.i + e.e).join(" "));
  check(he.includes("1😂") && ge.includes("0👍"), `Emotes kommen beim anderen an (Gastgeber sieht „${he}“, Gast sieht „${ge}“)`);
  await host.bringToFront(); await host.waitForTimeout(150);
  await host.screenshot({ path: path.join(shots, `online-${MODE}-3-gastgeber.png`) });

  // Schnelldurchlauf bis zum Ende des Duells (Bots übernehmen beim Gastgeber)
  await host.evaluate(() => { const m = SD.app.match; m.bots = [new SD.Bot(8, 1), new SD.Bot(2, 2)]; let g = 0; while (!m.over && g++ < 60 * 70 * 9) m.tick(); });
  await host.waitForSelector("#endPanel:not(.hidden)", { timeout: 8000 });
  await guest.bringToFront();
  await guest.waitForSelector("#endPanel:not(.hidden)", { timeout: 8000 }).catch(() => {});
  const ends = [await host.evaluate(() => [document.getElementById("endTitle").textContent, document.getElementById("endSub").textContent]),
                await guest.evaluate(() => [document.getElementById("endTitle").textContent, document.getElementById("endSub").textContent])];
  check(/gewonnen|verloren|Unentschieden/.test(ends[0][0]) && /gewonnen|verloren|Unentschieden/.test(ends[1][0]), `Ergebnis Gastgeber: ${ends[0].join(" · ")} | Gast: ${ends[1].join(" · ")}`);
  check(ends[0][0] !== ends[1][0] || ends[0][0].includes("Unentschieden"), "Beide sehen das passende Gegenstück (Sieg/Niederlage)");
  check(ends[0][1].includes("Bilanz gegen diesen Freund") && ends[1][1].includes("Bilanz gegen diesen Freund"), "Beide sehen die Bilanz gegen diesen Freund");
  await guest.screenshot({ path: path.join(shots, `online-${MODE}-4-ende-gast.png`) });

  // Revanche vom Gast aus – der Gastgeber hat inzwischen „Überleben“ gewählt (beide Freunde plus zwei Computer-Würmer)
  await host.evaluate(() => { SD.state.netmode = "ueberleben"; });
  await guest.click("#againBtn");
  await host.bringToFront();
  await host.waitForFunction(() => SD.app.match.round === 1 && !SD.app.match.over, null, { timeout: 8000 }).then(() => check(true, "Revanche startet ein neues Duell"), () => check(false, "Revanche startet nicht"));
  await pump(800);                                        // der Gastgeber muss sichtbar sein, damit er Spielstände schickt
  await guest.bringToFront();
  await guest.waitForSelector("#endPanel.hidden", { timeout: 8000, state: "attached" }).then(() => check(true, "Gast ist wieder im Spiel"), () => check(false, "Gast bleibt im Ergebnis hängen"));
  await pump(1500);
  const ue = await guest.evaluate(() => ({ n: SD.app.gv.snakes.length, mode: SD.app.gv.mode, skins: SD.app.skins, trail: SD.app.gv.snakes[3].trail.length }));
  const hu = await host.evaluate(() => ({ n: SD.app.match.sim.snakes.length, skins: SD.app.skins, bots: SD.app.match.bots.map(b => !!b) }));
  check(ue.n === 4 && hu.n === 4 && ue.mode === "ueberleben" && ue.trail > 10 && hu.bots.join() === "false,false,true,true", `Online-Überleben: Gast sieht 4 Würmer (2 Freunde, 2 Computer), Spielart ${ue.mode}`);
  check(JSON.stringify(ue.skins) === JSON.stringify(hu.skins) && new Set(ue.skins).size === 4, `Alle vier Designs stimmen überein (${ue.skins.join(", ")})`);
  await guest.bringToFront(); await guest.screenshot({ path: path.join(shots, `online-${MODE}-5-ueberleben-gast.png`) });
  await host.bringToFront();
  await host.evaluate(() => { const m = SD.app.match; m.bots[0] = new SD.Bot(8, 1); m.bots[1] = new SD.Bot(8, 2); let g = 0; while (!m.over && g++ < 60 * 70 * 9) m.tick(); });
  await host.waitForSelector("#endPanel:not(.hidden)", { timeout: 8000 });
  await guest.bringToFront();
  await guest.waitForSelector("#endPanel:not(.hidden)", { timeout: 8000 }).catch(() => {});
  const ue2 = await guest.evaluate(() => [document.getElementById("endTitle").textContent, document.getElementById("endSub").textContent]);
  check(/gewonnen|verloren|Unentschieden/.test(ue2[0]) && /Bilanz/.test(ue2[1]), `Online-Überleben endet beim Gast: ${ue2.join(" · ").replace(/\n/g, " · ")}`);

  // Gastgeber verlässt ⇒ Gast landet mit Hinweis im Menü
  host.on("dialog", d => d.accept());
  await host.bringToFront(); await host.click("#quitBtn");
  await guest.bringToFront();
  await guest.waitForSelector("#menuPanel:not(.hidden)", { timeout: wait }).catch(() => {});
  check(await guest.isVisible("#menuPanel"), `Gast zurück im Menü: „${(await guest.textContent("#menuStatus")).trim()}“`);

  // Falscher Code ⇒ klare Meldung
  await guest.click("#onlineBtn"); await guest.fill("#codeInput", "0000"); await guest.click("#joinBtn");
  await guest.waitForFunction(() => document.getElementById("menuStatus").classList.contains("err"), null, { timeout: 25000 }).catch(() => {});
  check((await guest.textContent("#menuStatus")).includes("Kein offenes Spiel"), `Falscher Code: „${(await guest.textContent("#menuStatus")).trim()}“`);

  check(errors.length === 0, `Keine Konsolenfehler${errors.length ? ": " + errors.join("; ") : ""}`);
  await browser.close();
  process.exit(failed ? 1 : 0);
})();
