/* Týden — Service Worker
   Hält die App offline lauffähig. Anfragen an Google und Anthropic
   gehen immer direkt ins Netz und werden nie zwischengespeichert. */
const CACHE = "tyden-v1";
const SHELL = ["./", "./index.html", "./app.css", "./app.js", "./essen.js",
               "./notizen.js", "./claude.js", "./rezepte.js",
               "./manifest.webmanifest", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks =>
    Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET") return;
  if (/googleapis|accounts\.google|anthropic|jina/.test(url.hostname)) return;
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
      if (res.ok && url.origin === location.origin){
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
      }
      return res;
    }).catch(() => hit))
  );
});
