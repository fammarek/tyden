/* ============================================================
   Týden — notizen.js
   Zeichenfläche für den Apple Pencil.
   Striche werden als Vektoren je Kalenderwoche und Seite in
   IndexedDB abgelegt, damit nichts an der Auflösung klebt.
   ============================================================ */

const PENS = [
  {c:"#1B2A21", w:2.2},
  {c:"#2C5140", w:2.2},
  {c:"#6B2D4E", w:2.2},
  {c:"#E4A93C", w:7.0}
];
let penIdx = 0, eraseMode = false;
let strokes = [];          // [{c,w,pts:[{x,y,p}]}]
let notePage = 0;
let drawing = null;
let padCtx = null, padDpr = 1;

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
  db.transaction("pages", "readwrite").objectStore("pages").put(val, key);
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

/* ---------- Zeichnen ---------- */
function sizePad(){
  const cv = $("#pad");
  if (!cv || cv.offsetWidth === 0) return;
  padDpr = Math.min(window.devicePixelRatio || 1, 2);
  cv.width = Math.round(cv.offsetWidth * padDpr);
  cv.height = Math.round(cv.offsetHeight * padDpr);
  padCtx = cv.getContext("2d");
  padCtx.scale(padDpr, padDpr);
  redraw();
}
function lineRule(ctx, w, h){
  ctx.save();
  ctx.strokeStyle = "rgba(27,42,33,.10)";
  ctx.lineWidth = 1;
  for (let y = 38; y < h; y += 38){
    ctx.beginPath(); ctx.moveTo(14, y); ctx.lineTo(w - 14, y); ctx.stroke();
  }
  ctx.restore();
}
function drawStroke(ctx, s){
  const pts = s.pts;
  if (!pts.length) return;
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
  const w = cv.offsetWidth, h = cv.offsetHeight;
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
function saveStrokes(){
  dbPut(pageKey(), strokes);
}

function initPad(){
  const cv = $("#pad");

  cv.addEventListener("pointerdown", e => {
    // Handballen und Finger ignorieren, sobald ein Stift im Spiel ist
    if (e.pointerType === "touch" && usedPen) return;
    if (e.pointerType === "pen") usedPen = true;
    cv.setPointerCapture(e.pointerId);
    const pt = posOf(e, cv);
    if (eraseMode){
      const before = strokes.length;
      strokes = strokes.filter(s => !hitStroke(s, pt));
      if (strokes.length !== before){ redraw(); saveStrokes(); }
      drawing = "erase";
      return;
    }
    drawing = {c: PENS[penIdx].c, w: PENS[penIdx].w, pts: [pt]};
    strokes.push(drawing);
  });

  cv.addEventListener("pointermove", e => {
    if (!drawing) return;
    if (e.pointerType === "touch" && usedPen) return;
    const pt = posOf(e, cv);
    if (drawing === "erase"){
      const before = strokes.length;
      strokes = strokes.filter(s => !hitStroke(s, pt));
      if (strokes.length !== before) redraw();
      return;
    }
    const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
    evs.forEach(ce => drawing.pts.push(posOf(ce, cv)));
    drawStroke(padCtx, {c: drawing.c, w: drawing.w, pts: drawing.pts.slice(-3)});
  });

  const end = () => {
    if (drawing && drawing !== "erase" && drawing.pts.length) saveStrokes();
    else if (drawing === "erase") saveStrokes();
    drawing = null;
  };
  cv.addEventListener("pointerup", end);
  cv.addEventListener("pointercancel", end);
  cv.addEventListener("pointerleave", end);

  $("#pens").innerHTML = PENS.map((p, i) =>
    '<button class="pen' + (i === 0 ? " on" : "") + '" data-pen="' + i + '" ' +
    'style="background:' + p.c + '"></button>').join("");
  $$("#pens .pen").forEach(b => b.onclick = () => {
    penIdx = Number(b.dataset.pen);
    eraseMode = false;
    $("#eraser").classList.remove("on");
    $$("#pens .pen").forEach(x => x.classList.toggle("on", x === b));
  });
  $("#eraser").onclick = () => {
    eraseMode = !eraseMode;
    $("#eraser").classList.toggle("on", eraseMode);
  };
  $("#undo").onclick = () => { strokes.pop(); redraw(); saveStrokes(); };
  $("#clearPage").onclick = () => {
    if (!strokes.length || !confirm("Diese Seite leeren?")) return;
    strokes = []; redraw(); saveStrokes();
  };
  $("#addPage").onclick = async () => {
    const keys = await dbKeys();
    const mine = keys.filter(k => String(k).startsWith(keyOf(cur) + "#"));
    notePage = mine.length;
    strokes = [];
    await dbPut(pageKey(), []);
    renderNotes();
  };
  window.addEventListener("resize", () => { if (activeTab === "notizen") sizePad(); });
}
let usedPen = false;

async function renderNotes(){
  const keys = await dbKeys();
  const mine = keys.filter(k => String(k).startsWith(keyOf(cur) + "#"))
    .map(k => Number(String(k).split("#")[1])).sort((a, b) => a - b);
  const pages = mine.length ? mine : [0];
  if (pages.indexOf(notePage) < 0) notePage = pages[0];

  $("#notePages").innerHTML = pages.map(p =>
    '<button data-page="' + p + '"' + (p === notePage ? ' class="on"' : '') + '>Seite ' + (p + 1) + '</button>').join("");
  $$("#notePages button").forEach(b => b.onclick = async () => {
    notePage = Number(b.dataset.page);
    strokes = (await dbGet(pageKey())) || [];
    renderNotes();
  });

  strokes = (await dbGet(pageKey())) || [];

  // alle Seiten der Woche für den Druck vorhalten
  weekPages = [];
  for (const p of pages) weekPages.push({page: p, strokes: (await dbGet(pageKey(p))) || []});

  if (activeTab === "notizen") sizePad(); else redraw();
}
let weekPages = [];

function strokeBounds(list){
  let w = 1000, h = 700;
  list.forEach(s => s.pts.forEach(p => { if (p.x > w) w = p.x; if (p.y > h) h = p.y; }));
  return {w: Math.ceil(w + 20), h: Math.ceil(h + 20)};
}

/* ---------- Druck ---------- */
function printNotizen(){
  const seiten = weekPages.filter(p => p.strokes && p.strokes.length);
  if (!seiten.length) return "";
  const cv = $("#pad");
  return seiten.map(seite => {
    const b = strokeBounds(seite.strokes);
    const w = Math.max(b.w, (cv && cv.offsetWidth) || 0, 900);
    const h = Math.max(b.h, 600);
    const out = document.createElement("canvas");
    out.width = w * 2; out.height = h * 2;
    const ctx = out.getContext("2d");
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, out.width, out.height);
    ctx.scale(2, 2);
    lineRule(ctx, w, h);
    seite.strokes.forEach(s => drawStroke(ctx, s));
    return '<div class="psec">' + printHead("Notizen — Seite " + (seite.page + 1)) +
      '<img class="pimg" src="' + out.toDataURL("image/png") + '"></div>';
  }).join("");
}
