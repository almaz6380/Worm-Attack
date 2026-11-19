# CLAUDE.md – Projekt „Worm Attack“ (Repo `Worm-Attack`)

Diese Datei ist die Arbeitsanweisung für jede Claude-Code-Sitzung in diesem Repo. Lies sie komplett,
bevor du etwas änderst.

## Worum es geht

**Worm Attack** ist ein Schlangen-Duell fürs Handy. Die Schlangen bewegen sich frei und fließend
(kein Raster) in einer runden Arena. Man spielt **gegen den Computer** (Duell, Überleben gegen drei, Futterjagd,
Bosswurm), **online gegen Freunde** oder **zu zweit an einem Handy**. Vier Arenen, acht Joker.
Es läuft als Web-App im Handy-Browser, veröffentlicht über GitHub Pages unter
`https://almaz6380.github.io/Worm-Attack/`.

**Stand:** Das Spiel ist online und spielbar. Der ganze Code liegt in `index.html`, alles ist automatisch
getestet. Was bisher gebaut wurde, was der User zurückgemeldet hat und was als Nächstes ansteht, steht in
[`UEBERGABE.md`](UEBERGABE.md). **Lies die Übergabe zu Beginn einer neuen Sitzung.**

**Vom User auf dem echten Handy bestätigt:** Das Spiel läuft („nicht schlecht“). Seine einzige Fehlermeldung
bisher: Der Steuerkreis blieb an alter Stelle hängen. Das ist umgebaut, eine Bestätigung steht noch aus.

**Noch nie auf echten Geräten geprüft:** Schwierigkeit für Menschen, Online zwischen zwei echten Handys in
verschiedenen Netzen, Flüssigkeit bei langen Würmern, Doppeltipp-Sprint, Vibration, Zeitlupe, und alles aus der
Erweiterung vom 19.11.2026: neue Joker, Arenen, Spielarten, zwei Spieler an einem Handy, Emotes, Bilanz, Clips
(besonders: Aufnahme und Teilen in iPhone-Safari, Ruckeln während der Aufnahme). Bisher liefen dafür nur Bots und
simulierte Browser auf einem Rechner.

**Zusammenarbeit mit dem User:**
- Er schreibt kurz und auf Deutsch und ist kein Programmierer. Antworten auf Deutsch, ohne Fachbegriffe.
- Er will Ergebnisse sofort auf dem Handy sehen: nach grünen Tests direkt auf `main` pushen (das hat er für
  dieses Repo mehrfach freigegeben). GitHub Pages liefert `main` aus.
- Er schickt Bilder für Wurm-Designs im Chat. Die bereitet Claude auf (siehe „Aussehen der Würmer“).
- Immer ehrlich sagen, was nur simuliert und was auf echten Handys geprüft ist.

## Feste Regeln (nicht verhandelbar)

- **Eine Datei:** Der ganze Code bleibt in `index.html` (HTML + CSS + JavaScript). Keine Build-Tools,
  keine Frameworks. Einzige fremde Bibliothek: `peerjs`, fest gepinnt, nur für den Online-Modus nachgeladen.
  **Ausnahme (vom User freigegeben):** Bilder für Wurm-Designs liegen als Dateien im Ordner `skins/`, so wie die
  Icons in `icons/`. Das Spiel muss auch ohne diese Bilder starten.
- **Keine Kosten:** keine API-Keys, kein eigener Server, keine Käufe, keine Werbung ohne ausdrückliche Anweisung.
- **Deutsch** für alle Texte im Spiel, in Kommentaren und in Commit-Nachrichten.
- **Handy zuerst:** Hochformat 9:16, Bedienung mit dem Daumen, muss in iPhone-Safari und Android-Chrome laufen.
- **Wiederholbar:** Zwischen den Markern `/* SIM-START` und `/* SIM-END */` (Klassen `Sim`, `Bot`, `Match`)
  kein `Math.random()`, kein `Date`, kein DOM. Nur der Seed-Zufall (`mulberry32`). Gleicher Seed ⇒ gleicher Ablauf.
- **Marker stehen lassen:** `tests/sim.test.js` liest den Code zwischen `SIM-START` und `SIM-END` aus `index.html`.
- **Kompatibel bleiben:** Speicher-Präfix `sd_` (localStorage) nicht ändern. Netz-Präfix ist `snakeduell-v2-`
  (seit den neuen Jokern und Arenen; v1-Spiele passen nicht mehr zusammen). Wenn sich das Online-Protokoll
  unverträglich ändert, die Versionsnummer im Netz-Präfix hochzählen.
