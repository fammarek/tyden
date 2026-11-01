/* ============================================================
   Týden — essen.js
   Essensplan, Würfellogik, Rezeptkartei mit Review-Editor,
   Einkaufsliste mit Vorratslogik
   ============================================================ */

const CATS = {
  fleisch:{n:"Fleisch", c:"#6B2D4E"},
  fisch:  {n:"Fisch",   c:"#1F4A52"},
  veg:    {n:"Vegetarisch", c:"#2C5140"},
  suppe:  {n:"Suppe",   c:"#8A5320"}
};
const GRP = {g:"Obst & Gemüse", f:"Fleisch & Fisch", m:"Kühlregal", v:"Vorrat", s:"Sonstiges"};
const UNITS = ["","g","kg","ml","l","EL","TL","Stange","Bund","Kopf","Zweige","Blatt","cm","Prise",
               "Messerspitze","Päckchen","Dose"];
const FRESH_UNITS = ["Bund","Zweige","Kopf","Stange","Blatt"];

const K_RECS = "tyden.recipes.v1";
const BASE = (window.REZEPTE || []).map(r => JSON.parse(JSON.stringify(r)));
let RECIPES = (function(){
  try {
    const raw = localStorage.getItem(K_RECS);
    if (raw) return JSON.parse(raw);
  } catch(e){}
  return JSON.parse(JSON.stringify(BASE));
})();
function saveRecipes(){
  try { localStorage.setItem(K_RECS, JSON.stringify(RECIPES)); } catch(e){}
}

const byId = id => RECIPES.find(r => r.id === id);
const colorOf = r => (CATS[r.cat] || CATS.veg).c;
/* Jeder Tag hat zwei Plätze: 1 ist das Hauptgericht, 2 das zweite,
   etwa wenn die Erwachsenen anders essen als die Kinder. */
function feldNamen(slot){
  return slot === 2 ? {d:"days2", f:"free2"} : {d:"days", f:"free"};
}
function freeAt(day, slot){
  const n = feldNamen(slot || 1);
  return week(keyOf(cur))[n.f][day] || "";
}
function dishOfDay(day, slot){
  const w = week(keyOf(cur)), n = feldNamen(slot || 1);
  const r = byId(w[n.d][day]);
  if (r) return r;
  const f = w[n.f][day];
  return f ? {name:f, free:true, time:0, kh:0, sub:"", zut:[], steps:[]} : null;
}
function setFree(day, name, slot){
  const w = week(keyOf(cur)), n = feldNamen(slot || 1);
  delete w[n.d][day];
  if (name) w[n.f][day] = name; else delete w[n.f][day];
  save();
}
function clearSlot(day, slot){
  const w = week(keyOf(cur)), n = feldNamen(slot || 1);
  delete w[n.d][day];
  delete w[n.f][day];
  if ((slot || 1) === 1){          // ohne Hauptgericht rückt das zweite nach
    if (w.days2[day]){ w.days[day] = w.days2[day]; delete w.days2[day]; }
    else if (w.free2[day]){ w.free[day] = w.free2[day]; delete w.free2[day]; }
  }
  save();
}

/* ---------- Mengen ---------- */
function fmtAmount(n){
  if (n >= 50) return String(Math.round(n / 5) * 5);
  if (n >= 10) return String(Math.round(n));
  const v = Math.round(n * 2) / 2;
  return v === Math.round(v) ? String(v) : String(v).replace(".", ",");
}
function amount(a, u, port){
  if (!a) return "";
  const v = fmtAmount(a * port / 4);
  return u ? v + " " + u : v + "×";
}

/* ---------- Gleiche Zutaten zusammenzählen ----------
   Kommt dieselbe Zutat in mehreren Rezepten vor, steht sie einmal auf der
   Liste und die Mengen werden addiert. Kilogramm und Gramm, Liter und
   Milliliter werden dafür auf eine Basis gebracht. Zwecksätze wie
   "für den Belag" oder "zum Bestäuben" fallen weg, damit Butter nicht
   dreimal untereinander auftaucht. Lässt sich eine Einheit nicht umrechnen,
   etwa Esslöffel neben Gramm, stehen beide Mengen in derselben Zeile. */
