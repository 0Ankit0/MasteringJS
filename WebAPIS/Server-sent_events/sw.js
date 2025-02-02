// 📌 Service Worker - Mock SSE (Server-Sent Events)

// ✅ Listen for the "install" event (first time the SW is installed)
self.addEventListener("install", (event) => {
    console.log("✅ Service Worker Installed");
    self.skipWaiting(); // 🔥 Force activation immediately (skip waiting phase)
});

// ✅ Listen for the "activate" event (when the SW takes control of pages)
self.addEventListener("activate", (event) => {
    console.log("✅ Service Worker Activated");
    event.waitUntil(self.clients.claim()); // 🔥 Take control of all open clients (pages)
});

// ✅ Intercept network requests (fetch events)
self.addEventListener("fetch", (event) => {
    const url = new URL(event.request.url);

    // 🎯 Check if the request is for the SSE endpoint "/mock-sse"
    if (url.pathname === "/mock-sse") {
        console.log("✅ Intercepting SSE request:", event.request.url);

        // 🔥 Create a stream for sending SSE messages
        const stream = new ReadableStream({
            start(controller) {
                function sendEvent() {
                    if (controller.desiredSize <= 0) return; // Stop sending if the stream is full

                    // 📌 SSE message format (must end with "\n\n")
                    const message = `data: Mock Event - ${new Date().toLocaleTimeString()}\n\n`;
                    controller.enqueue(new TextEncoder().encode(message));

                    setTimeout(sendEvent, 1000); // 🔄 Send a new event every second
                }

                sendEvent(); // 🔥 Start sending events
            },
            cancel() {
                console.log("❌ SSE stream closed."); // Log when the connection is closed
            }
        });

        // 📌 Respond with the SSE stream (mimicking a real server)
        event.respondWith(new Response(stream, {
            headers: {
                "Content-Type": "text/event-stream", // ⚡ Required for SSE
                "Cache-Control": "no-cache", // 🚫 Prevent caching
                "Connection": "keep-alive" // 🔄 Keep connection open
            }
        }));
    }
});
