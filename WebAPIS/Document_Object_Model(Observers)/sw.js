// sw.js
self.addEventListener('install', event => {
    console.log('Service Worker installing...');
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    console.log('Service Worker activated.');
    return self.clients.claim();
});

self.addEventListener('fetch', event => {
    // Intercept requests to the virtual URL
    if (event.request.url.endsWith('virtual/domparser.html')) {
        event.respondWith(
            new Response(
                `
                <div>
                    <h1 class="text-primary">DOMParser</h1>
                    <p>The <strong>DOMParser</strong> interface is used to parse XML or HTML strings into DOM documents.</p>
                    <h2>Example Usage</h2>
                    <pre>
const parser = new DOMParser();
const htmlString = '&lt;div&gt;Hello, World!&lt;/div&gt;';
const doc = parser.parseFromString(htmlString, 'text/html');
console.log(doc.body.firstChild.textContent); // Outputs: Hello, World!
                    </pre>
                </div>
                `,
                {
                    headers: {
                        'Content-Type': 'text/html'
                    }
                }
            )
        );
    }
});