const UNIT_BASE = {g:{b:"g",f:1}, kg:{b:"g",f:1000}, ml:{b:"ml",f:1}, l:{b:"ml",f:1000}};
function unitInfo(u){
  const k = String(u == null ? "" : u).trim();
  return UNIT_BASE[k] || {b:k, f:1};
}
const ZWECK = /\s*,?\s*\b(für|fürs|zum|zur|nach)\b\s+.*$/i;
function canonName(name){
  let s = String(name == null ? "" : name).normalize("NFC").replace(/\s+/g, " ").trim();
  s = s.replace(/\s*\([^)]*\)\s*$/, "").trim();
  const ohne = s.replace(ZWECK, "").trim();
  if (ohne.length >= 3) s = ohne;
  return s;
}
/* Eine Zutat in die Sammlung einhängen. mult skaliert das ganze Rezept. */
function addZut(sum, z, mult){
  const n = canonName(z[0]);
  if (!n) return;
  const a = Number(z[1]) || 0, u = z[2] || "", g = z[3] || "s";
  const key = n.toLowerCase();
  const inf = unitInfo(u);
  if (!sum[key]) sum[key] = {key:key, n:n, g:g, u:{}, pantry:true, klein:true};
  const it = sum[key];
  if (it.g === "s" && g !== "s") it.g = g;
  it.u[inf.b] = (it.u[inf.b] || 0) + a * inf.f * (mult || 1);
  it.pantry = it.pantry && isStaple(n, u);   // frische Ware zieht die Position auf die Liste
  it.klein = it.klein && KLEIN_UNITS.indexOf(u) >= 0;  // nur Löffel und Prisen, keine Gewichte
}
const KLEIN_UNITS = ["Prise","TL","EL","Messerspitze"];
function fmtEinheit(v, u){
  if (u === "g"  && v >= 1000) return fmtAmount(v / 1000) + " kg";
  if (u === "ml" && v >= 1000) return fmtAmount(v / 1000) + " l";
  if (!u) return fmtAmount(v) + "×";
  return fmtAmount(v) + " " + u;
}
/* Menge einer Position, über alle Einheiten hinweg. port skaliert von 4 hoch. */
function posText(it, port){
  const p = (Number(port) || 4) / 4;
  const rang = {g:0, ml:1, "":2};
  return Object.keys(it.u)
    .filter(u => it.u[u])
    .sort((a, b) => (rang[a] == null ? 8 : rang[a]) - (rang[b] == null ? 8 : rang[b]) ||
                    a.localeCompare(b, "de"))
    .map(u => fmtEinheit(it.u[u] * p, u))
    .join(" + ");
}

function tintHex(hex, a){
  const h = String(hex).replace("#","");
  const n = parseInt(h, 16);
  return "rgba(" + ((n >> 16) & 255) + "," + ((n >> 8) & 255) + "," + (n & 255) + "," + a + ")";
}

/* ---------- Vorrat ---------- */
function baseName(name){ return String(name).normalize("NFC").split(",")[0].trim().toLowerCase(); }
function pantryList(){ return Array.isArray(DB.pantry) ? DB.pantry : DEFAULT_PANTRY; }
function isStaple(name, unit){
  if (/^wasser$/i.test(canonName(name))) return true;   // Wasser kauft niemand
  if (FRESH_UNITS.indexOf(unit) >= 0) return false;
  if (/frisch/i.test(name)) return false;
  const b = baseName(name);
  return pantryList().some(function(t){
    t = String(t).normalize("NFC").trim().toLowerCase();
    if (!t) return false;
    if (b === t) return true;
    return t.length >= 2 && b.length > t.length && b.endsWith(t);
  });
}
function addToPantry(name){
  const b = baseName(name);
  if (pantryList().indexOf(b) < 0){ DB.pantry = pantryList().concat([b]); save(); }
}

/* ---------- Essensplan ---------- */
function renderMeals(){
  const grid = $("#mealGrid");
  const w = week(keyOf(cur));
  const dates = weekDates();
  const heute = iso(new Date(Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())));
  grid.innerHTML = "";

  dates.forEach(({day, date, key}) => {
    const we = (day === "Sa" || day === "So");
    const col = document.createElement("div");
    col.className = "daycol" + (we ? " we" : "") + (key === heute ? " today" : "");
    col.style.minHeight = "0";
    col.innerHTML =
      '<div class="dayhead"><b>' + DAYNAME[day] + '</b><span>' + fmtD(date) + '</span></div>' +
      '<div class="daybody"><div class="slots"></div>' +
        '<div class="rowacts">' +
          '<button data-roll="' + day + '" title="Neu würfeln">&#9861;</button>' +
        '</div>' +
      '</div>';
    const box = col.querySelector(".slots");

    [1, 2].forEach(slot => {
      const n = feldNamen(slot);
      const r = byId(w[n.d][day]);
      const f = w[n.f][day];
      if (!r && !f){
        if (slot === 1){
          const b = document.createElement("button");
          b.className = "empty";
          b.textContent = "Gericht wählen";
          b.onclick = () => openPicker(day, 1);
          box.appendChild(b);
        } else {
          const b = document.createElement("button");
          b.className = "addslot";
          b.textContent = "+ zweites Gericht";
          b.onclick = () => openPicker(day, 2);
          box.appendChild(b);
        }
        return;
      }
      const wrap = document.createElement("div");
      wrap.className = "slotwrap" + (slot === 2 ? " zweit" : "");
      const b = document.createElement("button");
      if (r){
        b.className = "dish";
        b.style.background = colorOf(r);
        b.innerHTML =
          '<div class="c">' + (slot === 2 ? "Zweites &middot; " : "") + CATS[r.cat].n +
            (r.win === "we" ? " &middot; Sa/So" : "") + '</div>' +
          '<div class="n">' + esc(r.name) + '</div>' +
          '<div class="m"><span>' + r.time + ' Min.</span><span>' +
            (r.todo ? "Rezept offen" : "ca. " + r.kh + " g KH") + '</span></div>';
        b.onclick = () => openRecipe(r);
      } else {
        b.className = "dish freecard";
        b.innerHTML =
          '<div class="c">' + (slot === 2 ? "Zweites &middot; " : "") + 'Freies Gericht</div>' +
          '<div class="n">' + esc(f) + '</div>' +
          '<div class="m"><span>ohne Rezept</span></div>';
        b.onclick = () => openPicker(day, slot);
      }
      const x = document.createElement("button");
      x.className = "slotx";
      x.innerHTML = "&times;";
      x.title = "Platz leeren";
      x.onclick = ev => {
        ev.stopPropagation();
        clearSlot(day, slot);
        renderMeals(); renderShop(); renderCal();
      };
      wrap.appendChild(b);
      wrap.appendChild(x);
      box.appendChild(wrap);
    });

    grid.appendChild(col);
  });

  $$("#mealGrid [data-roll]").forEach(b => b.onclick = () => rollDay(b.dataset.roll));
  const we = RECIPES.filter(r => r.win === "we").length;
  const done = RECIPES.filter(r => r.ok).length;
  $("#poolInfo").textContent = RECIPES.length + " Gerichte · " + (RECIPES.length - we) +
    " ganze Woche · " + we + " nur Sa/So";
  const belegt = new Set(Object.keys(w.days).concat(Object.keys(w.free))).size;
  const zweite = Object.keys(w.days2).length + Object.keys(w.free2).length;
  $("#mealCounts").textContent = belegt + " von 7 Tagen belegt" +
    (zweite ? " · " + (zweite === 1 ? "ein zweites Gericht" : zweite + " zweite Gerichte") : "") + " · " +
    done + " von " + RECIPES.length + " Rezepten geprüft";
}

