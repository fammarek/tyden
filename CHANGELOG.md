# Versionsstand

Die laufende Version steht an zwei Stellen und muss dort gleich sein:
`VERSION` ganz oben in `app.js` und `CACHE` in `sw.js`. Nur wenn sich der
Name in `sw.js` ändert, wirft der Offline-Speicher die alte Fassung sicher weg.

In der App siehst du die Version oben neben dem Namen und noch einmal
unter Zahnrad → Daten.

---

## v0.1.1 — 1. November 2026

**Behoben**
- Rezepte aus Foto oder Link konnten als leere Karte im Editor landen, wenn das
  Modell die Felder anders benannte oder die Zutaten als Objekte statt als Listen
  lieferte. Die Auswertung erkennt jetzt auch deutsche und englische Feldnamen,
  Zutaten als Objekt oder als Fließtext und Antworten in Codeblöcken.
- Eine abgeschnittene oder unbrauchbare Antwort öffnet keine leere Karte mehr,
  sondern meldet den Grund und zeigt die Antwort des Modells zum Nachlesen.
- Mehr Platz für die Antwort, damit lange Rezepte nicht mittendrin abbrechen.

**Geändert**
- Hinweis im Zugang: Für Fotos und verschachtelte Webseiten eignet sich ein
  Sonnet-Modell besser als ein Haiku-Modell.

---

## v0.1 — 1. November 2026

Erster vollständiger Stand, bereit zum Einsatz auf dem iPad.

**Gerüst**
- Vier Bereiche: Kalender, Essen, Einkauf, Notizen, dazu eine gemeinsame
  Kalenderwoche mit Vor- und Zurückblättern und dem Sprung auf Heute.
- Sonntags öffnet die App die kommende Woche, weil dann geplant wird.
- Farben wechseln mit der Jahreszeit der angezeigten Woche: Frühling, Sommer,
  Herbst, Winter.
- Läuft als Web-App vom Home-Bildschirm, auch offline.

**Kalender**
- Google-Termine, ausschließlich lesend, über OAuth.
- Auswahl, welche Kalender angezeigt werden.
- Farben der Termine und Kalender werden übernommen.
- Mehrtägige Termine stehen fest oben in der Spalte, mit Pfeilen für den
  Übergang und mit "seit" und "bis" an den Wochenrändern.
- Pro Tag ein Notizfeld, mit dem Pencil über Scribble beschreibbar.
- Stille Anmeldung: der Zugang erneuert sich ohne Klick.

**Essen**
- 52 Gerichte in der Kartei, davon 4 noch ohne Rezept.
- Wochenwürfel mit Regeln: Wochenendgerichte nur Samstag und Sonntag,
  keine Kategorie zweimal hintereinander, lange Gerichte aufs Wochenende,
  Sperrfrist gegen Wiederholungen aus den Vorwochen.
- Würfel für einzelne Tage.
- Freie Gerichte ohne Rezept, etwa "Essen bei Oma", ohne Zutaten.
- Rezepteditor mit Review-Haken und Export als `rezepte.js`.

**Einkauf**
- Zutaten der Woche zusammengefasst, nach Warengruppen sortiert.
- Grundnahrungsmittel landen im Vorrat statt auf der Liste, frische Kräuter
  immer auf der Liste.
- Haken pro Position, Vorratsliste selbst pflegbar.
- Versand an WhatsApp, Kopieren, Drucken.

**Notizen**
- Zeichenfläche mit Druckerkennung für den Apple Pencil, Handballen wird ignoriert.
- Umschalter zwischen Tastatur und Stift, beide Ebenen auf derselben Seite.
- Eigener Scrollbalken, damit Schreiben und Blättern sich nicht stören.
- Mehrere Seiten pro Woche, einzeln entfernbar.

**Claude**
- Rezept aus Foto oder Link, landet zur Prüfung im Editor.
- Vorschläge aus dem vorhandenen Vorrat.
- Abfrage der für den Schlüssel verfügbaren Modelle.
- Ausführliche Fehleranzeige mit Serverantwort zum Kopieren.

**Drucken**
- Wochenplan, Essensplan, Einkaufsliste, Notizen und die vollständigen Rezepte
  der Woche, einzeln auswählbar, über AirPrint.

**Daten**
- Alles bleibt lokal im Browser. Sicherung als JSON zum Speichern und Zurückspielen.

**Auf Papier**
- A3-Tafel quer und A7-Rezeptkarten als PDF, aus derselben Rezeptdatei erzeugt.

---

## Geplant

- Review der 52 Rezepte, danach Neudruck des Kartensatzes.
- Rezepte für Flammkuchen, Lachsburger und Bratwurstcarbonara ergänzen.
