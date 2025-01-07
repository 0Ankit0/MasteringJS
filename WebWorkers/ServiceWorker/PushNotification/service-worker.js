self.addEventListener('push', event => {
    const data = event.data.json();
    const options = {
        body: data.body,
        vibrate: [200, 100, 200],
        requireInteraction: true
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow('/')
    );
});