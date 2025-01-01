/**
 * Web Worker to handle table data processing in chunks.
 * 
 * @file TableWorker.js
 */

let dataPayload = [];
let chunkSize = 50;

/**
 * Handles incoming messages to the worker.
 * 
 * @param {MessageEvent} event - The message event containing data.
 */
self.onmessage = async function (event) {
    const { payload, columns } = event.data;

    // Load the current index from cache to continue from where we left off
    let currentIndex = await getCachedIndex();

    if (payload) {
        // Initialize with payload, if provided.
        dataPayload = payload;
        await resetCache(); // Ensure no old index is cached
        currentIndex = 0; // Reset current index to start fresh
        postMessage({ status: "initialized", totalRows: dataPayload.length });
        fetchNextChunk(columns, currentIndex); // Automatically fetch the first chunk
    } else if (columns) {
        // Proceed with fetching the next chunk
        fetchNextChunk(columns, currentIndex);
    }
};

/**
 * Fetches the next chunk of data and sends the result back to the main thread.
 * 
 * @param {Array} columns - The columns to generate the table body.
 * @param {number} currentIndex - The current index from where to fetch the next chunk.
 */
async function fetchNextChunk(columns, currentIndex) {
    // Ensure we haven't exhausted all the data
    if (currentIndex >= dataPayload.length) {
        postMessage({ status: "completed" });
        return;
    }

    // Fetch the next chunk
    const chunk = dataPayload.slice(currentIndex, currentIndex + chunkSize);
    currentIndex += chunkSize;

    // Store the updated index in the cache
    await updateCache(currentIndex);

    // Generate and send the table body
    const tableBody = generateTableBody(chunk, columns);
    postMessage({ status: "success", tableBody });
}

/**
 * Resets the cache by deleting the current index.
 * 
 * @returns {Promise<void>} A promise that resolves when the cache is reset.
 */
async function resetCache() {
    const cache = await caches.open("worker-cache");
    await cache.delete("currentIndex");
}

/**
 * Updates the cache with the current index.
 * 
 * @param {number} index - The current index to be cached.
 * @returns {Promise<void>} A promise that resolves when the cache is updated.
 */
async function updateCache(index) {
    const cache = await caches.open("worker-cache");
    const response = new Response(JSON.stringify(index));
    await cache.put("currentIndex", response);
}

/**
 * Retrieves the cached index from the cache.
 * 
 * @returns {Promise<number>} A promise that resolves to the cached index.
 */
async function getCachedIndex() {
    const cache = await caches.open("worker-cache");
    const response = await cache.match("currentIndex");

    if (response) {
        const index = await response.json();
        return index || 0;
    }
    return 0;
}

/**
 * Generates the HTML table body from a chunk of data.
 * 
 * @param {Array} chunk - The chunk of data to be processed.
 * @param {Array} columns - The columns to be used for generating the table body.
 * @returns {string} The generated HTML table body.
 */
function generateTableBody(chunk, columns) {
    if (!columns || columns.length === 0) {
        console.error("Invalid columns data.");
        return "";
    }

    return chunk
        .map((row) =>
            `<tr>${columns
                .map((col) => `<td>${row[col] || ""}</td>`)
                .join("")}</tr>`
        )
        .join("");
}
