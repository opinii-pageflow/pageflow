const CACHE_NAME = "pageflow-static-v1";
const ASSETS = [
    "/",
    "/manifest.json"
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
    );
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null)))
        )
    );
    self.clients.claim();
});

self.addEventListener("fetch", (event) => {
    const { request } = event;

    // Não cacheia requisições não-GET (evita quebrar auth, supabase, etc.)
    if (request.method !== "GET") return;

    event.respondWith(
        caches.match(request).then((cached) => {
            if (cached) return cached;

            return fetch(request)
                .then((res) => {
                    // Só cacheia arquivos estáticos (sem arriscar dados dinâmicos)
                    const url = new URL(request.url);
                    const isStatic =
                        url.pathname.startsWith("/icons/") ||
                        url.pathname.endsWith(".js") ||
                        url.pathname.endsWith(".css") ||
                        url.pathname.endsWith(".png") ||
                        url.pathname.endsWith(".jpg") ||
                        url.pathname.endsWith(".svg");

                    if (isStatic) {
                        const copy = res.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
                    }
                    return res;
                })
                .catch(() => cached || Response.error());
        })
    );
});
