/* Magic Coloring World — offline service worker
 * Cache-first for the app shell + generated art catalogue so the game
 * works with no internet (a hard requirement for a kids app).
 */
const CACHE = "mcw-v1";
const CORE = ["/", "/play", "/offline", "/manifest.webmanifest", "/icon.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // The coloring catalogue: cache-first, refresh in the background so it is
  // instantly available offline after the first load.
  const isCatalogue = url.pathname.startsWith("/api/pages");

  if (isCatalogue) {
    event.respondWith(
      caches.open(CACHE).then(async (cache) => {
        const cached = await cache.match(req);
        const network = fetch(req)
          .then((res) => {
            if (res.ok) cache.put(req, res.clone());
            return res;
          })
          .catch(() => cached);
        return cached || network;
      }),
    );
    return;
  }

  // Never cache mutable data endpoints (scores / artworks POST-GET pairs)
  if (url.pathname.startsWith("/api/")) return;

  // App shell + static assets: cache-first with network fallback
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((res) => {
          if (res.ok && (req.destination === "document" || req.destination === "image" || req.destination === "script" || req.destination === "style")) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => caches.match("/offline"));
    }),
  );
});
