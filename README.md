# Týden · Wochenplan — v0.6.4

Ein Wochenplaner fürs iPad: Kalender, Essensplan, Einkaufsliste und ein Notizblock
für den Apple Pencil. Alles liegt in einer statischen Webseite, die Daten bleiben
auf dem Gerät.

## Dateien

| Datei | Inhalt |
|---|---|
| `index.html` | Gerüst, alle Dialoge |
| `app.css` | Gestaltung, saisonale Farben, Druckbild |
| `app.js` | Kalenderwoche, Jahreszeit, Kalender-Tab, Google-Anbindung, Druck |
| `essen.js` | Essensplan, Würfellogik, Rezeptkartei, Einkaufsliste |
| `backen.js` | **Die Backrezepte**, der Backen-Tab und sein Einkaufszettel |
| `monat.js` | Monatsübersicht, Vorhaben als Balken, Feiertage |
| `tasten.js` | Sonderzeichenleiste über der Tastatur |
| `notizen.js` | Zeichenfläche für den Pencil |
| `notizen-fest.js` | Dauerhafte Notizen mit Seiten und Unterpunkten |
| `claude.js` | Rezept aus Foto oder Link, Vorschläge aus dem Vorrat |
| `rezepte.js` | **Die Rezepte.** Einzige Quelle für App und Kartendruck |
| `sw.js`, `manifest.webmanifest`, `icon-*.png` | Offline-Betrieb und Homescreen-Symbol |
| `CHANGELOG.md` | Versionsstand und was sich geändert hat |
| `datenschutz.html` | Datenschutzerklärung, nötig für den Google-Produktionsmodus |

Die Version steht in `app.js` als `VERSION` und in `sw.js` als `CACHE`. Beide
müssen gleich sein, sonst behält der Offline-Speicher die alte Fassung.

## 1 · Auf GitHub Pages stellen

1. Auf github.com ein neues Repository anlegen, zum Beispiel `tyden`.
   **Öffentlich** ist in Ordnung, solange keine Schlüssel in den Dateien stehen —
   und das ist hier nicht der Fall.
2. Alle Dateien aus diesem Ordner hochladen (Add file → Upload files).
3. Settings → Pages → Source auf **Deploy from a branch**, Branch `main`, Ordner `/ (root)`.
4. Nach ein bis zwei Minuten läuft die Seite unter
   `https://<dein-name>.github.io/tyden/`.

### Auf dem iPad einrichten

Adresse in Safari öffnen → Teilen → **Zum Home-Bildschirm**. Danach startet die App
im Vollbild mit eigenem Symbol und läuft auch ohne Netz.

## 2 · Google Kalender verbinden

Die App liest Termine, sie schreibt nichts.

1. [console.cloud.google.com](https://console.cloud.google.com) öffnen, Projekt anlegen.
2. **APIs & Services → Library** → *Google Calendar API* suchen und aktivieren.
3. **APIs & Services → OAuth consent screen** → User Type *External*, App-Name eintragen,
   deine Google-Adresse als Test-User hinzufügen. Solange die App im Testmodus bleibt,
   genügt das; der Zugang muss dann etwa alle sieben Tage erneuert werden.
   Wer das nicht will, veröffentlicht den Consent Screen.
4. **APIs & Services → Credentials → Create Credentials → OAuth client ID**,
   Typ **Web application**.
   Unter *Authorized JavaScript origins* genau eintragen:
   `https://<dein-name>.github.io`
   (nur der Ursprung, ohne Pfad und ohne Schrägstrich am Ende)
5. Die erzeugte Client-ID kopieren, in der App oben rechts auf das Zahnrad,
   einfügen, **Mit Google verbinden**.

Die Anmeldung gilt für die laufende Sitzung. Nach einem Neustart der App genügt ein Klick
auf Verbinden.

## 3 · Claude verbinden (optional)

Für Rezepte aus Fotos und Links sowie Vorschläge aus dem Vorrat.

1. Bei [console.anthropic.com](https://console.anthropic.com) einen API-Schlüssel erzeugen.
2. In der App: Tab **Essen → Mit Claude → Zugang**, Schlüssel einfügen, speichern.

Der Schlüssel liegt ausschließlich im Browser dieses iPads. **Niemals** in eine Datei
schreiben, die ins Repository wandert. Abgerechnet wird pro Anfrage; ein Rezept aus
einem Foto kostet wenige Cent.

Für Links nutzt die App den Lesedienst `r.jina.ai`, weil Browser fremde Seiten sonst
nicht laden dürfen. Wenn eine Seite sich sperrt, einfach den Rezepttext in dasselbe
Feld einfügen — das funktioniert immer.

## 4 · Bedienung

**Woche** gilt für alle Tabs gemeinsam. Pfeile wechseln, *Heute* springt zurück.
Sonntags öffnet die App die kommende Woche, weil dann geplant wird.

**Kalender** zeigt die Google-Termine und pro Tag ein Notizfeld. Mit dem Pencil
schreibst du über Scribble direkt hinein. Termine, die über die Woche hinausgehen,
stehen am Montag mit *seit* und am Sonntag mit *bis*.

**Essen** würfelt die Woche nach festen Regeln: Wochenendgerichte nie unter der Woche,
keine Kategorie zweimal hintereinander, lange Gerichte bevorzugt aufs Wochenende,
nichts aus den letzten Wochen. Jeder Tag hat einen eigenen Würfel zum Nachziehen.

**Einkauf** bündelt die Zutaten nach Warengruppen. Grundnahrungsmittel wie Öl, Salz
oder getrocknete Gewürze landen im aufklappbaren Vorrat statt auf der Liste —
frische Kräuter dagegen immer auf der Liste, erkennbar an Einheiten wie Bund oder Zweige.

**Notizen** ist eine Zeichenfläche mit Druckerkennung. Der Handballen wird ignoriert,
sobald ein Stift erkannt wurde. Pro Kalenderwoche beliebig viele Seiten.

**Drucken** oben rechts: Bereiche einzeln auswählen, dann über AirPrint ausgeben.

## 5 · Rezepte pflegen

Im Tab Essen → **Rezeptkartei**. Jedes Rezept lässt sich bearbeiten und als *geprüft*
markieren; der Fortschritt steht in der Kopfzeile des Tabs.

Wenn du durch bist: **Rezepte exportieren**. Du bekommst eine neue `rezepte.js`, die
die alte im Repository ersetzt. Dieselbe Datei ist die Quelle für den Druck der
A7-Rezeptkarten und die A3-Tafel.

## Daten und Sicherung

Plan, Notizen und Rezepte liegen im Speicher des Browsers, Zeichnungen in IndexedDB.
Unter Zahnrad → **Sicherung speichern** bekommst du alles als JSON; *Sicherung laden*
spielt es zurück. Wer Safari-Daten löscht, löscht auch die App-Daten — vor so etwas
also sichern.
