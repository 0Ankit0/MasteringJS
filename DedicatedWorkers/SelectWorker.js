const DB_NAME = "SelectDatabase";
const DB_VERSION = 1;
const STORE_NAME = "options";
const CHUNK_SIZE = 20;

let isDatabaseReady = false;
let messageQueue = [];
let cursorPosition = 0; // Track the position of the cursor

// Function to delete and recreate the database
function resetDatabase() {
    const deleteRequest = indexedDB.deleteDatabase(DB_NAME);

    deleteRequest.onsuccess = () => {
        console.log("Previous database deleted successfully.");
        initializeDatabase();
    };

    deleteRequest.onerror = (event) => {
        console.error("Error deleting the database:", event.target.error);
    };

    deleteRequest.onblocked = () => {
        console.warn("Database deletion is blocked. Close all connections and try again.");
    };
}

// Function to initialize the database
function initializeDatabase() {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
            const objectStore = db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });

            // Create and store a temporary payload
            const payload = Array.from({ length: 400 }, (_, i) => ({
                name: `Name ${i + 1}`,
                address: `Address ${i + 1}`,
            }));
            payload.forEach(item => objectStore.add(item));
            console.log("Payload stored in IndexedDB.");
        }
    };

    request.onsuccess = () => {
        isDatabaseReady = true;
        console.log("Database initialized.");
        processMessageQueue(); // Process queued messages
    };

    request.onerror = (event) => {
        console.error("Error initializing the database:", event.target.error);
    };
}

// Function to process messages in the queue
function processMessageQueue() {
    while (messageQueue.length > 0) {
        const message = messageQueue.shift();
        handleWorkerMessage(message);
    }
}

// Worker message handler
self.onmessage = function (e) {
    if (!isDatabaseReady) {
        messageQueue.push(e); // Queue the message if the database isn't ready
    } else {
        handleWorkerMessage(e);
    }
};

// Function to handle individual messages
function handleWorkerMessage(e) {
    const { action, searchQuery, option } = e.data;

    const dbRequest = indexedDB.open(DB_NAME, DB_VERSION);

    dbRequest.onsuccess = function (event) {
        const db = event.target.result;

        if (!db.objectStoreNames.contains(STORE_NAME)) {
            self.postMessage({ status: 'error', error: `Object store "${STORE_NAME}" not found.` });
            return;
        }

        const transaction = db.transaction([STORE_NAME], "readonly");
        const objectStore = transaction.objectStore(STORE_NAME);

        let options = '';
        let filteredData = [];

        const request = objectStore.openCursor(null, 'next');
        let currentIndex = 0;

        request.onsuccess = function (event) {
            const cursor = event.target.result;
            if (cursor) {
                const item = cursor.value;
                if (action === "search" && item[option.label].toLowerCase().includes(searchQuery.toLowerCase())) {
                    filteredData.push(item);
                } else if (action !== "search" && currentIndex >= cursorPosition && filteredData.length < CHUNK_SIZE) {
                    filteredData.push(item);
                    cursorPosition++; // Update the cursor position
                }
                currentIndex++;
                cursor.continue();
            } else {
                generateOptions(filteredData);
            }
        };

        function generateOptions(data) {
            data.forEach(item => {
                options += `<option value="${item[option.value]}">${item[option.label]}</option>`;
            });
            self.postMessage({ status: 'success', data: options });
        }
    };

    dbRequest.onerror = function (event) {
        self.postMessage({ status: 'error', error: event.target.error.message });
    };
}

// Initialize database on worker load
resetDatabase();
