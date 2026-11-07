/* ============================================================
   Týden — Wochenplan
   app.js: Gerüst, Kalenderwoche, Jahreszeiten, Kalender-Tab,
           Google-Anbindung, Druck
   ============================================================ */

/* Versionsstand. Bei jeder Änderung hier und in sw.js gleich setzen,
   damit der Offline-Speicher die neue Fassung sicher übernimmt. */
const VERSION = "0.6.3";

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
      if (!DB.backen || typeof DB.backen !== "object") DB.backen = {sel:{}, checked:{}, buy:{}};
    }
  } catch(e){ memOnly = true; }
  evCacheLesen();
}
function save(){
  try { localStorage.setItem(KEY, JSON.stringify(DB)); }
  catch(e){
    if (!memOnly){ memOnly = true; toast("Speichern im Browser blockiert — bitte Sicherung nutzen"); }
  }
}
function week(k){
  if (!DB.weeks[k]) DB.weeks[k] = {days:{}, free:{}, days2:{}, free2:{}, checked:{}, buy:{}};
  const w = DB.weeks[k];
  if (!w.checked) w.checked = {};
  if (!w.buy) w.buy = {};
  if (!w.free) w.free = {};     // Tage ohne Rezept, nur ein Name
  if (!w.days2) w.days2 = {};   // zweites Gericht am selben Tag
  if (!w.free2) w.free2 = {};
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
let GCOLORS = null;          // Farbtabelle von Google

function tint(hex, a){
  const h = String(hex || "#2C5140").replace("#","");
  const n = parseInt(h.length === 3 ? h.split("").map(c => c + c).join("") : h, 16);
  return "rgba(" + ((n >> 16) & 255) + "," + ((n >> 8) & 255) + "," + (n & 255) + "," + a + ")";
}

function eventsOn(dayKey){
  // eigene Vorhaben aus dem Monat stehen in der Woche neben den Google-Terminen
  const eigen = (typeof vorhabenAlsEvents === "function") ? vorhabenAlsEvents() : [];
  const alle = GOOGLE_EVENTS.concat(eigen).filter(e => dayKey >= e.start && dayKey <= e.end);
  // Mehrtägige zuerst und in fester Reihenfolge, damit sie nicht im Tag wandern
  const mehr = alle.filter(e => e.end > e.start)
    .sort((a, b) => (a.start + a.id).localeCompare(b.start + b.id));
  const einzel = alle.filter(e => e.end === e.start)
    .sort((a, b) => (a.from || "00:00").localeCompare(b.from || "00:00"));
  return mehr.concat(einzel);
}

/* Beschriftung: an den Wochenrändern "seit"/"bis", sonst Uhrzeit */
function eventLabel(ev, dayKey, firstKey, lastKey){
  const mehrtaegig = ev.end > ev.start;
  if (mehrtaegig){
    // an den Wochenrändern der Blick nach außen, sonst die volle Spanne
    if (dayKey === firstKey && ev.start < firstKey)
      return "seit " + fmtD(parseISO(ev.start));
    if (dayKey === lastKey && ev.end > lastKey)
      return "bis " + fmtD(parseISO(ev.end));
    return fmtD(parseISO(ev.start)) + "–" + fmtD(parseISO(ev.end));
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
          ? evs.map(ev => {
              const mehrtaegig = ev.end > ev.start;
              const vor  = ev.start < key;     // läuft schon vor diesem Tag
              const nach = ev.end   > key;     // läuft über diesen Tag hinaus
              const stil = 'style="--c:' + (ev.color || "#2C5140") + ';background:' +
                tint(ev.color, mehrtaegig ? .2 : .13) + '"';
              return '<div class="ev' + (mehrtaegig ? " band" : "") +
                (vor ? " cont-l" : "") + (nach ? " cont-r" : "") +
                (ev.vorhaben ? " vorh" : "") + (ev.erledigt ? " erl" : "") + '" ' + stil + '>' +
                (mehrtaegig ? '<span class="arrows">' + (vor ? "‹" : "") + (nach ? "›" : "") + '</span>' : '') +
                '<time>' + esc(eventLabel(ev, key, firstKey, lastKey)) + '</time>' +
                '<b>' + esc(ev.text) + '</b>' +
                (ev.note ? '<time>' + esc(ev.note) + '</time>' : '') +
              '</div>';
            }).join("")
          : '<div class="noev">' + ((gToken || EV_STAND) ? "keine Termine" : "nicht verbunden") + '</div>') +
        '<textarea class="daynote" data-note="' + key + '" placeholder="Notiz">' +
          esc(DB.notes[key] || "") + '</textarea>' +
      '</div>';
    grid.appendChild(col);
  });

  $$("#calGrid .daynote").forEach(t => {
    mitwachsen(t);
    t.oninput = () => {
      const k = t.dataset.note;
      if (t.value.trim()) DB.notes[k] = t.value; else delete DB.notes[k];
      mitwachsen(t);
      clearTimeout(t._t);
      t._t = setTimeout(save, 400);
    };
  });
}

