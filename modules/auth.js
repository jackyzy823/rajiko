import { APP_VERSION_MAP, APP_KEY_MAP } from "./static.js";
import { radioAreaId } from "./constants.js"
import { genRandomInfo, genGPS } from "./util.js"

/**
 * The max lifetime of a token is 90 mins. and Radiko web will refresh it after 70mins (42e5).
 */
export async function retrieve_token(radioname, default_area_id) {
    let availableArea = radioAreaId[radioname].area;
    let { auth_tokens: authTokens } = await chrome.storage.session.get({ "auth_tokens": {} });

    let hadTokenArea = availableArea.filter((area) => {
        return !!authTokens[area] && ((Date.now() - authTokens[area].requestTime) < 42e5);
    })
    if (hadTokenArea.length > 0) {
        let pickArea = hadTokenArea.includes(default_area_id) ? default_area_id : hadTokenArea[0];
        return [authTokens[pickArea].token, pickArea];
    } else {
        // if session has exist but expired areas, pick one, remove others, else get random one.
        let expired = availableArea.filter((area) => {
            return !!authTokens[area]
        })
        let pickArea;
        if (expired.length > 0) {
            pickArea = expired.pop();
            for (let i in expired) {
                delete authTokens[i];
            }
        } else {
            pickArea = availableArea[(Math.floor(Math.random() * availableArea.length)) >> 0];
        }

        let info = genRandomInfo();
        let rapp = APP_VERSION_MAP[info.appversion];
        let auth1 = await fetch("https://radiko.jp/v2/api/auth1", {
            headers: {
                'X-Radiko-App': rapp,
                'X-Radiko-App-Version': info.appversion,
                'X-Radiko-Device': info.device,
                'X-Radiko-User': info.userid,
            },
            credentials: "omit"
        });

        let token = auth1.headers.get('x-radiko-authtoken')
        let offset = parseInt(auth1.headers.get('x-radiko-keyoffset'));
        let length = parseInt(auth1.headers.get('x-radiko-keylength'));
        let partial = btoa(atob(APP_KEY_MAP[rapp]).slice(offset, offset + length));
        let auth2 = await fetch('https://radiko.jp/v2/api/auth2', {
            headers: {
                'X-Radiko-App': rapp,
                'X-Radiko-App-Version': info.appversion,
                'X-Radiko-Device': info.device,
                'X-Radiko-User': info.userid,
                'X-Radiko-AuthToken': token,
                'X-Radiko-Partialkey': partial,
                'X-Radiko-Location': genGPS(pickArea),
            },
            credentials: "omit"
        })
        if (auth2.status == 200) {
            authTokens[pickArea] = { token: token, requestTime: Date.now() };
            await chrome.storage.session.set({ "auth_tokens": authTokens });
            return [token, pickArea];
        } else {
            throw new Error("Retrieve token failed");
        }
    }
}


/**
 * The auth flow on Android App
 * note: userid is 16hex (not 32)
 * note: lat,lang is float (not string)
 *
 * Android app will use api.annex.radiko.jp (and protobuf) for further commands?
 * protobuf details could be found in mobile website
 * 
 * Analysis with FakeTraveler and PCAPdroid-mitm under root
 */
async function apk_auth(area_id, info) {
    let rapp = APP_VERSION_MAP[info.appversion];
    // Android VERSION_MAP's key ' split("dot")[0]
    // Device like Google Pixel 6
    let ua = `radiko/${info.appversion} (Android;Android14, Google Pixel 6)`
    let auth1 = await fetch("https://api.radiko.jp/apparea/auth1", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "User-Agent": ua
        },
        body: JSON.stringify({ "app_id": rapp, "app_version": info.appversion, "user_id": info.userid.slice(0, 16), "device": "android" }
        ),
        credentials: "omit"
    });
    // Response sample {"app_type":"android","auth_token_info":{"auth_token":"<auth_token>","expires_at":"2025-01-01T00:00:00+09:00"},"delay":15,"key_length":16,"key_offset":18319,"tet_type":"android"}
    // `expires_at` shows -> 90 mins lifetime
    let resp = await auth1.json();
    let token = resp["auth_token_info"]["auth_token"];
    let requestTime = Date.parse(auth1.headers.get("date"));
    let length = resp["key_length"];
    let offset = resp["key_offset"];
    let partial = btoa(atob(APP_KEY_MAP[rapp]).slice(offset, offset + length));

    // TODO: new genGPS function -> return Float!
    let gps = genGPS(area_id).split(",");
    let lat = parseFloat(gps[0]);
    let lang = parseFloat(gps[1]);

    let auth2 = await fetch("https://api.radiko.jp/apparea/auth2", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "User-Agent": ua
        },
        body: JSON.stringify({
            "auth_token": token, "partial_key": partial, "connection": "wifi",
            "location": { "latitude": lat, "longitude": lang }
        }),
        credentials: "omit"
    });
    // Intersting error message: (when i pass string in lat,lang)
    // message	"json error: json: cannot unmarshal string into Go struct field Location.location.latitude of type float64"
    let resp2 = await auth2.json();
    // Response: { "areas": [ { "area_id": "JP13", "area_name": "東京都", "area_roman": "tokyo Japan" } ], "is_areafree": false, "is_out": false, "is_timefree_plus": false }
    // authTokens[pickArea] = { token: token, requestTime: requestTime };
    // await chrome.storage.session.set({ "auth_tokens": authTokens });

}