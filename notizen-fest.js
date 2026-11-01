/* ============================================================
   Týden — notizen-fest.js
   Dauerhafte Notizen, unabhängig von der Kalenderwoche.
   Jede Zeile ist ein Punkt mit Kontrollkästchen.
   ============================================================ */

function todos(){
  if (!Array.isArray(DB.todos)) DB.todos = [];
  return DB.todos;
}
function todoId(){ return "t" + Date.now() + Math.floor(Math.random() * 1000); }

/* Seiten, damit sich Punkte nach Themen trennen lassen */
function todoSeiten(){
  if (!Array.isArray(DB.todoPages) || !DB.todoPages.length){
    DB.todoPages = [{id: "p1", name: "Allgemein"}];
    // Punkte aus der Zeit ohne Seiten übernehmen
    todos().forEach(t => { if (!t.gruppe) t.gruppe = "p1"; });
    save();
  }
  return DB.todoPages;
}
function todoSeiteAktiv(){
  const seiten = todoSeiten();
  const id = DB.settings.todoPage;
  return seiten.some(s => s.id === id) ? id : seiten[0].id;
}

function todoAdd(text, gruppe){
  const t = String(text || "").trim();
  if (!t) return null;
  const eintrag = {id: todoId(), text: t, done: false,
                   gruppe: gruppe || todoSeiteAktiv(), ts: Date.now()};
  todos().push(eintrag);
  save();
  return eintrag;
}

/* Mehrere Zeilen auf einmal, etwa aus einer abgeschriebenen Liste */
function todoAddMany(text){
  let n = 0;
  String(text || "").split("\n").forEach(zeile => {
    const z = zeile.replace(/^\s*[-•*]\s*/, "").trim();
    if (!z) return;
    const erledigt = /\[erledigt\]\s*$/i.test(z);
    const eintrag = todoAdd(z.replace(/\[erledigt\]\s*$/i, "").trim());
    if (eintrag && erledigt) eintrag.done = true;
    n++;
  });
  save();
  return n;
}

function renderTodos(){
  const box = $("#todoList");
  if (!box) return;

  // Seitenleiste
  const seiten = todoSeiten(), aktiv = todoSeiteAktiv();
  DB.settings.todoPage = aktiv;
  const leiste = $("#todoPages");
  if (leiste){
    leiste.innerHTML = seiten.map(s => {
      const n = todos().filter(t => t.gruppe === s.id && !t.done).length;
      return '<button data-page="' + s.id + '"' + (s.id === aktiv ? ' class="on"' : '') + '>' +
        esc(s.name) + (n ? ' <i>' + n + '</i>' : '') + '</button>';
    }).join("");
    $$("#todoPages button").forEach(b => b.onclick = () => {
      DB.settings.todoPage = b.dataset.page; save(); renderTodos();
    });
  }

  const alle = todos().filter(t => t.gruppe === aktiv);
  const versteckt = !!DB.settings.todoHide;
  const sichtbar = versteckt ? alle.filter(t => !t.done) : alle;
  const offen = alle.filter(t => !t.done).length;

  $("#todoStats").textContent = alle.length
    ? offen + " offen · " + (alle.length - offen) + " erledigt"
    : "auf dieser Seite noch nichts notiert";
  const hideBtn = $("#todoHide");
  if (hideBtn) hideBtn.textContent = versteckt ? "Erledigte zeigen" : "Erledigte ausblenden";

  if (!sichtbar.length){
    box.innerHTML = '<p class="hint">' +
      (alle.length ? "Alles erledigt." : "Nichts eingetragen. Oben einen Punkt hinzufügen.") + '</p>';
    return;
  }

  box.innerHTML = sichtbar.map((t, i) =>
    '<div class="item punkt' + (t.done ? " done" : "") + '">' +
      '<input type="checkbox" id="td_' + i + '" data-id="' + t.id + '"' + (t.done ? " checked" : "") + '>' +
      '<label for="td_' + i + '"><span>' + esc(t.text) + '</span></label>' +
      '<button class="mini" data-edit="' + t.id + '">ändern</button>' +
      '<button class="mini" data-del="' + t.id + '">löschen</button>' +
    '</div>').join("");

  $$("#todoList input").forEach(cb => cb.onchange = () => {
    const t = todos().find(x => x.id === cb.dataset.id);
    if (t){ t.done = cb.checked; save(); renderTodos(); }
  });
  $$("#todoList [data-del]").forEach(b => b.onclick = () => {
    DB.todos = todos().filter(x => x.id !== b.dataset.del);
    save(); renderTodos();
  });
  $$("#todoList [data-edit]").forEach(b => b.onclick = () => {
    const t = todos().find(x => x.id === b.dataset.edit);
    if (!t) return;
    const neu = prompt("Punkt ändern:", t.text);
    if (neu === null) return;
    if (!neu.trim()){ DB.todos = todos().filter(x => x.id !== t.id); }
    else t.text = neu.trim();
    save(); renderTodos();
  });
}

