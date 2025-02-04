
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

function toDate(programDate) {
    return new Date(`${programDate.slice(0, 4)}-${programDate.slice(4, 6)}-${programDate.slice(6, 8)}T${programDate.slice(8, 10)}:${programDate.slice(10, 12)}:${programDate.slice(12, 14)}.000`);
}

// Not used currently.
function isTimefreePlus(ft) {
    let programDate = toDate(ft);
    programDate.setHours(programDate.getHours() - 5);
    programDate.setHours(0, 0, 0, 0);

    const options = {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        timeZone: "Asia/Tokyo",
        hour12: false,
    };
    let dateTimeFormat = new Intl.DateTimeFormat('ja-jp', options);
    let parts = dateTimeFormat.formatToParts();
    let year, month, day;
    parts.map(part => {
        switch (part.type) {
            case "day":
                day = part.value;
                break;
            case "month":
                month = part.value;
                break;
            case "year":
                year = part.value;
                break;
        }
    });
    // Japan date , but treat as local datetime object.
    let today = new Date(`${year}-${month}-${day}T00:00:00.000`);
    today.setHours(today.getHours() - 5);
    today.setHours(0, 0, 0, 0);
    let diff = (today - programDate) / 1000.0 / 60 / 60 / 24;
    return diff > 7;
}

async function playlist_create_url(station_id) {
    let resp = await fetch(`https://radiko.jp/v3/station/stream/pc_html5/${station_id}.xml`);
    let data = await resp.text();

    // Sadly serice worker doesn't support parse xml.

    // attribute:   timefree=1, because this is a timeshift
    //              areafree=0, we use stations's local area id.
    const regex = /((areafree="0".*?timefree="1")|(timefree="1".*?areafree="0")).*\n.*<playlist_create_url>(.*?)<\/playlist_create_url>/gm;
    try {
        // TODO well not safe....
        let match = regex.exec(data);
        return match[4];
    } catch {
        // fallback
        return "https://tf-f-rpaa-radiko.smartstream.ne.jp/tf/playlist.m3u8"
    }
}

/**
 *
 * @param {string} dt YYYYMMDDHHmmss style string
 * @param {int} l seek seconds
 *
 * returns an array of [seeked date, YYYYMMDDHHmmss style string]
 */
function seek(dt, l) {
    dt.setSeconds(dt.getSeconds() + l);
    return [dt, `${dt.getFullYear()}${(dt.getMonth() + 1).toString().padStart(2, '0')}${dt.getDate().toString().padStart(2, '0')}${dt.getHours().toString().padStart(2, '0')}${dt.getMinutes().toString().padStart(2, '0')}${dt.getSeconds().toString().padStart(2, '0')}`]
}

/**
 *  It looks like only https://radiko.jp/v2/api/ts/playlist.m3u8 API, returns full aac list
 *  intermediate url: https://radiko.jp/v2/api/ts/chunklist/xxxxx.m3u8
 *  Other endpoint returns `l` seconds.
 *
 *  (Since this endpoint is for aSmartPhon7a)
 *  radiko.jp/v2/api/ts/playlist.m3u8 API show expired seems that this API do not support older than 7days.
 *  but other playlist_create_url show forbidden
 *
 *  It is safe to treat non-tf30 program as tf30 program (maybe no, see below) , but reverse not.
 *  so `isTimefreePlus` should be more strict
 *
 *  Some program at girigiri 7 days , https://radiko.jp/v2/api/ts/playlist.m3u8 still work, but new api not work?
 */
export async function downloadtimeShift(link, default_area_id, tf30) {
    let searchParams = (new URL(link)).searchParams;
    let radioname = searchParams.get("station_id");
    let from = searchParams.get("ft");
    let to = searchParams.get("to");

    let filename = radioname + '_' + from + '_' + to + '.aac';
    console.log(`timeshift file ${filename}`);
    let [token, area_id] = await retrieve_token(radioname, default_area_id);

    let links = [];

    /**
     * Get every 5s aac in a seek period(300s)
    */
    // if (isTimefreePlus(from)) {
    // Use the value from Radiko site.
    if (tf30) {
        // from yt-dlp-rajiko: the max accepted seek value.
        const FIXED_SEEK = 300;
        // whatever token has tf30 or not , just make a try
        let url = new URL(await playlist_create_url(radioname));
        let param = url.searchParams;
        param.set("lsid", (() => {
            let hex = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];
            let s = '';
            for (let i = 0; i < 32; i++) {
                s += hex[(Math.floor(Math.random() * hex.length)) >> 0];
            }
            return s;
        })());
        param.set("station_id", radioname);
        param.set("l", FIXED_SEEK);
        param.set("start_at", from);
        param.set("end_at", to);
        // b for station in area , c for not ,see `connectionType`
        param.set("type", "b");
        // These are not necessary (but we should look the same)
        param.set("ft", from);
        param.set("to", to);

        // new style method like recording
        for (
            // Init
            let end_date = toDate(to), seek_str = from, seek_date = toDate(from);
            // Condtion
            seek_date < end_date;
            // Increment
            [seek_date, seek_str] = seek(seek_date, FIXED_SEEK)
        ) {
            param.set("seek", seek_str);

            let response = await fetch(url.toString(), {
                headers: {
                    'X-Radiko-AreaId': area_id,
                    'X-Radiko-AuthToken': token
                }
            });

            let resp = await response.text();
            if (!response.ok || response.status == 403 || resp == "expired") {
                await cleanuptask(link);
                return;
            }
            let detailLink = resp.split('\n').filter(function (d) {
                return d[0] != '#' && d.trim() != '';
            })[0];

            let response2 = await fetch(detailLink);

            let resp2 = await response2.text();
            let partLinks = resp2.split('\n').filter(function (d) {
                return d[0] != '#' && d.trim() != '';
            });
            links.push(...partLinks);
        }

    } else {
        let response = await fetch(link, {
            headers: {
                'X-Radiko-AreaId': area_id,
                'X-Radiko-AuthToken': token
            }
        });

        let resp = await response.text();

        if (!response.ok || response.status == 403 || resp == "expired") {
            await cleanuptask(link);
            return;
        }
        let detailLink = resp.split('\n').filter(function (d) {
            return d[0] != '#' && d.trim() != '';
        })[0];

        let response2 = await fetch(detailLink);

        let resp2 = await response2.text();
        links = resp2.split('\n').filter(function (d) {
            return d[0] != '#' && d.trim() != '';
        });

    }

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