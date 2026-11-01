/* Zdravé meníčko — Rezeptdaten
   Einzige Quelle für App und Kartendruck.
   cat = fleisch|fisch|veg|suppe, win = alle|we (nur Sa/So)
   zut = [Name, Menge für 4 Portionen, Einheit, Warengruppe g|f|m|v]
   ok  = im Review geprüft */
window.REZEPTE = [
{
  id: "ofengemuese", name: "Ofengemüse", cat: "veg", win: "alle",
  time: 45, kh: 12, ok: false,
  sub: "Ein Blech, viel Farbe, Feta obendrauf.",
  zut: [
    ["Blumenkohl, klein", 1, "Kopf", "g"],
    ["Zucchini", 2, "", "g"],
    ["Paprika, rot", 2, "", "g"],
    ["rote Zwiebeln", 2, "", "g"],
    ["Knoblauchzehen", 3, "", "g"],
    ["Olivenöl", 5, "EL", "v"],
    ["Oregano, getrocknet", 2, "TL", "v"],
    ["Feta", 200, "g", "m"],
    ["Salz", 1, "TL", "v"],
    ["Pfeffer", 0.5, "TL", "v"]
  ],
  steps: [
    "Ofen auf 220 °C Umluft vorheizen.",
    "Gemüse in gleich große Stücke schneiden — ungleiche Stücke sind der häufigste Fehler.",
    "Mit Öl, gepresstem Knoblauch, Oregano und Salz gründlich mischen.",
    "Auf zwei Bleche verteilen, nichts stapeln, sonst dünstet es statt zu rösten.",
    "25 Minuten backen, einmal wenden.",
    "Feta darüber bröseln, weitere 10 Minuten bis er Farbe nimmt."
  ],
  tipp: "Reste am nächsten Tag kalt mit einem Spiegelei — schmeckt fast besser."
},
{
  id: "lachs-brei", name: "Lachs mit Blumenkohl-Sellerie-Brei", cat: "fisch", win: "alle",
  time: 30, kh: 9, ok: false,
  sub: "Der Brei, der nach Kartoffel schmeckt, aber keine ist.",
  zut: [
    ["Lachsfilet", 600, "g", "f"],
    ["Blumenkohl", 700, "g", "g"],
    ["Knollensellerie", 300, "g", "g"],
    ["Sahne", 100, "ml", "m"],
    ["Butter", 50, "g", "m"],
    ["Zitrone", 1, "", "g"],
    ["Öl", 2, "EL", "v"],
    ["Muskat", 1, "Prise", "v"],
    ["Salz", 1, "TL", "v"],
    ["Pfeffer", 0.5, "TL", "v"]
  ],
  steps: [
    "Blumenkohl und Sellerie in Würfel schneiden, in wenig Salzwasser 15 Minuten weich kochen.",
    "Abgießen und 2 Minuten im heißen Topf ausdampfen lassen — das entscheidet, ob der Brei cremig oder wässrig wird.",
    "Mit Butter und Sahne fein pürieren, mit Muskat und Salz abschmecken.",
    "Lachs trocken tupfen und salzen.",
    "In heißem Öl auf der Hautseite 4 Minuten braten, wenden, 2 Minuten fertig ziehen.",
    "Mit Zitronenspalten servieren."
  ],
  tipp: "Klassisch mit Kartoffelbrei: 800 g mehlige Kartoffeln statt Blumenkohl und Sellerie."
},
{
  id: "sous-vide-rind", name: "Sous-Vide-Rindfleisch mit Salat", cat: "fleisch", win: "alle",
  time: 135, kh: 6, ok: false,
  sub: "Zwei Stunden Wasserbad, 90 Sekunden Pfanne.",
  zut: [
    ["Rinderhüfte am Stück", 800, "g", "f"],
    ["Butterschmalz", 2, "EL", "m"],
    ["Rosmarin", 2, "Zweige", "g"],
    ["Knoblauchzehen", 2, "", "g"],
    ["Blattsalat, gemischt", 200, "g", "g"],
    ["Kirschtomaten", 250, "g", "g"],
    ["Salatgurke", 1, "", "g"],
    ["rote Zwiebel", 1, "", "g"],
    ["Olivenöl", 4, "EL", "v"],
    ["Rotweinessig", 2, "EL", "v"],
    ["Dijonsenf", 1, "TL", "v"],
    ["Salz", 1, "TL", "v"]
  ],
  steps: [
    "Fleisch salzen, mit Rosmarin und Knoblauch vakuumieren.",
    "2 Stunden bei 54 °C im Wasserbad garen (medium rare).",
    "Aus dem Beutel nehmen und sehr gründlich trocken tupfen — nasses Fleisch brät nicht, es dämpft.",
    "In sehr heißem Butterschmalz je Seite 45 Sekunden anbraten.",
    "5 Minuten ruhen lassen, dann quer zur Faser in Scheiben schneiden.",
    "Dressing aus Öl, Essig, Senf und Salz rühren, Salat und Gemüse damit anmachen, Fleisch darauf anrichten."
  ],
  tipp: "Ohne Sous-vide-Gerät: bei 80 °C Ofen auf 54 °C Kerntemperatur ziehen, dauert rund 90 Minuten."
},
{
  id: "gulasch", name: "Gulasch", cat: "fleisch", win: "alle",
  time: 150, kh: 10, ok: false,
  sub: "Zwiebeln sind hier die Sauce, nicht die Würze.",
  zut: [
    ["Rindergulasch", 1000, "g", "f"],
    ["Zwiebeln", 800, "g", "g"],
    ["Schweineschmalz", 3, "EL", "m"],
    ["Paprikapulver, edelsüß", 3, "EL", "v"],
    ["Tomatenmark", 2, "EL", "v"],
    ["Knoblauchzehen", 3, "", "g"],
    ["Rinderbrühe", 400, "ml", "v"],
    ["Kümmel, gemahlen", 1, "TL", "v"],
    ["Majoran", 1, "TL", "v"],
    ["Essig", 1, "EL", "v"],
    ["Salz", 2, "TL", "v"]
  ],
  steps: [
    "Zwiebeln in Streifen schneiden und in Schmalz 20 Minuten goldbraun schmoren.",
    "Fleisch salzen und portionsweise scharf anbraten.",
    "Topf von der Platte ziehen, erst dann Paprikapulver und Tomatenmark einrühren — im heißen Fett wird Paprika bitter.",
    "Mit Brühe ablöschen, Kümmel, Majoran und Knoblauch zugeben.",
    "Zugedeckt 2 Stunden bei kleinster Hitze schmoren.",
    "Die letzten 20 Minuten offen einkochen, mit Essig und Salz abschmecken."
  ],
  tipp: "Statt Knödel: Gurkensalat mit Rahm. Am zweiten Tag ist es besser, also gleich doppelte Menge."
},
{
  id: "cesnecka", name: "Česnečka", cat: "suppe", win: "alle",
  time: 30, kh: 7, ok: false,
  sub: "Knoblauchsuppe, die Hälfte kommt erst zum Schluss rein.",
  zut: [
    ["Rinderbrühe, kräftig", 1500, "ml", "v"],
    ["Knoblauchzehen", 10, "", "g"],
    ["Speckwürfel", 150, "g", "f"],
    ["Butter", 30, "g", "m"],
    ["Majoran", 2, "TL", "v"],
    ["Kümmel", 1, "TL", "v"],
    ["Eier", 4, "", "m"],
    ["Käse, gerieben", 100, "g", "m"],
    ["Schnittlauch", 1, "Bund", "g"],
    ["Salz", 1, "TL", "v"]
  ],
  steps: [
    "Speckwürfel ohne Fett knusprig auslassen und herausnehmen.",
    "Butter in den Topf, die Hälfte des Knoblauchs fein gehackt kurz glasig dünsten, nicht bräunen.",
    "Brühe, Kümmel und Majoran zugeben, 15 Minuten leise ziehen lassen.",
    "Den restlichen Knoblauch erst jetzt hineinpressen — er bringt die Schärfe, die beim Kochen verloren geht.",
    "Eier verquirlen und unter Rühren einlaufen lassen, bis Fäden entstehen.",
    "In Tellern mit Speck, Käse und Schnittlauch anrichten."
  ],
  tipp: "Speck und Käse ersetzen die Brot- oder Kartoffelwürfel der klassischen Version."
},
{
  id: "kure-paprice", name: "Kuře na paprice", cat: "fleisch", win: "alle",
  time: 50, kh: 8, ok: false,
  sub: "Paprikarahm-Huhn, gebunden mit Frischkäse statt Mehl.",
  zut: [
    ["Hähnchenkeulen", 1000, "g", "f"],
    ["Zwiebeln", 2, "", "g"],
    ["Butter", 40, "g", "m"],
    ["Paprikapulver, edelsüß", 2, "EL", "v"],
    ["Tomatenmark", 1, "TL", "v"],
    ["Hühnerbrühe", 300, "ml", "v"],
    ["Sauerrahm", 200, "g", "m"],
    ["Frischkäse", 100, "g", "m"],
    ["Salz", 1, "TL", "v"]
  ],
  steps: [
    "Keulen salzen und in Butter rundum kräftig anbraten, herausnehmen.",
    "Zwiebelwürfel im Bratfett glasig dünsten.",
    "Topf von der Platte nehmen, Paprikapulver und Tomatenmark einrühren.",
    "Mit Brühe ablöschen, Fleisch zurücklegen, zugedeckt 35 Minuten köcheln.",
    "Sauerrahm und Frischkäse glatt rühren, mit etwas heißer Sauce temperieren, dann einrühren. Nicht mehr kochen lassen, sonst flockt es.",
    "Abschmecken und mit Blumenkohlreis servieren."
  ],
  tipp: "Der Frischkäse ersetzt die Mehlschwitze und bindet die Sauce."
},
{
  id: "geschnetzeltes", name: "Geschnetzeltes", cat: "fleisch", win: "alle",
  time: 30, kh: 9, ok: false,
  sub: "Champignonrahm, scharf angebraten in Portionen.",
  zut: [
    ["Schweine- oder Putengeschnetzeltes", 600, "g", "f"],
    ["Champignons", 400, "g", "g"],
    ["Zwiebel", 1, "", "g"],
    ["Sahne", 200, "ml", "m"],
    ["Frischkäse", 100, "g", "m"],
    ["Gemüsebrühe", 150, "ml", "v"],
    ["Weißwein", 100, "ml", "v"],
    ["Öl", 2, "EL", "v"],
    ["Petersilie", 0.5, "Bund", "g"],
    ["Salz", 1, "TL", "v"],
    ["Pfeffer", 0.5, "TL", "v"]
  ],
  steps: [
    "Fleisch trocken tupfen und portionsweise in sehr heißem Öl scharf anbraten, herausnehmen und erst dann salzen.",
    "Champignons in Scheiben in der Pfanne braten, bis das ausgetretene Wasser verdampft ist.",
    "Zwiebelwürfel zugeben und glasig dünsten.",
    "Mit Weißwein ablöschen und fast vollständig einkochen lassen.",
    "Brühe und Sahne zugeben, 5 Minuten reduzieren, Frischkäse einrühren.",
    "Fleisch zurück in die Pfanne, nur noch ziehen lassen, mit Petersilie bestreuen."
  ],
  tipp: "Spätzle gibt es am Wochenende. Unter der Woche passen Blumenkohlreis oder grüne Bohnen dazu."
},
{
  id: "nuggets", name: "Selbstgemachte Nuggets", cat: "fleisch", win: "alle",
  time: 30, kh: 5, ok: false,
  sub: "Panade aus Mandelmehl und Parmesan, aus dem Ofen.",
  zut: [
    ["Hähnchenbrustfilet", 700, "g", "f"],
    ["Mandelmehl", 80, "g", "v"],
    ["Parmesan, gerieben", 60, "g", "m"],
    ["Eier", 2, "", "m"],
    ["Paprikapulver", 2, "TL", "v"],
    ["Knoblauchpulver", 1, "TL", "v"],
    ["Öl", 4, "EL", "v"],
    ["Salz", 1, "TL", "v"]
  ],
  steps: [
    "Hähnchen in mundgerechte Stücke schneiden, trocken tupfen und salzen.",
    "Mandelmehl, Parmesan, Paprika- und Knoblauchpulver mischen.",
    "Stücke durch verquirltes Ei ziehen, dann in der Panade wenden und leicht andrücken.",
    "Auf ein Blech mit Backpapier legen und mit Öl beträufeln.",
    "Bei 200 °C Umluft 18 Minuten backen, nach 10 Minuten wenden.",
    "Mit Dip und Salat servieren."
  ],
  tipp: "Die Panade haftet nur an trockenem Fleisch. Ein kurzer Moment mit Küchenpapier spart später Ärger."
},
{
  id: "bigmac-rolle", name: "Big Mac Rolle", cat: "fleisch", win: "alle",
  time: 40, kh: 8, ok: false,
  sub: "Eiweiß-Käse-Boden, gerollt und kalt geschnitten.",
  zut: [
    ["Eier", 6, "", "m"],
    ["Frischkäse", 150, "g", "m"],
    ["Käse, gerieben", 100, "g", "m"],
    ["Flohsamenschalen", 1, "TL", "v"],
    ["Rinderhack", 500, "g", "f"],
    ["Gewürzgurken", 4, "", "v"],
    ["Eisbergsalat", 0.25, "Kopf", "g"],
    ["Mayonnaise", 100, "g", "v"],
    ["Naturjoghurt", 50, "g", "m"],
    ["Senf", 1, "TL", "v"],
    ["Paprikapulver", 1, "TL", "v"],
    ["Erythrit", 1, "TL", "v"],
    ["Salz", 1, "TL", "v"]
  ],
  steps: [
    "Eier mit Frischkäse, geriebenem Käse, Flohsamenschalen und Salz glatt mixen.",
    "Masse auf einem Backblech mit Papier dünn und gleichmäßig ausstreichen.",
    "Bei 180 °C 15 Minuten backen, bis die Platte goldgelb und trocken ist.",
    "Auf ein frisches Backpapier stürzen und 5 Minuten abkühlen lassen.",
    "Hack krümelig braun braten, würzen und ebenfalls abkühlen lassen — warme Füllung weicht die Platte auf.",
    "Sauce aus Mayonnaise, Joghurt, Senf, Paprikapulver und Erythrit rühren. Platte bestreichen, Hack, Gurken und Salat darauf, aufrollen, 1 Stunde kalt stellen, in Scheiben schneiden."
  ],
  tipp: "Lässt sich am Vorabend machen und ist am nächsten Tag ein sehr gutes Mitnehmessen."
},
{
  id: "reispapier-pizza", name: "Reispapier-Pizza", cat: "veg", win: "alle",
  time: 20, kh: 18, ok: false,
  sub: "Zwei Blätter, Pfanne, drei Minuten.",
  zut: [
    ["Reispapier", 8, "Blatt", "v"],
    ["Mozzarella", 250, "g", "m"],
    ["passierte Tomaten", 150, "g", "v"],
    ["Kirschtomaten", 150, "g", "g"],
    ["Oregano", 1, "TL", "v"],
    ["Olivenöl", 3, "EL", "v"],
    ["Basilikum", 0.5, "Bund", "g"],
    ["Salz", 0.5, "TL", "v"]
  ],
  steps: [
    "Je zwei Blätter Reispapier kurz durch Wasser ziehen und aufeinanderlegen — doppelt hält es in der Pfanne.",
    "Nicht zu lange wässern, ein Sekundenbad genügt, sonst reißt das Papier.",
    "In einer Pfanne mit wenig Öl bei mittlerer Hitze knusprig backen, wenden.",
    "Passierte Tomaten dünn aufstreichen, salzen und mit Oregano würzen.",
    "Mozzarella und halbierte Kirschtomaten darauf verteilen, Deckel drauf, 3 Minuten bis der Käse schmilzt.",
    "Mit Basilikum und etwas Olivenöl servieren."
  ],
  tipp: "Grenzfall bei den Kohlenhydraten: zwei Blätter pro Person sind das Limit."
},
{
  id: "bohnen-curry", name: "Weiße-Bohnen-Curry", cat: "veg", win: "alle",
  time: 30, kh: 22, ok: false,
  sub: "Ein Drittel der Bohnen wird zerdrückt, das bindet.",
  zut: [
    ["weiße Bohnen, Dose", 800, "g", "v"],
    ["Kokosmilch", 400, "ml", "v"],
    ["Zwiebel", 1, "", "g"],
    ["Knoblauchzehen", 3, "", "g"],
    ["Ingwer", 2, "cm", "g"],
    ["gelbe Currypaste", 2, "EL", "v"],
    ["Blattspinat", 200, "g", "g"],
    ["Tomatenmark", 1, "EL", "v"],
    ["Limette", 1, "", "g"],
    ["Öl", 2, "EL", "v"],
    ["Koriander", 0.5, "Bund", "g"],
    ["Salz", 1, "TL", "v"]
  ],
  steps: [
    "Zwiebel, Knoblauch und Ingwer fein hacken und in Öl anbraten.",
    "Currypaste und Tomatenmark zugeben und eine Minute mitrösten.",
    "Mit Kokosmilch ablöschen.",
    "Abgetropfte Bohnen zugeben und 10 Minuten köcheln lassen.",
    "Ein Drittel der Bohnen am Topfrand zerdrücken — das bindet die Sauce ohne Mehl.",
    "Spinat zusammenfallen lassen, mit Limettensaft und Salz abschmecken, Koriander darüber."
  ],
  tipp: "Die Bohnen bringen Kohlenhydrate mit. Wer strenger rechnet, nimmt die halbe Menge und mehr Gemüse."
},
{
  id: "karottensuppe", name: "Karottenbuttersuppe", cat: "suppe", win: "alle",
  time: 35, kh: 18, ok: false,
  sub: "Kalte Butter zum Schluss macht sie samtig.",
  zut: [
    ["Karotten", 1000, "g", "g"],
    ["Zwiebel", 1, "", "g"],
    ["Butter", 100, "g", "m"],
    ["Gemüsebrühe", 800, "ml", "v"],
    ["Ingwer", 2, "cm", "g"],
    ["Orange", 1, "", "g"],
    ["Sahne", 100, "ml", "m"],
    ["Salz", 1, "TL", "v"],
    ["Pfeffer", 0.5, "TL", "v"]
  ],
  steps: [
    "Karotten in Scheiben schneiden, Zwiebel würfeln.",
    "In der Hälfte der Butter 10 Minuten anschwitzen, ohne dass etwas Farbe nimmt.",
    "Brühe und geriebenen Ingwer zugeben, 20 Minuten weich kochen.",
    "Sehr fein pürieren, am besten zweimal.",
    "Die restliche Butter kalt und in Stücken einmixen — das ist der ganze Trick an der Suppe.",
    "Mit Orangensaft, Sahne und Salz abschmecken."
  ],
  tipp: "Ein Löffel Kürbiskernöl auf dem Teller macht aus der Suppe einen Gang."
},
{
  id: "huehnersuppe", name: "Hühnersuppe aus dem Ofen", cat: "suppe", win: "alle",
  time: 120, kh: 9, ok: false,
  sub: "Erst rösten, dann ziehen — nie kochen.",
  zut: [
    ["Hähnchen, ganz", 1600, "g", "f"],
    ["Karotten", 3, "", "g"],
    ["Knollensellerie", 200, "g", "g"],
    ["Lauch", 1, "Stange", "g"],
    ["Zwiebel", 1, "", "g"],
    ["Knoblauchzehen", 3, "", "g"],
    ["Lorbeerblätter", 2, "", "v"],
    ["Pfefferkörner", 1, "TL", "v"],
    ["Petersilie", 0.5, "Bund", "g"],
    ["Olivenöl", 2, "EL", "v"],
    ["Salz", 2, "TL", "v"]
  ],
  steps: [
    "Hähnchen salzen, mit Öl einreiben und bei 200 °C 40 Minuten rösten, bis die Haut braun ist — da sitzt der Geschmack.",
    "Hähnchen in einen großen Topf geben, den Bratensatz mit etwas Wasser lösen und dazugießen.",
    "Mit Wasser bedecken, halbierte Zwiebel, Lorbeer und Pfefferkörner zugeben.",
    "60 Minuten leise ziehen lassen, es darf nie sprudelnd kochen, sonst wird die Brühe trüb.",
    "Hähnchen herausnehmen, Fleisch ablösen. Brühe abseihen und salzen.",
    "Gemüse in Würfeln 10 Minuten in der Brühe garen, Fleisch zurückgeben, Petersilie darüber."
  ],
  tipp: "Die Hälfte der Brühe einfrieren, dann steht die nächste Suppe in 20 Minuten."
},
{
  id: "flammkuchen", name: "Flammkuchen", cat: "veg", win: "we",
  time: 40, kh: 0, ok: false,
  sub: "Rezept aus dem TM6 — kommt von dir.",
  todo: "TM6-Rezept",
  zut: [
    
  ],
  steps: [
    
  ],
  tipp: ""
},
{
  id: "chinesisch", name: "Chinesisch", cat: "fleisch", win: "alle",
  time: 30, kh: 0, ok: false,
  sub: "Platzhalter — wird spontan entschieden.",
  todo: "bewusst ohne Rezept",
  zut: [
    
  ],
  steps: [
    
  ],
  tipp: ""
},
{
  id: "lachsburger", name: "Lachsburger", cat: "fisch", win: "alle",
  time: 25, kh: 0, ok: false,
  sub: "Fünf Zutaten — Rezept kommt von dir.",
  todo: "Jamie Oliver, 5 Zutaten",
  zut: [
    
  ],
  steps: [
    
  ],
  tipp: ""
},
{
  id: "spaghetti", name: "Spaghetti mit Tomatensoße", cat: "veg", win: "we",
  time: 30, kh: 65, ok: false,
  sub: "Lange Sauce, kurzes Nudelwasser.",
  zut: [
    ["Spaghetti", 500, "g", "v"],
    ["passierte Tomaten", 800, "g", "v"],
    ["Zwiebel", 1, "", "g"],
    ["Knoblauchzehen", 3, "", "g"],
    ["Olivenöl", 4, "EL", "v"],
    ["Basilikum", 1, "Bund", "g"],
    ["Parmesan, gerieben", 80, "g", "m"],
    ["Salz", 2, "TL", "v"],
    ["Pfeffer", 0.5, "TL", "v"]
  ],
  steps: [
    "Zwiebel fein würfeln und in Olivenöl 5 Minuten glasig dünsten, Knoblauch 30 Sekunden mitdünsten.",
    "Passierte Tomaten zugeben, salzen und 20 Minuten offen köcheln — je länger, desto runder.",
    "Spaghetti in reichlich Salzwasser al dente kochen.",
    "Eine Tasse Nudelwasser aufheben, bevor du abgießt.",
    "Nudeln in die Sauce geben und mit etwas Nudelwasser binden.",
    "Basilikum erst abseits vom Herd zugeben, mit Parmesan servieren."
  ],
  tipp: "Unter der Woche: dieselbe Sauce über Zoodles oder Konjaknudeln."
},
{
  id: "schnitzel", name: "Schnitzel mit Salat", cat: "fleisch", win: "we",
  time: 35, kh: 30, ok: false,
  sub: "Panade schwimmen lassen, nicht andrücken.",
  zut: [
    ["Schweineschnitzel", 4, "", "f"],
    ["Mehl", 80, "g", "v"],
    ["Eier", 2, "", "m"],
    ["Semmelbrösel", 150, "g", "v"],
    ["Butterschmalz", 150, "g", "m"],
    ["Zitrone", 1, "", "g"],
    ["Blattsalat", 200, "g", "g"],
    ["Gurke", 1, "", "g"],
    ["Olivenöl", 3, "EL", "v"],
    ["Weißweinessig", 2, "EL", "v"],
    ["Salz", 1, "TL", "v"]
  ],
  steps: [
    "Schnitzel dünn klopfen, salzen.",
    "Der Reihe nach in Mehl, verquirltem Ei und Bröseln wenden, die Panade nur locker anlegen, nicht andrücken.",
    "Butterschmalz fingerhoch erhitzen — die Schnitzel müssen schwimmen, sonst wird die Panade nicht soufflierend.",
    "Je Seite 2–3 Minuten goldbraun backen, dabei die Pfanne leicht schwenken.",
    "Auf Küchenpapier abtropfen lassen.",
    "Salat mit Öl, Essig und Salz anmachen, Schnitzel mit Zitrone servieren."
  ],
  tipp: "Low-Carb-Variante für unter der Woche: nur mehlieren mit Mandelmehl, ohne Brösel."
},
{
  id: "fisch-paniert", name: "Panierter Fisch mit Salzkartoffeln", cat: "fisch", win: "we",
  time: 35, kh: 40, ok: false,
  sub: "Kabeljau, Butterschmalz, Zitrone.",
  zut: [
    ["Kabeljaufilet", 700, "g", "f"],
    ["Kartoffeln", 1000, "g", "g"],
    ["Mehl", 80, "g", "v"],
    ["Eier", 2, "", "m"],
    ["Semmelbrösel", 120, "g", "v"],
    ["Butterschmalz", 4, "EL", "m"],
    ["Zitrone", 1, "", "g"],
    ["Petersilie", 0.5, "Bund", "g"],
    ["Salz", 2, "TL", "v"]
  ],
  steps: [
    "Kartoffeln schälen und in Salzwasser 20 Minuten garen.",
    "Fisch trocken tupfen, salzen und mit Zitrone beträufeln.",
    "Nacheinander in Mehl, Ei und Bröseln wenden.",
    "In reichlich Butterschmalz je Seite 3–4 Minuten goldbraun braten, nur einmal wenden.",
    "Auf Küchenpapier abtropfen lassen.",
    "Mit Petersilienkartoffeln und Zitronenspalten servieren."
  ],
  tipp: "Unter der Woche: nur in Mandelmehl mehlieren, dazu Gurkensalat statt Kartoffeln."
},
{
  id: "wraps-bohnenmus", name: "Wraps mit Kidneybohnenmus", cat: "veg", win: "we",
  time: 25, kh: 45, ok: false,
  sub: "Bohnenmus mit Kreuzkümmel, alles kalt dazu.",
  zut: [
    ["Weizentortillas", 8, "", "v"],
    ["Kidneybohnen, Dose", 800, "g", "v"],
    ["Zwiebel", 1, "", "g"],
    ["Knoblauchzehen", 2, "", "g"],
    ["Kreuzkümmel, gemahlen", 2, "TL", "v"],
    ["Paprikapulver", 1, "TL", "v"],
    ["Tomatenmark", 2, "EL", "v"],
    ["Öl", 2, "EL", "v"],
    ["Eisbergsalat", 0.5, "Kopf", "g"],
    ["Tomaten", 2, "", "g"],
    ["Käse, gerieben", 150, "g", "m"],
    ["Sauerrahm", 200, "g", "m"],
    ["Limette", 1, "", "g"]
  ],
  steps: [
    "Zwiebel und Knoblauch in Öl anbraten.",
    "Kreuzkümmel, Paprikapulver und Tomatenmark zugeben und kurz mitrösten.",
    "Abgetropfte Bohnen mit einem Schuss Wasser zugeben und 10 Minuten köcheln.",
    "Grob zerstampfen, kräftig salzen und mit Limettensaft abschmecken.",
    "Tortillas kurz in der trockenen Pfanne erwärmen, sonst brechen sie beim Rollen.",
    "Belegen, straff aufrollen und halbieren."
  ],
  tipp: "Low-Carb-Variante: das Mus in große Eisbergblätter statt in Tortillas."
},
{
  id: "wrap-roellchen", name: "Wrap-Ofenröllchen", cat: "fleisch", win: "we",
  time: 35, kh: 35, ok: false,
  sub: "Gerollt, übergossen, überbacken.",
  zut: [
    ["Weizentortillas", 8, "", "v"],
    ["Hähnchenbrustfilet", 500, "g", "f"],
    ["Frischkäse", 200, "g", "m"],
    ["Paprika", 2, "", "g"],
    ["Käse, gerieben", 150, "g", "m"],
    ["Sahne", 100, "ml", "m"],
    ["passierte Tomaten", 200, "g", "v"],
    ["Paprikapulver", 2, "TL", "v"],
    ["Öl", 2, "EL", "v"],
    ["Salz", 1, "TL", "v"]
  ],
  steps: [
    "Hähnchen würfeln und in heißem Öl scharf anbraten, mit Paprikapulver und Salz würzen.",
    "Paprika in feine Streifen schneiden und kurz mitbraten.",
    "Alles mit Frischkäse mischen, die Masse soll streichfähig sein.",
    "Tortillas belegen, straff aufrollen und dicht nebeneinander in eine Auflaufform setzen.",
    "Sahne und passierte Tomaten verrühren, darüber gießen, mit Käse bestreuen.",
    "Bei 200 °C 20 Minuten backen, bis der Käse Farbe hat."
  ],
  tipp: "Funktioniert genauso mit Resten vom Hähnchen aus der Hühnersuppe."
},
{
  id: "bratwurst-carbonara", name: "Bratwurstcarbonara", cat: "fleisch", win: "we",
  time: 25, kh: 0, ok: false,
  sub: "Fünf Zutaten — Rezept kommt von dir.",
  todo: "Jamie Oliver, 5 Zutaten",
  zut: [
    
  ],
  steps: [
    
  ],
  tipp: ""
},
{
  id: "zoodles-pesto", name: "Zoodles mit Pesto", cat: "veg", win: "alle",
  time: 20, kh: 9, ok: false,
  sub: "Zucchini statt Nudeln, Pesto selbst gerührt.",
  zut: [
    ["Zucchini", 4, "", "g"],
    ["Basilikum", 1, "Bund", "g"],
    ["Pinienkerne", 60, "g", "v"],
    ["Parmesan, gerieben", 80, "g", "m"],
    ["Knoblauchzehen", 2, "", "g"],
    ["Olivenöl", 100, "ml", "v"],
    ["Kirschtomaten", 250, "g", "g"],
    ["Salz", 1, "TL", "v"]
  ],
  steps: [
    "Zucchini mit dem Spiralschneider zu Nudeln drehen, salzen und 10 Minuten in einem Sieb abtropfen lassen.",
    "Pinienkerne ohne Fett in der Pfanne goldbraun rösten und abkühlen lassen.",
    "Basilikum, Pinienkerne, Knoblauch, Parmesan und Öl zu einem groben Pesto mixen, salzen.",
    "Zoodles kräftig ausdrücken — je trockener, desto besser bindet das Pesto.",
    "In einer heißen Pfanne nur 2 Minuten schwenken, sie sollen Biss behalten.",
    "Vom Herd nehmen, Pesto und halbierte Kirschtomaten untermischen."
  ],
  tipp: "Pesto nie in der heißen Pfanne erhitzen, sonst wird das Basilikum bitter und grau."
},
{
  id: "haehnchen-brokkoli", name: "Hähnchen-Brokkoli-Pfanne", cat: "fleisch", win: "alle",
  time: 25, kh: 10, ok: false,
  sub: "Sesam, Sojasauce, alles in einer Pfanne.",
  zut: [
    ["Hähnchenbrustfilet", 600, "g", "f"],
    ["Brokkoli", 700, "g", "g"],
    ["Frühlingszwiebeln", 3, "", "g"],
    ["Knoblauchzehen", 2, "", "g"],
    ["Ingwer", 2, "cm", "g"],
    ["Sojasauce", 4, "EL", "v"],
    ["Sesamöl", 2, "EL", "v"],
    ["Sesam", 3, "EL", "v"],
    ["Öl", 2, "EL", "v"]
  ],
  steps: [
    "Brokkoli in kleine Röschen teilen und 3 Minuten in Salzwasser blanchieren, dann kalt abschrecken.",
    "Hähnchen in Streifen schneiden und in sehr heißem Öl portionsweise scharf anbraten.",
    "Knoblauch und geriebenen Ingwer kurz mitbraten, bis es duftet.",
    "Brokkoli zugeben und 3 Minuten mitbraten, er soll Röstspuren bekommen.",
    "Mit Sojasauce ablöschen und einmal durchschwenken.",
    "Vom Herd nehmen, Sesamöl, gerösteten Sesam und Frühlingszwiebelringe untermischen."
  ],
  tipp: "Das Blanchieren vorweg spart Zeit in der Pfanne und hält den Brokkoli grün statt grau."
},
{
  id: "rind-paprika-asia", name: "Rindfleischstreifen asiatisch", cat: "fleisch", win: "alle",
  time: 25, kh: 11, ok: false,
  sub: "Kurz gebraten, scharf abgeschmeckt.",
  zut: [
    ["Rinderminutensteaks", 600, "g", "f"],
    ["Paprika, rot", 2, "", "g"],
    ["Paprika, gelb", 1, "", "g"],
    ["Frühlingszwiebeln", 4, "", "g"],
    ["Knoblauchzehen", 3, "", "g"],
    ["Ingwer", 3, "cm", "g"],
    ["Sojasauce", 4, "EL", "v"],
    ["Chiliflocken", 1, "TL", "v"],
    ["Sesamöl", 2, "EL", "v"],
    ["Öl", 2, "EL", "v"]
  ],
  steps: [
    "Fleisch quer zur Faser in dünne Streifen schneiden und trocken tupfen.",
    "Paprika in Streifen, Frühlingszwiebeln in Stücke schneiden, Knoblauch und Ingwer fein hacken.",
    "Fleisch in sehr heißem Öl portionsweise je 1 Minute anbraten und herausnehmen.",
    "Paprika 3 Minuten braten, Knoblauch, Ingwer und Chili zugeben.",
    "Fleisch zurückgeben, mit Sojasauce ablöschen, einmal durchschwenken.",
    "Mit Sesamöl und Frühlingszwiebeln abschmecken."
  ],
  tipp: "Die Pfanne muss rauchend heiß sein und das Fleisch in Portionen hinein — sonst kocht es im eigenen Saft."
},
{
  id: "halloumi-zucchini", name: "Halloumi mit Zucchini", cat: "veg", win: "alle",
  time: 25, kh: 8, ok: false,
  sub: "Gegrillter Käse, Minze, Zitrone.",
  zut: [
    ["Halloumi", 400, "g", "m"],
    ["Zucchini", 3, "", "g"],
    ["Minze", 0.5, "Bund", "g"],
    ["Zitrone", 1, "", "g"],
    ["Olivenöl", 4, "EL", "v"],
    ["Kirschtomaten", 250, "g", "g"],
    ["Pinienkerne", 40, "g", "v"],
    ["Salz", 1, "TL", "v"]
  ],
  steps: [
    "Halloumi in fingerdicke Scheiben schneiden und trocken tupfen.",
    "Zucchini längs in Streifen hobeln, mit Öl und Salz mischen.",
    "Zucchini in einer Grillpfanne von beiden Seiten je 2 Minuten mit Streifen braten.",
    "Halloumi ohne zusätzliches Fett 2 Minuten je Seite goldbraun braten.",
    "Pinienkerne rösten, Kirschtomaten halbieren.",
    "Alles anrichten, mit Zitronensaft, Olivenöl und gezupfter Minze beträufeln."
  ],
  tipp: "Halloumi erst kurz vor dem Servieren braten, kalt wird er gummiartig."
},
{
  id: "shakshuka", name: "Shakshuka mit Feta", cat: "veg", win: "alle",
  time: 30, kh: 10, ok: false,
  sub: "Eier in Paprikasugo, direkt aus der Pfanne.",
  zut: [
    ["Eier", 8, "", "m"],
    ["Paprika, rot", 2, "", "g"],
    ["Zwiebel", 1, "", "g"],
    ["Knoblauchzehen", 3, "", "g"],
    ["stückige Tomaten", 500, "g", "v"],
    ["Feta", 200, "g", "m"],
    ["Kreuzkümmel, gemahlen", 1, "TL", "v"],
    ["Paprikapulver", 1, "TL", "v"],
    ["Chiliflocken", 0.5, "TL", "v"],
    ["Olivenöl", 3, "EL", "v"],
    ["Petersilie", 0.5, "Bund", "g"]
  ],
  steps: [
    "Zwiebel und Paprika in Streifen schneiden und in Olivenöl 8 Minuten weich schmoren.",
    "Knoblauch, Kreuzkümmel, Paprikapulver und Chili zugeben und kurz mitrösten.",
    "Tomaten zugeben, salzen und 10 Minuten offen einkochen, bis die Sauce dicklich ist.",
    "Mit einem Löffel acht Mulden eindrücken und je ein Ei hineingleiten lassen.",
    "Deckel auflegen und 6 bis 8 Minuten garen, bis das Eiweiß fest und das Eigelb noch weich ist.",
    "Feta darüber bröseln und mit Petersilie bestreuen."
  ],
  tipp: "Die Sauce lässt sich ohne Eier einfrieren, dann steht das Essen beim nächsten Mal in 10 Minuten."
},
{
  id: "garnelen-knoblauchbutter", name: "Garnelen in Knoblauchbutter", cat: "fisch", win: "alle",
  time: 20, kh: 5, ok: false,
  sub: "Fünf Minuten Pfanne, dazu Blattspinat.",
  zut: [
    ["Garnelen, geschält", 600, "g", "f"],
    ["Blattspinat", 400, "g", "g"],
    ["Butter", 80, "g", "m"],
    ["Knoblauchzehen", 4, "", "g"],
    ["Zitrone", 1, "", "g"],
    ["Chiliflocken", 0.5, "TL", "v"],
    ["Petersilie", 0.5, "Bund", "g"],
    ["Olivenöl", 2, "EL", "v"],
    ["Salz", 1, "TL", "v"]
  ],
  steps: [
    "Garnelen trocken tupfen und salzen.",
    "Butter mit Olivenöl erhitzen, Knoblauchscheiben und Chili darin 1 Minute ziehen lassen, ohne Farbe.",
    "Garnelen zugeben und je Seite 90 Sekunden braten, bis sie gerade undurchsichtig sind.",
    "Garnelen herausnehmen und den Spinat im Sud zusammenfallen lassen.",
    "Garnelen zurückgeben, mit Zitronensaft und Salz abschmecken.",
    "Mit Petersilie bestreuen und sofort servieren."
  ],
  tipp: "Garnelen sind fertig, sobald sie ein C bilden. Rollen sie sich zum O, sind sie zu lange in der Pfanne."
},
{
  id: "zucchini-lasagne", name: "Zucchini-Lasagne", cat: "fleisch", win: "alle",
  time: 55, kh: 9, ok: false,
  sub: "Lasagne ohne Platten, Zucchini übernimmt.",
  zut: [
    ["Zucchini", 3, "", "g"],
    ["Rinderhack", 500, "g", "f"],
    ["Zwiebel", 1, "", "g"],
    ["Knoblauchzehen", 2, "", "g"],
    ["passierte Tomaten", 400, "g", "v"],
    ["Tomatenmark", 2, "EL", "v"],
    ["Ricotta", 250, "g", "m"],
    ["Mozzarella", 250, "g", "m"],
    ["Parmesan, gerieben", 60, "g", "m"],
    ["Olivenöl", 2, "EL", "v"],
    ["Oregano", 1, "TL", "v"],
    ["Salz", 1, "TL", "v"]
  ],
  steps: [
    "Zucchini längs in 3 bis 4 Millimeter dünne Streifen hobeln, salzen und 10 Minuten Wasser ziehen lassen, danach trocken tupfen.",
    "Zwiebel und Knoblauch in Öl glasig dünsten, Hack zugeben und krümelig braun braten.",
    "Tomatenmark mitrösten, passierte Tomaten und Oregano zugeben, 10 Minuten einkochen.",
    "Abwechselnd Zucchini, Hacksauce und Ricotta schichten, mit Sauce abschließen.",
    "Bei 200 Grad 35 Minuten backen, die letzten 10 Minuten Mozzarella und Parmesan darauf verteilen.",
    "Vor dem Anschneiden 10 Minuten ruhen lassen."
  ],
  tipp: "Das Salzen der Zucchini ist der ganze Trick. Wer es überspringt, bekommt eine Suppe statt einer Lasagne."
},
{
  id: "blumenkohl-auflauf", name: "Blumenkohl-Käse-Auflauf", cat: "fleisch", win: "alle",
  time: 45, kh: 11, ok: false,
  sub: "Mit Schinken und viel Käse überbacken.",
  zut: [
    ["Blumenkohl", 1200, "g", "g"],
    ["Kochschinken", 200, "g", "f"],
    ["Sahne", 300, "ml", "m"],
    ["Frischkäse", 150, "g", "m"],
    ["Käse, gerieben", 200, "g", "m"],
    ["Muskat", 1, "Prise", "v"],
    ["Salz", 2, "TL", "v"],
    ["Pfeffer", 0.5, "TL", "v"]
  ],
  steps: [
    "Blumenkohl in Röschen teilen und 8 Minuten in Salzwasser kochen, er soll noch Biss haben.",
    "Gut abtropfen lassen und kurz ausdampfen, sonst wird der Auflauf wässrig.",
    "Sahne mit Frischkäse, Muskat, Salz und Pfeffer glatt rühren.",
    "Blumenkohl und Schinkenstreifen in eine Form schichten, Sauce darübergießen.",
    "Käse darüber streuen.",
    "Bei 200 Grad 25 Minuten backen, bis die Oberfläche goldbraun ist."
  ],
  tipp: "Ein Löffel Senf in der Sauce hebt den Käsegeschmack, ohne dass man ihn herausschmeckt."
},
{
  id: "haehnchen-caprese", name: "Hähnchen Caprese", cat: "fleisch", win: "alle",
  time: 30, kh: 6, ok: false,
  sub: "Tomate, Mozzarella, Basilikum, überbacken.",
  zut: [
    ["Hähnchenbrustfilet", 600, "g", "f"],
    ["Mozzarella", 250, "g", "m"],
    ["Tomaten", 3, "", "g"],
    ["Pesto, grün", 3, "EL", "v"],
    ["Basilikum", 1, "Bund", "g"],
    ["Rucola", 100, "g", "g"],
    ["Olivenöl", 2, "EL", "v"],
    ["Balsamico", 1, "EL", "v"],
    ["Salz", 1, "TL", "v"]
  ],
  steps: [
    "Filets längs halbieren oder flach klopfen, salzen und pfeffern.",
    "In Olivenöl je Seite 2 Minuten scharf anbraten, damit sie Farbe bekommen.",
    "In eine Auflaufform legen und je einen Löffel Pesto darauf streichen.",
    "Tomaten und Mozzarella in Scheiben dachziegelartig darauflegen.",
    "Bei 200 Grad 15 Minuten backen, bis der Käse geschmolzen ist.",
    "Mit Basilikum belegen und mit Rucola, Balsamico und Olivenöl servieren."
  ],
  tipp: "Tomatenscheiben vorher salzen und abtupfen, sonst sammelt sich Wasser in der Form."
},
{
  id: "moussaka-lowcarb", name: "Auberginen-Hack-Auflauf", cat: "fleisch", win: "alle",
  time: 60, kh: 12, ok: false,
  sub: "Moussaka ohne Kartoffel, mit Käsehaube.",
  zut: [
    ["Auberginen", 3, "", "g"],
    ["Lammhack", 600, "g", "f"],
    ["Zwiebel", 1, "", "g"],
    ["Knoblauchzehen", 3, "", "g"],
    ["stückige Tomaten", 400, "g", "v"],
    ["Zimt", 0.5, "TL", "v"],
    ["Oregano", 1, "TL", "v"],
    ["Sahne", 250, "ml", "m"],
    ["Eier", 2, "", "m"],
    ["Käse, gerieben", 150, "g", "m"],
    ["Olivenöl", 5, "EL", "v"],
    ["Salz", 2, "TL", "v"]
  ],
  steps: [
    "Auberginen in Scheiben schneiden, salzen und 15 Minuten Wasser ziehen lassen, dann trocken tupfen.",
    "Scheiben mit Öl bestreichen und im Ofen bei 220 Grad 15 Minuten vorbacken.",
    "Zwiebel und Knoblauch anbraten, Hack krümelig braun braten.",
    "Tomaten, Zimt und Oregano zugeben und 15 Minuten einkochen lassen.",
    "Auberginen und Hacksauce abwechselnd schichten.",
    "Sahne mit Eiern und Käse verquirlen, darüber gießen und bei 190 Grad 25 Minuten goldbraun backen."
  ],
  tipp: "Der halbe Teelöffel Zimt ist kein Fehler — er macht den Unterschied zur normalen Hacksauce."
},
{
  id: "gefuellte-paprika", name: "Gefüllte Paprika", cat: "fleisch", win: "alle",
  time: 50, kh: 14, ok: false,
  sub: "Hack und Feta statt Reis.",
  zut: [
    ["Paprika", 4, "", "g"],
    ["Rinderhack", 500, "g", "f"],
    ["Zwiebel", 1, "", "g"],
    ["Knoblauchzehen", 2, "", "g"],
    ["Feta", 150, "g", "m"],
    ["Blumenkohl", 300, "g", "g"],
    ["passierte Tomaten", 400, "g", "v"],
    ["Paprikapulver", 2, "TL", "v"],
    ["Olivenöl", 2, "EL", "v"],
    ["Salz", 1, "TL", "v"]
  ],
  steps: [
    "Blumenkohl im Mixer zu reiskorngroßen Stücken zerkleinern.",
    "Paprika am Stielansatz aufschneiden und entkernen.",
    "Zwiebel und Knoblauch anbraten, Hack zugeben und krümelig braten, mit Paprikapulver und Salz würzen.",
    "Blumenkohlreis und zerbröselten Feta untermischen.",
    "Paprika füllen, in eine Form setzen und die passierten Tomaten angießen.",
    "Zugedeckt bei 190 Grad 30 Minuten backen, danach 10 Minuten offen."
  ],
  tipp: "Die Deckel mitbacken und zum Servieren aufsetzen, das sieht nach mehr Mühe aus als es war."
},
{
  id: "wirsingrouladen", name: "Wirsingrouladen", cat: "fleisch", win: "alle",
  time: 60, kh: 10, ok: false,
  sub: "Klassisch gefüllt, in Rahmsauce geschmort.",
  zut: [
    ["Wirsing", 1, "Kopf", "g"],
    ["Rinderhack", 600, "g", "f"],
    ["Zwiebel", 1, "", "g"],
    ["Eier", 1, "", "m"],
    ["Mandelmehl", 40, "g", "v"],
    ["Speckwürfel", 100, "g", "f"],
    ["Gemüsebrühe", 300, "ml", "v"],
    ["Sahne", 200, "ml", "m"],
    ["Senf", 1, "TL", "v"],
    ["Salz", 2, "TL", "v"]
  ],
  steps: [
    "Acht große Wirsingblätter ablösen und 3 Minuten in Salzwasser blanchieren, kalt abschrecken.",
    "Die dicke Mittelrippe flach schneiden, sonst bricht das Blatt beim Rollen.",
    "Hack mit gewürfelter Zwiebel, Ei, Mandelmehl und Salz verkneten.",
    "Je zwei Blätter überlappend auslegen, Füllung daraufsetzen, Seiten einschlagen und aufrollen.",
    "Rouladen mit Speck in einem Bräter rundum anbraten, mit Brühe ablöschen.",
    "Zugedeckt 30 Minuten schmoren, Sahne und Senf einrühren und die Sauce offen einkochen."
  ],
  tipp: "Mit Küchengarn binden oder mit Zahnstochern feststecken, sonst gehen sie im Bräter auf."
},
{
  id: "koenigsberger-klopse", name: "Königsberger Klopse", cat: "fleisch", win: "alle",
  time: 45, kh: 9, ok: false,
  sub: "Kapernsauce, gebunden mit Frischkäse.",
  zut: [
    ["Hackfleisch, gemischt", 600, "g", "f"],
    ["Zwiebel", 1, "", "g"],
    ["Eier", 1, "", "m"],
    ["Mandelmehl", 40, "g", "v"],
    ["Sardellenfilets", 2, "", "v"],
    ["Gemüsebrühe", 800, "ml", "v"],
    ["Kapern", 3, "EL", "v"],
    ["Sahne", 200, "ml", "m"],
    ["Frischkäse", 100, "g", "m"],
    ["Zitrone", 1, "", "g"],
    ["Lorbeerblätter", 2, "", "v"],
    ["Salz", 1, "TL", "v"]
  ],
  steps: [
    "Hack mit Zwiebelwürfeln, Ei, Mandelmehl, gehackten Sardellen und Salz verkneten.",
    "Mit feuchten Händen Klopse formen.",
    "Brühe mit Lorbeer aufkochen, Hitze reduzieren und die Klopse 15 Minuten ziehen lassen, nicht kochen.",
    "Klopse herausnehmen, Brühe auf die Hälfte einkochen.",
    "Sahne und Frischkäse einrühren, mit Kapern und Zitronensaft abschmecken.",
    "Klopse zurück in die Sauce geben und ziehen lassen."
  ],
  tipp: "Die beiden Sardellen schmeckt niemand heraus, sie geben der Sauce aber den herzhaften Boden."
},
{
  id: "rahmschnitzel", name: "Rahmschnitzel ohne Panade", cat: "fleisch", win: "alle",
  time: 30, kh: 7, ok: false,
  sub: "Nur mehliert, dafür viel Pilzrahm.",
  zut: [
    ["Schweineschnitzel", 4, "", "f"],
    ["Champignons", 400, "g", "g"],
    ["Zwiebel", 1, "", "g"],
    ["Sahne", 250, "ml", "m"],
    ["Gemüsebrühe", 150, "ml", "v"],
    ["Frischkäse", 80, "g", "m"],
    ["Mandelmehl", 3, "EL", "v"],
    ["Butterschmalz", 2, "EL", "m"],
    ["Petersilie", 0.5, "Bund", "g"],
    ["Salz", 1, "TL", "v"]
  ],
  steps: [
    "Schnitzel flach klopfen, salzen und dünn in Mandelmehl wenden.",
    "In heißem Butterschmalz je Seite 3 Minuten braten, herausnehmen und warm stellen.",
    "Champignons in Scheiben in derselben Pfanne braten, bis das Wasser verdampft ist.",
    "Zwiebelwürfel zugeben und glasig dünsten.",
    "Mit Brühe ablöschen, Sahne und Frischkäse einrühren, 5 Minuten einkochen.",
    "Schnitzel zurücklegen, kurz ziehen lassen, mit Petersilie bestreuen."
  ],
  tipp: "Pilze brauchen Platz. Zu viele auf einmal in der Pfanne, und sie kochen statt zu braten."
},
{
  id: "hackbraten-speck", name: "Hackbraten im Speckmantel", cat: "fleisch", win: "alle",
  time: 70, kh: 8, ok: false,
  sub: "Eine Form, eine Stunde Ofen.",
  zut: [
    ["Hackfleisch, gemischt", 1000, "g", "f"],
    ["Bacon", 150, "g", "f"],
    ["Zwiebel", 1, "", "g"],
    ["Eier", 2, "", "m"],
    ["Mandelmehl", 60, "g", "v"],
    ["Senf", 2, "EL", "v"],
    ["Paprikapulver", 2, "TL", "v"],
    ["Käse, gerieben", 100, "g", "m"],
    ["Salz", 2, "TL", "v"]
  ],
  steps: [
    "Zwiebel fein würfeln und in etwas Öl glasig dünsten, abkühlen lassen.",
    "Hack mit Eiern, Mandelmehl, Senf, Zwiebel, Paprikapulver und Salz gründlich verkneten.",
    "Käse unterheben und einen Laib formen.",
    "Baconscheiben überlappend darüberlegen, sodass der Laib ganz bedeckt ist.",
    "Bei 180 Grad 50 Minuten backen.",
    "10 Minuten ruhen lassen, erst dann schneiden."
  ],
  tipp: "Eine Kerntemperatur von 70 Grad ist der sichere Punkt — darüber wird der Braten trocken."
},
{
  id: "frikadellen-gurkensalat", name: "Frikadellen mit Gurkensalat", cat: "fleisch", win: "alle",
  time: 35, kh: 7, ok: false,
  sub: "Ohne Brötchen, mit Rahmgurken.",
  zut: [
    ["Hackfleisch, gemischt", 700, "g", "f"],
    ["Zwiebel", 1, "", "g"],
    ["Eier", 1, "", "m"],
    ["Mandelmehl", 50, "g", "v"],
    ["Senf", 1, "EL", "v"],
    ["Majoran", 1, "TL", "v"],
    ["Salatgurke", 1, "", "g"],
    ["Sauerrahm", 200, "g", "m"],
    ["Dill", 0.5, "Bund", "g"],
    ["Essig", 2, "EL", "v"],
    ["Butterschmalz", 2, "EL", "m"],
    ["Salz", 2, "TL", "v"]
  ],
  steps: [
    "Gurke hobeln, salzen und 15 Minuten Wasser ziehen lassen, dann ausdrücken.",
    "Sauerrahm mit Essig, gehacktem Dill und Salz verrühren und die Gurke untermischen.",
    "Hack mit Zwiebel, Ei, Mandelmehl, Senf, Majoran und Salz verkneten.",
    "Flache Frikadellen formen, dann garen sie gleichmäßig durch.",
    "In Butterschmalz bei mittlerer Hitze je Seite 5 Minuten braten.",
    "Mit dem Gurkensalat servieren."
  ],
  tipp: "Mittlere Hitze und Geduld. Zu heiß, und die Frikadelle ist außen dunkel und innen roh."
},
{
  id: "kasseler-sauerkraut", name: "Kasseler mit Sauerkraut", cat: "fleisch", win: "alle",
  time: 40, kh: 11, ok: false,
  sub: "Rahmwirsing dazu, fertig.",
  zut: [
    ["Kasseler, ausgelöst", 800, "g", "f"],
    ["Sauerkraut", 500, "g", "v"],
    ["Wirsing", 400, "g", "g"],
    ["Zwiebel", 1, "", "g"],
    ["Sahne", 200, "ml", "m"],
    ["Wacholderbeeren", 5, "", "v"],
    ["Lorbeerblätter", 1, "", "v"],
    ["Butter", 40, "g", "m"],
    ["Gemüsebrühe", 200, "ml", "v"],
    ["Salz", 1, "TL", "v"]
  ],
  steps: [
    "Sauerkraut mit Zwiebelwürfeln, Wacholder, Lorbeer und Brühe aufsetzen und 25 Minuten köcheln.",
    "Wirsing in feine Streifen schneiden.",
    "Kasseler in dicke Scheiben schneiden und in Butter von beiden Seiten anbraten, nur erwärmen.",
    "Wirsing in Butter 5 Minuten dünsten, Sahne angießen und einkochen lassen.",
    "Mit Salz und Muskat abschmecken.",
    "Kasseler auf Sauerkraut und Rahmwirsing anrichten."
  ],
  tipp: "Kasseler ist bereits gegart. Wer es kocht, bekommt trockenes Fleisch — es soll nur heiß werden."
},
{
  id: "blumenkohl-pizza", name: "Pizza auf Blumenkohlboden", cat: "veg", win: "alle",
  time: 50, kh: 14, ok: false,
  sub: "Der Boden wird ausgedrückt, nicht geknetet.",
  zut: [
    ["Blumenkohl", 1000, "g", "g"],
    ["Eier", 2, "", "m"],
    ["Mozzarella", 250, "g", "m"],
    ["Parmesan, gerieben", 80, "g", "m"],
    ["passierte Tomaten", 200, "g", "v"],
    ["Oregano", 2, "TL", "v"],
    ["Kirschtomaten", 200, "g", "g"],
    ["Basilikum", 0.5, "Bund", "g"],
    ["Salz", 1, "TL", "v"]
  ],
  steps: [
    "Blumenkohl im Mixer fein zerkleinern und 5 Minuten in der Mikrowelle oder im Topf garen.",
    "Abkühlen lassen und in einem Küchentuch so trocken wie möglich auswringen — das entscheidet alles.",
    "Mit Eiern, Parmesan und Salz vermengen und auf Backpapier dünn ausstreichen.",
    "Bei 220 Grad 20 Minuten vorbacken, bis der Rand bräunt.",
    "Passierte Tomaten mit Oregano und Salz würzen, dünn aufstreichen.",
    "Mozzarella und Kirschtomaten darauf, weitere 10 Minuten backen, mit Basilikum servieren."
  ],
  tipp: "Aus einem Kilo Blumenkohl kommt erstaunlich viel Wasser. Wringen, bis wirklich nichts mehr tropft."
},
{
  id: "caesar-salat", name: "Caesar Salat mit Hähnchen", cat: "fleisch", win: "alle",
  time: 25, kh: 6, ok: false,
  sub: "Ohne Croûtons, dafür mit Parmesanchips.",
  zut: [
    ["Hähnchenbrustfilet", 500, "g", "f"],
    ["Römersalat", 2, "Kopf", "g"],
    ["Parmesan, gerieben", 120, "g", "m"],
    ["Mayonnaise", 150, "g", "v"],
    ["Sardellenfilets", 4, "", "v"],
    ["Knoblauchzehen", 1, "", "g"],
    ["Zitrone", 1, "", "g"],
    ["Senf", 1, "TL", "v"],
    ["Olivenöl", 2, "EL", "v"],
    ["Salz", 1, "TL", "v"]
  ],
  steps: [
    "Für die Chips 80 g Parmesan in kleinen Häufchen auf Backpapier verteilen und bei 200 Grad 6 Minuten backen, dann abkühlen lassen.",
    "Hähnchen salzen und in Olivenöl je Seite 4 Minuten braten, 5 Minuten ruhen lassen.",
    "Sardellen, Knoblauch, Senf, Zitronensaft und Mayonnaise zu einem glatten Dressing mixen.",
    "Salat in breite Streifen schneiden und mit dem Dressing mischen.",
    "Hähnchen aufschneiden und daraufgeben.",
    "Restlichen Parmesan und die gebrochenen Chips darüber verteilen."
  ],
  tipp: "Die Parmesanchips ersetzen das Knusprige der Croûtons vollständig und halten in der Dose eine Woche."
},
{
  id: "gyrossalat", name: "Gyrossalat", cat: "fleisch", win: "alle",
  time: 30, kh: 9, ok: false,
  sub: "Mit Feta und Tzatziki.",
  zut: [
    ["Schweinenacken", 600, "g", "f"],
    ["Gyrosgewürz", 2, "EL", "v"],
    ["Eisbergsalat", 1, "Kopf", "g"],
    ["Tomaten", 3, "", "g"],
    ["rote Zwiebel", 1, "", "g"],
    ["Feta", 200, "g", "m"],
    ["Salatgurke", 1, "", "g"],
    ["Naturjoghurt", 300, "g", "m"],
    ["Knoblauchzehen", 2, "", "g"],
    ["Olivenöl", 3, "EL", "v"],
    ["Salz", 1, "TL", "v"]
  ],
  steps: [
    "Fleisch in dünne Streifen schneiden, mit Gyrosgewürz und Öl mischen und 15 Minuten ziehen lassen.",
    "Für das Tzatziki die Gurke raspeln, salzen, ausdrücken und mit Joghurt und gepresstem Knoblauch verrühren.",
    "Fleisch in einer sehr heißen Pfanne portionsweise braun braten.",
    "Salat, Tomaten und Zwiebelringe in einer Schüssel mischen.",
    "Fleisch darauf verteilen und Feta darüber bröseln.",
    "Tzatziki dazu reichen."
  ],
  tipp: "Die Gurke fürs Tzatziki wirklich kräftig ausdrücken, sonst schwimmt der Salat nach zehn Minuten."
},
{
  id: "thunfischsalat-avocado", name: "Thunfischsalat mit Avocado", cat: "fisch", win: "alle",
  time: 15, kh: 6, ok: false,
  sub: "Vorratskammer trifft Kühlschrank.",
  zut: [
    ["Thunfisch, Dose", 300, "g", "v"],
    ["Avocado", 2, "", "g"],
    ["Eier", 4, "", "m"],
    ["Blattsalat", 150, "g", "g"],
    ["rote Zwiebel", 1, "", "g"],
    ["Kirschtomaten", 200, "g", "g"],
    ["Mayonnaise", 80, "g", "v"],
    ["Zitrone", 1, "", "g"],
    ["Olivenöl", 2, "EL", "v"],
    ["Salz", 1, "TL", "v"]
  ],
  steps: [
    "Eier 8 Minuten kochen, abschrecken und vierteln.",
    "Thunfisch abtropfen lassen und mit Mayonnaise und Zitronensaft verrühren.",
    "Avocado würfeln und sofort mit Zitrone beträufeln, damit sie nicht braun wird.",
    "Salat, halbierte Tomaten und Zwiebelringe auf Tellern anrichten.",
    "Thunfischcreme, Avocado und Eier darauf verteilen.",
    "Mit Olivenöl und Salz abschmecken."
  ],
  tipp: "Steht in einer Viertelstunde und funktioniert auch als Mitnehmessen, wenn die Avocado separat bleibt."
},
{
  id: "tafelspitzsalat", name: "Tafelspitzsalat", cat: "fleisch", win: "alle",
  time: 20, kh: 7, ok: false,
  sub: "Für übrig gebliebenen Braten, mit Kürbiskernöl.",
  zut: [
    ["Tafelspitz, gegart", 500, "g", "f"],
    ["Blattsalat", 200, "g", "g"],
    ["rote Zwiebel", 1, "", "g"],
    ["Kürbiskerne", 50, "g", "v"],
    ["Kürbiskernöl", 4, "EL", "v"],
    ["Apfelessig", 3, "EL", "v"],
    ["Senf", 1, "TL", "v"],
    ["Schnittlauch", 0.5, "Bund", "g"],
    ["Salz", 1, "TL", "v"]
  ],
  steps: [
    "Fleisch in sehr dünne Scheiben schneiden, am besten kalt direkt aus dem Kühlschrank.",
    "Zwiebel in hauchdünne Ringe schneiden und 5 Minuten in Essig ziehen lassen, das nimmt die Schärfe.",
    "Kürbiskerne ohne Fett rösten.",
    "Aus Essig, Senf, Kürbiskernöl und Salz ein Dressing rühren.",
    "Fleisch, Salat und Zwiebeln locker mischen und das Dressing darübergeben.",
    "Mit Kernen und Schnittlauch bestreuen."
  ],
  tipp: "Funktioniert mit jedem Rest von Rinderbraten, Sous-Vide-Rindfleisch oder Kasseler."
},
{
  id: "ziegenkaese-salat", name: "Ziegenkäse-Walnuss-Salat", cat: "veg", win: "alle",
  time: 25, kh: 15, ok: false,
  sub: "Mit Roter Bete und Honigsenf.",
  zut: [
    ["Ziegenkäserolle", 300, "g", "m"],
    ["Rote Bete, gegart", 300, "g", "g"],
    ["Feldsalat", 150, "g", "g"],
    ["Walnüsse", 80, "g", "v"],
    ["Honig", 1, "EL", "v"],
    ["Senf", 1, "TL", "v"],
    ["Balsamico", 3, "EL", "v"],
    ["Olivenöl", 4, "EL", "v"],
    ["Salz", 1, "TL", "v"]
  ],
  steps: [
    "Ziegenkäse in acht Scheiben schneiden und auf ein Blech legen.",
    "Mit etwas Honig beträufeln und unter dem Grill 4 Minuten überbacken, bis er Farbe nimmt.",
    "Walnüsse grob hacken und ohne Fett rösten.",
    "Rote Bete in Spalten schneiden.",
    "Dressing aus Balsamico, Senf, Olivenöl und Salz rühren.",
    "Feldsalat und Rote Bete anrichten, Käse und Nüsse darauf verteilen."
  ],
  tipp: "Rote Bete bringt die meisten Kohlenhydrate dieser Karte mit. In dieser Menge bleibt es im Rahmen."
},
{
  id: "wurstsalat", name: "Wurstsalat mit Bergkäse", cat: "fleisch", win: "alle",
  time: 15, kh: 6, ok: false,
  sub: "Schweizer Art, ohne Kochen.",
  zut: [
    ["Lyoner", 400, "g", "f"],
    ["Bergkäse", 200, "g", "m"],
    ["rote Zwiebel", 1, "", "g"],
    ["Gewürzgurken", 4, "", "v"],
    ["Essig", 4, "EL", "v"],
    ["Öl", 5, "EL", "v"],
    ["Senf", 1, "TL", "v"],
    ["Schnittlauch", 0.5, "Bund", "g"],
    ["Salz", 1, "TL", "v"]
  ],
  steps: [
    "Wurst und Käse in schmale Streifen schneiden.",
    "Zwiebel in feine Ringe, Gewürzgurken in Scheiben schneiden.",
    "Aus Essig, Senf, Öl und Salz ein kräftiges Dressing rühren.",
    "Alles mischen und mindestens 20 Minuten durchziehen lassen.",
    "Vor dem Servieren noch einmal abschmecken, Salz und Säure verlieren sich beim Ziehen.",
    "Mit Schnittlauch bestreuen."
  ],
  tipp: "Schmeckt am nächsten Tag besser. Gleich die doppelte Menge machen."
},
{
  id: "kaese-lauch-suppe", name: "Käse-Lauch-Suppe", cat: "suppe", win: "alle",
  time: 30, kh: 12, ok: false,
  sub: "Der Klassiker mit Hackfleisch.",
  zut: [
    ["Rinderhack", 500, "g", "f"],
    ["Lauch", 3, "Stange", "g"],
    ["Zwiebel", 1, "", "g"],
    ["Schmelzkäse", 300, "g", "m"],
    ["Sahne", 200, "ml", "m"],
    ["Gemüsebrühe", 1000, "ml", "v"],
    ["Öl", 2, "EL", "v"],
    ["Paprikapulver", 2, "TL", "v"],
    ["Salz", 1, "TL", "v"]
  ],
  steps: [
    "Hack in Öl krümelig braun braten und mit Paprikapulver und Salz würzen.",
    "Zwiebelwürfel zugeben und glasig dünsten.",
    "Lauch in Ringe schneiden, gründlich waschen und 3 Minuten mitdünsten.",
    "Mit Brühe ablöschen und 10 Minuten köcheln lassen.",
    "Hitze reduzieren und den Schmelzkäse löffelweise einrühren, bis er aufgelöst ist.",
    "Sahne zugeben und abschmecken, nicht mehr kochen lassen."
  ],
  tipp: "Lauchringe in eine Schüssel Wasser geben und umrühren, dann sinkt der Sand nach unten."
},
{
  id: "kuerbissuppe-ingwer", name: "Kürbissuppe mit Ingwer", cat: "suppe", win: "alle",
  time: 35, kh: 16, ok: false,
  sub: "Hokkaido mit Schale, Kokos und Limette.",
  zut: [
    ["Hokkaido-Kürbis", 1200, "g", "g"],
    ["Zwiebel", 1, "", "g"],
    ["Ingwer", 3, "cm", "g"],
    ["Kokosmilch", 400, "ml", "v"],
    ["Gemüsebrühe", 700, "ml", "v"],
    ["Limette", 1, "", "g"],
    ["Kürbiskerne", 40, "g", "v"],
    ["Olivenöl", 2, "EL", "v"],
    ["Salz", 2, "TL", "v"]
  ],
  steps: [
    "Kürbis halbieren, entkernen und mit Schale in Würfel schneiden.",
    "Zwiebel und geriebenen Ingwer in Öl anschwitzen.",
    "Kürbis zugeben, kurz mitbraten und mit Brühe auffüllen.",
    "20 Minuten weich kochen.",
    "Kokosmilch zugeben und fein pürieren.",
    "Mit Limettensaft und Salz abschmecken, mit gerösteten Kürbiskernen servieren."
  ],
  tipp: "Hokkaido muss nicht geschält werden, die Schale wird beim Kochen weich und gibt Farbe."
},
{
  id: "tom-kha-gai", name: "Tom Kha Gai", cat: "suppe", win: "alle",
  time: 30, kh: 9, ok: false,
  sub: "Kokos-Hühnersuppe, sauer und scharf.",
  zut: [
    ["Hähnchenbrustfilet", 500, "g", "f"],
    ["Kokosmilch", 800, "ml", "v"],
    ["Hühnerbrühe", 400, "ml", "v"],
    ["Champignons", 250, "g", "g"],
    ["Zitronengras", 2, "Stange", "g"],
    ["Ingwer", 4, "cm", "g"],
    ["Limette", 2, "", "g"],
    ["Fischsauce", 3, "EL", "v"],
    ["Chilischoten", 2, "", "g"],
    ["Koriander", 0.5, "Bund", "g"]
  ],
  steps: [
    "Zitronengras andrücken und in Stücke schneiden, Ingwer in Scheiben schneiden.",
    "Kokosmilch mit Brühe, Zitronengras und Ingwer aufsetzen und 10 Minuten leise ziehen lassen.",
    "Die groben Stücke herausfischen, sie haben ihren Geschmack abgegeben.",
    "Hähnchen in Streifen und Champignons in Scheiben zugeben, 8 Minuten garen.",
    "Mit Fischsauce, Limettensaft und zerdrückten Chilis abschmecken.",
    "Mit Koriander servieren."
  ],
  tipp: "Die Suppe nach dem Zugeben der Kokosmilch nicht mehr sprudelnd kochen, sonst flockt sie."
},
{
  id: "krautsuppe-hack", name: "Krautsuppe mit Hackfleisch", cat: "suppe", win: "alle",
  time: 40, kh: 11, ok: false,
  sub: "Ein Topf, hält zwei Tage.",
  zut: [
    ["Weißkohl", 800, "g", "g"],
    ["Rinderhack", 500, "g", "f"],
    ["Zwiebel", 1, "", "g"],
    ["Paprika, rot", 1, "", "g"],
    ["stückige Tomaten", 400, "g", "v"],
    ["Gemüsebrühe", 1000, "ml", "v"],
    ["Paprikapulver", 2, "TL", "v"],
    ["Kümmel", 1, "TL", "v"],
    ["Öl", 2, "EL", "v"],
    ["Salz", 2, "TL", "v"]
  ],
  steps: [
    "Hack in Öl krümelig braun braten und herausnehmen.",
    "Zwiebelwürfel und Paprikastreifen im Bratfett andünsten.",
    "Weißkohl in feine Streifen schneiden und 5 Minuten mitdünsten.",
    "Paprikapulver und Kümmel zugeben, Tomaten und Brühe angießen.",
    "20 Minuten köcheln lassen, bis der Kohl weich ist.",
    "Hack zurückgeben und kräftig abschmecken."
  ],
  tipp: "Ein Schuss Essig am Ende macht die Suppe runder, ohne dass sie sauer schmeckt."
},
{
  id: "brokkoli-cheddar-suppe", name: "Brokkoli-Cheddar-Suppe", cat: "suppe", win: "alle",
  time: 30, kh: 10, ok: false,
  sub: "Cremig ohne Mehlschwitze.",
  zut: [
    ["Brokkoli", 900, "g", "g"],
    ["Cheddar, gerieben", 250, "g", "m"],
    ["Zwiebel", 1, "", "g"],
    ["Sahne", 200, "ml", "m"],
    ["Frischkäse", 100, "g", "m"],
    ["Gemüsebrühe", 800, "ml", "v"],
    ["Butter", 40, "g", "m"],
    ["Muskat", 1, "Prise", "v"],
    ["Salz", 1, "TL", "v"]
  ],
  steps: [
    "Zwiebel in Butter glasig dünsten.",
    "Brokkoli in Röschen teilen, Stiele schälen und würfeln, alles zugeben.",
    "Mit Brühe auffüllen und 12 Minuten kochen.",
    "Ein Drittel der Röschen herausnehmen und beiseitestellen.",
    "Rest pürieren, Sahne und Frischkäse einrühren.",
    "Topf vom Herd ziehen, Cheddar einrühren und die Röschen zurückgeben."
  ],
  tipp: "Käse immer abseits vom Herd einrühren. Kocht er, wird die Suppe fädig."
},
{
  id: "zucchini-cremesuppe", name: "Zucchini-Cremesuppe", cat: "suppe", win: "alle",
  time: 25, kh: 8, ok: false,
  sub: "Vier Zutaten, zwanzig Minuten.",
  zut: [
    ["Zucchini", 1000, "g", "g"],
    ["Zwiebel", 1, "", "g"],
    ["Frischkäse", 200, "g", "m"],
    ["Gemüsebrühe", 700, "ml", "v"],
    ["Knoblauchzehen", 2, "", "g"],
    ["Olivenöl", 3, "EL", "v"],
    ["Basilikum", 0.5, "Bund", "g"],
    ["Salz", 1, "TL", "v"]
  ],
  steps: [
    "Zwiebel und Knoblauch in Olivenöl anschwitzen.",
    "Zucchini würfeln und 5 Minuten mitdünsten, bis sie Farbe nehmen.",
    "Mit Brühe auffüllen und 10 Minuten kochen.",
    "Frischkäse zugeben und fein pürieren.",
    "Mit Salz und Pfeffer abschmecken.",
    "Mit Basilikum und einem Faden Olivenöl servieren."
  ],
  tipp: "Zucchini vorher anbräunen statt nur zu kochen, das ist der Unterschied zwischen fad und würzig."
}
];