- **Eigenes Spiel:** Regeln, Grafik und Namen sind eigene. Nichts von bestehenden Spielen kopieren.
- `localStorage` immer in try/catch. Das Spiel muss auch ohne Speicher laufen.

## Dateien

| Datei | Inhalt |
| --- | --- |
| `index.html` | Das komplette Spiel |
| `manifest.webmanifest`, `sw.js`, `icons/` | Installierbare Web-App, offline spielbar gegen den Computer |
| `skins/` | Bild-Designs: `liste.json`, pro Design ein Ordner mit `kopf.png`, `glied.png`, optional `schwanz.png`. `ANLEITUNG.md` erklärt dem User das Gestalten, `PROMPTS.md` enthält fertige kie.ai-Prompts |
| `README.md` | Regeln und Anleitung für Menschen |
| `CLAUDE.md` | Diese Arbeitsanweisung |
| `UEBERGABE.md` | Stand, Verlauf, Rückmeldungen des Users, offene Punkte und Ideen. Nach jeder größeren Änderung nachführen |
| `tests/sim.test.js` | Simulation ohne Browser: Determinismus, Rundenverlauf, Bot-Stufen, jeder neue Joker, Arenen, Spielarten |
| `tests/ui.test.js` | Simuliertes iPhone (Playwright): Menü, Lenkung, Sprint, Designs, Aufgaben, Sterne, Effekte, Clip, Arenen, Spielarten, zwei Spieler, Emotes, eine ganze Partie |
| `tests/online.test.js` | Online-Duell mit zwei Fenstern: `local` (ohne Internet) oder `peer` (echter Dienst). Prüft auch Arena, Emotes, Bilanz |

## Spielregeln (so ist es umgesetzt)

Arena-Radius = 1. Fester Zeitschritt 1/60 s. Alle Werte stehen als Konstanten am Anfang des SIM-Blocks
(`MODES`, `ARENAS`, `BOSS` eingeschlossen). `Sim(seed, record, { mode, arena })` kann beliebig viele Würmer.

- **Format:** Wer zuerst 3 Runden gewinnt, gewinnt das Duell. Höchstens 9 Runden, 3 s Countdown vor jeder Runde.
- **Bewegung:** Tempo 0,42 pro Sekunde, Sprint 0,68. Drehrate 3,6 rad/s. Die Schlange dreht zur Zielrichtung
  der Eingabe und fährt sonst geradeaus.
- **Körper:** Spur aus Punkten im Abstand 0,012. Startlänge 0,55, Mindestlänge 0,28, Höchstlänge 3.
  Kopf-Radius 0,028, Körper-Radius 0,021.
- **Verloren:** Kopf berührt Arena-Wand, ein Hindernis der Arena, Körper eines Gegners, eigenen Körper (die
  neuesten 20 Spurpunkte zählen nicht), eine Joker-Mauer eines Gegners oder steht im Umkreis einer gegnerischen Bombe.
  Mit mehreren Leben (`lives`, Futterjagd und Bosswurm) kostet ein Treffer stattdessen ein Leben (`hurt`): ein Drittel
  der Länge wird Futter, 1,5 s Geist, an Wand oder Hindernis dreht der Wurm um.
- **Kopf an Kopf:** Die längere Schlange gewinnt. Unterschied unter 0,05 ⇒ beide raus, Runde unentschieden.
- **Runde vorbei:** wenn höchstens ein Wurm übrig ist. Mehr als zwei Würmer: Ist kein Mensch mehr dabei, entscheidet
  sofort die Länge (`finish("out")`).
- **Futter:** Immer 7 normale Futterpunkte (+0,07 Länge), je nach Spielart mehr.
- **Sprint:** kostet 0,11 Länge pro Sekunde, nur über Mindestlänge möglich. Verlorene Länge bleibt als kleines
  Futter (+0,04) am Schwanzende liegen.
