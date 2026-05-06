const CACHE_VERSION = "v2"
const APP_CACHE = `pencatat-pengeluaran-pro:app:${CACHE_VERSION}`
const RUNTIME_CACHE = `pencatat-pengeluaran-pro:runtime:${CACHE_VERSION}`
const PRECACHE_URLS = [
  "/",
  "/offline",
  "/manifest.webmanifest",
  "/icons/icon.svg",
  "/icons/icon-maskable.svg",
  "/icons/icon-monochrome.svg",
]

const isSameOrigin = (url) => url.origin === self.location.origin

const canCache = (response) =>
  response && response.ok && ["basic", "default"].includes(response.type)

async function cacheFirst(request) {
  const cached = await caches.match(request)

  if (cached) {
    return cached
  }

  const response = await fetch(request)

  if (canCache(response)) {
    const cache = await caches.open(APP_CACHE)
    await cache.put(request, response.clone())
  }

  return response
}

async function networkFirst(request, fallbackUrl = "/offline") {
  try {
    const response = await fetch(request)

    if (canCache(response)) {
      const cache = await caches.open(RUNTIME_CACHE)
      await cache.put(request, response.clone())
    }

    return response
  } catch {
    const cached =
      (await caches.match(request)) ||
      (await caches.match("/")) ||
      (await caches.match(fallbackUrl))

    if (cached) {
      return cached
    }

    throw new Error("No cached response available")
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME_CACHE)
  const cached = await cache.match(request)
  const fresh = fetch(request)
    .then((response) => {
      if (canCache(response)) {
        cache.put(request, response.clone())
      }

      return response
    })
    .catch(() => undefined)

  if (cached) {
    return cached
  }

  const response = await fresh

  if (response) {
    return response
  }

  return networkFirst(request)
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(APP_CACHE).then((cache) => cache.addAll(PRECACHE_URLS)),
  )
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter(
              (cacheName) =>
                cacheName.startsWith("pencatat-pengeluaran-pro:") &&
                ![APP_CACHE, RUNTIME_CACHE].includes(cacheName),
            )
            .map((cacheName) => caches.delete(cacheName)),
        ),
      )
      .then(() => self.clients.claim()),
  )
})

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting()
  }
})

self.addEventListener("fetch", (event) => {
  const { request } = event

  if (request.method !== "GET") {
    return
  }

  const url = new URL(request.url)

  if (!isSameOrigin(url)) {
    return
  }

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request))
    return
  }

  if (
    url.pathname.startsWith("/_next/static/") ||
    request.destination === "script" ||
    request.destination === "style" ||
    request.destination === "font" ||
    request.destination === "image"
  ) {
    event.respondWith(staleWhileRevalidate(request))
    return
  }

  if (
    url.pathname === "/manifest.webmanifest" ||
    url.pathname.startsWith("/icons/")
  ) {
    event.respondWith(cacheFirst(request))
    return
  }

  event.respondWith(networkFirst(request))
})
