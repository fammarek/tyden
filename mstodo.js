/* ============================================================
   Týden — mstodo.js
   Einkaufsliste an Microsoft To Do. Anmeldung über OAuth mit PKCE,
   also ohne Geheimschlüssel, der in einem öffentlichen Repository
   nichts zu suchen hätte. Der Zugang liegt nur in diesem Browser.
   ============================================================ */

const MS_AUTH  = "https://login.microsoftonline.com/common/oauth2/v2.0/authorize";
const MS_TOKEN = "https://login.microsoftonline.com/common/oauth2/v2.0/token";
const MS_GRAPH = "https://graph.microsoft.com/v1.0";
const MS_SCOPE = "Tasks.ReadWrite offline_access openid profile";
const MS_KEY   = "tyden.ms";

/* Die Adresse, die in Azure als Umleitungs-URI eingetragen sein muss:
   genau diese Seite, ohne Fragezeichen und ohne Raute dahinter. */
function msRedirect(){
  // immer die Ordner-Adresse, auch wenn gerade .../index.html offen ist.
  // Azure vergleicht Zeichen für Zeichen.
  return (location.origin + location.pathname).replace(/index\.html$/, "");
}
function msClientId(){ return (DB.settings.msClientId || "").trim(); }

function msGespeichert(){
  try { return JSON.parse(localStorage.getItem(MS_KEY) || "null"); } catch(e){ return null; }
}
function msSpeichern(d){
  try {
    if (d) localStorage.setItem(MS_KEY, JSON.stringify(d));
    else localStorage.removeItem(MS_KEY);
  } catch(e){}
}

/* ---------- PKCE ---------- */
function b64url(bytes){
  let s = "";
  bytes.forEach(b => s += String.fromCharCode(b));
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
async function pkcePaar(){
  const v = b64url(crypto.getRandomValues(new Uint8Array(32)));
  const h = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(v));
  return {verifier: v, challenge: b64url(new Uint8Array(h))};
}

/* ---------- Anmelden ---------- */
async function msConnect(){
  const id = msClientId();
  if (!id){ toast("Erst die Anwendungs-ID aus Azure eintragen"); return; }
  const p = await pkcePaar();
  const state = b64url(crypto.getRandomValues(new Uint8Array(12)));
  try {
    sessionStorage.setItem("tyden.ms.v", p.verifier);
    sessionStorage.setItem("tyden.ms.s", state);
    localStorage.setItem("tyden.ms.v", p.verifier);   // iPad räumt sessionStorage gern weg
    localStorage.setItem("tyden.ms.s", state);
  } catch(e){}
  const u = MS_AUTH + "?client_id=" + encodeURIComponent(id) +
    "&response_type=code" +
    "&redirect_uri=" + encodeURIComponent(msRedirect()) +
    "&response_mode=query" +
    "&scope=" + encodeURIComponent(MS_SCOPE) +
    "&state=" + state +
    "&code_challenge=" + p.challenge +
    "&code_challenge_method=S256" +
    "&prompt=select_account";
  location.href = u;
}

/* Rückkehr von Microsoft: Code gegen Zugang tauschen. */
async function msRueckkehr(){
  const q = new URLSearchParams(location.search);
  const code = q.get("code"), state = q.get("state"), fehler = q.get("error");
  if (!code && !fehler) return false;

  // Adresszeile wieder sauber machen, egal wie es ausgeht
  const sauber = () => history.replaceState({}, "", msRedirect());

  if (fehler){
    sauber();
    msStatus("Microsoft hat abgelehnt: " + fehler + " — " + (q.get("error_description") || ""));
    return true;
  }
  let v = "", s = "";
  try {
    v = sessionStorage.getItem("tyden.ms.v") || localStorage.getItem("tyden.ms.v") || "";
    s = sessionStorage.getItem("tyden.ms.s") || localStorage.getItem("tyden.ms.s") || "";
  } catch(e){}
  sauber();
  if (!v || (state && s && state !== s)){
    msStatus("Die Anmeldung passte nicht zur Anfrage. Bitte noch einmal versuchen.");
    return true;
  }
  try {
    await msTausch({
      grant_type: "authorization_code",
      code: code,
      redirect_uri: msRedirect(),
      code_verifier: v
    });
    toast("Mit Microsoft To Do verbunden");
    msStatus("");
    renderMsListen();
  } catch(err){
    msStatus(err.message);
  }
  try { sessionStorage.removeItem("tyden.ms.v"); localStorage.removeItem("tyden.ms.v"); } catch(e){}
  return true;
}

