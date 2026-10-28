// Caches the app after the first visit so it works offline when hosted (for example on GitHub Pages).
var CACHE = "zine-builder-v2";
var FILES = [
  "./", "index.html",
  "vendor/jspdf.umd.min.js",
  "vendor/qrcode.js",
  "fonts/inter-latin-400-normal.woff2",
  "fonts/inter-latin-600-normal.woff2",
  "fonts/bricolage-grotesque-latin-600-normal.woff2",
  "fonts/bricolage-grotesque-latin-700-normal.woff2"
];
self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); }));
  self.skipWaiting();
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }));
  self.clients.claim();
});
self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  e.respondWith(caches.match(e.request).then(function (hit) { return hit || fetch(e.request); }));
});
