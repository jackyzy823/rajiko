import { RULEID, APP_VERSION_MAP, APP_KEY_MAP, JAPAN_IPS } from "./static.js";
import { genRandomInfo, genGPS, genRandomIp } from "./util.js"

// TODO(mv3): use session rules which is not persitence (thus good for reducing problems)
// TODO update rules per tab ? but how to delete?
// or update rules per region  and only apply to some tabs?
function updateAreaRules(area_id, info) {
  // TODO(mv3): should we clear dynamic rules every startup?
  // since dynamic is persistent.
  chrome.declarativeNetRequest.updateSessionRules(
    {
      addRules: [
        {
          // Use prepared response from `response` folder for RULEID.AREA and RULEID.AUTH2.
          // I'm not sure why it works now.
          // As i can recall, previously 307 Internal Redirect is not a success code for `/area` API preflight.
          id: RULEID.AREA,
          action: { type: "redirect", redirect: { extensionPath: "/response/area-" + area_id + ".html" } },
          condition: { urlFilter: "*://*.radiko.jp/apparea/area*" }
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
                // to avoid too big offset cause radiko's js error
                // Will this affect the calculation in onHeadersReceived? -> no
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
          id: RULEID.AUTH2_FETCH,
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
            urlFilter: "*://radiko.jp/v2/api/auth2*"
          }
        }],
      removeRuleIds: [RULEID.AREA, RULEID.AUTH1, RULEID.AUTH2, RULEID.AUTH2_FETCH]
    }
  )
}

async function setUpBonus(enabled) {
  if (enabled === true) {
    let required = {
      origins: [
        "*://*.nhk.jp/*",
        "*://*.nhk.or.jp/*",
        "*://*.tver.jp/*",
        "*://edge.api.brightcove.com/*"
      ]
    }
    let matched = await chrome.permissions.contains(required);
    if (!matched) {
      // reset to disabled
      await chrome.storage.local.set({ "bonus_feature": false });
      return;
    }
    // TODO make tver/nhk radio depends on user's choice.
    // TODO make host permission of  tver/nhk radio optional.
    let japan_ip = genRandomIp(JAPAN_IPS);
    console.log("using japan ip ", japan_ip);
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
            // Exclude the req from extension
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
            // Exclude the req from extension
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
            // Exclude the req from extension
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
    chrome.runtime.getPlatformInfo(async info => {
      if (info.os == "linux") {
        let result = await chrome.scripting.getRegisteredContentScripts({ ids: ["linux_ua"] });
        if (result && result.length > 0) {
          // Already registered
          return;
        }

        chrome.scripting.registerContentScripts([
          {
            id: "linux_ua",
            js: ["ui/linux_ua_inspect.js"],
            matches: ["https://*.tver.jp/*"],
            // Keypoint 1: run before `getEnvType` in Tver.
            runAt: "document_start",
            // Keypoint 2: don't isolate.
            world: "MAIN"
          }
        ]);
      }
    });

  } else {
    // Should check if exists?
    chrome.declarativeNetRequest.updateSessionRules({
      removeRuleIds: [RULEID.NHK_RADIO_LIVE, RULEID.NHK_RADIO_VOD, RULEID.TVER]
    });
    chrome.runtime.getPlatformInfo(async info => {
      if (info.os == "linux") {
        let result = await chrome.scripting.getRegisteredContentScripts({ ids: ["linux_ua"] });
        if (result && result.length > 0) {
          // Already registered
          await chrome.scripting.unregisterContentScripts({ ids: ["linux_ua"] });
        }
      }
    });
  }
}

// chrome.declarativeNetRequest.onRuleMatchedDebug.addListener(info => console.log(info));


// Register listeners synchronously. so need to store device info in session
chrome.runtime.onMessage.addListener(async function (msg, sender, respCallback) {
  if (msg["update-area"]) {
    let area_id = msg["update-area"];

    await chrome.storage.local.set({ selected_areaid: area_id });
    console.log("Update area to", area_id);

    let { device_info: info } = await chrome.storage.session.get("device_info");
    if (!info) {
      console.warn("this shouldn't happen");
      info = genRandomInfo();
    }

    updateAreaRules(area_id, info);
  } else if (msg["share-redirect"]) {
    let param = msg["share-redirect"];
    chrome.tabs.update(sender.tab.id, { "url": "https://radiko.jp/#!/ts/" + param.station + "/" + param.t });
  } else if (msg["update-bonus"]) {
    await setUpBonus(msg["update-bonus"] == "yes");
  }
});