/* ---------- Würfeln ---------- */
function recentIds(){
  const lock = Number(DB.settings.lock), out = new Set();
  for (let i = 1; i <= lock; i++){
    const w = DB.weeks[keyOf(shiftWeek(cur, -i))];
    if (w) Object.values(w.days).forEach(id => out.add(id));
  }
  return out;
}
function candidates(day, w, recent, relax){
  const used = new Set(Object.values(w.days));
  return RECIPES.filter(r => {
    if (used.has(r.id)) return false;
    if (r.win === "we" && !(day === "Sa" || day === "So")) return false;
    if (!relax && recent.has(r.id)) return false;
    return true;
  });
}
function pickFor(day, w, recent){
  let list = candidates(day, w, recent, false);
  if (!list.length) list = candidates(day, w, recent, true);
  if (!list.length) return null;

  const catCount = {};
  let longCount = 0;
  Object.values(w.days).forEach(id => {
    const r = byId(id);
    if (!r) return;
    catCount[r.cat] = (catCount[r.cat] || 0) + 1;
    if (r.time >= 90) longCount++;
  });
  const i = DAYS.indexOf(day);
  const nb = [DAYS[i-1], DAYS[i+1]].filter(Boolean)
    .map(d => byId(w.days[d])).filter(Boolean).map(r => r.cat);

  const scored = list.map(r => {
    let p = 0;
    if ((catCount[r.cat] || 0) >= 2) p += 2;
    if (nb.indexOf(r.cat) >= 0) p += 3;
    if (r.time >= 90 && !(day === "Sa" || day === "So")) p += 2;
    if (r.time >= 90 && longCount >= 1) p += 2;
    return {r:r, p:p};
  });
  const min = Math.min.apply(null, scored.map(s => s.p));
  const best = scored.filter(s => s.p === min);
  return best[Math.floor(Math.random() * best.length)].r;
}
function shuffle(a){
  a = a.slice();
  for (let i = a.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    const t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}
function rollWeek(){
  const w = week(keyOf(cur));
  w.days = {};
  const recent = recentIds();
  // Tage mit freiem Gericht bleiben, wie sie sind
  ["Sa","So"].concat(shuffle(["Mo","Di","Mi","Do","Fr"])).forEach(d => {
    if (w.free[d]) return;   // freie Gerichte und zweite Plätze bleiben unangetastet
    const r = pickFor(d, w, recent);
    if (r) w.days[d] = r.id;
  });
  save(); renderMeals(); renderShop(); renderCal(); toast("Woche gewürfelt");
}
function rollDay(d){
  const w = week(keyOf(cur));
  delete w.days[d];
  delete w.free[d];
  const r = pickFor(d, w, recentIds());
  if (r){ w.days[d] = r.id; save(); renderMeals(); renderShop(); renderCal(); }
  else toast("Kein passendes Gericht übrig — Sperrfrist verkürzen");
}

/* ---------- Rezeptansicht ---------- */
let recCurrent = null, recPort = 4;
function openRecipe(r){
  recCurrent = r;
  recPort = Number(DB.settings.port);
  $("#recTop").style.background = colorOf(r);
  $("#recCat").textContent = CATS[r.cat].n + (r.win === "we" ? " · nur Samstag/Sonntag" : " · ganze Woche");
  $("#recName").textContent = r.name;
  $("#recSub").textContent = r.sub || "";
  $("#recStats").innerHTML = "<span>" + r.time + " Min.</span>" +
    (r.todo ? "" : "<span>ca. " + r.kh + " g KH</span>") +
    (r.ok ? "<span>geprüft</span>" : "<span>Review offen</span>");
  drawRecipe();
  $("#recFoot").innerHTML =
    '<button class="btn" id="editThis">Bearbeiten</button>' +
    '<button class="btn ghost" id="okThis">' + (r.ok ? "Haken entfernen" : "Als geprüft markieren") + '</button>';
  $("#editThis").onclick = () => { $("#dRec").close(); openEditor(r.id); };
  $("#okThis").onclick = () => {
    r.ok = !r.ok; saveRecipes(); renderMeals();
    toast(r.ok ? "Als geprüft markiert" : "Haken entfernt");
    $("#dRec").close();
  };
  $("#dRec").showModal();
}
function drawRecipe(){
  const r = recCurrent, b = $("#recBody");
  if (r.todo && !r.steps.length){
    b.innerHTML = '<div class="todo">Für dieses Gericht steht noch kein Rezept in der Kartei.<br>' +
      esc(r.todo) + '</div>';
    return;
  }
  b.innerHTML =
    '<div class="pf"><span class="lbl">Portionen</span>' +
      '<button id="pMinus">&minus;</button><b id="pVal">' + recPort + '</b><button id="pPlus">+</button></div>' +
    '<p class="lbl" style="margin-bottom:.5rem">Zutaten</p>' +
    '<ul class="zut">' + r.zut.map(z =>
      '<li><span>' + esc(z[0]) + '</span><b>' + amount(z[1], z[2], recPort) + '</b></li>').join("") + '</ul>' +
    '<p class="lbl" style="margin-bottom:.5rem">Zubereitung</p>' +
    '<ol class="steps">' + r.steps.map(s => "<li>" + esc(s) + "</li>").join("") + '</ol>' +
    (r.tipp ? '<div class="tipp">' + esc(r.tipp) + '</div>' : '');
  $("#pMinus").onclick = () => { if (recPort > 2){ recPort -= 2; drawRecipe(); } };
  $("#pPlus").onclick  = () => { if (recPort < 8){ recPort += 2; drawRecipe(); } };
}

/* ---------- Auswahl ---------- */
let pickDay = null, pickSlot = 1;
function openPicker(d, slot){
  pickDay = d; pickSlot = slot || 1;
  $("#pickDay").textContent = DAYNAME[d] + (pickSlot === 2 ? " · zweites Gericht" : "");
  $("#pickTitle").textContent = pickSlot === 2 ? "Zweites Gericht wählen" : "Gericht wählen";
  $("#pickSearch").value = "";
  $("#pickHint").textContent = (d === "Sa" || d === "So")
    ? ""
    : "Alle " + RECIPES.length + " Gerichte stehen zur Wahl. Mit Sa/So gekennzeichnete würde der Würfel an diesem Tag nicht ziehen.";
  $("#freeName").value = freeAt(d, pickSlot);
  drawPicker();
  $("#dPick").showModal();
}
function saveFree(){
  const n = $("#freeName").value.trim();
  setFree(pickDay, n, pickSlot);
  $("#dPick").close();
  renderMeals(); renderShop(); renderCal();
  toast(n ? "Eingetragen — ohne Zutaten" : "Platz geleert");
}
function drawPicker(){
  const q = $("#pickSearch").value.toLowerCase();
  const we = (pickDay === "Sa" || pickDay === "So");
  // Bei der Auswahl von Hand steht alles zur Verfügung. Das Tagesfenster
  // bindet nur den Würfel; Wochenendgerichte werden hier lediglich markiert.
  const list = RECIPES.filter(r => r.name.toLowerCase().indexOf(q) >= 0);
  $("#pickGrid").innerHTML = list.length ? list.map(r => {
    const ausserhalb = (r.win === "we" && !we);
    return '<button data-id="' + r.id + '" class="' + (ausserhalb ? "ausserhalb" : "") +
      '" style="background:' + colorOf(r) + '">' +
      '<div class="c">' + CATS[r.cat].n + (r.win === "we" ? " &middot; Sa/So" : "") + '</div>' +
      '<div class="n">' + esc(r.name) + '</div>' +
      '<div class="m">' + r.time + ' Min.' + (r.todo ? " · Rezept offen" : " · " + r.kh + " g KH") + '</div>' +
    '</button>';
  }).join("") : '<p class="hint">Nichts gefunden.</p>';
  $$("#pickGrid button").forEach(b => b.onclick = () => {
    const w = week(keyOf(cur)), n = feldNamen(pickSlot);
    // dasselbe Gericht nicht zweimal in derselben Woche auf Platz 1
    if (pickSlot === 1){
      Object.keys(w.days).forEach(d => { if (w.days[d] === b.dataset.id) delete w.days[d]; });
    }
    delete w[n.f][pickDay];
    w[n.d][pickDay] = b.dataset.id;
    save(); $("#dPick").close(); renderMeals(); renderShop(); renderCal();
  });
}

/* ---------- Einkaufsliste ---------- */
function buildList(){
  const w = week(keyOf(cur)), sum = {};
  Object.values(w.days).concat(Object.values(w.days2 || {})).forEach(id => {
    const r = byId(id);
    if (!r) return;
    r.zut.forEach(z => addZut(sum, z, 1));
  });
  const buy = w.buy || {};
  Object.values(sum).forEach(i => { if (buy[i.key]) i.pantry = false; });
  return Object.values(sum).sort((x, y) => x.n.localeCompare(y.n, "de"));
}
function renderShop(){
  const w = week(keyOf(cur)), items = buildList(), port = Number(DB.settings.port);
  const kauf = items.filter(i => !i.pantry);
  const vorrat = items.filter(i => i.pantry);
  const open = kauf.filter(i => !w.checked[i.key]).length;

  $("#shopStats").textContent = Object.keys(w.days).length + " Gerichte · " + port + " Portionen · " +
    open + " offen · " + vorrat.length + " aus dem Vorrat";

  const body = $("#shopBody");
  if (!items.length){
    body.innerHTML = '<p class="hint">Noch keine Gerichte geplant. Im Tab Essen eine Woche würfeln.</p>';
    return;
  }
  let html = Object.keys(GRP).map(g => {
    const it = kauf.filter(i => i.g === g);
    if (!it.length) return "";
    return '<div class="grp"><h4 class="lbl">' + GRP[g] + '</h4>' + it.map((i, n) => {
      const on = !!w.checked[i.key], id = "ck_" + g + n;
      return '<div class="item' + (on ? " done" : "") + '">' +
        '<input type="checkbox" id="' + id + '" data-k="' + esc(i.key) + '"' + (on ? " checked" : "") + '>' +
        '<label for="' + id + '"><span>' + esc(i.n) + '</span><b>' + posText(i, port) + '</b></label>' +
        '<button class="mini" data-pantry="' + esc(i.n) + '">Vorrat</button></div>';
    }).join("") + '</div>';
  }).join("");

  if (vorrat.length){
    html += '<details class="vorrat"><summary>' + vorrat.length +
      ' Positionen aus dem Vorrat — nicht auf der Liste</summary>' +
      vorrat.map(i => '<div class="item pantry"><span class="dotm"></span>' +
        '<label><span>' + esc(i.n) + '</span><b>' + posText(i, port) + '</b></label>' +
        '<button class="mini" data-buy="' + esc(i.key) + '">kaufen</button></div>').join("") +
      '</details>';
  }
  body.innerHTML = html;

  $$("#shopBody input").forEach(cb => cb.onchange = () => {
    const w2 = week(keyOf(cur));
    if (cb.checked) w2.checked[cb.dataset.k] = 1; else delete w2.checked[cb.dataset.k];
    save(); renderShop();
  });
  $$("#shopBody [data-pantry]").forEach(b => b.onclick = () => {
    addToPantry(b.dataset.pantry); renderShop();
    toast("„" + baseName(b.dataset.pantry) + "“ gilt jetzt als vorrätig");
  });
  $$("#shopBody [data-buy]").forEach(b => b.onclick = () => {
    const w2 = week(keyOf(cur));
    w2.buy[b.dataset.buy] = 1;
    save(); renderShop();
  });
}
function listText(){
  const w = week(keyOf(cur)), port = Number(DB.settings.port);
  const items = buildList().filter(i => !i.pantry && !w.checked[i.key]);
  if (!items.length) return null;
  let t = "Einkauf KW " + cur.week + " (" + port + " Portionen)\n";
  Object.keys(GRP).forEach(g => {
    const it = items.filter(i => i.g === g);
    if (!it.length) return;
    t += "\n*" + GRP[g] + "*\n" + it.map(i => "• " + i.n + " — " + posText(i, port)).join("\n") + "\n";
  });
  const plan = DAYS.filter(d => w.days[d] || w.free[d] || w.days2[d] || w.free2[d]).map(d => {
    const eins = w.days[d] ? byId(w.days[d]).name : (w.free[d] || "");
    const zwei = w.days2[d] ? byId(w.days2[d]).name : (w.free2[d] || "");
    return d + ": " + eins + (zwei ? " / " + zwei : "");
  });
  if (plan.length) t += "\n*Plan*\n" + plan.join("\n");
  return t;
}

/* ---------- Kartei ---------- */
function openKartei(){
  $("#karteiSearch").value = "";
  drawKartei();
  $("#dKartei").showModal();
}
function drawKartei(){
  const q = $("#karteiSearch").value.toLowerCase();
  const done = RECIPES.filter(r => r.ok).length;
  $("#karteiStats").innerHTML = "<span>" + RECIPES.length + " Gerichte</span><span>" + done +
    " geprüft</span><span>" + RECIPES.filter(r => r.todo).length + " ohne Rezept</span>";
  const list = RECIPES.filter(r => r.name.toLowerCase().indexOf(q) >= 0);
  $("#karteiGrid").innerHTML = list.map(r =>
    '<button data-id="' + r.id + '" style="background:' + colorOf(r) + '">' +
      (r.ok ? '<span class="ok"></span>' : '') +
      '<div class="c">' + CATS[r.cat].n + (r.win === "we" ? " · Sa/So" : "") + '</div>' +
      '<div class="n">' + esc(r.name) + '</div>' +
      '<div class="m">' + r.time + ' Min.' + (r.todo ? " · Rezept offen" : " · " + r.kh + " g KH") + '</div>' +
    '</button>').join("");
  $$("#karteiGrid button").forEach(b => b.onclick = () => { $("#dKartei").close(); openEditor(b.dataset.id); });
}

/* ---------- Editor ---------- */
let editId = null;
function blankDish(){
  return {id:"", name:"", cat:"veg", win:"alle", time:30, kh:10, ok:false, sub:"", zut:[["",0,"","g"]], steps:[], tipp:""};
}
function slugify(s){
  return s.toLowerCase().replace(/ä/g,"ae").replace(/ö/g,"oe").replace(/ü/g,"ue").replace(/ß/g,"ss")
    .replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,40) || ("gericht-" + Date.now());
}
function openEditor(id, preset){
  editId = id;
  // der Backeditor hängt an denselben Knöpfen, deshalb hier wieder zurückbinden
  $("#saveDish").onclick = saveDish;
  $("#delDish").onclick = deleteDish;
  const r = id ? byId(id) : (preset || blankDish());
  $("#editTitle").textContent = id ? r.name : "Neues Gericht";
  $("#editBody").innerHTML =
    (r.todo ? '<div class="warn">Als „Rezept offen“ markiert (' + esc(r.todo) +
      '). Sobald Zutaten und Schritte eingetragen sind, verschwindet der Hinweis.</div>' : '') +
    '<div class="form">' +
      '<div class="field"><label class="lbl">Name</label><input id="e_name" value="' + esc(r.name) + '"></div>' +
      '<div class="field"><label class="lbl">Untertitel für die Karte</label><input id="e_sub" value="' + esc(r.sub) + '"></div>' +
      '<div class="f4">' +
        '<div class="field"><label class="lbl">Kategorie</label><select id="e_cat">' +
          Object.keys(CATS).map(c => '<option value="' + c + '"' + (r.cat === c ? " selected" : "") + '>' + CATS[c].n + '</option>').join("") +
        '</select></div>' +
        '<div class="field"><label class="lbl">Tage</label><select id="e_win">' +
          '<option value="alle"' + (r.win === "alle" ? " selected" : "") + '>ganze Woche</option>' +
          '<option value="we"' + (r.win === "we" ? " selected" : "") + '>nur Sa/So</option></select></div>' +
        '<div class="field"><label class="lbl">Minuten</label><input id="e_time" type="number" min="5" max="600" value="' + r.time + '"></div>' +
        '<div class="field"><label class="lbl">g KH / Portion</label><input id="e_kh" type="number" min="0" max="200" value="' + r.kh + '"></div>' +
      '</div>' +
      '<div class="field"><label class="lbl">Zutaten für 4 Portionen</label><div id="e_zut"></div>' +
        '<button class="btn ghost" id="addZut" style="margin-top:.4rem">Zutat hinzufügen</button></div>' +
      '<div class="field"><label class="lbl">Zubereitung — ein Schritt pro Zeile</label>' +
        '<textarea id="e_steps" rows="9">' + esc(r.steps.join("\n")) + '</textarea></div>' +
      '<div class="field"><label class="lbl">Tipp</label><textarea id="e_tipp" rows="2">' + esc(r.tipp || "") + '</textarea></div>' +
      '<label class="chk"><input type="checkbox" id="e_ok"' + (r.ok ? " checked" : "") + '> im Review geprüft</label>' +
    '</div>';
  drawZutRows(r.zut.length ? r.zut : [["",0,"","g"]]);
  $("#addZut").onclick = () => { const z = readZut(); z.push(["",0,"","g"]); drawZutRows(z); };
  $("#delDish").style.display = id ? "" : "none";
  $("#dEdit").showModal();
}
function drawZutRows(z){
  $("#e_zut").innerHTML = z.map((row, i) =>
    '<div class="zrow">' +
      '<input data-f="a" type="number" step="0.5" min="0" value="' + (row[1] || "") + '" placeholder="Menge">' +
      '<select data-f="u">' + UNITS.map(u =>
        '<option value="' + u + '"' + (row[2] === u ? " selected" : "") + '>' + (u || "Stück") + '</option>').join("") + '</select>' +
      '<input data-f="n" value="' + esc(row[0]) + '" placeholder="Zutat">' +
      '<select data-f="g">' + Object.keys(GRP).map(g =>
        '<option value="' + g + '"' + ((row[3] || "s") === g ? " selected" : "") + '>' + GRP[g] + '</option>').join("") + '</select>' +
      '<button data-del="' + i + '">&times;</button>' +
    '</div>').join("");
  $$("#e_zut [data-del]").forEach(b => b.onclick = () => {
    const rows = readZut();
    rows.splice(Number(b.dataset.del), 1);
    drawZutRows(rows.length ? rows : [["",0,"","g"]]);
  });
}
function readZut(){
  return $$("#e_zut .zrow").map(el => [
    el.querySelector('[data-f="n"]').value.trim(),
    parseFloat(el.querySelector('[data-f="a"]').value) || 0,
    el.querySelector('[data-f="u"]').value,
    el.querySelector('[data-f="g"]').value
  ]);
}
function saveDish(){
  const name = $("#e_name").value.trim();
  if (!name){ toast("Name fehlt"); return; }
  const zut = readZut().filter(z => z[0]);
  const steps = $("#e_steps").value.split("\n").map(s => s.trim()).filter(Boolean);
  const dish = {
    id: editId || slugify(name), name: name,
    cat: $("#e_cat").value, win: $("#e_win").value,
    time: Number($("#e_time").value) || 30, kh: Number($("#e_kh").value) || 0,
    ok: $("#e_ok").checked, sub: $("#e_sub").value.trim(),
    zut: zut, steps: steps, tipp: $("#e_tipp").value.trim()
  };
  if (!zut.length || !steps.length){
    const old = editId ? byId(editId) : null;
    dish.todo = (old && old.todo) ? old.todo : "Rezept fehlt noch";
  }
  if (editId){
    RECIPES[RECIPES.findIndex(r => r.id === editId)] = dish;
  } else {
    if (byId(dish.id)) dish.id = dish.id + "-" + Date.now().toString().slice(-4);
    RECIPES.push(dish);
  }
  saveRecipes();
  $("#dEdit").close();
  renderMeals(); renderShop();
  toast(editId ? "Gespeichert" : "Gericht angelegt");
}
function deleteDish(){
  if (!editId) return;
  const r = byId(editId);
  if (!confirm("„" + r.name + "“ wirklich löschen?")) return;
  RECIPES = RECIPES.filter(x => x.id !== editId);
  Object.values(DB.weeks).forEach(w => {
    Object.keys(w.days || {}).forEach(d => { if (w.days[d] === editId) delete w.days[d]; });
    Object.keys(w.days2 || {}).forEach(d => { if (w.days2[d] === editId) delete w.days2[d]; });
  });
  saveRecipes(); save();
  $("#dEdit").close(); renderMeals(); renderShop();
  toast("Gericht gelöscht");
}
function exportRecipes(){
  const head = "/* Zdravé meníčko — Rezeptdaten\n   Export vom " +
    new Date().toLocaleString("de-DE") + "\n   Ersetzt die bisherige rezepte.js. */\n";
  download("rezepte.js", head + "window.REZEPTE = " + JSON.stringify(RECIPES, null, 1) + ";\n",
    "application/javascript;charset=utf-8");
  toast("rezepte.js exportiert");
}

