# Worm Attack

Schlangen-Duell fürs Handy: **gegen den Computer**, **online gegen Freunde** oder **zu zweit an einem Handy**. Die Schlangen bewegen
sich frei und fließend, nicht im Raster. Kostenlos, ohne Anmeldung, ohne API-Keys und ohne eigenen Server.

Repo: `almaz6380/Worm-Attack`. Arbeitsanweisung für Claude Code: siehe `CLAUDE.md`.

## Regeln
- **Ziel:** Wer zuerst 3 Runden gewinnt, gewinnt das Duell.
- **Verloren** hat, wer mit dem Kopf die Wand, den Körper des Gegners oder sich selbst berührt.
- **Kopf an Kopf:** Die längere Schlange gewinnt. Gleich lang = unentschieden.
- **Futter** macht länger. Mit mehr Körper kann man dem Gegner den Weg abschneiden.
- **Sprint** macht schneller, kostet aber Länge. Die verlorenen Stücke bleiben als Futter liegen.
- **Sudden Death:** Ab Sekunde 40 schrumpft die Arena. Nach 60 Sekunden gewinnt die längere Schlange.

| Joker | Wirkung |
| --- | --- |
| ⚡ Turbo | 3 Sekunden Sprint ohne Längenverlust |
| 👻 Geist | 2 Sekunden durch Körper hindurchfahren (nicht durch die Wand) |
| ✂️ Schere | kürzt den Gegner um ein Drittel |
| 🧱 Mauer | die eigene Spur bleibt 4 Sekunden als Hindernis für den Gegner stehen |
| 🧲 Magnet | 4 Sekunden lang fliegt Futter in der Nähe zum eigenen Kopf |
| ❄️ Eis | der Gegner fährt 2,5 Sekunden langsam und lenkt träge |
| 🛡️ Schild | fängt den nächsten Zusammenstoß mit einem Körper oder einer Mauer ab (hält bis zu 8 Sekunden, nicht gegen Wand und Hindernisse) |
| 💣 Bombe | bleibt liegen und explodiert nach 1,5 Sekunden: Gegner im roten Kreis fliegen raus |

## Arenen
Im Menü über „Arena: …“ umschalten. Gilt für alle Spielarten, online wählt der Gastgeber.

| Arena | Besonderheit |
| --- | --- |
| Klassisch | freie runde Arena |
| Säulen | fünf feste Säulen, wie die Wand auch für Geister fest |
| Karussell | sechs Blöcke kreisen um die Mitte |
| Portale | zwei Portal-Paare: rein und beim gleichfarbigen wieder raus. In der schrumpfenden Arena schließen sie sich |

## Steuerung
Im Menü gibt es zwei Lenkarten zur Auswahl:
- **Kreis:** Finger irgendwo aufsetzen und ziehen. Die Zugrichtung ist die Fahrtrichtung. Der Kreis erscheint
  immer dort, wo man gerade hingreift, und wandert mit dem Finger mit.
- **Zum Finger:** Der Wurm fährt auf die Stelle zu, die man berührt.

Dazu:
- **Sprint:** ⚡-Knopf halten, oder auf dem Spielfeld doppelt tippen und den Finger liegen lassen. Der liegende
  Finger lenkt dabei weiter.
- **Am Computer:** Pfeiltasten oder WASD, Leertaste für Sprint. Zu zweit: Spieler 1 Pfeiltasten und Leertaste,
  Spieler 2 WASD und Umschalttaste.

## Wurm-Designs
Im Menü über den Knopf „Wurm: …“ wählbar. Die Designs ändern nur das Aussehen.

| Design | Frei ab |
| --- | --- |
| Minze, Bonbon, Tiger, Vorlage, Smaragddrache, Raupe, Donut, Roboter | sofort |
| Biene | Stufe 2 |
| Eis | Stufe 3 |
| Eiskristall | Stufe 4 |
| Lava | Stufe 5 |
| Neon | Stufe 6 |
| Lavawurm | Stufe 7 |
| Regenbogen | Stufe 8 |
| Einhorn | Stufe 9 |

