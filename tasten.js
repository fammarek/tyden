/* ============================================================
   Týden — tasten.js
   Sonderzeichenleiste. Welche Tastatur das iPad zeigt, kann eine
   Web-App nicht bestimmen; liegt nur eine englische Tastatur an,
   fehlen ß und die Umlaute. Diese Leiste legt sie über jedes
   Textfeld, dazu auf Wunsch die tschechischen Buchstaben.
   ============================================================ */

const ZEICHEN = {
  de: ["ä","ö","ü","ß","Ä","Ö","Ü","–","„","“"],
  cz: ["á","č","ď","é","ě","í","ň","ó","ř","š","ť","ú","ů","ý","ž"]
};
let tastenFeld = null;      // das Feld, in das geschrieben wird
let tastenSatz = "de";

/* Felder, bei denen die Leiste nichts zu suchen hat */
function tastenTaugt(el){
  if (!el) return false;
  const tag = el.tagName;
  if (tag === "TEXTAREA") return true;
  if (tag !== "INPUT") return false;
  const t = (el.type || "text").toLowerCase();
  if (["text","search"].indexOf(t) < 0) return false;
  return el.id !== "apiKey" && el.id !== "apiModel";
}

function tastenZeichnen(){
  const box = $("#umlaute");
  if (!box) return;
  box.innerHTML = ZEICHEN[tastenSatz].map(z =>
      '<button data-z="' + z + '">' + z + '</button>').join("") +
    '<button class="satz" data-satz="' + (tastenSatz === "de" ? "cz" : "de") + '">' +
      (tastenSatz === "de" ? "čž" : "äß") + '</button>';

  // pointerdown statt click: so verliert das Feld den Fokus nicht
  $$("#umlaute button").forEach(b => b.addEventListener("pointerdown", e => {
    e.preventDefault();
    if (b.dataset.satz){ tastenSatz = b.dataset.satz; tastenZeichnen(); return; }
    einfuegen(b.dataset.z);
  }));
}

function einfuegen(zeichen){
  const el = tastenFeld;
  if (!el) return;
  const a = el.selectionStart, b = el.selectionEnd;
  if (typeof el.setRangeText === "function" && a !== null){
    el.setRangeText(zeichen, a, b, "end");
  } else {
    el.value += zeichen;
  }
  // damit Speichern, Mitwachsen und Zählen anspringen
  el.dispatchEvent(new Event("input", {bubbles: true}));
  el.focus();
}

/* Die Leiste sitzt über der Bildschirmtastatur. Liegt eine echte
   Tastatur an, rutscht sie an den unteren Rand. */
function tastenSetzen(){
  const box = $("#umlaute");
  if (!box || box.hidden) return;
  const vv = window.visualViewport;
  const unten = vv ? Math.max(0, window.innerHeight - (vv.height + vv.offsetTop)) : 0;
  box.style.bottom = unten + "px";
}

function initTasten(){
  const box = $("#umlaute");
  if (!box) return;
  tastenZeichnen();

  document.addEventListener("focusin", e => {
    if (!tastenTaugt(e.target)) return;
    tastenFeld = e.target;
    // Ein offener Dialog legt alles andere still. Die Leiste muss dann
    // in den Dialog hinein, sonst lässt sie sich nicht antippen.
    const dlg = e.target.closest("dialog");
    const ziel = dlg || document.body;
    if (box.parentNode !== ziel) ziel.appendChild(box);
    box.hidden = false;
    tastenSetzen();
  });
  document.addEventListener("focusout", e => {
    if (e.target !== tastenFeld) return;
    // kurz warten: ein Tippen auf die Leiste soll nicht als Verlassen zählen
    setTimeout(() => {
      if (!tastenTaugt(document.activeElement)){
        box.hidden = true;
        tastenFeld = null;
      }
    }, 120);
  });
  if (window.visualViewport){
    window.visualViewport.addEventListener("resize", tastenSetzen);
    window.visualViewport.addEventListener("scroll", tastenSetzen);
  }
  window.addEventListener("resize", tastenSetzen);
}
