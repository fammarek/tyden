/* ============================================================
   Týden — Wochenplan
   app.js: Gerüst, Kalenderwoche, Jahreszeiten, Kalender-Tab,
           Google-Anbindung, Druck
   ============================================================ */

const DAYS = ["Mo","Di","Mi","Do","Fr","Sa","So"];
const DAYNAME = {Mo:"Montag",Di:"Dienstag",Mi:"Mittwoch",Do:"Donnerstag",Fr:"Freitag",Sa:"Samstag",So:"Sonntag"};
const SEASONS = {fruehling:"Frühling", sommer:"Sommer", herbst:"Herbst", winter:"Winter"};

const $  = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));

function esc(s){
  return String(s == null ? "" : s)
    .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}
function toast(msg){
  const e = $("#toast");
  e.textContent = msg;
  e.classList.add("on");
  clearTimeout(e._t);
  e._t = setTimeout(() => e.classList.remove("on"), 2400);
}

/* ---------- Speicher ---------- */
const KEY = "tyden.v1";
let memOnly = false;

const DEFAULT_PANTRY = [
  "salz","pfeffer","pfefferkörner","öl","butter","schmalz","mehl","zucker","essig","senf",
  "paprikapulver","oregano","majoran","kümmel","kreuzkümmel","muskat","lorbeerblätter",
  "chiliflocken","knoblauchpulver","zwiebelpulver","erythrit","semmelbrösel","flohsamenschalen",
  "tomatenmark","brühe","sojasauce","fischsauce","honig","zimt","gyrosgewürz"
];

let DB = {
  weeks: {},        // KW -> {days:{Mo:dishId}, checked:{}, buy:{}}
  notes: {},        // "YYYY-MM-DD" -> Tagesnotiz, wochenübergreifend abgelegt
  settings: {lock:2, port:4, clientId:"", cals:[]},
  pantry: DEFAULT_PANTRY.slice()
};

function load(){
  try {
    const raw = localStorage.getItem(KEY);
    if (raw){
      const got = JSON.parse(raw);
      DB = Object.assign(DB, got);
      DB.settings = Object.assign({lock:2, port:4, clientId:"", cals:[]}, got.settings || {});
      if (!DB.notes) DB.notes = {};
      if (!Array.isArray(DB.pantry)) DB.pantry = DEFAULT_PANTRY.slice();
    }
  } catch(e){ memOnly = true; }
}
function save(){
  try { localStorage.setItem(KEY, JSON.stringify(DB)); }
  catch(e){
    if (!memOnly){ memOnly = true; toast("Speichern im Browser blockiert — bitte Sicherung nutzen"); }
  }
}
function week(k){
  if (!DB.weeks[k]) DB.weeks[k] = {days:{}, free:{}, checked:{}, buy:{}};
  const w = DB.weeks[k];
  if (!w.checked) w.checked = {};
  if (!w.buy) w.buy = {};
  if (!w.free) w.free = {};   // Tage ohne Rezept, nur ein Name
  return w;
}

/* ---------- Kalenderwoche ---------- */
function isoWeek(d){
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dn = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - dn);
  const y0 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  return {year: t.getUTCFullYear(), week: Math.ceil(((t - y0) / 86400000 + 1) / 7)};
}
function mondayOf(year, wk){
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const dn = jan4.getUTCDay() || 7;
  const mon = new Date(jan4);
  mon.setUTCDate(jan4.getUTCDate() - dn + 1 + (wk - 1) * 7);
  return mon;
}
function shiftWeek(w, delta){
  const m = mondayOf(w.year, w.week);
  m.setUTCDate(m.getUTCDate() + delta * 7);
  return isoWeek(new Date(m.getUTCFullYear(), m.getUTCMonth(), m.getUTCDate()));
}
const keyOf = w => w.year + "-W" + String(w.week).padStart(2,"0");
const iso = d => d.toISOString().slice(0,10);
const fmtD = d => d.getUTCDate() + "." + (d.getUTCMonth() + 1) + ".";
function parseISO(s){ return new Date(s + "T00:00:00Z"); }

let cur = (function(){
  const now = new Date(), w = isoWeek(now);
  return (now.getDay() === 0) ? shiftWeek(w, 1) : w;   // sonntags wird die kommende Woche geplant
})();