/* ---------- Google Kalender, nur lesend ---------- */
let gToken = null, gTokenClient = null;

/* Termine werden auf Vorrat geladen und im Browser behalten. Dadurch steht die
   Woche auch dann da, wenn der Zugang gerade abgelaufen ist — Google gibt einem
   Zugangstoken nur eine Stunde, und die stille Erneuerung klappt auf dem iPad
   nicht immer. Angezeigt wird dann der Stand der letzten Abfrage. */
const EV_CACHE = "tyden.events.v1";
let GRANGE = null;      // {min, max} der geladenen Spanne als ISO-Datum
let EV_STAND = 0;       // Zeitpunkt der letzten erfolgreichen Abfrage

function evCacheLesen(){
  try {
    const c = JSON.parse(localStorage.getItem(EV_CACHE) || "null");
    if (c && Array.isArray(c.ev)){
      GOOGLE_EVENTS = c.ev;
      GRANGE = c.min && c.max ? {min: c.min, max: c.max} : null;
      EV_STAND = c.stand || 0;
      if (c.farben) GCOLORS = c.farben;
    }
  } catch(e){}
}
function evCacheSchreiben(){
  try {
    localStorage.setItem(EV_CACHE, JSON.stringify({
      stand: EV_STAND, min: GRANGE && GRANGE.min, max: GRANGE && GRANGE.max,
      ev: GOOGLE_EVENTS, farben: GCOLORS || null
    }));
  } catch(e){}
}
/* Steht die gezeigte Woche in der geladenen Spanne und ist der Stand frisch genug? */
function evDeckung(){
  if (!GRANGE || !GOOGLE_EVENTS.length && !EV_STAND) return false;
  const d = weekDates();
  return d[0].key >= GRANGE.min && d[6].key <= GRANGE.max;
}
function standText(){
  if (!EV_STAND) return "noch nie geladen";
  const alter = Date.now() - EV_STAND;
  if (alter < 90 * 1000) return "gerade eben";
  if (alter < 60 * 60 * 1000) return "vor " + Math.round(alter / 60000) + " Minuten";
  const d = new Date(EV_STAND);
  const heute = new Date();
  const selberTag = d.toDateString() === heute.toDateString();
  return (selberTag ? "heute " : d.toLocaleDateString("de-DE", {weekday:"short", day:"numeric", month:"numeric"}) + ", ") +
    d.toLocaleTimeString("de-DE", {hour:"2-digit", minute:"2-digit"}) + " Uhr";
}
/* Zeile über dem Kalender: nur zu sehen, wenn die Termine nicht frisch sind. */
function renderStand(){
  const el = $("#calStand");
  if (!el) return;
  if (!DB.settings.clientId){ el.hidden = true; return; }
  const alt = Date.now() - EV_STAND > 2 * 60 * 60 * 1000;
  if (gToken && !alt){ el.hidden = true; return; }
  el.hidden = false;
  el.innerHTML = (EV_STAND
    ? 'Termine aus dem Zwischenspeicher · Stand ' + esc(standText())
    : 'Noch keine Termine geladen') +
    ' <button class="mini" id="standNeu">' + (gToken ? "aktualisieren" : "neu verbinden") + '</button>';
  $("#standNeu").onclick = () => { if (gToken) refreshAll(true); else gConnect(); };
}

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
/* Einmal einrichten, danach leise erneuern, solange die Google-Sitzung im Browser steht. */
async function gInit(id){
  if (gTokenClient) return true;
  try { await loadGis(); }
  catch(e){
    gStatus("Google ist gerade nicht erreichbar. Der Rest der App läuft weiter.");
    return false;
  }
  gTokenClient = google.accounts.oauth2.initTokenClient({
    client_id: id,
    scope: "https://www.googleapis.com/auth/calendar.readonly",
    callback: resp => {
      if (resp && resp.access_token){
        gToken = resp.access_token;
        gFehlschlaege = 0;
        const exp = Date.now() + (Number(resp.expires_in || 3600) - 120) * 1000;
        try { localStorage.setItem("tyden.gtoken", JSON.stringify({t: gToken, exp: exp})); } catch(e){}
        planeErneuerung(exp);
        gStatus("Verbunden. Termine werden geladen.", true);
        loadGoogleEvents().then(() => { renderCal(); renderStand(); });
      } else if (!gQuiet){
        gStatus("Anmeldung abgebrochen.");
      }
      gQuiet = false;
    },
    error_callback: () => {
      // Stille Anmeldung nicht möglich: Google-Sitzung fehlt oder der Browser
      // lässt den unsichtbaren Abgleich nicht zu. Die Termine im Zwischenspeicher
      // bleiben stehen, nur der Stand altert.
      if (gQuiet){
        gFehlschlaege++;
        if (gFehlschlaege <= 2) setTimeout(gSilent, gFehlschlaege * 8000);
        else gStatus("Stille Erneuerung geht gerade nicht. Die Termine unten sind vom " +
                     standText() + ". Einmal auf „Mit Google verbinden“ tippen holt sie frisch.");
      }
      gQuiet = false;
      renderStand();
    }
  });
  return true;
}
async function gConnect(){
  const id = ($("#gClientId").value || DB.settings.clientId || "").trim();
  if (!id){ gStatus("Bitte zuerst eine Client-ID eintragen."); return; }
  DB.settings.clientId = id; save();
  if (!(await gInit(id))) return;
  gQuiet = false;
  gFehlschlaege = 0;
  // "select_account" statt "consent": die Zustimmung zum Lesezugriff ist erteilt,
  // es genügt die Auswahl des Kontos.
  gTokenClient.requestAccessToken({prompt: gErstmals ? "consent" : "select_account"});
  gErstmals = false;
}
/* Holt im Hintergrund ein frisches Zugriffstoken, ohne Fenster und ohne Klick. */
async function gSilent(){
  const id = DB.settings.clientId;
  if (!id) return;
  if (!(await gInit(id))) return;
  gQuiet = true;
  try { gTokenClient.requestAccessToken({prompt: ""}); } catch(e){ gQuiet = false; }
}
let gQuiet = false, gFehlschlaege = 0, gErneuerung = null;
let gErstmals = true;
/* Rechtzeitig vor Ablauf erneuern, nicht erst danach. */
function planeErneuerung(exp){
  clearTimeout(gErneuerung);
  const vorlauf = Math.max(30 * 1000, exp - Date.now() - 10 * 60 * 1000);
  gErneuerung = setTimeout(gSilent, vorlauf);
}
function tokenRest(){
  try {
    const g = JSON.parse(localStorage.getItem("tyden.gtoken") || "null");
    return g ? g.exp - Date.now() : 0;
  } catch(e){ return 0; }
}
function gDisconnect(){
  gToken = null;
  GOOGLE_EVENTS = [];
  GRANGE = null; EV_STAND = 0;
  clearTimeout(gErneuerung);
  try { localStorage.removeItem("tyden.gtoken"); localStorage.removeItem(EV_CACHE); } catch(e){}
  renderStand();
  gStatus("Getrennt. Es werden keine Google-Termine angezeigt.");
  renderCal();
}
async function gFetch(url){
  const r = await fetch(url, {headers: {Authorization: "Bearer " + gToken}});
  if (r.status === 401){ gToken = null; gSilent(); throw new Error("Zugang erneuert sich gerade"); }
  if (!r.ok) throw new Error("Google antwortet mit " + r.status);
  return r.json();
}
async function loadGoogleEvents(anker){
  if (!gToken) return;                     // Zwischenspeicher stehen lassen
  const dates = weekDates();
  // auf Vorrat laden: fünf Wochen zurück, acht nach vorn. Dann ist beim Blättern
  // und nach einer Pause etwas da, ohne für jede Woche neu anzufragen.
  const min = new Date(anker || dates[0].date); min.setUTCDate(min.getUTCDate() - 35);
  const max = new Date(anker || dates[6].date); max.setUTCDate(max.getUTCDate() + 56);
  try {
    if (!GCOLORS){
      try { GCOLORS = await gFetch("https://www.googleapis.com/calendar/v3/colors"); } catch(e){ GCOLORS = {}; }
    }
    const cl = await gFetch("https://www.googleapis.com/calendar/v3/users/me/calendarList");
    // Liste für die Einstellungen merken
    DB.settings.calList = (cl.items || []).map(c => ({
      id: c.id, name: c.summaryOverride || c.summary, bg: c.backgroundColor || "#2C5140"
    }));
    if (!Array.isArray(DB.settings.cals) || !DB.settings.cals.length){
      // beim ersten Mal alles übernehmen, was in Google sichtbar ist
      DB.settings.cals = (cl.items || []).filter(c => c.selected !== false).map(c => c.id);
    }
    save();
    renderCalPicker();
    const cals = (cl.items || []).filter(c => DB.settings.cals.indexOf(c.id) >= 0);
    const all = [];
    for (const c of cals){
      const u = "https://www.googleapis.com/calendar/v3/calendars/" + encodeURIComponent(c.id) +
        "/events?singleEvents=true&orderBy=startTime&maxResults=250" +
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
        const evFarbe = (ev.colorId && GCOLORS && GCOLORS.event && GCOLORS.event[ev.colorId])
          ? GCOLORS.event[ev.colorId].background
          : (c.backgroundColor || "#2C5140");
        all.push({
          id: ev.id, text: ev.summary || "ohne Titel",
          note: ev.location || "", color: evFarbe, kalender: c.summaryOverride || c.summary,
          start: sD.slice(0,10), end: endKey < sD.slice(0,10) ? sD.slice(0,10) : endKey,
          from: ganztag ? "" : sD.slice(11,16),
          to:   ganztag ? "" : (eD || "").slice(11,16)
        });
      });
    }
    GOOGLE_EVENTS = all;
    GRANGE = {min: iso(min), max: iso(max)};
    EV_STAND = Date.now();
    evCacheSchreiben();
    gStatus("Verbunden — " + all.length + " Termine aus " + cals.length + " Kalendern.", true);
  } catch(err){
    // Nichts wegwerfen: lieber der alte Stand als eine leere Woche
    gStatus("Konnte nicht laden: " + err.message + (EV_STAND ? " — gezeigt wird der Stand vom " +
      standText() + "." : ""));
  }
  renderStand();
}

