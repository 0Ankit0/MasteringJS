self.onmessage = async function (e) {
    const { url, payload, requestType } = e.data;

    try {
        const response = await fetch(url, {
            method: requestType,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        self.postMessage({ status: 'success', data });
    } catch (error) {
        self.postMessage({ status: 'error', error: error.message });
    }
};