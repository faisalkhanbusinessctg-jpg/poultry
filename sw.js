// পোল্ট্রি ট্র্যাকার — অফলাইন অ্যাপ-শেল ক্যাশ
// ডেটা (Firestore) ক্যাশিং এখানে হয় না — সেটা Firestore SDK নিজেই এর অফলাইন
// পারসিস্টেন্স দিয়ে সামলায়। এই সার্ভিস ওয়ার্কার শুধু অ্যাপের HTML/আইকন
// অফলাইনেও লোড হওয়া নিশ্চিত করে।
const CACHE_NAME = 'poultry-tracker-v1';
const APP_SHELL = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  // থার্ড-পার্টি (Firebase/CDN) রিকোয়েস্ট নেটওয়ার্ক-ফার্স্ট, নিজের অ্যাপ-শেল ক্যাশ-ফার্স্ট
  if (url.origin !== self.location.origin) return;
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request).catch(() => caches.match('./index.html')))
  );
});
