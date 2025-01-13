import { areaList } from "./constants.js"
import { coordinates, VERSION_MAP, MODEL_LIST, APP_VERSION_MAP } from "./static.js"

export function genRandomInfo() {
    let version = Object.keys(VERSION_MAP)[(Math.floor(Math.random() * Object.keys(VERSION_MAP).length)) >> 0];
    let sdk = VERSION_MAP[version].sdk;
    let build = VERSION_MAP[version].builds[(Math.floor(Math.random() * VERSION_MAP[version].builds.length)) >> 0];
    //Dalvik/2.1.0 (Linux; U; Android %VERSION%; %MODEL%/%BUILD%)
    //X-Radiko-Device: %SDKVERSION%.%NORMALIZEMODEL%
    let model = MODEL_LIST[(Math.floor(Math.random() * MODEL_LIST.length)) >> 0];
    let device = sdk + "." + model;
    let useragent = "Dalvik/2.1.0 (Linux; U; Android " + version + "; " + model + "/" + build + ")";

    let appversion = Object.keys(APP_VERSION_MAP)[(Math.floor(Math.random() * Object.keys(APP_VERSION_MAP).length)) >> 0];

    let userid = function () {
        let hex = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];
        let s = '';
        for (let i = 0; i < 32; i++) {
            s += hex[(Math.floor(Math.random() * hex.length)) >> 0];
        }
        return s;
    }();

    return {
        appversion: appversion,
        userid: userid,
        useragent: useragent,
        device: device
    }
}

export function genGPS(area_id) {
    let latlong = coordinates[areaList[parseInt(area_id.substr(2)) - 1]];
    let lat = latlong[0];
    let long = latlong[1];
    // +/- 0 ~ 0.025 --> 0 ~ 1.5' ->  +/-  0 ~ 2.77/2.13km
    lat = lat + Math.random() / 40.0 * (Math.random() > 0.5 ? 1 : -1);
    long = long + Math.random() / 40.0 * (Math.random() > 0.5 ? 1 : -1);
    return lat.toFixed(6) + "," + long.toFixed(6) + ",gps";
}

function fromLong(ipl) {
    return ((ipl >>> 24) + '.' + (ipl >> 16 & 255) + '.' + (ipl >> 8 & 255) + '.' + (ipl & 255));
};

function toLong(ip) {
    var ipl = 0;
    ip.split('.').forEach(octet => {
        ipl <<= 8;
        ipl += parseInt(octet);
    });
    return (ipl >>> 0);
};


export function genRandomIp(cidr_array) {
    let selectedCIDR = cidr_array[(Math.floor(Math.random() * cidr_array.length)) >> 0];
    let tmp = selectedCIDR.split('/');
    let addr = tmp[0];
    let maskLength = parseInt(tmp[1], 10);
    let maskLong = (0xffffffff << (32 - maskLength)) >>> 0
    let numberOfAddresses = Math.pow(2, 32 - maskLength);
    let first = (toLong(addr) & maskLong) >>> 0;
    let pick = (Math.random() * numberOfAddresses) >>> 0;
    return fromLong(first + pick);
}

export function initiatorFromExtension(r) {
    let ifInit = r.initiator && r.initiator.toLowerCase().indexOf("chrome-extension://" + chrome.runtime.id) != -1;  //initiator since chrome 63
    let ifTabId = r.tabId && r.tabId == -1; //mean this resp is not from tab
    if (ifInit || ifTabId) {
        return true;
    }
    return false;
}

//aac parse stuff
//parse hls packed audio (id3 tags and data)
// return id3 tag size and timestamp of this packed audio if success else return [0,0]
export function parseAAC(data) { //data -> Arraybuffer
    let processing = new DataView(data);
    if (processing.getUint8(0) != 73 || processing.getUint8(1) != 68 || processing.getUint8(2) != 51) {  // ID3
        return [0, 0];
    }
    let id3payloadsize = processing.getUint32(6, false); //bigendian
    let id3tagsize = 10 + id3payloadsize; //header size + payloadsize

    let timestampLow = processing.getUint32(id3tagsize - 4, false); // 32bit
    let timestampHigh = processing.getUint32(id3tagsize - 8, false); //need only the last bit
    let timestamp = timestampLow + 0xffffffff * timestampHigh;
    return [id3tagsize, timestamp];
}

export var ab2str;
export var str2ab;

if (!(globalThis.browser && globalThis.browser.runtime && globalThis.browser.runtime.id)) {  //see webextension-polyfill
    // for chrome
    //see chroumium bug:  https://bugs.chromium.org/p/chromium/issues/detail?id=831062
    ab2str = function ab2str(buf, offset) {
        return String.fromCharCode.apply(null, new Uint8Array(buf, offset)); //uint16 will raise must multiple of 2  error 
    }
    str2ab = function str2ab(str) {
        let buf = new ArrayBuffer(str.length); // Uint16 -> 2 bytes for each char  *2
        let bufView = new Uint8Array(buf); // U16

        for (let i = 0, strLen = str.length; i < strLen; i++) {
            bufView[i] = str.charCodeAt(i);
        }
        return buf;
    }
} else {
    //for firefox save memory via Uint16Array , use pkcs5 for padding.
    ab2str = function ab2str(buf, offset) {
        let len = buf.byteLength - offset;
        let padding = len % 8 == 0 ? 8 : len % 8;
        let crafted = new Uint8Array(len + padding);
        let p = new Array(padding);
        for (let i = 0; i < padding; i++) {
            p[i] = padding;
        }
        crafted.set(new Uint8Array(buf, offset), 0);
        crafted.set(p, len);
        return String.fromCharCode.apply(null, new Uint16Array(crafted.buffer));
    }
    str2ab = function str2ab(str) {
        let buf = new ArrayBuffer(str.length * 2);
        let bufView = new Uint16Array(buf);
        let paddingView = new Uint8Array(buf);
        for (let i = 0, strLen = str.length; i < strLen; i++) {
            bufView[i] = str.charCodeAt(i);
        }
        let padding = paddingView[str.length * 2 - 1];
        return buf.slice(0, str.length * 2 - padding);
    }

    //polyfill
    //see https://github.com/kiefferbp/webext-getBytesInUse-polyfill/blob/master/index.js
    //Poor performance!!
    chrome.storage.local.getBytesInUse = function (keys, callback) {
        let size = 0;
        if (typeof keys === 'string') {
            keys = [keys];
        }
        chrome.storage.local.get(keys, function (results) {
            let lastError = chrome.runtime.lastError;
            if (lastError) {
                callback(-1);
                return;
            }
            Object.keys(results).forEach(function (key) {
                size += (key + JSON.stringify(results[key])).length;
            });
            callback(size);
        });
    }
}