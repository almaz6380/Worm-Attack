# CLAUDE.md – Projekt „Worm Attack“ (Repo `Worm-Attack`)

Diese Datei ist die Arbeitsanweisung für jede Claude-Code-Sitzung in diesem Repo. Lies sie komplett,
bevor du etwas änderst.

## Worum es geht

**Worm Attack** ist ein Schlangen-Duell 1 gegen 1 fürs Handy. Zwei Schlangen bewegen sich frei und fließend
(kein Raster) in einer runden Arena. Man spielt **gegen den Computer** oder **online gegen Freunde**.
Es läuft als Web-App im Handy-Browser, veröffentlicht über GitHub Pages unter
`https://almaz6380.github.io/Worm-Attack/`.

**Stand:** Ein fertiger, automatisch getesteter Prototyp liegt als `index.html` im Repo. Er stammt aus dem Repo
`almaz6380/brainstorm` (Ordner `snake-duel/`). Baue darauf auf, schreibe nichts neu.

**Noch nie geprüft:** Spielgefühl auf echten Handys, Schwierigkeit für Menschen, Online zwischen zwei echten
Handys in verschiedenen Netzen. Bisher liefen nur Bots und zwei Browser-Fenster auf einem Rechner.

## Feste Regeln (nicht verhandelbar)

- **Eine Datei:** Das ganze Spiel bleibt in `index.html` (HTML + CSS + JavaScript). Keine Build-Tools,
  keine Frameworks. Einzige fremde Bibliothek: `peerjs`, fest gepinnt, nur für den Online-Modus nachgeladen.
- **Keine Kosten:** keine API-Keys, kein eigener Server, keine Käufe, keine Werbung ohne ausdrückliche Anweisung.
- **Deutsch** für alle Texte im Spiel, in Kommentaren und in Commit-Nachrichten.
- **Handy zuerst:** Hochformat 9:16, Bedienung mit dem Daumen, muss in iPhone-Safari und Android-Chrome laufen.
- **Wiederholbar:** Zwischen den Markern `/* SIM-START` und `/* SIM-END */` (Klassen `Sim`, `Bot`, `Match`)
  kein `Math.random()`, kein `Date`, kein DOM. Nur der Seed-Zufall (`mulberry32`). Gleicher Seed ⇒ gleicher Ablauf.
- **Marker stehen lassen:** `tests/sim.test.js` liest den Code zwischen `SIM-START` und `SIM-END` aus `index.html`.
- **Kompatibel bleiben:** Speicher-Präfix `sd_` (localStorage) und Netz-Präfix `snakeduell-v1-` nicht ändern.
  Wenn sich das Online-Protokoll unverträglich ändert, die Versionsnummer im Netz-Präfix hochzählen.
- **Eigenes Spiel:** Regeln, Grafik und Namen sind eigene. Nichts von bestehenden Spielen kopieren.
- `localStorage` immer in try/catch. Das Spiel muss auch ohne Speicher laufen.

## Dateien

| Datei | Inhalt |
| --- | --- |
| `index.html` | Das komplette Spiel |
| `manifest.webmanifest`, `sw.js`, `icons/` | Installierbare Web-App, offline spielbar gegen den Computer |
| `README.md` | Regeln und Anleitung für Menschen |
| `CLAUDE.md` | Diese Arbeitsanweisung |
| `tests/sim.test.js` | Simulation ohne Browser: Determinismus, Rundenverlauf, Bot-Stufen |
| `tests/ui.test.js` | Partie gegen den Computer im simulierten iPhone (Playwright) |
| `tests/online.test.js` | Online-Duell mit zwei Fenstern: `local` (ohne Internet) oder `peer` (echter Dienst) |

## Spielregeln (so ist es umgesetzt)

Arena-Radius = 1. Fester Zeitschritt 1/60 s. Alle Werte stehen als Konstanten am Anfang des SIM-Blocks.

- **Format:** Wer zuerst 3 Runden gewinnt, gewinnt das Duell. Höchstens 9 Runden, 3 s Countdown vor jeder Runde.
- **Bewegung:** Tempo 0,42 pro Sekunde, Sprint 0,68. Drehrate 3,6 rad/s. Die Schlange dreht zur Zielrichtung
  der Eingabe und fährt sonst geradeaus.
- **Körper:** Spur aus Punkten im Abstand 0,012. Startlänge 0,55, Mindestlänge 0,28, Höchstlänge 3.
  Kopf-Radius 0,028, Körper-Radius 0,021.
- **Verloren:** Kopf berührt Arena-Wand, Körper des Gegners, eigenen Körper (die neuesten 20 Spurpunkte zählen
  nicht) oder eine Joker-Mauer des Gegners.
