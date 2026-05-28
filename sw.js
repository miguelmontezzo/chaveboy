/* =============================================
   CHAVEBOY — Service Worker
   Estratégia:
   - index.html + script.js → network-first
     (sempre busca atualizado; usa cache só offline)
   - style.css, icons, fontes → cache-first
     (raramente mudam)
   - /roms/ → ignora (arquivos grandes)
   ============================================= */

const CACHE = 'chaveboy-v3';

const STATIC = [
    './style.css',
    './icon.svg',
    './manifest.json',
];

// Pré-cacheia só os assets estáticos
self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE).then(c => c.addAll(STATIC))
    );
    self.skipWaiting();
});

// Limpa caches antigos
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', (e) => {
    if (e.request.method !== 'GET') return;

    const url = new URL(e.request.url);

    // ROMs — deixa passar direto, sem cache
    if (url.pathname.includes('/roms/')) return;

    // Navegações (?game=... e raiz) — network-first
    if (e.request.mode === 'navigate') {
        e.respondWith(networkFirst(e.request, './index.html'));
        return;
    }

    // script.js — network-first (muda a cada deploy)
    if (url.pathname.endsWith('script.js')) {
        e.respondWith(networkFirst(e.request, null));
        return;
    }

    // Resto (css, fontes, imagens) — cache-first
    e.respondWith(cacheFirst(e.request));
});

// Tenta rede → se falhar usa cache
async function networkFirst(request, fallback) {
    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(CACHE);
            cache.put(request, response.clone());
        }
        return response;
    } catch {
        const cached = await caches.match(fallback || request);
        return cached || new Response('Offline — abra o app com internet primeiro.', { status: 503 });
    }
}

// Usa cache → se não tiver busca na rede
async function cacheFirst(request) {
    const cached = await caches.match(request);
    if (cached) return cached;
    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(CACHE);
            cache.put(request, response.clone());
        }
        return response;
    } catch {
        return new Response('Offline', { status: 503 });
    }
}
