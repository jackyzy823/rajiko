import { radioIndex } from "./constants.js"
import { PLAYER_RULE_TEMPLATE, TEMPLATE_RADIO_NAME, RULEID, BONUS_PERMISSION, JAPAN_IPS, APP_VERSION_MAP } from "./static.js";
import { genRandomIp, isFirefox } from "./util.js"

/**
 * The max rule number is radioIndex.length * PLAYER_RULE_TEMPLATE.length
 * For now it is 109 * 5 = 540
 * TODO what about rule expired?
 * TODO what if there's a new radio. Fetch https://radiko.jp/index/RADIONAME then parse DOM in offscreen
 */
export function updateRadioRules(radioname, area_id, token) {
    let idx = radioIndex.indexOf(radioname);
    let rules = { addRules: [], removeRuleIds: [] };
    let rules_count = PLAYER_RULE_TEMPLATE.length;

    for (let i = 0; i < rules_count; i++) {
        let id = RULEID.RADIO_BASE + rules_count * idx + i;
        let urlfilter = PLAYER_RULE_TEMPLATE[i].replaceAll(TEMPLATE_RADIO_NAME, radioname)
        rules.addRules.push({
            id: id,
            action: {
                type: "modifyHeaders",
                requestHeaders: [
                    {
                        header: "X-Radiko-AuthToken",
                        operation: "set",
                        value: token
                    },
                    {
                        header: "X-Radiko-AreaId",
                        operation: "set",
                        value: area_id
                    },
                ]
            },
            condition: {
                excludedInitiatorDomains: [chrome.runtime.id],
                urlFilter: urlfilter,
            }
        });
        rules.removeRuleIds.push(id);
    }
    console.log("updateRadioRules ", radioname, " with ", area_id, " rules:", rules);
    chrome.declarativeNetRequest.updateSessionRules(rules);
}

/**
 * Rules for TVer and NHK Radio.
 * These rules apply on Firefox and Chrome.
 */
export async function setUpBonus(enabled) {
    if (enabled === true) {
        let matched = await chrome.permissions.contains(BONUS_PERMISSION);
        // In Firefox, set up rules and options even permission request failed.
        if (!matched && !isFirefox()) {
            // reset to disabled
            await chrome.storage.local.set({ "bonus_feature": false });
            return;
        }
        let japan_ip = genRandomIp(JAPAN_IPS);
        console.log(`using japan ip ${japan_ip}`);
        chrome.declarativeNetRequest.updateSessionRules({
            addRules: [
                {
                    id: RULEID.NHK_RADIO_LIVE,
                    action: {
                        type: "modifyHeaders",
                        requestHeaders: [
                            {
                                header: "X-Forwarded-For",
                                operation: "set",
                                value: japan_ip
                            }
                        ]
                    },
                    condition: {
                        // Only apply on nhk.or.jp site.
                        initiatorDomains: ["nhk.or.jp"],
                        urlFilter: "*://*.nhk.jp/hls/*"
                    }
                },
                {
                    id: RULEID.NHK_RADIO_VOD,
                    action: {
                        type: "modifyHeaders",
                        requestHeaders: [
                            {
                                header: "X-Forwarded-For",
                                operation: "set",
                                value: japan_ip
                            }
                        ]
                    },
                    condition: {

                        initiatorDomains: ["nhk.or.jp"],
                        urlFilter: "*://vod-stream.nhk.jp/*"
                    }
                },
                {
                    id: RULEID.TVER,
                    action: {
                        type: "modifyHeaders",
                        requestHeaders: [
                            {
                                header: "X-Forwarded-For",
                                operation: "set",
                                value: japan_ip
                            }
                        ]
                    },
                    condition: {
                        // To not break up other sites using brightcove CDN.
                        initiatorDomains: ["tver.jp"],
                        urlFilter: "*://edge.api.brightcove.com/playback/*/videos/*"
                    }
                }],
            removeRuleIds: [RULEID.NHK_RADIO_LIVE, RULEID.NHK_RADIO_VOD, RULEID.TVER]
        });


        // Tver treats Chrome under Linux as AndroidPC and then askes user to use its App.
        // NOTE: if using manifest-> "incognito": "split"
        // (for opening url in incognito tab instead of normal tab when clicking link in popup meu under incognito window),
        // add chrome.extension.inIncognitoContext in script id to avoid duplication.
        if (!isFirefox()) {
            chrome.runtime.getPlatformInfo(async info => {
                if (info.os == "linux") {
                    let result = await chrome.scripting.getRegisteredContentScripts({ ids: ["chrome_linux_ua"] });
                    if (result && result.length > 0) {
                        // Already registered
                        return;
                    }

                    chrome.scripting.registerContentScripts([
                        {
                            id: "chrome_linux_ua",
                            js: ["ui/chrome_linux_ua_inspect.js"],
                            matches: ["https://*.tver.jp/*"],
                            // Keypoint 1: run before `getEnvType` in Tver.
                            runAt: "document_start",
                            // Keypoint 2: don't isolate.
                            world: "MAIN"
                        }
                    ]);
                }
            });
        }
    } else {
        // Should check if exists?
        chrome.declarativeNetRequest.updateSessionRules({
            removeRuleIds: [RULEID.NHK_RADIO_LIVE, RULEID.NHK_RADIO_VOD, RULEID.TVER]
        });
        if (!isFirefox()) {
            chrome.runtime.getPlatformInfo(async info => {
                if (info.os == "linux") {
                    let result = await chrome.scripting.getRegisteredContentScripts({ ids: ["chrome_linux_ua"] });
                    if (result && result.length > 0) {
                        // Already registered
                        await chrome.scripting.unregisterContentScripts({ ids: ["chrome_linux_ua"] });
                    }
                }
            });
        }
    }
}


