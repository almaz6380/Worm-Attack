# Übergabe – Worm Attack

Stand: 19. November 2026. Dieses Dokument fasst alles zusammen, was man braucht, um in einer neuen Sitzung
sauber weiterzuarbeiten. Die technischen Einzelheiten stehen in [`CLAUDE.md`](CLAUDE.md), die Spielregeln für
Menschen in [`README.md`](README.md).

## Das Wichtigste in Kürze

- **Was:** Worm Attack ist ein Schlangen-Duell fürs Handy. Man spielt gegen den Computer (vier Spielarten), online
  gegen Freunde oder zu zweit an einem Handy.
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
| Duell | Zwei Würmer in runder Arena, wer zuerst 3 Runden gewinnt. Futter, Sprint, acht Joker (Turbo, Geist, Schere, Mauer, Magnet, Eis, Schild, Bombe), Sudden Death ab Sekunde 40 |
| Arenen | Klassisch, Säulen, Karussell (kreisende Blöcke), Portale. Umschalten im Menü |
| Gegen Computer | 10 Stufen, jeder Duell-Sieg schaltet die nächste frei |
| Spielarten | Überleben (du gegen drei Computer), Futterjagd (45 s, niemand fliegt raus), vier Bosse zum Freischalten (Riese, Blitz, Zwillinge, Bomber; du hast zwei Leben), Zwei Spieler an einem Handy |
| Online | Freund per 4-stelligem Code oder Link einladen, direkte Verbindung zwischen den Handys. Spielart Duell, Futterjagd oder Überleben (mit zwei Computer-Würmern). Emotes, Bilanz gegen jeden Freund mit Sieges-Serie |
| Startbildschirm | Wippender Schriftzug mit kriechendem Wurm, Profilzeile (Stufe, Sterne, Siege), großer Spielen-Knopf, Kacheln für Wurm, Arena, Ziele, Regeln |
| Clips | Die letzten 8 bis 16 Sekunden jeder Runde werden mit Ton aufgenommen. Nach dem Duell speichern oder teilen (z. B. für TikTok) |
| Steuerung | Zwei Lenkarten im Menü: „Kreis“ (ziehen) und „Zum Finger“. Sprint per ⚡-Knopf oder Doppeltipp und Halten |
| Würmer | Glieder mit Glanzlicht, Gesicht, Effekte. 19 Designs, Auswahl über eine Übersicht mit Vorschau |
| Eigene Designs | Bilder im Ordner `skins/`, Anleitung und fertige Prompts für kie.ai liegen dabei |
| Aufgaben | Drei Tagesaufgaben pro Tag, 15 Erfolge, Sterne als Belohnung, drei Designs nur für Sterne |
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
15. **Store-Plan, Schritt 1 (Spielspaß):** Übungsrunde beim ersten Start, erstes Duell gegen einen Anfänger-Computer,
    Pause-Knopf, Musik mit Schaltern für Töne und Musik, tägliches Geschenk, drei neue Sterne-Designs.
14. **Alles fertig gemacht:** Turnier zu zweit an einem Handy (drei Arenen), Online-Pause mit Hinweis („… ist kurz
    weg“, „Warte auf Gastgeber …“), Boss zu zweit online (ihr beide gegen einen Boss).
13. **Namen und Rekorde:** Eigener Name unter „Online“, der Freund sieht ihn. Liste „Meine Gegner“ mit Bilanz
    gegen jeden Freund. Rekorde auf dem Handy (längster Wurm, schnellste Siege usw.) unter „Ziele“ → „Rekorde“.
12. **Vier Bosse:** Riese, Blitz (dünn und schnell), Zwillinge (zwei auf einmal), Bomber (legt Bomben). Einer nach
    dem anderen freischalten, neuer Erfolg „Alle vier Bosse besiegt“.
11. **Spielarten online und neuer Startbildschirm:** Futterjagd und Überleben (ihr zwei plus zwei Computer-Würmer)
    online. Neuer Schriftzug, großer Spielen-Knopf, aufgeräumtes Menü. Online-Version auf v3.
10. **Ideen 3 bis 8 auf einmal:** vier neue Joker, drei neue Arenen, drei neue Spielarten, zwei Spieler an einem
    Handy, Emotes und Bilanz für Online, Clips. Online-Version auf v2 hochgezählt.

## Deine Rückmeldungen bisher

| Was du gesagt hast | Was daraus wurde |
| --- | --- |
| Der Steuerkreis bleibt an der alten Stelle | Steuerung umgebaut. **Deine Bestätigung vom Handy fehlt noch.** |
| „Ich will schönere Würmer“ | Neue Darstellung und Designs |
| Köpfe größer, „aber nur minimal“ | Bild-Köpfe 12 % größer |
| „Nicht schlecht“, Sprint auch per Doppelklick | Doppeltipp und Halten eingebaut |
| Ideen 1 und 2 umsetzen | Effekte, Aufgaben und Erfolge eingebaut |
| „mach 3 bis 8“ | Joker, Arenen, Spielarten, zwei Spieler, Emotes und Bilanz, Clips eingebaut |
| „mach 9 … und mach einen besseren Startbildschirm“ | Spielarten online, neuer Startbildschirm |
| „mach 12“ | Vier Bosse mit Freischalten |
| „mach 10 und 11“ | Namen, Liste „Meine Gegner“, Rekorde |
| „mach einfach alles ganz fertig!!!!“ | Turnier zu zweit, Online-Pause, Boss zu zweit online |
| App beliebter machen und in die Stores bringen: Google Play und Apple, Englisch als Hauptsprache plus Deutsch (später alle Sprachen), später Käufe und Werbung | Plan in 6 Schritten (siehe unten), Schritt 1 umgesetzt |

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
- **Neue Joker:** Sind Bombe und Schild verständlich? Sieht man den roten Warnkreis rechtzeitig?
- **Arenen:** Machen Säulen, Karussell und Portale Spaß? Verwirren die Portale?
- **Spielarten:** Ist der Boss zu schwer oder zu leicht? Ist Überleben gegen drei zu chaotisch?
- **Zwei Spieler:** Kommt ihr euch mit den Fingern in die Quere? Stört, dass die Schrift für den oberen Spieler auf
  dem Kopf steht?