- **Joker:** Der erste erscheint nach 5 bis 7 s, danach 6 bis 9 s nach dem Einsammeln. Höchstens einer im Feld.

  | Joker | Wirkung |
  | --- | --- |
  | Turbo | 3 s Sprint ohne Längenverlust |
  | Geist | 2 s durch Körper und Joker-Mauern fahren, nicht durch die Arena-Wand. Danach bis 0,8 s Schonfrist, solange der Kopf noch in einem Körper steckt |
  | Schere | Gegner verliert ein Drittel seiner Länge, das abgeschnittene Stück wird Futter |
  | Mauer | Kopie der eigenen Spur bleibt 4 s als Hindernis für den Gegner stehen |
  | Magnet | 4 s: Futter im Umkreis 0,5 fliegt mit 0,9 pro Sekunde zum Kopf |
  | Eis | alle Gegner 2,5 s mit 55 % Tempo und 60 % Drehrate |
  | Schild | fängt bis zu 8 s lang den nächsten Treffer an Körper oder Mauer ab, danach Schonfrist wie beim Geist. Nicht gegen Wand, Hindernis, Bombe, Kopf an Kopf |
  | Bombe | liegt an der Joker-Stelle, zündet nach 1,5 s. Gegner-Köpfe im Umkreis 0,2 sind raus, der Besitzer nicht |

  Schere und Eis wirken bei mehreren Gegnern auf alle.

- **Arenen** (`ARENAS`, gewählt als `sd_arena`, gilt für alle Spielarten):

  | Arena | Inhalt |
  | --- | --- |
  | `klassisch` | leer |
  | `saeulen` | Mittelsäule (Radius 0,11) und vier Säulen (0,07) auf Radius 0,62. Fest wie die Wand, auch für Geister |
  | `karussell` | zwei Blöcke kreisen auf Radius 0,3 (0,5 rad/s), vier auf Radius 0,74 gegenläufig (0,32 rad/s) |
  | `portale` | zwei Portal-Paare (Radius 0,055) auf Radius 0,73. Austritt hinter dem Partner in Fahrtrichtung. Offen nur, solange die Arena groß genug ist (ab etwa Sekunde 47 zu) |

  Futter und Joker erscheinen nicht in Hindernissen oder Portalen (`freeSpot`). Die Spur hat nach einem Portal eine
  Lücke: Zeichnen und Längen-Abgleich behandeln Abstände über 0,12 (`JUMP`) als Sprung.

- **Spielarten** (`MODES`):

  | Spielart | Würmer | Dauer | Besonderheit |
  | --- | --- | --- | --- |
  | `duell` | 2 | 60 s | wie oben, auch online und zu zweit |
  | `ueberleben` | 4 | 60 s | du gegen drei Bots (Stufe − 1), alle gegen alle, 10 Futter |
  | `futter` | 2 | 45 s | keine schrumpfende Arena, 14 Futter, 999 Leben: Treffer kosten nur Länge |
  | `boss` | 2 | 60 s | Wurm 1 ist der Boss (`BOSS`): 1,5-fach dick, Länge 1,2, Tempo 85 %, Drehrate 75 %, 3 Leben, Bot-Stufe + 1. Der Spieler hat 2 Leben |

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
- **Gemessen** (`tests/sim.test.js`, Bot gegen Bot, entschiedene Runden, je 200 Runden pro Startseite, acht Joker): Stufe 10 schlägt Stufe 1 in 89 %,
  Stufe 5 schlägt Stufe 1 in 80 %, Stufe 10 schlägt Stufe 5 in 56 % (vorher 91 / 80 / 64 %). Mehr Joker heißt mehr
  Glück, vor allem Schild und Bombe gleichen aus. Mittlere Rundendauer: 14 s, 32 s, 52 s.
- Arenen, Stufe 5 gegen 5: Säulen 25 s, Karussell 27 s, Portale 42 s im Mittel, Startseiten fair.
- Spielarten, ein Bot spielt den Menschen (Rundensiege): Bosswurm 43 % (Stufe 1), 35 % (5), 28 % (10).
  Überleben 29 bis 38 % (Zufall wäre 25 %). Futterjagd etwa 50 %.
- Der Bot sucht bei mehreren Gegnern den nächsten als Ziel, weicht aber allen Körpern aus. In der Vorschau kennt er
  Hindernisse zur jeweiligen Zeit, springt durch Portale, meidet gegnerische Bomben kurz vor dem Knall und rechnet
  das Ende von Eis mit ein.
- Nur das Duell gegen den Computer ändert die Stufe: Sieg ⇒ Stufe +1, gespeichert als `sd_level`. Siege gesamt in `sd_wins`.

## Gespeicherte Daten (localStorage, Präfix `sd_`)

