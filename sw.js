// Service Worker ultraliviano para Estadios Virtuales
const CACHE_NAME = 'estadios-virtuales-pwa-v1';

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
            );
        }).then(() => self.clients.claim())
    );
});

// Permite tráfico libre de Supabase, WebSockets, YouTube y Google Auth sin bloqueos
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;
    
    const url = new URL(event.request.url);

    if (url.hostname.includes('supabase.co') || url.protocol === 'ws:' || url.protocol === 'wss:') {
        return;
    }

    event.respondWith(
        fetch(event.request).catch(() => {
            return caches.match(event.request);
        })
    );
});