Der Knopf „Wurm: …“ öffnet eine Übersicht mit einer kleinen Vorschau jedes Designs. Gesperrte Designs kann man
dort ansehen, aber erst ab ihrer Stufe wählen.

Wählen beide Spieler dasselbe Design, bekommt der Gegner automatisch ein anderes.

**Eigene Designs:** Im Ordner `skins/` kannst du eigene Würmer als Bilder ablegen (Kopf, Glied, Schwanzspitze),
zum Beispiel aus einer Bild-KI. Wie das geht, steht mit fertigen Prompts in [`skins/ANLEITUNG.md`](skins/ANLEITUNG.md).
Als Vorlage liegt `skins/beispiel/` bei, als fertiges Beispiel aus KI-Bildern der „Smaragddrache“ in `skins/drache/`.
Fertige Prompts für alle Bild-Designs stehen in [`skins/PROMPTS.md`](skins/PROMPTS.md).

## Aufgaben, Erfolge und Sterne
- **Tagesaufgaben:** Jeden Tag drei Aufgaben, zum Beispiel „Friss 25 Futter“ oder „Gewinne eine Runde ohne
  Sprint“. Jede gibt 1 ⭐, alle drei zusammen 2 ⭐ extra.
- **Erfolge:** 15 dauerhafte Ziele mit 2 bis 5 ⭐, zum Beispiel „10 Duelle gewonnen“ oder „Den Bosswurm besiegt“.
- **Tages-Serie:** Zählt die Tage in Folge, an denen du mindestens eine Aufgabe geschafft hast.
- **Sterne-Designs:** Zebra (5 ⭐), Gold (12 ⭐) und Galaxie (25 ⭐) gibt es nur für Sterne. In der Wurm-Auswahl
  zweimal antippen zum Freischalten.
- Gezählt wird in Partien gegen den Computer und online, nicht zu zweit an einem Handy. Der Knopf „⭐ Aufgaben“
  im Menü zeigt den Stand.

## Effekte
- Kurze Zeitlupe mit Zoom beim entscheidenden Crash, Sternenregen beim Rundensieg, Konfetti beim Duell-Sieg.
- Vibration bei Joker, Crash und Sieg. Abschaltbar unter „Regeln“. iPhones unterstützen Vibration im Browser
  nicht.

## Clips
Das Spiel nimmt während jeder Runde die letzten Sekunden auf (8 bis 16 Sekunden, mit Ton). Nach dem Duell speichert
oder teilt der Knopf „🎬 Clip speichern“ das Video der letzten Runde, zum Beispiel für TikTok. Unten im Bild steht
„WORM ATTACK“. Die Aufnahme bleibt auf dem Gerät und lässt sich unter „Regeln“ abschalten.

## Modi
- **Gegen Computer:** Jeder Sieg schaltet die nächste Stufe frei. Mit jeder Stufe schaut der Computer weiter voraus,
  reagiert schneller, macht weniger Fehler und greift ab Stufe 5 aktiv an. Ab Stufe 10 wird er nicht mehr stärker.
- **Online gegen Freunde:**
  1. „Freund einladen“ tippen. Du bekommst einen 4-stelligen Code und einen Einladungslink.
  2. Dein Freund öffnet den Link oder gibt den Code im Menü ein.
  3. Das Duell startet automatisch. Nach dem Ende kann jeder eine Revanche starten.
  4. Mit 😀 oben links schickt man Emotes (👋 😂 😎 😱 😡 👍). Nach jedem Duell steht die Bilanz gegen diesen Freund
     da, mit Sieges-Serie.
