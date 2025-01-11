// shared-worker.js
const broadcastChannel = new BroadcastChannel('shared-worker-channel');

self.onconnect = (event) => {
    const port = event.ports[0];

    port.onmessage = (messageEvent) => {
        setTimeout(() => {
            broadcastChannel.postMessage(messageEvent.data);
        }, 3000);
    };
};
