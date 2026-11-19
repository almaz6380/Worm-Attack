# Übergabe – Worm Attack

Stand: 19. November 2026. Dieses Dokument fasst alles zusammen, was man braucht, um in einer neuen Sitzung
sauber weiterzuarbeiten. Die technischen Einzelheiten stehen in [`CLAUDE.md`](CLAUDE.md), die Spielregeln für
Menschen in [`README.md`](README.md).

## Das Wichtigste in Kürze

- **Was:** Worm Attack ist ein Schlangen-Duell 1 gegen 1 fürs Handy. Man spielt gegen den Computer oder online
  gegen Freunde.
- **Wo:** `https://almaz6380.github.io/Worm-Attack/` (GitHub Pages liefert den Branch `main` aus).
- **Repo:** `almaz6380/Worm-Attack`, öffentlich. Alles liegt auf `main`.
- **Kosten:** keine. Keine API-Keys, kein eigener Server.
- **Stand:** spielbar und online. Alle automatischen Tests sind grün.

## So startest du eine neue Sitzung

1. Eine neue Claude-Code-Sitzung mit dem Repo `almaz6380/Worm-Attack` öffnen.
2. Claude liest `CLAUDE.md` automatisch. Schreib als ersten Satz zum Beispiel:
   > „Lies UEBERGABE.md und lass die Tests laufen. Danach möchte ich …“
3. Sag, was du willst. Ideen stehen unten unter „Was als Nächstes möglich ist“.

Bilder für neue Wurm-Designs kannst du einfach in den Chat schicken.

## So benutzt du das Spiel auf dem Handy

- **iPhone:** Adresse in Safari öffnen → Teilen-Symbol → „Zum Home-Bildschirm“.
- **Android:** Adresse in Chrome öffnen → drei Punkte → „App installieren“.
- Updates kommen beim nächsten Start mit Internet. Wenn noch die alte Version erscheint: App ganz schließen und
  neu öffnen.

## Was das Spiel kann

| Bereich | Stand |
| --- | --- |
| Duell | Zwei Würmer in runder Arena, wer zuerst 3 Runden gewinnt. Futter, Sprint, vier Joker (Turbo, Geist, Schere, Mauer), Sudden Death ab Sekunde 40 |
| Gegen Computer | 10 Stufen, jeder Sieg schaltet die nächste frei |
| Online | Freund per 4-stelligem Code oder Link einladen, direkte Verbindung zwischen den Handys |
| Steuerung | Zwei Lenkarten im Menü: „Kreis“ (ziehen) und „Zum Finger“. Sprint per ⚡-Knopf oder Doppeltipp und Halten |
| Würmer | Glieder mit Glanzlicht, Gesicht, Effekte. 19 Designs, Auswahl über eine Übersicht mit Vorschau |
| Eigene Designs | Bilder im Ordner `skins/`, Anleitung und fertige Prompts für kie.ai liegen dabei |
| Aufgaben | Drei Tagesaufgaben pro Tag, zwölf Erfolge, Sterne als Belohnung, drei Designs nur für Sterne |
| Effekte | Zeitlupe und Zoom beim Crash, Konfetti beim Sieg, Vibration (nur Android) |
| Web-App | Installierbar, gegen den Computer auch ohne Internet spielbar |

## Was in welcher Reihenfolge entstanden ist

1. **Grundspiel** mit Computer-Gegner und Online-Modus, umgezogen aus dem Repo `brainstorm`.
2. **Steuerung umgebaut** nach deiner Rückmeldung vom Handy: Der Kreis sitzt immer am zuletzt aufgesetzten
   Finger. Dazu die zweite Lenkart „Zum Finger“.
3. **Schönere Würmer:** Glieder statt Linie, Gesicht, sechs eingebaute Designs.
4. **Bild-Designs:** Das Spiel lädt Würmer aus Bildern. Anleitung für kie.ai.
5. **Smaragddrache** aus deinen drei KI-Bildern. Sie hatten ein eingebranntes Schachbrett, das Claude
   freigestellt hat. Köpfe in Seitenansicht werden beim Linksfahren gespiegelt.
6. **Bild-Köpfe minimal größer** (auf deinen Wunsch).
7. **Acht weitere Designs** (von Claude gezeichnet), Auswahl-Übersicht, Prompts für alle Designs.
8. **Sprint per Doppeltipp.**
9. **Effekte, Tagesaufgaben, Erfolge, Sterne-Designs.**

## Deine Rückmeldungen bisher

| Was du gesagt hast | Was daraus wurde |
| --- | --- |
| Der Steuerkreis bleibt an der alten Stelle | Steuerung umgebaut. **Deine Bestätigung vom Handy fehlt noch.** |
| „Ich will schönere Würmer“ | Neue Darstellung und Designs |
| Köpfe größer, „aber nur minimal“ | Bild-Köpfe 12 % größer |
| „Nicht schlecht“, Sprint auch per Doppelklick | Doppeltipp und Halten eingebaut |
| Ideen 1 und 2 umsetzen | Effekte, Aufgaben und Erfolge eingebaut |

