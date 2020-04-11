const VERSION = 1;
const CACHE_NAME = `precache-v${VERSION}`;
const URLS_TO_CACHE = ["/", "/index.html", "/css/main.css", "/js/main.js"];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(URLS_TO_CACHE))
    );
});

self.addEventListener("activate", event => {
    event.waitUntil(
        caches
            .keys()
            .then(items => items.filter(item => item !== CACHE_NAME))
            .then(items => Promise.all(items.map(item => caches.delete(item))))
            .then(() => clients.claim())
    );
});

self.addEventListener("fetch", event => {
    const { request } = event;
    if (request.url.startsWith(self.location.origin)) {
        event.respondWith(
            caches
                .match(request)
                .then(
                    cacheResponse =>
                        cacheResponse ||
                        caches
                            .open(CACHE_NAME)
                            .then(cache =>
                                fetch(request).then(response =>
                                    cache
                                        .put(request, response.clone())
                                        .then(() => response)
                                )
                            )
                )
        );
    }
});