/**
 * Rules for bypass Radiko area check and auth
 */
// TODO update rules per tab ? but how to delete? or update rules per region  and only apply to some tabs?
export function updateAreaRules(area_id, info) {
    chrome.declarativeNetRequest.updateSessionRules(
        {
            addRules: [
                {
                    // Use prepared response from `response` folder for RULEID.APPAREA, RULEID.AREA and RULEID.AUTH2.
                    // I'm not sure why it works now.
                    // As i can recall, previously 307 Internal Redirect is not a success code for `/area` API preflight.
                    id: RULEID.APPAREA,
                    action: { type: "redirect", redirect: { extensionPath: "/response/area-" + area_id + ".html" } },
                    condition: { urlFilter: "*://*.radiko.jp/apparea/area*" }
                },
                {
                    id: RULEID.AREA,
                    action: { type: "redirect", redirect: { extensionPath: "/response/area-" + area_id + ".html" } },
                    condition: { urlFilter: "*://radiko.jp/area*" }
                },
                {
                    id: RULEID.AUTH1,
                    action: {
                        type: "modifyHeaders",
                        requestHeaders: [
                            // Remove
                            {
                                header: "Accept-Language",
                                operation: "remove"
                            },
                            {
                                header: "Accept",
                                operation: "remove"
                            },
                            {
                                header: "Cookie",
                                operation: "remove"
                            },
                            {
                                header: "Referer",
                                operation: "remove"
                            },
                            // Set
                            {
                                header: "X-Radiko-User",
                                operation: "set",
                                value: info.userid
                            },
                            {
                                header: "X-Radiko-App-Version",
                                operation: "set",
                                value: info.appversion
                            },
                            {
                                header: "X-Radiko-App",
                                operation: "set",
                                value: APP_VERSION_MAP[info.appversion]
                            },
                            {
                                header: "X-Radiko-Device",
                                operation: "set",
                                value: info.device
                            },
                            {
                                header: "User-Agent",
                                operation: "set",
                                value: info.useragent
                            }
                        ],
                        responseHeaders: [
                            {
                                // to avoid too big offset causing radiko's js error
                                // Will this affect the calculation in onHeadersReceived? -> no
                                // Note: yes on Firefox , so we don't use area rules in firefox.
                                header: "x-radiko-keyoffset",
                                operation: "set",
                                value: "0"
                            }
                        ]
                    },
                    condition: {
                        // Exclude the req from extension
                        excludedInitiatorDomains: [chrome.runtime.id],
                        urlFilter: "*://radiko.jp/v2/api/auth1*"
                    }
                },
                {
                    id: RULEID.AUTH2,
                    action: { type: "redirect", redirect: { extensionPath: "/response/auth2-" + area_id + ".html" } },
                    condition: {
                        // Exclude the req from extension
                        excludedInitiatorDomains: [chrome.runtime.id],
                        urlFilter: "*://radiko.jp/v2/api/auth2*"
                    }
                },
                {
                    id: RULEID.AUTH_FETCH,
                    action: {
                        type: "modifyHeaders",
                        requestHeaders: [
                            // Remove
                            {
                                header: "Accept-Language",
                                operation: "remove"
                            },
                            {
                                header: "Accept",
                                operation: "remove"
                            },
                            {
                                header: "User-Agent",
                                operation: "set",
                                value: info.useragent
                            }
                        ]
                    },
                    condition: {
                        // Only for extension's Fetch to remove unnecessary headers.
                        initiatorDomains: [chrome.runtime.id],
                        urlFilter: "*://radiko.jp/v2/api/auth*"
                    }
                }],
            removeRuleIds: [RULEID.APPAREA, RULEID.AREA, RULEID.AUTH1, RULEID.AUTH2, RULEID.AUTH_FETCH]
        }
    )
}

