/* ============================================================
   Týden — notizen.js
   Notizblock je Kalenderwoche. Jede Seite trägt zwei Ebenen:
   getippten Text und handschriftliche Striche. Umschalten
   entscheidet nur, welche Ebene gerade die Eingabe bekommt.
   Striche liegen als Vektoren in IndexedDB.
   ============================================================ */

const PENS = [
  {c:"#1B2A21", w:2.2},
  {c:"#2C5140", w:2.2},
  {c:"#6B2D4E", w:2.2},
  {c:"#E4A93C", w:7.0}
];
const ZEILE = 38;          // Zeilenabstand des Linienrasters
const SEITE_H = 1700;      // Seitenhöhe, darüber wird gescrollt

let penIdx = 0, eraseMode = false, stiftModus = true;
let strokes = [], seitenText = "";
let notePage = 0, drawing = null, usedPen = false;
let padCtx = null, padDpr = 1;
let weekPages = [];

/* ---------- IndexedDB ---------- */
let idb = null;
function openDb(){
  return new Promise(resolve => {
    if (idb) return resolve(idb);
    const rq = indexedDB.open("tyden-notes", 1);
    rq.onupgradeneeded = () => rq.result.createObjectStore("pages");
    rq.onsuccess = () => { idb = rq.result; resolve(idb); };
    rq.onerror = () => resolve(null);
  });
}
function pageKey(p){ return keyOf(cur) + "#" + (p === undefined ? notePage : p); }

/* Alte Seiten waren reine Strich-Listen, neue sind Objekte. */
function normalise(val){
  if (!val) return {strokes: [], text: ""};
  if (Array.isArray(val)) return {strokes: val, text: ""};
  return {strokes: val.strokes || [], text: val.text || ""};
}
async function dbGet(key){
  const db = await openDb();
  if (!db) return null;
  return new Promise(resolve => {
    const rq = db.transaction("pages").objectStore("pages").get(key);
    rq.onsuccess = () => resolve(rq.result || null);
    rq.onerror = () => resolve(null);
  });
}
async function dbPut(key, val){
  const db = await openDb();
  if (!db) return;
  return new Promise(resolve => {
    const rq = db.transaction("pages", "readwrite").objectStore("pages").put(val, key);
    rq.onsuccess = rq.onerror = () => resolve();
  });
}
async function dbDel(key){
  const db = await openDb();
  if (!db) return;
  return new Promise(resolve => {
    const rq = db.transaction("pages", "readwrite").objectStore("pages").delete(key);
    rq.onsuccess = rq.onerror = () => resolve();
  });
}
async function dbKeys(){
  const db = await openDb();
  if (!db) return [];
  return new Promise(resolve => {
    const rq = db.transaction("pages").objectStore("pages").getAllKeys();
    rq.onsuccess = () => resolve(rq.result || []);
    rq.onerror = () => resolve([]);
  });
}
function savePage(){
  return dbPut(pageKey(), {strokes: strokes, text: seitenText});
}

/* ---------- Zeichnen ---------- */
function sizePad(){
  const cv = $("#pad");
  if (!cv || cv.offsetWidth === 0) return;
  padDpr = Math.min(window.devicePixelRatio || 1, 2);
  cv.style.height = SEITE_H + "px";
  cv.width = Math.round(cv.offsetWidth * padDpr);
  cv.height = Math.round(SEITE_H * padDpr);
  padCtx = cv.getContext("2d");
  padCtx.setTransform(padDpr, 0, 0, padDpr, 0, 0);
  redraw();
  if (padSync) padSync();
}
function lineRule(ctx, w, h){
  ctx.save();
  ctx.strokeStyle = "rgba(27,42,33,.10)";
  ctx.lineWidth = 1;
  for (let y = ZEILE; y < h; y += ZEILE){
    ctx.beginPath(); ctx.moveTo(14, y + .5); ctx.lineTo(w - 14, y + .5); ctx.stroke();
  }
  ctx.restore();
}
function drawStroke(ctx, s){
  const pts = s.pts;
  if (!pts || !pts.length) return;
  ctx.strokeStyle = s.c;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  if (pts.length === 1){
    ctx.beginPath();
    ctx.arc(pts[0].x, pts[0].y, s.w * (pts[0].p || .5) / 2, 0, 6.3);
    ctx.fillStyle = s.c; ctx.fill();
    return;
  }
  for (let i = 1; i < pts.length; i++){
    const a = pts[i-1], b = pts[i];
    ctx.lineWidth = Math.max(.6, s.w * ((a.p + b.p) / 2 || .5) * 1.6);
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }
}
function redraw(){
  const cv = $("#pad");
  if (!padCtx || !cv) return;
  const w = cv.offsetWidth, h = SEITE_H;
  padCtx.clearRect(0, 0, w, h);
  lineRule(padCtx, w, h);
  strokes.forEach(s => drawStroke(padCtx, s));
}
function posOf(e, cv){
  const r = cv.getBoundingClientRect();
  return {
    x: e.clientX - r.left,
    y: e.clientY - r.top,
    p: e.pointerType === "pen" ? (e.pressure || .5) : .55
  };
}
function hitStroke(s, pt){
  return s.pts.some(p => Math.abs(p.x - pt.x) < 12 && Math.abs(p.y - pt.y) < 12);
}

