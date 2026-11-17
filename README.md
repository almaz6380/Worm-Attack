# Worm Attack

Schlangen-Duell 1 gegen 1 fürs Handy: **gegen den Computer** oder **online gegen Freunde**. Die Schlangen bewegen
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

## Steuerung
Im Menü gibt es zwei Lenkarten zur Auswahl:
- **Kreis:** Finger irgendwo aufsetzen und ziehen. Die Zugrichtung ist die Fahrtrichtung. Der Kreis erscheint
  immer dort, wo man gerade hingreift, und wandert mit dem Finger mit.
- **Zum Finger:** Der Wurm fährt auf die Stelle zu, die man berührt.

Dazu:
- **Sprint:** ⚡-Knopf halten.
- **Am Computer:** Pfeiltasten oder WASD, Leertaste für Sprint.

## Modi
- **Gegen Computer:** Jeder Sieg schaltet die nächste Stufe frei. Mit jeder Stufe schaut der Computer weiter voraus,
  reagiert schneller, macht weniger Fehler und greift ab Stufe 5 aktiv an. Ab Stufe 10 wird er nicht mehr stärker.
- **Online gegen Freunde:**
  1. „Freund einladen“ tippen. Du bekommst einen 4-stelligen Code und einen Einladungslink.
  2. Dein Freund öffnet den Link oder gibt den Code im Menü ein.
  3. Das Duell startet automatisch. Nach dem Ende kann jeder eine Revanche starten.

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
- **Simulation** (`Sim`): fester Zeitschritt 1/60 s und Seed-Zufall, dadurch wiederholbar. Schlange = Kopf, Richtung
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
