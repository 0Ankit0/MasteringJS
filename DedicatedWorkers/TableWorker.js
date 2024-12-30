let dataPayload = [];
let currentIndex = 0;
let chunkSize = 50;

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

function generateTableBody(chunk, columns) {
    return chunk
        .map((row) =>
            `<tr>${columns
                .map((col) => `<td>${row[col] || ""}</td>`)
                .join("")}</tr>`
        )
        .join("");
}

async function resetCache() {
    const cache = await caches.open("worker-cache");
    await cache.delete("currentIndex");
}

async function updateCache(index) {
    const cache = await caches.open("worker-cache");
    const response = new Response(JSON.stringify(index));
    await cache.put("currentIndex", response);
}

async function getCachedIndex() {
    const cache = await caches.open("worker-cache");
    const response = await cache.match("currentIndex");

    if (response) {
        const index = await response.json();
        return index || 0;
    }
    return 0;
}
