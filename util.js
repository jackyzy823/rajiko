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