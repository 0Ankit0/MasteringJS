let activePort = null;
let ports = [];

onconnect = function (e) {
    const port = e.ports[0];
    ports.push(port);

    port.onmessage = function (event) {
        if (event.data === 'setActive') {
            activePort = port;
            console.log('Active port set:', port);
        } else if (event.data === 'alert') {
            if (activePort) {
                setTimeout(() => {
                    activePort.postMessage('showAlert');
                }, 5000);
            }
        }
    };

    port.onmessageerror = function () {
        console.error('Message error on port:', port);
    };

    // port.onclose = function () {
    //     console.log('Port closed:', port);
    //     ports = ports.filter(p => p !== port);
    //     if (activePort === port) {
    //         activePort = ports.length > 0 ? ports[0] : null;
    //         if (activePort) {
    //             console.log('New active port set:', activePort);
    //         } else {
    //             console.log('No active port available');
    //         }
    //     }
    // };

    // port.start();
};