/* ============================================================
   Týden — monat.js
   Monatsübersicht mit Kalenderwochen, eigenen Vorhaben als
   durchgehende Balken und wahlweise den Google-Terminen.
   ============================================================ */

/* ---------- Farben für die Balken ---------- */
const VFARBEN = [
  {n: "Tanne",  c: "#2C5140"},
  {n: "Tinte",  c: "#1F4A52"},
  {n: "Wein",   c: "#6B2D4E"},
  {n: "Gold",   c: "#A9771C"},
  {n: "Rinde",  c: "#6B4A1F"}
];

/* ---------- Vorhaben ---------- */
function vorhaben(){
  if (!Array.isArray(DB.vorhaben)) DB.vorhaben = [];
  return DB.vorhaben;
}
function vorhabenId(){ return "v" + Date.now() + Math.floor(Math.random() * 1000); }
function vorhabenAuf(key){
  return vorhaben().filter(v => key >= v.von && key <= v.bis);
}
/* Für die Wochenansicht und den Wochenausdruck sehen Vorhaben aus wie Termine. */
function vorhabenAlsEvents(){
  return vorhaben().map(v => ({
    id: "v:" + v.id, text: v.text, note: "", color: v.farbe || VFARBEN[0].c,
    kalender: "Vorhaben", start: v.von, end: v.bis, from: "", to: "",
    vorhaben: true, erledigt: !!v.done
  }));
}

/* ---------- Feiertage und Merktage ----------
   Gesetzliche Feiertage für Baden-Württemberg, dazu die Tage, die auf jedem
   Wandkalender stehen, auch wenn nicht frei ist. */
function ostern(jahr){
  const a = jahr % 19, b = Math.floor(jahr / 100), c = jahr % 100;
  const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const monat = Math.floor((h + l - 7 * m + 114) / 31);
  const tag = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(Date.UTC(jahr, monat - 1, tag));
}
function plusTage(d, n){ const x = new Date(d); x.setUTCDate(x.getUTCDate() + n); return x; }
let FEIER_CACHE = {};
function feiertage(jahr){
  if (FEIER_CACHE[jahr]) return FEIER_CACHE[jahr];
  const o = ostern(jahr), t = {};
  const setz = (d, name, frei) => { t[iso(d)] = {name: name, frei: !!frei}; };

  setz(new Date(Date.UTC(jahr, 0, 1)),  "Neujahr", true);
  setz(new Date(Date.UTC(jahr, 0, 6)),  "Heilige Drei Könige", true);
  setz(plusTage(o, -2), "Karfreitag", true);
  setz(o, "Ostersonntag", true);
  setz(plusTage(o, 1),  "Ostermontag", true);
  setz(new Date(Date.UTC(jahr, 4, 1)),  "Tag der Arbeit", true);
  setz(plusTage(o, 39), "Christi Himmelfahrt", true);
  setz(plusTage(o, 50), "Pfingstmontag", true);
  setz(plusTage(o, 60), "Fronleichnam", true);
  setz(new Date(Date.UTC(jahr, 9, 3)),  "Tag der Deutschen Einheit", true);
  setz(new Date(Date.UTC(jahr, 9, 31)), "Reformationstag", false);
  setz(new Date(Date.UTC(jahr, 10, 1)), "Allerheiligen", true);
  setz(new Date(Date.UTC(jahr, 11, 24)), "Heiligabend", false);
  setz(new Date(Date.UTC(jahr, 11, 25)), "1. Weihnachtstag", true);
  setz(new Date(Date.UTC(jahr, 11, 26)), "2. Weihnachtstag", true);
  setz(new Date(Date.UTC(jahr, 11, 31)), "Silvester", false);

  // Advent: vier Sonntage vor dem ersten Weihnachtstag
  const heilig = new Date(Date.UTC(jahr, 11, 25));
  const vierter = plusTage(heilig, -(heilig.getUTCDay() || 7));
  ["1. Advent","2. Advent","3. Advent","4. Advent"].forEach((n, i) => {
    const d = plusTage(vierter, -21 + i * 7);
    if (!t[iso(d)]) setz(d, n, false);
  });

  FEIER_CACHE[jahr] = t;
  return t;
}
function merktag(key){
  const j = Number(key.slice(0, 4));
  return feiertage(j)[key] || null;
}

