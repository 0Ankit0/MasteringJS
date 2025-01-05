const worker = new SharedWorker('shared-worker.js');

worker.port.onmessage = function (event) {
    if (event.data === 'showAlert') {
        alert('This is an alert from the shared worker!');
    }
};

worker.port.start();

function triggerAlert() {
    worker.port.postMessage('alert');
}

// Set this tab as the active tab when the page is loaded
document.addEventListener('DOMContentLoaded', () => {
    worker.port.postMessage('setActive');
});