/* Das Notizfeld wächst mit dem Text, damit nichts unsichtbar abgeschnitten wird. */
function mitwachsen(ta){
  ta.style.height = "auto";
  ta.style.height = Math.max(ta.scrollHeight, 44) + "px";
  if (seitenSync) seitenSync();
}

/* ---------- Kalenderauswahl ---------- */
function renderCalPicker(){
  const box = $("#gCals");
  if (!box) return;
  const list = DB.settings.calList || [];
  const sel = DB.settings.cals || [];
  const kopf = '<p class="lbl" style="margin:1.2rem 0 .4rem">Welche Kalender anzeigen</p>';
  if (!list.length){
    box.innerHTML = kopf + '<p class="hint">Noch keine Kalender geladen. Verbinde dich mit Google, ' +
      'dann erscheint hier die Liste deiner Kalender.</p>' +
      (gToken ? '<button class="btn ghost" id="loadCals">Kalender laden</button>' : '');
    const btn = $("#loadCals");
    if (btn) btn.onclick = () => loadGoogleEvents().then(() => { renderCalPicker(); renderCal(); });
    return;
  }
  box.innerHTML = kopf +
    '<p class="hint">' + sel.length + ' von ' + list.length + ' Kalendern werden angezeigt.</p>' +
    list.map(c => {
      const an = sel.indexOf(c.id) >= 0;
      return '<label class="chk calrow' + (an ? "" : " aus") + '">' +
        '<input type="checkbox" data-cal="' + esc(c.id) + '"' + (an ? " checked" : "") + '>' +
        '<span class="swatch" style="background:' + esc(c.bg) + '"></span>' +
        '<span>' + esc(c.name) + '</span></label>';
    }).join("");
  $$("#gCals [data-cal]").forEach(cb => cb.onchange = () => {
    const id = cb.dataset.cal;
    let sel = (DB.settings.cals || []).slice();
    if (cb.checked){ if (sel.indexOf(id) < 0) sel.push(id); }
    else sel = sel.filter(x => x !== id);
    DB.settings.cals = sel;
    save();
    renderCalPicker();
    loadGoogleEvents().then(renderCal);
  });
}