| Schlüssel | Inhalt |
| --- | --- |
| `sd_level`, `sd_wins` | Stufe gegen den Computer, Siege gesamt |
| `sd_steer`, `sd_skin`, `sd_vib` | Lenkart, gewähltes Design, Vibration an/aus |
| `sd_stars` | Sterne (Belohnung aus Aufgaben und Erfolgen) |
| `sd_daily` | Heutige Aufgaben: Tag, drei Aufgaben-IDs, Fortschritt, erledigt, Bonus |
| `sd_stats` | Zähler fürs Leben: Futter, Joker, Rundensiege, Duelle, Höchstlänge, Sieges-Serie usw. |
| `sd_streak` | Tages-Serie: aktuelle Länge, beste, letzter Tag |
| `sd_ach` | Erledigte Erfolge |
| `sd_owned` | Für Sterne freigeschaltete Designs |
| `sd_arena`, `sd_clip` | Gewählte Arena, Clip-Aufnahme an/aus |
| `sd_id` | Zufällige Kennung dieses Geräts (für die Bilanz gegen Freunde) |
| `sd_rivals` | Bilanz pro Freund: `{Kennung: {w, l, d, s}}`, `s` = aktuelle Serie (positiv Siege, negativ Niederlagen) |

Neue Schlüssel sind erlaubt, vorhandene nicht umbenennen: Sonst verliert der User seinen Fortschritt.

## Modus „Online gegen Freunde“

- **Verbinden:** Gastgeber erzeugt einen 4-stelligen Code. Der Gast tritt per Code oder Link `?join=CODE` bei.
  WebRTC-Datenkanal über `peerjs@1.5.5`, Vermittlung über den öffentlichen PeerJS-Dienst.
  Peer-ID des Gastgebers: `snakeduell-v2-<Code>`.
- **Wer rechnet:** Der Gastgeber ist Schlange 0 und lässt `Match` laufen. Der Gast ist Schlange 1.
  Online gibt es nur das Duell, aber in der Arena, die der Gastgeber gewählt hat.
- **Nachrichten** (JSON):

  | Art | Richtung | Inhalt |
  | --- | --- | --- |
  | `hello` | Gast → Gastgeber | nach dem Verbinden, mit `sk` = gewähltes Design, `id` = Gerätekennung |
  | `hi` | Gastgeber → Gast | nach dem Verbinden, `id` = Gerätekennung des Gastgebers |
  | `emo` | beide | Emote, `e` = Nummer in `EMOTES` (0 bis 5) |
  | `i` | Gast → Gastgeber | Eingabe: `a` Zielrichtung (rad oder `null`), `s` Sprint. Bei Änderung, sonst alle 100 ms |
  | `s` | Gastgeber → Gast | Spielstand, 30-mal pro Sekunde (alle 2 Ticks). Zahlen ×1000 gerundet |
  | `again` | Gast → Gastgeber | Revanche nach Duell-Ende |
  | `bye` | beide | Spiel verlassen |

