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
const UNITS = ["","g","kg","ml","l","EL","TL","Stange","Bund","Kopf","Zweige","Blatt","cm","Prise","Dose"];
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
function freeAt(day){ return week(keyOf(cur)).free[day] || ""; }
function dishOfDay(day){
  const w = week(keyOf(cur));
  const r = byId(w.days[day]);
  if (r) return r;
  const f = w.free[day];
  return f ? {name:f, free:true, time:0, kh:0, sub:"", zut:[], steps:[]} : null;
}
function setFree(day, name){
  const w = week(keyOf(cur));
  delete w.days[day];
  if (name) w.free[day] = name; else delete w.free[day];
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

/* ---------- Vorrat ---------- */
function baseName(name){ return String(name).normalize("NFC").split(",")[0].trim().toLowerCase(); }
function pantryList(){ return Array.isArray(DB.pantry) ? DB.pantry : DEFAULT_PANTRY; }
function isStaple(name, unit){
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
    const r = byId(w.days[day]);
    const f = w.free[day];
    const col = document.createElement("div");
    col.className = "daycol" + (we ? " we" : "") + (key === heute ? " today" : "");
    col.style.minHeight = "0";
    col.innerHTML =
      '<div class="dayhead"><b>' + DAYNAME[day] + '</b><span>' + fmtD(date) + '</span></div>' +
      '<div class="daybody"><div class="slot"></div>' +
        '<div class="rowacts">' +
          '<button data-roll="' + day + '" title="Neu würfeln">&#9861;</button>' +
          ((r || f) ? '<button data-clr="' + day + '" title="Leeren">&times;</button>' : '') +
        '</div>' +
      '</div>';

    const slot = col.querySelector(".slot");
    const b = document.createElement("button");
    if (r){
      b.className = "dish";
      b.style.background = colorOf(r);
      b.innerHTML =
        '<div class="c">' + CATS[r.cat].n + (r.win === "we" ? " &middot; Sa/So" : "") + '</div>' +
        '<div class="n">' + esc(r.name) + '</div>' +
        '<div class="m"><span>' + r.time + ' Min.</span><span>' +
          (r.todo ? "Rezept offen" : "ca. " + r.kh + " g KH") + '</span></div>';
      b.onclick = () => openRecipe(r);
    } else if (f){
      b.className = "dish freecard";
      b.innerHTML =
        '<div class="c">Freies Gericht</div>' +
        '<div class="n">' + esc(f) + '</div>' +
        '<div class="m"><span>ohne Rezept</span><span>nicht auf der Liste</span></div>';
      b.onclick = () => openPicker(day);
    } else {
      b.className = "empty";
      b.textContent = "Gericht wählen";
      b.onclick = () => openPicker(day);
    }
    slot.appendChild(b);
    grid.appendChild(col);
  });

  $$("#mealGrid [data-roll]").forEach(b => b.onclick = () => rollDay(b.dataset.roll));
  $$("#mealGrid [data-clr]").forEach(b => b.onclick = () => {
    const w2 = week(keyOf(cur));
    delete w2.days[b.dataset.clr];
    delete w2.free[b.dataset.clr];
    save(); renderMeals(); renderShop(); renderCal();
  });

  const we = RECIPES.filter(r => r.win === "we").length;
  const done = RECIPES.filter(r => r.ok).length;
  $("#poolInfo").textContent = RECIPES.length + " Gerichte · " + (RECIPES.length - we) +
    " ganze Woche · " + we + " nur Sa/So";
  $("#mealCounts").textContent = (Object.keys(w.days).length + Object.keys(w.free).length) +
    " von 7 Tagen belegt · " +
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
    if (w.free[d]) return;
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
let pickDay = null;
function openPicker(d){
  pickDay = d;
  $("#pickDay").textContent = DAYNAME[d];
  $("#pickSearch").value = "";
  $("#freeName").value = freeAt(d);
  drawPicker();
  $("#dPick").showModal();
}
function saveFree(){
  const n = $("#freeName").value.trim();
  setFree(pickDay, n);
  $("#dPick").close();
  renderMeals(); renderShop(); renderCal();
  toast(n ? "Eingetragen — ohne Zutaten" : "Tag geleert");
}
function drawPicker(){
  const q = $("#pickSearch").value.toLowerCase();
  const we = (pickDay === "Sa" || pickDay === "So");
  const list = RECIPES.filter(r => (we || r.win !== "we") && r.name.toLowerCase().indexOf(q) >= 0);
  $("#pickGrid").innerHTML = list.length ? list.map(r =>
    '<button data-id="' + r.id + '" style="background:' + colorOf(r) + '">' +
      '<div class="c">' + CATS[r.cat].n + '</div><div class="n">' + esc(r.name) + '</div>' +
      '<div class="m">' + r.time + ' Min.' + (r.todo ? " · Rezept offen" : " · " + r.kh + " g KH") + '</div>' +
    '</button>').join("") : '<p class="hint">Nichts gefunden.</p>';
  $$("#pickGrid button").forEach(b => b.onclick = () => {
    const w = week(keyOf(cur));
    Object.keys(w.days).forEach(d => { if (w.days[d] === b.dataset.id) delete w.days[d]; });
    delete w.free[pickDay];
    w.days[pickDay] = b.dataset.id;
    save(); $("#dPick").close(); renderMeals(); renderShop(); renderCal();
  });
}

