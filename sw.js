// Cambia la versión cada vez que subas cambios para forzar la actualización.
const CACHE = 'hucha-v3';
// Los iconos de los atajos no van aquí: si faltara uno, fallaría toda la instalación offline.
const ASSETS = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Red primero para la página (coge actualizaciones), pero si la red tarda más de 3 s
// se abre la copia guardada para no dejarte esperando con mala cobertura.
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  if (req.mode === 'navigate') {
    const net = fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put('./index.html', copy)); }
      return res;
    });
    net.catch(() => {});   // si gana la caché, que un fallo de red posterior no ensucie la consola
    const slow = new Promise(resolve => setTimeout(resolve, 3000));
    e.respondWith(
      Promise.race([net, slow])
        .then(res => res || caches.match('./index.html').then(hit => hit || net))
        .catch(() => caches.match('./index.html'))
    );
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req)));
});
