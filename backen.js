/* ============================================================
   Týden — backen.js
   Backen: Rezepte ohne Wochenstruktur. Auswählen, Anzahl der
   Fuhren festlegen, eigener Einkaufszettel. Gedacht für
   Plätzchenbacken, Brot und Brötchen.
   ============================================================ */

const BCATS = {
  plaetzchen: {n:"Plätzchen",        c:"#8A3C2E"},
  brot:       {n:"Brot & Brötchen",  c:"#6B4A1F"}
};

/* zut = [Name, Menge, Einheit, Warengruppe g|f|m|v|s] — wie bei den Gerichten.
   Die Mengen gelten für ein Blech bzw. einen Laib; der Faktor im Tab
   vervielfacht sie. */
const BACKEN_BASE = [

/* ---------------- Plätzchen ---------------- */
{id:"b-muerbteig", name:"Mürbteigplätzchen", cat:"plaetzchen", time:90, ergebnis:"ca. 60 Stück",
 sub:"Das Grundrezept zum Ausstechen, kalt verarbeitet.",
 zut:[["Mehl",300,"g","v"],["Butter",200,"g","m"],["Zucker",100,"g","v"],["Eier",1,"","m"],
      ["Vanillezucker",1,"Päckchen","v"],["Salz",1,"Prise","v"],["Puderzucker",150,"g","v"],
      ["Zitrone",1,"","g"],["Zuckerperlen",50,"g","v"]],
 steps:["Mehl, Zucker, Vanillezucker und Salz mischen, kalte Butter in Stücken und das Ei zugeben.",
        "Zügig zu einem glatten Teig verkneten, nicht länger als nötig, sonst wird er zäh.",
        "In Folie gewickelt mindestens eine Stunde kalt stellen, besser über Nacht.",
        "Portionsweise 3 bis 4 Millimeter dünn ausrollen und ausstechen, den Rest wieder kühlen.",
        "Bei 180 Grad Ober- und Unterhitze 8 bis 10 Minuten backen, bis die Ränder gerade bräunen.",
        "Puderzucker mit Zitronensaft glatt rühren, die ausgekühlten Plätzchen bestreichen und verzieren."],
 tipp:"Der Teig muss wirklich kalt sein. Warmer Mürbteig klebt, reißt und verliert beim Backen die Form."},

{id:"b-vanillekipferl", name:"Vanillekipferl", cat:"plaetzchen", time:75, ergebnis:"ca. 50 Stück",
 sub:"Mürbe, mandelig, noch warm im Zucker gewälzt.",
 zut:[["Mehl",250,"g","v"],["Butter",200,"g","m"],["gemahlene Mandeln",100,"g","v"],
      ["Zucker",80,"g","v"],["Eigelb",2,"","m"],["Vanilleschote",1,"","v"],
      ["Puderzucker",80,"g","v"],["Vanillezucker",2,"Päckchen","v"],["Salz",1,"Prise","v"]],
 steps:["Mehl, Mandeln, Zucker, Vanillemark und Salz mischen, kalte Butter und Eigelbe einarbeiten.",
        "Zu einem glatten Teig kneten und eine Stunde kalt stellen.",
        "Fingerdicke Rollen formen, Stücke abschneiden und zu Hörnchen biegen, die Enden dünner auslaufen lassen.",
        "Bei 170 Grad 12 bis 14 Minuten backen, sie sollen hell bleiben.",
        "Puderzucker und Vanillezucker mischen.",
        "Die Kipferl noch lauwarm vorsichtig darin wälzen, dann bleibt der Zucker haften."],
 tipp:"Kalt reißen sie beim Wälzen, heiß zerbrechen sie. Zwei Minuten nach dem Ofen ist der richtige Moment."},

{id:"b-nussberge", name:"Nussberge", cat:"plaetzchen", time:45, ergebnis:"ca. 40 Stück",
 sub:"Vier Zutaten, kein Teig zum Kneten.",
 zut:[["gemahlene Haselnüsse",250,"g","v"],["Zucker",150,"g","v"],["Eier",2,"","m"],
      ["Zimt",1,"TL","v"],["Zartbitterkuvertüre",150,"g","v"],["ganze Haselnüsse",40,"g","v"],
      ["Salz",1,"Prise","v"]],
 steps:["Eier mit Zucker und Salz schaumig schlagen, bis die Masse hell ist.",
        "Nüsse und Zimt unterheben, die Masse soll zähflüssig vom Löffel fallen.",
        "15 Minuten quellen lassen, dann bindet sie besser.",
        "Mit zwei Teelöffeln kleine Häufchen auf Backpapier setzen, sie laufen kaum auseinander.",
        "Bei 160 Grad Umluft 15 Minuten backen, außen fest, innen noch weich.",
        "Kuvertüre schmelzen, die Spitzen eintauchen und je eine Nuss aufsetzen."],
 tipp:"Ohne Mehl und ohne Butter — das einzige Plätzchen, das auch kurzfristig noch geht."},

{id:"b-macarons", name:"Macarons", cat:"plaetzchen", time:120, ergebnis:"ca. 30 Doppelte",
 sub:"Geduldssache: wiegen, sieben, ruhen lassen.",
 zut:[["gemahlene Mandeln",125,"g","v"],["Puderzucker",125,"g","v"],["Eiweiß",90,"g","m"],
      ["Zucker",110,"g","v"],["Wasser",30,"ml","v"],["Lebensmittelfarbe",1,"Prise","v"],
      ["Butter",100,"g","m"],["weiße Kuvertüre",100,"g","v"],["Sahne",50,"ml","m"]],
 steps:["Mandeln und Puderzucker zweimal durch ein feines Sieb geben, grobe Reste wegwerfen.",
        "Die Hälfte des Eiweißes untermischen, es entsteht eine feste Paste.",
        "Zucker mit Wasser auf 118 Grad kochen und in das aufgeschlagene restliche Eiweiß gießen, weiterschlagen bis handwarm.",
        "Baiser unter die Paste heben, bis die Masse in breiten Bändern vom Schaber fällt, dann aufhören.",
        "Tupfen aufspritzen, das Blech aufklopfen und 30 bis 60 Minuten ruhen lassen, bis die Oberfläche trocken ist.",
        "Bei 150 Grad 13 Minuten backen, auskühlen lassen und mit der Ganache aus Kuvertüre, Sahne und Butter füllen."],
 tipp:"Die Ruhezeit ist nicht verhandelbar. Ohne trockene Haut reißt die Oberfläche, statt den typischen Fuß zu bilden."},

{id:"b-zimtsterne", name:"Zimtsterne", cat:"plaetzchen", time:90, ergebnis:"ca. 45 Stück",
 sub:"Ohne Mehl, mit weißer Baiserdecke.",
 zut:[["gemahlene Mandeln",300,"g","v"],["Puderzucker",250,"g","v"],["Eiweiß",3,"","m"],
      ["Zimt",2,"TL","v"],["Zitrone",1,"","g"],["Salz",1,"Prise","v"]],
 steps:["Eiweiß mit Salz steif schlagen, Puderzucker langsam einrieseln lassen und weiterschlagen, bis die Masse glänzt.",
        "Drei gehäufte Esslöffel davon abnehmen, das wird später die Decke.",
        "Mandeln, Zimt und etwas Zitronenabrieb unter den Rest heben.",
        "Teig zwischen Folie etwa einen Zentimeter dick ausrollen und kalt stellen.",
        "Sterne ausstechen, die Decke dünn aufstreichen und die Sterne auf Backpapier setzen.",
        "Bei 150 Grad 12 bis 15 Minuten backen, die Decke soll weiß bleiben."],
 tipp:"Die Ausstechform zwischendurch in Wasser tauchen, dann löst sich der klebrige Teig sauber."},

{id:"b-kokosmakronen", name:"Kokosmakronen", cat:"plaetzchen", time:40, ergebnis:"ca. 35 Stück",
 sub:"Auf Oblaten, außen fest, innen saftig.",
 zut:[["Kokosraspel",200,"g","v"],["Eiweiß",3,"","m"],["Zucker",150,"g","v"],
      ["Vanillezucker",1,"Päckchen","v"],["Zitrone",1,"","g"],["Backoblaten",35,"","v"],
      ["Salz",1,"Prise","v"]],
 steps:["Eiweiß mit Salz steif schlagen, Zucker und Vanillezucker einrieseln lassen.",
        "Kokosraspel und etwas Zitronenabrieb vorsichtig unterheben, damit der Schnee nicht zusammenfällt.",
        "Mit zwei Teelöffeln Häufchen auf die Oblaten setzen.",
        "Bei 150 Grad Ober- und Unterhitze 15 bis 18 Minuten backen.",
        "Sie sollen nur an den Spitzen Farbe nehmen.",
        "Auf dem Blech auskühlen lassen, warm sind sie noch weich."],
 tipp:"Je kürzer die Backzeit, desto saftiger. Durchgebackene Makronen werden hart wie Kiesel."},

{id:"b-spitzbuben", name:"Spitzbuben", cat:"plaetzchen", time:100, ergebnis:"ca. 35 Doppelte",
 sub:"Mürbteig mit Johannisbeergelee und Puderzuckerrand.",
 zut:[["Mehl",250,"g","v"],["Butter",175,"g","m"],["Puderzucker",100,"g","v"],
      ["gemahlene Mandeln",75,"g","v"],["Eigelb",2,"","m"],["Vanillezucker",1,"Päckchen","v"],
      ["Johannisbeergelee",200,"g","v"],["Salz",1,"Prise","v"]],
 steps:["Alle Teigzutaten zügig verkneten und eine Stunde kalt stellen.",
        "Dünn ausrollen, gleich viele Böden und Deckel ausstechen, die Deckel mit einem kleinen Loch.",
        "Bei 180 Grad 8 bis 9 Minuten backen und vollständig auskühlen lassen.",
        "Die Deckel vor dem Füllen mit Puderzucker bestäuben, danach ginge es nicht mehr sauber.",
        "Gelee kurz aufkochen, damit es streichfähig wird, und die Böden bestreichen.",
        "Deckel auflegen und leicht andrücken."],
 tipp:"Erst nach einem Tag schmecken sie am besten, dann ist der Boden vom Gelee leicht durchgezogen."},

{id:"b-schwarzweiss", name:"Schwarz-Weiß-Gebäck", cat:"plaetzchen", time:120, ergebnis:"ca. 60 Stück",
 sub:"Zwei Teige, zur Schnecke gerollt.",
 zut:[["Mehl",350,"g","v"],["Butter",250,"g","m"],["Zucker",150,"g","v"],["Eier",1,"","m"],
      ["Kakaopulver",20,"g","v"],["Vanillezucker",1,"Päckchen","v"],["Milch",1,"EL","m"],
      ["Salz",1,"Prise","v"]],
 steps:["Aus allen Zutaten außer Kakao und Milch einen Mürbteig kneten und halbieren.",
        "In eine Hälfte Kakao und Milch einarbeiten, bis die Farbe gleichmäßig ist.",
        "Beide Hälften getrennt eine Stunde kühlen.",
        "Je eine helle und eine dunkle Platte ausrollen, aufeinanderlegen und von der langen Seite aufrollen.",
        "Die Rolle in Folie mindestens zwei Stunden kalt stellen, besser über Nacht.",
        "In fünf Millimeter dicke Scheiben schneiden und bei 180 Grad 10 bis 12 Minuten backen."],
 tipp:"Die Rolle vor dem Schneiden sehr kalt stellen, sonst drückt das Messer die Schnecke platt."},

{id:"b-heidesand", name:"Heidesand", cat:"plaetzchen", time:90, ergebnis:"ca. 50 Stück",
 sub:"Gebräunte Butter macht den Unterschied.",
 zut:[["Butter",250,"g","m"],["Zucker",150,"g","v"],["Mehl",375,"g","v"],
      ["Vanillezucker",2,"Päckchen","v"],["Milch",2,"EL","m"],["Salz",1,"Prise","v"],
      ["Hagelzucker",50,"g","v"]],
 steps:["Butter in einem Topf schmelzen und bräunen, bis sie nussig duftet, dann abkühlen und fest werden lassen.",
        "Die feste braune Butter mit Zucker, Vanillezucker und Salz schaumig rühren.",
        "Mehl und Milch unterarbeiten und daraus Rollen von vier Zentimetern Durchmesser formen.",
        "Rollen in Hagelzucker wälzen und zwei Stunden kalt stellen.",
        "In einen Zentimeter dicke Scheiben schneiden.",
        "Bei 180 Grad 12 bis 15 Minuten backen, bis die Ränder goldbraun sind."],
 tipp:"Das Bräunen der Butter ist der ganze Geschmack. Wer sie nur schmilzt, bekommt gewöhnliche Butterkekse."},

{id:"b-husarenkrapfen", name:"Husarenkrapfen", cat:"plaetzchen", time:80, ergebnis:"ca. 40 Stück",
 sub:"Kugeln mit Daumendelle und Gelee.",
 zut:[["Mehl",200,"g","v"],["Butter",150,"g","m"],["Puderzucker",100,"g","v"],
      ["gemahlene Mandeln",50,"g","v"],["Eigelb",2,"","m"],["Hagebuttenmarmelade",150,"g","v"],
      ["Salz",1,"Prise","v"]],
 steps:["Alle Teigzutaten verkneten und 45 Minuten kalt stellen.",
        "Walnussgroße Kugeln rollen und auf das Blech setzen.",
        "Mit dem Stielende eines Holzlöffels eine tiefe Mulde eindrücken.",
        "Bei 180 Grad 12 Minuten backen und die Mulde nach sechs Minuten nachdrücken, falls sie zuläuft.",
        "Noch warm die Marmelade einfüllen.",
        "Auskühlen lassen und mit Puderzucker bestäuben, die Mulde dabei aussparen."],
 tipp:"Die Marmelade vorher kurz aufkochen und durch ein Sieb streichen, dann glänzt sie schön."},

{id:"b-florentiner", name:"Florentiner", cat:"plaetzchen", time:50, ergebnis:"ca. 30 Stück",
 sub:"Karamell, Mandeln, Schokoladenboden.",
 zut:[["Mandelblättchen",200,"g","v"],["Sahne",100,"ml","m"],["Butter",80,"g","m"],
      ["Zucker",100,"g","v"],["Honig",2,"EL","v"],["Orangeat",50,"g","v"],
      ["Zartbitterkuvertüre",200,"g","v"],["Salz",1,"Prise","v"]],
 steps:["Sahne, Butter, Zucker, Honig und Salz aufkochen und zwei Minuten sprudelnd einkochen lassen.",
        "Topf vom Herd ziehen, Mandelblättchen und feingehacktes Orangeat unterrühren.",
        "Mit zwei Teelöffeln flache Häufchen auf Backpapier setzen und weit verteilen, sie laufen auseinander.",
        "Bei 180 Grad 10 bis 12 Minuten backen, bis die Ränder karamellbraun sind.",
        "Auf dem Blech vollständig auskühlen lassen, warm brechen sie.",
        "Kuvertüre schmelzen, die Unterseiten bestreichen und mit einer Gabel ein Wellenmuster ziehen."],
 tipp:"Zu früh vom Blech genommen zerfallen sie. Zehn Minuten Geduld, dann lösen sie sich von selbst."},

{id:"b-elisen", name:"Elisenlebkuchen", cat:"plaetzchen", time:70, ergebnis:"ca. 25 Stück",
 sub:"Ohne Mehl, auf Oblaten, mit viel Nuss.",
 zut:[["gemahlene Haselnüsse",200,"g","v"],["gemahlene Mandeln",150,"g","v"],["Eier",4,"","m"],
      ["brauner Zucker",200,"g","v"],["Lebkuchengewürz",2,"EL","v"],["Zitrone",1,"","g"],
      ["Orangeat",80,"g","v"],["Backoblaten",25,"","v"],["Zartbitterkuvertüre",150,"g","v"],
      ["Salz",1,"Prise","v"]],
 steps:["Eier mit Zucker und Salz fünf Minuten schaumig schlagen, das gibt die Lockerheit.",
        "Nüsse, Mandeln, Gewürz, Zitronenabrieb und feingehacktes Orangeat unterheben.",
        "Die Masse eine Stunde zugedeckt ruhen lassen.",
        "Auf die Oblaten häufen und mit feuchten Händen kuppelförmig glattstreichen.",
        "Bei 160 Grad 20 bis 25 Minuten backen, sie sollen innen weich bleiben.",
        "Auskühlen lassen und mit geschmolzener Kuvertüre überziehen."],
 tipp:"In einer Dose mit einem Apfelstück bleiben sie wochenlang saftig."},

{id:"b-nussecken", name:"Nussecken", cat:"plaetzchen", time:75, ergebnis:"ca. 30 Stück",
 sub:"Vom Blech, mit Aprikosenschicht.",
 zut:[["Mehl",300,"g","v"],["Butter",125,"g","m"],["Zucker",100,"g","v"],["Eier",1,"","m"],
      ["Backpulver",1,"TL","v"],["Aprikosenkonfitüre",150,"g","v"],["gehackte Haselnüsse",200,"g","v"],
      ["gemahlene Mandeln",100,"g","v"],["Butter für den Belag",200,"g","m"],
      ["Zucker für den Belag",200,"g","v"],["Wasser",4,"EL","v"],["Zartbitterkuvertüre",150,"g","v"]],
 steps:["Mehl, Butter, Zucker, Ei und Backpulver zu einem Teig verkneten und auf ein Blech ausrollen.",
        "Konfitüre glatt rühren und dünn auf dem Teig verstreichen.",
        "Für den Belag Butter, Zucker und Wasser aufkochen, Nüsse und Mandeln unterrühren.",
        "Die Masse gleichmäßig auf der Konfitüre verteilen.",
        "Bei 180 Grad 25 bis 30 Minuten backen, bis die Oberfläche goldbraun ist.",
        "Lauwarm in Quadrate und diese in Dreiecke schneiden, die Ecken später in Kuvertüre tauchen."],
 tipp:"Warm schneiden, kalt tauchen. Umgekehrt bricht der Boden und die Schokolade schmiert."},

{id:"b-pfeffernuesse", name:"Pfeffernüsse", cat:"plaetzchen", time:60, ergebnis:"ca. 50 Stück",
 sub:"Weich, würzig, mit Zitronenguss.",
 zut:[["Mehl",300,"g","v"],["Honig",200,"g","v"],["brauner Zucker",100,"g","v"],["Butter",75,"g","m"],
      ["Eier",1,"","m"],["Lebkuchengewürz",2,"TL","v"],["weißer Pfeffer",1,"TL","v"],
      ["Pottasche",1,"TL","v"],["Milch",2,"EL","m"],["Puderzucker",150,"g","v"],["Zitrone",1,"","g"]],
 steps:["Honig, Zucker und Butter erwärmen, bis alles gelöst ist, und abkühlen lassen.",
        "Pottasche in der Milch auflösen, das sorgt für die weiche Krume.",
        "Mehl, Gewürze, Ei und die Pottaschemilch zur Honigmasse geben und verkneten.",
        "Teig zugedeckt über Nacht bei Zimmertemperatur ruhen lassen.",
        "Walnussgroße Kugeln formen und bei 180 Grad 12 bis 15 Minuten backen.",
        "Noch warm mit Zitronenguss bestreichen."],
 tipp:"Pottasche steht in der Backabteilung. Backpulver ersetzt sie nur notdürftig, die Krume wird fester."},

/* ---------------- Brot und Brötchen ---------------- */
{id:"b-mischbrot", name:"Weizenmischbrot", cat:"brot", time:210, ergebnis:"1 Laib",
 sub:"Halb Roggen, lange Gare, krachende Kruste.",
 zut:[["Weizenmehl Typ 550",300,"g","v"],["Roggenmehl Typ 1150",200,"g","v"],["Wasser",350,"ml","v"],
      ["Sauerteig",100,"g","v"],["Frischhefe",5,"g","m"],["Salz",12,"g","v"],["Brotgewürz",1,"TL","v"]],
 steps:["Alle Zutaten acht Minuten zu einem weichen Teig kneten, er bleibt leicht klebrig.",
        "Zugedeckt 90 Minuten gehen lassen und nach 45 Minuten einmal falten.",
        "Rund wirken und im bemehlten Gärkorb 60 Minuten gehen lassen.",
        "Den Ofen mit Topf oder Stein auf 250 Grad vorheizen, mindestens 30 Minuten.",
        "Brot einschneiden, einschießen und mit Dampf 15 Minuten backen, dann auf 210 Grad reduzieren.",
        "Weitere 35 Minuten backen, bis es hohl klingt, und auf einem Rost auskühlen lassen."],
 tipp:"Das Brot erst nach zwei Stunden anschneiden, sonst ist die Krume noch feucht."},

{id:"b-dinkelvollkorn", name:"Dinkel-Vollkornbrot", cat:"brot", time:150, ergebnis:"1 Kastenbrot",
 sub:"Rührteig in der Form, ohne Kneten.",
 zut:[["Dinkelvollkornmehl",500,"g","v"],["Wasser",400,"ml","v"],["Frischhefe",20,"g","m"],
      ["Salz",12,"g","v"],["Honig",1,"EL","v"],["Sonnenblumenkerne",80,"g","v"],
      ["Leinsamen",40,"g","v"],["Öl",1,"EL","v"]],
 steps:["Hefe und Honig im lauwarmen Wasser auflösen.",
        "Mehl, Salz und die Hälfte der Kerne zugeben und drei Minuten zu einem zähen Teig rühren, nicht kneten.",
        "Kastenform fetten, Teig einfüllen und glatt streichen.",
        "Mit den restlichen Kernen bestreuen und zugedeckt 45 Minuten gehen lassen, bis der Teig den Rand erreicht.",
        "Bei 200 Grad 50 Minuten backen.",
        "Sofort aus der Form stürzen und auf einem Rost auskühlen lassen."],
 tipp:"Dinkel verträgt keine lange Knetzeit. Rühren reicht, sonst reißt das Klebergerüst."},

{id:"b-sonntagsbroetchen", name:"Sonntagsbrötchen", cat:"brot", time:720, ergebnis:"10 Stück",
 sub:"Abends ansetzen, morgens nur noch backen.",
 zut:[["Weizenmehl Typ 550",500,"g","v"],["Wasser",320,"ml","v"],["Frischhefe",3,"g","m"],
      ["Salz",10,"g","v"],["Zucker",1,"TL","v"],["Butter",20,"g","m"]],
 steps:["Alle Zutaten zehn Minuten kneten, bis der Teig glatt ist und sich von der Schüssel löst.",
        "Zugedeckt über Nacht zehn bis zwölf Stunden in den Kühlschrank stellen.",
        "Morgens den Teig in zehn Stücke teilen und rund schleifen.",
        "Auf dem Blech 45 Minuten bei Zimmertemperatur gehen lassen.",
        "Den Ofen auf 230 Grad vorheizen, die Brötchen einschneiden und mit Wasser besprühen.",
        "Mit Dampf 18 bis 20 Minuten goldbraun backen."],
 tipp:"Die kalte Gare über Nacht macht den Geschmack. Mit mehr Hefe geht es schneller, schmeckt aber nach nichts."},

{id:"b-laugenbroetchen", name:"Laugenbrötchen", cat:"brot", time:150, ergebnis:"10 Stück",
 sub:"Mit echter Natronlauge, Handschuhe bereitlegen.",
 zut:[["Weizenmehl Typ 550",500,"g","v"],["Wasser",250,"ml","v"],["Frischhefe",15,"g","m"],
      ["Butter",30,"g","m"],["Salz",10,"g","v"],["Zucker",1,"TL","v"],
      ["Natronlauge 4 Prozent",1,"l","v"],["grobes Salz",2,"EL","v"]],
 steps:["Teig acht Minuten kneten und 60 Minuten gehen lassen.",
        "In zehn Stücke teilen, rund oder länglich formen und 30 Minuten auf dem Blech gehen lassen.",
        "Die Rohlinge 20 Minuten offen in den Kühlschrank stellen, dann trocknet die Oberfläche an.",
        "Lauge in einem Gefäß ohne Aluminium ansetzen und dabei Handschuhe und Brille tragen.",
        "Jeden Rohling 20 Sekunden in die kalte Lauge tauchen, abtropfen lassen, einschneiden und salzen.",
        "Bei 220 Grad 18 Minuten backen, bis sie tief mahagonifarben sind."],
 tipp:"Backnatron im Wasserbad ist die harmlose Variante, bleibt aber heller und schmeckt weniger nach Lauge."},

{id:"b-hefezopf", name:"Hefezopf", cat:"brot", time:180, ergebnis:"1 großer Zopf",
 sub:"Butterweich, mit Eigelb glänzend gebacken.",
 zut:[["Weizenmehl Typ 550",500,"g","v"],["Milch",250,"ml","m"],["Butter",100,"g","m"],
      ["Zucker",80,"g","v"],["Frischhefe",25,"g","m"],["Eier",1,"","m"],["Eigelb",1,"","m"],
      ["Vanillezucker",1,"Päckchen","v"],["Salz",1,"TL","v"],["Hagelzucker",3,"EL","v"]],
 steps:["Milch lauwarm erwärmen, Hefe und einen Löffel Zucker darin auflösen und zehn Minuten stehen lassen.",
        "Mit Mehl, restlichem Zucker, Ei, weicher Butter, Vanillezucker und Salz acht Minuten kneten.",
        "Zugedeckt 60 Minuten gehen lassen, bis sich das Volumen verdoppelt hat.",
        "In drei Stränge teilen, flechten und weitere 40 Minuten gehen lassen.",
        "Mit verquirltem Eigelb bestreichen und mit Hagelzucker bestreuen.",
        "Bei 180 Grad 30 bis 35 Minuten backen, nach 20 Minuten bei Bedarf abdecken."],
 tipp:"Die Stränge locker flechten. Zu fest geflochten reißt der Zopf beim Aufgehen an den Seiten auf."},

{id:"b-focaccia", name:"Focaccia", cat:"brot", time:180, ergebnis:"1 Blech",
 sub:"Nasser Teig, viel Olivenöl, Rosmarin.",
 zut:[["Weizenmehl Typ 550",500,"g","v"],["Wasser",400,"ml","v"],["Frischhefe",7,"g","m"],
      ["Salz",12,"g","v"],["Olivenöl",80,"ml","v"],["Rosmarin",3,"Zweige","g"],
      ["grobes Salz",1,"TL","v"],["Kirschtomaten",150,"g","g"]],
 steps:["Mehl, Wasser, Hefe und Salz zu einem sehr weichen Teig verrühren, kneten lässt er sich nicht.",
        "Zugedeckt zwei Stunden gehen lassen und dabei viermal mit nasser Hand falten.",
        "Das Blech großzügig mit Olivenöl ausstreichen und den Teig hineingleiten lassen.",
        "Mit geölten Fingern auseinanderziehen und 45 Minuten gehen lassen.",
        "Mit den Fingerspitzen tiefe Dellen eindrücken, Öl, Rosmarin, grobes Salz und Tomaten darauf verteilen.",
        "Bei 230 Grad 20 bis 25 Minuten backen, bis die Oberfläche goldbraun ist."],
 tipp:"Nicht am Öl sparen. Es frittiert die Unterseite und macht die Kruste, die Focaccia ausmacht."}
];

