# Eigene Würmer gestalten

So bringst du eigene Wurm-Designs ins Spiel, zum Beispiel mit Bildern aus kie.ai. Du brauchst pro Design nur
zwei bis drei kleine Bilder und eine Zeile in `liste.json`.

## Was das Spiel braucht

Ein Wurm besteht aus einem **Kopf**, vielen gleichen **Gliedern** und einer **Schwanzspitze**. Alles ist von
oben gesehen. Pro Design legst du einen Ordner an, zum Beispiel `skins/drache/`:

| Datei | Pflicht | Was drauf ist |
| --- | --- | --- |
| `kopf.png` | ja | Der Kopf, **Blick nach rechts**, am besten von oben gesehen. Das Gesicht (Augen, Mund) gehört ins Bild. Nur der Kopf, kein Körper dahinter. |
| `glied.png` | ja | Ein Körperglied, **kreisrund, rundum gleich und gefüllt** (kein Ring mit Loch). Es wird nicht mitgedreht. |
| `schwanz.png` | nein | Die Schwanzspitze, **Spitze nach links**. Fehlt sie, endet der Wurm mit kleiner werdenden Gliedern. |

Für alle Bilder gilt:
- **Quadratisch**, am besten 256 × 256 Pixel (größer geht, bringt aber nichts).
- **Durchsichtiger Hintergrund** (PNG), kein Schlagschatten, kein Boden.
- Das Motiv füllt das Bild fast ganz aus und sitzt in der Mitte.
- **Klare Formen, kräftige Farben, dicke Umrisse.** Ein Glied ist auf dem Handy nur etwa 16 Pixel groß,
  feine Details verschwinden.
- Licht von oben links, damit es zu den eingebauten Designs passt.

Als Vorlage für Größe und Ausrichtung liegt das Design `skins/beispiel/` bei (mit den SVG-Quelldateien).
Ein fertiges Beispiel aus KI-Bildern ist `skins/drache/` (Smaragddrache).

### Kopf von der Seite gezeichnet?
Bild-KIs liefern Köpfe oft als Seitenansicht statt von oben. Das geht auch: Trage in `liste.json` zusätzlich
`"seitlich": true` ein. Dann spiegelt das Spiel den Kopf, sobald der Wurm nach links fährt, und er steht nie
auf dem Kopf.

### Ist der Hintergrund wirklich durchsichtig?
Manche Bild-KIs malen das graue Schachbrettmuster ins Bild, statt den Hintergrund durchsichtig zu lassen. So
erkennst du es: Öffne das Bild auf dem Handy oder in einem Bildprogramm. Siehst du dort ein Schachbrett, ist es
eingebrannt. Dann hilft ein Freisteller-Werkzeug („remove background“), oder du gibst das Bild Claude zum
Freistellen.

## Bilder mit kie.ai erzeugen

1. **Zuerst den Kopf.** Beispiel-Prompt:
   > Top-down view of a cute cartoon dragon worm head, head only without neck or body, facing right, big
   > expressive eyes, glossy, bold dark outlines, flat colors, mobile game sprite, centered, fills the frame,
   > transparent background, no shadow
2. **Dann das Glied im selben Stil.** Gib den fertigen Kopf als Referenzbild mit und schreibe:
   > Top-down view of one single round body segment of the same dragon worm, a solid filled disc with no hole
   > in the middle (not a ring, not a donut), perfectly circular, rotationally symmetric scale pattern, same
   > colors and outline style, glossy highlight top-left, centered, fills the frame, transparent background,
   > no shadow
3. **Wenn du magst, die Schwanzspitze:**
   > Top-down view of the tail tip of the same dragon worm, pointing left, wide end on the right, same colors
   > and outline style, centered, transparent background, no shadow
4. **Prüfen und nachbessern:**
   - Ist der Hintergrund wirklich durchsichtig? Wenn nicht, im Prompt „transparent background“ betonen oder das
     Bild mit einem Freisteller-Werkzeug nachbearbeiten.
   - Schaut der Kopf nach rechts? Sonst im Bildprogramm drehen oder spiegeln.
   - Ist das Glied rund? Ein eckiges oder schiefes Glied sieht in Kurven unruhig aus.

Fertige Prompts für alle vorhandenen Designs (Raupe, Biene, Lavawurm, Eiskristall, Roboter, Neon, Donut, Einhorn)
stehen in [`PROMPTS.md`](PROMPTS.md). Weitere Ideen: Hai, Zuckerstange, Kaktus, Geisterwurm, Tintenfisch-Arm.

**Wichtig:** Nimm nur Bilder, die du selbst erzeugt oder gemalt hast. Keine Figuren aus bestehenden Spielen,
Filmen oder Serien.

## Und Tripo AI?

Tripo baut 3D-Modelle. Für die Würmer im Spiel ist das nicht nötig, weil das Spiel flache Bilder von oben
verwendet. Sinnvoll ist Tripo für:
- ein 3D-Modell des Wurmkopfes, das du **genau von oben** als Bild renderst. Dann haben alle deine Designs
  dasselbe Licht und denselben Stil.
- ein schickes App-Icon oder Werbebilder und kurze Videos für TikTok und Instagram.

## Design ins Spiel bringen

1. Auf GitHub im Repo `Worm-Attack` den Ordner `skins` öffnen.
2. **Add file → Upload files** und deinen Ordner (z. B. `drache` mit `kopf.png`, `glied.png`, `schwanz.png`)
   hineinziehen. **Commit changes.**
3. Die Datei `skins/liste.json` öffnen, auf den Stift klicken und eine Zeile ergänzen:
   ```json
   [
     { "ordner": "beispiel", "name": "Vorlage", "farbe": "#58d868", "stufe": 1 },
     { "ordner": "drache", "name": "Smaragddrache", "farbe": "#2fbf9f", "stufe": 1, "seitlich": true },
     { "ordner": "lava", "name": "Lavawurm", "farbe": "#ff6a2b", "stufe": 1 }
   ]
   ```
   - `ordner`: Name deines Ordners. Nur Buchstaben, Zahlen, `-` und `_`.
   - `name`: so heißt das Design im Spiel (höchstens 18 Zeichen).
   - `farbe`: Hauptfarbe für Punkteanzeige und Leuchten, als Farbcode wie `#ff6a2b`.
   - `stufe`: ab welcher Stufe gegen den Computer das Design frei ist. `1` heißt sofort.
   - `seitlich` (freiwillig): `true`, wenn der Kopf von der Seite gezeichnet ist (siehe oben).
   - Zwischen den Zeilen steht ein Komma, hinter der letzten keins.
4. **Commit changes.** Nach 1 bis 2 Minuten das Spiel neu laden. Das Design steht im Menü unter „Wurm: …“
   hinter den eingebauten Designs.

## Wenn etwas nicht klappt

| Was du siehst | Woran es meist liegt |
| --- | --- |
| Design taucht nicht auf | Tippfehler in `liste.json` (fehlendes Komma, Anführungszeichen) oder Ordnername stimmt nicht |
| Wurm erscheint einfarbig ohne dein Bild | `kopf.png` oder `glied.png` fehlt oder heißt anders (Groß- und Kleinschreibung zählt) |
| Weißer Kasten um den Wurm | Hintergrund ist nicht durchsichtig |
| Kopf schaut zur Seite oder nach hinten | Kopf im Bild schaut nicht nach rechts |
| Altes Bild wird noch angezeigt | App ganz schließen und neu öffnen |
