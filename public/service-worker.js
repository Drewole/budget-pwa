// Your data needs a place to live when there is no Internet connection. That's what the cache is for. There is the general cache for images and such, and a data cache for data-specific stuff. I would just follow the naming conventions you see here. Note the versioning on each cache name. This is important.
const CACHE_NAME = "budget-app-v1";
const DATA_CACHE_NAME = "budget-data-cache-v1";

// URLs
const urlsToCache = [
  "/",
  "/db.js",
  "/index.js",
  "/manifest.json",
  "/styles.css",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png"
];

// Fire when user chooses to install the app locally
self.addEventListener("install", function(event) {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      console.log("Opened cache");
      return cache.addAll(urlsToCache);
    })
  );
});

// Listen for calls

self.addEventListener("fetch", function(event) {
  // By making sure all our fetch routes have the "/api/" prefix
  if (event.request.url.includes("/api/")) {
    event.respondWith(
      caches.open(DATA_CACHE_NAME).then(cache => {

        // First we attempt to perform the fetch normally.
        return fetch(event.request)
          .then(response => {

            if (response.status === 200) {
              cache.put(event.request.url, response.clone());
            }

            return response;
          })

          // If the fetch fails, pull the correct saved data from the cache.
          .catch(err => {
            // Network request failed, try to get it from the cache.
            return cache.match(event.request);
          });
      }).catch(err => console.log(err))
    );

    return;
  }

  // Homepage calls
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