/* ---------- Rezeptbestand ----------
   Wie bei den Gerichten: die Datei liefert den Grundstock, eigene Rezepte
   und Änderungen liegen daneben im Browser. */
const K_BACK = "tyden.backen.v1";
let BACKEN = (function(){
  try {
    const raw = localStorage.getItem(K_BACK);
    if (raw){
      const got = JSON.parse(raw);
      if (Array.isArray(got) && got.length) return got;
    }
  } catch(e){}
  return JSON.parse(JSON.stringify(BACKEN_BASE));
})();
window.BACKEN = BACKEN;
function saveBacken(){
  window.BACKEN = BACKEN;
  try { localStorage.setItem(K_BACK, JSON.stringify(BACKEN)); } catch(e){}
}

/* ---------- Speicher ----------
   Die Auswahl hängt nicht an der Kalenderwoche. Sie bleibt stehen,
   bis sie geleert wird. */
function backState(){
  if (!DB.backen || typeof DB.backen !== "object") DB.backen = {};
  const b = DB.backen;
  if (!b.sel || typeof b.sel !== "object") b.sel = {};      // id -> Anzahl Fuhren
  if (!b.checked) b.checked = {};
  if (!b.buy) b.buy = {};
  if (!b.have) b.have = {};      // trotz Menge als vorrätig abgehakt
  return b;
}
const bakeById = id => BACKEN.find(r => r.id === id);
const bcolor = r => (BCATS[r.cat] || BCATS.plaetzchen).c;

