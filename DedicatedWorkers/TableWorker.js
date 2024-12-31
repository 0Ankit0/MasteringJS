/**
 * Web Worker to handle table data processing in chunks.
 * 
 * @file TableWorker.js
 */

let dataPayload = [];
let currentIndex = 0;
let chunkSize = 50;

/**
 * Handles incoming messages to the worker.
 * 
 * @param {MessageEvent} event - The message event containing data.
 * @property {string} event.data.type - The type of the message.
 * @property {Array} event.data.payload - The data payload to be processed.
 * @property {Array} event.data.columns - The columns to be used for generating the table body.
 */
self.onmessage = async function (event) {
    const { type, payload, columns } = event.data;

    if (type === "initialize") {
        dataPayload = payload; // Store the payload received
        currentIndex = 0;
        await resetCache();
        postMessage({ status: "initialized", totalRows: dataPayload.length });
    } else if (type === "getChunk") {
        const chunk = dataPayload.slice(currentIndex, currentIndex + chunkSize);
        currentIndex += chunkSize;
        await updateCache(currentIndex);
        const tableBody = generateTableBody(chunk, columns); // Ensure columns are passed to generateTableBody
        postMessage({ status: "success", tableBody });
    } else if (type === "reset") {
        dataPayload = [];
        currentIndex = 0;
        await resetCache();
        postMessage({ status: "reset" });
    }
};

/**
 * Generates the HTML table body from a chunk of data.
 * 
 * @param {Array} chunk - The chunk of data to be processed.
 * @param {Array} columns - The columns to be used for generating the table body.
 * @returns {string} The generated HTML table body.
 */
function generateTableBody(chunk, columns) {
    return chunk
        .map((row) =>
            `<tr>${columns
                .map((col) => `<td>${row[col] || ""}</td>`)
                .join("")}</tr>`
        )
        .join("");
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