/* ---------- Druckteile ---------- */
function printEssen(){
  const w = week(keyOf(cur));
  const cols = weekDates().map(({day, date}) => {
    const r = byId(w.days[day]);
    const f = w.free[day];
    const r2 = byId(w.days2[day]);
    const f2 = w.free2[day];
    let inhalt;
    if (r){
      inhalt = '<div class="pm" style="border-left-color:' + CATS[r.cat].c +
        ';background:' + tintHex(CATS[r.cat].c, .13) + '"><i style="color:' + CATS[r.cat].c + '">' +
        CATS[r.cat].n + '</i>' + esc(r.name) + '</div>' +
        '<div class="pe">' + r.time + ' Min.' + (r.todo ? "" : " · ca. " + r.kh + " g KH") + '</div>' +
        (r.sub ? '<div class="pn">' + esc(r.sub) + '</div>' : '');
    } else if (f){
      inhalt = '<div class="pm"><i>Freies Gericht</i>' + esc(f) + '</div>';
    } else {
      inhalt = '<div class="pn">noch frei</div>';
    }
    if (r2) inhalt += '<div class="pm zweit" style="border-left-color:' + CATS[r2.cat].c +
      ';background:' + tintHex(CATS[r2.cat].c, .10) + '"><i>Zweites Gericht · ' + CATS[r2.cat].n +
      '</i>' + esc(r2.name) + '</div>' +
      '<div class="pe">' + r2.time + ' Min.' + (r2.todo ? "" : " · ca. " + r2.kh + " g KH") + '</div>';
    else if (f2) inhalt += '<div class="pm zweit"><i>Zweites Gericht</i>' + esc(f2) + '</div>';
    return '<div class="pday"><h4>' + DAYNAME[day] + '</h4><div class="pd">' + fmtD(date) + '</div>' +
      inhalt + '</div>';
  }).join("");
  return '<div class="psec">' + printHead("Essensplan") + '<div class="pweek">' + cols + '</div></div>';
}
function printEinkauf(){
  const w = week(keyOf(cur)), items = buildList(), port = Number(DB.settings.port);
  const kauf = items.filter(i => !i.pantry);
  const groups = Object.keys(GRP).map(g => {
    const it = kauf.filter(i => i.g === g);
    if (!it.length) return "";
    return '<div class="pgrp"><h4>' + GRP[g] + '</h4>' + it.map(i =>
      '<div class="pi"><span class="pbox"></span><span>' + esc(i.n) + '</span><b>' +
      posText(i, port) + '</b></div>').join("") + '</div>';
  }).join("");
  const vorrat = items.filter(i => i.pantry).map(i => i.n).join(", ");
  return '<div class="psec">' + printHead("Einkaufsliste") +
    '<div class="pcols">' + (groups || "<p>Noch keine Gerichte geplant.</p>") + '</div>' +
    (vorrat ? '<div class="pnote">Aus dem Vorrat, nicht gekauft: ' + esc(vorrat) + '</div>' : '') +
    '</div>';
}
function printRezepte(){
  const w = week(keyOf(cur));
  const list = DAYS.filter(d => w.days[d]).map(d => byId(w.days[d]))
    .concat(DAYS.filter(d => w.days2[d]).map(d => byId(w.days2[d])))
    .filter(r => r && !r.todo);
  if (!list.length) return "";
  const port = Number(DB.settings.port);
  return '<div class="psec">' + printHead("Rezepte der Woche") + list.map(r =>
    '<div class="prec" style="border-left:2.5pt solid ' + CATS[r.cat].c + ';padding-left:3mm">' +
    '<h3 style="color:' + CATS[r.cat].c + '">' + esc(r.name) + '</h3>' +
    '<div class="pd">' + CATS[r.cat].n + ' · ' + r.time + ' Min. · ' + port + ' Portionen</div>' +
    '<div class="pz">' + r.zut.map(z => '<div><span>' + esc(z[0]) + '</span><b>' +
      amount(z[1], z[2], port) + '</b></div>').join("") + '</div>' +
    '<ol>' + r.steps.map(s => '<li>' + esc(s) + '</li>').join("") + '</ol>' +
    (r.tipp ? '<div class="pnote">' + esc(r.tipp) + '</div>' : '') + '</div>').join("") + '</div>';
}