- **Spielstand `s`:** Phase, Punkte, Runde, Zeit, Arena-Radius, Köpfe (Position, Richtung, Länge, Zustände als
  Bits: 1 lebt, 2 Geist, 4 Turbo, 8 Sprint, 16 Schild, 32 Eis, 64 Magnet), Futter, Joker, Bomben (`b`), Ereignisse.
  Die Arena (`ar`) kommt in vollen Spielständen; Hindernisse und Portale rechnet der Gast aus Arena und Zeit selbst. Die Spuren baut der Gast aus den Kopf-Positionen selbst mit (`applySnap`,
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
| `Sim` | Eine Runde: `step()` rechnet einen Zeitschritt. Eingaben über `snakes[i].target` und `.sprint`. Ereignisse in `events` (`eat`, `spawn`, `power`, `clash`, `die`, `hurt`, `warp`, `boom`, `shield`) |
| `MODES`, `ARENAS`, `BOSS`, `blockGap`, `blockList`, `portalExit` | Spielarten, Arenen und ihre Geometrie (Hindernisse hängen von der Zeit ab) |
| `Bot` | `think(sim, i)` liefert `{a, s}`; `roll()` ist die Vorschau |
| `Match` | `Match(seed, bots, { mode, arena })`: Runden, Punkte (eine Zahl pro Wurm), Phasen `count → play → end → over`; `tick()` |
| `hostView` / `guestView` | Bauen die Ansicht für `render()`: lokal aus `Match`, beim Gast aus dem Netz |
| `buildSnap` / `applySnap` | Spielstand senden und empfangen |
| `makeTransport(code, rolle)` | Verbindung: PeerJS oder Test-Kanal, gleiche Schnittstelle |
| `render()` und `draw…` | Canvas 720 × 1280: Arena, Würmer (`drawSnake`, `drawHead`, `segPositions`, `disc`), Futter, Joker, Anzeige, Banner |
| `SKINS`, `skinOf(i)`, `otherSkin()` | Wurm-Designs: Farbpalette je Glied, Freischalt-Stufe, Ausweichen bei gleichem Design |
| `fx(e)` | Ereignisse ⇒ Töne (WebAudio), Funken, Hinweise, Vibration (`vib`), Zeitlupe (`app.slow`), Zählen für Aufgaben (`bump`) |
| `TASKS`, `ACHS`, `bump()`, `checkGoals()`, `trackFrame()` | Tagesaufgaben, Erfolge, Sterne (siehe „Aufgaben, Erfolge, Sterne“) |
| `notify()` / `showToast()` | Hinweise oben: `notify` reiht wichtige Hinweise nacheinander, `showToast` ist für Joker-Meldungen |
| `startSolo(kind)` / `startDuo` / `hostGame` / `joinGame` / `startNetMatch` / `showEnd` / `toMenu` | Spielablauf. `app.mode` = menu, lobby, solo, host, guest, duo; `app.kind` = Spielart |
| Steuerung | Zwei Lenkarten (`state.steer`, gespeichert als `sd_steer`): „Kreis“ = schwebender Joystick, „Zum Finger“ = `aimAtFinger(p)`. Dazu Sprint-Knopf und Tastatur. Zwei Spieler: `joy2`, `input2`, `sprintBtn2`, Pfad über `padJoy(p)` / `padInput(p)` |
| `drawArenaFeatures`, `drawBombs`, `drawEmotes` | Hindernisse, Portale, Bomben mit Warnkreis, Emotes über dem Kopf |
| `clip…` | Clip-Aufnahme (`MediaRecorder` auf `cv.captureStream`, Ton über `audio.dest`), `saveClip()` teilt oder lädt herunter |
| `myId`, `rivals`, `rivalGreeting` | Bilanz gegen Freunde |
| `window.SD` | Zugriff für Tests: `app`, `state`, `input`, `input2`, `Sim`, `Bot`, `Match`, `SKINS`, `ARENAS`, `clip`, `rivals`, `startSolo`, `startDuo`, `goals` |

Im Menü läuft im Hintergrund ein Demo-Duell Bot gegen Bot.

**Aussehen der Würmer** (nur Darstellung, die Simulation weiß nichts davon):
- Der Körper wird aus Gliedern gestempelt: `disc(farbe)` zeichnet ein Glied einmal vor (28 px, Glanzlicht, Rand),
  `segPositions()` verteilt die Glieder gleichmäßig vom Kopf aus entlang der Spur. Das Muster hängt am Kopf
  (Glied-Nummer `k`), damit es mit dem Wurm mitwandert.
- Sichtbare Dicke = Kollisionsgröße × 1,13 (gezeichneter Kopf × 1,32, Bild-Kopf × 1,8 = `IMG_HEAD_SCALE`).
  Der Bild-Kopf wurde auf Wunsch des Users „nur minimal“ von 1,6 auf 1,8 vergrößert. Nicht ohne Rückfrage weiter
  vergrößern, sonst sehen knappe Vorbeifahrten nach Treffern aus.
- Gesicht: Pupillen folgen der Lenkung, Blinzeln, offener Mund bei nahem Futter, X-Augen nach dem Ausscheiden.
- Effekte: Futter-Beule (`app.bulges`), Funken bei Sprint, Flammen bei Turbo, heller Umriss als Geist, beim
  Ausscheiden zerfällt der Körper in Glieder (Partikel mit `img`).
- Designs: `SKINS` (Minze, Bonbon, Tiger frei; Eis ab Stufe 3, Lava ab 5, Regenbogen ab 8; Zebra 5 ⭐, Gold 12 ⭐,
  Galaxie 25 ⭐), gespeichert als `sd_skin`. `skinFree(k)` prüft Stufe und, bei Sterne-Designs, `owned`. `app.skins[i]` gilt pro Schlange. Online schickt der Gast sein Design in `hello` (`sk`), der
  Gastgeber das Paar in vollen Spielständen (`sk`). Beides sind freiwillige Felder, alte Versionen ignorieren sie.
- **Bild-Designs:** `loadImageSkins()` liest beim Start `skins/liste.json`, hängt die Designs hinter die
  eingebauten an `SKINS` an und verkleinert die Bilder einmal auf Stempel (`stamp()`: Kopf 64 px, Glied 28 px,
  Schwanz 40 px). Hat ein Design `skin.img`, stempelt `drawSnake` das Glied-Bild ungedreht, dreht Kopf und
  Schwanzspitze und lässt das gezeichnete Gesicht weg. Lädt ein Pflichtbild nicht, bleibt `skin.img = null` und
  das Design nutzt die eingebaute Darstellung in seiner Hauptfarbe. `sw.js` holt `skins/` zuerst aus dem Netz,
  damit neu hochgeladene Bilder sofort erscheinen. Der User pflegt `liste.json` selbst auf GitHub: Einträge
  werden deshalb streng geprüft (Ordnername, Farbcode) und fehlerhafte übersprungen.
- `"seitlich": true` in `liste.json` (`skin.side`) kennzeichnet Köpfe in Seitenansicht: `drawHead` spiegelt sie
  beim Linksfahren, damit sie nie auf dem Kopf stehen.
- Vorhandene Bild-Designs: `beispiel` („Vorlage“, selbst gezeichnet, mit SVG-Quellen) und `drache`
  („Smaragddrache“): Kopf und Glied vom User mit kie.ai erzeugt, von Claude freigestellt (das Schachbrettmuster
  war eingebrannt), Kopf auf den Kopf zugeschnitten, Loch im Ring gefüllt. Alle drei Bilder (Kopf, Glied,
  Schwanzspitze) stammen vom User.
- Acht weitere Bild-Designs, von Claude als SVG selbst gezeichnet (Quellen liegen als `.svg` im jeweiligen
  Ordner): `raupe`, `donut`, `roboter` (frei), `biene` (Stufe 2), `eiskristall` (4), `neon` (6), `lavawurm` (7),
  `einhorn` (9). Sie sind schlichter als KI-Bilder. `skins/PROMPTS.md` enthält pro Design fertige kie.ai-Prompts,
  mit denen der User sie ersetzen kann. Schickt er Bilder im Chat: freistellen (Schachbrett ist oft eingebrannt),
  zuschneiden, im Spiel ansehen, dann die drei PNG im Ordner ersetzen.
- **Auswahl-Übersicht:** Der Knopf „Wurm: …“ öffnet das Panel `skinPanel`. `buildSkinGrid()` baut pro Design eine
  Kachel mit Vorschau (`drawSkinPreview`), Name und Schloss. Freie Designs werden gewählt und gespeichert,
  gesperrte nur als Vorschau am Demo-Wurm gezeigt (`app.preview`). Sterne-Designs zeigen „⭐ N“: erstes Tippen
  zeigt den Preis, zweites Tippen kauft (Sterne werden abgezogen, `owned[id] = true`). `liste.json` versteht
  dafür das freiwillige Feld `"sterne"`.
- Schwanzspitze (`stampTail`): wird auf den sichtbaren Teil zugeschnitten. Im Spiel ist das breite Ende so dick
  wie der Körper, und die Spitze ersetzt die letzten Glieder, ragt also nicht über das echte Körperende hinaus.
  Mit Bild-Spitze werden die Glieder zum Ende hin nicht mehr kleiner.
- Nur selbst erzeugte Bilder ins Repo, keine Figuren aus bestehenden Spielen, Filmen oder Serien.
- Gemessen im simulierten Handy ohne Grafikkarte: zwei Würmer mit Höchstlänge kosten etwa 6 ms pro Bild, bei
  üblicher Länge etwa ein Drittel. Auf echten Handys noch nicht gemessen.

**Effekte („Wumms“)** (nur Darstellung):
- Vibration über `vib()` → `navigator.vibrate`: Joker (kurz), eigener Crash (kräftig), Duell-Sieg (Muster).
  Schalter im Regeln-Panel (`sd_vib`). iPhones unterstützen Vibration im Browser nicht, dort passiert nichts.
- Crash: `app.slow` lässt Funken und Glieder 0,8 s mit 30 % Tempo laufen, `render` zoomt bis 1,2-fach auf die
  Unfallstelle und wackelt 0,2 s (`app.shakeUntil`). Das Runden-Banner erscheint erst danach.
- Rundensieg: Sternenregen (Partikel mit `star`). Duell-Sieg: `confetti()` (Partikel mit `conf` und Schwerkraft
  `g`) und Fanfare. Countdown-Töne bei 3, 2, 1 und Start.
- Im Demo-Duell des Menüs gibt es keine dieser Effekte und keine Töne. Es läuft in der gewählten Arena.
- Bei mehr als zwei Würmern gibt es Zeitlupe und Wackler nur beim eigenen Crash.
- Schild = schimmernde Blase, Eis = hellblauer, gestrichelter Körper, Magnet = gestrichelter Kreis, Boss = Krone,
  Herzen in der Anzeige. Bombe: 💣 mit rotem Warnkreis, der immer schneller pulsiert.

**Emotes, Bilanz, Clips:**
- Emotes (`EMOTES`): 😀-Knopf oben links öffnet eine Leiste, höchstens eins alle 0,7 s. Online geht es an den Freund
  (`emo`), gegen den Computer antwortet der manchmal, und nach seinem Rundensieg jubelt er gelegentlich. Nicht im
  Modus „Zwei Spieler“.
- Bilanz: Nach jedem Online-Duell `rivals[Kennung]` nachführen und im Ergebnis zeigen, Begrüßung per Toast.
- Clips: Während `play` laufen höchstens zwei versetzte Aufnahmen (alle 8 s eine neue, jede höchstens 16,5 s).
  1,4 s nach Rundenende wird die älteste behalten (`clip.blob`), die anderen verworfen. Nach dem Duell zeigt der
  Ergebnis-Bildschirm „🎬 Clip speichern“: `navigator.share` mit Datei, sonst Download. Format: MP4, wenn der Browser
  es kann, sonst WebM. Unten im Bild steht „WORM ATTACK“. Abschaltbar im Regeln-Panel (`sd_clip`).
- Gemessen im simulierten Handy (ohne Grafikkarte): vier Würmer der Länge 2 in der Karussell-Arena kosten etwa 10 ms
  Zeichnen pro Bild, mit laufender Aufnahme trotzdem 60 Bilder pro Sekunde (95 % der Bilder unter 22 ms).

**Aufgaben, Erfolge, Sterne:**
- `TASKS`: acht mögliche Tagesaufgaben. `ensureDaily()` wählt pro Tag drei, berechnet aus dem Datum (am selben
  Tag immer dieselben). Jede gibt 1 ⭐, alle drei zusammen 2 ⭐ extra. `streak` zählt Tage in Folge mit mindestens
  einer geschafften Aufgabe.
- `ACHS`: 15 dauerhafte Erfolge mit 2 bis 5 ⭐. Ihre Werte kommen aus `stats`, `state.level` und `streak`.
  `joker4` heißt aus Kompatibilität noch so, verlangt aber alle 8 Joker. Neu: `boss`, `ueberleben`, `futter`.
- Im Modus „Zwei Spieler“ zählt nichts (`bump` bricht ab).
- Gezählt wird **nur in echten Partien** (`inGame()`), nie im Demo-Duell: `fx` zählt Futter, Joker und „Gegner
  fuhr in meinen Körper“; `trackFrame` zählt pro Bild Länge, Überlebenszeit und Sprint-Nutzung und erkennt
  Rundensiege am Phasenwechsel; `showEnd` zählt Duell-Siege und die Sieges-Serie.
- `bump(key, n, isMax)` erhöht Statistik und heutige Aufgabe, `checkGoals()` vergibt Sterne und meldet per
  `notify`. Gespeichert wird bei Abschlüssen, am Duell-Ende und beim Wechsel ins Menü (`saveGoals`).
- Sterne kann man nur für Designs ausgeben. Insgesamt gibt es 50 ⭐ aus Erfolgen plus bis zu 5 ⭐ pro Tag; die
  drei Sterne-Designs kosten zusammen 42 ⭐.
- Test-Schalter: `?tag=2026-03-10` setzt das Datum für die Tagesaufgaben fest.

**Steuerung – diese Regeln nicht aufweichen** (Rückmeldung vom echten Handy: der Kreis blieb an alter Stelle hängen):
- Der **zuletzt aufgesetzte Finger lenkt immer**. Jedes `pointerdown` auf dem Spielfeld setzt `joy` neu.
- Es gibt **keinen** „zweiter Finger = Sprint“ mehr. Sprint über den ⚡-Knopf, die Leertaste oder
  **Doppeltipp und halten** (auf Wunsch des Users): zwei Tipps innerhalb von 300 ms und 50 px (`DTAP_MS`,
  `DTAP_PX`), beim zweiten bleibt der Finger liegen. Der Sprint hängt am lenkenden Finger (`joy.sprint`) und
  endet mit ihm, kann also nicht hängen bleiben.
- Loslassen wird am Canvas und am Fenster abgefangen (`pointerup`, `pointercancel`, `lostpointercapture`),
  dazu `blur` und `visibilitychange`.
- Kreis: wandert ab 45 px Abstand mit (`JOY_R`), Lenkung reagiert ab 8 px (`JOY_DEAD`).
- `tests/ui.test.js` stellt ein verlorenes Loslassen nach und prüft beide Lenkarten.

## Aufgaben

Der User entscheidet, was als Nächstes kommt. Frag ihn, wenn er nichts vorgibt. Die Übergabe (`UEBERGABE.md`)
enthält die vollständige Ideenliste mit Empfehlung.

### Erledigt
- Repo eingerichtet, GitHub Pages läuft, Spiel ist installierbar.
- Steuerung: neuester Finger lenkt, zwei Lenkarten, Sprint per Knopf und per Doppeltipp.
- Aussehen: Glieder-Würmer mit Gesicht, 19 Designs (9 eingebaut, 10 mit Bildern), Auswahl-Übersicht,
  Bild-Designs aus `skins/` samt Anleitung und Prompts.
- Effekte: Vibration, Zeitlupe, Konfetti. Tagesaufgaben, Erfolge, Sterne, Sterne-Designs.
- Ideen 3 bis 8 (19.11.2026): Joker Magnet, Eis, Schild, Bombe; Arenen Säulen, Karussell, Portale; Spielarten
  Überleben, Futterjagd, Bosswurm; zwei Spieler an einem Handy; Online-Emotes und Bilanz gegen Freunde; Clips.

### Offen: Rückmeldung vom echten Handy einholen
- Bleibt der Steuerkreis noch irgendwo hängen? Welche Lenkart fühlt sich besser an?
- Löst der Doppeltipp-Sprint in der Lenkart „Zum Finger“ versehentlich aus? Wenn ja: `DTAP_MS` kürzen.
- Ist Stufe 1 zu leicht oder zu schwer? Ruckelt es bei langen Würmern?
- Klappt Online zwischen zwei Handys (gleiches WLAN, und WLAN gegen mobile Daten)? Stört die Verzögerung beim Gast?
- Fühlen sich Vibration (nur Android) und Zeitlupe gut an oder stören sie?
- Neue Joker, Arenen, Spielarten: Macht es Spaß? Ist der Boss zu schwer? Klappen zwei Spieler an einem Handy?
- Clip: Lässt er sich auf dem iPhone speichern und teilen? Ruckelt das Spiel während der Aufnahme?

### Schwierigkeit für Menschen einstellen (nach Rückmeldung)
- Ziel: Stufe 1 gewinnt ein Neuling meistens, ab Stufe 5 wird es fordernd.
- Stellschrauben im `Bot`: Vorschau, Reaktion, Fehlerquote, ab welcher Stufe abgeschnitten wird.
- **Fertig, wenn:** Der User ist mit Stufe 1 bis 3 zufrieden, `sim.test.js` ist grün und die Messwerte oben in
  dieser Datei sind aktualisiert.

### Online verbessern (nach Rückmeldung)
- Hinweis beim Gast „Warte auf Gastgeber …“, wenn länger als 1,5 s kein Spielstand kommt. Beim Gastgeber
  `visibilitychange` nutzen und dem Gast eine Pause melden.
- Lenkung des Gastes direkter machen: eigene Schlange auf dem Gast-Handy sofort drehen und beim nächsten
  Spielstand abgleichen. Vorher mit dem User klären, ob die Verzögerung überhaupt stört.
- TURN-Server nur, wenn es dauerhaft kostenlos geht und der User zustimmt. Keine Zugangsdaten ins Repo.
- **Fertig, wenn:** `online.test.js local` und `peer` grün, ein Test für die Pause ergänzt.

### Ideen, die der User noch nicht gewählt hat
Siehe `UEBERGABE.md`. Neue Joker, Arenen und Modi ändern die Simulation: Dann `sim.test.js` erweitern,
Balance-Zahlen vorher und nachher vergleichen und bei Online-Wirkung das Protokoll prüfen.

### Nur auf ausdrückliche Anweisung
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
- Kleine, klare Commits auf Deutsch. Nach grünen Tests auf `main` pushen und danach prüfen, dass GitHub Pages
  die neue Version ausliefert: `curl -s https://almaz6380.github.io/Worm-Attack/sw.js | grep VERSION` muss die
  neue Nummer zeigen (dauert 1 bis 2 Minuten).
- `tests/ui.test.js` läuft in Echtzeit gegen einen Zufalls-Gegner. Prüfungen dürfen nicht davon abhängen, dass
  die Runde gerade läuft oder dass Wartezeiten genau eingehalten werden. Bei einem roten Test erst mehrfach
  laufen lassen und die Ursache klären, bevor Code geändert wird.
- Nach jeder größeren Änderung `UEBERGABE.md` nachführen.
- Nach jeder Aufgabe dem User kurz sagen, was sich geändert hat und wie man es ausprobiert. Ehrlich benennen,
  was nur simuliert und was auf echten Handys getestet wurde.
