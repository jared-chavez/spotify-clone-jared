// Service Worker para PWA – caché offline y precache de recursos críticos
const CACHE_NAME = "spotify-clone-v2"
const PRECACHE_URLS = [
  "/",
  "/icon.ico",
  "/manifest.webmanifest",
]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
      .catch(() => {})
  )
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  )
  self.clients.claim()
})

self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  if (request.method !== "GET") return
  if (url.pathname.startsWith("/api/")) return

  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchAndCache = () =>
        fetch(request).then((res) => {
          if (!res || res.status !== 200 || res.type === "opaqueredirect") return res
          const contentType = res.headers.get("content-type") || ""
          const cacheable =
            request.destination === "document" ||
            request.destination === "script" ||
            request.destination === "style" ||
            request.destination === "image" ||
            request.destination === "font" ||
            contentType.includes("font") ||
            contentType.includes("image") ||
            contentType.includes("script") ||
            contentType.includes("text/html") ||
            contentType.includes("style")
          if (cacheable) {
            const clone = res.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
          }
          return res
        })

      // Navegación: red primero; si falla (offline), devolver caché o página de inicio
      if (request.mode === "navigate") {
        return fetchAndCache().catch(() => cached || caches.match("/"))
      }

      // Otros recursos: caché primero; si no hay, red y guardar en caché
      if (cached) return cached
      return fetchAndCache().catch(() => new Response("", { status: 503, statusText: "Offline" }))
    })
  )
})