/* ---------- Tabs ---------- */
let activeTab = "woche";
function setTab(name){
  activeTab = name;
  $$(".tab").forEach(t => t.classList.toggle("on", t.dataset.tab === name));
  $$(".view").forEach(v => v.classList.toggle("hidden", v.id !== "view-" + name));
  if (name === "wochennotizen") sizePad();
  if (name === "monat" && typeof renderMonat === "function"){
    if (!curMonat) monatSync();
    renderMonat(); monatTermineHolen();
  }
  kopfSchreiben();
  window.scrollTo({top: 0});
  if (seitenSync) setTimeout(seitenSync, 60);
}

/* ---------- Gesamtausgabe ---------- */
function kopfSchreiben(){
  if (activeTab === "monat" && typeof monatKopf === "function"){ monatKopf(); return; }
  const mon = mondayOf(cur.year, cur.week);
  const sun = new Date(mon); sun.setUTCDate(mon.getUTCDate() + 6);
  $("#kwTitle").textContent = "KW " + cur.week;
  $("#kwRange").textContent = fmtD(mon) + " – " + fmtD(sun) + sun.getUTCFullYear();
}
function renderAll(){
  applySeason();
  kopfSchreiben();
  if (typeof renderMonat === "function") renderMonat();
  renderCal();
  renderStand();
  renderMeals();
  renderShop();
  renderNotes();
  renderTodos();
  if (typeof renderBacken === "function") renderBacken();
  if (seitenSync) setTimeout(seitenSync, 60);
}
function gotoWeek(delta){
  cur = shiftWeek(cur, delta);
  renderAll();
  if (gToken && (!evDeckung() || Date.now() - EV_STAND > 15 * 60 * 1000)){
    loadGoogleEvents().then(renderCal);
  }
}