/* ---------- Ereignisse ---------- */
function initEssen(){
  $("#lock").value = DB.settings.lock;
  $("#defPort").value = DB.settings.port;
  $("#roll").onclick = rollWeek;
  $("#clearMeals").onclick = () => {
    const w = week(keyOf(cur));
    w.days = {}; w.free = {}; w.days2 = {}; w.free2 = {}; w.checked = {}; w.buy = {};
    save(); renderMeals(); renderShop(); renderCal();
  };
  $("#openKartei").onclick = openKartei;
  $("#lock").onchange = e => { DB.settings.lock = Number(e.target.value); save(); };
  $("#defPort").onchange = e => { DB.settings.port = Number(e.target.value); save(); renderShop(); };
  $("#pickSearch").oninput = drawPicker;
  $("#freeSave").onclick = saveFree;
  $("#freeName").onkeydown = e => { if (e.key === "Enter") saveFree(); };
  $("#karteiSearch").oninput = drawKartei;
  $("#newDish").onclick = () => { $("#dKartei").close(); openEditor(null); };
  $("#saveDish").onclick = saveDish;
  $("#delDish").onclick = deleteDish;
  $("#exportJs").onclick = exportRecipes;
  $("#resetAll").onclick = () => {
    if (!confirm("Alle Änderungen an den Rezepten verwerfen?")) return;
    RECIPES = JSON.parse(JSON.stringify(BASE));
    saveRecipes(); $("#dKartei").close(); renderMeals(); renderShop();
    toast("Rezepte zurückgesetzt");
  };
  $("#waShare").onclick = () => {
    const t = listText();
    if (!t){ toast("Nichts offen auf der Liste"); return; }
    window.open("https://wa.me/?text=" + encodeURIComponent(t), "_blank");
  };
  $("#copyList").onclick = () => {
    const t = listText();
    if (!t){ toast("Nichts offen"); return; }
    navigator.clipboard.writeText(t).then(() => toast("Liste kopiert"), () => toast("Kopieren nicht möglich"));
  };
  $("#resetChecks").onclick = () => { week(keyOf(cur)).checked = {}; save(); renderShop(); };
  $("#editPantry").onclick = () => { $("#pantryText").value = pantryList().join("\n"); $("#dPantry").showModal(); };
  $("#savePantry").onclick = () => {
    DB.pantry = $("#pantryText").value.split("\n").map(x => x.trim().toLowerCase()).filter(Boolean);
    save(); $("#dPantry").close(); renderShop(); toast("Vorrat gespeichert");
  };
  $("#resetPantry").onclick = () => { $("#pantryText").value = DEFAULT_PANTRY.join("\n"); };
}
