/* ============================================================
   Týden — claude.js
   Rezept aus Foto oder Link, Vorschläge aus dem Vorrat.
   Der API-Schlüssel liegt ausschließlich lokal im Browser
   dieses Geräts und gehört nicht ins Repository.
   ============================================================ */

const K_API = "tyden.anthropic.key";
const K_MODEL = "tyden.anthropic.model";
const MODEL_STD = "claude-sonnet-4-5-20250929";

function apiKey(){ try { return localStorage.getItem(K_API) || ""; } catch(e){ return ""; } }
function setApiKey(k){ try { k ? localStorage.setItem(K_API, k) : localStorage.removeItem(K_API); } catch(e){} }
function modell(){ try { return localStorage.getItem(K_MODEL) || MODEL_STD; } catch(e){ return MODEL_STD; } }
function setModell(m){ try { localStorage.setItem(K_MODEL, m || MODEL_STD); } catch(e){} }

/* Letzte Antwort im Rohzustand, damit sich Fehler nachvollziehen lassen */
let letzteAntwort = "";
let letzteRohantwort = "";   // reiner Text des Modells, ohne HTTP-Hülle

const SCHEMA = `{
  "name": "Name des Gerichts, kurz und auf Deutsch",
  "sub": "ein Satz, der das Gericht oder seinen Kniff beschreibt",
  "cat": "fleisch | fisch | veg | suppe",
  "win": "alle | we",
  "time": Gesamtzeit in Minuten als Zahl,
  "kh": Kohlenhydrate pro Portion in Gramm als Zahl, ohne Beilage,
  "zut": [["Zutat", Menge als Zahl, "Einheit", "Warengruppe"], ...],
  "steps": ["Schritt 1", "Schritt 2", ...],
  "tipp": "ein praktischer Hinweis aus der Küche"
}`;

const REGELN = `So wird das Rezept aufgeschrieben:

MENGEN
- Immer für 4 Portionen umrechnen, auch wenn die Quelle andere Mengen nennt.
- Einheit ist genau eine aus dieser Liste: "", "g", "kg", "ml", "l", "EL", "TL",
  "Stange", "Bund", "Kopf", "Zweige", "Blatt", "cm", "Prise", "Dose".
  Ein leerer String bedeutet Stück, also 2 Zwiebeln oder 4 Eier.
- Frische Kräuter in "Bund" oder "Zweige", getrocknete Kräuter und Gewürze in "TL" oder "EL".
  Daran erkennt die Einkaufsliste, was gekauft werden muss und was im Vorrat steht.

ZUTATENNAMEN
- Grundwort zuerst, Zusatz nach einem Komma: "Paprikapulver, edelsüß", nicht "edelsüßes Paprikapulver".
- Gleiche Dinge immer gleich benennen, damit die Einkaufsliste sie zusammenzählt.
- Keine Mengen oder Zubereitungshinweise im Namen, also "Zwiebel" statt "1 große Zwiebel, gewürfelt".

WARENGRUPPE
- "g" für Obst und Gemüse, "f" für Fleisch und Fisch, "m" für Kühlregal wie Milch, Käse, Eier, Sahne,
  "v" für Vorrat wie Konserven, Öl, Gewürze, Mehl.

EINORDNUNG
- Dieser Haushalt kocht unter der Woche kohlenhydratarm. Gerichte mit Nudeln, Reis, Kartoffeln,
  Brot, Panade oder Teig bekommen win = "we" und sind damit Samstag und Sonntag vorbehalten.
  Alles andere bekommt win = "alle".
- cat richtet sich nach dem prägenden Bestandteil. Eine Suppe ist "suppe", auch wenn Fleisch darin ist.

SCHRITTE
- Höchstens sieben Schritte, ganze Sätze, Deutsch, keine Nummerierung im Text.
- Nenne beim entscheidenden Handgriff kurz, worauf es ankommt, etwa dass die Pfanne heiß genug sein
  muss oder das Gemüse vorher gesalzen und abgetupft wird. Keine Floskeln.
- Backofentemperaturen und Garzeiten konkret angeben.

TIPP
- Ein Satz, der beim Nachkochen wirklich hilft: ein häufiger Fehler, eine Vorbereitung am Vortag,
  eine Low-Carb-Alternative für die Beilage.

AUSGABE
- Ausschließlich das JSON, kein Fließtext davor oder danach, kein Codeblock.
- Was du nicht sicher erkennst, schätzt du plausibel, statt das Feld leer zu lassen.`;