function initTodos(){
  const feld = $("#todoInput");

  $("#todoPageAdd").onclick = () => {
    const name = prompt("Name der neuen Seite:", "Neue Seite");
    if (name === null || !name.trim()) return;
    const id = "p" + Date.now();
    todoSeiten().push({id: id, name: name.trim()});
    DB.settings.todoPage = id;
    save(); renderTodos();
  };
  $("#todoPageRename").onclick = () => {
    const seiten = todoSeiten(), aktiv = todoSeiteAktiv();
    const s = seiten.find(x => x.id === aktiv);
    const name = prompt("Seite umbenennen:", s.name);
    if (name === null || !name.trim()) return;
    s.name = name.trim();
    save(); renderTodos();
  };
  $("#todoPageDel").onclick = () => {
    const seiten = todoSeiten(), aktiv = todoSeiteAktiv();
    if (seiten.length <= 1){ toast("Die letzte Seite bleibt bestehen"); return; }
    const s = seiten.find(x => x.id === aktiv);
    const anzahl = todos().filter(t => t.gruppe === aktiv).length;
    if (!confirm("Seite „" + s.name + "“ mit " + anzahl + " Punkten entfernen?")) return;
    DB.todos = todos().filter(t => t.gruppe !== aktiv);
    DB.todoPages = seiten.filter(x => x.id !== aktiv);
    DB.settings.todoPage = DB.todoPages[0].id;
    save(); renderTodos();
  };

  $("#todoAdd").onclick = () => {
    const n = todoAddMany(feld.value);
    if (n){ feld.value = ""; renderTodos(); }
    feld.focus();
  };
  feld.onkeydown = e => {
    if (e.key === "Enter" && !e.shiftKey){ e.preventDefault(); $("#todoAdd").click(); }
  };

  $("#todoHide").onclick = () => {
    DB.settings.todoHide = !DB.settings.todoHide;
    save(); renderTodos();
  };
  $("#todoClearDone").onclick = () => {
    const weg = todos().filter(t => t.done).length;
    if (!weg) { toast("Nichts erledigt"); return; }
    if (!confirm(weg + " erledigte Punkte entfernen?")) return;
    DB.todos = todos().filter(t => !t.done);
    save(); renderTodos();
  };

  $("#todoPhoto").onclick = () => {
    if (typeof apiKey === "function" && !apiKey()){
      toast("Kein API-Schlüssel — im Tab Woche unter „Mit Claude“ eintragen");
      return;
    }
    $("#todoFile").click();
  };
  $("#todoFile").onchange = async ev => {
    const files = Array.from(ev.target.files || []);
    ev.target.value = "";
    if (!files.length) return;
    $("#todoStatus").className = "notestatus busy";
    $("#todoStatus").textContent = "Claude liest das Bild …";
    try {
      const text = await notizAusFotos(files);
      const n = todoAddMany(text);
      $("#todoStatus").className = "notestatus gut";
      $("#todoStatus").textContent = n + " Punkte übernommen";
      renderTodos();
      setTimeout(() => { $("#todoStatus").textContent = ""; $("#todoStatus").className = "notestatus"; }, 4000);
    } catch(e){
      $("#todoStatus").className = "notestatus fehler";
      $("#todoStatus").textContent = e.message.split("\n")[0];
    }
  };
}

/* ---------- Druck ---------- */
function printTodos(){
  const alle = todos();
  if (!alle.length) return "";
  const zeile = t => '<div class="pi"><span class="pbox' + (t.done ? " an" : "") + '"></span>' +
    '<span' + (t.done ? ' style="text-decoration:line-through;color:#777"' : '') + '>' +
    esc(t.text) + '</span></div>';
  const heute = new Date().toLocaleDateString("de-DE", {day:"numeric", month:"long", year:"numeric"});

  const gruppen = todoSeiten().map(s => {
    const offen = alle.filter(t => t.gruppe === s.id && !t.done);
    const fertig = alle.filter(t => t.gruppe === s.id && t.done);
    if (!offen.length && !fertig.length) return "";
    return '<div class="pgrp"><h4>' + esc(s.name) + '</h4>' +
      offen.map(zeile).join("") +
      (fertig.length ? '<div class="perledigt">' + fertig.map(zeile).join("") + '</div>' : '') +
      '</div>';
  }).join("");

  return '<div class="psec">' +
    '<div class="phead"><h1>Notizen</h1><span>Stand ' + heute + '</span></div>' +
    '<div class="pcols">' + gruppen + '</div></div>';
}
