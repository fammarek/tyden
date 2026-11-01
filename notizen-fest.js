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

function todoAdd(text, gruppe, parent){
  const t = String(text || "").trim();
  if (!t) return null;
  const eintrag = {id: todoId(), text: t, done: false,
                   gruppe: gruppe || todoSeiteAktiv(), parent: parent || "", ts: Date.now()};
  if (parent){
    // Unterpunkte direkt hinter ihren letzten Geschwisterpunkt einsortieren
    const liste = todos();
    let pos = liste.findIndex(x => x.id === parent);
    for (let i = pos + 1; i < liste.length && liste[i].parent === parent; i++) pos = i;
    liste.splice(pos + 1, 0, eintrag);
  } else {
    todos().push(eintrag);
  }
  save();
  return eintrag;
}
function kinderVon(id){ return todos().filter(t => t.parent === id); }

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

  let html = "", lfd = 0;
  alle.filter(t => !t.parent).forEach(t => {
    const kinder = alle.filter(k => k.parent === t.id);
    const offeneKinder = kinder.filter(k => !k.done).length;
    if (versteckt && t.done && !offeneKinder) return;

    html += zeileHtml(t, lfd++, false, kinder.length ? offeneKinder + " von " + kinder.length + " offen" : "");
    kinder.forEach(k => {
      if (versteckt && k.done) return;
      html += zeileHtml(k, lfd++, true, "");
    });
    html += '<div class="subadd hidden" data-form="' + t.id + '">' +
      '<input placeholder="Unterpunkt" data-sub="' + t.id + '">' +
      '<button class="mini" data-subok="' + t.id + '">Hinzufügen</button></div>';
  });
  box.innerHTML = html;

  $$("#todoList input[type=checkbox]").forEach(cb => cb.onchange = () => {
    const t = todos().find(x => x.id === cb.dataset.id);
    if (!t) return;
    t.done = cb.checked;
    // Oberpunkt abhaken hakt die Unterpunkte gleich mit ab
    if (!t.parent && cb.checked) kinderVon(t.id).forEach(k => k.done = true);
    save(); renderTodos();
  });
  $$("#todoList [data-del]").forEach(b => b.onclick = () => {
    const id = b.dataset.del;
    DB.todos = todos().filter(x => x.id !== id && x.parent !== id);
    save(); renderTodos();
  });
  $$("#todoList [data-edit]").forEach(b => b.onclick = () => {
    const t = todos().find(x => x.id === b.dataset.edit);
    if (!t) return;
    const neuerText = prompt("Punkt ändern:", t.text);
    if (neuerText === null) return;
    if (!neuerText.trim()){
      DB.todos = todos().filter(x => x.id !== t.id && x.parent !== t.id);
    } else t.text = neuerText.trim();
    save(); renderTodos();
  });
  $$("#todoList [data-plus]").forEach(b => b.onclick = () => {
    const form = document.querySelector('[data-form="' + b.dataset.plus + '"]');
    if (!form) return;
    form.classList.remove("hidden");
    form.querySelector("input").focus();
  });
  $$("#todoList [data-sub]").forEach(inp => inp.onkeydown = e => {
    if (e.key === "Enter"){ e.preventDefault(); subSpeichern(inp.dataset.sub); }
  });
  $$("#todoList [data-subok]").forEach(b => b.onclick = () => subSpeichern(b.dataset.subok));
}

function subSpeichern(parentId){
  const inp = document.querySelector('[data-sub="' + parentId + '"]');
  if (!inp) return;
  const text = inp.value.trim();
  if (!text) return;
  todoAdd(text, todoSeiteAktiv(), parentId);
  renderTodos();
  // Eingabe offen lassen, damit mehrere Unterpunkte am Stück gehen
  const wieder = document.querySelector('[data-form="' + parentId + '"]');
  if (wieder){
    wieder.classList.remove("hidden");
    wieder.querySelector("input").focus();
  }
}

function zeileHtml(t, i, unter, zusatz){
  return '<div class="item punkt' + (unter ? " unter" : "") + (t.done ? " done" : "") + '">' +
    '<input type="checkbox" id="td_' + i + '" data-id="' + t.id + '"' + (t.done ? " checked" : "") + '>' +
    '<label for="td_' + i + '"><span>' + esc(t.text) + '</span>' +
      (zusatz ? '<b>' + zusatz + '</b>' : '') + '</label>' +
    (unter ? '' : '<button class="mini plus" data-plus="' + t.id + '" title="Unterpunkt">+</button>') +
    '<button class="mini" data-edit="' + t.id + '">ändern</button>' +
    '<button class="mini" data-del="' + t.id + '">löschen</button>' +
  '</div>';
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
  const zeile = t => '<div class="pi' + (t.parent ? " punter" : "") + '">' +
    '<span class="pbox' + (t.done ? " an" : "") + '"></span>' +
    '<span' + (t.done ? ' style="text-decoration:line-through;color:#777"' : '') + '>' +
    esc(t.text) + '</span></div>';
  const mitKindern = liste => {
    let out = "";
    liste.filter(t => !t.parent).forEach(t => {
      out += zeile(t);
      alle.filter(k => k.parent === t.id).forEach(k => { out += zeile(k); });
    });
    return out;
  };
  const heute = new Date().toLocaleDateString("de-DE", {day:"numeric", month:"long", year:"numeric"});

  const gruppen = todoSeiten().map(s => {
    const aufSeite = alle.filter(t => t.gruppe === s.id);
    if (!aufSeite.length) return "";
    const offen = aufSeite.filter(t => !t.done || alle.some(k => k.parent === t.id && !k.done));
    const fertig = aufSeite.filter(t => offen.indexOf(t) < 0);
    return '<div class="pgrp"><h4>' + esc(s.name) + '</h4>' +
      mitKindern(offen) +
      (fertig.filter(t => !t.parent).length
        ? '<div class="perledigt">' + mitKindern(fertig) + '</div>' : '') +
      '</div>';
  }).join("");

  return '<div class="psec">' +
    '<div class="phead"><h1>Notizen</h1><span>Stand ' + heute + '</span></div>' +
    '<div class="pcols">' + gruppen + '</div></div>';
}