/* ---------- Umschalten Stift / Tastatur ---------- */
function setModus(stift){
  stiftModus = stift;
  $("#modePen").classList.toggle("on", stift);
  $("#modeKey").classList.toggle("on", !stift);
  $("#pad").classList.toggle("hinten", !stift);
  $("#padText").classList.toggle("hinten", stift);
  $("#padText").readOnly = stift;
  // Zeichenwerkzeuge nur im Stiftmodus
  ["pens","eraser","undo"].forEach(id => {
    const el = $("#" + id);
    if (el) el.style.display = stift ? "" : "none";
  });
  if (!stift) setTimeout(() => $("#padText").focus(), 50);
}

function initPad(){
  const cv = $("#pad");

  cv.addEventListener("pointerdown", e => {
    if (!stiftModus) return;
    if (e.pointerType === "touch" && usedPen) return;   // Handballen und Finger ignorieren
    if (e.pointerType === "pen") usedPen = true;
    cv.setPointerCapture(e.pointerId);
    const pt = posOf(e, cv);
    if (eraseMode){
      const vorher = strokes.length;
      strokes = strokes.filter(s => !hitStroke(s, pt));
      if (strokes.length !== vorher){ redraw(); savePage(); }
      drawing = "erase";
      return;
    }
    drawing = {c: PENS[penIdx].c, w: PENS[penIdx].w, pts: [pt]};
    strokes.push(drawing);
  });

  cv.addEventListener("pointermove", e => {
    if (!drawing || !stiftModus) return;
    if (e.pointerType === "touch" && usedPen) return;
    const pt = posOf(e, cv);
    if (drawing === "erase"){
      const vorher = strokes.length;
      strokes = strokes.filter(s => !hitStroke(s, pt));
      if (strokes.length !== vorher) redraw();
      return;
    }
    const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
    evs.forEach(ce => drawing.pts.push(posOf(ce, cv)));
    drawStroke(padCtx, {c: drawing.c, w: drawing.w, pts: drawing.pts.slice(-3)});
  });

  const ende = () => { if (drawing){ savePage(); drawing = null; } };
  cv.addEventListener("pointerup", ende);
  cv.addEventListener("pointercancel", ende);
  cv.addEventListener("pointerleave", ende);

  const ta = $("#padText");
  ta.oninput = () => {
    seitenText = ta.value;
    clearTimeout(ta._t);
    ta._t = setTimeout(savePage, 400);
  };

  $("#modePen").onclick = () => setModus(true);
  $("#modeKey").onclick = () => setModus(false);

  $("#pens").innerHTML = PENS.map((p, i) =>
    '<button class="pen' + (i === 0 ? " on" : "") + '" data-pen="' + i + '" ' +
    'style="background:' + p.c + '"></button>').join("");
  $$("#pens .pen").forEach(b => b.onclick = () => {
    penIdx = Number(b.dataset.pen);
    eraseMode = false;
    $("#eraser").classList.remove("on");
    $$("#pens .pen").forEach(x => x.classList.toggle("on", x === b));
    setModus(true);
  });
  $("#eraser").onclick = () => {
    eraseMode = !eraseMode;
    $("#eraser").classList.toggle("on", eraseMode);
    if (eraseMode) setModus(true);
  };
  $("#undo").onclick = () => { strokes.pop(); redraw(); savePage(); };

  $("#clearPage").onclick = () => {
    if ((!strokes.length && !seitenText) || !confirm("Inhalt dieser Seite löschen?")) return;
    strokes = []; seitenText = "";
    $("#padText").value = "";
    redraw(); savePage();
  };

  $("#delPage").onclick = deletePage;

  $("#notePhoto").onclick = () => {
    if (typeof apiKey === "function" && !apiKey()){
      toast("Kein API-Schlüssel — im Tab Woche unter „Mit Claude“ eintragen");
      return;
    }
    $("#noteFile").click();
  };
  $("#noteFile").onchange = async ev => {
    const files = Array.from(ev.target.files || []);
    ev.target.value = "";
    if (!files.length) return;
    noteStatus("Claude liest " + (files.length > 1 ? files.length + " Bilder" : "das Bild") + " …", "busy");
    try {
      const text = await notizAusFotos(files);
      if (!text){ noteStatus("Auf dem Bild war kein Text zu erkennen.", "fehler"); return; }
      seitenText = seitenText.trim() ? seitenText.replace(/\s+$/,"") + "\n\n" + text : text;
      $("#padText").value = seitenText;
      await savePage();
      setModus(false);
      const ta = $("#padText");
      ta.scrollTop = ta.scrollHeight;
      noteStatus("Abgeschrieben — jetzt frei bearbeitbar", "gut");
      setTimeout(() => noteStatus(""), 4000);
    } catch(e){
      noteStatus(e.message.split("\n")[0], "fehler");
      console.warn("Abschrift fehlgeschlagen:", e.message, e.roh || "");
    }
  };

  $("#addPage").onclick = async () => {
    const seiten = await seitenDerWoche();
    notePage = seiten.length ? Math.max.apply(null, seiten) + 1 : 0;
    strokes = []; seitenText = "";
    await dbPut(pageKey(), {strokes: [], text: ""});
    await renderNotes();
    $(".canvaswrap").scrollTop = 0;
  };

  initScrollbar();
  window.addEventListener("resize", () => { if (activeTab === "wochennotizen") sizePad(); });
  setModus(true);
}

