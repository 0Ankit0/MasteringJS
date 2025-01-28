self.addEventListener('install', event => {
    console.log('Service Worker installed');
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    console.log('Service Worker activated');
});

self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    // Intercept requests to '/log' and handle them
    if (url.pathname === '/log') {
        event.respondWith(
            new Response('Beacon received by the server!', {
                headers: { 'Content-Type': 'text/plain' },
            })
        );

        // Simulate server-side processing by logging the request body
        event.request.text().then(body => {
            console.log('Beacon Data Received by server:', body);
        });
    }
});
