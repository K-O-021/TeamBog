// SNED-LINK+ Neural Alert Service Worker
self.addEventListener('push', (event) => {
  let data = {
    title: 'SNED-LINK+ System Alert',
    body: 'Institutional node synchronization required.'
  };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      console.error('Push data parsing failed, using fallback:', e);
    }
  }

  const options = {
    body: data.body,
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});