async function msTausch(felder){
  const body = new URLSearchParams(Object.assign({
    client_id: msClientId(),
    scope: MS_SCOPE
  }, felder));
  const r = await fetch(MS_TOKEN, {
    method: "POST",
    headers: {"Content-Type": "application/x-www-form-urlencoded"},
    body: body.toString()
  });
  const roh = await r.text();
  let d = {};
  try { d = JSON.parse(roh); } catch(e){}
  if (!r.ok || !d.access_token){
    throw new Error("Microsoft meldet " + r.status + ": " +
      (d.error_description || d.error || roh.slice(0, 200)));
  }
  msSpeichern({
    access: d.access_token,
    refresh: d.refresh_token || (msGespeichert() || {}).refresh || "",
    exp: Date.now() + (Number(d.expires_in || 3600) - 120) * 1000
  });
  return d.access_token;
}

/* Gültigen Zugang besorgen, notfalls still erneuern. */
async function msToken(){
  const g = msGespeichert();
  if (!g) return null;
  if (g.exp > Date.now()) return g.access;
  if (!g.refresh) return null;
  try {
    return await msTausch({grant_type: "refresh_token", refresh_token: g.refresh});
  } catch(e){
    msSpeichern(null);
    return null;
  }
}
function msVerbunden(){ return !!msGespeichert(); }
function msTrennen(){
  msSpeichern(null);
  DB.settings.msListId = "";
  save();
  renderMsListen();
  toast("Verbindung zu Microsoft gelöst");
}

/* ---------- Graph ---------- */
async function msGet(pfad){
  const t = await msToken();
  if (!t) throw new Error("Nicht angemeldet.");
  const r = await fetch(MS_GRAPH + pfad, {headers: {Authorization: "Bearer " + t}});
  const roh = await r.text();
  let d = {};
  try { d = JSON.parse(roh); } catch(e){}
  if (!r.ok) throw new Error("Graph meldet " + r.status + ": " +
    ((d.error && d.error.message) || roh.slice(0, 200)));
  return d;
}
async function msListen(){
  const d = await msGet("/me/todo/lists");
  return (d.value || []).map(l => ({id: l.id, name: l.displayName, standard: l.wellknownListName === "defaultList"}));
}

/* Eine Liste je Woche: "Einkauf KW 46". Gibt es sie schon, wird sie benutzt,
   sonst legt die App sie an. */
function msListName(was){
  return (was === "Backen" ? "Backen KW " : "Einkauf KW ") + cur.week;
}
async function msListeAnlegen(name){
  const t = await msToken();
  if (!t) throw new Error("Nicht angemeldet.");
  const r = await fetch(MS_GRAPH + "/me/todo/lists", {
    method: "POST",
    headers: {Authorization: "Bearer " + t, "Content-Type": "application/json"},
    body: JSON.stringify({displayName: name})
  });
  const roh = await r.text();
  let d = {};
  try { d = JSON.parse(roh); } catch(e){}
  if (!r.ok || !d.id) throw new Error("Liste anlegen ging nicht: " +
    ((d.error && d.error.message) || roh.slice(0, 200)));
  return d.id;
}
async function msZielliste(was){
  if (!DB.settings.msProWoche) return {id: DB.settings.msListId, name: "", neu: false};
  const name = msListName(was);
  const listen = await msListen();
  const da = listen.find(l => l.name.trim().toLowerCase() === name.toLowerCase());
  if (da) return {id: da.id, name: name, neu: false};
  return {id: await msListeAnlegen(name), name: name, neu: true};
}