/* ---------- Eigener Scrollbalken ----------
   Die Schreibfläche selbst reagiert nicht mehr auf Wischgesten, damit der Stift
   nicht mit dem Scrollen in Konflikt gerät. Gescrollt wird hier. */
function initScrollbar(){
  const wrap = $(".canvaswrap");
  const track = $("#scrollTrack");
  const thumb = $("#scrollThumb");
  if (!wrap || !track || !thumb) return;

  function syncThumb(){
    const sichtbar = wrap.clientHeight, gesamt = wrap.scrollHeight;
    const anteil = Math.min(1, sichtbar / gesamt);
    const bahn = track.clientHeight;
    const hoehe = Math.max(36, bahn * anteil);
    const weg = bahn - hoehe;
    const pos = gesamt - sichtbar > 0 ? (wrap.scrollTop / (gesamt - sichtbar)) * weg : 0;
    thumb.style.height = hoehe + "px";
    thumb.style.top = pos + "px";
  }
  function scrollZu(clientY){
    const r = track.getBoundingClientRect();
    const hoehe = thumb.offsetHeight;
    const anteil = (clientY - r.top - hoehe / 2) / Math.max(1, r.height - hoehe);
    wrap.scrollTop = Math.max(0, Math.min(1, anteil)) * (wrap.scrollHeight - wrap.clientHeight);
    syncThumb();
  }

  let zieht = false;
  track.addEventListener("pointerdown", e => {
    zieht = true;
    track.setPointerCapture(e.pointerId);
    scrollZu(e.clientY);
  });
  track.addEventListener("pointermove", e => { if (zieht) scrollZu(e.clientY); });
  const los = () => { zieht = false; };
  track.addEventListener("pointerup", los);
  track.addEventListener("pointercancel", los);

  const sprung = richtung => {
    wrap.scrollBy({top: richtung * wrap.clientHeight * 0.8, behavior: "smooth"});
    setTimeout(syncThumb, 350);
  };
  $("#scrollUp").onclick = () => sprung(-1);
  $("#scrollDown").onclick = () => sprung(1);

  wrap.addEventListener("scroll", syncThumb, {passive: true});
  window.addEventListener("resize", syncThumb);
  padSync = syncThumb;
  syncThumb();
}
let padSync = null;

