// ELO! Minimal Service Worker for PWA / Offline Resilience & Web Push
const CACHE_NAME = 'elo-cache-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
});

// Push notification received
self.addEventListener('push', (event) => {
  let data = { title: 'ELO! Inglês', body: 'Você tem uma atualização na sua conta.', url: '/dashboard' };
  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (e) {
    if (event.data) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    data: { url: data.url || '/dashboard' },
    vibrate: [100, 50, 100],
    actions: [
      { action: 'open', title: 'Abrir Aula' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'ELO! Inglês', options)
  );
});

// User clicked on notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/dashboard';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
