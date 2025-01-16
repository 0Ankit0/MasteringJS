self.addEventListener('fetch', (event) => {
    if (event.request.url.endsWith('/fake-large-data')) {
        event.respondWith(handleFakeLargeDataRequest());
    }
});

function handleFakeLargeDataRequest() {
    // Create a new ReadableStream to generate fake data in chunks
    const stream = new ReadableStream({
        start(controller) {
            let chunkIndex = 0;
            const totalChunks = 100;

            function sendChunk() {
                if (chunkIndex >= totalChunks) {
                    controller.close(); // Close the stream after all chunks are sent
                    return;
                }

                const chunk = `Chunk ${chunkIndex + 1}: This is a piece of fake data.\n`;
                controller.enqueue(new TextEncoder().encode(chunk)); // Encode and send the chunk
                chunkIndex++;

                // Simulate delay for chunk generation
                setTimeout(sendChunk, 100); // Send a chunk every 100ms
            }

            sendChunk();
        },
    });

    // Return a response with the fake data stream
    return new Response(stream, {
        headers: { 'Content-Type': 'text/plain' },
    });
}