function weekDates(){
  const mon = mondayOf(cur.year, cur.week);
  return DAYS.map((d, i) => {
    const dt = new Date(mon);
    dt.setUTCDate(mon.getUTCDate() + i);
    return {day: d, date: dt, key: iso(dt)};
  });
}

/* ---------- Jahreszeit ---------- */
function seasonOf(date){
  const m = date.getUTCMonth() + 1;
  if (m >= 3 && m <= 5) return "fruehling";
  if (m >= 6 && m <= 8) return "sommer";
  if (m >= 9 && m <= 11) return "herbst";
  return "winter";
}
function applySeason(){
  const s = seasonOf(mondayOf(cur.year, cur.week));
  document.documentElement.dataset.season = s;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", getComputedStyle(document.body).backgroundColor);
  return s;
}

/* ---------- Termine ---------- */
/* Termine kommen ausschließlich aus Google und werden nur gelesen. */
let GOOGLE_EVENTS = [];

function eventsOn(dayKey){
  return GOOGLE_EVENTS
    .filter(e => dayKey >= e.start && dayKey <= e.end)
    .sort((a, b) => (a.from || "00:00").localeCompare(b.from || "00:00"));
}

/* Beschriftung: an den Wochenrändern "seit"/"bis", sonst Uhrzeit */
function eventLabel(ev, dayKey, firstKey, lastKey){
  const mehrtaegig = ev.end > ev.start;
  if (mehrtaegig){
    if (dayKey === firstKey && ev.start < firstKey)
      return "seit " + fmtD(parseISO(ev.start));
    if (dayKey === lastKey && ev.end > lastKey)
      return "bis " + fmtD(parseISO(ev.end));
    if (dayKey === ev.start) return "ab " + (ev.from || "ganztägig");
    if (dayKey === ev.end)   return "bis " + (ev.to || "Tagesende");
    return "läuft";
  }
  if (ev.from && ev.to) return ev.from + " – " + ev.to;
  if (ev.from) return "ab " + ev.from;
  return "ganztägig";
}

/* ---------- Kalender-Tab ---------- */
function renderCal(){
  const grid = $("#calGrid");
  const dates = weekDates();
  const firstKey = dates[0].key, lastKey = dates[6].key;
  const heute = iso(new Date(Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())));
  grid.innerHTML = "";

  dates.forEach(({day, date, key}) => {
    const we = (day === "Sa" || day === "So");
    const col = document.createElement("div");
    col.className = "daycol" + (we ? " we" : "") + (key === heute ? " today" : "");

    const evs = eventsOn(key);
    col.innerHTML =
      '<div class="dayhead"><b>' + DAYNAME[day] + '</b><span>' + fmtD(date) + '</span></div>' +
      '<div class="daybody">' +
        (evs.length
          ? evs.map(ev =>
              '<div class="ev g">' +
                '<time>' + esc(eventLabel(ev, key, firstKey, lastKey)) + '</time>' +
                '<b>' + esc(ev.text) + '</b>' +
                (ev.note ? '<time>' + esc(ev.note) + '</time>' : '') +
              '</div>').join("")
          : '<div class="noev">' + (gToken ? "keine Termine" : "nicht verbunden") + '</div>') +
        '<textarea class="daynote" data-note="' + key + '" placeholder="Notiz">' +
          esc(DB.notes[key] || "") + '</textarea>' +
      '</div>';
    grid.appendChild(col);
  });

  $$("#calGrid .daynote").forEach(t => {
    t.oninput = () => {
      const k = t.dataset.note;
      if (t.value.trim()) DB.notes[k] = t.value; else delete DB.notes[k];
      clearTimeout(t._t);
      t._t = setTimeout(save, 400);
    };
  });
}

/* ---------- Google Kalender, nur lesend ---------- */
let gToken = null, gTokenClient = null;