async function askClaude(content, maxTokens){
  const key = apiKey();
  if (!key) throw new Error("Kein API-Schlüssel hinterlegt — weiter unten im Abschnitt Zugang eintragen.");

  let r;
  try {
    r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true"
      },
      body: JSON.stringify({
        model: modell(),
        max_tokens: maxTokens || 2000,
        messages: [{role: "user", content: content}]
      })
    });
  } catch(netz){
    letzteAntwort = "Netzwerkfehler: " + netz.message;
    const err = new Error(klartext(0, "network", "") + " (" + netz.message + ")");
    err.roh = letzteAntwort;
    throw err;
  }

  const rohtext = await r.text();
  letzteAntwort = "HTTP " + r.status + " " + r.statusText + "\n\n" + rohtext;

  if (!r.ok){
    let typ = "", msg = "";
    try {
      const e = JSON.parse(rohtext);
      if (e.error){ typ = e.error.type || ""; msg = e.error.message || ""; }
    } catch(x){}
    const hinweis = klartext(r.status, typ, rohtext);
    const err = new Error("HTTP " + r.status + (typ ? " · " + typ : "") +
      (msg ? "\n" + msg : "") + (hinweis ? "\n\n" + hinweis : ""));
    err.roh = letzteAntwort;
    throw err;
  }

  let d;
  try { d = JSON.parse(rohtext); }
  catch(x){
    const err = new Error("Die Antwort war kein gültiges JSON.");
    err.roh = letzteAntwort;
    throw err;
  }
  return (d.content || []).filter(b => b.type === "text").map(b => b.text).join("");
}
/* Holt das erste vollständige JSON-Objekt aus der Antwort. Modelle schreiben gern
   einen Satz davor, packen Codeblöcke drumherum oder hängen Erklärungen an. */
function parseJson(text){
  let t = String(text || "").trim();
  t = t.replace(/^```(?:json)?/i, "").replace(/```\s*$/,"").trim();

  const start = t.indexOf("{");
  if (start < 0) throw new Error("Die Antwort enthielt kein JSON.");

  let tiefe = 0, imText = false, escape = false, ende = -1;
  for (let i = start; i < t.length; i++){
    const c = t[i];
    if (escape){ escape = false; continue; }
    if (c === "\\"){ escape = true; continue; }
    if (c === '"'){ imText = !imText; continue; }
    if (imText) continue;
    if (c === "{") tiefe++;
    else if (c === "}"){ tiefe--; if (tiefe === 0){ ende = i; break; } }
  }
  if (ende < 0) throw new Error("Das JSON war unvollständig, vermutlich wurde die Antwort abgeschnitten.");
  return JSON.parse(t.slice(start, ende + 1));
}

/* Dasselbe für Listen, etwa bei den Vorschlägen. */
function parseJsonArray(text){
  let t = String(text || "").trim().replace(/^```(?:json)?/i, "").replace(/```\s*$/,"").trim();
  const start = t.indexOf("[");
  const ende = t.lastIndexOf("]");
  if (start < 0 || ende < start) throw new Error("Die Antwort enthielt keine Liste.");
  return JSON.parse(t.slice(start, ende + 1));
}

/* Modelle halten sich nicht immer an die Feldnamen. Hier wird eingesammelt,
   was erkennbar gemeint war, statt eine leere Karte anzulegen. */