function bakeSel(){
  const b = backState();
  return BACKEN.filter(r => (b.sel[r.id] || 0) > 0);
}
function bakeSetMult(id, n){
  const b = backState();
  n = Math.max(0, Math.min(20, n));
  if (n) b.sel[id] = n; else delete b.sel[id];
  save();
  renderBacken();
}

/* ---------- Auswahl ---------- */
function renderBacken(){
  const b = backState();
  const grid = $("#bakeGrid");
  if (!grid) return;

  const q = ($("#bakeSearch") ? $("#bakeSearch").value : "").toLowerCase();
  grid.innerHTML = Object.keys(BCATS).map(c => {
    const list = BACKEN.filter(r => r.cat === c && r.name.toLowerCase().indexOf(q) >= 0);
    if (!list.length) return "";
    return '<div class="bakegrp"><h4 class="lbl">' + BCATS[c].n + '</h4><div class="bakecards">' +
      list.map(r => {
        const n = b.sel[r.id] || 0;
        return '<div class="bakecard' + (n ? " on" : "") + '" style="--bc:' + bcolor(r) + '">' +
          '<button class="bakepick" data-pick="' + r.id + '">' +
            '<div class="n">' + esc(r.name) + '</div>' +
            '<div class="m">' + esc(r.ergebnis) + ' · ' + r.time + ' Min.</div>' +
            '<div class="s">' + esc(r.sub) + '</div>' +
          '</button>' +
          '<div class="bakefoot">' +
            '<button class="mini" data-minus="' + r.id + '" aria-label="weniger">&minus;</button>' +
            '<b>' + (n ? n + "×" : "–") + '</b>' +
            '<button class="mini" data-plus="' + r.id + '" aria-label="mehr">+</button>' +
            '<button class="mini" data-show="' + r.id + '">Rezept</button>' +
          '</div>' +
        '</div>';
      }).join("") + '</div></div>';
  }).join("");

  $$("#bakeGrid [data-pick]").forEach(el => el.onclick = () => {
    const id = el.dataset.pick;
    bakeSetMult(id, (backState().sel[id] || 0) ? 0 : 1);
  });
  $$("#bakeGrid [data-plus]").forEach(el => el.onclick = () =>
    bakeSetMult(el.dataset.plus, (backState().sel[el.dataset.plus] || 0) + 1));
  $$("#bakeGrid [data-minus]").forEach(el => el.onclick = () =>
    bakeSetMult(el.dataset.minus, (backState().sel[el.dataset.minus] || 0) - 1));
  $$("#bakeGrid [data-show]").forEach(el => el.onclick = () => openBakeRec(el.dataset.show));

  const sel = bakeSel();
  const fuhren = sel.reduce((s, r) => s + (b.sel[r.id] || 0), 0);
  const items = bakeList();
  const offen = items.filter(i => !i.pantry && !b.checked[i.key]).length;
  $("#bakeStats").textContent = sel.length
    ? sel.length + (sel.length === 1 ? " Rezept" : " Rezepte") + " · " + fuhren +
      (fuhren === 1 ? " Fuhre" : " Fuhren") + " · " + offen + " offen"
    : "Noch nichts gewählt";
  renderBakeShop();
}

