/* Týden — Service Worker
   Netz zuerst, Zwischenspeicher als Rückfall. So bekommst du Aktualisierungen
   sofort und die App läuft trotzdem offline weiter.
   Anfragen an Google und Anthropic gehen immer direkt ins Netz. */
const CACHE = "tyden-0.3.5";   // mit VERSION in app.js gleichziehen
const SHELL = ["./", "./index.html", "./app.css", "./app.js", "./essen.js",
               "./notizen.js", "./claude.js", "./rezepte.js", "./datenschutz.html",
               "./manifest.webmanifest", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks =>
    Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET") return;
  if (/googleapis|accounts\.google|anthropic|jina/.test(url.hostname)) return;
  if (url.origin !== location.origin) return;

  e.respondWith(
    fetch(e.request).then(res => {
      if (res && res.ok){
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
      }
      return res;
    }).catch(() => caches.match(e.request).then(hit => hit || caches.match("./index.html")))
  );
});
