/**
 * CropSense AI - Service Worker
 * ============================================================
 * Provides offline-first caching strategy for the CropSense AI
 * Progressive Web App. Implements cache-first for static assets
 * and network-first for API calls, with offline fallback support
 * and background sync placeholder for form submissions.
 * ============================================================
 */

const CACHE_NAME = 'cropsense-v1';
const API_CACHE_NAME = 'cropsense-api-v1';

/* ---------- Static Assets to Precache ---------- */
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/login.html',
  '/portal.html',

  /* CSS */
  '/css/variables.css',
  '/css/base.css',
  '/css/splash.css',
  '/css/navigation.css',
  '/css/hero.css',
  '/css/sections.css',
  '/css/features.css',
  '/css/contact.css',
  '/css/footer.css',
  '/css/login.css',
  '/css/portal.css',
  '/css/sidebar.css',
  '/css/dashboard.css',
  '/css/pages.css',
  '/css/simple-mode.css',
  '/css/chat.css',
  '/css/responsive.css',
  '/css/animations.css',

  /* Core JS */
  '/js/app.js',
  '/js/auth.js',
  '/js/portal.js',
  '/js/router.js',
  '/js/i18n.js',
  '/js/api.js',
  '/js/toast.js',
  '/js/voice.js',
  '/js/utils.js',

  /* SVG Icons */
  '/assets/svg/icon-192.svg',
  '/assets/svg/icon-512.svg'
];

/* ---------- Install Event: Precache Static Assets ---------- */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Precaching static assets');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
      .catch((error) => {
        console.error('[SW] Precache failed:', error);
        // Don't let a single missing file break the whole install
        return caches.open(CACHE_NAME).then((cache) => {
          return Promise.allSettled(
            PRECACHE_ASSETS.map((url) => cache.add(url).catch(() => {
              console.warn('[SW] Failed to cache:', url);
            }))
          );
        });
      })
  );
});

/* ---------- Activate Event: Clean Old Caches ---------- */
self.addEventListener('activate', (event) => {
  const KEEP_CACHES = [CACHE_NAME, API_CACHE_NAME];

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => !KEEP_CACHES.includes(name))
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

/* ---------- Fetch Event: Routing Strategy ---------- */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests (let them pass through normally)
  if (request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests (e.g., Google Fonts CDN, analytics)
  if (url.origin !== self.location.origin) {
    // For Google Fonts and other CDN assets, try network first then cache
    if (url.hostname.includes('fonts.googleapis.com') ||
        url.hostname.includes('fonts.gstatic.com')) {
      event.respondWith(networkFirstWithCache(request, CACHE_NAME));
    }
    return;
  }

  // API calls: Network-first strategy
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstWithCache(request, API_CACHE_NAME));
    return;
  }

  // Static assets: Cache-first strategy
  event.respondWith(cacheFirstWithNetwork(request));
});

/* ---------- Cache-First Strategy ---------- */
async function cacheFirstWithNetwork(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('[SW] Cache-first fetch failed:', error);
    return offlineFallback(request);
  }
}

/* ---------- Network-First Strategy ---------- */
async function networkFirstWithCache(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.warn('[SW] Network-first: falling back to cache for', request.url);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    return offlineFallback(request);
  }
}

/* ---------- Offline Fallback ---------- */
async function offlineFallback(request) {
  const url = new URL(request.url);

  // For navigation requests, return the cached index page
  if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
    // Try to return the requested HTML page from cache
    const cachedPage = await caches.match(url.pathname);
    if (cachedPage) {
      return cachedPage;
    }
    // Fall back to index.html
    const cachedIndex = await caches.match('/index.html');
    if (cachedIndex) {
      return cachedIndex;
    }
  }

  // For API calls, return a JSON error
  if (url.pathname.startsWith('/api/')) {
    return new Response(
      JSON.stringify({
        error: 'offline',
        message: 'You are currently offline. Your request has been saved and will be sent when you reconnect.'
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  // Generic offline response
  return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
}

/* ---------- Background Sync Placeholder ---------- */
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-form-submissions') {
    event.waitUntil(syncFormSubmissions());
  }

  if (event.tag === 'sync-contact-form') {
    event.waitUntil(syncContactForm());
  }
});

/**
 * Syncs queued form submissions from IndexedDB when connectivity returns.
 * Reads pending entries, sends them to the server, and removes on success.
 */
async function syncFormSubmissions() {
  try {
    const db = await openSyncDB();
    const tx = db.transaction('pending-submissions', 'readonly');
    const store = tx.objectStore('pending-submissions');
    const entries = await getAllFromStore(store);

    for (const entry of entries) {
      try {
        const response = await fetch(entry.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entry.data)
        });

        if (response.ok) {
          const deleteTx = db.transaction('pending-submissions', 'readwrite');
          deleteTx.objectStore('pending-submissions').delete(entry.id);
          await deleteTx.complete;
        }
      } catch (fetchError) {
        console.warn('[SW] Sync failed for entry:', entry.id, fetchError);
      }
    }
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
  }
}

/**
 * Syncs queued contact form submissions.
 */
async function syncContactForm() {
  try {
    const db = await openSyncDB();
    const tx = db.transaction('pending-contact', 'readonly');
    const store = tx.objectStore('pending-contact');
    const entries = await getAllFromStore(store);

    for (const entry of entries) {
      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entry.data)
        });

        if (response.ok) {
          const deleteTx = db.transaction('pending-contact', 'readwrite');
          deleteTx.objectStore('pending-contact').delete(entry.id);
          await deleteTx.complete;
        }
      } catch (fetchError) {
        console.warn('[SW] Contact sync failed:', fetchError);
      }
    }
  } catch (error) {
    console.error('[SW] Contact background sync failed:', error);
  }
}

/* ---------- IndexedDB Helpers for Background Sync ---------- */
function openSyncDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('cropsense-sync', 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pending-submissions')) {
        db.createObjectStore('pending-submissions', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('pending-contact')) {
        db.createObjectStore('pending-contact', { keyPath: 'id', autoIncrement: true });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function getAllFromStore(store) {
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/* ---------- Push Notification Placeholder ---------- */
self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const options = {
      body: data.body || 'New update from CropSense AI',
      icon: '/assets/svg/icon-192.svg',
      badge: '/assets/svg/icon-192.svg',
      vibrate: [200, 100, 200],
      data: {
        url: data.url || '/'
      },
      actions: data.actions || []
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'CropSense AI', options)
    );
  } catch (error) {
    console.error('[SW] Push notification error:', error);
  }
});

/* ---------- Notification Click Handler ---------- */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Focus existing window if available
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }
        // Open new window
        return self.clients.openWindow(targetUrl);
      })
  );
});

console.log('[SW] CropSense AI Service Worker loaded');
