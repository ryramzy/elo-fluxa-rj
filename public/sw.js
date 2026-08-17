// ELO! Minimal Service Worker for PWA / Offline Resilience
const CACHE_NAME = 'elo-cache-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Let the browser handle standard navigation and dynamic API requests
  if (event.request.method !== 'GET') return;
});
