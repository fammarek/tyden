# Versionsstand

Die laufende Version steht an zwei Stellen und muss dort gleich sein:
`VERSION` ganz oben in `app.js` und `CACHE` in `sw.js`. Nur wenn sich der
Name in `sw.js` ändert, wirft der Offline-Speicher die alte Fassung sicher weg.

In der App siehst du die Version oben neben dem Namen und noch einmal
unter Zahnrad → Daten.

---

## v0.7.2 — 8. November 2026

**Behoben**
- Abgehakte Zutaten standen weiter auf dem Ausdruck. Jetzt kommt nur noch auf den
  Zettel, was wirklich fehlt — bei der Wochenliste wie bei der Backliste, die
  eigenen Punkte eingeschlossen.
- Dieselbe Zutat stand mehrfach untereinander: "Zwiebel", "Zwiebeln" und
  "rote Zwiebel", oder "Knoblauch", "Knoblauchzehe" und "Knoblauchzehen". Die Liste
  erkennt jetzt Einzahl und Mehrzahl, dreht vorangestellte Eigenschaften um
  ("rote Zwiebel" ist "Zwiebel, rot", "gemahlene Mandeln" sind "Mandeln, gemahlen")
  und zieht das Maßwort aus dem Namen heraus: aus drei Knoblauchzehen wird
  "Knoblauch — 3 Zehen". Dasselbe gilt für Lorbeerblatt, Zimtstange und ähnliche.
  Verschiedene Namen für dasselbe werden zusammengeführt: Möhre und Karotte,
  Porree und Lauch, Lauchzwiebel und Frühlingszwiebel.
- Unterschieden bleibt, was sich unterscheidet: "Zwiebel" und "Zwiebel, rot",
  "Pfeffer" und "weißer Pfeffer", "Salz" und "grobes Salz", "ganze" und "gehackte
  Haselnüsse" stehen weiter getrennt.
- In den Rezeptdateien sind die Namen vereinheitlicht, damit auch die Rezeptkarten
  und der Export gleich schreiben.

**Neu**
- Anbindung an **Microsoft To Do**. Der Knopf "An To Do" schickt alles Offene als
  einzelne Aufgaben, Menge hinter dem Namen. Dafür legt die App je Woche eine eigene
  Liste an: "Einkauf KW 46", beim Backen "Backen KW 46". Gibt es sie schon, wird sie
  weiterbenutzt. Wer lieber alles in einer festen Liste sammelt, nimmt den Haken unter
  Zahnrad heraus und wählt die Liste selbst. Was dort schon
  steht, wird nicht doppelt angelegt. Die Anmeldung läuft über OAuth mit PKCE, also
  ohne Geheimschlüssel; der Zugang liegt nur in diesem Browser. Einrichtung in
  README.md. Microsoft gibt Web-Apps einen Zugang nur für 24 Stunden, danach fragt
  die App beim Senden wieder nach der Anmeldung.
- Knopf "Teilen" bei beiden Einkaufslisten. Er öffnet das Teilen-Blatt des iPads;
  damit geht die Liste an Erinnerungen, Notizen, Mail, Microsoft To Do und alles
  andere, was Text annimmt.

---

## v0.6.4 — 7. November 2026

**Geändert**
- Die Leiste mit Sonderzeichen ist standardmäßig aus. Unter Zahnrad → Tastatur lässt sie
  sich einschalten, falls sie doch einmal gebraucht wird.

**Hinweis**
- In den Textfeldern der App steckt die ganz normale iOS-Tastatur; eine Web-Seite kann
  daran nichts einschränken und auch nichts freischalten. Der Globus zum Umschalten der
  Sprache erscheint erst, wenn mindestens zwei Tastaturen eingerichtet sind:
  Einstellungen → Allgemein → Tastatur → Tastaturen → Tastatur hinzufügen. Bei einer
  angesteckten Tastatur wechselt Strg + Leertaste.

---

## v0.6.3 — 7. November 2026

**Neu**
- Die Rezepte aus deiner Sicherung sind in die Dateien übernommen. In der Kartei stehen
  jetzt 66 Gerichte, dazu kamen Hackfleisch-Wraps aus der Pfanne, Linsen mit Spätzle und
  Würstchen, Miso-Ramen-Suppe und Pho Bo. Ofenpfannkuchen darf jetzt auch unter der Woche.
- Bei den Backrezepten sind es 23: dazu kamen Eňo-ňuňo-Blechkuchen, Lehké pusinky und
  Křehké linecké kytičky.