/* ---------- Einkaufsliste ---------- */
function buildList(){
  const w = week(keyOf(cur)), sum = {};
  Object.values(w.days).forEach(id => {
    const r = byId(id);
    if (!r) return;
    r.zut.forEach(z => {
      const name = z[0], a = z[1], u = z[2], g = z[3] || "s";
      const key = name + "|" + u;
      if (!sum[key]) sum[key] = {key:key, n:name, u:u, g:g, a:0, pantry:isStaple(name, u)};
      sum[key].a += a;
    });
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
        '<label for="' + id + '"><span>' + esc(i.n) + '</span><b>' + amount(i.a, i.u, port) + '</b></label>' +
        '<button class="mini" data-pantry="' + esc(i.n) + '">Vorrat</button></div>';
    }).join("") + '</div>';
  }).join("");

  if (vorrat.length){
    html += '<details class="vorrat"><summary>' + vorrat.length +
      ' Positionen aus dem Vorrat — nicht auf der Liste</summary>' +
      vorrat.map(i => '<div class="item pantry"><span class="dotm"></span>' +
        '<label><span>' + esc(i.n) + '</span><b>' + amount(i.a, i.u, port) + '</b></label>' +
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
    t += "\n*" + GRP[g] + "*\n" + it.map(i => "• " + i.n + " — " + amount(i.a, i.u, port)).join("\n") + "\n";
  });
  const plan = DAYS.filter(d => w.days[d] || w.free[d])
    .map(d => d + ": " + (w.days[d] ? byId(w.days[d]).name : w.free[d]));
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
    Object.keys(w.days).forEach(d => { if (w.days[d] === editId) delete w.days[d]; });
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
    let inhalt;
    if (r){
      inhalt = '<div class="pm"><i>' + CATS[r.cat].n + '</i>' + esc(r.name) + '</div>' +
        '<div class="pe">' + r.time + ' Min.' + (r.todo ? "" : " · ca. " + r.kh + " g KH") + '</div>' +
        (r.sub ? '<div class="pn">' + esc(r.sub) + '</div>' : '');
    } else if (f){
      inhalt = '<div class="pm"><i>Freies Gericht</i>' + esc(f) + '</div>';
    } else {
      inhalt = '<div class="pn">noch frei</div>';
    }
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
      amount(i.a, i.u, port) + '</b></div>').join("") + '</div>';
  }).join("");
  const vorrat = items.filter(i => i.pantry).map(i => i.n).join(", ");
  return '<div class="psec">' + printHead("Einkaufsliste") +
    '<div class="pcols">' + (groups || "<p>Noch keine Gerichte geplant.</p>") + '</div>' +
    (vorrat ? '<div class="pnote">Aus dem Vorrat, nicht gekauft: ' + esc(vorrat) + '</div>' : '') +
    '</div>';
}
function printRezepte(){
  const w = week(keyOf(cur));
  const list = DAYS.filter(d => w.days[d]).map(d => byId(w.days[d])).filter(r => r && !r.todo);
  if (!list.length) return "";
  const port = Number(DB.settings.port);
  return '<div class="psec">' + printHead("Rezepte der Woche") + list.map(r =>
    '<div class="prec"><h3>' + esc(r.name) + '</h3>' +
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
    w.days = {}; w.free = {}; w.checked = {}; w.buy = {};
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
