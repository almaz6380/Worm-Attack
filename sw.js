// Worm Attack Service-Worker: macht das Spiel installierbar und (gegen den Computer) offline spielbar.
const VERSION = "snakeduell-v16";
const PEER = "https://cdn.jsdelivr.net/npm/peerjs@1.5.5/dist/peerjs.min.js";
const SHELL = ["./", "./index.html", "./manifest.webmanifest", "./icons/icon-180.png", "./icons/icon-192.png", "./icons/icon-512.png"];

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(VERSION);
    await cache.addAll(SHELL);
    await cache.add(new Request(PEER, { mode: "cors" })).catch(() => {});
    await self.skipWaiting();
  })());
});
self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) if (key !== VERSION) await caches.delete(key);
    await self.clients.claim();
  })());
});
self.addEventListener("fetch", event => {
  const req = event.request, url = new URL(req.url);
  if (req.method !== "GET") return;
  // Seite selbst: erst Netz (damit Updates ankommen), sonst gespeicherte Version
  if (req.mode === "navigate") {
    event.respondWith((async () => {
      try { const res = await fetch(req); (await caches.open(VERSION)).put("./index.html", res.clone()); return res; }
      catch { return (await caches.match("./index.html")) || Response.error(); }
    })());
    return;
  }
  // Wurm-Bilder und ihre Liste: erst Netz, damit neu hochgeladene Designs sofort erscheinen; offline aus dem Speicher
  if (url.origin === self.location.origin && url.pathname.includes("/skins/")) {
    event.respondWith((async () => {
      try { const res = await fetch(req, { cache: "no-cache" }); if (res.ok) (await caches.open(VERSION)).put(req, res.clone()); return res; }
      catch { return (await caches.match(req, { ignoreSearch: true })) || Response.error(); }
    })());
    return;
  }
  if (url.origin === self.location.origin || req.url === PEER) {
    event.respondWith((async () => {
      const hit = await caches.match(req, { ignoreSearch: url.origin === self.location.origin });
      if (hit) return hit;
      const res = await fetch(req);
      if (res.ok) (await caches.open(VERSION)).put(req, res.clone());
      return res;
    })());
  }
});
