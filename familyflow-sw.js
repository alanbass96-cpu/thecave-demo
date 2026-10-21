/* FamilyFlow: funciona sem internet. A página busca a versão nova quando há rede e usa a cópia guardada quando não há. */
const CACHE = "familyflow-v2";
const APP = ["familyflow.html", "familyflow.webmanifest", "familyflow-icon-192.png", "familyflow-icon-512.png", "familyflow-icon-180.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(APP)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith("familyflow-") && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const req = e.request; if (req.method !== "GET") return;
  const url = new URL(req.url);
  const fonte = url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com";
  const doApp = url.origin === location.origin && /\/familyflow[^/]*$/.test(url.pathname);
  if (fonte) {
    e.respondWith(caches.open(CACHE).then(async c => (await c.match(req)) || fetch(req).then(r => { c.put(req, r.clone()); return r; })));
  } else if (doApp) {
    e.respondWith(fetch(req).then(r => { if (r.ok) { const cp = r.clone(); caches.open(CACHE).then(c => c.put(req, cp)); } return r; }).catch(() => caches.match(req, {ignoreSearch: true})));
  }
});