/* ---------- Welcher Monat wird gezeigt ---------- */
const MONATSNAMEN = ["Januar","Februar","März","April","Mai","Juni",
                     "Juli","August","September","Oktober","November","Dezember"];
let curMonat = null;
function monatSync(){
  const mon = mondayOf(cur.year, cur.week);
  curMonat = {y: mon.getUTCFullYear(), m: mon.getUTCMonth()};
}
function gotoMonat(delta){
  if (!curMonat) monatSync();
  const d = new Date(Date.UTC(curMonat.y, curMonat.m + delta, 1));
  curMonat = {y: d.getUTCFullYear(), m: d.getUTCMonth()};
  renderMonat();
  monatKopf();
  monatTermineHolen();
}
/* Beschriftung im Kopf, solange der Monat offen ist */
function monatKopf(){
  if (!curMonat) monatSync();
  const w = monatWochen();
  $("#kwTitle").textContent = MONATSNAMEN[curMonat.m] + " " + curMonat.y;
  $("#kwRange").textContent = "KW " + w[0].kw + " – " + w[w.length - 1].kw;
}
/* Termine nachladen, wenn der gezeigte Monat außerhalb der geladenen Spanne liegt */
function monatTermineHolen(){
  if (!gToken) return;
  const w = monatWochen();
  const von = w[0].tage[0].key, bis = w[w.length - 1].tage[6].key;
  if (!GRANGE || von < GRANGE.min || bis > GRANGE.max){
    loadGoogleEvents(new Date(Date.UTC(curMonat.y, curMonat.m, 1))).then(() => {
      renderMonat(); renderStand();
    });
  }
}
/* Wochenzeilen des Monats, inklusive der angeschnittenen Tage davor und danach */
function monatWochen(){
  if (!curMonat) monatSync();
  const erster = new Date(Date.UTC(curMonat.y, curMonat.m, 1));
  const letzter = new Date(Date.UTC(curMonat.y, curMonat.m + 1, 0));
  const start = plusTage(erster, -((erster.getUTCDay() || 7) - 1));
  const wochen = [];
  let d = new Date(start);
  while (d <= letzter){
    const tage = [];
    for (let i = 0; i < 7; i++){
      const t = plusTage(d, i);
      tage.push({date: t, key: iso(t), drin: t.getUTCMonth() === curMonat.m});
    }
    wochen.push({kw: isoWeek(new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())).week, tage: tage});
    d = plusTage(d, 7);
  }
  return wochen;
}

/* ---------- Balken auf Spuren verteilen ----------
   Jeder Balken bekommt eine eigene Zeile, solange er mit einem anderen
   zusammenstößt. So überdeckt nichts etwas anderes. */
function spuren(eintraege, vonKey, bisKey){
  const teile = eintraege
    .filter(e => e.bis >= vonKey && e.von <= bisKey)
    .map(e => {
      const a = e.von < vonKey ? vonKey : e.von;
      const b = e.bis > bisKey ? bisKey : e.bis;
      return {
        e: e,
        von: a, bis: b,
        sp: Math.round((parseISO(a) - parseISO(vonKey)) / 86400000),
        len: Math.round((parseISO(b) - parseISO(a)) / 86400000) + 1,
        linksOffen: e.von < vonKey,
        rechtsOffen: e.bis > bisKey
      };
    })
    .sort((x, y) => x.von.localeCompare(y.von) || y.len - x.len);

  const belegt = [];     // je Spur ein Array mit den belegten Spalten
  teile.forEach(t => {
    let s = 0;
    while (true){
      if (!belegt[s]) belegt[s] = [];
      const frei = belegt[s].every(b => t.sp + t.len <= b.sp || b.sp + b.len <= t.sp);
      if (frei){ belegt[s].push(t); t.spur = s; break; }
      s++;
    }
  });
  return teile;
}

/* ---------- Monatsansicht ---------- */
function monatZeigtGoogle(){ return DB.settings.monatGoogle !== false; }