function gStatus(text, ok){
  const el = $("#gStatus");
  el.textContent = text;
  el.classList.toggle("on", !!ok);
}
function loadGis(){
  return new Promise((resolve, reject) => {
    if (window.google && google.accounts) return resolve();
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.onload = resolve;
    s.onerror = () => reject(new Error("Google-Skript nicht erreichbar"));
    document.head.appendChild(s);
  });
}
async function gConnect(){
  const id = ($("#gClientId").value || "").trim();
  if (!id){ gStatus("Bitte zuerst eine Client-ID eintragen."); return; }
  DB.settings.clientId = id; save();
  try {
    await loadGis();
  } catch(e){
    gStatus("Google ist gerade nicht erreichbar. Ohne Netz bleibt der Rest der App nutzbar.");
    return;
  }
  gTokenClient = google.accounts.oauth2.initTokenClient({
    client_id: id,
    scope: "https://www.googleapis.com/auth/calendar.readonly",
    callback: resp => {
      if (resp && resp.access_token){
        gToken = resp.access_token;
        sessionStorage.setItem("tyden.gtoken", gToken);
        gStatus("Verbunden. Termine werden geladen.", true);
        loadGoogleEvents().then(() => { renderCal(); toast("Google-Termine geladen"); });
      } else {
        gStatus("Anmeldung abgebrochen.");
      }
    }
  });
  gTokenClient.requestAccessToken();
}
function gDisconnect(){
  gToken = null;
  GOOGLE_EVENTS = [];
  sessionStorage.removeItem("tyden.gtoken");
  gStatus("Getrennt. Es werden keine Google-Termine angezeigt.");
  renderCal();
}
async function gFetch(url){
  const r = await fetch(url, {headers: {Authorization: "Bearer " + gToken}});
  if (r.status === 401){ gToken = null; throw new Error("Anmeldung abgelaufen"); }
  if (!r.ok) throw new Error("Google antwortet mit " + r.status);
  return r.json();
}
async function loadGoogleEvents(){
  if (!gToken){ GOOGLE_EVENTS = []; return; }
  const dates = weekDates();
  const min = new Date(dates[0].date); min.setUTCDate(min.getUTCDate() - 1);
  const max = new Date(dates[6].date); max.setUTCDate(max.getUTCDate() + 2);
  try {
    const cl = await gFetch("https://www.googleapis.com/calendar/v3/users/me/calendarList");
    const cals = (cl.items || []).filter(c => c.selected !== false);
    const all = [];
    for (const c of cals){
      const u = "https://www.googleapis.com/calendar/v3/calendars/" + encodeURIComponent(c.id) +
        "/events?singleEvents=true&orderBy=startTime&maxResults=100" +
        "&timeMin=" + encodeURIComponent(min.toISOString()) +
        "&timeMax=" + encodeURIComponent(max.toISOString());
      const d = await gFetch(u);
      (d.items || []).forEach(ev => {
        const sD = ev.start && (ev.start.date || ev.start.dateTime);
        const eD = ev.end && (ev.end.date || ev.end.dateTime);
        if (!sD) return;
        const ganztag = !!(ev.start.date);
        let endKey = (eD || sD).slice(0,10);
        if (ganztag){                              // Google endet bei Ganztagsterminen am Folgetag
          const x = parseISO(endKey); x.setUTCDate(x.getUTCDate() - 1); endKey = iso(x);
        }
        all.push({
          id: ev.id, text: ev.summary || "ohne Titel",
          note: ev.location || "",
          start: sD.slice(0,10), end: endKey < sD.slice(0,10) ? sD.slice(0,10) : endKey,
          from: ganztag ? "" : sD.slice(11,16),
          to:   ganztag ? "" : (eD || "").slice(11,16)
        });
      });
    }
    GOOGLE_EVENTS = all;
    gStatus("Verbunden — " + all.length + " Termine in dieser Woche.", true);
  } catch(err){
    GOOGLE_EVENTS = [];
    gStatus("Konnte nicht laden: " + err.message);
  }
}

/* ---------- Tabs ---------- */
let activeTab = "kalender";
function setTab(name){
  activeTab = name;
  $$(".tab").forEach(t => t.classList.toggle("on", t.dataset.tab === name));
  $$(".view").forEach(v => v.classList.toggle("hidden", v.id !== "view-" + name));
  if (name === "notizen") sizePad();
}

/* ---------- Gesamtausgabe ---------- */
function renderAll(){
  applySeason();
  const mon = mondayOf(cur.year, cur.week);
  const sun = new Date(mon); sun.setUTCDate(mon.getUTCDate() + 6);
  $("#kwTitle").textContent = "KW " + cur.week;
  $("#kwRange").textContent = fmtD(mon) + " – " + fmtD(sun) + sun.getUTCFullYear();
  renderCal();
  renderMeals();
  renderShop();
  renderNotes();
}
function gotoWeek(delta){
  cur = shiftWeek(cur, delta);
  renderAll();
  if (gToken) loadGoogleEvents().then(renderCal);
}

