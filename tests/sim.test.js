// Prüft die Simulation ohne Browser: Determinismus, Rundenverlauf, Bot-Stärke.
// Aufruf: node tests/sim.test.js   (Node 18+, keine Abhängigkeiten)
"use strict";
const fs = require("fs");
const path = require("path");
const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
const a = html.indexOf("/* SIM-START"), b = html.indexOf("/* SIM-END */");
if (a < 0 || b < 0) throw new Error("SIM-Marker in index.html nicht gefunden");
const { Sim, Bot, Match, DT, DURATION } = new Function(html.slice(a, b) + ";return { Sim, Bot, Match, DT, DURATION };")();

let failed = 0;
const check = (ok, msg) => { console.log(`${ok ? "OK  " : "FAIL"} ${msg}`); if (!ok) failed++; };

function playRound(seed, la, lb) {
  const sim = new Sim(seed), bots = [new Bot(la, seed + 1), new Bot(lb, seed + 2)];
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

// 3) Höhere Stufe schlägt niedrigere (beide Startseiten)
function duel(hi, lo, n) {
  const x = series(hi, lo, n, 501), y = series(lo, hi, n, 901);
  return { win: x.w[0] + y.w[1], lose: x.w[1] + y.w[0], draw: x.draw + y.draw };
}
for (const [hi, lo, min] of [[10, 1, 0.75], [5, 1, 0.65], [10, 5, 0.55]]) {
  const r = duel(hi, lo, 100), share = r.win / Math.max(1, r.win + r.lose);
  console.log(`     Stufe ${hi} gegen ${lo}: ${r.win}:${r.lose} (unentschieden ${r.draw}) = ${(share * 100).toFixed(0)} %`);
  check(share >= min, `Stufe ${hi} schlägt Stufe ${lo} in mindestens ${Math.round(min * 100)} % der entschiedenen Runden`);
}

// 4) Ganzes Match läuft bis zum Ende
const m = new Match(4242, [new Bot(5, 1), new Bot(5, 2)]);
let guard = 0;
while (!m.over && guard++ < 60 * 80 * 10) m.tick();
check(m.over && m.matchWinner !== -2, `Match endet: ${m.scores.join(":")} nach ${m.round} Runden`);

console.log(`     Laufzeit ${((Date.now() - t0) / 1000).toFixed(1)} s`);
console.log(failed ? `\n${failed} Prüfung(en) fehlgeschlagen` : "\nAlle Prüfungen bestanden");
process.exit(failed ? 1 : 0);