- **Spielarten** (Knopf „🎮 Spielarten“):
  - **Überleben:** du gegen drei Computer-Würmer, die sich auch gegenseitig jagen. Wer zuletzt übrig ist, gewinnt.
  - **Futterjagd:** 45 Sekunden, doppelt so viel Futter, die Arena schrumpft nicht. Wer anstößt, verliert ein
    Drittel seiner Länge und ist kurz ein Geist. Am Ende gewinnt der Längere.
  - **Bosswurm:** ein dicker, langer, etwas trägerer Boss mit drei Leben. Du hast zwei. Jeder Crash kostet ein Leben
    und ein Drittel der Länge.
  - **Zwei Spieler, ein Handy:** Handy flach hinlegen. Die untere Hälfte lenkt Spieler 1, die obere Spieler 2,
    jeder hat einen eigenen ⚡-Knopf.

## Grenzen im Online-Modus
- Die Handys verbinden sich direkt miteinander (WebRTC). In manchen Netzen, z. B. Firmen-WLAN oder manchen
  Mobilfunknetzen, kommt keine Verbindung zustande. Dann hilft meist ein anderes WLAN oder mobile Daten.
- Die Vermittlung beim Verbindungsaufbau läuft über den kostenlosen öffentlichen PeerJS-Dienst. Er gibt keine
  Garantie für Verfügbarkeit.
- Das Handy des Gastgebers berechnet das Spiel. Wechselt er die App oder sperrt den Bildschirm, steht das Spiel.
- Der Gast sieht seine Lenkung leicht verzögert, je nach Verbindung.
- Es gibt kein Matchmaking mit Fremden, nur Freunde per Code oder Link.

## Spielen und installieren
- Adresse: `https://almaz6380.github.io/Worm-Attack/`
- Einmalig einschalten: im Repo *Settings → Pages*, Branch `main`, Ordner `/ (root)`, speichern. Nach 1 bis 2
  Minuten ist das Spiel erreichbar. GitHub Pages ist für öffentliche Repos kostenlos und liefert HTTPS, das der
  Online-Modus und die Installation brauchen.
- Auf dem Handy öffnen und über *Teilen → Zum Home-Bildschirm* (iPhone) oder *App installieren* (Android) ablegen.

## Technik
- Eine Datei `index.html`, Canvas 2D, reines JavaScript. Dazu Manifest, Service-Worker und Icons (installierbar,
  gegen den Computer auch offline spielbar).
- **Simulation** (`Sim`): fester Zeitschritt 1/60 s und Seed-Zufall, dadurch wiederholbar. Beliebig viele Würmer
  (Duell 2, Überleben 4), Arenen mit Hindernissen und Portalen. Schlange = Kopf, Richtung
  und Spur aus Punkten. Kollision = Kopf gegen Spurpunkte.
- **Computer-Gegner** (`Bot`): probiert 7 Lenkrichtungen in einer kurzen Vorschau aus. Höhere Stufen prüfen
  zusätzlich, ob es danach noch einen Ausweg gibt, und rechnen den Weg des Gegners voraus.
- **Online:** Der Gastgeber rechnet. Der Gast schickt seine Lenkrichtung und bekommt 30-mal pro Sekunde den
  Spielstand. Die Spuren baut der Gast selbst mit, zweimal pro Sekunde kommt ein voller Abgleich.
  Bibliothek: `peerjs@1.5.5` über jsDelivr.

## Tests
```bash
node tests/sim.test.js                 # Determinismus, Rundenverlauf, Bot-Stufen (nur Node)
python3 -m http.server 8766 &          # App lokal starten
node tests/ui.test.js                  # Partie gegen den Computer im simulierten iPhone (Playwright)
node tests/online.test.js local        # Online-Duell mit zwei Fenstern, ohne Internet
node tests/online.test.js peer         # dasselbe über den echten PeerJS-Dienst
```
`?net=local` in der Adresse schaltet auf eine Testverbindung zwischen zwei Tabs desselben Browsers um.
