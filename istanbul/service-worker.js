const CACHE_NAME = 'istanbul-itinerary-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/index.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js',
  'https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css',
  'https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js',
  'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600&display=swap',
  'bosphorus-ferry.jpeg',
  'grand-bazaar-shopping.webp',
  'hagia-sophia-cats.png',
  'hero-istanbul-bosphorus.webp',
  'istanbul-evening.webp',
  'https://tiles.openfreemap.org/styles/liberty',
  'https://tiles.openfreemap.org/styles/liberty/{z}/{x}/{y}.png',
  'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  'https://tile.openstreetmap.org/styles/liberty/{z}/{x}/{y}.png'
];

// Install service worker and cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch from cache when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        
        // Clone the request
        const fetchRequest = event.request.clone();
        
        return fetch(fetchRequest).then((response) => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Clone the response
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });
          
          return response;
        }).catch(() => {
          // If fetch fails, try to return cached version
          return caches.match(event.request);
        });
      })
  );
});

// Clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Add fallback for offline pages
const FALLBACK_PAGE = '/index.html';
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        
        // For navigation requests, return the fallback page
        if (event.request.mode === 'navigate') {
          return caches.match(FALLBACK_PAGE);
        }
        
        // For map tile requests, try to return cached version
        if (event.request.url.includes('tiles.openfreemap.org') || event.request.url.includes('tile.openstreetmap.org')) {
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            
            // Clone the request
            const fetchRequest = event.request.clone();
            
            return fetch(fetchRequest).then((response) => {
              // Check if valid response
              if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }
              
              // Clone the response
              const responseToCache = response.clone();
              
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });
              
              return response;
            });
          });
        }
        
        return fetch(event.request);
      })
      .catch(() => {
        // If everything fails, return the fallback page
        return caches.match(FALLBACK_PAGE);
      })
  );
});
