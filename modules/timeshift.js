
import { parseAAC, ab2str, str2ab, getBlobUrl, revokeBlobUrl } from "./util.js"
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
    chrome.action.setBadgeText?.({ text: list.length > 0 ? list.length.toString() : "" });
}

export async function downloadtimeShift(link, default_area_id) {
    let searchParams = (new URL(link)).searchParams;
    let radioname = searchParams.get("station_id");
    let from = searchParams.get("ft");
    let to = searchParams.get("to");

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
        // but i don't know how Radiko validates membership, maybe `lsid` or `authtoken`?

        // radiko.jp/v2/api/ts/playlist.m3u8 API show expired
        // seems that this API do not support older than 7days.
        // but other playlist_create_url show forbidden
        // so will this work for timefreeplus member?
        await cleanuptask(link);
        return;
    }
    let detailLink = resp.split('\n').filter(function (d) {
        return d[0] != '#' && d.trim() != '';
    })[0];

    let response2 = await fetch(detailLink);

    let resp2 = await response2.text();
    let links = resp2.split('\n').filter(function (d) {
        return d[0] != '#' && d.trim() != '';
    });

    // Map limit solutions:
    // https://stackoverflow.com/a/60622224 interesting solution but no error handle in the middle and not await-able

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
        chrome.downloads.onChanged.addListener(async function handler(delta) {
            if (delta.id == downloadId && delta.state && delta.state.current === "complete") {
                chrome.downloads.onChanged.removeListener(handler);
                await chrome.storage.local.remove(keyList);

                await revokeBlobUrl(audiourl);
            }
        });
        let downloadId = await chrome.downloads.download({
            url: audiourl,
            filename: filename
        });

    } catch ({ name, message }) {
        console.warn(name, message);
        await chrome.storage.local.remove(keyList.filter(function (val) { return !val }));
    } finally {
        await cleanuptask(link);
    }
}