/* ---------- Einkaufszettel, getrennt von der Woche ---------- */
/* Beim Backen gilt die Vorratslogik enger als beim Kochen: Mehl, Zucker und
   Butter gehen hier kiloweise durch, die kauft man ein, auch wenn eine
   angebrochene Packung im Schrank steht. Im Vorrat bleiben nur Positionen,
   die ausschließlich in Prisen und Löffeln vorkommen — Salz, Gewürze, Wasser. */
function bakeList(){
  const b = backState(), sum = {};
  bakeSel().forEach(r => r.zut.forEach(z => addZut(sum, z, b.sel[r.id] || 1)));
  Object.values(sum).forEach(i => {
    i.pantry = (i.pantry && (i.klein || /^wasser$/i.test(i.n))) || !!b.have[i.key];
    if (b.buy[i.key]) i.pantry = false;
  });
  return Object.values(sum).sort((x, y) => x.n.localeCompare(y.n, "de"));
}
function renderBakeShop(){
  const b = backState(), items = bakeList(), body = $("#bakeShop");
  if (!body) return;
  if (!items.length){
    body.innerHTML = '<p class="hint">Links Rezepte antippen. Die Zutaten aller gewählten Rezepte ' +
      'landen hier zusammengezählt auf einem eigenen Zettel, unabhängig von der Woche.</p>';
    return;
  }
  const kauf = items.filter(i => !i.pantry);
  const vorrat = items.filter(i => i.pantry);

  let html = Object.keys(GRP).map(g => {
    const it = kauf.filter(i => i.g === g);
    if (!it.length) return "";
    return '<div class="grp"><h4 class="lbl">' + GRP[g] + '</h4>' + it.map((i, n) => {
      const on = !!b.checked[i.key], id = "bk_" + g + n;
      return '<div class="item' + (on ? " done" : "") + '">' +
        '<input type="checkbox" id="' + id + '" data-k="' + esc(i.key) + '"' + (on ? " checked" : "") + '>' +
        '<label for="' + id + '"><span>' + esc(i.n) + '</span><b>' + posText(i, 4) + '</b></label>' +
        '<button class="mini" data-bpantry="' + esc(i.n) + '" data-bkey="' + esc(i.key) + '">Vorrat</button></div>';
    }).join("") + '</div>';
  }).join("");

  if (vorrat.length){
    html += '<details class="vorrat"><summary>' + vorrat.length +
      ' Positionen aus dem Vorrat — nicht auf der Liste</summary>' +
      vorrat.map(i => '<div class="item pantry"><span class="dotm"></span>' +
        '<label><span>' + esc(i.n) + '</span><b>' + posText(i, 4) + '</b></label>' +
        '<button class="mini" data-bbuy="' + esc(i.key) + '">kaufen</button></div>').join("") +
      '</details>';
  }
  body.innerHTML = html;

  $$("#bakeShop input").forEach(cb => cb.onchange = () => {
    const s = backState();
    if (cb.checked) s.checked[cb.dataset.k] = 1; else delete s.checked[cb.dataset.k];
    save(); renderBacken();
  });
  $$("#bakeShop [data-bpantry]").forEach(el => el.onclick = () => {
    const s = backState();
    s.have[el.dataset.bkey] = 1;
    delete s.buy[el.dataset.bkey];
    addToPantry(el.dataset.bpantry);
    save(); renderBacken(); renderShop();
    toast("„" + baseName(el.dataset.bpantry) + "“ gilt jetzt als vorrätig");
  });
  $$("#bakeShop [data-bbuy]").forEach(el => el.onclick = () => {
    const s = backState();
    s.buy[el.dataset.bbuy] = 1;
    delete s.have[el.dataset.bbuy];
    save(); renderBacken();
  });
}
function bakeText(){
  const b = backState(), sel = bakeSel();
  if (!sel.length) return null;
  const items = bakeList().filter(i => !i.pantry && !b.checked[i.key]);
  let t = "Backen\n";
  Object.keys(GRP).forEach(g => {
    const it = items.filter(i => i.g === g);
    if (!it.length) return;
    t += "\n*" + GRP[g] + "*\n" + it.map(i => "• " + i.n + " — " + posText(i, 4)).join("\n") + "\n";
  });
  t += "\n*Rezepte*\n" + sel.map(r => "• " + r.name +
    ((b.sel[r.id] || 1) > 1 ? " (" + b.sel[r.id] + "×)" : "") + " — " + r.ergebnis).join("\n");
  return t;
}

