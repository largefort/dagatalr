const CACHE_NAME = 'dagatalr-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then(clientList => {
        for (let client of clientList) {
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
    );
  }
});

// Handle background sync for notifications
self.addEventListener('sync', event => {
  if (event.tag === 'daily-notification') {
    event.waitUntil(sendDailyNotification());
  }
});

function sendDailyNotification() {
  const now = new Date();
  const vikingMonths = [
    'Jólmánuður', 'Þorri', 'Gói', 'Einmánuður', 
    'Harpa', 'Skerpla', 'Sólmánuður', 'Heyannir',
    'Tvímánuður', 'Haustmánuður', 'Gormánuður', 'Ýlir'
  ];
  
  const vikingDays = ['Sun', 'Mán', 'Týs', 'Óðins', 'Þórs', 'Frjá', 'Laugar'];
  
  const vikingYear = 793 + Math.abs((now.getFullYear() - 2000) % 273);
  const vikingMonth = vikingMonths[now.getMonth()];
  const vikingDayName = vikingDays[now.getDay()];
  
  const vikingDate = `${vikingDayName}, ${now.getDate()}. ${vikingMonth} ${vikingYear}`;
  
  return self.registration.showNotification('Dagatalr - Daglegt upprifjun', {
    body: `Í dag er ${vikingDate}`,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'daily-reminder',
    requireInteraction: false,
    actions: [
      {
        action: 'open',
        title: 'Opna Dagatalr'
      }
    ]
  });
}