function feld(obj, namen){
  for (const n of namen){
    for (const k of Object.keys(obj)){
      if (k.toLowerCase() === n) return obj[k];
    }
  }
  return undefined;
}
function zutatZeile(z){
  if (Array.isArray(z)){
    return [String(z[0] || ""), Number(z[1]) || 0, String(z[2] || ""), String(z[3] || "v")];
  }
  if (z && typeof z === "object"){
    const name = feld(z, ["zutat","name","bezeichnung","ingredient","item"]);
    const menge = feld(z, ["menge","amount","quantity","anzahl"]);
    const einheit = feld(z, ["einheit","unit"]);
    const gruppe = feld(z, ["warengruppe","gruppe","group","kategorie"]);
    return [String(name || ""), Number(menge) || 0, String(einheit || ""), String(gruppe || "v")];
  }
  if (typeof z === "string"){
    // "250 g gekochter Schinken" auseinandernehmen
    const m = z.match(/^\s*([\d.,]+)?\s*([A-Za-zÄÖÜäöüß]+)?\s+(.*)$/);
    if (m && m[1]) return [String(m[3] || z).trim(), parseFloat(m[1].replace(",", ".")) || 0,
                           (m[2] || "").replace(/^(stück|stk)$/i, ""), "v"];
    return [z.trim(), 0, "", "v"];
  }
  return ["", 0, "", "v"];
}
function schrittZeile(s){
  if (typeof s === "string") return s.replace(/^\s*\d+[.)]\s*/, "").trim();
  if (s && typeof s === "object"){
    const t = feld(s, ["schritt","text","anweisung","step","instruction","beschreibung"]);
    return String(t || "").trim();
  }
  return "";
}
function toDish(j){
  if (!j || typeof j !== "object") throw new Error("Die Antwort war kein Rezeptobjekt.");

  const name = feld(j, ["name","titel","title","gericht"]);
  const zutRoh = feld(j, ["zut","zutaten","ingredients","zutatenliste"]) || [];
  const stepsRoh = feld(j, ["steps","schritte","zubereitung","anleitung","instructions"]) || [];

  const dish = {
    id: "", name: String(name || "").trim(),
    sub: String(feld(j, ["sub","untertitel","beschreibung","subtitle"]) || "").trim(),
    cat: ["fleisch","fisch","veg","suppe"].indexOf(feld(j, ["cat","kategorie","category"])) >= 0
         ? feld(j, ["cat","kategorie","category"]) : "veg",
    win: feld(j, ["win","tage","fenster"]) === "we" ? "we" : "alle",
    time: Number(feld(j, ["time","zeit","dauer","minuten"])) || 30,
    kh: Number(feld(j, ["kh","kohlenhydrate","carbs"])) || 0,
    ok: false,
    zut: (Array.isArray(zutRoh) ? zutRoh : []).map(zutatZeile).filter(z => z[0]),
    steps: (Array.isArray(stepsRoh) ? stepsRoh : []).map(schrittZeile).filter(Boolean),
    tipp: String(feld(j, ["tipp","tip","hinweis","note"]) || "").trim()
  };

  if (!dish.name && !dish.zut.length && !dish.steps.length){
    throw new Error("Aus der Antwort ließ sich kein Rezept lesen. " +
      "Die Felder waren leer oder anders benannt. Sieh dir unten die Antwort an.");
  }
  if (!dish.name) dish.name = "Ohne Namen";
  return dish;
}

/* ---------- Rezept aus Foto ---------- */
function fileToBase64(file){
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result).split(",")[1]);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}
async function recipeFromPhotos(files){
  const parts = [];
  for (const f of files){
    parts.push({
      type: "image",
      source: {type: "base64", media_type: f.type || "image/jpeg", data: await fileToBase64(f)}
    });
  }
  parts.push({type: "text", text:
    "Auf den Bildern steht ein Rezept, fotografiert aus einem Kochbuch, von einem Zettel oder " +
    "einem Bildschirm. Lies es vollständig, auch wenn es über mehrere Bilder läuft oder schräg " +
    "fotografiert ist, und übertrage es in dieses JSON:\n" + SCHEMA + "\n\n" + REGELN +
    "\n\nWenn auf den Bildern mehrere Rezepte stehen, nimm das, das den meisten Platz einnimmt."});
  const txt = await askClaude(parts, 4000);
  letzteRohantwort = txt;
  return toDish(parseJson(txt));
}

