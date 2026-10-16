/* =============================================================================
 * sw.js — service worker: la app funciona sin conexión.
 * -----------------------------------------------------------------------------
 * Estrategia: network-first. Con conexión siempre se sirve lo último (así una
 * publicación nueva se ve enseguida, sin quedar atrapado en una caché vieja) y
 * lo que llega se guarda; sin conexión se responde desde la caché. Las fuentes
 * de Google (otro origen) no se tocan: si no hay red, la app cae a las fuentes
 * del sistema.
 *
 * AL PUBLICAR CAMBIOS: subí CACHE_VERSION (por ejemplo v2) para que los
 * clientes descarten la caché vieja.
 * ========================================================================== */
'use strict';

var CACHE_VERSION = 'rioplatense-v1';

var ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/styles.css',
  './js/verbs.js',
  './js/audio-map.js',
  './js/audio.js',
  './js/app.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/maskable-192.png',
  './icons/maskable-512.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(function (cache) { return cache.addAll(ASSETS); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys()
      .then(function (keys) {
        return Promise.all(keys.map(function (key) {
          return key === CACHE_VERSION ? null : caches.delete(key);
        }));
      })
      .then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (event) {
  var request = event.request;
  if (request.method !== 'GET') return;

  var url;
  try { url = new URL(request.url); } catch (e) { return; }
  if (url.origin !== self.location.origin) return; // fuentes/CDN: sin tocar

  event.respondWith(
    fetch(request).then(function (response) {
      // Con red: se guarda una copia para poder funcionar sin conexión.
      if (response && response.status === 200 && response.type === 'basic') {
        var copy = response.clone();
        caches.open(CACHE_VERSION).then(function (cache) { cache.put(request, copy); });
      }
      return response;
    }).catch(function () {
      // Sin red: lo cacheado y, si no está, la app.
      return caches.match(request).then(function (cached) {
        return cached || caches.match('./index.html');
      });
    })
  );
});
