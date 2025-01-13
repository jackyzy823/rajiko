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