/* ---------- Rezeptblatt ---------- */
function openBakeRec(id){
  const r = bakeById(id);
  if (!r) return;
  const b = backState(), mult = b.sel[id] || 1;
  const c = bcolor(r);
  $("#recTop").style.background = c;
  $("#recCat").textContent = BCATS[r.cat].n + (mult > 1 ? " · " + mult + " Fuhren" : "");
  $("#recName").textContent = r.name;
  $("#recSub").textContent = r.sub || "";
  $("#recStats").innerHTML = "<span>" + esc(r.ergebnis) + "</span><span>" + r.time + " Min.</span>";
  $("#recBody").innerHTML =
    '<div class="pf"><span class="lbl">Fuhren</span>' +
      '<button data-bm="-1">&minus;</button><b>' + mult + '</b><button data-bm="1">+</button></div>' +
    '<p class="lbl" style="margin-bottom:.5rem">Zutaten</p>' +
    '<ul class="zut">' + r.zut.map(z => '<li><span>' + esc(z[0]) + '</span><b>' +
      fmtEinheit((Number(z[1]) || 0) * mult * unitInfo(z[2]).f, unitInfo(z[2]).b) + '</b></li>').join("") +
    '</ul><p class="lbl" style="margin-bottom:.5rem">Zubereitung</p>' +
    '<ol class="steps">' + r.steps.map(s => '<li>' + esc(s) + '</li>').join("") + '</ol>' +
    (r.tipp ? '<div class="tipp">' + esc(r.tipp) + '</div>' : '');
  $$("#recBody [data-bm]").forEach(el => el.onclick = () => {
    const n = Math.max(1, mult + Number(el.dataset.bm));
    bakeSetMult(id, n);
    openBakeRec(id);
  });
  $("#recFoot").innerHTML = '<button class="btn" data-bsel="' + r.id + '">' +
    ((b.sel[id] || 0) ? "Von der Liste nehmen" : "Auf die Backliste") + '</button>' +
    '<button class="btn ghost" data-bedit="' + r.id + '">Bearbeiten</button>';
  $("#recFoot").querySelector("[data-bsel]").onclick = () => {
    bakeSetMult(id, (backState().sel[id] || 0) ? 0 : 1);
    $("#dRec").close();
  };
  $("#recFoot").querySelector("[data-bedit]").onclick = () => {
    $("#dRec").close(); openBakeEditor(id);
  };
  $("#dRec").showModal();
}

