// Declacre Files to Cache
const CACHE_NAME = "static-cache-v1";
const DATA_CACHE_NAME = "data-cache-v1";

var urlsToCache = [
  "/",
  "/index.html",
  "/styles.css",
  "/dist/index.bundle.js",
  "/dist/manifest.json",
  "/dist/icon_72x72.png",
  "/dist/icon_96x96.png",
  "/dist/icon_128x128.png",
  "/dist/icon_144x144.png",
  "/dist/icon_152x152.png",
  "/dist/icon_192x192.png",
  "/dist/icon_384x384.png",
  "/dist/icon_512x512.png"
];

self.addEventListener("install", function(event) {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      console.log("Opened cache");
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("fetch", function(event) {
  // cache all get requests to /api routes
  if (event.request.url.includes("/api/")) {
    event.respondWith(
      caches.open(DATA_CACHE_NAME).then(cache => {
        return fetch(event.request)
          .then(response => {
            // If the response was good, clone it and store it in the cache.
            if (response.status === 200) {
              cache.put(event.request.url, response.clone());
            }

            return response;
          })
          .catch(err => {
            // Network request failed, try to get it from the cache.
            return cache.match(event.request);
          });
      }).catch(err => console.log(err))
    );

    return;
  }

  event.respondWith(
    fetch(event.request).catch(function() {
      return caches.match(event.request).then(function(response) {
        if (response) {
          return response;
        } else if (event.request.headers.get("accept").includes("text/html")) {
          // return the cached home page for all requests for html pages
          return caches.match("/");
        }
      });
    })
  );
});

// const STATIC_CACHE = "static-cache-v1";
// const RUNTIME_CACHE = "runtime-cache";

// // Install and cache FILES_TO_CACHE
// self.addEventListener("install", function(evt) {
//   evt.waitUntil(
//     caches.open(STATIC_CACHE).then(cache => {
//       console.log("Your files were pre-cached successfully!");
//       return cache.addAll(FILES_TO_CACHE);
//     })
//   );

//   self.skipWaiting();
// });

// // The activate handler takes care of cleaning up old caches.
// self.addEventListener("activate", event => {
//   const currentCaches = [STATIC_CACHE, RUNTIME_CACHE];
//   event.waitUntil(
//     caches
//       .keys()
//       .then(cacheNames => {
//         // return array of cache names that are old to delete
//         return cacheNames.filter(
//           cacheName => !currentCaches.includes(cacheName)
//         );
//       })
//       .then(cachesToDelete => {
//         return Promise.all(
//           cachesToDelete.map(cacheToDelete => {
//             return caches.delete(cacheToDelete);
//           })
//         );
//       })
//       .then(() => self.clients.claim())
//       .catch(err => {
//         console.log(err);
//       })
//   );
// });

// self.addEventListener("fetch", event => {
//   // non GET requests are not cached and requests to other origins are not cached
//   if (
//     event.request.method !== "GET" ||
//     !event.request.url.startsWith(self.location.origin)
//   ) {
//     event.respondWith(fetch(event.request)
//     .catch(err => {
//       console.log(err);
//     }));
//     return;
//   }

//   // handle runtime GET requests for data from /api routes
//   if (event.request.url.includes("/api/")) {
//     // make network request and fallback to cache if network request fails (offline)
//     event.respondWith(
//       caches.open(RUNTIME_CACHE).then(cache => {
//         return fetch(event.request)
//           .then(response => {
//             cache.put(event.request, response.clone());
//             return response;
//           })
//           .catch(() => caches.match(event.request));
//       })
//     );
//     return;
//   }

//   // use cache first for all other requests for performance
//   event.respondWith(
//     caches.match(event.request).then(cachedResponse => {
//       if (cachedResponse) {
//         return cachedResponse;
//       }

//       // request is not in cache. make network request and cache the response
//       return caches.open(RUNTIME_CACHE).then(cache => {
//         return fetch(event.request).then(response => {
//           return cache.put(event.request, response.clone()).then(() => {
//             return response;
//           });
//         });
//       });
//     }).catch(err => {
//       console.log(err);
//     })
//   );
// });