/* ---------- Drucken ---------- */
function printHead(title){
  const mon = mondayOf(cur.year, cur.week);
  const sun = new Date(mon); sun.setUTCDate(mon.getUTCDate() + 6);
  return '<div class="phead"><h1>' + title + '</h1><span>KW ' + cur.week + " · " +
    fmtD(mon) + " – " + fmtD(sun) + sun.getUTCFullYear() + '</span></div>';
}
function printWochenplan(){
  const dates = weekDates();
  const firstKey = dates[0].key, lastKey = dates[6].key;
  const cols = dates.map(({day, date, key}) => {
    const evs = eventsOn(key);
    const dish = typeof dishOfDay === "function" ? dishOfDay(day) : null;
    return '<div class="pday"><h4>' + DAYNAME[day] + '</h4><div class="pd">' + fmtD(date) + '</div>' +
      (dish ? '<div class="pm"><i>Essen</i>' + esc(dish.name) + '</div>' : '') +
      evs.map(ev => '<div class="pe"><i>' + esc(eventLabel(ev, key, firstKey, lastKey)) + '</i>' +
        esc(ev.text) + '</div>').join("") +
      (DB.notes[key] ? '<div class="pn">' + esc(DB.notes[key]) + '</div>' : '') +
      '</div>';
  }).join("");
  return '<div class="psec">' + printHead("Wochenplan") + '<div class="pweek">' + cols + '</div></div>';
}
function doPrint(){
  const parts = [];
  if ($("#pr_wochenplan").checked) parts.push(printWochenplan());
  if ($("#pr_essen").checked)      parts.push(printEssen());
  if ($("#pr_einkauf").checked)    parts.push(printEinkauf());
  if ($("#pr_rezepte").checked)    parts.push(printRezepte());
  if ($("#pr_notizen").checked)    parts.push(printNotizen());
  if (!parts.length){ toast("Bitte mindestens einen Bereich wählen"); return; }
  $("#print").innerHTML = parts.join("");
  $("#dPrint").close();
  setTimeout(() => window.print(), 120);
}

/* ---------- Sicherung ---------- */
function download(name, text, type){
  const blob = new Blob([text], {type: type || "text/plain;charset=utf-8"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}

/* ---------- Start ---------- */
function start(){
  load();
  applySeason();

  $("#prev").onclick = () => gotoWeek(-1);
  $("#next").onclick = () => gotoWeek(1);
  $("#today").onclick = () => { cur = isoWeek(new Date()); renderAll(); if (gToken) loadGoogleEvents().then(renderCal); };
  $$(".tab").forEach(t => t.onclick = () => setTab(t.dataset.tab));

  $("#openPrint").onclick = () => { $("#printKw").textContent = "KW " + cur.week; $("#dPrint").showModal(); };
  $("#doPrint").onclick = doPrint;

  $("#openSettings").onclick = () => {
    $("#gClientId").value = DB.settings.clientId || "";
    if (!gToken) gStatus(DB.settings.clientId
      ? "Noch nicht verbunden."
      : "Keine Client-ID hinterlegt — siehe README.md.");
    $("#dSettings").showModal();
  };
  $("#gConnect").onclick = gConnect;
  $("#gDisconnect").onclick = gDisconnect;

  $("#backup").onclick = () => download("tyden-sicherung-" + iso(new Date()) + ".json",
    JSON.stringify(DB, null, 1), "application/json");
  $("#restoreBtn").onclick = () => $("#restoreFile").click();
  $("#restoreFile").onchange = ev => {
    const f = ev.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        DB = Object.assign(DB, JSON.parse(r.result));
        save(); renderAll(); toast("Sicherung geladen");
      } catch(e){ toast("Datei konnte nicht gelesen werden"); }
    };
    r.readAsText(f);
  };

  $$("[data-close]").forEach(b => b.onclick = e => e.target.closest("dialog").close());
  $$("dialog").forEach(d => d.addEventListener("click", e => { if (e.target === d) d.close(); }));

  initEssen();
  initPad();
  initClaude();
  renderAll();

  const tok = sessionStorage.getItem("tyden.gtoken");
  if (tok && DB.settings.clientId){ gToken = tok; loadGoogleEvents().then(renderCal); }

  if ("serviceWorker" in navigator && location.protocol.startsWith("http")){
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }
  if (memOnly) toast("Dieser Browser speichert nicht — bitte Sicherung nutzen");
}