/* ---------- Drucken ---------- */
function printHead(title){
  const mon = mondayOf(cur.year, cur.week);
  const sun = new Date(mon); sun.setUTCDate(mon.getUTCDate() + 6);
  return '<div class="phead"><h1>' + title + '</h1><span>KW ' + cur.week + " · " +
    fmtD(mon) + " – " + fmtD(sun) + sun.getUTCFullYear() + '</span></div>';
}
/* Essensblock im Ausdruck, eingefärbt nach Kategorie */
function pmBlock(dish, label, zweit){
  const c = (dish.cat && typeof CATS !== "undefined" && CATS[dish.cat]) ? CATS[dish.cat].c : "#7D867C";
  return '<div class="pm' + (zweit ? " zweit" : "") + '" style="border-left-color:' + c +
    ';background:' + tint(c, zweit ? .10 : .13) + '"><i style="color:' + c + '">' + label +
    (dish.cat && CATS[dish.cat] ? " · " + CATS[dish.cat].n : "") + '</i>' + esc(dish.name) + '</div>';
}

function printWochenplan(){
  const dates = weekDates();
  const firstKey = dates[0].key, lastKey = dates[6].key;
  const cols = dates.map(({day, date, key}) => {
    const evs = eventsOn(key);
    const dish  = typeof dishOfDay === "function" ? dishOfDay(day, 1) : null;
    const dish2 = typeof dishOfDay === "function" ? dishOfDay(day, 2) : null;
    return '<div class="pday"><h4>' + DAYNAME[day] + '</h4><div class="pd">' + fmtD(date) + '</div>' +
      (dish ? pmBlock(dish, "Essen") : '') +
      (dish2 ? pmBlock(dish2, "Zweites Gericht", true) : '') +
      evs.map(ev => {
        const mehrtaegig = ev.end > ev.start;
        const c = ev.color || "#2C5140";
        return '<div class="pe' + (mehrtaegig ? " pband" : "") + '" style="border-color:' + c +
          ';background:' + tint(c, mehrtaegig ? .18 : .11) + '"><i>' +
          esc(eventLabel(ev, key, firstKey, lastKey)) + '</i>' + esc(ev.text) +
          (ev.note ? ' <em>' + esc(ev.note) + '</em>' : '') + '</div>';
      }).join("") +
      (DB.notes[key] ? '<div class="pn">' + esc(DB.notes[key]) + '</div>' : '') +
      '</div>';
  }).join("");
  return '<div class="psec">' + printHead("Wochenplan") + '<div class="pweek">' + cols + '</div></div>';
}
function doPrint(){
  const parts = [];
  if ($("#pr_monat").checked)      parts.push(printMonat());
  if ($("#pr_wochenplan").checked) parts.push(printWochenplan());
  if ($("#pr_essen").checked)      parts.push(printEssen());
  if ($("#pr_einkauf").checked)    parts.push(printEinkauf());
  if ($("#pr_backen").checked)     parts.push(printBacken());
  if ($("#pr_backrezepte").checked) parts.push(printBackRezepte());
  if ($("#pr_rezepte").checked)    parts.push(printRezepte());
  if ($("#pr_notizen").checked)    parts.push(printNotizen());
  if ($("#pr_todos").checked)      parts.push(printTodos());
  if (!parts.length){ toast("Bitte mindestens einen Bereich wählen"); return; }
  $("#print").innerHTML = parts.join("");
  $("#dPrint").close();
  setTimeout(() => window.print(), 120);
}

