import { str2ab, ab2str, parseAAC, getBlobUrl, revokeBlobUrl, initiatorFromExtension } from "./util.js"

/**
 * Return datetime string in Asia/Tokyo timezone!
 */
function timestamp2Filename(t) {
    // Intl format to 'YYYY/MM/dd hh:mm:ss'
    return Intl.DateTimeFormat("ja",
        {
            timeZone: "Asia/Tokyo",
            year: "numeric", month: "2-digit", day: "2-digit",
            hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit"
        }).format(new Date(t)).replaceAll("/", "").replaceAll(":", "").replaceAll(" ", "");
}

export function stream_listener_builder(radioname) {
    // Mostly for preparing recording.
    // https://stackoverflow.com/questions/66618136/persistent-service-worker-in-chrome-extension/
    // Chrome blog: The service worker terminates after 30 seconds of inactivity. (Receiving an event or calling an extension API resets this timer).
    // https://developer.chrome.com/docs/extensions/develop/migrate/to-service-workers#keep_a_service_worker_alive_until_a_long-running_operation_is_finished
    let heartbeatInterval;

    async function runHeartbeat() {
        await chrome.storage.session.set({ "last-heartbeat": Date.now() });
    }

    runHeartbeat().then(() => {
        // Then again every 20 seconds.
        heartbeatInterval = setInterval(runHeartbeat, 20 * 1000);
    });

    let started = false;
    let count = 0;
    let start_time;
    let end_time

    async function listener(req) {
        if (initiatorFromExtension(req)) { return; }
        end_time = Date.now();
        if (!started) {
            started = true;
            start_time = end_time;
        } //seems like jump-back problem disappered!

        // Due to radiko aac response's cache-control:max-age=0 , we must download it again. no disk cache available.
        let resp = await fetch(req.url);
        let data = await resp.arrayBuffer();

        let audio_string = ab2str(data, parseAAC(data)[0]); //timestamp not used for now.
        let storage_set = {};
        storage_set[`${radioname}_${start_time}_${count}`] = audio_string;
        count += 1;

        await chrome.storage.local.set(storage_set);
    };

    chrome.runtime.onMessage.addListener(async function stopme(msg, sender, respCallback) {
        if (msg["stop-recording"]) {
            chrome.runtime.onMessage.removeListener(stopme);
            // Note: change from onBeforeSendHeaders to onCompleted
            chrome.webRequest.onCompleted.removeListener(listener);

            clearInterval(heartbeatInterval);
            await chrome.storage.session.remove("last-heartbeat");

            if (count == 0) {
                await chrome.storage.local.remove("current_recording");
                return;
            }
            let filename = `${radioname}/${radioname}_${timestamp2Filename(start_time)}_${timestamp2Filename(end_time)}.aac`;

            let keyList = Array.from({ length: count }, (_, idx) => `${radioname}_${start_time}_${idx}`);
            let data = await chrome.storage.local.get(keyList);
            if (data) {
                let audio_buf = keyList.map(function (x) {
                    return str2ab(data[x]);
                });

                let audiodata = new Blob(audio_buf, {
                    type: "audio/aac"
                });
                let audiourl = await getBlobUrl(audiodata);
                chrome.downloads.onChanged.addListener(async function handler(delta) {
                    if (delta.id == downloadId && delta.state && delta.state.current === "complete") {
                        chrome.downloads.onChanged.removeListener(handler);
                        await chrome.storage.local.remove(keyList);
                        await chrome.storage.session.remove("current_recording");

                        await revokeBlobUrl(audiourl);
                    }
                });
                let downloadId = await chrome.downloads.download({
                    url: audiourl,
                    filename: filename
                });
            }
            chrome.action.setIcon?.({
                path: 'Circle-icons-radio-blue-48.png'
            });
        }
    });

    return listener;
}