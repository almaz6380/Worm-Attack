// Prüft die Simulation ohne Browser: Determinismus, Rundenverlauf, Bot-Stärke.
// Aufruf: node tests/sim.test.js   (Node 18+, keine Abhängigkeiten)
"use strict";
const fs = require("fs");
const path = require("path");
const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
const a = html.indexOf("/* SIM-START"), b = html.indexOf("/* SIM-END */");
if (a < 0 || b < 0) throw new Error("SIM-Marker in index.html nicht gefunden");
const { Sim, Bot, Match, DT, DURATION, ARENAS, BOMB_FUSE } = new Function(html.slice(a, b) + ";return { Sim, Bot, Match, DT, DURATION, ARENAS, BOMB_FUSE };")();

let failed = 0;
const check = (ok, msg) => { console.log(`${ok ? "OK  " : "FAIL"} ${msg}`); if (!ok) failed++; };

function playRound(seed, la, lb, opts) {
  const sim = new Sim(seed, false, opts), bots = [new Bot(la, seed + 1), new Bot(lb, seed + 2)];
  let guard = 0;
  while (!sim.done && guard++ < 5000) {
    for (let i = 0; i < 2; i++) { const o = bots[i].think(sim, i); sim.snakes[i].target = o.a; sim.snakes[i].sprint = o.s; }
    sim.step();
  }
  return sim;
}

// 1) Determinismus
for (let s = 1; s <= 5; s++) {
  const x = playRound(s * 1337, 6, 6), y = playRound(s * 1337, 6, 6);
  check(x.done && x.winner === y.winner && x.t === y.t && x.snakes[0].x === y.snakes[0].x,
    `Determinismus Seed ${s}: Sieger ${x.winner}, Ende ${x.t.toFixed(2)} s (${x.reason})`);
}

// 2) Rundenverlauf bei gleich starken Bots
function series(la, lb, n, base) {
  const r = { w: [0, 0], draw: 0, time: 0, d: [], why: {} };
  for (let s = 0; s < n; s++) {
    const sim = playRound(base + s * 7919, la, lb);
    if (sim.winner < 0) r.draw++; else r.w[sim.winner]++;
    if (sim.reason === "time") r.time++;
    r.d.push(sim.t);
  }
  r.d.sort((p, q) => p - q); r.median = r.d[n >> 1];
  return r;
}
const t0 = Date.now();
for (const L of [1, 5, 10]) {
  const r = series(L, L, 100, 11);
  console.log(`     Stufe ${L} gegen ${L}: ${r.w[0]}:${r.w[1]}, unentschieden ${r.draw}, nach Zeit ${r.time}, Median ${r.median.toFixed(1)} s`);
  check(r.d[10] > 3, `Stufe ${L}: 90 % der Runden dauern länger als 3 s (10. kürzeste ${r.d[10].toFixed(1)} s)`);
  check(r.d.every(d => d <= DURATION + DT), `Stufe ${L}: jede Runde endet spätestens nach ${DURATION} s`);
  check(Math.abs(r.w[0] - r.w[1]) <= 30, `Stufe ${L}: Startseiten sind fair (${r.w[0]}:${r.w[1]})`);
}

// 3) Höhere Stufe schlägt niedrigere (beide Startseiten, je 200 Runden: mit acht Jokern ist mehr Glück im Spiel)
function duel(hi, lo, n) {
  const x = series(hi, lo, n, 501), y = series(lo, hi, n, 901);
  return { win: x.w[0] + y.w[1], lose: x.w[1] + y.w[0], draw: x.draw + y.draw };
}
for (const [hi, lo, min] of [[10, 1, 0.75], [5, 1, 0.65], [10, 5, 0.55]]) {
  const r = duel(hi, lo, 200), share = r.win / Math.max(1, r.win + r.lose);
  console.log(`     Stufe ${hi} gegen ${lo}: ${r.win}:${r.lose} (unentschieden ${r.draw}) = ${(share * 100).toFixed(0)} %`);
  check(share >= min, `Stufe ${hi} schlägt Stufe ${lo} in mindestens ${Math.round(min * 100)} % der entschiedenen Runden`);
}

// 4) Ganzes Match läuft bis zum Ende
const m = new Match(4242, [new Bot(5, 1), new Bot(5, 2)]);
let guard = 0;
while (!m.over && guard++ < 60 * 80 * 10) m.tick();
check(m.over && m.matchWinner !== -2, `Match endet: ${m.scores.join(":")} nach ${m.round} Runden`);