/* ---------- Scrollbalken für die ganze Seite ----------
   Auf dem iPad soll sich alles auch ohne Wischen bedienen lassen. */
function initPageScroll(){
  const leiste = $("#pageScroll"), track = $("#pageTrack"), thumb = $("#pageThumb");
  if (!leiste || !track || !thumb) return;

  function hoehen(){
    return {
      sicht: window.innerHeight,
      gesamt: Math.max(document.body.scrollHeight, document.documentElement.scrollHeight),
      oben: window.scrollY || document.documentElement.scrollTop || 0
    };
  }
  function sync(){
    const h = hoehen();
    const scrollbar = h.gesamt - h.sicht > 24;
    leiste.hidden = !scrollbar;
    document.body.classList.toggle("hat-balken", scrollbar);
    if (!scrollbar) return;
    const bahn = track.clientHeight;
    const hoehe = Math.max(36, bahn * Math.min(1, h.sicht / h.gesamt));
    thumb.style.height = hoehe + "px";
    thumb.style.top = (h.oben / (h.gesamt - h.sicht)) * (bahn - hoehe) + "px";
  }
  function scrollZu(clientY){
    const r = track.getBoundingClientRect(), h = hoehen();
    const anteil = (clientY - r.top - thumb.offsetHeight / 2) / Math.max(1, r.height - thumb.offsetHeight);
    window.scrollTo({top: Math.max(0, Math.min(1, anteil)) * (h.gesamt - h.sicht)});
  }

  let zieht = false;
  track.addEventListener("pointerdown", e => { zieht = true; track.setPointerCapture(e.pointerId); scrollZu(e.clientY); });
  track.addEventListener("pointermove", e => { if (zieht) scrollZu(e.clientY); });
  const los = () => { zieht = false; };
  track.addEventListener("pointerup", los);
  track.addEventListener("pointercancel", los);

  $("#pageUp").onclick = () => window.scrollBy({top: -window.innerHeight * 0.8, behavior: "smooth"});
  $("#pageDown").onclick = () => window.scrollBy({top: window.innerHeight * 0.8, behavior: "smooth"});

  window.addEventListener("scroll", sync, {passive: true});
  window.addEventListener("resize", sync);
  seitenSync = sync;
  sync();
}
let seitenSync = null;