- Dritte Kategorie beim Backen: Kuchen, zwischen Plätzchen und Brot. Der Blechkuchen stand
  sonst unter Plätzchen. Claude kennt die Kategorie beim Anlegen neuer Rezepte mit.

**Geändert**
- Rezepte und Backrezepte werden als `.txt` statt als `.js` exportiert. Gmail und die meisten
  anderen Programme lassen `.js` im Anhang nicht durch. Der Inhalt bleibt gleich, die Datei
  lässt sich weiterhin direkt in `rezepte.js` beziehungsweise in den Datenblock von
  `backen.js` übernehmen.
- Kennungen vertragen jetzt tschechische Buchstaben. Aus „Eňo-ňuňo-Blechkuchen" wurde vorher
  die Kennung „e-o-u-o-blechkuchen", jetzt „eno-nuno-blechkuchen".

**Behoben**
- In den Baiser-Küsschen stand noch ein tschechisches Wort aus der Übersetzung
  („tuhy Schnee"), jetzt „fester Schnee". Die beiden tschechischen Titel haben ihre
  Hatschek und Längezeichen zurück.

---

## v0.6.2 — 7. November 2026

**Behoben**
- Fotos gingen in voller Größe an Claude, also mit zwölf Megapixeln und bei iPhone-Bildern
  im Format HEIC. Beides verträgt die Schnittstelle schlecht: über fünf Megabyte je Bild
  wird abgelehnt, HEIC gar nicht angenommen, und ein riesiges Bild frisst den Platz, der
  für die Antwort gebraucht wird. Jedes Bild wird jetzt vorher auf 1568 Pixel lange Kante
  gebracht und als JPEG verschickt. Mehr Auflösung wertet die Bilderkennung ohnehin nicht aus.
- Lange Rezepte brachen mittendrin ab, besonders tschechische: Tschechisch braucht deutlich
  mehr Platz als Deutsch, und die Obergrenze für die Antwort war zu knapp gesetzt. Sie ist
  jetzt viermal so hoch. Reicht sie trotzdem nicht, fragt die App automatisch ein zweites Mal
  mit doppeltem Spielraum nach und sagt erst dann Bescheid, statt eine halbe Karte zu bauen.
- Lässt das gewählte Modell weniger Antwortlänge zu, übernimmt die App die erlaubte
  Obergrenze aus der Fehlermeldung und fragt damit noch einmal, statt abzubrechen.

**Neu**
- Eigene Punkte auf dem Einkaufszettel. Unter der Liste steht ein Feld: eintippen, Eingabe
  oder Plus, fertig. Mit Kästchen zum Abhaken und "weg" zum Entfernen, in der Gruppe
  "Zusätzlich". Sie hängen an der Woche, überleben also das Würfeln, und gehen mit an
  WhatsApp und auf den Ausdruck. Dasselbe gibt es auf der Backliste.
- Fremdsprachige Rezepte behalten ihren Originaltitel: erst die deutsche Übersetzung,
  dann ein Gedankenstrich, dann das Original — "Linzer Plätzchen mit Zitronencreme –
  Linecké s citronovým krémem".

**Geändert**
- Beim Abfotografieren von Rezepten weiß Claude jetzt, wie Zeitschriftenseiten aufgebaut
  sind: Zutaten im Kasten neben dem Bild, Abschnitte wie "für den Teig" und "für die Creme",
  Fließtext in Spalten, Nachbarrezepte am Rand gehören nicht dazu.

---

## v0.6.1 — 6. November 2026

**Behoben**
- Beim Fotografieren ließ sich kein vorhandenes Bild aus der Mediathek wählen.
  Die Felder forderten ausdrücklich die Kamera an. Jetzt fragt das iPad wie
  gewohnt: Fotomediathek, Foto aufnehmen oder Datei auswählen. Betrifft alle
  vier Stellen — Rezept aus Foto, Vorrat abfotografieren, Wochennotizen und
  Notizen abschreiben.

**Neu**
- Leiste mit Sonderzeichen über der Tastatur: ä ö ü ß und die großen dazu,
  Gedankenstrich und Anführungszeichen. Ein Knopf rechts schaltet auf die
  tschechischen Buchstaben um (á č ď é ě í ň ó ř š ť ú ů ý ž) und zurück.
  Sie erscheint, sobald ein Textfeld offen ist, sitzt direkt über der
  Bildschirmtastatur und schreibt an der Stelle, an der die Schreibmarke steht.
  Auch in den Dialogen, etwa im Rezepteditor.

**Geändert**
- Im Notizblock sind Korrektur und Vorschläge wieder eingeschaltet, dazu auf
  Deutsch. Damit wird aus "strasse" auch wieder "Straße".

**Hinweis**
- Welche Tastatur das iPad zeigt, kann eine Web-App nicht bestimmen. Der Globus
  zum Umschalten erscheint erst, wenn mehr als eine Tastatur eingerichtet ist:
  Einstellungen → Allgemein → Tastatur → Tastaturen → Tastatur hinzufügen →
  Deutsch. Bei einer angesteckten Tastatur wechselt Strg + Leertaste die Sprache.

---

## v0.6 — 5. November 2026

**Neu**
- Eigener Tab **Monat**: das ganze Blatt auf einen Blick, Montag bis Sonntag,
  links die Kalenderwoche. Die Zahl links öffnet die zugehörige Woche.
  Vor und Zurück im Kopf blättern hier monatsweise statt wochenweise.
- **Vorhaben**: eigene Einträge mit Namen, von–bis und Farbe, die als durchgehender
  Balken über die Tage laufen — genau wie mit dem Stift auf dem Wandkalender.
  Auf einen Tag tippen legt eines an, auf einen Balken tippen ändert oder löscht es.
  Läuft ein Vorhaben über das Wochenende hinaus, steht am Rand ein Pfeil.
  Mehrere Vorhaben am selben Tag rücken untereinander, nichts überdeckt etwas.
- Vorhaben sind **abhakbar**. Erledigtes bleibt stehen, nur durchgestrichen und blasser.
- Im Tab **Notizen** gibt es dafür die feste Seite "Aus dem Monat": alle Vorhaben
  nach Datum, zum Abhaken. Geändert und gelöscht wird im Monat, dort stehen die Daten.
- Die **Google-Termine** lassen sich im Monat mit einem Haken ein- und ausblenden.
  Mehrtägige laufen als gepunkteter Balken mit, eintägige stehen klein im Tagesfeld.
  Die Auswahl, welche Kalender gezeigt werden, gilt weiter aus den Einstellungen.
- **Feiertage und Merktage** für Baden-Württemberg stehen im Monat: gesetzliche
  Feiertage rot, dazu Reformationstag, die vier Advente, Heiligabend und Silvester.
- **Monatsblatt drucken**, A4 quer, als eigener Haken im Druckdialog. Die Vorhaben
  stehen zusätzlich auf dem Notizen-Ausdruck.

**Geändert**
- Vorhaben erscheinen auch in der Wochenansicht oben bei den Terminen und auf dem
  gedruckten Wochenplan.
- Beim Blättern in weit entfernte Monate werden die Google-Termine für diesen
  Zeitraum nachgeladen.

---

## v0.5.1 — 2. November 2026

**Geändert**
- Die Google-Termine bleiben jetzt im Browser liegen. Läuft der Zugang ab — Google
  gibt ihn nur für eine Stunde aus —, steht die Woche trotzdem vollständig da.
  Über dem Kalender erscheint dann eine Zeile mit dem Stand der letzten Abfrage
  und einem Knopf zum Erneuern. Vorher war der Kalender in dem Moment leer, was
  sich anfühlte, als wäre die Anmeldung weg.
- Termine werden auf Vorrat geladen: fünf Wochen zurück, acht nach vorn. Beim
  Blättern wird nur noch nachgefragt, wenn die Woche außerhalb dieser Spanne liegt
  oder der Stand älter als eine Viertelstunde ist.
- Der Zugang erneuert sich jetzt zehn Minuten vor Ablauf statt erst danach, und
  nach einem Fehlschlag zweimal mit Abstand noch einmal.
- "Mit Google verbinden" fragt nur noch nach dem Konto statt jedes Mal nach der
  Zustimmung zum Lesezugriff.
- Beim Trennen wird auch der Zwischenspeicher gelöscht.

**Hinweis**
- Dauerhaft angemeldet bleiben kann eine Seite ohne eigenen Server nicht; Google
  vergibt dafür kein unbefristetes Token. Hilft zusätzlich: in Safari
  "Cross-Sitetracking verhindern" ausschalten und in der Google Cloud Console den
  Veröffentlichungsstatus auf Produktion setzen. Beides steht jetzt im
  Einstellungsdialog.

---

## v0.5 — 1. November 2026

**Neu**
- Eigener Tab **Backen**, ohne Wochenstruktur. Rezepte antippen, über Plus und
  Minus festlegen, wie oft gebacken wird, und daraus entsteht rechts ein eigener
  Einkaufszettel — getrennt von der Einkaufsliste der Woche. Gedacht fürs
  Plätzchenbacken, taugt genauso für einen Backtag mit Brot.
- 20 Backrezepte: Mürbteigplätzchen, Vanillekipferl, Nussberge, Macarons,
  Zimtsterne, Kokosmakronen, Spitzbuben, Schwarz-Weiß-Gebäck, Heidesand,
  Husarenkrapfen, Florentiner, Elisenlebkuchen, Nussecken und Pfeffernüsse,
  dazu Weizenmischbrot, Dinkel-Vollkornbrot, Sonntagsbrötchen, Laugenbrötchen,
  Hefezopf und Focaccia.
- Backrezepte lassen sich selbst anlegen und ändern: "Backrezept +" öffnet einen
  eigenen Editor mit Kategorie, Ausbeute, Zutaten und Schritten, "Bearbeiten" auf dem
  Rezeptblatt ändert ein vorhandenes. "Mit Claude" nimmt wie bei den Gerichten ein
  Foto oder einen Link und legt daraus ein Backrezept an, das vor dem Speichern im
  Editor liegt. Eigene Rezepte bleiben im Browser; "Exportieren" schreibt den ganzen
  Bestand als Datei heraus, "Zurücksetzen" stellt den Grundstock wieder her.
- Die Backliste geht wie die Wocheneinkaufsliste an WhatsApp, in die Zwischenablage
  und auf Papier. Im Druckdialog stehen dafür zwei neue Haken: der Einkaufszettel
  und die vollständigen Backrezepte in der gewählten Menge.
- Beim Backen gilt der Vorrat enger: Mehl, Zucker und Butter gehen kiloweise durch
  und stehen deshalb auf der Liste. Im Vorrat bleibt nur, was ausschließlich in
  Prisen und Löffeln vorkommt. Mit "Vorrat" lässt sich jede Position trotzdem
  von der Liste nehmen.

**Geändert**
- Gleiche Zutaten aus mehreren Rezepten werden jetzt wirklich zusammengezählt.
  Kilogramm und Gramm, Liter und Milliliter kommen dafür auf eine Basis — aus
  800 g und 1,2 kg Mehl wird eine Zeile mit 2 kg. Zusätze wie "für den Belag"
  oder "zum Bestäuben" fallen beim Zusammenzählen weg, im Rezept stehen sie
  weiter. Lässt sich eine Einheit nicht umrechnen, stehen beide Mengen in
  derselben Zeile, etwa "10 g + 2 EL".
- Wasser steht nie auf einer Einkaufsliste.
- Zwei Einheiten mehr zur Auswahl: Päckchen und Messerspitze.

**Hinweis**
- Weil die Positionen jetzt anders zusammengefasst werden, sind die Haken auf der
  Einkaufsliste der laufenden Woche einmalig zurückgesetzt.

---

## v0.4.1 — 1. November 2026

**Neu**
- Unterpunkte in den Notizen. Jeder Punkt hat rechts ein kleines Plus vor "ändern"
  und "löschen"; damit klappt ein Feld auf, in dem sich mehrere Unterpunkte am Stück
  eintragen lassen. Unterpunkte sind eingerückt und haben ein eigenes Kästchen.
- Der Oberpunkt zeigt, wie viele seiner Unterpunkte noch offen sind. Hakt man ihn ab,
  gelten auch die Unterpunkte als erledigt; löscht man ihn, verschwinden sie mit.
- Auf dem Ausdruck stehen Unterpunkte eingerückt unter ihrem Oberpunkt.

---

## v0.4 — 1. November 2026

**Neu**
- Eigener Tab "Notizen" für dauerhafte Punkte, unabhängig von der Kalenderwoche.
  Jede Zeile hat ein Kontrollkästchen, abgehakte Punkte lassen sich ausblenden
  oder gesammelt entfernen. Mehrere Zeilen auf einmal eingetippt werden zu
  mehreren Punkten, und "Foto abschreiben" füllt die Liste aus einem Zettel.
- Diese Notizen liegen auf benennbaren Seiten, etwa "Allgemein" und "Haus & Garten".
  Seiten lassen sich anlegen, umbenennen und entfernen; die Reiter zeigen, wie viele
  Punkte je Seite offen sind.
- Der Ausdruck führt alle Seiten untereinander auf, erledigte Punkte abgesetzt und
  durchgestrichen.

**Geändert**
- Beim Abfotografieren liest Claude jetzt spaltenweise: erst die linke Spalte von
  oben nach unten, dann die nächste, bis zur rechten. Alles landet untereinander
  in einer Liste statt nebeneinander.

**Geändert**
- Der bisherige Notizblock heißt jetzt "Wochennotizen", weil er an der
  Kalenderwoche hängt. Damit gibt es vier Tabs: Woche, Einkauf, Wochennotizen,
  Notizen.

---

## v0.3.5 — 1. November 2026

**Geändert**
- Bei der Auswahl von Hand stehen jetzt immer alle Gerichte zur Wahl, auch die
  Wochenendgerichte an einem Werktag. Sie sind dort mit Sa/So gekennzeichnet und
  etwas blasser dargestellt. Das Tagesfenster bindet nur noch den Würfel.

---

## v0.3.4 — 1. November 2026

**Behoben**
- Das Notizfeld in der Wochenansicht hatte eine feste Höhe. Ab der dritten Zeile
  verschwand der Text nach unten aus dem Blick. Es wächst jetzt mit dem Inhalt,
  und die sieben Tagesspalten bleiben dabei gleich hoch.

---

## v0.3.3 — 1. November 2026

**Behoben**
- Auf der gedruckten Einkaufsliste zogen sich die Kästchen zum Abhaken über die
  halbe Zeile, weil eine allgemeine Regel ihre Breite überstimmte. Sie sind jetzt
  wieder kleine Quadrate.

---

## v0.3.2 — 1. November 2026

**Geändert**
- Der Ausdruck ist jetzt farbig. Termine übernehmen die Farbe aus Google, Gerichte
  die Farbe ihrer Kategorie, mehrtägige Termine sind kräftiger hinterlegt und das
  zweite Gericht trägt einen gestrichelten Rand. Der Ort eines Termins steht mit
  auf dem Blatt.

---

## v0.3.1 — 1. November 2026

**Neu**
- Scrollbalken am rechten Rand für die ganze Seite, mit Pfeilen oben und unten.
  Er erscheint nur, wenn die Seite länger ist als der Bildschirm, und verschwindet
  von selbst. Damit lässt sich auch die Wochenansicht ohne Wischgeste bedienen.

---

## v0.3 — 1. November 2026

**Neu**
- Zehn Gerichte dazu: Buřtguláš, Fleischküchlein mit Salzkartoffeln, Pizza Margherita,
  Gulasch mit Spätzle und Salat, Quesadillas mit Bohnen und Käse, Vanillepudding,
  Karotten-Kartoffelsuppe (bewusst ohne Rezept), Ofenpfannkuchen sowie Ofensuppe
  mit Rind und mit Huhn. Die Kartei zählt jetzt 62 Gerichte.
- Zweites Gericht pro Tag, etwa wenn die Erwachsenen anders essen als die Kinder.
  Beide Plätze fließen in die Einkaufsliste, den Plan und den Ausdruck ein.
  Der Würfel belegt nur den ersten Platz, der zweite bleibt in deiner Hand.
- Wird der erste Platz geleert, rückt das zweite Gericht nach.

**Geändert**
- Kalender und Essen liegen jetzt im selben Tab "Woche", die Termine oben,
  der Essensplan darunter. Damit sind es drei Tabs statt vier.

---

## v0.2.1 — 1. November 2026

**Behoben**
- Aktualisierungen kamen auf dem iPad nicht an, weil der Offline-Speicher die alte
  Fassung festhielt. Die App prüft jetzt beim Start und stündlich auf eine neue
  Fassung, meldet sie kurz und lädt sich einmal selbst neu. Die Datei `sw.js`
  wird dabei nie mehr aus dem Zwischenspeicher genommen.

---

## v0.2 — 1. November 2026

**Neu**
- Notizen abfotografieren: Im Notizblock schreibt Claude einen handgeschriebenen
  Zettel, eine Tafel oder einen Ausdruck in die Textebene der offenen Seite.
  Gliederung und Aufzählungen bleiben erhalten, Abgehaktes wird mit [erledigt]
  gekennzeichnet, unsicher Gelesenes mit [?]. Der Text ist danach ganz normal
  bearbeitbar und lässt sich mit dem Pencil ergänzen.
- Vorhandener Text bleibt stehen, Abgeschriebenes wird darunter angehängt.

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

- Review der 62 Rezepte, danach Neudruck des Kartensatzes.
- Rezepte für Flammkuchen, Lachsburger und Bratwurstcarbonara ergänzen.