- **Erster Start:** Ist die Übungsrunde verständlich? Ist das erste Duell gegen den Anfänger zu leicht oder zu schwer?
- **Musik:** Gefällt sie dir, oder nervt sie nach einer Weile? (Abschaltbar unter „Regeln“ und in der Pause.)
- **Startbildschirm:** Gefällt er dir? Findest du alles (Lenkart steht jetzt unter „Regeln“)?
- **Online-Überleben:** Klappt es zu zweit gegen die Computer-Würmer?
- **Namen und Rekorde:** Taucht dein Name beim Freund auf? Motivieren dich die Rekorde?
- **Turnier zu zweit:** Macht es Spaß, drei Arenen nacheinander zu spielen?
- **Boss zu zweit online:** Ist es zu leicht oder zu schwer? Stört die Pause beim App-Wechsel?
- **Bosse:** Ist die Reihenfolge Riese → Blitz → Zwillinge → Bomber richtig schwer? Ist Blitz zu fies?
- **Clips:** Lässt sich der Clip auf dem iPhone speichern und teilen? Ruckelt das Spiel während der Aufnahme? Wenn
  ja, unter „Regeln“ die Clips ausschalten und mir Bescheid geben.

## Bekannte Grenzen

- **Online klappt nicht in jedem Netz.** Die Handys verbinden sich direkt. In Firmen-WLANs oder manchen
  Mobilfunknetzen kommt keine Verbindung zustande. Der Vermittlungsdienst ist kostenlos und ohne Garantie.
- **Gastgeber muss die Seite offen lassen.** Wechselt er die App, steht das Spiel für beide. Der Freund sieht dann
  „… ist kurz weg“. Verlässt der Gast die App, hält das Spiel an, bis er zurück ist.
- **Beide brauchen die neueste Version.** Alte und neue Version finden sich nicht. Wer noch die alte hat: App ganz
  schließen und mit Internet neu öffnen.
- **Online gibt es Duell, Futterjagd, Überleben und Boss zu zweit.** Die Boss-Reihe zum Freischalten gibt es nur allein. Gewinnt beim
  Überleben ein Computer-Wurm, zählt das nicht für die Bilanz zwischen euch.
- **Clips brauchen etwas Rechenkraft.** Im simulierten Handy lief es flüssig, auf alten Handys könnte es ruckeln.
  Der Clip bleibt auf dem Handy, nichts wird hochgeladen.
- **Mehr Glück im Spiel.** Mit acht Jokern gewinnt der stärkere Computer etwas seltener als vorher (Stufe 10 gegen
  Stufe 5: 56 % statt 64 % der Runden).
- **iPhones vibrieren nicht.** Safari unterstützt Vibration im Browser nicht.
- **Details in Würmern sind klein.** Ein Glied ist auf dem Handy etwa 16 Pixel groß. Klare Formen und kräftige
  Farben wirken, feine Muster verschwinden.
- **Fortschritt liegt nur auf dem Gerät.** Stufe, Sterne und Designs sind im Browser gespeichert. Wer die
  Browserdaten löscht oder das Handy wechselt, fängt neu an.

## Was als Nächstes möglich ist: der Weg in die App-Stores

Deine Entscheidungen: **Google Play und Apple**, **Englisch als Hauptsprache plus Deutsch** (später alle Sprachen),
**später Käufe und Werbung**.

| Schritt | Inhalt | Stand |
| --- | --- | --- |
| 1 | Spielspaß: Übungsrunde, Anfänger-Duell, Pause, Musik, tägliches Geschenk, neue Designs | ✅ erledigt, bitte auf dem Handy testen |
| 2 | Englisch als Hauptsprache, Deutsch dazu: alle Texte in eine Übersetzungsliste, Sprache automatisch nach Handy, Umschalter | offen |
| 3 | Store-Unterlagen: Name prüfen, App-Symbol 1024 px, Store-Bilder und -Texte (EN/DE), Datenschutzerklärung, Altersfreigabe | offen. **Du:** Kontakt-E-Mail, ob dein Name im Store stehen darf |
| 4 | Echte App mit Capacitor (Android und iPhone aus demselben Spiel), Vibration auch am iPhone, Bauen auf GitHub ohne eigenen Mac | offen |
| 5 | Veröffentlichen: Google (25 $ einmalig, 12 Tester 14 Tage geschlossener Test), Apple (99 $ pro Jahr, TestFlight, Prüfung) | offen. **Du:** Konten anlegen, Tester finden |
| 6 | Später: Käufe (Design-Pakete, „ohne Werbung“) und freiwillige Belohnungs-Videos; dafür Impressum, Einwilligung, größere Datenschutzerklärung, Altersgruppe ab 13 | wenn die App im Store läuft |

Weiterhin offen, weil es deine Rückmeldung braucht: Schwierigkeit für Menschen, direktere Lenkung des Gastes online,
TURN-Server für schwierige Netze (eigener Vermittlungsdienst kostet ein paar Euro im Monat).

**Empfehlung von Claude:** Jetzt Schritt 1 auf dem Handy ausprobieren (am besten mit gelöschten Website-Daten, dann
siehst du alles wie ein neuer Spieler), auch online mit einem Freund. Danach Schritt 2 (Englisch).

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
