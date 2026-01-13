const CACHE_NAME = "ecobank-v18";
const ASSETS = [
  "./",
  "./index.html",
  "./css/style.css",
  "./js/components.js",
  "./js/firebase-config.js",
  "./js/firebase-service.js",
  "./login.html",
  "./register.html",
  "./admin-dashboard.html",
  "./map.html",
  "./knowledge.html",
  "./manifest.json"
];

self.addEventListener("install", (e) => {
  self.skipWaiting(); // Force activation
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    })
  );
  self.clients.claim(); // Take control immediately
});

self.addEventListener("fetch", (e) => {
  // Strategy: Network First, Fallback to Cache
  // This ensures users always get the latest version if they have internet.
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        // Clone the response to put in cache (for offline next time)
        const resClone = res.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, resClone);
        });
        return res;
      })
      .catch(() => {
        // If network fails, try cache
        return caches.match(e.request);
      })
  );
});
