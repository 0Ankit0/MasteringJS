self.addEventListener('install', (event) => {
    console.log('Service Worker installed');
    // This is a one-time installation, so we can use the event to activate right away
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('Service Worker activated');
});

self.addEventListener('periodicsync', (event) => {
    // Check if the sync tag is the one we've registered
    if (event.tag === 'periodic-sync') {
        console.log('Periodic sync event triggered!');

        // Here, you can fetch data periodically
        event.waitUntil(
            fetchDataFromAPI()
        );
    }
});

// Function to simulate fetching data (e.g., from a dummy API)
async function fetchDataFromAPI() {
    try {
        // Simulating fetching data (e.g., dummy data)
        const response = await fetch('https://jsonplaceholder.typicode.com/posts/1');
        const data = await response.json();

        // Here you could save the data to cache or handle it in some way
        console.log('Fetched data:', data);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}
