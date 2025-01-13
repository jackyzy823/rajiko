
import { parseAAC, ab2str, str2ab } from "./util.js"
import { retrieve_token } from "./auth.js"



// https://stackoverflow.com/a/73517935
async function worker(arr, func, limit = 5) {
    let results = [];
    let workers = [];
    let current = Math.min(arr.length, limit);
    async function process(i) {
        if (i < arr.length) {
            results[i] = await Promise.resolve(func(arr[i], i));
            await process(current++);
        }
    }
    for (let i = 0; i < current; i++) {
        workers.push(process(i));
    }
    await Promise.all(workers);
    return results;
}


async function cleanuptask(link) {
    let { timeshift_list: list } = await chrome.storage.local.get({ "timeshift_list": [] });
    list = list.filter(function (l) {
        return l !== link;
    });
    await chrome.storage.local.set({
        "timeshift_list": list,
    });
    chrome.action.setBadgeText && chrome.action.setBadgeText({ text: list.length > 0 ? list.length.toString() : "" });
}
// https://stackoverflow.com/questions/75527465/download-a-webpage-completely-chrome-extension-manifest-v3/75539867#75539867
async function getBlobUrl(blob) {
    const url = chrome.runtime.getURL('pages/offscreen.html');
    try {
        await chrome.offscreen.createDocument({
            url,
            reasons: ['BLOBS'],
            justification: 'MV3 requirement',
        });
    } catch (err) {
        if (!err.message.startsWith('Only a single offscreen')) throw err;
    }
    const client = (await clients.matchAll({ includeUncontrolled: true }))
        .find(c => c.url === url);
    const mc = new MessageChannel();
    client.postMessage(blob, [mc.port2]);
    const res = await new Promise(cb => (mc.port1.onmessage = cb));
    return res.data;
}


export async function downloadtimeShift(link, default_area_id) {
    let radioname, from, to;
    (new URL(link)).search.slice(1).split('&').map(kv => {
        let [k, v] = kv.split('=');
        switch (k) {
            case 'station_id':
                radioname = v;
                break;
            case 'ft':
                from = v;
                break;
            case 'to':
                to = v;
                break;
        }
    });
    let filename = radioname + '_' + from + '_' + to + '.aac';
    console.log(`timeshift file ${filename}`);
    let [token, area_id] = await retrieve_token(radioname, default_area_id);

    let response = await fetch(link, {
        headers: {
            'X-Radiko-AreaId': area_id,
            'X-Radiko-AuthToken': token
        }
    });

    let resp = await response.text();

    if (!response.ok || response.status == 403 || resp == "expired") {
        // are you trying to download timeshift older than 7 days?
        // perhaps someone is logged in as timefreeplus member :)
        // but i don't know how Radiko validate membership, maybe `lsid` or `authtoken`?
        // and API show expired , seems that this API do not support older than 7days.
        // but other playlist_create_url show forbidden
        // so will this work for timefreeplus member?
        await cleanuptask(link);
        return;
    }
    let detailLink = resp.split('\n').filter(function (d) {
        return d[0] != '#' && d.trim() != '';
    })[0];

    let response2 = await fetch(detailLink);
    // response failed? response.ok response.status
    let resp2 = await response2.text();
    let links = resp2.split('\n').filter(function (d) {
        return d[0] != '#' && d.trim() != '';
    });

    // https://stackoverflow.com/a/60622224 interesting solution but no error handle in the middle and not await-able
    // or https://stackoverflow.com/a/73517935

    let keyList = null; // links.map((v, idx, _) => filename + '_' + idx);

    try {
        keyList = await worker(links, async (url, idx) => {
            let resp = await fetch(url, { credentials: "omit" });
            let data = await resp.arrayBuffer();

            let storekey = filename + '_' + idx;
            let audio_string = ab2str(data, parseAAC(data)[0]); //timestamp not used for now.
            let storage_set = {};
            storage_set[storekey] = audio_string;

            await chrome.storage.local.set(storage_set);
            return storekey;
        }, 6);

        let data = await chrome.storage.local.get(keyList);
        let audio_buf = keyList.map(function (x) {
            return str2ab(data[x]);
        })
        let audiodata = new Blob(audio_buf, {
            type: "audio/aac"
        });

        // Blame on MV3 and service worker.
        // Must create blob url in offscreen docuemnt.
        let audiourl = await getBlobUrl(audiodata);
        let downloadId = await chrome.downloads.download({
            url: audiourl,
            filename: filename
        });
        chrome.downloads.onChanged.addListener(async function handler(delta) {
            if (delta.id == downloadId && delta.state && delta.state.current === "complete") {
                chrome.downloads.onChanged.removeListener(handler);
                await chrome.storage.local.remove(keyList);
                // TODO should we pass message to offscreen to free blob via URL.revokeObjectURL(audiourl);
                // or just closing the document is enough?
                await chrome.offscreen.closeDocument();
            }
        });


    } catch ({ name, message }) {
        console.warn(name, message);
        await chrome.storage.local.remove(keyList.filter(function (val) { return !val }));
    } finally {
        await cleanuptask(link);
    }
}