/* ---------- Rezept anlegen und ändern ----------
   Eigener Editor, weil Backrezepte keine Portionen und keine Wochentage
   kennen, dafür eine Ausbeute: ein Blech, ein Laib, 60 Stück. */
let bakeEditId = null;
function blankBake(){
  return {id:"", name:"", cat:"plaetzchen", time:60, ergebnis:"1 Blech", sub:"",
          zut:[["",0,"","v"]], steps:[], tipp:""};
}
function openBakeEditor(id, preset){
  bakeEditId = id;
  const r = id ? bakeById(id) : Object.assign(blankBake(), preset || {});
  $("#editTitle").textContent = id ? r.name : "Neues Backrezept";
  $("#editBody").innerHTML =
    '<div class="form">' +
      '<div class="field"><label class="lbl">Name</label><input id="b_name" value="' + esc(r.name) + '"></div>' +
      '<div class="field"><label class="lbl">Untertitel</label><input id="b_sub" value="' + esc(r.sub || "") + '"></div>' +
      '<div class="f4">' +
        '<div class="field"><label class="lbl">Kategorie</label><select id="b_cat">' +
          Object.keys(BCATS).map(c => '<option value="' + c + '"' + (r.cat === c ? " selected" : "") +
            '>' + BCATS[c].n + '</option>').join("") + '</select></div>' +
        '<div class="field"><label class="lbl">Ausbeute</label>' +
          '<input id="b_erg" value="' + esc(r.ergebnis || "") + '" placeholder="z. B. ca. 50 Stück"></div>' +
        '<div class="field"><label class="lbl">Minuten gesamt</label>' +
          '<input id="b_time" type="number" min="5" max="1440" value="' + (r.time || 60) + '"></div>' +
      '</div>' +
      '<div class="field"><label class="lbl">Zutaten für eine Fuhre</label><div id="e_zut"></div>' +
        '<button class="btn ghost" id="addZut" style="margin-top:.4rem">Zutat hinzufügen</button></div>' +
      '<div class="field"><label class="lbl">Zubereitung — ein Schritt pro Zeile</label>' +
        '<textarea id="b_steps" rows="9">' + esc((r.steps || []).join("\n")) + '</textarea></div>' +
      '<div class="field"><label class="lbl">Tipp</label>' +
        '<textarea id="b_tipp" rows="2">' + esc(r.tipp || "") + '</textarea></div>' +
    '</div>';
  drawZutRows((r.zut && r.zut.length) ? r.zut : [["",0,"","v"]]);
  $("#addZut").onclick = () => { const z = readZut(); z.push(["",0,"","v"]); drawZutRows(z); };
  $("#saveDish").onclick = saveBake;
  $("#delDish").onclick = deleteBake;
  $("#delDish").style.display = id ? "" : "none";
  $("#dEdit").showModal();
}
function saveBake(){
  const name = $("#b_name").value.trim();
  if (!name){ toast("Name fehlt"); return; }
  const rez = {
    id: bakeEditId || ("b-" + slugify(name)),
    name: name,
    cat: $("#b_cat").value,
    time: Number($("#b_time").value) || 60,
    ergebnis: $("#b_erg").value.trim() || "1 Fuhre",
    sub: $("#b_sub").value.trim(),
    zut: readZut().filter(z => z[0]),
    steps: $("#b_steps").value.split("\n").map(x => x.trim()).filter(Boolean),
    tipp: $("#b_tipp").value.trim()
  };
  if (bakeEditId){
    BACKEN[BACKEN.findIndex(x => x.id === bakeEditId)] = rez;
  } else {
    if (bakeById(rez.id)) rez.id = rez.id + "-" + Date.now().toString().slice(-4);
    BACKEN.push(rez);
  }
  saveBacken();
  $("#dEdit").close();
  setTab("backen");
  renderBacken();
  toast(bakeEditId ? "Gespeichert" : "Backrezept angelegt");
}
function deleteBake(){
  if (!bakeEditId) return;
  const r = bakeById(bakeEditId);
  if (!confirm("„" + r.name + "“ wirklich löschen?")) return;
  BACKEN = BACKEN.filter(x => x.id !== bakeEditId);
  const b = backState();
  delete b.sel[bakeEditId];
  saveBacken(); save();
  $("#dEdit").close(); renderBacken();
  toast("Backrezept gelöscht");
}
function exportBacken(){
  const head = "/* Týden — Backrezepte\n   Export vom " + new Date().toLocaleString("de-DE") +
    "\n   Ersetzt den Datenblock in backen.js. */\n";
  download("backrezepte.js", head + "const BACKEN_BASE = " + JSON.stringify(BACKEN, null, 1) + ";\n",
           "text/javascript");
}

