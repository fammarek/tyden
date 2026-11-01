/* ============================================================
   Týden — claude.js
   Rezept aus Foto oder Link, Vorschläge aus dem Vorrat.
   Der API-Schlüssel liegt ausschließlich lokal im Browser
   dieses Geräts und gehört nicht ins Repository.
   ============================================================ */

const K_API = "tyden.anthropic.key";
const MODEL = "claude-sonnet-4-5";

function apiKey(){ try { return localStorage.getItem(K_API) || ""; } catch(e){ return ""; } }
function setApiKey(k){ try { k ? localStorage.setItem(K_API, k) : localStorage.removeItem(K_API); } catch(e){} }

const SCHEMA = `{
  "name": "Name des Gerichts",
  "sub": "ein kurzer Satz, der das Gericht beschreibt",
  "cat": "fleisch | fisch | veg | suppe",
  "win": "alle | we",
  "time": Minuten als Zahl,
  "kh": geschätzte Kohlenhydrate pro Portion in Gramm als Zahl,
  "zut": [["Zutat", Menge als Zahl, "Einheit", "Warengruppe"], ...],
  "steps": ["Schritt 1", "Schritt 2", ...],
  "tipp": "ein praktischer Hinweis"
}`;

const REGELN = `Regeln:
- Mengen immer für 4 Portionen.
- Einheit ist eine von: "", "g", "kg", "ml", "l", "EL", "TL", "Stange", "Bund", "Kopf", "Zweige", "Blatt", "cm", "Prise", "Dose". Leerer String bedeutet Stück.
- Frische Kräuter in "Bund" oder "Zweige", getrocknete in "TL" oder "EL".
- Warengruppe ist eine von: "g" für Obst und Gemüse, "f" für Fleisch und Fisch, "m" für Kühlregal, "v" für Vorrat.
- win ist "we", wenn das Gericht nicht Low Carb ist und deshalb nur an Samstag oder Sonntag passen soll, sonst "alle".
- Schritte knapp und in ganzen Sätzen, höchstens sieben Stück, deutsch.
- Antworte ausschließlich mit dem JSON, ohne Fließtext und ohne Codeblock.`;

async function askClaude(content, maxTokens){
  const key = apiKey();
  if (!key) throw new Error("Kein API-Schlüssel hinterlegt. Einstellungen öffnen.");
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true"
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens || 2000,
      messages: [{role: "user", content: content}]
    })
  });
  if (!r.ok){
    let msg = "HTTP " + r.status;
    try { const e = await r.json(); if (e.error && e.error.message) msg = e.error.message; } catch(err){}
    throw new Error(msg);
  }
  const d = await r.json();
  return (d.content || []).filter(b => b.type === "text").map(b => b.text).join("");
}
function parseJson(text){
  const a = text.indexOf("{"), b = text.lastIndexOf("}");
  const c = text.indexOf("["), d = text.lastIndexOf("]");
  const obj = (a >= 0 && b > a) ? text.slice(a, b + 1) : null;
  const arr = (c >= 0 && d > c) ? text.slice(c, d + 1) : null;
  const pick = (obj && (!arr || a < c)) ? obj : arr;
  return JSON.parse(pick);
}
function toDish(j){
  return {
    id: "", name: j.name || "Ohne Namen", sub: j.sub || "",
    cat: ["fleisch","fisch","veg","suppe"].indexOf(j.cat) >= 0 ? j.cat : "veg",
    win: j.win === "we" ? "we" : "alle",
    time: Number(j.time) || 30, kh: Number(j.kh) || 0, ok: false,
    zut: (j.zut || []).map(z => [String(z[0] || ""), Number(z[1]) || 0, String(z[2] || ""), String(z[3] || "v")]),
    steps: (j.steps || []).map(String),
    tipp: j.tipp || ""
  };
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
    "Lies das Rezept auf den Bildern und gib es als JSON in genau dieser Form zurück:\n" +
    SCHEMA + "\n\n" + REGELN});
  const txt = await askClaude(parts, 2500);
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
    "Hier ist eine Rezeptquelle. Extrahiere daraus ein Rezept als JSON in genau dieser Form:\n" +
    SCHEMA + "\n\n" + REGELN + "\n\nQuelle:\n" + quelle}], 2500);
  return toDish(parseJson(txt));
}

/* ---------- Vorschläge aus dem Vorrat ---------- */
async function suggestFromStock(stockText, photos){
  const namen = RECIPES.map(r => r.name + " (" + CATS[r.cat].n + ", " + r.time + " Min.)").join("; ");
  const parts = [];
  for (const f of (photos || [])){
    parts.push({type: "image",
      source: {type: "base64", media_type: f.type || "image/jpeg", data: await fileToBase64(f)}});
  }
  parts.push({type: "text", text:
    "Das ist mein aktueller Vorrat:\n" + (stockText || "(siehe Bilder)") +
    "\n\nMeine Rezeptkartei enthält diese Gerichte:\n" + namen +
    "\n\nSchlage vier Gerichte vor, die ich damit heute oder morgen kochen kann. " +
    "Bevorzuge Gerichte aus meiner Kartei. Achte auf Low Carb, außer du kennzeichnest es als Wochenendgericht. " +
    "Antworte ausschließlich als JSON-Array in dieser Form, ohne Fließtext:\n" +
    '[{"name":"…","aus_kartei":true,"fehlt":["Zutat, die ich noch brauche"],"warum":"ein kurzer Satz"}]'});
  const txt = await askClaude(parts, 1500);
  return parseJson(txt);
}

/* ---------- Oberfläche ---------- */
function initClaude(){
  $("#apiKey").value = apiKey();
  $("#saveKey").onclick = () => {
    setApiKey($("#apiKey").value.trim());
    toast(apiKey() ? "Schlüssel gespeichert" : "Schlüssel entfernt");
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
    } catch(e){ aiError(e.message); }
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
    } catch(e){ aiError(e.message); }
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
        } catch(e){ aiError(e.message); }
      });
    } catch(e){ aiError(e.message); }
  };

  $("#openKI").onclick = () => {
    $("#aiOut").innerHTML = "";
    $("#aiStatus").textContent = apiKey() ? "" : "Noch kein API-Schlüssel hinterlegt.";
    $("#dKI").showModal();
  };
}
let stockPhotos = [];
function aiBusy(t){ $("#aiStatus").textContent = t; $("#aiStatus").classList.add("busy"); }
function aiDone(){ $("#aiStatus").textContent = ""; $("#aiStatus").classList.remove("busy"); }
function aiError(m){ $("#aiStatus").classList.remove("busy"); $("#aiStatus").textContent = "Fehler: " + m; }