// 5) Neue Joker einzeln
const quiet = s => { for (const n of s.snakes) { n.target = n.dir; } };
const place = (sim, i, type) => { const n = sim.snakes[i]; sim.power = { x: n.x + Math.cos(n.dir) * 0.01, y: n.y + Math.sin(n.dir) * 0.01, type }; sim.nextPower = 999; };
{
  const s = new Sim(7, true); s.foods = [{ x: s.snakes[0].x + 0.25, y: s.snakes[0].y, v: 0.07, n: 1 }]; s.foodN = 1;
  place(s, 0, "magnet"); quiet(s); s.step();
  const f = s.foods[0], d0 = Math.hypot(f.x - s.snakes[0].x, f.y - s.snakes[0].y);
  for (let k = 0; k < 10; k++) s.step();
  const d1 = s.foods.includes(f) ? Math.hypot(f.x - s.snakes[0].x, f.y - s.snakes[0].y) : 0;
  check(s.snakes[0].magnetUntil > s.t && d1 < d0 - 0.05, `Magnet zieht Futter heran (Abstand ${d0.toFixed(2)} → ${d1.toFixed(2)})`);
}
{
  const s = new Sim(8, true); place(s, 0, "ice"); quiet(s); s.step();
  const o = s.snakes[1], x0 = o.x, y0 = o.y; s.step();
  const v = Math.hypot(o.x - x0, o.y - y0) / DT;
  check(o.slowUntil > s.t && s.snakes[0].slowUntil < 0 && Math.abs(v - 0.42 * 0.55) < 0.01, `Eis bremst nur den Gegner (Tempo ${v.toFixed(3)})`);
}
{
  const s = new Sim(9, true); place(s, 0, "shield"); quiet(s); s.step();
  const me = s.snakes[0], o = s.snakes[1];
  me.x = o.trail[20]; me.y = o.trail[21]; s.step();
  const ev = s.events.map(e => e.type);
  check(me.alive && me.shieldUntil < 0 && ev.includes("shield"), "Schild fängt den Treffer am Gegner-Körper ab und ist danach verbraucht");
  for (let k = 0; k < 3; k++) { me.x = o.trail[20]; me.y = o.trail[21]; s.step(); }
  check(me.alive, "Danach Schonfrist, solange der Kopf noch im Körper steckt");
}
{
  const s = new Sim(10, true); place(s, 0, "bomb"); quiet(s); s.step();
  const b = s.bombs[0], o = s.snakes[1];
  o.x = b.x + 0.1; o.y = b.y; o.dir = 0; o.trail = [o.x - 0.3, o.y, o.x - 0.2, o.y]; o.target = 0; o.spd = 0;   // Gegner steht still neben der Bombe
  const me = s.snakes[0]; me.x = 0; me.y = -0.6; me.dir = me.target = 0;
  let t = 0; while (o.alive && t++ < 200) s.step();
  const die = s.events.find(e => e.type === "die" && e.i === 1);
  check(!o.alive && die && die.why === "bomb" && Math.abs(s.t - DT * 2 - BOMB_FUSE) < 0.05 && me.alive, `Bombe zündet nach ${BOMB_FUSE} s und trifft nur den Gegner (${die && die.why})`);
}
// 6) Arenen
{
  const s = new Sim(11, true, { arena: "saeulen" }), me = s.snakes[0];
  me.x = -0.2; me.y = 0; me.dir = 0; me.target = 0; me.ghostUntil = 99; let k = 0;
  while (me.alive && k++ < 120) s.step();
  const die = s.events.find(e => e.type === "die");
  check(die && die.why === "block", "Säulen: in die Mittelsäule gefahren ⇒ raus, auch als Geist");
}
{
  const s = new Sim(12, true, { arena: "portale" }), me = s.snakes[0], P = ARENAS.portale.portals[0];
  me.x = P[0][0] - 0.08; me.y = P[0][1]; me.dir = 0; me.target = 0; let k = 0, warp = null;
  while (!warp && k++ < 60) { s.step(); warp = s.events.find(e => e.type === "warp"); }
  check(warp && Math.hypot(me.x - P[1][0], me.y - P[1][1]) < 0.12 && me.alive, `Portale: Kopf kommt am Partner-Portal heraus (${me.x.toFixed(2)}, ${me.y.toFixed(2)})`);
  const late = new Sim(12, false, { arena: "portale" }); late.t = 55; late.step();
  const m2 = late.snakes[0]; m2.x = P[0][0] * 0.55; m2.y = P[0][1] * 0.55;
  check(late.R < 0.88, "Portale schließen sich in der geschrumpften Arena");
}
for (const ar of ["saeulen", "karussell", "portale"]) {
  const r = { w: [0, 0], d: [] };
  for (let s = 0; s < 60; s++) { const sim = playRound(3000 + s * 7919, 5, 5, { arena: ar }); if (sim.winner >= 0) r.w[sim.winner]++; r.d.push(sim.t); }
  r.d.sort((p, q) => p - q);
  console.log(`     Arena ${ar}, Stufe 5 gegen 5: ${r.w[0]}:${r.w[1]}, Median ${r.d[30].toFixed(1)} s`);
  check(r.d[6] > 3 && Math.abs(r.w[0] - r.w[1]) <= 22, `Arena ${ar}: Runden dauern (10. Perzentil ${r.d[6].toFixed(1)} s), Startseiten fair`);
}
// 7) Spielarten
{
  const s = new Sim(13, true, { mode: "futter" }), me = s.snakes[0];
  me.x = 0.99; me.y = 0; me.dir = 0; const len0 = me.len; s.step();
  check(me.alive && me.lives === 998 && me.len < len0 && me.ghostUntil > s.t && Math.cos(me.dir) < -0.9 && Math.hypot(me.x, me.y) < 0.95,
    `Futterjagd: Wand kostet ein Drittel Länge (${len0.toFixed(2)} → ${me.len.toFixed(2)}), Wurm dreht um und bleibt im Spiel`);
  check(s.dur === 45 && s.foodN === 14, "Futterjagd: 45 Sekunden, 14 Futter");
}
{
  const s = new Sim(14, true, { mode: "boss" }), b = s.snakes[1];
  check(b.lives === 3 && b.sc > 1 && b.len > 1 && s.snakes[0].lives === 2, `Boss: 3 Leben (Spieler 2), ${b.sc}-fach dick, Länge ${b.len}`);
  const lives = [];
  for (let k = 0; k < 3; k++) { b.x = 0.99; b.y = 0; b.ghostUntil = -1; s.step(); lives.push(b.alive ? b.lives : "raus"); }
  check(lives.join() === "2,1,raus" && s.done && s.winner === 0, `Boss scheidet beim dritten Crash aus (${lives.join(" → ")})`);
}
{
  const m = new Match(15, [null, new Bot(4, 1), new Bot(4, 2), new Bot(4, 3)], { mode: "ueberleben" });
  while (m.phase !== "play") m.tick();
  check(m.sim.snakes.length === 4 && m.scores.length === 4, "Überleben: vier Würmer");
  m.sim.snakes[2].len = 0.8; m.sim.snakes[0].x = 0.99; m.tick();
  check(m.sim.done && m.sim.reason === "out" && m.sim.winner === 2, `Überleben: Ist der Mensch raus, entscheidet sofort die Länge (Sieger Wurm ${m.sim.winner})`);
  const all = new Match(16, [new Bot(5, 1), new Bot(5, 2), new Bot(5, 3), new Bot(5, 4)], { mode: "ueberleben", arena: "karussell" });
  let g = 0; while (!all.over && g++ < 60 * 80 * 10) all.tick();
  check(all.over && all.matchWinner !== -2, `Überleben mit vier Bots endet: ${all.scores.join(":")} nach ${all.round} Runden`);
  const x = new Match(77, [new Bot(5, 1), new Bot(5, 2)], { mode: "boss", arena: "portale" }), y = new Match(77, [new Bot(5, 1), new Bot(5, 2)], { mode: "boss", arena: "portale" });
  g = 0; while (!x.over && g++ < 60 * 80 * 10) { x.tick(); y.tick(); }
  check(x.over && x.scores.join() === y.scores.join() && x.sim.t === y.sim.t, `Bosswurm in der Portal-Arena ist wiederholbar (${x.scores.join(":")})`);
}

console.log(`     Laufzeit ${((Date.now() - t0) / 1000).toFixed(1)} s`);
console.log(failed ? `\n${failed} Prüfung(en) fehlgeschlagen` : "\nAlle Prüfungen bestanden");
process.exit(failed ? 1 : 0);