- **Kopf an Kopf:** Die längere Schlange gewinnt. Unterschied unter 0,05 ⇒ beide raus, Runde unentschieden.
- **Futter:** Immer 7 normale Futterpunkte (+0,07 Länge).
- **Sprint:** kostet 0,11 Länge pro Sekunde, nur über Mindestlänge möglich. Verlorene Länge bleibt als kleines
  Futter (+0,04) am Schwanzende liegen.
- **Joker:** Der erste erscheint nach 5 bis 7 s, danach 6 bis 9 s nach dem Einsammeln. Höchstens einer im Feld.

  | Joker | Wirkung |
  | --- | --- |
  | Turbo | 3 s Sprint ohne Längenverlust |
  | Geist | 2 s durch Körper und Joker-Mauern fahren, nicht durch die Arena-Wand. Danach bis 0,8 s Schonfrist, solange der Kopf noch in einem Körper steckt |
  | Schere | Gegner verliert ein Drittel seiner Länge, das abgeschnittene Stück wird Futter |
  | Mauer | Kopie der eigenen Spur bleibt 4 s als Hindernis für den Gegner stehen |

- **Sudden Death:** Ab Sekunde 40 schrumpft die Arena gleichmäßig bis Sekunde 60 auf Radius 0,45.
  Nach 60 s gewinnt die längere Schlange (Unterschied unter 0,02 ⇒ unentschieden).

## Modus „Gegen Computer“

`Bot(level, seed)`: Stufe 1 bis 10, darüber wird er nicht stärker. Mit `k = (Stufe − 1) / 9`:

| Eigenschaft | Wert |
| --- | --- |
| Vorschau | 0,55 + 0,6·k Sekunden |
| Reaktion | alle `round(10 − 7·k)` Ticks eine neue Entscheidung |
| Fehlerquote | 0,11 · (1 − k)^1,5 pro Entscheidung (zufällige Lenkrichtung) |
| Sprint und Gegner-Weg vorausrechnen | ab Stufe 4 |
| Gegner aktiv abschneiden | ab Stufe 5 |
| Zweite Vorschau-Stufe (Sackgassen erkennen) | ab Stufe 6 |

- Der Bot testet 7 Lenkrichtungen (`BOT_DELTAS`) und bewertet Überleben, Abstand zu Hindernissen und Nähe zum Ziel.
- Ziel-Reihenfolge: Joker, dann Gegner abschneiden, dann Futter, dann Arena-Mitte.
- **Gemessen** (`tests/sim.test.js`, Bot gegen Bot, entschiedene Runden): Stufe 10 schlägt Stufe 1 in 91 %,
  Stufe 5 schlägt Stufe 1 in 80 %, Stufe 10 schlägt Stufe 5 in 64 %. Mittlere Rundendauer: 14 s (Stufe 1),
  30 s (Stufe 5), 54 s (Stufe 10).
- Sieg ⇒ Stufe +1, gespeichert als `sd_level`. Siege gesamt in `sd_wins`. Lenkart in `sd_steer`, Design in `sd_skin`.

## Modus „Online gegen Freunde“

- **Verbinden:** Gastgeber erzeugt einen 4-stelligen Code. Der Gast tritt per Code oder Link `?join=CODE` bei.
  WebRTC-Datenkanal über `peerjs@1.5.5`, Vermittlung über den öffentlichen PeerJS-Dienst.
  Peer-ID des Gastgebers: `snakeduell-v1-<Code>`.
- **Wer rechnet:** Der Gastgeber ist Schlange 0 und lässt `Match` laufen. Der Gast ist Schlange 1.
- **Nachrichten** (JSON):

  | Art | Richtung | Inhalt |
  | --- | --- | --- |
  | `hello` | Gast → Gastgeber | nach dem Verbinden, mit `sk` = gewähltes Design |
  | `i` | Gast → Gastgeber | Eingabe: `a` Zielrichtung (rad oder `null`), `s` Sprint. Bei Änderung, sonst alle 100 ms |
  | `s` | Gastgeber → Gast | Spielstand, 30-mal pro Sekunde (alle 2 Ticks). Zahlen ×1000 gerundet |
  | `again` | Gast → Gastgeber | Revanche nach Duell-Ende |
  | `bye` | beide | Spiel verlassen |

- **Spielstand `s`:** Phase, Punkte, Runde, Zeit, Arena-Radius, Köpfe (Position, Richtung, Länge, Zustände),
  Futter, Joker, Ereignisse. Die Spuren baut der Gast aus den Kopf-Positionen selbst mit (`applySnap`,
  `trimByLength`). Ein **voller Abgleich** mit Spuren und Mauern kommt alle 15 Spielstände sowie bei Rundenstart,
  Schere und Mauer (`m.full`).