/* ---------- Rezept aus Link oder eingefügtem Text ---------- */
async function recipeFromText(input){
  const istLink = /^https?:\/\//i.test(input.trim());
  let quelle = input;
  if (istLink){
    try {
      const r = await fetch("https://r.jina.ai/" + input.trim());
      if (r.ok) quelle = (await r.text()).slice(0, 40000);
      else throw new Error("Leseproxy antwortet mit " + r.status);
    } catch(e){
      throw new Error("Die Seite ließ sich nicht laden. Bitte den Rezepttext hier einfügen.");
    }
  }
  const txt = await askClaude([{type: "text", text:
    "Unten steht eine Rezeptquelle: entweder der Text einer Webseite samt Navigation, Werbung und " +
    "Kommentaren, oder ein eingefügter Rezepttext, oder nur der Wunsch nach einem Gericht. " +
    "Suche das eigentliche Rezept heraus und ignoriere alles Drumherum. Steht dort kein Rezept, " +
    "sondern nur ein Gerichtname, schreibe ein passendes Rezept für einen Familienhaushalt. " +
    "Gib das Ergebnis in diesem JSON zurück:\n" + SCHEMA + "\n\n" + REGELN +
    "\n\n--- QUELLE ---\n" + quelle}], 4000);
  letzteRohantwort = txt;
  return toDish(parseJson(txt));
}

/* ---------- Notiz aus Foto abschreiben ---------- */
async function notizAusFotos(files){
  const parts = [];
  for (const f of files){
    parts.push({type: "image",
      source: {type: "base64", media_type: f.type || "image/jpeg", data: await fileToBase64(f)}});
  }
  parts.push({type: "text", text:
    "Auf den Bildern steht eine Notiz: ein handgeschriebener Zettel, eine Einkaufsliste, eine " +
    "Tafel, eine Seite aus einem Heft oder ein Ausdruck. Schreibe ab, was dort steht.\n\n" +
    "So gehst du vor:\n" +
    "- Übernimm den Inhalt vollständig und wortgetreu, auch Stichworte und Abkürzungen.\n" +
    "- Behalte die Gliederung bei: Zeilenumbrüche bleiben, Aufzählungen beginnen mit einem Bindestrich " +
    "und einem Leerzeichen, Überschriften stehen in einer eigenen Zeile.\n" +
    "- Abgehakte oder durchgestrichene Punkte kennzeichnest du am Zeilenende mit [erledigt].\n" +
    "- Ist ein Wort nicht sicher zu lesen, schreibe deine beste Vermutung und setze dahinter ein [?].\n" +
    "- Erfinde nichts dazu, ordne nichts um und kommentiere nicht.\n" +
    "- Mehrere Bilder schreibst du nacheinander ab, getrennt durch eine Leerzeile.\n\n" +
    "Gib ausschließlich den abgeschriebenen Text aus, ohne Einleitung und ohne Codeblock."});
  const txt = await askClaude(parts, 3000);
  letzteRohantwort = txt;
  return String(txt || "").trim();
}

