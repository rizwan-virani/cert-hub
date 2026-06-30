/* The Certification Launchpad — service worker.
   Navigation/HTML is network-first (so updates appear immediately and we never
   trap users on a stale shell); static assets are cache-first for offline use.
   Cross-origin requests (the exam-site progress iframes) are left untouched. */
var CACHE = "cl-hub-v11"; /* per-site name: hub + exam sites share one origin on GitHub Pages */
var SCOPE = "cl-hub-"; /* only prune the hub's own old caches */
var LEGACY = ["examsite-v1", "examsite-ccsp-v2"];
var ASSETS = [
  "./",
  "index.html",
  "assets/css/styles.css?v=12",
  "assets/css/hub.css?v=12",
  "assets/js/content/sites.js?v=12",
  "assets/js/content/certs.js?v=12",
  "assets/js/hub.js?v=12",
  "assets/js/backToTop.js?v=12",
  "manifest.webmanifest",
  "assets/img/icon.svg"
];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ASSETS); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return (k.indexOf(SCOPE) === 0 && k !== CACHE) || LEGACY.indexOf(k) !== -1; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;
  var url;
  try { url = new URL(req.url); } catch (err) { return; }
  if (url.origin !== self.location.origin) return; // ignore cross-origin (exam-site iframes)

  var isHTML = req.mode === "navigate" || (req.headers.get("accept") || "").indexOf("text/html") !== -1;
  if (isHTML) {
    e.respondWith(
      fetch(req).then(function (r) {
        var cp = r.clone(); caches.open(CACHE).then(function (c) { c.put(req, cp); }); return r;
      }).catch(function () { return caches.match(req).then(function (m) { return m || caches.match("index.html"); }); })
    );
    return;
  }
  e.respondWith(
    caches.match(req).then(function (m) {
      return m || fetch(req).then(function (r) {
        var cp = r.clone(); caches.open(CACHE).then(function (c) { c.put(req, cp); }); return r;
      });
    })
  );
});