/* ---------- Drucken ---------- */
function printBacken(){
  const b = backState(), sel = bakeSel();
  if (!sel.length) return "";
  const items = bakeList();
  const kauf = items.filter(i => !i.pantry);
  const groups = Object.keys(GRP).map(g => {
    const it = kauf.filter(i => i.g === g);
    if (!it.length) return "";
    return '<div class="pgrp"><h4>' + GRP[g] + '</h4>' + it.map(i =>
      '<div class="pi"><span class="pbox"></span><span>' + esc(i.n) + '</span><b>' +
      posText(i, 4) + '</b></div>').join("") + '</div>';
  }).join("");
  const plan = sel.map(r => '<div class="pi"><span>' + esc(r.name) +
    ((b.sel[r.id] || 1) > 1 ? " · " + b.sel[r.id] + "×" : "") + '</span><b>' +
    esc(r.ergebnis) + '</b></div>').join("");
  const vorrat = items.filter(i => i.pantry).map(i => i.n).join(", ");
  return '<div class="psec"><div class="phead"><h1>Backen</h1><span>' + sel.length +
    (sel.length === 1 ? " Rezept" : " Rezepte") + '</span></div>' +
    '<div class="pcols">' + groups + '<div class="pgrp"><h4>Gebacken wird</h4>' + plan + '</div></div>' +
    (vorrat ? '<div class="pnote">Aus dem Vorrat, nicht gekauft: ' + esc(vorrat) + '</div>' : '') +
    '</div>';
}
function printBackRezepte(){
  const b = backState(), sel = bakeSel();
  if (!sel.length) return "";
  return '<div class="psec"><div class="phead"><h1>Backrezepte</h1><span>' +
    sel.map(r => r.name).join(" · ") + '</span></div>' +
    sel.map(r => {
      const mult = b.sel[r.id] || 1, c = bcolor(r);
      return '<div class="prec" style="border-left:2.5pt solid ' + c + ';padding-left:3mm">' +
        '<h3 style="color:' + c + '">' + esc(r.name) + (mult > 1 ? " · " + mult + "×" : "") + '</h3>' +
        '<div class="pd">' + BCATS[r.cat].n + ' · ' + esc(r.ergebnis) + ' · ' + r.time + ' Min.</div>' +
        '<div class="pz">' + r.zut.map(z => '<div><span>' + esc(z[0]) + '</span><b>' +
          fmtEinheit((Number(z[1]) || 0) * mult * unitInfo(z[2]).f, unitInfo(z[2]).b) +
          '</b></div>').join("") + '</div>' +
        '<ol>' + r.steps.map(s => '<li>' + esc(s) + '</li>').join("") + '</ol>' +
        (r.tipp ? '<div class="pnote">' + esc(r.tipp) + '</div>' : '') + '</div>';
    }).join("") + '</div>';
}