/* ---------- Vorschläge aus dem Vorrat ---------- */
async function suggestFromStock(stockText, photos){
  const namen = RECIPES.map(r => r.name + " (" + CATS[r.cat].n + ", " + r.time + " Min.)").join("; ");
  const parts = [];
  for (const f of (photos || [])){
    parts.push({type: "image",
      source: {type: "base64", media_type: f.type || "image/jpeg", data: await fileToBase64(f)}});
  }
  const heute = new Date();
  const wochentag = ["Sonntag","Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag"][heute.getDay()];
  const we = (heute.getDay() === 0 || heute.getDay() === 6);
  parts.push({type: "text", text:
    "Ich plane das Abendessen für einen Haushalt mit zwei Erwachsenen und zwei Kindern. " +
    "Unter der Woche kochen wir kohlenhydratarm, am Wochenende ist alles erlaubt. " +
    "Heute ist " + wochentag + ", also " + (we ? "ein Wochenendtag." : "ein Werktag, Low Carb.") +
    "\n\nVorhanden ist:\n" + (stockText || "(siehe die Bilder)") +
    (photos && photos.length ? "\nDie Bilder zeigen Kühlschrank oder Vorratsschrank. " +
      "Benenne nur, was du wirklich erkennst." : "") +
    "\n\nMeine Rezeptkartei:\n" + namen +
    "\n\nSchlage vier Gerichte vor, die sich daraus heute oder morgen kochen lassen. " +
    "Nimm bevorzugt Gerichte aus der Kartei und setze sie nach oben. Ein oder zwei neue Vorschläge " +
    "sind erlaubt, wenn sie besser zum Vorrat passen. " +
    "Grundnahrungsmittel wie Öl, Salz, Pfeffer, Mehl und getrocknete Gewürze darfst du als vorhanden " +
    "annehmen, auch wenn sie oben nicht stehen. " +
    "Unter fehlt listest du nur, was tatsächlich noch gekauft werden muss, höchstens drei Dinge. " +
    "Findest du zu wenig, sage es ehrlich und schlage weniger als vier Gerichte vor.\n\n" +
    "Antworte ausschließlich mit diesem JSON-Array, ohne Fließtext:\n" +
    '[{"name":"…","aus_kartei":true,"fehlt":["…"],"warum":"ein Satz, warum es gerade passt"}]'});
  const txt = await askClaude(parts, 1500);
  letzteRohantwort = txt;
  return parseJsonArray(txt);
}

