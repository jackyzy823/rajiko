navigator.serviceWorker.onmessage = e => {
    e.ports[0].postMessage(URL.createObjectURL(e.data));
};