function renderMonat(){
  const box = $("#monatGrid");
  if (!box) return;
  if (!curMonat) monatSync();

  const heute = iso(new Date(Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())));
  const mehrGoogle = monatZeigtGoogle()
    ? GOOGLE_EVENTS.filter(e => e.end > e.start).map(e => ({
        id: e.id, text: e.text, von: e.start, bis: e.end, farbe: e.color, google: true}))
    : [];

  let html = '<div class="mkopf"><span></span>' +
    DAYS.map(d => '<span>' + DAYNAME[d] + '</span>').join("") + '</div>';

  monatWochen().forEach(w => {
    const vonKey = w.tage[0].key, bisKey = w.tage[6].key;
    const balken = spuren(vorhaben().concat(mehrGoogle), vonKey, bisKey);
    const lanes = balken.reduce((m, t) => Math.max(m, t.spur + 1), 0);

    html += '<div class="mrow" style="grid-template-rows:min-content' +
        " min-content".repeat(lanes) + '">' +
      '<button class="mkw" data-kw="' + w.kw + '" data-jahr="' + w.tage[3].key.slice(0,4) +
        '" title="Diese Woche öffnen">' + w.kw + '</button>';

    // Hintergrundkästen, zugleich die Flächen zum Antippen
    w.tage.forEach((t, i) => {
      html += '<div class="mbg' + (t.drin ? "" : " aus") + (t.key === heute ? " heute" : "") +
        (i >= 5 ? " we" : "") + '" style="grid-column:' + (i + 2) + '" data-neu="' + t.key + '"></div>';
    });

    // Tagesköpfe mit Nummer, Merktag und eintägigen Terminen
    w.tage.forEach((t, i) => {
      const f = merktag(t.key);
      const einzel = monatZeigtGoogle()
        ? GOOGLE_EVENTS.filter(e => e.start === t.key && e.end === e.start)
            .sort((a, b) => (a.from || "").localeCompare(b.from || ""))
        : [];
      html += '<div class="mhead' + (t.drin ? "" : " aus") + '" style="grid-column:' + (i + 2) +
        ';grid-row:1">' +
        '<span class="mnum' + (f && f.frei ? " frei" : "") + '">' + t.date.getUTCDate() + '</span>' +
        (f ? '<span class="mfeier">' + esc(f.name) + '</span>' : '') +
        einzel.map(e => '<span class="mev" style="--c:' + (e.color || "#2C5140") + '" title="' +
          esc(e.text) + '">' + (e.from ? '<b>' + e.from + '</b> ' : '') + esc(e.text) + '</span>').join("") +
        '</div>';
    });

    // Balken
    balken.forEach(t => {
      const e = t.e;
      const c = e.farbe || "#2C5140";
      html += '<div class="mbar' + (e.google ? " goo" : "") + (e.done ? " erl" : "") +
        (t.linksOffen ? " offl" : "") + (t.rechtsOffen ? " offr" : "") + '" ' +
        'style="grid-column:' + (t.sp + 2) + ' / span ' + t.len + ';grid-row:' + (t.spur + 2) +
        ';--c:' + c + ';background:' + tint(c, e.google ? .16 : .2) + '" ' +
        (e.google ? 'data-goo="' + esc(e.id) + '"' : 'data-vor="' + e.id + '"') + '>' +
        '<span>' + esc(e.text) + '</span>' +
        (t.rechtsOffen ? '<i class="pfeil">&#10148;</i>' : '') + '</div>';
    });

    html += '</div>';
  });

  box.innerHTML = html;

  $$("#monatGrid [data-neu]").forEach(el => el.onclick = () => openVorhaben(null, el.dataset.neu));
  $$("#monatGrid [data-vor]").forEach(el => el.onclick = e => {
    e.stopPropagation(); openVorhaben(el.dataset.vor);
  });
  $$("#monatGrid [data-goo]").forEach(el => el.onclick = e => {
    e.stopPropagation();
    const ev = GOOGLE_EVENTS.find(x => x.id === el.dataset.goo);
    if (ev) toast(ev.text + " · " + fmtD(parseISO(ev.start)) + "–" + fmtD(parseISO(ev.end)));
  });
  $$("#monatGrid [data-kw]").forEach(el => el.onclick = () => {
    cur = {year: Number(el.dataset.jahr), week: Number(el.dataset.kw)};
    setTab("woche");
    renderAll();
  });

  const schalter = $("#monatGoogle");
  if (schalter) schalter.checked = monatZeigtGoogle();
  const stats = $("#monatStats");
  if (stats){
    const offen = vorhaben().filter(v => !v.done).length;
    stats.textContent = vorhaben().length
      ? vorhaben().length + " Vorhaben · " + offen + " offen"
      : "Auf einen Tag tippen legt ein Vorhaben an";
  }
}