## Was noch niemand auf einem echten Handy geprüft hat

Alles Folgende lief bisher nur im simulierten Handy-Browser auf einem Rechner. Bitte ausprobieren und
zurückmelden:

- **Steuerung:** Bleibt der Kreis noch irgendwo hängen? Welche Lenkart ist besser?
- **Doppeltipp-Sprint:** Löst er in der Lenkart „Zum Finger“ versehentlich aus?
- **Schwierigkeit:** Ist Stufe 1 zu leicht oder zu schwer? Ab welcher Stufe wird es zäh?
- **Flüssigkeit:** Ruckelt es bei langen Würmern?
- **Online:** Klappt die Verbindung zwischen zwei Handys, im selben WLAN und mit WLAN gegen mobile Daten?
  Stört die Verzögerung beim eingeladenen Spieler?
- **Effekte:** Fühlen sich Zeitlupe und Vibration gut an? Vibration gibt es nur auf Android.
- **Aufgaben:** Sind sie zu leicht, zu schwer, motivierend?

## Bekannte Grenzen

- **Online klappt nicht in jedem Netz.** Die Handys verbinden sich direkt. In Firmen-WLANs oder manchen
  Mobilfunknetzen kommt keine Verbindung zustande. Der Vermittlungsdienst ist kostenlos und ohne Garantie.
- **Gastgeber muss die Seite offen lassen.** Wechselt er die App, steht das Spiel für beide.
- **iPhones vibrieren nicht.** Safari unterstützt Vibration im Browser nicht.
- **Details in Würmern sind klein.** Ein Glied ist auf dem Handy etwa 16 Pixel groß. Klare Formen und kräftige
  Farben wirken, feine Muster verschwinden.
- **Fortschritt liegt nur auf dem Gerät.** Stufe, Sterne und Designs sind im Browser gespeichert. Wer die
  Browserdaten löscht oder das Handy wechselt, fängt neu an.

## Was als Nächstes möglich ist

Aus der Ideenliste sind Nummer 1 (Effekte) und 2 (Aufgaben und Erfolge) umgesetzt. Offen sind:

| Nr. | Idee | Aufwand | Hinweis |
| --- | --- | --- | --- |
| 3 | Neue Joker: Magnet, Eis, Schild, Bombe | mittel | Ändert die Spielregeln, braucht neue Balance-Tests |
| 4 | Neue Arenen: Hindernisse, Portale, wandernde Mauern | mittel bis groß | Der Computer-Gegner muss sie verstehen lernen |
| 5 | Neue Modi: Überleben gegen drei Computer-Würmer, Futterjagd, Bosswurm | groß | Das Spiel ist bisher fest auf zwei Würmer ausgelegt |
| 6 | Zwei Spieler an einem Handy | mittel | Braucht eine eigene Steuerung pro Seite |
| 7 | Online-Extras: Emotes, Siegesserie gegen denselben Freund | klein | |
| 8 | Clip der letzten Sekunden als Video speichern | mittel | Gut für TikTok-Werbung |

**Empfehlung von Claude:** Zuerst das Spiel auf dem echten Handy ausprobieren und die Punkte oben
zurückmelden. Danach Schwierigkeit und Online nach deiner Rückmeldung einstellen. Von den Ideen bringen
Nummer 3 (Joker) und Nummer 7 (Emotes) am meisten Spaß für den Aufwand.

Außerdem jederzeit möglich: weitere Wurm-Designs. Die acht von Claude gezeichneten sind schlicht. Mit den
Prompts in `skins/PROMPTS.md` kannst du sie durch KI-Bilder ersetzen.

## Wo was liegt

| Datei oder Ordner | Inhalt |
| --- | --- |
| `index.html` | Das ganze Spiel |
| `skins/` | Wurm-Bilder, `liste.json`, `ANLEITUNG.md`, `PROMPTS.md` |
| `tests/` | Automatische Tests: Simulation, Oberfläche, Online |
| `CLAUDE.md` | Arbeitsanweisung für Claude: Regeln, Aufbau, Zahlen |
| `README.md` | Spielregeln und Bedienung |
| `UEBERGABE.md` | Dieses Dokument |

Im Repo `almaz6380/brainstorm` liegen außerdem ältere Entwürfe: Ball Battle (`index.html`, Starter-Paket in
`color-clash/`), FaceReact (`face-react/`) und eine alte Kopie von Worm Attack (`snake-duel/`), die nicht mehr
gepflegt wird.

## Wie Claude hier arbeitet

- Antworten auf Deutsch und ohne Fachbegriffe.
- Vor jedem Commit laufen alle Tests. Nach grünen Tests wird direkt auf `main` gepusht, damit du es sofort auf
  dem Handy siehst.
- Nach dem Push prüft Claude, dass die neue Version online ausgeliefert wird.
- Claude sagt ehrlich, was nur simuliert und was auf echten Handys geprüft wurde.
- Nach größeren Änderungen führt Claude dieses Dokument nach.