/* Mehrere Aufgaben in einem Rutsch, der Stapel nimmt bis zu 20. */
async function msAufgaben(listId, titel){
  const t = await msToken();
  if (!t) throw new Error("Nicht angemeldet.");
  let angelegt = 0;
  for (let i = 0; i < titel.length; i += 20){
    const teil = titel.slice(i, i + 20);
    const r = await fetch(MS_GRAPH + "/$batch", {
      method: "POST",
      headers: {Authorization: "Bearer " + t, "Content-Type": "application/json"},
      body: JSON.stringify({requests: teil.map((n, k) => ({
        id: String(k + 1),
        method: "POST",
        url: "/me/todo/lists/" + listId + "/tasks",
        headers: {"Content-Type": "application/json"},
        body: {title: n}
      }))})
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error("Graph meldet " + r.status + ": " +
      ((d.error && d.error.message) || ""));
    (d.responses || []).forEach(a => { if (a.status >= 200 && a.status < 300) angelegt++; });
  }
  return angelegt;
}

/* ---------- Senden ---------- */
/* Was auf der Liste offen ist, wird zur Aufgabe. Menge hinter dem Namen,
   weil To Do kein eigenes Feld dafür hat. */
function msTitelDerWoche(){
  const w = week(keyOf(cur)), port = Number(DB.settings.port);
  const titel = [];
  Object.keys(GRP).forEach(g => {
    buildList().filter(i => i.g === g && !i.pantry && !w.checked[i.key])
      .forEach(i => titel.push(i.n + " — " + posText(i, port)));
  });
  extras(w).filter(x => !w.checked["x:" + x.id]).forEach(x => titel.push(x.text));
  return titel;
}
function msTitelBacken(){
  const b = backState();
  const titel = [];
  Object.keys(GRP).forEach(g => {
    bakeList().filter(i => i.g === g && !i.pantry && !b.checked[i.key])
      .forEach(i => titel.push(i.n + " — " + posText(i, 4)));
  });
  (b.extra || []).filter(x => !b.checked["x:" + x.id]).forEach(x => titel.push(x.text));
  return titel;
}

async function msSenden(titel, was){
  if (!msClientId()){ toast("Erst unter Zahnrad die Anwendungs-ID eintragen"); return; }
  if (!msVerbunden()){ toast("Erst unter Zahnrad mit Microsoft verbinden"); return; }
  if (!DB.settings.msProWoche && !DB.settings.msListId){
    toast("Erst unter Zahnrad eine Liste auswählen"); return;
  }
  if (!titel.length){ toast("Nichts offen zum Senden"); return; }

  toast("Wird an To Do geschickt …");
  try {
    const ziel = await msZielliste(was);
    if (!ziel.id) throw new Error("Keine Liste gefunden.");
    // Schon Vorhandenes nicht doppelt anlegen
    let da = [];
    if (!ziel.neu){
      try {
        const d = await msGet("/me/todo/lists/" + ziel.id +
          "/tasks?$filter=status ne 'completed'&$select=title&$top=200");
        da = (d.value || []).map(x => String(x.title || "").toLowerCase());
      } catch(e){}
    }
    const neu = titel.filter(n => da.indexOf(n.toLowerCase()) < 0);
    if (!neu.length){ toast("Steht schon alles in To Do"); return; }
    const n = await msAufgaben(ziel.id, neu);
    const doppelt = titel.length - neu.length;
    const wohin = ziel.name ? " in „" + ziel.name + "“" : " in To Do";
    toast(n + (n === 1 ? " Aufgabe" : " Aufgaben") + wohin +
      (ziel.neu ? " (neu angelegt)" : "") +
      (doppelt ? ", " + doppelt + " war schon da" : ""));
  } catch(err){
    msStatus(err.message);
    toast("Hat nicht geklappt — Zahnrad zeigt den Grund");
  }
}

/* ---------- Oberfläche ---------- */
function msStatus(text){
  const el = $("#msStatus");
  if (!el) return;
  el.textContent = text || (msVerbunden() ? "Verbunden." : "Nicht verbunden.");
  el.className = "gstatus" + (text ? " warn" : (msVerbunden() ? " on" : ""));
}
async function renderMsListen(){
  const box = $("#msListen");
  if (!box) return;
  msStatus("");
  $("#msConnect").textContent = msVerbunden() ? "Neu anmelden" : "Mit Microsoft verbinden";
  $("#msTrennen").style.display = msVerbunden() ? "" : "none";
  if (!msVerbunden()){ box.innerHTML = ""; return; }
  if (DB.settings.msProWoche){
    box.innerHTML = '<p class="hint">Jeder Versand legt eine eigene Liste an, benannt nach der ' +
      'Kalenderwoche: derzeit <b>' + esc(msListName("Einkauf")) + '</b> und <b>' +
      esc(msListName("Backen")) + '</b>. Gibt es sie schon, wird sie weiterbenutzt.</p>';
    return;
  }
  box.innerHTML = '<p class="hint">Listen werden geladen …</p>';
  try {
    const listen = await msListen();
    if (!DB.settings.msListId && listen.length){
      const std = listen.find(l => l.standard) || listen[0];
      DB.settings.msListId = std.id;
      save();
    }
    box.innerHTML = '<div class="field"><label class="lbl">Liste in To Do</label>' +
      '<select id="msListe">' + listen.map(l =>
        '<option value="' + esc(l.id) + '"' + (l.id === DB.settings.msListId ? " selected" : "") +
        '>' + esc(l.name) + '</option>').join("") + '</select></div>';
    $("#msListe").onchange = () => { DB.settings.msListId = $("#msListe").value; save(); };
  } catch(err){
    box.innerHTML = "";
    msStatus(err.message);
  }
}

function initMsTodo(){
  const pw = $("#msProWoche");
  if (pw){
    if (DB.settings.msProWoche === undefined) DB.settings.msProWoche = true;
    pw.checked = !!DB.settings.msProWoche;
    pw.onchange = () => { DB.settings.msProWoche = pw.checked; save(); renderMsListen(); };
  }
  const feld = $("#msClientId");
  if (feld){
    feld.value = DB.settings.msClientId || "";
    feld.onchange = () => { DB.settings.msClientId = feld.value.trim(); save(); };
  }
  const ziel = $("#msRedirect");
  if (ziel) ziel.textContent = msRedirect();
  const verb = $("#msConnect");
  if (verb) verb.onclick = msConnect;
  const trenn = $("#msTrennen");
  if (trenn) trenn.onclick = msTrennen;
  const a = $("#shopTodo");
  if (a) a.onclick = () => msSenden(msTitelDerWoche(), "Einkauf");
  const bb = $("#bakeTodo");
  if (bb) bb.onclick = () => msSenden(msTitelBacken(), "Backen");
  renderMsListen();
}