/* ---------- Vorhaben anlegen und ändern ---------- */
let vorEditId = null;
function openVorhaben(id, tag){
  const v = id ? vorhaben().find(x => x.id === id) : null;
  vorEditId = v ? v.id : null;
  $("#vorTitel").textContent = v ? "Vorhaben ändern" : "Neues Vorhaben";
  $("#v_text").value = v ? v.text : "";
  $("#v_von").value = v ? v.von : (tag || iso(new Date()));
  $("#v_bis").value = v ? v.bis : (tag || iso(new Date()));
  $("#v_done").checked = v ? !!v.done : false;
  const farbe = v ? (v.farbe || VFARBEN[0].c) : VFARBEN[0].c;
  $("#v_farben").innerHTML = VFARBEN.map(f =>
    '<button class="fchip' + (f.c === farbe ? " on" : "") + '" data-farbe="' + f.c +
    '" style="background:' + f.c + '" title="' + f.n + '"></button>').join("");
  $$("#v_farben .fchip").forEach(b => b.onclick = () => {
    $$("#v_farben .fchip").forEach(x => x.classList.remove("on"));
    b.classList.add("on");
  });
  $("#delVor").style.display = v ? "" : "none";
  $("#dVor").showModal();
  setTimeout(() => $("#v_text").focus(), 60);
}
function saveVorhaben(){
  const text = $("#v_text").value.trim();
  if (!text){ toast("Bitte einen Namen eintragen"); return; }
  let von = $("#v_von").value, bis = $("#v_bis").value || von;
  if (!von){ toast("Bitte ein Datum wählen"); return; }
  if (bis < von){ const x = von; von = bis; bis = x; }
  const gewaehlt = $("#v_farben .fchip.on");
  const eintrag = {
    id: vorEditId || vorhabenId(),
    text: text, von: von, bis: bis,
    farbe: gewaehlt ? gewaehlt.dataset.farbe : VFARBEN[0].c,
    done: $("#v_done").checked,
    ts: Date.now()
  };
  if (vorEditId){
    const i = vorhaben().findIndex(x => x.id === vorEditId);
    DB.vorhaben[i] = eintrag;
  } else {
    vorhaben().push(eintrag);
  }
  save();
  $("#dVor").close();
  renderMonat(); renderCal(); renderTodos();
  toast(vorEditId ? "Geändert" : "Vorhaben eingetragen");
}
function deleteVorhaben(){
  if (!vorEditId) return;
  const v = vorhaben().find(x => x.id === vorEditId);
  if (!confirm("„" + v.text + "“ wirklich löschen?")) return;
  DB.vorhaben = vorhaben().filter(x => x.id !== vorEditId);
  save();
  $("#dVor").close();
  renderMonat(); renderCal(); renderTodos();
  toast("Vorhaben gelöscht");
}

/* ---------- Vorhaben im Notizen-Tab ----------
   Eigene Seite neben den übrigen Notizseiten, abhakbar, aber nur im
   Monat zu ändern. Dort stehen schließlich die Daten. */
function vorhabenOffen(){ return vorhaben().filter(v => !v.done).length; }
function spanneText(v){
  const a = parseISO(v.von), b = parseISO(v.bis);
  if (v.von === v.bis) return fmtD(a);
  return fmtD(a) + "–" + fmtD(b);
}
function renderVorhabenListe(box){
  const liste = vorhaben().slice().sort((a, b) => a.von.localeCompare(b.von) || a.ts - b.ts);
  const versteckt = !!DB.settings.todoHide;
  const sichtbar = versteckt ? liste.filter(v => !v.done) : liste;
  const offen = liste.filter(v => !v.done).length;

  $("#todoStats").textContent = liste.length
    ? offen + " offen · " + (liste.length - offen) + " erledigt"
    : "noch keine Vorhaben im Monat eingetragen";

  if (!sichtbar.length){
    box.innerHTML = '<p class="hint">' + (liste.length
      ? "Alles erledigt."
      : "Vorhaben werden im Tab Monat eingetragen: dort auf einen Tag tippen.") + '</p>';
    return;
  }
  box.innerHTML = sichtbar.map((v, i) =>
    '<div class="item punkt' + (v.done ? " done" : "") + '">' +
      '<input type="checkbox" id="vh_' + i + '" data-vid="' + v.id + '"' + (v.done ? " checked" : "") + '>' +
      '<label for="vh_' + i + '"><span><i class="vdot" style="background:' +
        (v.farbe || VFARBEN[0].c) + '"></i>' + esc(v.text) + '</span>' +
        '<b>' + spanneText(v) + '</b></label>' +
      '<button class="mini" data-vedit="' + v.id + '">ändern</button>' +
    '</div>').join("");

  $$("#todoList [data-vid]").forEach(cb => cb.onchange = () => {
    const v = vorhaben().find(x => x.id === cb.dataset.vid);
    if (!v) return;
    v.done = cb.checked;
    save(); renderTodos(); renderMonat(); renderCal();
  });
  $$("#todoList [data-vedit]").forEach(b => b.onclick = () => openVorhaben(b.dataset.vedit));
}