/* ---------- Aktualisieren ---------- */
let refreshLaeuft = false;
async function refreshAll(laut){
  if (refreshLaeuft) return;
  refreshLaeuft = true;
  const btn = $("#refresh");
  if (btn) btn.classList.add("spin");
  try {
    if (DB.settings.clientId){
      if (!gToken || tokenRest() < 10 * 60 * 1000) await gSilent();
      else await loadGoogleEvents();
    }
    renderAll();
    if (laut) toast(gToken ? "Termine aktualisiert" : "Keine Verbindung zu Google");
  } catch(e){
    if (laut) toast("Aktualisieren fehlgeschlagen");
  } finally {
    // nach neuer Fassung der App schauen
    if ("serviceWorker" in navigator && navigator.serviceWorker.getRegistration){
      navigator.serviceWorker.getRegistration().then(r => { if (r) r.update(); }).catch(() => {});
    }
    setTimeout(() => { if (btn) btn.classList.remove("spin"); }, 600);
    refreshLaeuft = false;
  }
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

  const vTag = $("#version");
  if (vTag) vTag.textContent = "v" + VERSION;
  const vInfo = $("#versionInfo");
  if (vInfo) vInfo.textContent = "Týden v" + VERSION;

  $("#prev").onclick = () => activeTab === "monat" ? gotoMonat(-1) : gotoWeek(-1);
  $("#next").onclick = () => activeTab === "monat" ? gotoMonat(1)  : gotoWeek(1);
  $("#today").onclick = () => {
    cur = isoWeek(new Date());
    monatSync();
    renderAll();
    if (activeTab === "monat") monatTermineHolen();
    else if (gToken) loadGoogleEvents().then(renderCal);
  };
  $$(".tab").forEach(t => t.onclick = () => setTab(t.dataset.tab));

  $("#refresh").onclick = () => refreshAll(true);
  // beim Zurückholen aus dem Hintergrund still nachladen
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && DB.settings.clientId) refreshAll(false);
  });
  $("#openPrint").onclick = () => { $("#printKw").textContent = "KW " + cur.week; $("#dPrint").showModal(); };
  $("#doPrint").onclick = doPrint;

  $("#openSettings").onclick = () => {
    $("#gClientId").value = DB.settings.clientId || "";
    renderCalPicker();
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
  initBacken();
  initMonat();
  initTasten();
  initPad();
  initTodos();
  initClaude();
  initPageScroll();
  renderAll();

  // gespeichertes Token weiterverwenden, sonst still ein neues holen
  if (DB.settings.clientId){
    let gespeichert = null;
    try { gespeichert = JSON.parse(localStorage.getItem("tyden.gtoken") || "null"); } catch(e){}
    if (gespeichert && gespeichert.exp > Date.now()){
      gToken = gespeichert.t;
      planeErneuerung(gespeichert.exp);
      gErstmals = false;
      if (!evDeckung() || Date.now() - EV_STAND > 15 * 60 * 1000){
        loadGoogleEvents().then(() => { renderCal(); renderStand(); });
      }
    } else {
      gSilent();
    }
    // alle 45 Minuten leise nachfassen, damit der Zugang gar nicht erst abläuft
    setInterval(() => { if (tokenRest() < 15 * 60 * 1000) gSilent(); }, 45 * 60 * 1000);
  }

  if ("serviceWorker" in navigator && location.protocol.startsWith("http")){
    // updateViaCache: "none" sorgt dafür, dass der Browser sw.js nie aus dem Zwischenspeicher nimmt
    navigator.serviceWorker.register("sw.js", {updateViaCache: "none"}).then(reg => {
      reg.update();
      setInterval(() => reg.update(), 60 * 60 * 1000);
      reg.addEventListener("updatefound", () => {
        const neu = reg.installing;
        if (!neu) return;
        neu.addEventListener("statechange", () => {
          if (neu.state === "installed" && navigator.serviceWorker.controller){
            toast("Neue Fassung wird geladen …");
          }
        });
      });
    }).catch(() => {});

    // Sobald die neue Fassung übernimmt, einmal neu laden
    let schonGeladen = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (schonGeladen) return;
      schonGeladen = true;
      location.reload();
    });
  }
  if (memOnly) toast("Dieser Browser speichert nicht — bitte Sicherung nutzen");
}
