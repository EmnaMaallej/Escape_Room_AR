const CACHE_NAME = "escape-room-v1";
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/main.js",
  "/puzzles/puzzle1.js",
  "/puzzles/puzzle2.js",
  "/puzzles/puzzle3.js",
  "/puzzles/lock.js",
  "/textures/wallpaper.jpg",
  "/textures/wood_floor.jpg",
  "/textures/carpet.jpg",
  "/textures/painting.jpg",
  "/models/door__wooden_18_mb.glb",
  "/models/altarpiece_from_preetz_right_wing.glb",
  "/models/grandfather_clock.glb",
  "/models/victorian_lounge_sofa.glb",
  "/models/victorian_bookshelf.glb",
  "/models/antique_desk.glb",
  "/models/magic_mirror.glb",
  "/models/the_storyteller_piano.glb",
  "/models/round_glass_table.glb",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened cache");
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Cache hit - return response
      if (response) {
        return response;
      }
      return fetch(event.request).then((response) => {
        // Check if we received a valid response
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response;
        }

        // Clone the response
        const responseToCache = response.clone();

        caches.open(CACHE_NAME).then((cache) => {
          // Check scheme to avoid caching unsupported schemes (like chrome-extension://)
          if (event.request.url.startsWith("http")) {
            cache.put(event.request, responseToCache);
          }
        });

        return response;
      });
    })
  );
});

self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
