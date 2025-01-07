// Install event
self.addEventListener('install', event => {
    console.log('Service Worker installing.');
    // Perform install steps
});

// Activate event
self.addEventListener('activate', event => {
    console.log('Service Worker activating.');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            console.log('Existing caches:', cacheNames); // Debugging log
            return Promise.all(
                cacheNames.map(cacheName => {
                    console.log('Deleting cache:', cacheName); // Debugging log
                    return caches.delete(cacheName);
                })
            );
        }).then(() => {
            console.log('All caches deleted'); // Debugging log
        })
    );
});

self.addEventListener('fetch', event => {
    if (event.request.method === 'POST') {
        event.respondWith(
            caches.open('dynamic-cache').then(cache => {
                return cache.match(event.request.url).then(response => {
                    if (response) {
                        return new Response('This is from the cache', {
                            headers: { 'Content-Type': 'text/plain' }
                        });
                    }
                    // Simulate a server response without making an actual network request
                    const simulatedResponse = new Response('This is server response', {
                        headers: { 'Content-Type': 'text/plain' }
                    });
                    // Optionally cache the simulated response
                    cache.put(event.request.url, simulatedResponse.clone());
                    return simulatedResponse;
                });
            })
        );
    } else {
        // For non-POST requests, just fetch the request normally
        event.respondWith(fetch(event.request));
    }
});