const CACHE_NAME = 'rs3-pwa-v1';
self.addEventListener('install', e => { self.skipWaiting(); });
self.addEventListener('activate', e => { self.clients.claim(); });
self.addEventListener('fetch', e => {
  const url = e.request.url;
  if(url.includes('listentomystream.com') || url.includes('open-meteo') || url.includes('ansa') || url.includes('recenttracks')) return;
  e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)));
});
