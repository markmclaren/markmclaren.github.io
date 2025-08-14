// Service Worker for North East England Holiday Website
// Version 1.0.0

const CACHE_NAME = 'northeast-holiday-v1';
const OFFLINE_URL = '/northeast/offline.html';

// Assets to cache immediately
const STATIC_CACHE_URLS = [
  '/northeast/',
  '/northeast/index.html',
  '/northeast/food.html',
  '/northeast/css/styles.css',
  '/northeast/js/script.js',
  '/northeast/manifest.json',
  OFFLINE_URL
];

// Map-related assets
const MAP_CACHE_URLS = [
  '/northeast/map/',
  '/northeast/map/index.html',
  '/northeast/heritage/',
  '/northeast/heritage/index.html',
  '/northeast/heritage/EnglishHeritage.geojson',
  '/northeast/heritage/NationalTrust.geojson'
];

// External resources to cache
const EXTERNAL_CACHE_URLS = [
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

// All URLs to cache on install
const CACHE_URLS = [
  ...STATIC_CACHE_URLS,
  ...MAP_CACHE_URLS,
  ...EXTERNAL_CACHE_URLS
];

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(CACHE_URLS);
      })
      .then(() => {
        console.log('Service Worker: Installation complete');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('Service Worker: Installation failed', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activation complete');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http requests
  if (!event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Return cached version if available
        if (cachedResponse) {
          console.log('Service Worker: Serving from cache', event.request.url);
          return cachedResponse;
        }

        // Try to fetch from network
        return fetch(event.request)
          .then(response => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response for caching
            const responseToCache = response.clone();

            // Cache the response for future use
            caches.open(CACHE_NAME)
              .then(cache => {
                // Only cache GET requests from our domain or CDNs
                if (event.request.url.includes('markmclaren.github.io') || 
                    event.request.url.includes('cdnjs.cloudflare.com') ||
                    event.request.url.includes('unpkg.com')) {
                  cache.put(event.request, responseToCache);
                }
              });

            return response;
          })
          .catch(() => {
            // Network failed, try to serve offline page for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match(OFFLINE_URL);
            }
            
            // For other requests, return a basic offline response
            return new Response('Offline content not available', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            });
          });
      })
  );
});

// Background sync for future enhancements
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    console.log('Service Worker: Background sync triggered');
    // Add background sync logic here if needed
  }
});

// Push notifications for future enhancements
self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json();
    console.log('Service Worker: Push notification received', data);
    
    const options = {
      body: data.body,
      icon: '/northeast/icons/icon-192.png',
      badge: '/northeast/icons/icon-72.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.primaryKey
      },
      actions: [
        {
          action: 'explore',
          title: 'View Details',
          icon: '/northeast/icons/icon-72.png'
        },
        {
          action: 'close',
          title: 'Close',
          icon: '/northeast/icons/icon-72.png'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  console.log('Service Worker: Notification clicked', event);
  
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/northeast/')
    );
  }
});