- **Darstellung beim Gast:** Köpfe werden zwischen den letzten zwei Spielständen weich zwischengerechnet
  (`guestView`), also etwa 33 ms verzögert plus Laufzeit.
- **Test-Schalter:** `?net=local` ersetzt PeerJS durch einen `BroadcastChannel` zwischen zwei Tabs.
- **Bekannte Grenzen:** Kein TURN-Server, daher in manchen Netzen keine Verbindung. Pausiert der Browser des
  Gastgebers (App-Wechsel, Bildschirmsperre), steht das Spiel. Der Gast lenkt verzögert.

## Aufbau von `index.html`

| Baustein | Aufgabe |
| --- | --- |
| `Sim` | Eine Runde: `step()` rechnet einen Zeitschritt. Eingaben über `snakes[i].target` und `.sprint`. Ereignisse in `events` |
| `Bot` | `think(sim, i)` liefert `{a, s}`; `roll()` ist die Vorschau |
| `Match` | Runden, Punkte, Phasen `count → play → end → over`; `tick()` |
| `hostView` / `guestView` | Bauen die Ansicht für `render()`: lokal aus `Match`, beim Gast aus dem Netz |
| `buildSnap` / `applySnap` | Spielstand senden und empfangen |
| `makeTransport(code, rolle)` | Verbindung: PeerJS oder Test-Kanal, gleiche Schnittstelle |
| `render()` und `draw…` | Canvas 720 × 1280: Arena, Würmer (`drawSnake`, `drawHead`, `segPositions`, `disc`), Futter, Joker, Anzeige, Banner |
| `SKINS`, `skinOf(i)`, `otherSkin()` | Wurm-Designs: Farbpalette je Glied, Freischalt-Stufe, Ausweichen bei gleichem Design |
| `fx(e)` | Ereignisse ⇒ Töne (WebAudio), Funken, Hinweise |
| `startSolo` / `hostGame` / `joinGame` / `startNetMatch` / `showEnd` / `toMenu` | Spielablauf |
| Steuerung | Zwei Lenkarten (`state.steer`, gespeichert als `sd_steer`): „Kreis“ = schwebender Joystick, „Zum Finger“ = `aimAtFinger()`. Dazu Sprint-Knopf und Tastatur |
| `window.SD` | Zugriff für Tests: `app`, `state`, `input`, `Sim`, `Bot`, `Match` |

Im Menü läuft im Hintergrund ein Demo-Duell Bot gegen Bot.

**Aussehen der Würmer** (nur Darstellung, die Simulation weiß nichts davon):
- Der Körper wird aus Gliedern gestempelt: `disc(farbe)` zeichnet ein Glied einmal vor (28 px, Glanzlicht, Rand),
  `segPositions()` verteilt die Glieder gleichmäßig vom Kopf aus entlang der Spur. Das Muster hängt am Kopf
  (Glied-Nummer `k`), damit es mit dem Wurm mitwandert.
- Sichtbare Dicke = Kollisionsgröße × 1,13 (Kopf × 1,32). Nicht weiter vergrößern, sonst sehen Treffer unfair aus.
- Gesicht: Pupillen folgen der Lenkung, Blinzeln, offener Mund bei nahem Futter, X-Augen nach dem Ausscheiden.
- Effekte: Futter-Beule (`app.bulges`), Funken bei Sprint, Flammen bei Turbo, heller Umriss als Geist, beim
  Ausscheiden zerfällt der Körper in Glieder (Partikel mit `img`).
- Designs: `SKINS` (Minze, Bonbon, Tiger frei; Eis ab Stufe 3, Lava ab 5, Regenbogen ab 8), gespeichert als
  `sd_skin`. `app.skins[i]` gilt pro Schlange. Online schickt der Gast sein Design in `hello` (`sk`), der
  Gastgeber das Paar in vollen Spielständen (`sk`). Beides sind freiwillige Felder, alte Versionen ignorieren sie.
- Gemessen im simulierten Handy ohne Grafikkarte: zwei Würmer mit Höchstlänge kosten etwa 6 ms pro Bild, bei
  üblicher Länge etwa ein Drittel. Auf echten Handys noch nicht gemessen.

**Steuerung – diese Regeln nicht aufweichen** (Rückmeldung vom echten Handy: der Kreis blieb an alter Stelle hängen):
- Der **zuletzt aufgesetzte Finger lenkt immer**. Jedes `pointerdown` auf dem Spielfeld setzt `joy` neu.
- Es gibt **keinen** „zweiter Finger = Sprint“ mehr. Sprint nur über den ⚡-Knopf und die Leertaste.
- Loslassen wird am Canvas und am Fenster abgefangen (`pointerup`, `pointercancel`, `lostpointercapture`),
  dazu `blur` und `visibilitychange`.
