/**
 * Service Worker with iOS 16.4+ Web Push & Local Notification Support
 */

const CACHE_NAME = 'daily-collect-cache-v1';
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/apple-touch-icon.png',
  '/icon.svg'
];

// Install Event
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('Pre-caching assets warning:', err);
      });
    })
  );
});

// Activate Event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((keys) => {
        return Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              return caches.delete(key);
            }
          })
        );
      })
    ])
  );
});

// Web Push Event (triggered via APNs / VAPID web-push protocol)
self.addEventListener('push', (event) => {
  let payload = {
    title: 'Daily Collection Alert',
    body: 'Portfolio update received.',
    icon: '/pwa-192x192.png',
    badge: '/badge.png',
    tag: 'daily-collection-' + Date.now(),
    data: { url: '/' }
  };

  if (event.data) {
    try {
      const parsed = event.data.json();
      payload = { ...payload, ...parsed };
    } catch (e) {
      payload.body = event.data.text() || payload.body;
    }
  }

  const notificationOptions = {
    body: payload.body,
    icon: payload.icon || '/pwa-192x192.png',
    badge: payload.badge || '/badge.png',
    tag: payload.tag || 'daily-collection-alert',
    data: payload.data || { url: '/' },
    vibrate: [200, 100, 200],
    requireInteraction: true,
    renotify: true,
    actions: [
      { action: 'open', title: 'Open App' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(payload.title, notificationOptions)
  );
});

// Notification Click Event (handles tapping notification banner on iOS or Desktop)
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const urlToOpen = (event.notification.data && event.notification.data.url) || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a window is already open, focus it
      for (const client of clientList) {
        if ('focus' in client) {
          if (client.url.includes(urlToOpen) || urlToOpen === '/') {
            client.postMessage({
              type: 'NOTIFICATION_CLICKED',
              data: event.notification.data
            });
            return client.focus();
          }
        }
      }
      // Otherwise open new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Message Listener for Client Commands (Immediate Trigger, Delayed Trigger for testing lock screen)
self.addEventListener('message', (event) => {
  if (!event.data) return;

  if (event.data.type === 'SHOW_NOTIFICATION') {
    const { title, options } = event.data;
    self.registration.showNotification(title || 'Daily Collection Alert', {
      icon: '/pwa-192x192.png',
      badge: '/badge.png',
      vibrate: [200, 100, 200],
      ...options
    });
  }

  if (event.data.type === 'SCHEDULE_NOTIFICATION') {
    const { title, options, delayMs } = event.data;
    setTimeout(() => {
      self.registration.showNotification(title || 'Daily Collection Alert', {
        icon: '/pwa-192x192.png',
        badge: '/badge.png',
        vibrate: [200, 100, 200],
        ...options
      });
    }, delayMs || 5000);
  }
});
