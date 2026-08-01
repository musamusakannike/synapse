const CACHE_NAME = "sabilearn-cache-v1";
const OFFLINE_URL = "/offline";

const PRECACHE_ASSETS = [
  OFFLINE_URL,
  "/manifest.json",
  "/icon-192.png",
  "/icon-192-maskable.png",
  "/icon-512.png",
  "/icon-512-maskable.png",
  "/synapse.png",
  "/synapse.webp",
  "/globe.svg"
];

// Install Event
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[Service Worker] Pre-caching offline assets");
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate Event
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("[Service Worker] Removing old cache", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event
self.addEventListener("fetch", (event) => {
  // Only handle GET requests and local same-origin requests
  if (event.request.method !== "GET" || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Skip APIs and hot reload/dev-server endpoints
  if (
    event.request.url.includes("/api/") ||
    event.request.url.includes("/_next/webpack-hmr") ||
    event.request.url.includes("chrome-extension://")
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached resource, then fetch fresh one in the background to keep cache warm
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, networkResponse);
              });
            }
          })
          .catch(() => {
            // Background fetch failed (offline or network error), ignore and keep using stale-while-revalidate cache
          });
        return cachedResponse;
      }

      // If not cached, attempt to fetch from network
      return fetch(event.request)
        .then((networkResponse) => {
          // Cache successful responses for subsequent requests
          if (networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch((error) => {
          // If offline and requesting page navigation, serve the offline page fallback
          if (event.request.mode === "navigate") {
            console.log("[Service Worker] Offline page requested; serving offline fallback");
            return caches.match(OFFLINE_URL);
          }
          
          // Return generic error for static resources if fetch failed and no cache hit
          return new Response("Network connection error", {
            status: 503,
            statusText: "Service Unavailable",
            headers: new Headers({ "Content-Type": "text/plain" })
          });
        });
    })
  );
});