- Kreis: wandert ab 45 px Abstand mit (`JOY_R`), Lenkung reagiert ab 8 px (`JOY_DEAD`).
- `tests/ui.test.js` stellt ein verlorenes Loslassen nach und prüft beide Lenkarten.

## Aufgaben – in dieser Reihenfolge

### 1. Repo einrichten ✅ erledigt
- Alle Dateien liegen im Repo-Root auf `main`, die Tests waren beim Einrichten grün.
- Zu Beginn jeder neuen Sitzung trotzdem einmal alle Tests ausführen (siehe Arbeitsweise).

### 2. Auf echten Handys testbar machen
- Den User bitten, GitHub Pages einzuschalten (Settings → Pages → Branch `main`, Ordner `/ (root)`), falls noch
  nicht geschehen. Das Repo ist öffentlich, Pages ist damit kostenlos.
- Den User bitten, auf iPhone und Android zu spielen und Online mit zwei Handys zu testen: einmal im selben
  WLAN, einmal WLAN gegen mobile Daten.
- **Fertig, wenn:** Der User hat Rückmeldung gegeben zu Steuerung, Tempo, Schwierigkeit und Online-Verzögerung.
  Diese Rückmeldung bestimmt die Aufgaben 3 und 4.
- **Stand:** Erste Rückmeldung zur Steuerung ist eingearbeitet (Kreis sitzt immer am neuen Finger, zweite
  Lenkart „Zum Finger“). Offen: Bestätigung vom Handy, dazu Tempo, Schwierigkeit und Online.

### 3. Schwierigkeit für Menschen einstellen
- Ziel: Stufe 1 gewinnt ein Neuling meistens, ab Stufe 5 wird es fordernd.
- Stellschrauben im `Bot`: Vorschau, Reaktion, Fehlerquote, ab welcher Stufe abgeschnitten wird.
- **Fertig, wenn:** Der User ist mit Stufe 1 bis 3 zufrieden, `sim.test.js` ist grün und die Messwerte oben in
  dieser Datei sind aktualisiert.

### 4. Online verbessern
- Hinweis beim Gast „Warte auf Gastgeber …“, wenn länger als 1,5 s kein Spielstand kommt. Beim Gastgeber
  `visibilitychange` nutzen und dem Gast eine Pause melden.
- Lenkung des Gastes direkter machen: eigene Schlange auf dem Gast-Handy sofort drehen und beim nächsten
  Spielstand abgleichen. Vorher mit dem User klären, ob die Verzögerung überhaupt stört.
- TURN-Server nur, wenn es dauerhaft kostenlos geht und der User zustimmt. Keine Zugangsdaten ins Repo.
- **Fertig, wenn:** `online.test.js local` und `peer` grün, ein Test für die Pause ergänzt.

### 5. Mehr Inhalt
- ✅ Wurm-Designs als Belohnung für Stufen (erledigt, siehe „Aussehen der Würmer“). Weitere Designs sind willkommen.
- Weitere Joker, zum Beispiel Magnet für Futter oder Bremse für den Gegner.
- Modus „2 Spieler an einem Handy“ (Handy liegt auf dem Tisch, jeder hat eine Seite).
- **Fertig, wenn:** jeweils wählbar, gespeichert, Tests ergänzt und grün.

### 6. Später (nur auf Anweisung)
- Rangliste oder Matchmaking mit Fremden (braucht einen Server, also Kosten klären).
- Als Store-App verpacken (Apple 99 $ pro Jahr, Google 25 $ einmalig).

## Arbeitsweise

- Vor jedem Commit:
  ```bash
  node tests/sim.test.js
  python3 -m http.server 8766 &
  node tests/ui.test.js
  node tests/online.test.js local
  ```
  Nach Änderungen am Netz-Code zusätzlich `node tests/online.test.js peer`.
- Wer an `Sim` oder `Bot` dreht: die Zahlen aus `sim.test.js` vorher und nachher vergleichen und im Commit nennen.
- Bei Änderungen an der Oberfläche die Screenshots in `tests/screenshots/` ansehen (Überlappungen, Lesbarkeit).
- Bei Änderungen an `sw.js` oder den gespeicherten Dateien `VERSION` in `sw.js` hochzählen.
- Kleine, klare Commits auf Deutsch.
- Nach jeder Aufgabe dem User kurz sagen, was sich geändert hat und wie man es ausprobiert. Ehrlich benennen,
  was nur simuliert und was auf echten Handys getestet wurde.
