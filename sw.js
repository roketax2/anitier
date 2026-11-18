// Офлайн-кэш: оболочка сайта и постеры. Данные API — всегда из сети.
const CACHE = 'animetop-v74';
const SHELL = ['./', 'index.html', 'move.js', 'style.css', 'i18n.js', 'app.js', 'achievements.js', 'frames.js', 'frames2.js', 'frames3.js', 'frames4.js', 'frames5.js', 'frames6.js', 'frames7.js', 'frames8.js', 'frames9.js', 'frames10.js', 'frames11.js', 'frames12.js', 'frames13.js', 'frames14.js', 'frames15.js', 'account.js', 'compare.js', 'settings.js', 'themes.js', 'media.js', 'import.js', 'community.js', 'season.js', 'chars.js', 'games.js', 'profile.js', 'promo.js', 'manifest.webmanifest', 'icon.svg', 'logo.svg', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith('animetop-') && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === location.origin) {
    // свои файлы: сначала сеть (чтобы обновления приходили сразу), без сети — кэш
    e.respondWith(fetch(req).then((r) => { const copy = r.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); return r; }).catch(() => caches.match(req).then((r) => r || caches.match('index.html'))));
  }
  // постеры и API не трогаем — их кэширует сам браузер
});