/* ---------- Oberfläche ---------- */
function initClaude(){
  $("#apiKey").value = apiKey();
  $("#apiModel").value = modell();
  $("#saveKey").onclick = () => {
    const k = $("#apiKey").value.trim();
    setApiKey(k);
    setModell($("#apiModel").value.trim());
    if (k && !/^sk-ant-/.test(k)){
      aiError("Der Schlüssel sieht ungewöhnlich aus — er beginnt normalerweise mit sk-ant-. " +
              "Gespeichert ist er trotzdem.", "");
    } else {
      aiDone();
    }
    toast(k ? "Gespeichert" : "Schlüssel entfernt");
  };
  $("#listModels").onclick = async () => {
    aiBusy("Modelle werden abgefragt …");
    try {
      const liste = await modelleHolen();
      aiDone();
      const el = $("#aiStatus");
      el.className = "aistatus gut";
      el.innerHTML = '<b>' + liste.length + ' Modelle für diesen Schlüssel</b>' +
        '<p class="hint" style="margin:.4rem 0">Antippen übernimmt den Namen ins Feld Modell.</p>' +
        '<div class="modelle">' + liste.map(m =>
          '<button class="mini" data-model="' + esc(m.id) + '">' + esc(m.name) + '</button>').join("") +
        '</div>';
      $$("#aiStatus [data-model]").forEach(b => b.onclick = () => {
        $("#apiModel").value = b.dataset.model;
        setModell(b.dataset.model);
        toast("Modell gesetzt: " + b.dataset.model);
      });
    } catch(e){ aiError(e.message, e.roh || letzteRohantwort || letzteAntwort); }
  };
  $("#testKey").onclick = async () => {
    aiBusy("Verbindung wird geprüft …");
    try {
      const antwort = await askClaude([{type:"text", text:"Antworte nur mit dem Wort: bereit"}], 20);
      aiDone();
      $("#aiStatus").className = "aistatus gut";
      $("#aiStatus").textContent = "Verbindung steht. Antwort: " + antwort.trim();
    } catch(e){ aiError(e.message, e.roh || letzteRohantwort || letzteAntwort); }
  };

  $("#fromPhoto").onclick = () => $("#photoFile").click();
  $("#photoFile").onchange = async ev => {
    const files = Array.from(ev.target.files || []);
    ev.target.value = "";
    if (!files.length) return;
    aiBusy("Claude liest das Foto …");
    try {
      const dish = await recipeFromPhotos(files);
      aiDone();
      $("#dKI").close();
      openEditor(null, dish);
      toast("Rezept erkannt — bitte prüfen");
    } catch(e){ aiError(e.message, e.roh || letzteRohantwort || letzteAntwort); }
  };

  $("#fromLink").onclick = async () => {
    const v = $("#linkInput").value.trim();
    if (!v){ toast("Link oder Text einfügen"); return; }
    aiBusy("Claude liest die Quelle …");
    try {
      const dish = await recipeFromText(v);
      aiDone();
      $("#dKI").close();
      openEditor(null, dish);
      toast("Rezept erkannt — bitte prüfen");
    } catch(e){ aiError(e.message, e.roh || letzteRohantwort || letzteAntwort); }
  };

  $("#stockPhoto").onclick = () => $("#stockFile").click();
  $("#stockFile").onchange = ev => {
    stockPhotos = Array.from(ev.target.files || []);
    $("#stockHint").textContent = stockPhotos.length
      ? stockPhotos.length + " Bild(er) ausgewählt"
      : "";
  };
  $("#doSuggest").onclick = async () => {
    aiBusy("Claude sieht sich den Vorrat an …");
    try {
      const list = await suggestFromStock($("#stockText").value.trim(), stockPhotos);
      aiDone();
      $("#aiOut").innerHTML = '<p class="lbl" style="margin-bottom:.5rem">Vorschläge</p>' +
        list.map(s => {
          const known = RECIPES.find(r => r.name.toLowerCase() === String(s.name).toLowerCase());
          return '<div class="sugg"><b>' + esc(s.name) + '</b>' +
            (known ? '<span class="tag">in der Kartei</span>' : '<span class="tag neu">neu</span>') +
            '<p>' + esc(s.warum || "") + '</p>' +
            ((s.fehlt && s.fehlt.length) ? '<p class="miss">fehlt noch: ' + esc(s.fehlt.join(", ")) + '</p>' : '') +
            (known ? '' : '<button class="mini" data-new="' + esc(s.name) + '">Rezept holen</button>') +
            '</div>';
        }).join("");
      $$("#aiOut [data-new]").forEach(b => b.onclick = async () => {
        aiBusy("Claude schreibt das Rezept …");
        try {
          const dish = await recipeFromText("Schreibe ein Rezept für: " + b.dataset.new);
          aiDone(); $("#dKI").close(); openEditor(null, dish);
        } catch(e){ aiError(e.message, e.roh || letzteRohantwort || letzteAntwort); }
      });
    } catch(e){ aiError(e.message, e.roh || letzteRohantwort || letzteAntwort); }
  };

  $("#openKI").onclick = () => {
    $("#aiOut").innerHTML = "";
    $("#aiStatus").textContent = apiKey() ? "" : "Noch kein API-Schlüssel hinterlegt.";
    $("#dKI").showModal();
  };
}
let stockPhotos = [];
function aiBusy(t){
  const el = $("#aiStatus");
  el.className = "aistatus busy";
  el.textContent = t;
}
function aiDone(){
  const el = $("#aiStatus");
  el.className = "aistatus";
  el.textContent = "";
}
function aiError(m, roh){
  const el = $("#aiStatus");
  el.className = "aistatus fehler";
  el.innerHTML = '<b>Es hat nicht geklappt</b><pre>' + esc(m) + '</pre>' +
    (roh ? '<details><summary>Vollständige Antwort des Servers</summary><pre>' +
      esc(String(roh).slice(0, 4000)) + '</pre></details>' +
      '<button class="mini" id="copyErr">Fehlertext kopieren</button>' : '');
  const btn = $("#copyErr");
  if (btn) btn.onclick = () => navigator.clipboard.writeText(String(roh)).then(
    () => toast("Fehlertext kopiert"), () => toast("Kopieren nicht möglich"));
}