/* ---------- Drucken ---------- */
function printMonat(){
  if (!curMonat) monatSync();
  const heute = iso(new Date(Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())));
  const mehrGoogle = monatZeigtGoogle()
    ? GOOGLE_EVENTS.filter(e => e.end > e.start).map(e => ({
        id: e.id, text: e.text, von: e.start, bis: e.end, farbe: e.color, google: true}))
    : [];

  let rows = '<div class="pmkopf"><span></span>' +
    DAYS.map(d => '<span>' + DAYNAME[d] + '</span>').join("") + '</div>';

  monatWochen().forEach(w => {
    const vonKey = w.tage[0].key, bisKey = w.tage[6].key;
    const balken = spuren(vorhaben().concat(mehrGoogle), vonKey, bisKey);
    const lanes = balken.reduce((m, t) => Math.max(m, t.spur + 1), 0);
    rows += '<div class="pmrow" style="grid-template-rows:min-content' +
      " min-content".repeat(lanes) + '"><div class="pmkw">' + w.kw + '</div>';
    w.tage.forEach((t, i) => {
      rows += '<div class="pmbg' + (t.drin ? "" : " aus") + '" style="grid-column:' + (i + 2) + '"></div>';
    });
    w.tage.forEach((t, i) => {
      const f = merktag(t.key);
      const einzel = monatZeigtGoogle()
        ? GOOGLE_EVENTS.filter(e => e.start === t.key && e.end === e.start) : [];
      rows += '<div class="pmhead' + (t.drin ? "" : " aus") + '" style="grid-column:' + (i + 2) +
        ';grid-row:1">' +
        '<b' + (f && f.frei ? ' class="frei"' : '') + '>' + t.date.getUTCDate() + '</b>' +
        (f ? '<i>' + esc(f.name) + '</i>' : '') +
        einzel.map(e => '<u style="border-color:' + (e.color || "#2C5140") + '">' +
          (e.from ? e.from + " " : "") + esc(e.text) + '</u>').join("") + '</div>';
    });
    balken.forEach(t => {
      const e = t.e, c = e.farbe || "#2C5140";
      rows += '<div class="pmbar' + (e.done ? " erl" : "") + '" style="grid-column:' + (t.sp + 2) +
        ' / span ' + t.len + ';grid-row:' + (t.spur + 2) + ';border-color:' + c +
        ';background:' + tint(c, .16) + ';color:' + c + '"><span>' + esc(e.text) + '</span>' +
        (t.rechtsOffen ? '<i>&#10148;</i>' : '') + '</div>';
    });
    rows += '</div>';
  });

  return '<div class="psec"><div class="phead"><h1>' + MONATSNAMEN[curMonat.m] + " " + curMonat.y +
    '</h1><span>' + vorhaben().filter(v => !v.done).length + ' Vorhaben offen</span></div>' +
    '<div class="pmonat">' + rows + '</div></div>';
}

/* ---------- Ereignisse ---------- */
function initMonat(){
  const g = $("#monatGoogle");
  if (g) g.onchange = () => {
    DB.settings.monatGoogle = g.checked;
    save(); renderMonat();
  };
  const neu = $("#vorNeu");
  if (neu) neu.onclick = () => openVorhaben(null, iso(new Date()));
  const sp = $("#saveVor");
  if (sp) sp.onclick = saveVorhaben;
  const del = $("#delVor");
  if (del) del.onclick = deleteVorhaben;
  const feld = $("#v_text");
  if (feld) feld.onkeydown = e => { if (e.key === "Enter"){ e.preventDefault(); saveVorhaben(); } };
}
