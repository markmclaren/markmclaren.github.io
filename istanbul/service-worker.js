const CACHE_NAME = 'istanbul-itinerary-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/src/App.tsx',
  '/src/pages/Home.tsx',
  '/src/index.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js',
  'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600&family=Montserrat:wght@500;600;700&display=swap',
  'https://private-us-east-1.manuscdn.com/sessionFile/PfJNmbjm10qEOCGGxlKtBP/sandbox/5lVTSWjBBUZSMUFTZmnOlo-img-1_1770369545000_na1fn_aGVyby1pc3RhbmJ1bC1ib3NwaG9ydXM.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvUGZKTm1iam0xMHFFT0NHR3hsS3RCUC9zYW5kYm94LzVsVlRTV2pCQlVaU01VRlRabW5PbG8taW1nLTFfMTc3MDM2OTU0NTAwMF9uYTFmbl9hR1Z5YnkxcGMzUmhibUoxYkMxaWIzTndhRzl5ZFhNLnBuZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=GHfaqHLbmOFdjfz9blgTe5kZMSIl7CAa4gRrqfmk9T0qwSf8GrWtYg5~aZrDAqUxriT6EsJtdWAh5-pyFAVvrJFJjlUOnff8VlQZ~SoOQOW5L9V6Nx0Vkv6r6gjc~5-WhOVp9rnml4lctlUzbsUncT8f6oocjtQ4dtjhA2iYotAF16sBv5QdpqtLw9Hs4SXLEjb0Liq-359vzCbymmGmm6nkOwZxeLa227QaZWRhmqc~A4g12se096I1hrdTp9R7yrJGrLex0ZnBfcxWlWazuNXHqLp-HgXioHt3EUj31xve5fXHp1YxF38Y4TtWQFYRf3e0ZlbAUsEX8C-G8LbwoA__',
  'https://files.manuscdn.com/user_upload_by_module/session_file/106356824/nTcnpWMelsHglgJa.png',
  'https://files.manuscdn.com/user_upload_by_module/session_file/106356824/FVvxzyOiPkvSYVrv.webp',
  'https://files.manuscdn.com/user_upload_by_module/session_file/106356824/hdfVJGqKiVFiTIKl.jpeg',
  'https://files.manuscdn.com/user_upload_by_module/session_file/106356824/qKUDHktaZhWNVJQg.png',
  'https://private-us-east-1.manuscdn.com/sessionFile/PfJNmbjm10qEOCGGxlKtBP/sandbox/5lVTSWjBBUZSMUFTZmnOlo-img-4_1770369547000_na1fn_Z3JhbmQtYmF6YWFyLXNob3BwaW5n.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvUGZKTm1iam0xMHFFT0NHR3hsS3RCUC9zYW5kYm94LzVsVlRTV2pCQlVaU01VRlRabW5PbG8taW1nLTRfMTc3MDM2OTU0NzAwMF9uYTFmbl9aM0poYm1RdFltRjZZV0Z5TFhOb2IzQndhVzVuLnBuZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=Z4nok9DTS3VJKO8mYFFAZ1CSNTI686tyFBFSvdsjEr6FdRegFV3veZBc20psHvhTo8QYTxDlBdp7tOTF~G3H8-Eyh2AQLBJi1QgsmICFR5ZFdNflpEJZJOdOzS8O5CQPa4FsJpGqo2qyqA2Hn4~ytyk1TD-IFtVtRt~L3hfXMeS6hmWzgEfXLQ1AD5t7c6m8N8UUsXabI6Eqen-f3dbAza-1NIbssfSYgaXlib~Ies8cSjDDHX32V0CNh90gFGxReDfV7bnDlLIkJNLz3qE4QgK8rKozKqheOJ-sbOQf0QAFdiOay94DpzMMqFHS7qf6m1dH6DIxPo8-e9jMKP0Ptw__'
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