function noteStatus(text, art){
  const el = $("#noteStatus");
  if (!el) return;
  el.textContent = text || "";
  el.className = "notestatus" + (art ? " " + art : "");
}

async function seitenDerWoche(){
  const keys = await dbKeys();
  return keys.filter(k => String(k).startsWith(keyOf(cur) + "#"))
    .map(k => Number(String(k).split("#")[1]))
    .sort((a, b) => a - b);
}

/* Seite dauerhaft entfernen und die folgenden nachrücken lassen */
async function deletePage(){
  const seiten = await seitenDerWoche();
  if (seiten.length <= 1){
    if (!confirm("Das ist die einzige Seite dieser Woche. Inhalt löschen?")) return;
    strokes = []; seitenText = "";
    $("#padText").value = "";
    redraw(); await savePage(); return;
  }
  if (!confirm("Seite " + (notePage + 1) + " endgültig entfernen?")) return;

  const inhalte = [];
  for (const p of seiten){
    if (p === notePage) continue;
    inhalte.push(await dbGet(keyOf(cur) + "#" + p));
  }
  for (const p of seiten) await dbDel(keyOf(cur) + "#" + p);
  for (let i = 0; i < inhalte.length; i++) await dbPut(keyOf(cur) + "#" + i, inhalte[i]);

  notePage = Math.max(0, notePage - 1);
  await renderNotes();
  toast("Seite entfernt");
}

async function renderNotes(){
  const vorhanden = await seitenDerWoche();
  const seiten = vorhanden.length ? vorhanden : [0];
  if (seiten.indexOf(notePage) < 0) notePage = seiten[0];

  $("#notePages").innerHTML = seiten.map(p =>
    '<button data-page="' + p + '"' + (p === notePage ? ' class="on"' : '') + '>Seite ' + (p + 1) + '</button>').join("");
  $$("#notePages button").forEach(b => b.onclick = async () => {
    notePage = Number(b.dataset.page);
    await ladeSeite();
    renderNotes();
    $(".canvaswrap").scrollTop = 0;
  });

  await ladeSeite();

  // alle Seiten der Woche für den Druck vorhalten
  weekPages = [];
  for (const p of seiten){
    const d = normalise(await dbGet(keyOf(cur) + "#" + p));
    weekPages.push({page: p, strokes: d.strokes, text: d.text});
  }
  if (activeTab === "wochennotizen") sizePad(); else redraw();
}
async function ladeSeite(){
  const d = normalise(await dbGet(pageKey()));
  strokes = d.strokes;
  seitenText = d.text;
  const ta = $("#padText");
  if (ta) ta.value = seitenText;
}

/* ---------- Druck ---------- */
function strokeBounds(list){
  let w = 900, h = 400;
  list.forEach(s => s.pts.forEach(p => { if (p.x > w) w = p.x; if (p.y > h) h = p.y; }));
  return {w: Math.ceil(w + 20), h: Math.ceil(h + 40)};
}
function printNotizen(){
  const seiten = weekPages.filter(p => (p.strokes && p.strokes.length) || (p.text && p.text.trim()));
  if (!seiten.length) return "";
  const cv = $("#pad");
  return seiten.map(seite => {
    let bild = "";
    if (seite.strokes && seite.strokes.length){
      const b = strokeBounds(seite.strokes);
      const w = Math.max(b.w, (cv && cv.offsetWidth) || 0, 900);
      const h = Math.min(b.h, SEITE_H);
      const out = document.createElement("canvas");
      out.width = w * 2; out.height = h * 2;
      const ctx = out.getContext("2d");
      ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, out.width, out.height);
      ctx.scale(2, 2);
      lineRule(ctx, w, h);
      seite.strokes.forEach(s => drawStroke(ctx, s));
      bild = '<img class="pimg" src="' + out.toDataURL("image/png") + '">';
    }
    const text = (seite.text && seite.text.trim())
      ? '<div class="ptext">' + esc(seite.text) + '</div>' : "";
    return '<div class="psec">' + printHead("Notizen — Seite " + (seite.page + 1)) + text + bild + '</div>';
  }).join("");
}