/* ---------- Ereignisse ---------- */
function initBacken(){
  if ($("#bakeSearch")) $("#bakeSearch").oninput = renderBacken;
  const neu = $("#bakeNew");
  if (neu) neu.onclick = () => openBakeEditor(null);
  const ki = $("#bakeKI");
  if (ki) ki.onclick = () => openKI("backen");
  const exp = $("#bakeExport");
  if (exp) exp.onclick = exportBacken;
  const zur = $("#bakeReset");
  if (zur) zur.onclick = () => {
    if (!confirm("Alle Änderungen an den Backrezepten verwerfen?")) return;
    BACKEN = JSON.parse(JSON.stringify(BACKEN_BASE));
    saveBacken(); renderBacken();
    toast("Backrezepte zurückgesetzt");
  };
  const leer = $("#bakeClear");
  if (leer) leer.onclick = () => {
    const b = backState();
    b.sel = {}; b.checked = {}; b.buy = {}; b.have = {};
    save(); renderBacken();
    toast("Backliste geleert");
  };
  const haken = $("#bakeResetChecks");
  if (haken) haken.onclick = () => { backState().checked = {}; save(); renderBacken(); };
  const wa = $("#bakeShare");
  if (wa) wa.onclick = () => {
    const t = bakeText();
    if (!t){ toast("Noch kein Rezept gewählt"); return; }
    window.open("https://wa.me/?text=" + encodeURIComponent(t), "_blank");
  };
  const kop = $("#bakeCopy");
  if (kop) kop.onclick = () => {
    const t = bakeText();
    if (!t){ toast("Noch kein Rezept gewählt"); return; }
    navigator.clipboard.writeText(t).then(() => toast("Backliste kopiert"),
                                          () => toast("Kopieren nicht möglich"));
  };
}