// Register listeners synchronously. so need to store device info in session
chrome.webRequest.onHeadersReceived.addListener(
  async resp => {
    let ifInit = resp.initiator && resp.initiator.toLowerCase().indexOf("chrome-extension://" + chrome.runtime.id) != -1;  //initiator since chrome 63
    let ifTabId = resp.tabId && resp.tabId == -1; //mean this resp is not from tab
    if (ifInit || ifTabId) {
      return;
    }

    let token = "";
    let offset = 0;
    let length = 0;
    let set = 0;

    for (let i = 0; i < resp.responseHeaders.length; i++) {
      if (resp.responseHeaders[i].name.toLowerCase() == "x-radiko-keyoffset") {
        offset = parseInt(resp.responseHeaders[i].value);
        set ^= 1;
      }
      if (resp.responseHeaders[i].name.toLowerCase() == "x-radiko-keylength") {
        length = parseInt(resp.responseHeaders[i].value);
        set ^= 1 << 1;
      }
      if (resp.responseHeaders[i].name.toLowerCase() == "x-radiko-authtoken") {
        token = resp.responseHeaders[i].value;
        set ^= 1 << 2;
      }
    }

    if (set != 0b111) {
      console.error("no enough info from auth2 response.");
      return;
    }

    console.log("onHeadersReceived of auth1: token ", token, " offset ", offset, " length ", length);
    let { device_info: info } = await chrome.storage.session.get("device_info");
    if (!info) {
      // This should not happen and is not recoverable
      // If generate again, X-Radiko-App may not be same in auth1 and auth2 then auth will fail.
      // TODO If all aSmartPhone8 then ok to regenerate info?
      console.error("no device_info in session storage");
      return
    }

    let { selected_areaid: area_id } = await chrome.storage.local.get("selected_areaid");
    if (!area_id) {
      // This should not happen and is not recoverable
      console.error("no area_id in local storage");
      return
    }


    let partial = btoa(atob(APP_KEY_MAP[APP_VERSION_MAP[info.appversion]]).slice(offset, offset + length));
    let resp2 = await fetch('https://radiko.jp/v2/api/auth2', {
      headers: {
        'X-Radiko-App': APP_VERSION_MAP[info.appversion],
        'X-Radiko-App-Version': info.appversion,
        'X-Radiko-Device': info.device,
        'X-Radiko-User': info.userid,
        'X-Radiko-AuthToken': token,
        'X-Radiko-Partialkey': partial,
        'X-Radiko-Location': genGPS(area_id),
        'X-Radiko-Connection': "wifi",
        // modifying UA does not work here. so we use session rules RULEID.AUTH2_FETCH.
        'User-Agent': info.useragent
      },
      credentials: "omit"
    })
  },
  {
    urls: ["*://*.radiko.jp/v2/api/auth1*"]
  }, ["responseHeaders"]
);


async function initialize() {
  let {
    selected_areaid: area_id,
    bonus_feature: bonus
  } = await chrome.storage.local.get(["selected_areaid", "bonus_feature"]);
  //if not selected_areaid use default value:JP13
  if (!area_id) {
    area_id = "JP13";
    await chrome.storage.local.set({ "selected_areaid": area_id });
  }
  // since service worker will not persist
  let { device_info: info } = await chrome.storage.session.get("device_info");
  if (!info) {
    info = genRandomInfo();
    await chrome.storage.session.set({ "device_info": info });
  }
  console.log("Using ", info, " for ", area_id);

  updateAreaRules(area_id, info);
  await chrome.storage.session.set({ "device_info": info });

  //clean previous unfinshed recording or downloading content if exists.
  // TODO(mv3): add back recording/downloading
  // chrome.storage.local.clear().then(chrome.storage.local.set({ "selected_areaid": area_id }));

  // TODO(mv3): add back recording/downloading
  // chrome.action.setBadgeText && chrome.action.setBadgeText({ text: "" }); //clean badgetext when crash
  await setUpBonus(bonus);
}

chrome.runtime.onInstalled.addListener(async () => {
  await initialize();
})
//main stuff do only once on profile started
chrome.runtime.onStartup.addListener(async () => {
  await initialize();
});
